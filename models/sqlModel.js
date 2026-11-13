const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { getDbState, getSequelizeModels } = require('../config/db');

const STORAGE_FILE = path.join(__dirname, '..', 'database', 'mysql_tables.json');

// In-memory cache of SQL tables synced with database/mysql_tables.json
let tableStore = null;

function loadTableStore() {
  if (tableStore) return tableStore;
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      tableStore = JSON.parse(raw);
      return tableStore;
    }
  } catch (e) {
    // ignore corrupt file
  }
  tableStore = {};
  return tableStore;
}

function saveTableStore() {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(tableStore, null, 2), 'utf-8');
  } catch (e) {
    // ignore write error in read-only environments
  }
}

function getTableRows(tableName) {
  const store = loadTableStore();
  if (!Array.isArray(store[tableName])) {
    store[tableName] = [];
  }
  return store[tableName];
}

function attachSubdocHelpers(val) {
  if (Array.isArray(val)) {
    val.forEach(item => attachSubdocHelpers(item));
  } else if (val && typeof val === 'object' && !(val instanceof Date)) {
    if (typeof val.toObject !== 'function') {
      Object.defineProperty(val, 'toObject', {
        value: function () {
          return { ...this };
        },
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
    for (const k of Object.keys(val)) {
      attachSubdocHelpers(val[k]);
    }
  }
  return val;
}

function matchesCondition(rowVal, condVal) {
  if (condVal instanceof RegExp) {
    return condVal.test(String(rowVal || ''));
  }
  if (condVal && typeof condVal === 'object' && !Array.isArray(condVal) && !(condVal instanceof Date)) {
    if ('$regex' in condVal) {
      const flags = condVal.$options || '';
      const regex = condVal.$regex instanceof RegExp
        ? condVal.$regex
        : new RegExp(String(condVal.$regex), flags);
      return regex.test(String(rowVal || ''));
    }
  }
  if (rowVal !== undefined && condVal !== undefined && String(rowVal) === String(condVal)) {
    return true;
  }
  return rowVal === condVal;
}

function matchesFilter(row, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const key of Object.keys(filter)) {
    if (key === '$or' && Array.isArray(filter.$or)) {
      const anyMatch = filter.$or.some(subFilter => matchesFilter(row, subFilter));
      if (!anyMatch) return false;
      continue;
    }
    const targetVal = key === '_id' ? (row._id !== undefined ? row._id : row.id) : row[key];
    if (!matchesCondition(targetVal, filter[key])) {
      return false;
    }
  }
  return true;
}

function sortRows(rows, sortSpec) {
  if (!sortSpec) return rows;
  let specs = [];
  if (typeof sortSpec === 'string') {
    const parts = sortSpec.trim().split(/\s+/);
    specs = parts.map(p => {
      if (p.startsWith('-')) return [p.slice(1), -1];
      return [p, 1];
    });
  } else if (typeof sortSpec === 'object') {
    specs = Object.entries(sortSpec).map(([k, v]) => [k, v === -1 || v === 'desc' ? -1 : 1]);
  }
  return [...rows].sort((a, b) => {
    for (const [field, dir] of specs) {
      const va = a[field];
      const vb = b[field];
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
    }
    return 0;
  });
}

/**
 * Query Builder supporting Mongoose-like chaining (.sort, .limit, .select, .exec)
 * while executing against MySQL (Sequelize) or MySQL Local Table Store
 */
class SQLQuery {
  constructor(executor, isSingle = false) {
    this._executor = executor;
    this._isSingle = isSingle;
    this._sortSpec = null;
    this._limitCount = null;
    this._selectSpec = null;
  }

  sort(spec) {
    this._sortSpec = spec;
    return this;
  }

  limit(n) {
    this._limitCount = parseInt(n, 10);
    return this;
  }

  select(spec) {
    this._selectSpec = spec;
    return this;
  }

  async exec() {
    let result = await this._executor({
      sortSpec: this._sortSpec,
      limitCount: this._limitCount,
      selectSpec: this._selectSpec
    });

    if (this._selectSpec && typeof this._selectSpec === 'string') {
      const excluded = this._selectSpec
        .split(/\s+/)
        .filter(f => f.startsWith('-'))
        .map(f => f.slice(1));

      const applySelect = (inst) => {
        if (!inst) return inst;
        excluded.forEach(field => {
          delete inst[field];
        });
        return inst;
      };

      if (Array.isArray(result)) {
        result = result.map(applySelect);
      } else if (result) {
        result = applySelect(result);
      }
    }

    return result;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

/**
 * Create a MySQL-backed Model with full schema validation & query interface
 */
function createSQLModel(modelName, tableName, schemaDefinition) {
  class SQLModelInstance {
    constructor(data = {}) {
      // Apply defaults and transformations
      for (const [field, rules] of Object.entries(schemaDefinition)) {
        let val = data[field];
        if (val === undefined) {
          if (rules.default !== undefined) {
            val = typeof rules.default === 'function' ? rules.default() : JSON.parse(JSON.stringify(rules.default));
          }
        } else if (typeof val === 'string') {
          if (rules.trim) val = val.trim();
          if (rules.lowercase) val = val.toLowerCase();
        }
        if (val !== undefined) {
          this[field] = attachSubdocHelpers(val);
        }
      }

      // Copy any extra fields passed in data
      for (const [k, v] of Object.entries(data)) {
        if (this[k] === undefined) {
          this[k] = attachSubdocHelpers(v);
        }
      }

      // Synchronize id and _id
      if (this.id !== undefined && this._id === undefined) {
        this._id = this.id;
      } else if (this._id !== undefined && this.id === undefined) {
        this.id = this._id;
      }
    }

    async validate() {
      const errors = {};
      for (const [field, rules] of Object.entries(schemaDefinition)) {
        const val = this[field];
        if (rules.required) {
          const isEmpty =
            val === undefined ||
            val === null ||
            val === '' ||
            (Array.isArray(val) && rules.nonEmptyArray && val.length === 0);
          if (isEmpty) {
            errors[field] = { message: `Trường ${field} là bắt buộc` };
            continue;
          }
        }
        if (val !== undefined && val !== null && rules.enum && Array.isArray(rules.enum)) {
          if (!rules.enum.includes(val)) {
            errors[field] = { message: `Giá trị ${val} không hợp lệ cho trường ${field}` };
          }
        }
        // Validate nested array required fields if specified
        if (Array.isArray(val) && rules.itemRequired) {
          for (const item of val) {
            for (const reqKey of rules.itemRequired) {
              if (!item || item[reqKey] === undefined || item[reqKey] === null || item[reqKey] === '') {
                errors[field] = { message: `Phần tử trong ${field} thiếu ${reqKey}` };
              }
            }
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        const err = new Error(`${modelName} validation failed`);
        err.name = 'ValidationError';
        err.errors = errors;
        throw err;
      }
      return undefined;
    }

    async save() {
      await this.validate();
      const now = new Date();
      if (!this.createdAt) this.createdAt = now;
      this.updatedAt = now;

      const rows = getTableRows(tableName);
      if (this.id === undefined && this._id === undefined) {
        const maxId = rows.reduce((max, r) => {
          const num = typeof r.id === 'number' ? r.id : 0;
          return num > max ? num : max;
        }, 0);
        this.id = maxId + 1;
        this._id = this.id;
      } else if (this.id !== undefined && this._id === undefined) {
        this._id = this.id;
      } else if (this._id !== undefined && this.id === undefined) {
        this.id = this._id;
      }

      // Sync with live MySQL Sequelize if connected in mysql mode
      const state = getDbState();
      const seqModels = getSequelizeModels();
      if (state.mode === 'mysql' && seqModels[modelName]) {
        try {
          const plain = this.toObject();
          await seqModels[modelName].upsert(plain);
        } catch (e) {
          // Continue with local table sync
        }
      }

      const existingIdx = rows.findIndex(
        r => String(r.id) === String(this.id) || (r._id && String(r._id) === String(this._id))
      );
      const serialized = JSON.parse(JSON.stringify(this.toObject()));
      if (existingIdx >= 0) {
        rows[existingIdx] = serialized;
      } else {
        rows.push(serialized);
      }
      saveTableStore();
      attachSubdocHelpers(this);
      return this;
    }

    toObject() {
      const obj = {};
      for (const key of Object.keys(this)) {
        obj[key] = this[key];
      }
      if (obj.id !== undefined && obj._id === undefined) obj._id = obj.id;
      if (obj._id !== undefined && obj.id === undefined) obj.id = obj._id;
      return obj;
    }

    toJSON() {
      return this.toObject();
    }

    // Static methods on Model
    static _hydrate(row) {
      if (!row) return null;
      const plain = typeof row.toJSON === 'function' ? row.toJSON() : { ...row };
      return new SQLModelInstance(plain);
    }

    static async _fetchAllFromSource() {
      const state = getDbState();
      const seqModels = getSequelizeModels();
      if (state.mode === 'mysql' && seqModels[modelName]) {
        try {
          const seqRows = await seqModels[modelName].findAll();
          const plainRows = seqRows.map(r => r.toJSON());
          const store = loadTableStore();
          store[tableName] = plainRows.map(r => ({ ...r, _id: r.id }));
          return store[tableName];
        } catch (e) {
          // Fallback to tableStore
        }
      }
      return getTableRows(tableName);
    }

    static find(filter = {}) {
      return new SQLQuery(async ({ sortSpec, limitCount }) => {
        const allRows = await this._fetchAllFromSource();
        let matched = allRows.filter(r => matchesFilter(r, filter));
        if (sortSpec) {
          matched = sortRows(matched, sortSpec);
        }
        if (limitCount && limitCount > 0) {
          matched = matched.slice(0, limitCount);
        }
        return matched.map(r => this._hydrate(r));
      }, false);
    }

    static findOne(filter = {}) {
      return new SQLQuery(async ({ sortSpec }) => {
        const allRows = await this._fetchAllFromSource();
        let matched = allRows.filter(r => matchesFilter(r, filter));
        if (sortSpec) {
          matched = sortRows(matched, sortSpec);
        }
        return matched.length > 0 ? this._hydrate(matched[0]) : null;
      }, true);
    }

    static findById(id) {
      return new SQLQuery(async () => {
        const allRows = await this._fetchAllFromSource();
        const found = allRows.find(
          r => String(r.id) === String(id) || String(r._id) === String(id)
        );
        return found ? this._hydrate(found) : null;
      }, true);
    }

    static async create(doc) {
      const inst = new SQLModelInstance(doc);
      return await inst.save();
    }

    static async insertMany(docs = []) {
      const created = [];
      for (const d of docs) {
        const inst = new SQLModelInstance(d);
        await inst.save();
        created.push(inst);
      }
      return created;
    }

    static findOneAndUpdate(filter, update = {}, options = {}) {
      return new SQLQuery(async () => {
        const allRows = await this._fetchAllFromSource();
        const idx = allRows.findIndex(r => matchesFilter(r, filter));
        if (idx === -1) return null;

        const target = { ...allRows[idx] };
        if (update.$inc) {
          for (const [k, delta] of Object.entries(update.$inc)) {
            target[k] = (Number(target[k]) || 0) + Number(delta);
          }
        }
        if (update.$set) {
          Object.assign(target, update.$set);
        }
        for (const [k, v] of Object.entries(update)) {
          if (!k.startsWith('$')) {
            target[k] = v;
          }
        }

        const inst = new SQLModelInstance(target);
        await inst.save();
        return inst;
      }, true);
    }

    static findByIdAndUpdate(id, update = {}, options = {}) {
      return this.findOneAndUpdate({ _id: id }, update, options);
    }

    static async findOneAndDelete(filter = {}) {
      const allRows = await this._fetchAllFromSource();
      const idx = allRows.findIndex(r => matchesFilter(r, filter));
      if (idx === -1) return null;

      const [removed] = allRows.splice(idx, 1);
      const state = getDbState();
      const seqModels = getSequelizeModels();
      if (state.mode === 'mysql' && seqModels[modelName] && removed.id !== undefined) {
        try {
          await seqModels[modelName].destroy({ where: { id: removed.id } });
        } catch (e) {}
      }
      saveTableStore();
      return this._hydrate(removed);
    }

    static async findByIdAndDelete(id) {
      return await this.findOneAndDelete({ _id: id });
    }

    static async deleteMany(filter = {}) {
      const allRows = await this._fetchAllFromSource();
      const before = allRows.length;
      const remaining = allRows.filter(r => !matchesFilter(r, filter));
      const deletedCount = before - remaining.length;

      const store = loadTableStore();
      store[tableName] = remaining;

      const state = getDbState();
      const seqModels = getSequelizeModels();
      if (state.mode === 'mysql' && seqModels[modelName] && Object.keys(filter).length === 0) {
        try {
          await seqModels[modelName].destroy({ where: {}, truncate: true });
        } catch (e) {}
      }
      saveTableStore();
      return { deletedCount };
    }

    static async countDocuments(filter = {}) {
      const allRows = await this._fetchAllFromSource();
      if (!filter || Object.keys(filter).length === 0) {
        return allRows.length;
      }
      return allRows.filter(r => matchesFilter(r, filter)).length;
    }

    static async aggregate(pipeline = []) {
      const allRows = await this._fetchAllFromSource();
      for (const stage of pipeline) {
        if (stage.$group && stage.$group._id) {
          const groupField = String(stage.$group._id).replace(/^\$/, '');
          const counts = {};
          for (const r of allRows) {
            const key = r[groupField] || 'unknown';
            counts[key] = (counts[key] || 0) + 1;
          }
          return Object.entries(counts).map(([_id, count]) => ({ _id, count }));
        }
      }
      return allRows;
    }
  }

  Object.defineProperty(SQLModelInstance, 'modelName', { value: modelName });
  Object.defineProperty(SQLModelInstance, 'tableName', { value: tableName });

  return SQLModelInstance;
}

module.exports = {
  createSQLModel
};
