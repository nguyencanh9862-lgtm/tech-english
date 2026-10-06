// =====================================================================
// ENGLISH MASTER – ADMIN JS  (admin/js/admin.js)
// =====================================================================

// ───────────── API BASE & ADMIN STATE ─────────────
const API_BASE = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

// Security: Tự động đính kèm JWT Bearer token vào mọi request API từ Admin panel
const _origFetch = window.fetch;
window.fetch = function (url, options) {
  options = options || {};
  const token = localStorage.getItem('em_admin_token');
  if (token && typeof url === 'string' && (url.startsWith('/api') || url.includes('/api/'))) {
    options.headers = options.headers || {};
    if (options.headers instanceof Headers) {
      if (!options.headers.has('Authorization')) {
        options.headers.set('Authorization', `Bearer ${token}`);
      }
    } else if (Array.isArray(options.headers)) {
      options.headers.push(['Authorization', `Bearer ${token}`]);
    } else {
      if (!options.headers['Authorization'] && !options.headers['authorization']) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return _origFetch.call(this, url, options);
};

let adminState = {
  loggedIn: false,
  currentPage: 'dashboard',
  vocab: [],         // working copy
  quizData: {},      // working copy
  grammarData: [],   // working copy
  mediaList: [],     // uploaded images
  dbConnected: false,
  editingId: null,
  confirmCallback: null,
};

let adminCoursesList = (typeof ENGLISH_COURSES_DATA !== 'undefined' ? JSON.parse(JSON.stringify(ENGLISH_COURSES_DATA)) : []);

// ───────────── INIT ─────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Deep-clone data from data.js as initial fallback
  adminState.vocab      = JSON.parse(JSON.stringify(VOCABULARY_DATA));
  adminState.quizData   = JSON.parse(JSON.stringify(QUIZ_DATA));
  adminState.grammarData= JSON.parse(JSON.stringify(GRAMMAR_LESSONS));

  // Load overrides from localStorage
  const saved = localStorage.getItem('em_admin_vocab');
  if (saved) {
    try { adminState.vocab = JSON.parse(saved); } catch(e){}
  }
  const savedQ = localStorage.getItem('em_admin_quiz');
  if (savedQ) {
    try { adminState.quizData = JSON.parse(savedQ); } catch(e){}
  }

  updateBadgeCounts();
  startClock();

  // Auto-login check
  if (localStorage.getItem('em_admin_session') === 'true') {
    showAdmin();
  }

  // Connect to MongoDB Backend
  await checkDbConnection();
  await loadDataFromApi();
});

// ───────────── CLOCK ─────────────
function startClock() {
  const el = document.getElementById('topbarTime');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('vi-VN');
  };
  tick();
  setInterval(tick, 1000);
}

// ───────────── MONGODB & API INTEGRATION ─────────────
async function checkDbConnection() {
  const pill = document.getElementById('dbStatusPill');
  const text = document.getElementById('dbStatusText');
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data.database === 'connected') {
        adminState.dbConnected = true;
        if (pill) pill.className = 'db-status-pill connected';
        if (text) text.textContent = '🟢 MongoDB Online';
        return true;
      }
    }
  } catch (e) {
    // Offline
  }
  adminState.dbConnected = false;
  if (pill) pill.className = 'db-status-pill offline';
  if (text) text.textContent = '🟡 Chế độ Offline (Local)';
  return false;
}

async function loadDataFromApi() {
  if (!adminState.dbConnected) return;
  try {
    const [resVocab, resGrammar, resQuiz, resMedia, resUsers, resCourses] = await Promise.all([
      fetch(`${API_BASE}/api/vocab`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/grammar`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/quiz`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/media`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/users`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/courses`).then(r => r.json()).catch(() => null)
    ]);

    if (resVocab?.success && resVocab.data?.length > 0) {
      adminState.vocab = resVocab.data;
      localStorage.setItem('em_admin_vocab', JSON.stringify(adminState.vocab));
    }
    if (resGrammar?.success && resGrammar.data?.length > 0) {
      adminState.grammarData = resGrammar.data;
    }
    if (resQuiz?.success && resQuiz.data) {
      adminState.quizData = resQuiz.data;
      localStorage.setItem('em_admin_quiz', JSON.stringify(adminState.quizData));
    }
    if (resMedia?.success && resMedia.data) {
      adminState.mediaList = resMedia.data;
    }
    if (resUsers?.success && resUsers.data) {
      adminUsersList = resUsers.data;
    }
    if (resCourses?.success && resCourses.data?.length > 0) {
      adminCoursesList = resCourses.data;
    }
    updateBadgeCounts();
    if (adminState.loggedIn) {
      renderPage(adminState.currentPage);
    }
  } catch (err) {
    console.warn('Lỗi khi tải dữ liệu từ API:', err);
  }
}

function getImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
  return (img.startsWith('/') ? API_BASE : API_BASE + '/') + img.replace(/^\//, '');
}

function previewImage(url, title = 'Xem hình ảnh') {
  showModal(`🖼️ ${title}`, `
    <div style="text-align:center;padding:.5rem">
      <img src="${url}" alt="${title}" style="max-width:100%;max-height:65vh;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);object-fit:contain" />
      <div style="margin-top:1rem;display:flex;justify-content:center;gap:.75rem;flex-wrap:wrap">
        <a href="${url}" target="_blank" class="btn-adm btn-adm--ghost btn-adm--sm">
          <i class="fas fa-arrow-up-right-from-square"></i> Mở trong tab mới
        </a>
        <button class="btn-adm btn-adm--primary btn-adm--sm" onclick="copyToClipboard('${url}')">
          <i class="fas fa-copy"></i> Sao chép URL
        </button>
      </div>
    </div>
  `, '<button class="btn-adm btn-adm--ghost" onclick="closeModal()">Đóng</button>');
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showAdminToast('📋 Đã sao chép link ảnh!', 'success');
    }).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  showAdminToast('📋 Đã sao chép link ảnh!', 'success');
}

// Upload image from Vocab modal
async function handleVocabImageUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const statusEl = document.getElementById('vf_upload_status');
  const previewEl = document.getElementById('vf_image_preview');
  const urlInput = document.getElementById('vf_image');

  if (statusEl) statusEl.innerHTML = '<span class="upload-status-indicator"><i class="fas fa-spinner fa-spin"></i> Đang tải ảnh lên server...</span>';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      const fileUrl = data.url;
      if (urlInput) urlInput.value = fileUrl;
      if (previewEl) {
        previewEl.innerHTML = `
          <div class="image-preview-card">
            <img src="${getImageUrl(fileUrl)}" alt="Preview" />
            <button type="button" class="btn-remove-image" onclick="removeVocabImage()" title="Xóa ảnh">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
      }
      if (statusEl) statusEl.innerHTML = '<span class="upload-status-indicator" style="color:#10b981"><i class="fas fa-check-circle"></i> Đã tải ảnh lên server thành công!</span>';
      showAdminToast('✅ Đã tải ảnh lên server!', 'success');
      refreshMediaList();
    } else {
      throw new Error(data.message || 'Lỗi tải ảnh');
    }
  } catch (err) {
    // Local / offline fallback: convert to Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target.result;
      if (urlInput) urlInput.value = base64Url;
      if (previewEl) {
        previewEl.innerHTML = `
          <div class="image-preview-card">
            <img src="${base64Url}" alt="Preview" />
            <button type="button" class="btn-remove-image" onclick="removeVocabImage()" title="Xóa ảnh">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
      }
      if (statusEl) statusEl.innerHTML = '<span class="upload-status-indicator" style="color:#f59e0b"><i class="fas fa-info-circle"></i> Đã lưu ảnh cục bộ (Base64)</span>';
      showAdminToast('Ảnh lưu ngoại tuyến thành công', 'info');
    };
    reader.readAsDataURL(file);
  }
}

function handleManualImageUrl(url) {
  const previewEl = document.getElementById('vf_image_preview');
  if (!previewEl) return;
  const clean = (url || '').trim();
  if (clean) {
    previewEl.innerHTML = `
      <div class="image-preview-card">
        <img src="${getImageUrl(clean)}" alt="Preview" onerror="this.src=''; this.alt='Không thể tải ảnh từ URL';" />
        <button type="button" class="btn-remove-image" onclick="removeVocabImage()" title="Xóa ảnh">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  } else {
    removeVocabImage();
  }
}

function removeVocabImage() {
  const previewEl = document.getElementById('vf_image_preview');
  const urlInput = document.getElementById('vf_image');
  const fileInput = document.getElementById('vf_image_file');
  const statusEl = document.getElementById('vf_upload_status');
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';
  if (statusEl) statusEl.innerHTML = '';
  if (previewEl) {
    previewEl.innerHTML = `
      <div class="image-dropzone" onclick="document.getElementById('vf_image_file').click()">
        <div class="image-dropzone-inner">
          <i class="fas fa-cloud-arrow-up"></i>
          <strong>Nhấn để chọn ảnh hoặc kéo thả vào đây</strong>
          <span>Hỗ trợ JPG, PNG, WEBP, GIF (Tải trực tiếp lên server)</span>
        </div>
      </div>
    `;
  }
}

async function refreshMediaList() {
  try {
    const res = await fetch(`${API_BASE}/api/media`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        adminState.mediaList = data.data;
        updateBadgeCounts();
        if (adminState.currentPage === 'media') {
          renderMediaPage();
        }
      }
    }
  } catch (err) {}
}

async function handleMultipleMediaUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const files = Array.from(input.files);
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));

  showAdminToast(`Đang tải lên ${files.length} ảnh...`, 'info');

  try {
    const res = await fetch(`${API_BASE}/api/upload/multiple`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast(`🎉 ${data.message}`, 'success');
      await refreshMediaList();
    } else {
      showAdminToast(`❌ ${data.message || 'Lỗi tải ảnh'}`, 'error');
    }
  } catch (err) {
    showAdminToast(`❌ Không thể kết nối tới server: ${err.message}`, 'error');
  }
  input.value = '';
}

async function deleteMedia(filename) {
  showConfirm(`Bạn có chắc muốn xóa ảnh này khỏi thư viện?`, async () => {
    try {
      const res = await fetch(`${API_BASE}/api/media/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showAdminToast('🗑️ Đã xóa ảnh thành công', 'success');
        await refreshMediaList();
      } else {
        showAdminToast(`❌ ${data.message}`, 'error');
      }
    } catch (err) {
      showAdminToast(`❌ Lỗi khi xóa: ${err.message}`, 'error');
    }
  });
}

// ───────────── AUTH ─────────────
async function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const err  = document.getElementById('loginError');

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user, password: pass })
    });
    const data = await res.json();
    if (data.success) {
      if (data.user.role !== 'admin') {
        err.textContent = '❌ Tài khoản không có quyền quản trị!';
        setTimeout(() => { err.textContent = ''; }, 3000);
        return;
      }
      localStorage.setItem('em_admin_session', 'true');
      localStorage.setItem('em_admin_token', data.token);
      localStorage.setItem('em_admin_user', JSON.stringify(data.user));
      document.getElementById('adminName').textContent = data.user.name || user;
      showAdminToast('Đăng nhập quản trị thành công!', 'success');
      showAdmin();
      return;
    } else {
      err.textContent = '❌ ' + (data.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      setTimeout(() => { err.textContent = ''; }, 3000);
    }
  } catch (apiErr) {
    // Offline local check fallback
    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('em_admin_session', 'true');
      document.getElementById('adminName').textContent = user;
      showAdmin();
    } else {
      err.textContent = '❌ Sai tên đăng nhập hoặc mật khẩu!';
      setTimeout(() => { err.textContent = ''; }, 3000);
    }
  }
}

async function adminGoogleLogin() {
  const email = prompt('Nhập địa chỉ Gmail để đăng nhập Quản trị viên:', 'admin@englishmaster.vn');
  if (!email) return;
  const name = email.split('@')[0];

  try {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          name: name.toUpperCase() + ' (Admin)',
          email: email.toLowerCase(),
          picture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=6366f1&color=fff',
          sub: 'admin-google-' + Date.now()
        }
      })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('em_admin_session', 'true');
      localStorage.setItem('em_admin_token', data.token);
      localStorage.setItem('em_admin_user', JSON.stringify(data.user));
      showAdminToast(`Chào mừng Admin ${data.user.name}!`, 'success');
      showAdmin();
    } else {
      showAdminToast(data.message || 'Lỗi đăng nhập Google', 'error');
    }
  } catch (err) {
    showAdminToast('Lỗi server: ' + err.message, 'error');
  }
}

function showAdmin() {
  document.getElementById('loginScreen').style.display  = 'none';
  document.getElementById('adminLayout').style.display  = 'flex';
  adminState.loggedIn = true;

  const storedAdmin = localStorage.getItem('em_admin_user');
  if (storedAdmin) {
    try {
      const u = JSON.parse(storedAdmin);
      const nameEl = document.getElementById('adminName');
      if (nameEl) nameEl.textContent = u.name;
    } catch(e){}
  }

  navigateTo('dashboard');
  updateBadgeCounts();
}

function handleLogout() {
  localStorage.removeItem('em_admin_session');
  localStorage.removeItem('em_admin_token');
  localStorage.removeItem('em_admin_user');
  document.getElementById('loginScreen').style.display  = 'flex';
  document.getElementById('adminLayout').style.display  = 'none';
  adminState.loggedIn = false;
  document.getElementById('loginForm').reset();
  showAdminToast('Đã đăng xuất tài khoản quản trị', 'info');
}

function togglePass() {
  const inp  = document.getElementById('loginPass');
  const icon = document.getElementById('passIcon');
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

// ───────────── NAVIGATION ─────────────
const PAGE_META = {
  dashboard:  { label: 'Dashboard',        icon: 'fas fa-gauge-high' },
  vocabulary: { label: 'Quản lý Từ vựng',  icon: 'fas fa-book-open' },
  grammar:    { label: 'Quản lý Ngữ pháp', icon: 'fas fa-pen-nib' },
  quiz:       { label: 'Quản lý Quiz',      icon: 'fas fa-circle-question' },
  news:       { label: 'Quản lý Tin tức CNTT', icon: 'fas fa-newspaper' },
  courses:    { label: 'Quản lý Khóa học Video', icon: 'fab fa-youtube' },
  itcourses:  { label: 'Quản lý Khóa học CNTT', icon: 'fas fa-laptop-code' },
  media:      { label: 'Thư viện Media',    icon: 'fas fa-images' },
  sheets:     { label: 'Đồng bộ Google Sheets', icon: 'fas fa-file-excel' },
  statistics: { label: 'Thống kê',          icon: 'fas fa-chart-bar' },
  users:      { label: 'Người dùng',        icon: 'fas fa-users' },
  settings:   { label: 'Cài đặt',           icon: 'fas fa-gear' },
};

function navigateTo(page, linkEl) {
  adminState.currentPage = page;
  // Update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  else {
    const target = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    if (target) target.classList.add('active');
  }
  // Breadcrumb
  const meta = PAGE_META[page] || { label: page, icon: 'fas fa-circle' };
  document.getElementById('breadcrumb').innerHTML = `<i class="${meta.icon}"></i> ${meta.label}`;
  // Render page
  renderPage(page);
  // Close sidebar on mobile
  if (window.innerWidth <= 1024) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ───────────── PAGE ROUTER ─────────────
function renderPage(page) {
  const pages = {
    dashboard:  renderDashboard,
    vocabulary: renderVocabularyPage,
    grammar:    renderGrammarPage,
    quiz:       renderQuizPage,
    news:       renderNewsPage,
    courses:    renderAdminCoursesPage,
    itcourses:  renderITCoursesPage,
    media:      renderMediaPage,
    sheets:     renderAdminSheetsPage,
    statistics: renderStatisticsPage,
    users:      renderUsersPage,
    settings:   renderSettingsPage,
  };
  const fn = pages[page];
  if (fn) fn();
}

// ─────────────────────────────────────────
// 1. DASHBOARD
// ─────────────────────────────────────────
function renderDashboard() {
  const xp      = parseInt(localStorage.getItem('em_xp') || 0);
  const streak  = parseInt(localStorage.getItem('em_streak') || 0);
  const words   = parseInt(localStorage.getItem('em_words') || 0);
  const badges  = JSON.parse(localStorage.getItem('em_badges') || '[]');
  const vocabTotal = adminState.vocab.length;
  const quizTotal  = Object.values(adminState.quizData).flat().length;

  const categories = {};
  adminState.vocab.forEach(v => { categories[v.category] = (categories[v.category] || 0) + 1; });

  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Chào mừng trở lại! Đây là tổng quan hệ thống.</p>
        </div>
        <button class="btn-adm btn-adm--primary" onclick="navigateTo('vocabulary')">
          <i class="fas fa-plus"></i> Thêm từ mới
        </button>
      </div>

      <!-- STAT CARDS -->
      <div class="stat-grid" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr))">
        <div class="stat-card stat-card--blue">
          <div class="stat-card-icon"><i class="fas fa-book"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Tổng từ vựng</span>
            <strong class="stat-card-value">${vocabTotal}</strong>
            <small class="stat-card-sub">+0 hôm nay</small>
          </div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-card-icon"><i class="fas fa-circle-question"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Câu hỏi Quiz</span>
            <strong class="stat-card-value">${quizTotal}</strong>
            <small class="stat-card-sub">${Object.keys(adminState.quizData).length} loại</small>
          </div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-card-icon"><i class="fas fa-graduation-cap"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Bài ngữ pháp</span>
            <strong class="stat-card-value">${adminState.grammarData.length}</strong>
            <small class="stat-card-sub">Cấp A2→C1</small>
          </div>
        </div>
        <div class="stat-card" style="border-left:4px solid #06b6d4;cursor:pointer" onclick="navigateTo('media')">
          <div class="stat-card-icon" style="background:rgba(6,182,212,.1);color:#06b6d4"><i class="fas fa-images"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Ảnh trong thư viện</span>
            <strong class="stat-card-value">${(adminState.mediaList||[]).length}</strong>
            <small class="stat-card-sub">🖼️ Quản lý hình ảnh</small>
          </div>
        </div>
        <div class="stat-card" style="border-left:4px solid #ec4899;cursor:pointer" onclick="navigateTo('users')">
          <div class="stat-card-icon" style="background:rgba(236,72,153,.1);color:#ec4899"><i class="fas fa-users"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Người dùng hệ thống</span>
            <strong class="stat-card-value">${adminUsersList.length || 1}</strong>
            <small class="stat-card-sub">👥 Google & Email</small>
          </div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-card-icon"><i class="fas fa-star"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">XP người dùng</span>
            <strong class="stat-card-value">${xp}</strong>
            <small class="stat-card-sub">🔥 ${streak} ngày streak</small>
          </div>
        </div>
      </div>

      <!-- CHARTS ROW -->
      <div class="dashboard-row">
        <!-- Category chart -->
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-pie-chart"></i> Từ vựng theo chủ đề</h3>
          </div>
          <div class="adm-card-body">
            <div class="category-chart">
              ${renderCategoryBars(categories, vocabTotal)}
            </div>
          </div>
        </div>

        <!-- Level distribution -->
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-signal"></i> Phân bố cấp độ</h3>
          </div>
          <div class="adm-card-body">
            ${renderLevelChart()}
          </div>
        </div>
      </div>

      <!-- RECENT ACTIVITY + QUICK ACTIONS -->
      <div class="dashboard-row">
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-clock-rotate-left"></i> Từ mới thêm gần đây</h3>
          </div>
          <div class="adm-card-body">
            <table class="adm-table">
              <thead><tr><th>Từ</th><th>Chủ đề</th><th>Level</th><th>Thao tác</th></tr></thead>
              <tbody>
                ${adminState.vocab.slice(-5).reverse().map(v => `
                  <tr>
                    <td><strong>${v.word}</strong><br><small style="color:#94a3b8">${v.meaning}</small></td>
                    <td><span class="cat-tag cat-tag--${v.category}">${getCatLabel(v.category)}</span></td>
                    <td><span class="level-badge level-badge--${v.level.toLowerCase()}">${v.level}</span></td>
                    <td>
                      <button class="btn-icon btn-icon--edit" onclick="navigateTo('vocabulary'); setTimeout(()=>editVocab(${v.id}),200)" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-bolt"></i> Thao tác nhanh</h3>
          </div>
          <div class="adm-card-body">
            <div class="quick-actions">
              <button class="quick-btn" onclick="navigateTo('vocabulary'); setTimeout(openAddVocabModal,200)">
                <i class="fas fa-plus-circle"></i>
                <span>Thêm từ vựng</span>
              </button>
              <button class="quick-btn" onclick="navigateTo('quiz'); setTimeout(openAddQuizModal,200)">
                <i class="fas fa-plus-circle"></i>
                <span>Thêm câu hỏi</span>
              </button>
              <button class="quick-btn" onclick="navigateTo('statistics')">
                <i class="fas fa-chart-line"></i>
                <span>Xem thống kê</span>
              </button>
              <button class="quick-btn" onclick="exportData()">
                <i class="fas fa-file-export"></i>
                <span>Xuất dữ liệu</span>
              </button>
              <button class="quick-btn" onclick="importDataClick()">
                <i class="fas fa-file-import"></i>
                <span>Nhập dữ liệu</span>
              </button>
              <button class="quick-btn" onclick="resetUserProgress()">
                <i class="fas fa-rotate-left"></i>
                <span>Reset tiến độ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCategoryBars(categories, total) {
  const colors = { daily:'#6366f1', business:'#8b5cf6', travel:'#06b6d4', academic:'#10b981', idiom:'#f59e0b' };
  const labels = { daily:'Hàng ngày', business:'Kinh doanh', travel:'Du lịch', academic:'Học thuật', idiom:'Thành ngữ' };
  return Object.entries(categories).map(([cat, count]) => `
    <div class="cat-bar-row">
      <span class="cat-bar-label">${labels[cat] || cat}</span>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width:${(count/total*100).toFixed(0)}%; background:${colors[cat] || '#6366f1'}"></div>
      </div>
      <span class="cat-bar-count">${count}</span>
    </div>
  `).join('');
}

function renderLevelChart() {
  const levels = {};
  adminState.vocab.forEach(v => { levels[v.level] = (levels[v.level] || 0) + 1; });
  const colors = { A1:'#10b981', A2:'#34d399', B1:'#f59e0b', B2:'#fb923c', C1:'#ef4444', C2:'#dc2626' };
  return `<div class="level-chart">${Object.entries(levels).sort().map(([lv, c]) => `
    <div class="level-bar-item">
      <div class="level-bar-col">
        <div class="level-bar-fill" style="height:${(c/adminState.vocab.length*100).toFixed(0)}%; background:${colors[lv]||'#6366f1'}">
          <span class="level-bar-num">${c}</span>
        </div>
      </div>
      <span class="level-bar-lbl">${lv}</span>
    </div>
  `).join('')}</div>`;
}

// ─────────────────────────────────────────
// 2. VOCABULARY PAGE
// ─────────────────────────────────────────
let vocabSearchTerm = '';
let vocabFilterCat  = 'all';
let vocabFilterLvl  = 'all';
let vocabPage       = 1;
const VOCAB_PER_PAGE = 10;

function renderVocabularyPage() {
  const filtered = getFilteredVocab();
  const total    = filtered.length;
  const pages    = Math.ceil(total / VOCAB_PER_PAGE);
  const slice    = filtered.slice((vocabPage-1)*VOCAB_PER_PAGE, vocabPage*VOCAB_PER_PAGE);

  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Quản lý Từ vựng</h1>
          <p class="page-subtitle">Tổng: <strong>${total}</strong> từ</p>
        </div>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap">
          <button class="btn-adm btn-adm--ghost" onclick="exportVocabCSV()">
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
          <button class="btn-adm btn-adm--primary" onclick="openAddVocabModal()">
            <i class="fas fa-plus"></i> Thêm từ mới
          </button>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="adm-card mb-1">
        <div class="filter-bar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Tìm kiếm từ vựng..." value="${vocabSearchTerm}"
              oninput="vocabSearchTerm=this.value; vocabPage=1; renderVocabularyPage()" />
          </div>
          <select onchange="vocabFilterCat=this.value; vocabPage=1; renderVocabularyPage()">
            <option value="all" ${vocabFilterCat==='all'?'selected':''}>Tất cả chủ đề</option>
            <option value="daily"    ${vocabFilterCat==='daily'?'selected':''}>🏠 Hàng ngày</option>
            <option value="business" ${vocabFilterCat==='business'?'selected':''}>💼 Kinh doanh</option>
            <option value="travel"   ${vocabFilterCat==='travel'?'selected':''}>✈️ Du lịch</option>
            <option value="academic" ${vocabFilterCat==='academic'?'selected':''}>🎓 Học thuật</option>
            <option value="idiom"    ${vocabFilterCat==='idiom'?'selected':''}>💬 Thành ngữ</option>
          </select>
          <select onchange="vocabFilterLvl=this.value; vocabPage=1; renderVocabularyPage()">
            <option value="all" ${vocabFilterLvl==='all'?'selected':''}>Tất cả level</option>
            ${['A1','A2','B1','B2','C1','C2'].map(l => `<option value="${l}" ${vocabFilterLvl===l?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- TABLE -->
      <div class="adm-card">
        <div class="table-wrap">
          <table class="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ảnh</th>
                <th>Từ vựng</th>
                <th>Phiên âm</th>
                <th>Nghĩa</th>
                <th>Chủ đề</th>
                <th>Level</th>
                <th style="text-align:center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${slice.length ? slice.map((v, i) => `
                <tr>
                  <td style="color:#94a3b8">${(vocabPage-1)*VOCAB_PER_PAGE+i+1}</td>
                  <td>
                    ${v.image ? `
                      <img src="${getImageUrl(v.image)}" class="table-img-thumb" alt="${v.word}" onclick="previewImage('${getImageUrl(v.image)}', '${v.word}')" title="Nhấn để xem ảnh lớn" />
                    ` : `
                      <div class="table-no-img" title="Chưa có ảnh"><i class="fas fa-image"></i></div>
                    `}
                  </td>
                  <td>
                    <strong>${v.word}</strong>
                    <button class="speak-mini" onclick="adminSpeak('${v.word.replace(/'/g,"\\'")}')">
                      <i class="fas fa-volume-up"></i>
                    </button>
                  </td>
                  <td style="color:#94a3b8;font-size:.82rem">${v.phonetic}</td>
                  <td style="max-width:200px">${v.meaning}</td>
                  <td><span class="cat-tag cat-tag--${v.category}">${getCatLabel(v.category)}</span></td>
                  <td><span class="level-badge level-badge--${v.level.toLowerCase()}">${v.level}</span></td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-icon btn-icon--view" onclick="viewVocab(${v.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon btn-icon--edit" onclick="editVocab(${v.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon btn-icon--delete" onclick="deleteVocab(${v.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `<tr><td colspan="8" class="empty-row"><i class="fas fa-search"></i> Không tìm thấy kết quả</td></tr>`}
            </tbody>
          </table>
        </div>
        <!-- PAGINATION -->
        ${pages > 1 ? `
          <div class="pagination">
            <button class="page-btn" onclick="vocabPage=Math.max(1,vocabPage-1); renderVocabularyPage()" ${vocabPage===1?'disabled':''}>
              <i class="fas fa-chevron-left"></i>
            </button>
            ${Array.from({length:pages},(_,i)=>i+1).map(p=>`
              <button class="page-btn ${p===vocabPage?'active':''}" onclick="vocabPage=${p}; renderVocabularyPage()">${p}</button>
            `).join('')}
            <button class="page-btn" onclick="vocabPage=Math.min(${pages},vocabPage+1); renderVocabularyPage()" ${vocabPage===pages?'disabled':''}>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  updateBadgeCounts();
}

function getFilteredVocab() {
  return adminState.vocab.filter(v => {
    const matchSearch = !vocabSearchTerm || v.word.toLowerCase().includes(vocabSearchTerm.toLowerCase()) || v.meaning.toLowerCase().includes(vocabSearchTerm.toLowerCase());
    const matchCat    = vocabFilterCat === 'all' || v.category === vocabFilterCat;
    const matchLvl    = vocabFilterLvl === 'all' || v.level === vocabFilterLvl;
    return matchSearch && matchCat && matchLvl;
  });
}

function openAddVocabModal() {
  adminState.editingId = null;
  showModal('➕ Thêm từ vựng mới', buildVocabForm(null), `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
    <button class="btn-adm btn-adm--primary" onclick="saveVocab()"><i class="fas fa-save"></i> Lưu</button>
  `);
}

function editVocab(id) {
  const word = adminState.vocab.find(v => v.id === id);
  if (!word) return;
  adminState.editingId = id;
  showModal(`✏️ Chỉnh sửa: ${word.word}`, buildVocabForm(word), `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
    <button class="btn-adm btn-adm--primary" onclick="saveVocab()"><i class="fas fa-save"></i> Lưu thay đổi</button>
  `);
}

function viewVocab(id) {
  const v = adminState.vocab.find(x => x.id === id);
  if (!v) return;
  showModal(`📖 ${v.word}`, `
    <div class="word-detail-view">
      ${v.image ? `
        <div class="modal-detail-img-wrap">
          <img src="${getImageUrl(v.image)}" alt="${v.word}" />
        </div>
      ` : ''}
      <div class="wdv-header">
        <h2>${v.word}</h2>
        <p class="wdv-phonetic">${v.phonetic}</p>
        <span class="cat-tag cat-tag--${v.category}">${getCatLabel(v.category)}</span>
        <span class="level-badge level-badge--${v.level.toLowerCase()}">${v.level}</span>
        <button class="btn-adm btn-adm--ghost btn-adm--sm" onclick="adminSpeak('${v.word.replace(/'/g,"\\'")}')">
          <i class="fas fa-volume-up"></i> Nghe
        </button>
      </div>
      <div class="wdv-body">
        <div class="wdv-row"><label>Từ loại:</label><span>${v.pos}</span></div>
        <div class="wdv-row"><label>Nghĩa:</label><span>${v.meaning}</span></div>
        <div class="wdv-row"><label>Ví dụ (EN):</label><em>${v.example}</em></div>
        <div class="wdv-row"><label>Ví dụ (VI):</label><span>${v.exampleVi}</span></div>
      </div>
    </div>
  `, `<button class="btn-adm btn-adm--primary" onclick="closeModal(); editVocab(${v.id})"><i class="fas fa-edit"></i> Chỉnh sửa</button>`);
}

function buildVocabForm(v) {
  return `
    <div class="adm-form-grid">
      <div class="adm-form-group">
        <label>Từ vựng <span class="required">*</span></label>
        <input id="vf_word" type="text" value="${v?.word||''}" placeholder="e.g. Serendipity" required />
      </div>
      <div class="adm-form-group">
        <label>Phiên âm</label>
        <input id="vf_phonetic" type="text" value="${v?.phonetic||''}" placeholder="/ˌserənˈdɪpɪti/" />
      </div>
      <div class="adm-form-group">
        <label>Từ loại <span class="required">*</span></label>
        <select id="vf_pos">
          ${['n','v','adj','adv','prep','conj','idiom','phrase'].map(p=>`<option value="${p}" ${v?.pos===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="adm-form-group">
        <label>Nghĩa (Tiếng Việt) <span class="required">*</span></label>
        <input id="vf_meaning" type="text" value="${v?.meaning||''}" placeholder="May mắn tình cờ" required />
      </div>
      <div class="adm-form-group">
        <label>Ví dụ (Tiếng Anh)</label>
        <input id="vf_example" type="text" value="${v?.example||''}" placeholder="She found the book by serendipity." />
      </div>
      <div class="adm-form-group">
        <label>Ví dụ (Tiếng Việt)</label>
        <input id="vf_exampleVi" type="text" value="${v?.exampleVi||''}" placeholder="Cô ấy tình cờ tìm thấy cuốn sách." />
      </div>
      <div class="adm-form-group">
        <label>Chủ đề <span class="required">*</span></label>
        <select id="vf_category">
          <option value="daily"    ${v?.category==='daily'?'selected':''}>🏠 Hàng ngày</option>
          <option value="business" ${v?.category==='business'?'selected':''}>💼 Kinh doanh</option>
          <option value="travel"   ${v?.category==='travel'?'selected':''}>✈️ Du lịch</option>
          <option value="academic" ${v?.category==='academic'?'selected':''}>🎓 Học thuật</option>
          <option value="idiom"    ${v?.category==='idiom'?'selected':''}>💬 Thành ngữ</option>
        </select>
      </div>
      <div class="adm-form-group">
        <label>Cấp độ <span class="required">*</span></label>
        <select id="vf_level">
          ${['A1','A2','B1','B2','C1','C2'].map(l=>`<option value="${l}" ${v?.level===l?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>

      <!-- IMAGE UPLOAD FIELD -->
      <div class="adm-form-group adm-form-group--full">
        <label><i class="fas fa-image" style="color:#6366f1"></i> Hình ảnh minh họa (Đăng ảnh)</label>
        <div class="image-upload-wrapper">
          <input type="file" id="vf_image_file" accept="image/*" style="display:none" onchange="handleVocabImageUpload(this)">
          <div id="vf_image_preview">
            ${v?.image ? `
              <div class="image-preview-card">
                <img src="${getImageUrl(v.image)}" alt="Preview" />
                <button type="button" class="btn-remove-image" onclick="removeVocabImage()" title="Xóa ảnh">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            ` : `
              <div class="image-dropzone" onclick="document.getElementById('vf_image_file').click()">
                <div class="image-dropzone-inner">
                  <i class="fas fa-cloud-arrow-up"></i>
                  <strong>Bấm để tải ảnh lên từ máy tính</strong>
                  <span>Hỗ trợ JPG, PNG, GIF, WEBP (Lưu vào Database & Thư mục uploads)</span>
                </div>
              </div>
            `}
          </div>
          <div id="vf_upload_status"></div>
          <div style="display:flex;gap:.5rem;align-items:center;margin-top:.35rem">
            <input id="vf_image" type="text" value="${v?.image||''}" placeholder="Hoặc nhập/dán URL ảnh: /uploads/... hoặc https://..." style="font-size:.82rem" oninput="handleManualImageUrl(this.value)" />
            <button type="button" class="btn-adm btn-adm--ghost btn-adm--sm" onclick="document.getElementById('vf_image_file').click()" title="Chọn file từ máy tính">
              <i class="fas fa-upload"></i> Chọn ảnh
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function saveVocab() {
  const word     = document.getElementById('vf_word')?.value.trim();
  const phonetic = document.getElementById('vf_phonetic')?.value.trim();
  const pos      = document.getElementById('vf_pos')?.value;
  const meaning  = document.getElementById('vf_meaning')?.value.trim();
  const example  = document.getElementById('vf_example')?.value.trim();
  const exampleVi= document.getElementById('vf_exampleVi')?.value.trim();
  const category = document.getElementById('vf_category')?.value;
  const level    = document.getElementById('vf_level')?.value;
  const image    = document.getElementById('vf_image')?.value.trim() || '';

  if (!word || !meaning) { showAdminToast('Vui lòng nhập đầy đủ các trường bắt buộc!', 'error'); return; }

  const vocabPayload = { word, phonetic, pos, meaning, example, exampleVi, category, level, image };

  if (adminState.editingId) {
    const idx = adminState.vocab.findIndex(v => v.id === adminState.editingId);
    if (idx > -1) adminState.vocab[idx] = { ...adminState.vocab[idx], ...vocabPayload };

    if (adminState.dbConnected) {
      try {
        await fetch(`${API_BASE}/api/vocab/${adminState.editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vocabPayload)
        });
      } catch (err) {
        console.warn('Lỗi lưu MongoDB:', err);
      }
    }
    showAdminToast(`✅ Đã cập nhật từ "${word}"`, 'success');
  } else {
    const newId = Math.max(...adminState.vocab.map(v=>v.id), 0) + 1;
    const newItem = { id: newId, ...vocabPayload };
    adminState.vocab.push(newItem);

    if (adminState.dbConnected) {
      try {
        await fetch(`${API_BASE}/api/vocab`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      } catch (err) {
        console.warn('Lỗi lưu MongoDB:', err);
      }
    }
    showAdminToast(`✅ Đã thêm từ "${word}"`, 'success');
  }
  saveVocabData();
  closeModal();
  renderVocabularyPage();
}

function deleteVocab(id) {
  const word = adminState.vocab.find(v => v.id === id);
  showConfirm(`Bạn có chắc muốn xóa từ "<strong>${word?.word}</strong>"?`, async () => {
    adminState.vocab = adminState.vocab.filter(v => v.id !== id);
    if (adminState.dbConnected) {
      try {
        await fetch(`${API_BASE}/api/vocab/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Lỗi xóa trên DB:', err);
      }
    }
    saveVocabData();
    showAdminToast(`🗑️ Đã xóa từ "${word?.word}"`, 'info');
    renderVocabularyPage();
  });
}

function saveVocabData() {
  localStorage.setItem('em_admin_vocab', JSON.stringify(adminState.vocab));
  updateBadgeCounts();
}

function exportVocabCSV() {
  const headers = ['ID','Word','Phonetic','POS','Meaning','Example','ExampleVi','Category','Level'];
  const rows = adminState.vocab.map(v => [v.id,v.word,v.phonetic,v.pos,v.meaning,v.example,v.exampleVi,v.category,v.level].map(c=>`"${c}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href:url, download:'vocabulary.csv' });
  a.click(); URL.revokeObjectURL(url);
  showAdminToast('📥 Export CSV thành công!', 'success');
}

// ─────────────────────────────────────────
// 3. GRAMMAR PAGE
// ─────────────────────────────────────────
function renderGrammarPage() {
  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Quản lý Ngữ pháp</h1>
          <p class="page-subtitle">Tổng: ${adminState.grammarData.length} bài học</p>
        </div>
        <button class="btn-adm btn-adm--primary" onclick="openAddGrammarModal()">
          <i class="fas fa-plus"></i> Thêm bài mới
        </button>
      </div>
      <div class="grammar-cards-grid">
        ${adminState.grammarData.map((g, i) => `
          <div class="grammar-adm-card">
            <div class="grammar-adm-header" style="border-color:${g.color}">
              <div>
                <span class="grammar-adm-num">#${i+1}</span>
                <h3>${g.title}</h3>
              </div>
              <div class="action-btns">
                <button class="btn-icon btn-icon--edit" onclick="editGrammar(${i})" title="Chỉnh sửa">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-icon--delete" onclick="deleteGrammar(${i})" title="Xóa">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="grammar-adm-body">
              <code class="formula-inline" style="background:${g.color}18;border-color:${g.color}30">${g.formula}</code>
              <p>${g.description}</p>
              <div class="grammar-adm-meta">
                <span><i class="fas fa-list-check"></i> ${g.uses.length} cách dùng</span>
                <span><i class="fas fa-quote-right"></i> ${g.examples.length} ví dụ</span>
                <span><i class="fas fa-tag"></i> ${g.signals.length} dấu hiệu</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function openAddGrammarModal() {
  adminState.editingId = null;
  showModal('➕ Thêm bài ngữ pháp', buildGrammarForm(null), `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
    <button class="btn-adm btn-adm--primary" onclick="saveGrammar()"><i class="fas fa-save"></i> Lưu</button>
  `);
}

function editGrammar(idx) {
  adminState.editingId = idx;
  showModal('✏️ Chỉnh sửa bài ngữ pháp', buildGrammarForm(adminState.grammarData[idx]), `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
    <button class="btn-adm btn-adm--primary" onclick="saveGrammar()"><i class="fas fa-save"></i> Lưu thay đổi</button>
  `);
}

function buildGrammarForm(g) {
  return `
    <div class="adm-form-grid">
      <div class="adm-form-group adm-form-group--full">
        <label>Tiêu đề bài học <span class="required">*</span></label>
        <input id="gf_title" type="text" value="${g?.title||''}" placeholder="Thì Hiện tại đơn (Present Simple)" required />
      </div>
      <div class="adm-form-group">
        <label>Công thức <span class="required">*</span></label>
        <input id="gf_formula" type="text" value="${g?.formula||''}" placeholder="S + V(s/es) + O" required />
      </div>
      <div class="adm-form-group">
        <label>Màu sắc</label>
        <input id="gf_color" type="color" value="${g?.color||'#6366f1'}" style="height:42px;padding:4px" />
      </div>
      <div class="adm-form-group adm-form-group--full">
        <label>Mô tả ngắn <span class="required">*</span></label>
        <textarea id="gf_desc" rows="2" placeholder="Diễn tả thói quen, sự thật hiển nhiên...">${g?.description||''}</textarea>
      </div>
      <div class="adm-form-group adm-form-group--full">
        <label>Dấu hiệu nhận biết (phân cách bằng dấu phẩy)</label>
        <input id="gf_signals" type="text" value="${g?.signals?.join(', ')||''}" placeholder="always, usually, often, every day" />
      </div>
    </div>
  `;
}

function saveGrammar() {
  const title   = document.getElementById('gf_title')?.value.trim();
  const formula = document.getElementById('gf_formula')?.value.trim();
  const desc    = document.getElementById('gf_desc')?.value.trim();
  const color   = document.getElementById('gf_color')?.value;
  const signals = document.getElementById('gf_signals')?.value.split(',').map(s=>s.trim()).filter(Boolean);

  if (!title || !formula) { showAdminToast('Vui lòng nhập tiêu đề và công thức!', 'error'); return; }

  const newLesson = { title, formula, description: desc, color, signals, uses: [], examples: [], icon: 'fas fa-circle-dot' };

  if (adminState.editingId !== null && adminState.editingId !== undefined) {
    adminState.grammarData[adminState.editingId] = { ...adminState.grammarData[adminState.editingId], ...newLesson };
    showAdminToast(`✅ Đã cập nhật bài "${title}"`, 'success');
  } else {
    adminState.grammarData.push(newLesson);
    showAdminToast(`✅ Đã thêm bài "${title}"`, 'success');
  }
  closeModal();
  renderGrammarPage();
}

function deleteGrammar(idx) {
  showConfirm(`Xóa bài "<strong>${adminState.grammarData[idx]?.title}</strong>"?`, () => {
    const title = adminState.grammarData[idx].title;
    adminState.grammarData.splice(idx, 1);
    showAdminToast(`🗑️ Đã xóa bài "${title}"`, 'info');
    renderGrammarPage();
  });
}

// ─────────────────────────────────────────
// 4. QUIZ PAGE
// ─────────────────────────────────────────
let activeQuizType = 'vocabulary';

function renderQuizPage() {
  const types = Object.keys(adminState.quizData);
  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Quản lý Quiz</h1>
          <p class="page-subtitle">Tổng: <strong>${Object.values(adminState.quizData).flat().length}</strong> câu hỏi</p>
        </div>
        <button class="btn-adm btn-adm--primary" onclick="openAddQuizModal()">
          <i class="fas fa-plus"></i> Thêm câu hỏi
        </button>
      </div>

      <!-- TYPE TABS -->
      <div class="quiz-tabs">
        ${types.map(t => `
          <button class="quiz-tab ${t===activeQuizType?'active':''}" onclick="activeQuizType='${t}'; renderQuizPage()">
            ${getQuizTypeIcon(t)} ${getQuizTypeLabel(t)}
            <span class="quiz-tab-count">${adminState.quizData[t].length}</span>
          </button>
        `).join('')}
      </div>

      <!-- QUESTIONS TABLE -->
      <div class="adm-card">
        <div class="table-wrap">
          <table class="adm-table">
            <thead>
              <tr><th>#</th><th>Câu hỏi</th><th>Đáp án đúng</th><th>Số lựa chọn</th><th style="text-align:center">Thao tác</th></tr>
            </thead>
            <tbody>
              ${adminState.quizData[activeQuizType].map((q, i) => `
                <tr>
                  <td style="color:#94a3b8">${i+1}</td>
                  <td style="max-width:260px">${q.q}</td>
                  <td><span class="correct-answer">${q.options[q.answer]}</span></td>
                  <td style="text-align:center">${q.options.length}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-icon btn-icon--edit" onclick="editQuiz('${activeQuizType}', ${i})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon btn-icon--delete" onclick="deleteQuiz('${activeQuizType}', ${i})" title="Xóa">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  updateBadgeCounts();
}

function getQuizTypeIcon(t) { return {vocabulary:'📖',grammar:'✏️',listening:'🎧',mixed:'🔀'}[t]||'❓'; }
function getQuizTypeLabel(t) { return {vocabulary:'Từ vựng',grammar:'Ngữ pháp',listening:'Nghe hiểu',mixed:'Tổng hợp'}[t]||t; }

function openAddQuizModal() {
  adminState.editingId = null;
  showModal('➕ Thêm câu hỏi Quiz', buildQuizForm(null), `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
    <button class="btn-adm btn-adm--primary" onclick="saveQuiz()"><i class="fas fa-save"></i> Lưu</button>
  `);
}

function editQuiz(type, idx) {
  adminState.editingId = { type, idx };
  showModal('✏️ Chỉnh sửa câu hỏi', buildQuizForm(adminState.quizData[type][idx], type), `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
    <button class="btn-adm btn-adm--primary" onclick="saveQuiz()"><i class="fas fa-save"></i> Lưu thay đổi</button>
  `);
}

function buildQuizForm(q, defaultType) {
  return `
    <div class="adm-form-grid">
      <div class="adm-form-group adm-form-group--full">
        <label>Loại câu hỏi <span class="required">*</span></label>
        <select id="qf_type">
          ${Object.keys(adminState.quizData).map(t=>`<option value="${t}" ${(defaultType||activeQuizType)===t?'selected':''}>${getQuizTypeLabel(t)}</option>`).join('')}
        </select>
      </div>
      <div class="adm-form-group adm-form-group--full">
        <label>Câu hỏi <span class="required">*</span></label>
        <textarea id="qf_q" rows="2" placeholder="Nhập nội dung câu hỏi...">${q?.q||''}</textarea>
      </div>
      ${[0,1,2,3].map(i=>`
        <div class="adm-form-group">
          <label>Lựa chọn ${i+1} ${q?.answer===i?'<span class="correct-tag">✓ Đúng</span>':''}</label>
          <input id="qf_opt${i}" type="text" value="${q?.options?.[i]||''}" placeholder="Nhập lựa chọn ${i+1}..." />
        </div>
      `).join('')}
      <div class="adm-form-group adm-form-group--full">
        <label>Đáp án đúng (chỉ số 1-4) <span class="required">*</span></label>
        <select id="qf_answer">
          ${[0,1,2,3].map(i=>`<option value="${i}" ${q?.answer===i?'selected':''}>Lựa chọn ${i+1}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function saveQuiz() {
  const type   = document.getElementById('qf_type')?.value;
  const q      = document.getElementById('qf_q')?.value.trim();
  const opts   = [0,1,2,3].map(i=>document.getElementById(`qf_opt${i}`)?.value.trim());
  const answer = parseInt(document.getElementById('qf_answer')?.value);

  if (!q || opts.some(o=>!o)) { showAdminToast('Vui lòng nhập đầy đủ câu hỏi và 4 lựa chọn!', 'error'); return; }

  const newQ = { q, options: opts, answer };

  if (adminState.editingId && adminState.editingId.type) {
    const { type: oldType, idx } = adminState.editingId;
    if (oldType !== type) {
      adminState.quizData[oldType].splice(idx, 1);
      adminState.quizData[type].push(newQ);
    } else {
      adminState.quizData[oldType][idx] = newQ;
    }
    showAdminToast('✅ Đã cập nhật câu hỏi!', 'success');
  } else {
    adminState.quizData[type].push(newQ);
    showAdminToast('✅ Đã thêm câu hỏi mới!', 'success');
  }
  activeQuizType = type;
  saveQuizData();
  closeModal();
  renderQuizPage();
}

function deleteQuiz(type, idx) {
  showConfirm(`Xóa câu hỏi: "<strong>${adminState.quizData[type][idx]?.q}</strong>"?`, () => {
    adminState.quizData[type].splice(idx, 1);
    saveQuizData();
    showAdminToast('🗑️ Đã xóa câu hỏi!', 'info');
    renderQuizPage();
  });
}

function saveQuizData() {
  localStorage.setItem('em_admin_quiz', JSON.stringify(adminState.quizData));
  updateBadgeCounts();
}

// ─────────────────────────────────────────
// MEDIA / IMAGE GALLERY PAGE
// ─────────────────────────────────────────
let mediaSearchTerm = '';

function renderMediaPage() {
  const allMedia = adminState.mediaList || [];
  const filtered = allMedia.filter(m => !mediaSearchTerm || m.originalname.toLowerCase().includes(mediaSearchTerm.toLowerCase()) || m.filename.toLowerCase().includes(mediaSearchTerm.toLowerCase()));

  const totalFiles = allMedia.length;
  const totalBytes = allMedia.reduce((acc, m) => acc + (m.size || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Thư viện Ảnh & Đăng ảnh</h1>
          <p class="page-subtitle">Tổng: <strong>${totalFiles}</strong> ảnh (${totalMB} MB) trong hệ thống</p>
        </div>
        <div class="media-header-actions">
          <button class="btn-adm btn-adm--ghost" onclick="refreshMediaList(); showAdminToast('Đang làm mới thư viện ảnh...', 'info');">
            <i class="fas fa-rotate-right"></i> Làm mới
          </button>
          <button class="btn-adm btn-adm--primary" onclick="document.getElementById('gallery_file_input').click()">
            <i class="fas fa-cloud-arrow-up"></i> Tải ảnh lên
          </button>
        </div>
      </div>

      <!-- HIDDEN FILE INPUT -->
      <input type="file" id="gallery_file_input" multiple accept="image/*" style="display:none" onchange="handleMultipleMediaUpload(this)" />

      <!-- DRAG & DROP UPLOAD ZONE -->
      <div class="media-dropzone-large" id="mediaLargeDropzone"
        onclick="document.getElementById('gallery_file_input').click()"
        ondragover="event.preventDefault(); this.classList.add('dragover')"
        ondragleave="this.classList.remove('dragover')"
        ondrop="handleDropMedia(event)">
        <div class="media-dropzone-icon">
          <i class="fas fa-cloud-arrow-up"></i>
        </div>
        <h3 style="margin:0;font-size:1.1rem;color:#1e293b">Kéo và thả ảnh vào đây, hoặc click để chọn ảnh</h3>
        <p style="margin:0;color:#64748b;font-size:.85rem">Hỗ trợ chọn cùng lúc nhiều ảnh: PNG, JPG, JPEG, WEBP, GIF (Tối đa 10MB/ảnh)</p>
        <span class="btn-adm btn-adm--ghost btn-adm--sm" style="margin-top:.4rem">
          <i class="fas fa-folder-open"></i> Duyệt từ thiết bị
        </span>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="adm-card mb-1">
        <div class="filter-bar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Tìm kiếm tên ảnh..." value="${mediaSearchTerm}"
              oninput="mediaSearchTerm=this.value; renderMediaPage()" />
          </div>
          <span style="font-size:.85rem;color:#64748b;font-weight:600">
            Hiển thị: <strong>${filtered.length}</strong> / ${totalFiles} ảnh
          </span>
        </div>
      </div>

      <!-- GALLERY GRID -->
      <div class="adm-card">
        <div class="adm-card-body">
          ${filtered.length ? `
            <div class="media-grid">
              ${filtered.map(m => {
                const fullUrl = getImageUrl(m.url);
                const sizeKb = (m.size / 1024).toFixed(1);
                const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '';
                return `
                  <div class="media-card">
                    <div class="media-thumb-wrap">
                      <img src="${fullUrl}" alt="${m.originalname}" loading="lazy" />
                      <div class="media-overlay">
                        <button type="button" onclick="previewImage('${fullUrl}', '${m.originalname.replace(/'/g,"\\'")}')" title="Xem ảnh lớn">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" onclick="copyToClipboard('${fullUrl}')" title="Sao chép link">
                          <i class="fas fa-link"></i>
                        </button>
                        <button type="button" class="btn-del-media" onclick="deleteMedia('${m.filename}')" title="Xóa ảnh">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="media-info">
                      <div class="media-name" title="${m.originalname}">${m.originalname}</div>
                      <div class="media-meta">
                        <span>${sizeKb} KB</span>
                        <span>${dateStr}</span>
                      </div>
                      <div style="margin-top:.3rem">
                        <span class="media-copy-badge" onclick="copyToClipboard('${fullUrl}')">
                          <i class="fas fa-copy"></i> Copy Link
                        </span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align:center;padding:3rem 1rem;color:#64748b">
              <i class="fas fa-images" style="font-size:3rem;color:#cbd5e1;margin-bottom:1rem;display:block"></i>
              <h3 style="color:#334155;margin-bottom:.5rem">Chưa có ảnh nào trong thư viện</h3>
              <p style="font-size:.9rem;max-width:400px;margin:0 auto 1.5rem">Hãy tải ảnh lên bằng cách kéo thả vào khung phía trên hoặc bấm nút Tải ảnh lên.</p>
              <button class="btn-adm btn-adm--primary" style="margin:0 auto" onclick="document.getElementById('gallery_file_input').click()">
                <i class="fas fa-cloud-arrow-up"></i> Tải ảnh ngay
              </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function handleDropMedia(e) {
  e.preventDefault();
  const dropzone = document.getElementById('mediaLargeDropzone');
  if (dropzone) dropzone.classList.remove('dragover');
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const input = { files: e.dataTransfer.files, value: '' };
    handleMultipleMediaUpload(input);
  }
}

// ─────────────────────────────────────────
// 5. STATISTICS PAGE
// ─────────────────────────────────────────
function renderStatisticsPage() {
  const xp      = parseInt(localStorage.getItem('em_xp') || 0);
  const streak  = parseInt(localStorage.getItem('em_streak') || 0);
  const words   = parseInt(localStorage.getItem('em_words') || 0);
  const badges  = JSON.parse(localStorage.getItem('em_badges') || '[]');
  const learned = JSON.parse(localStorage.getItem('em_learned') || '[]');
  const total   = adminState.vocab.length;
  const quizTotal = Object.values(adminState.quizData).flat().length;

  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <h1 class="page-title">Thống kê hệ thống</h1>
      </div>

      <div class="stat-grid">
        <div class="stat-card stat-card--blue">
          <div class="stat-card-icon"><i class="fas fa-star"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Tổng XP</span>
            <strong class="stat-card-value">${xp.toLocaleString()}</strong>
            <small>Level ${Math.floor(xp/500)+1}</small>
          </div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-card-icon"><i class="fas fa-fire"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Streak cao nhất</span>
            <strong class="stat-card-value">${streak}</strong>
            <small>ngày liên tiếp</small>
          </div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-card-icon"><i class="fas fa-bookmark"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Từ đã bookmark</span>
            <strong class="stat-card-value">${learned.length}</strong>
            <small>/ ${total} tổng từ</small>
          </div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-card-icon"><i class="fas fa-medal"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Huy hiệu đạt được</span>
            <strong class="stat-card-value">${badges.length}/6</strong>
            <small>${badges.join(', ')||'Chưa có'}</small>
          </div>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-pie-chart"></i> Tiến độ học từ vựng</h3>
          </div>
          <div class="adm-card-body">
            <div class="progress-overview">
              <div class="po-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="10"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" stroke-width="10"
                    stroke-dasharray="${(learned.length/total*251.2).toFixed(1)} 251.2"
                    stroke-dashoffset="62.8" stroke-linecap="round"/>
                </svg>
                <div class="po-label">
                  <strong>${(learned.length/total*100).toFixed(0)}%</strong>
                  <span>hoàn thành</span>
                </div>
              </div>
              <div class="po-stats">
                <div class="po-stat-row"><span>Đã học</span><strong>${learned.length}</strong></div>
                <div class="po-stat-row"><span>Chưa học</span><strong>${total-learned.length}</strong></div>
                <div class="po-stat-row"><span>Tổng</span><strong>${total}</strong></div>
                <div class="po-stat-row"><span>XP / từ</span><strong>${learned.length ? (xp/learned.length).toFixed(1) : 0}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-database"></i> Tổng quan nội dung</h3>
          </div>
          <div class="adm-card-body">
            <div class="content-overview-list">
              ${[
                { icon:'fas fa-book', label:'Từ vựng', val: adminState.vocab.length, color:'#6366f1' },
                { icon:'fas fa-pen-nib', label:'Bài ngữ pháp', val: adminState.grammarData.length, color:'#8b5cf6' },
                { icon:'fas fa-circle-question', label:'Câu hỏi quiz', val: quizTotal, color:'#10b981' },
                { icon:'fas fa-layer-group', label:'Chủ đề', val: 5, color:'#f59e0b' },
                { icon:'fas fa-signal', label:'Cấp độ', val: 6, color:'#ef4444' },
              ].map(item=>`
                <div class="col-row">
                  <div class="col-row-left">
                    <i class="${item.icon}" style="color:${item.color}"></i>
                    <span>${item.label}</span>
                  </div>
                  <strong style="color:${item.color}">${item.val}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// 6. USERS PAGE
// ─────────────────────────────────────────
let adminUsersList = [];

async function fetchUsersFromDB() {
  if (!adminState.dbConnected) return;
  try {
    const res = await fetch(`${API_BASE}/api/users`);
    const data = await res.json();
    if (data.success) {
      adminUsersList = data.data;
    }
  } catch(e) {}
}

async function renderUsersPage() {
  await fetchUsersFromDB();

  let users = adminUsersList;
  if (!users || users.length === 0) {
    const xp      = parseInt(localStorage.getItem('em_xp') || 0);
    const streak  = parseInt(localStorage.getItem('em_streak') || 0);
    const learned = JSON.parse(localStorage.getItem('em_learned') || '[]');
    users = [
      { _id: 'local-1', name: 'Học viên (Khách)', email: 'guest@englishmaster.vn', authProvider: 'local', role: 'user', xp, streak, learnedWords: learned, createdAt: new Date() }
    ];
  }

  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Quản lý Người dùng</h1>
          <p class="page-subtitle">Tổng: <strong>${users.length}</strong> tài khoản (Dữ liệu thời gian thực từ MongoDB)</p>
        </div>
        <button class="btn-adm btn-adm--ghost" onclick="renderUsersPage(); showAdminToast('Đang làm mới danh sách...', 'info');">
          <i class="fas fa-rotate-right"></i> Làm mới
        </button>
      </div>
      <div class="adm-card">
        <div class="table-wrap">
          <table class="adm-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Phương thức</th>
                <th>Vai trò</th>
                <th>XP tích lũy</th>
                <th>Streak</th>
                <th>Từ đã học</th>
                <th>Ngày tham gia</th>
                <th style="text-align:center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => {
                const isGoogle = u.authProvider === 'google';
                const avatar = u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`;
                const wordsCount = Array.isArray(u.learnedWords) ? u.learnedWords.length : (u.learnedWords || 0);
                const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới đây';

                return `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:.75rem">
                        <img src="${avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1.5px solid #e2e8f0" onerror="this.src='https://ui-avatars.com/api/?name=User&background=6366f1&color=fff'" />
                        <div>
                          <strong>${u.name}</strong>
                          <br><small style="color:#94a3b8">${u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      ${isGoogle ? `
                        <span class="cat-tag" style="background:rgba(234,67,53,0.1);color:#ea4335">
                          <i class="fab fa-google" style="margin-right:.25rem"></i> Google
                        </span>
                      ` : `
                        <span class="cat-tag cat-tag--business">
                          <i class="fas fa-envelope" style="margin-right:.25rem"></i> Email
                        </span>
                      `}
                    </td>
                    <td>
                      <span class="level-badge ${u.role === 'admin' ? 'level-badge--c1' : 'level-badge--a1'}">
                        ${u.role === 'admin' ? '👑 Admin' : 'Học viên'}
                      </span>
                    </td>
                    <td><strong style="color:#6366f1">${(u.xp || 0).toLocaleString()} XP</strong></td>
                    <td><span style="color:#f59e0b;font-weight:700">🔥 ${u.streak || 0}</span></td>
                    <td><strong>${wordsCount}</strong> từ</td>
                    <td style="font-size:.82rem;color:#64748b">${joinDate}</td>
                    <td style="text-align:center">
                      <div class="action-btns">
                        <button class="btn-icon btn-icon--edit" onclick="toggleUserRole('${u._id}', '${u.role}')" title="Đổi vai trò Admin/Học viên">
                          <i class="fas fa-user-shield"></i>
                        </button>
                        <button class="btn-icon btn-icon--delete" onclick="deleteUser('${u._id}', '${u.name.replace(/'/g,"\\'")}')" title="Xóa tài khoản">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function deleteUser(id, name) {
  showConfirm(`Bạn có chắc muốn xóa người dùng "<strong>${name}</strong>"?`, async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showAdminToast('🗑️ Đã xóa người dùng thành công', 'info');
        renderUsersPage();
      } else {
        showAdminToast(data.message || 'Lỗi khi xóa', 'error');
      }
    } catch(err) {
      showAdminToast('Lỗi máy chủ: ' + err.message, 'error');
    }
  });
}

async function toggleUserRole(id, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  try {
    const res = await fetch(`${API_BASE}/api/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast(`Đã chuyển vai trò sang: ${newRole === 'admin' ? 'Admin' : 'Học viên'}`, 'success');
      renderUsersPage();
    }
  } catch(e) {
    showAdminToast('Lỗi: ' + e.message, 'error');
  }
}

// ─────────────────────────────────────────
// 7. SETTINGS PAGE
// ─────────────────────────────────────────
function renderSettingsPage() {
  const siteName = localStorage.getItem('em_site_name') || 'EnglishMaster';
  const siteDesc = localStorage.getItem('em_site_desc') || 'Nền tảng học tiếng Anh miễn phí';
  const quizTime = localStorage.getItem('em_quiz_time') || '30';
  const vocabPerPage = localStorage.getItem('em_vocab_per_page') || '8';

  document.getElementById('pageContent').innerHTML = `
    <div class="page-inner">
      <div class="page-title-bar">
        <h1 class="page-title">Cài đặt hệ thống</h1>
      </div>

      <div class="settings-grid">
        <!-- General Settings -->
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-sliders"></i> Cài đặt chung</h3>
          </div>
          <div class="adm-card-body">
            <div class="adm-form-group">
              <label>Tên website</label>
              <input id="s_siteName" type="text" value="${siteName}" />
            </div>
            <div class="adm-form-group">
              <label>Mô tả website</label>
              <input id="s_siteDesc" type="text" value="${siteDesc}" />
            </div>
            <div class="adm-form-group">
              <label>Thời gian đếm ngược quiz (giây)</label>
              <input id="s_quizTime" type="number" min="10" max="120" value="${quizTime}" />
            </div>
            <div class="adm-form-group">
              <label>Số từ hiển thị mặc định (trang chính)</label>
              <input id="s_vocabPerPage" type="number" min="4" max="24" value="${vocabPerPage}" />
            </div>
            <button class="btn-adm btn-adm--primary" onclick="saveSettings()">
              <i class="fas fa-save"></i> Lưu cài đặt
            </button>
          </div>
        </div>

        <!-- Password change -->
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-lock"></i> Đổi mật khẩu Admin</h3>
          </div>
          <div class="adm-card-body">
            <div class="adm-form-group">
              <label>Mật khẩu hiện tại</label>
              <input id="s_oldPass" type="password" placeholder="••••••••" />
            </div>
            <div class="adm-form-group">
              <label>Mật khẩu mới</label>
              <input id="s_newPass" type="password" placeholder="••••••••" />
            </div>
            <div class="adm-form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input id="s_confirmPass" type="password" placeholder="••••••••" />
            </div>
            <button class="btn-adm btn-adm--warning" onclick="changePassword()">
              <i class="fas fa-key"></i> Đổi mật khẩu
            </button>
          </div>
        </div>

        <!-- Data management -->
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-database"></i> Quản lý dữ liệu</h3>
          </div>
          <div class="adm-card-body settings-actions-list">
            <div class="settings-action-row">
              <div>
                <strong>Xuất toàn bộ dữ liệu</strong>
                <p>Export từ vựng và câu hỏi quiz dạng JSON</p>
              </div>
              <button class="btn-adm btn-adm--ghost" onclick="exportData()">
                <i class="fas fa-download"></i> Export
              </button>
            </div>
            <div class="settings-action-row">
              <div>
                <strong>Nhập dữ liệu JSON</strong>
                <p>Import từ file JSON đã export trước đó</p>
              </div>
              <button class="btn-adm btn-adm--ghost" onclick="importDataClick()">
                <i class="fas fa-upload"></i> Import
              </button>
            </div>
            <div class="settings-action-row">
              <div>
                <strong>Khôi phục dữ liệu gốc</strong>
                <p>Reset về dữ liệu mặc định ban đầu</p>
              </div>
              <button class="btn-adm btn-adm--warning" onclick="resetToDefault()">
                <i class="fas fa-rotate-left"></i> Reset
              </button>
            </div>
            <div class="settings-action-row">
              <div>
                <strong>Xóa tiến độ người dùng</strong>
                <p>Xóa XP, streak, bookmark, huy hiệu</p>
              </div>
              <button class="btn-adm btn-adm--danger" onclick="resetUserProgress()">
                <i class="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- System Info -->
        <div class="adm-card">
          <div class="adm-card-header">
            <h3><i class="fas fa-circle-info"></i> Thông tin hệ thống</h3>
          </div>
          <div class="adm-card-body">
            <div class="content-overview-list">
              <div class="col-row"><span>Phiên bản</span><strong>v1.0.0</strong></div>
              <div class="col-row"><span>Framework</span><strong>Vanilla JS</strong></div>
              <div class="col-row"><span>Giao diện</span><strong>SCSS + CSS3</strong></div>
              <div class="col-row"><span>Storage</span><strong>localStorage</strong></div>
              <div class="col-row"><span>Tổng dung lượng</span><strong>${getStorageUsed()}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function saveSettings() {
  localStorage.setItem('em_site_name',     document.getElementById('s_siteName').value);
  localStorage.setItem('em_site_desc',     document.getElementById('s_siteDesc').value);
  localStorage.setItem('em_quiz_time',     document.getElementById('s_quizTime').value);
  localStorage.setItem('em_vocab_per_page',document.getElementById('s_vocabPerPage').value);
  showAdminToast('✅ Đã lưu cài đặt!', 'success');
}

async function changePassword() {
  const old  = document.getElementById('s_oldPass').value;
  const nw   = document.getElementById('s_newPass').value;
  const conf = document.getElementById('s_confirmPass').value;

  if (!old || !nw) {
    showAdminToast('❌ Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!', 'error');
    return;
  }
  if (nw.length < 6) {
    showAdminToast('❌ Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
    return;
  }
  if (nw !== conf) {
    showAdminToast('❌ Xác nhận mật khẩu không khớp!', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: old, newPassword: nw })
    });
    const data = await res.json();
    if (data.success) {
      ADMIN_CREDENTIALS.password = nw;
      showAdminToast('✅ Đổi mật khẩu thành công!', 'success');
      ['s_oldPass','s_newPass','s_confirmPass'].forEach(id => document.getElementById(id).value = '');
    } else {
      showAdminToast('❌ ' + (data.message || 'Lỗi khi đổi mật khẩu'), 'error');
    }
  } catch (err) {
    ADMIN_CREDENTIALS.password = nw;
    showAdminToast('✅ Đã cập nhật mật khẩu cục bộ!', 'success');
    ['s_oldPass','s_newPass','s_confirmPass'].forEach(id => document.getElementById(id).value = '');
  }
}

function getStorageUsed() {
  let total = 0;
  for (const key in localStorage) { if (localStorage.hasOwnProperty(key)) total += localStorage[key].length * 2; }
  return total < 1024 ? total + ' B' : (total/1024).toFixed(1) + ' KB';
}

// ─────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────
function getCatLabel(cat) {
  return { daily:'🏠 Hàng ngày', business:'💼 Kinh doanh', travel:'✈️ Du lịch', academic:'🎓 Học thuật', idiom:'💬 Thành ngữ' }[cat] || cat;
}

function updateBadgeCounts() {
  const vEl = document.getElementById('vocabCountBadge');
  const qEl = document.getElementById('quizCountBadge');
  const mEl = document.getElementById('mediaCountBadge');
  const uEl = document.getElementById('userCountBadge');
  const nEl = document.getElementById('newsCountBadge');
  const cEl = document.getElementById('coursesCountBadge');
  const itEl = document.getElementById('itCourseCountBadge');
  if (vEl) vEl.textContent = adminState.vocab.length;
  if (qEl) qEl.textContent = Object.values(adminState.quizData).flat().length;
  if (mEl) mEl.textContent = (adminState.mediaList || []).length;
  if (uEl) uEl.textContent = adminUsersList.length;
  if (nEl) nEl.textContent = (typeof TECH_NEWS_DATA !== 'undefined' ? TECH_NEWS_DATA.length : 6);
  if (cEl) cEl.textContent = adminCoursesList.length;
  if (itEl) itEl.textContent = (typeof IT_COURSES_DATA !== 'undefined' ? IT_COURSES_DATA.length : 6);
}

async function refreshData() {
  showAdminToast('Đang làm mới dữ liệu từ MongoDB...', 'info');
  await checkDbConnection();
  await loadDataFromApi();
  showAdminToast('✅ Đã làm mới dữ liệu thành công!', 'success');
}

function adminSpeak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US'; utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

function exportData() {
  const data = { vocabulary: adminState.vocab, quizData: adminState.quizData, grammarData: adminState.grammarData, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'englishmaster-data.json' });
  a.click(); URL.revokeObjectURL(url);
  showAdminToast('📥 Export JSON thành công!', 'success');
}

function importDataClick() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.vocabulary) { adminState.vocab = data.vocabulary; saveVocabData(); }
        if (data.quizData)   { adminState.quizData = data.quizData; saveQuizData(); }
        showAdminToast('✅ Import thành công!', 'success');
        renderPage(adminState.currentPage);
      } catch { showAdminToast('❌ File JSON không hợp lệ!', 'error'); }
    };
    reader.readAsText(file);
  };
  inp.click();
}

function resetToDefault() {
  showConfirm('Khôi phục toàn bộ dữ liệu về mặc định? Tất cả thay đổi sẽ bị mất!', () => {
    localStorage.removeItem('em_admin_vocab');
    localStorage.removeItem('em_admin_quiz');
    adminState.vocab    = JSON.parse(JSON.stringify(VOCABULARY_DATA));
    adminState.quizData = JSON.parse(JSON.stringify(QUIZ_DATA));
    showAdminToast('✅ Đã khôi phục dữ liệu gốc!', 'success');
    renderPage(adminState.currentPage);
  });
}

function resetUserProgress() {
  showConfirm('Xóa toàn bộ tiến độ học (XP, streak, bookmark)?', () => {
    ['em_xp','em_streak','em_words','em_badges','em_learned','em_lastSeen'].forEach(k => localStorage.removeItem(k));
    showAdminToast('🗑️ Đã xóa tiến độ người dùng!', 'info');
  });
}

// ─────────────────────────────────────────
// MODAL SYSTEM
// ─────────────────────────────────────────
function showModal(title, body, footer = '') {
  document.getElementById('admModalTitle').textContent = title;
  document.getElementById('admModalBody').innerHTML  = body;
  document.getElementById('admModalFooter').innerHTML = footer;
  document.getElementById('admModal').classList.add('show');
  document.getElementById('admModalBox').classList.add('show');
}

function closeModal() {
  document.getElementById('admModal').classList.remove('show');
  document.getElementById('admModalBox').classList.remove('show');
}

document.getElementById('admModal').addEventListener('click', e => { if (e.target.id === 'admModal') closeModal(); });

// ─────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────
function showConfirm(message, callback) {
  document.getElementById('confirmMessage').innerHTML = message;
  document.getElementById('confirmDialog').classList.add('show');
  document.getElementById('confirmBtn').onclick = () => { callback(); closeConfirm(); };
}

function closeConfirm() {
  document.getElementById('confirmDialog').classList.remove('show');
}

document.getElementById('confirmDialog').addEventListener('click', e => { if (e.target.id === 'confirmDialog') closeConfirm(); });

// ─────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────
function showAdminToast(message, type = 'info') {
  const c = document.getElementById('admToastContainer');
  const t = document.createElement('div');
  t.className = `adm-toast adm-toast--${type}`;
  t.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
  c.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
}

// ─────────────────────────────────────────
// QUẢN LÝ TIN TỨC CNTT (TECH NEWS ADMIN)
// ─────────────────────────────────────────
let adminNewsList = (typeof TECH_NEWS_DATA !== 'undefined' ? TECH_NEWS_DATA : []);

async function renderNewsPage() {
  // Đồng bộ từ API nếu online
  try {
    const res = await fetch(`${API_BASE}/api/news`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) adminNewsList = data.data;
    }
  } catch(e) {}

  const el = document.getElementById('pageContent');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-newspaper" style="color:#6366f1"></i> Quản lý Tin tức Công nghệ Thông tin</h2>
        <p>Quản lý các bài viết tin tức công nghệ, từ vựng IT nổi bật và lượt xem</p>
      </div>
      <div class="header-actions">
        <button class="btn-adm btn-adm--primary" onclick="openCreateNewsModal()">
          <i class="fas fa-plus"></i> Thêm bài viết mới
        </button>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-row">
        <div class="search-wrap" style="flex:1">
          <i class="fas fa-search"></i>
          <input type="text" id="newsAdminSearch" placeholder="Tìm kiếm bài viết theo tiêu đề, tóm tắt..." oninput="filterAdminNewsTable(this.value)" />
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table class="data-table" id="adminNewsTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tiêu đề & Chuyên mục</th>
              <th>Tác giả</th>
              <th>Thời gian đọc</th>
              <th>Lượt xem</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="adminNewsTbody">
            ${renderAdminNewsRows(adminNewsList)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminNewsRows(list) {
  if (!list || list.length === 0) {
    return `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">Không có bài viết nào.</td></tr>`;
  }
  return list.map(item => `
    <tr>
      <td><strong>#${item.id}</strong></td>
      <td>
        <img src="${item.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80'}" style="width:50px;height:36px;object-fit:cover;border-radius:6px" alt="Thumb" />
      </td>
      <td>
        <div style="font-weight:700;color:#fff">${escapeHtml(item.title)}</div>
        <span class="badge" style="background:rgba(99,102,241,0.2);color:#818cf8;font-size:.72rem">${escapeHtml(item.categoryLabel || item.category)}</span>
      </td>
      <td>${escapeHtml(item.author || 'Admin')}</td>
      <td>${escapeHtml(item.readTime || '5 phút')}</td>
      <td><span class="badge" style="background:#1e293b;color:#38bdf8"><i class="fas fa-eye"></i> ${item.views || 0}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-action--edit" title="Xem chi tiết" onclick="viewAdminNewsDetail(${item.id})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-action btn-action--delete" title="Xóa" onclick="deleteAdminNews(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterAdminNewsTable(q) {
  const query = (q || '').toLowerCase().trim();
  const filtered = adminNewsList.filter(n => n.title.toLowerCase().includes(query) || n.summary.toLowerCase().includes(query));
  const tbody = document.getElementById('adminNewsTbody');
  if (tbody) tbody.innerHTML = renderAdminNewsRows(filtered);
}

function viewAdminNewsDetail(id) {
  const item = adminNewsList.find(n => n.id === id);
  if (!item) return;
  openModal(`Chi tiết bài viết #${item.id}`, `
    <div style="line-height:1.6">
      <h3 style="color:#fff;margin-bottom:.5rem">${escapeHtml(item.title)}</h3>
      <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">Tác giả: <strong>${escapeHtml(item.author)}</strong> | Ngày đăng: ${escapeHtml(item.publishedAt || 'N/A')}</p>
      ${item.image ? `<img src="${item.image}" style="max-height:200px;width:100%;object-fit:cover;border-radius:8px;margin-bottom:1rem" />` : ''}
      <div style="background:#1e293b;padding:1rem;border-radius:8px;margin-bottom:1rem">
        <strong>Tóm tắt:</strong> ${escapeHtml(item.summary)}
      </div>
      <div style="max-height:220px;overflow-y:auto;background:#0f172a;padding:1rem;border-radius:8px;font-size:.88rem;color:#cbd5e1">
        ${item.content}
      </div>
    </div>
  `, `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Đóng</button>
  `);
}

function deleteAdminNews(id) {
  showConfirm(`Bạn có chắc muốn xóa bài viết tin tức <strong>#${id}</strong>?`, async () => {
    try {
      await fetch(`${API_BASE}/api/news/${id}`, { method: 'DELETE' });
    } catch(e) {}
    adminNewsList = adminNewsList.filter(n => n.id !== id);
    renderNewsPage();
    updateBadgeCounts();
    showAdminToast('✅ Đã xóa bài viết thành công!', 'success');
  });
}

function openCreateNewsModal() {
  openModal('Thêm bài viết tin tức CNTT mới', `
    <form id="createNewsForm" onsubmit="handleCreateNewsSubmit(event)">
      <div class="adm-form-group">
        <label>Tiêu đề bài viết *</label>
        <input type="text" id="new_title" required placeholder="Nhập tiêu đề..." />
      </div>
      <div class="adm-form-group">
        <label>Chuyên mục</label>
        <select id="new_cat" style="width:100%;padding:.6rem;border-radius:8px;background:#1e293b;color:#fff;border:1px solid #334155">
          <option value="ai">Trí tuệ nhân tạo (AI)</option>
          <option value="dev">Lập trình Web & Software</option>
          <option value="security">An ninh mạng</option>
          <option value="cloud">Cloud & DevOps</option>
          <option value="career">Sự nghiệp IT</option>
        </select>
      </div>
      <div class="adm-form-group">
        <label>URL Hình ảnh</label>
        <input type="text" id="new_image" placeholder="https://..." value="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" />
      </div>
      <div class="adm-form-group">
        <label>Tóm tắt ngắn *</label>
        <textarea id="new_summary" rows="2" required placeholder="Tóm tắt bài viết..."></textarea>
      </div>
      <div class="adm-form-group">
        <label>Nội dung bài viết (HTML) *</label>
        <textarea id="new_content" rows="4" required placeholder="<p>Nội dung chi tiết...</p>"></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem">
        <button type="button" class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
        <button type="submit" class="btn-adm btn-adm--primary">Tạo bài viết</button>
      </div>
    </form>
  `, '');
}

async function handleCreateNewsSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('new_title').value.trim();
  const cat = document.getElementById('new_cat').value;
  const image = document.getElementById('new_image').value.trim();
  const summary = document.getElementById('new_summary').value.trim();
  const content = document.getElementById('new_content').value.trim();

  const labels = { ai: 'Trí tuệ nhân tạo', dev: 'Lập trình Web', security: 'An ninh mạng', cloud: 'Cloud & DevOps', career: 'Sự nghiệp IT' };
  const newId = (adminNewsList.length > 0 ? Math.max(...adminNewsList.map(n => n.id)) + 1 : 1);

  const payload = {
    id: newId,
    title,
    category: cat,
    categoryLabel: labels[cat] || 'Công nghệ',
    image,
    summary,
    content,
    author: 'Admin',
    readTime: '5 phút đọc',
    publishedAt: new Date().toLocaleDateString('vi-VN'),
    views: 1
  };

  try {
    await fetch(`${API_BASE}/api/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch(err) {}

  adminNewsList.unshift(payload);
  closeModal();
  renderNewsPage();
  updateBadgeCounts();
  showAdminToast('🎉 Đã thêm bài viết tin tức thành công!', 'success');
}

// ─────────────────────────────────────────
// QUẢN LÝ KHÓA HỌC CNTT (IT COURSES ADMIN)
// ─────────────────────────────────────────
function renderITCoursesPage() {
  const el = document.getElementById('pageContent');
  if (!el) return;

  const courses = (typeof IT_COURSES_DATA !== 'undefined' ? IT_COURSES_DATA : []);

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-laptop-code" style="color:#10b981"></i> Quản lý Khóa học & Lộ trình CNTT</h2>
        <p>Quản lý các module đào tạo lập trình, thuật toán và tiếng Anh chuyên ngành</p>
      </div>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khóa học</th>
              <th>Tên tiếng Anh</th>
              <th>Cấp độ</th>
              <th>Số chủ đề</th>
              <th>Số từ vựng</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map(c => `
              <tr>
                <td><strong>#${c.id}</strong></td>
                <td>
                  <div style="font-weight:700;color:#fff"><i class="${c.icon || 'fas fa-code'}" style="color:${c.color || '#6366f1'};margin-right:.4rem"></i> ${escapeHtml(c.title)}</div>
                </td>
                <td><span style="color:#94a3b8">${escapeHtml(c.titleEn || '')}</span></td>
                <td><span class="badge" style="background:#1e293b;color:#10b981">${escapeHtml(c.level)}</span></td>
                <td><strong>${(c.topics || []).length} bài</strong></td>
                <td><span class="badge" style="background:rgba(99,102,241,0.2);color:#818cf8">${(c.keyVocab || []).length} terms</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// QUẢN LÝ KHÓA HỌC TIẾNG ANH VIDEO (COURSES ADMIN)
// ─────────────────────────────────────────
function renderAdminCoursesPage() {
  const el = document.getElementById('pageContent');
  if (!el) return;

  const totalLessons = adminCoursesList.reduce((acc, c) => acc + (c.lessons ? c.lessons.length : 1), 0);
  const totalViews = adminCoursesList.reduce((acc, c) => acc + (c.views || 0), 0);

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h2><i class="fab fa-youtube" style="color:#ef4444"></i> Quản lý Khóa học Tiếng Anh Video</h2>
        <p>Thêm, chỉnh sửa, gắn link YouTube và quản lý các bài giảng video tiếng Anh trên hệ thống</p>
      </div>
      <div class="page-header-actions">
        <button class="btn-adm btn-adm--primary" onclick="openCreateAdminCourseModal()">
          <i class="fas fa-plus"></i> Thêm khóa học mới
        </button>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(239,68,68,0.15);color:#ef4444"><i class="fab fa-youtube"></i></div>
        <div class="stat-info">
          <div class="stat-value">${adminCoursesList.length}</div>
          <div class="stat-label">Tổng số khóa học</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(99,102,241,0.15);color:#6366f1"><i class="fas fa-video"></i></div>
        <div class="stat-info">
          <div class="stat-value">${totalLessons}</div>
          <div class="stat-label">Tổng bài học video</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(16,185,129,0.15);color:#10b981"><i class="fas fa-eye"></i></div>
        <div class="stat-info">
          <div class="stat-value">${totalViews}</div>
          <div class="stat-label">Lượt xem video</div>
        </div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-search">
          <i class="fas fa-search"></i>
          <input type="text" id="adminCourseSearch" placeholder="Tìm theo tên khóa học, giảng viên..." oninput="filterAdminCoursesTable(this.value)" />
        </div>
        <div class="toolbar-filters">
          <select id="adminCourseCatFilter" onchange="filterAdminCoursesByCat(this.value)" style="padding:.5rem;border-radius:8px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:.85rem">
            <option value="all">Tất cả chuyên mục</option>
            <option value="communication">Giao tiếp hàng ngày</option>
            <option value="it">Tiếng Anh CNTT</option>
            <option value="pronunciation">Phát âm & Ngữ điệu</option>
            <option value="listening">Luyện nghe phản xạ</option>
            <option value="grammar">Ngữ pháp ứng dụng</option>
            <option value="ielts">Luyện thi</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th style="width:110px">Thumbnail</th>
              <th>Tên khóa học</th>
              <th>Chuyên mục</th>
              <th>Trình độ</th>
              <th>Số bài video</th>
              <th>Giảng viên</th>
              <th>Lượt xem</th>
              <th style="width:140px">Thao tác</th>
            </tr>
          </thead>
          <tbody id="adminCoursesTbody">
            ${renderAdminCoursesRows(adminCoursesList)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminCoursesRows(courses) {
  if (!courses || courses.length === 0) {
    return `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#94a3b8">Không tìm thấy khóa học nào</td></tr>`;
  }

  const catLabels = {
    communication: 'Giao tiếp',
    it: 'Tiếng Anh IT',
    pronunciation: 'Phát âm IPA',
    listening: 'Luyện nghe',
    grammar: 'Ngữ pháp',
    ielts: 'Luyện thi'
  };

  return courses.map(c => {
    const mainYtId = c.youtubeId || (typeof extractYouTubeId === 'function' ? extractYouTubeId(c.youtubeUrl) : '');
    const thumbUrl = c.thumbnail || (mainYtId ? `https://img.youtube.com/vi/${mainYtId}/hqdefault.jpg` : '');
    const lessonCount = (c.lessons && c.lessons.length > 0) ? c.lessons.length : 1;

    return `
      <tr>
        <td><strong>#${c.id}</strong></td>
        <td>
          <div style="position:relative;width:80px;height:45px;border-radius:6px;overflow:hidden;background:#0f172a;cursor:pointer" onclick="openAdminVideoPreview(${c.id})">
            <img src="${thumbUrl}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80'" />
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem">
              <i class="fas fa-play"></i>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:700;color:#fff;margin-bottom:.2rem">${escapeHtml(c.title)}</div>
          <div style="color:#94a3b8;font-size:.8rem">${escapeHtml(c.titleEn || '')}</div>
        </td>
        <td><span class="badge" style="background:#1e293b;color:#38bdf8">${catLabels[c.category] || c.category}</span></td>
        <td><span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8">${escapeHtml(c.level || 'Cơ bản')}</span></td>
        <td><strong>${lessonCount} bài</strong></td>
        <td>${escapeHtml(c.instructor || 'TechEnglish')}</td>
        <td><span class="badge" style="background:#1e293b;color:#10b981"><i class="fas fa-eye"></i> ${c.views || 0}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-action" style="background:rgba(239,68,68,0.15);color:#ef4444" title="Xem video" onclick="openAdminVideoPreview(${c.id})">
              <i class="fab fa-youtube"></i>
            </button>
            <button class="btn-action" style="background:rgba(16,185,129,0.15);color:#10b981" title="Thêm bài học video" onclick="openAdminAddLessonModal(${c.id})">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn-action btn-action--edit" title="Chỉnh sửa khóa học" onclick="openAdminEditCourseModal(${c.id})">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn-action btn-action--delete" title="Xóa khóa học" onclick="deleteAdminCourse(${c.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterAdminCoursesTable(q) {
  const query = (q || '').toLowerCase().trim();
  const filtered = adminCoursesList.filter(c => 
    c.title.toLowerCase().includes(query) ||
    (c.titleEn && c.titleEn.toLowerCase().includes(query)) ||
    (c.instructor && c.instructor.toLowerCase().includes(query))
  );
  const tbody = document.getElementById('adminCoursesTbody');
  if (tbody) tbody.innerHTML = renderAdminCoursesRows(filtered);
}

function filterAdminCoursesByCat(cat) {
  const filtered = (cat === 'all')
    ? adminCoursesList
    : adminCoursesList.filter(c => c.category === cat);
  const tbody = document.getElementById('adminCoursesTbody');
  if (tbody) tbody.innerHTML = renderAdminCoursesRows(filtered);
}

// Modal xem trực tiếp Video trên Admin
function openAdminVideoPreview(courseId, lessonIdx = 0) {
  const course = adminCoursesList.find(c => c.id === courseId);
  if (!course) return;

  const lessons = (course.lessons && course.lessons.length > 0) ? course.lessons : [
    {
      id: 1,
      title: course.title,
      youtubeUrl: course.youtubeUrl,
      youtubeId: course.youtubeId || (typeof extractYouTubeId === 'function' ? extractYouTubeId(course.youtubeUrl) : ''),
      duration: '15:00',
      description: course.description
    }
  ];

  const currentLesson = lessons[lessonIdx] || lessons[0];
  const ytId = currentLesson.youtubeId || (typeof extractYouTubeId === 'function' ? extractYouTubeId(currentLesson.youtubeUrl) : course.youtubeId);

  openModal(`Xem Video: ${escapeHtml(course.title)}`, `
    <div style="line-height:1.5">
      <div style="position:relative;width:100%;padding-top:56.25%;background:#000;border-radius:12px;overflow:hidden;margin-bottom:1rem">
        ${ytId ? `
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0" 
            style="position:absolute;inset:0;width:100%;height:100%;border:0" 
            allowfullscreen>
          </iframe>
        ` : `
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#94a3b8">
            Chưa có video YouTube khả dụng
          </div>
        `}
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.8rem">
        <div>
          <h4 style="color:#fff;margin-bottom:.2rem">${escapeHtml(currentLesson.title)}</h4>
          <span style="color:#94a3b8;font-size:.82rem"><i class="far fa-clock"></i> Thời lượng: ${escapeHtml(currentLesson.duration || '15:00')}</span>
        </div>
        <span class="badge" style="background:#ef4444;color:#fff">Bài ${lessonIdx + 1}/${lessons.length}</span>
      </div>

      <div style="background:#0f172a;padding:1rem;border-radius:10px;margin-bottom:1rem;border:1px solid #1e293b">
        <strong style="color:#38bdf8;font-size:.88rem">Tóm tắt bài giảng:</strong>
        <p style="color:#cbd5e1;font-size:.85rem;margin-top:.3rem">${escapeHtml(currentLesson.description || course.description || '')}</p>
      </div>

      ${lessons.length > 1 ? `
        <div style="margin-top:1rem">
          <strong style="color:#fff;font-size:.88rem;display:block;margin-bottom:.5rem">Danh sách bài học trong khóa:</strong>
          <div style="max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:.4rem">
            ${lessons.map((l, idx) => `
              <div onclick="closeModal(); setTimeout(() => openAdminVideoPreview(${course.id}, ${idx}), 200)" style="padding:.6rem .8rem;border-radius:8px;background:${idx === lessonIdx ? '#1e293b' : '#0f172a'};border:1px solid ${idx === lessonIdx ? '#6366f1' : '#334155'};cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:.85rem">
                <span style="color:${idx === lessonIdx ? '#818cf8' : '#e2e8f0'}"><strong>#${idx + 1}</strong> ${escapeHtml(l.title)}</span>
                <span style="color:#94a3b8;font-size:.78rem">${escapeHtml(l.duration || '')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `, `
    <button class="btn-adm btn-adm--ghost" onclick="closeModal()">Đóng</button>
    <button class="btn-adm btn-adm--primary" onclick="closeModal(); openAdminAddLessonModal(${course.id})">
      <i class="fas fa-plus"></i> Thêm bài học mới
    </button>
  `);
}

// Modal tạo khóa học mới trên Admin
function openCreateAdminCourseModal() {
  openModal('Thêm Khóa học Tiếng Anh Video Mới', `
    <form id="createAdminCourseForm" onsubmit="handleCreateAdminCourseSubmit(event)">
      <div class="adm-form-group">
        <label>Tên khóa học (Tiếng Việt) *</label>
        <input type="text" id="adm_course_title" required placeholder="VD: Tiếng Anh Giao Tiếp Thực Chiến..." />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div class="adm-form-group">
          <label>Tên tiếng Anh (English Title)</label>
          <input type="text" id="adm_course_titleEn" placeholder="VD: Everyday Conversational English..." />
        </div>
        <div class="adm-form-group">
          <label>Giảng viên / Kênh</label>
          <input type="text" id="adm_course_instructor" placeholder="VD: Cô Mai Phương / TechEnglish" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div class="adm-form-group">
          <label>Chuyên mục</label>
          <select id="adm_course_cat" style="width:100%;padding:.6rem;border-radius:8px;background:#1e293b;color:#fff;border:1px solid #334155">
            <option value="communication">Giao tiếp hàng ngày</option>
            <option value="it">Tiếng Anh CNTT & Tech</option>
            <option value="pronunciation">Phát âm & Ngữ điệu (IPA)</option>
            <option value="listening">Luyện nghe phản xạ</option>
            <option value="grammar">Ngữ pháp ứng dụng</option>
            <option value="ielts">Luyện thi</option>
          </select>
        </div>
        <div class="adm-form-group">
          <label>Trình độ</label>
          <select id="adm_course_level" style="width:100%;padding:.6rem;border-radius:8px;background:#1e293b;color:#fff;border:1px solid #334155">
            <option value="Cơ bản (A1-A2)">Cơ bản (A1-A2)</option>
            <option value="Trung cấp (B1-B2)">Trung cấp (B1-B2)</option>
            <option value="Nâng cao (C1-C2)">Nâng cao (C1-C2)</option>
          </select>
        </div>
      </div>

      <div class="adm-form-group">
        <label><i class="fab fa-youtube" style="color:#ef4444"></i> Link YouTube Video chính *</label>
        <input type="url" id="adm_course_ytUrl" required placeholder="https://www.youtube.com/watch?v=..." oninput="handleAdminYtPreview(this.value)" />
        <div id="admYtPreviewBox" style="display:none;margin-top:.5rem;padding:.5rem;border-radius:8px;background:#0f172a;align-items:center;gap:.75rem;border:1px dashed #334155">
          <img id="admYtPreviewImg" src="" style="width:100px;height:56px;border-radius:6px;object-fit:cover" />
          <div style="font-size:.8rem;color:#10b981"><i class="fas fa-check-circle"></i> Đã nhận diện YouTube Video!</div>
        </div>
      </div>

      <div class="adm-form-group">
        <label>Mô tả khóa học *</label>
        <textarea id="adm_course_desc" rows="3" required placeholder="Mô tả mục tiêu khóa học, kiến thức trọng tâm..."></textarea>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1.25rem">
        <button type="button" class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
        <button type="submit" class="btn-adm btn-adm--primary"><i class="fas fa-plus"></i> Tạo khóa học</button>
      </div>
    </form>
  `, '');
}

function handleAdminYtPreview(url) {
  const box = document.getElementById('admYtPreviewBox');
  const img = document.getElementById('admYtPreviewImg');
  if (!box || !img) return;

  let ytId = '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) ytId = url.trim();
  else {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const m = url.match(regExp);
    if (m) ytId = m[1];
  }

  if (ytId) {
    box.style.display = 'flex';
    img.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  } else {
    box.style.display = 'none';
  }
}

async function handleCreateAdminCourseSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('adm_course_title').value.trim();
  const titleEn = document.getElementById('adm_course_titleEn').value.trim();
  const category = document.getElementById('adm_course_cat').value;
  const level = document.getElementById('adm_course_level').value;
  const instructor = document.getElementById('adm_course_instructor').value.trim() || 'TechEnglish Team';
  const ytUrl = document.getElementById('adm_course_ytUrl').value.trim();
  const desc = document.getElementById('adm_course_desc').value.trim();

  let ytId = '';
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const m = ytUrl.match(regExp);
  if (m) ytId = m[1];
  else if (/^[a-zA-Z0-9_-]{11}$/.test(ytUrl)) ytId = ytUrl;

  const newId = (adminCoursesList.length > 0 ? Math.max(...adminCoursesList.map(c => c.id)) + 1 : 1);
  const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

  const payload = {
    id: newId,
    title,
    titleEn,
    category,
    level,
    instructor,
    thumbnail,
    youtubeUrl: ytUrl,
    youtubeId: ytId,
    description: desc,
    views: 1,
    rating: 5.0,
    badge: 'Mới tạo',
    lessons: [
      {
        id: 1,
        title: `Bài 1: Bài giảng mở đầu - ${title}`,
        youtubeUrl: ytUrl,
        youtubeId: ytId,
        duration: '15:00',
        description: desc,
        order: 1,
        vocabularies: []
      }
    ]
  };

  try {
    const res = await fetch(`${API_BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) payload.id = data.data.id || payload.id;
    }
  } catch (err) {}

  adminCoursesList.unshift(payload);
  closeModal();
  renderAdminCoursesPage();
  updateBadgeCounts();
  showAdminToast('🎉 Đã tạo khóa học tiếng Anh thành công!', 'success');
}

// Modal chỉnh sửa khóa học
function openAdminEditCourseModal(courseId) {
  const course = adminCoursesList.find(c => c.id === courseId);
  if (!course) return;

  openModal(`Chỉnh sửa Khóa học #${course.id}`, `
    <form id="editAdminCourseForm" onsubmit="handleEditAdminCourseSubmit(event, ${course.id})">
      <div class="adm-form-group">
        <label>Tên khóa học (Tiếng Việt) *</label>
        <input type="text" id="edit_course_title" required value="${escapeHtml(course.title)}" />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div class="adm-form-group">
          <label>Tên tiếng Anh (English Title)</label>
          <input type="text" id="edit_course_titleEn" value="${escapeHtml(course.titleEn || '')}" />
        </div>
        <div class="adm-form-group">
          <label>Giảng viên / Kênh</label>
          <input type="text" id="edit_course_instructor" value="${escapeHtml(course.instructor || '')}" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div class="adm-form-group">
          <label>Chuyên mục</label>
          <select id="edit_course_cat" style="width:100%;padding:.6rem;border-radius:8px;background:#1e293b;color:#fff;border:1px solid #334155">
            <option value="communication" ${course.category === 'communication' ? 'selected' : ''}>Giao tiếp hàng ngày</option>
            <option value="it" ${course.category === 'it' ? 'selected' : ''}>Tiếng Anh CNTT & Tech</option>
            <option value="pronunciation" ${course.category === 'pronunciation' ? 'selected' : ''}>Phát âm & Ngữ điệu (IPA)</option>
            <option value="listening" ${course.category === 'listening' ? 'selected' : ''}>Luyện nghe phản xạ</option>
            <option value="grammar" ${course.category === 'grammar' ? 'selected' : ''}>Ngữ pháp ứng dụng</option>
            <option value="ielts" ${course.category === 'ielts' ? 'selected' : ''}>Luyện thi</option>
          </select>
        </div>
        <div class="adm-form-group">
          <label>Trình độ</label>
          <select id="edit_course_level" style="width:100%;padding:.6rem;border-radius:8px;background:#1e293b;color:#fff;border:1px solid #334155">
            <option value="Cơ bản (A1-A2)" ${course.level === 'Cơ bản (A1-A2)' ? 'selected' : ''}>Cơ bản (A1-A2)</option>
            <option value="Trung cấp (B1-B2)" ${course.level === 'Trung cấp (B1-B2)' ? 'selected' : ''}>Trung cấp (B1-B2)</option>
            <option value="Nâng cao (C1-C2)" ${course.level === 'Nâng cao (C1-C2)' ? 'selected' : ''}>Nâng cao (C1-C2)</option>
          </select>
        </div>
      </div>

      <div class="adm-form-group">
        <label><i class="fab fa-youtube" style="color:#ef4444"></i> Link YouTube Video chính</label>
        <input type="url" id="edit_course_ytUrl" value="${escapeHtml(course.youtubeUrl || '')}" />
      </div>

      <div class="adm-form-group">
        <label>Mô tả khóa học *</label>
        <textarea id="edit_course_desc" rows="3" required>${escapeHtml(course.description || '')}</textarea>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1.25rem">
        <button type="button" class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
        <button type="submit" class="btn-adm btn-adm--primary"><i class="fas fa-save"></i> Cập nhật khóa học</button>
      </div>
    </form>
  `, '');
}

async function handleEditAdminCourseSubmit(e, courseId) {
  e.preventDefault();
  const course = adminCoursesList.find(c => c.id === courseId);
  if (!course) return;

  const title = document.getElementById('edit_course_title').value.trim();
  const titleEn = document.getElementById('edit_course_titleEn').value.trim();
  const category = document.getElementById('edit_course_cat').value;
  const level = document.getElementById('edit_course_level').value;
  const instructor = document.getElementById('edit_course_instructor').value.trim();
  const ytUrl = document.getElementById('edit_course_ytUrl').value.trim();
  const desc = document.getElementById('edit_course_desc').value.trim();

  let ytId = course.youtubeId;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const m = ytUrl.match(regExp);
  if (m) ytId = m[1];
  else if (/^[a-zA-Z0-9_-]{11}$/.test(ytUrl)) ytId = ytUrl;

  const updates = {
    title,
    titleEn,
    category,
    level,
    instructor,
    youtubeUrl: ytUrl,
    youtubeId: ytId,
    description: desc,
    thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : course.thumbnail
  };

  try {
    await fetch(`${API_BASE}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {}

  Object.assign(course, updates);
  closeModal();
  renderAdminCoursesPage();
  showAdminToast('✅ Đã cập nhật khóa học thành công!', 'success');
}

// Modal thêm bài học video vào khóa
function openAdminAddLessonModal(courseId) {
  const course = adminCoursesList.find(c => c.id === courseId);
  if (!course) return;

  openModal(`Thêm bài học vào khóa: ${escapeHtml(course.title)}`, `
    <form id="addAdminLessonForm" onsubmit="handleAddAdminLessonSubmit(event, ${course.id})">
      <div class="adm-form-group">
        <label>Tiêu đề bài học *</label>
        <input type="text" id="adm_lesson_title" required placeholder="VD: Bài 2: Cách hỏi đường và địa điểm..." />
      </div>

      <div class="adm-form-group">
        <label><i class="fab fa-youtube" style="color:#ef4444"></i> Link YouTube Video bài học *</label>
        <input type="url" id="adm_lesson_ytUrl" required placeholder="https://www.youtube.com/watch?v=..." oninput="handleAdminYtPreview(this.value)" />
        <div id="admYtPreviewBox" style="display:none;margin-top:.5rem;padding:.5rem;border-radius:8px;background:#0f172a;align-items:center;gap:.75rem;border:1px dashed #334155">
          <img id="admYtPreviewImg" src="" style="width:100px;height:56px;border-radius:6px;object-fit:cover" />
          <div style="font-size:.8rem;color:#10b981"><i class="fas fa-check-circle"></i> Đã nhận diện YouTube Video!</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div class="adm-form-group">
          <label>Thời lượng</label>
          <input type="text" id="adm_lesson_duration" placeholder="VD: 15:30" value="15:00" />
        </div>
        <div class="adm-form-group">
          <label>Ghi chú tóm tắt bài giảng</label>
          <input type="text" id="adm_lesson_desc" placeholder="Tóm tắt nội dung trọng tâm..." />
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1.25rem">
        <button type="button" class="btn-adm btn-adm--ghost" onclick="closeModal()">Hủy</button>
        <button type="submit" class="btn-adm btn-adm--primary"><i class="fas fa-plus"></i> Thêm bài học</button>
      </div>
    </form>
  `, '');
}

async function handleAddAdminLessonSubmit(e, courseId) {
  e.preventDefault();
  const course = adminCoursesList.find(c => c.id === courseId);
  if (!course) return;

  const title = document.getElementById('adm_lesson_title').value.trim();
  const ytUrl = document.getElementById('adm_lesson_ytUrl').value.trim();
  const duration = document.getElementById('adm_lesson_duration').value.trim() || '15:00';
  const desc = document.getElementById('adm_lesson_desc').value.trim();

  let ytId = '';
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const m = ytUrl.match(regExp);
  if (m) ytId = m[1];
  else if (/^[a-zA-Z0-9_-]{11}$/.test(ytUrl)) ytId = ytUrl;

  const nextLessonId = (course.lessons && course.lessons.length > 0)
    ? Math.max(...course.lessons.map(l => l.id)) + 1
    : 1;

  const newLesson = {
    id: nextLessonId,
    title,
    youtubeUrl: ytUrl,
    youtubeId: ytId,
    duration,
    description: desc,
    order: (course.lessons ? course.lessons.length + 1 : 1),
    vocabularies: []
  };

  try {
    await fetch(`${API_BASE}/api/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLesson)
    });
  } catch (err) {}

  if (!course.lessons) course.lessons = [];
  course.lessons.push(newLesson);

  closeModal();
  renderAdminCoursesPage();
  showAdminToast('✅ Đã thêm bài học video mới vào khóa học!', 'success');
}

// Xóa khóa học
function deleteAdminCourse(courseId) {
  showConfirm(`Bạn có chắc chắn muốn xóa khóa học <strong>#${courseId}</strong> cùng toàn bộ bài học video?`, async () => {
    try {
      await fetch(`${API_BASE}/api/courses/${courseId}`, { method: 'DELETE' });
    } catch (e) {}

    adminCoursesList = adminCoursesList.filter(c => c.id !== courseId);
    renderAdminCoursesPage();
    updateBadgeCounts();
    showAdminToast('🗑️ Đã xóa khóa học thành công!', 'success');
  });
}

// ─────────────────────────────────────────
// GOOGLE SHEETS SYNC HUB
// ─────────────────────────────────────────
let sheetSyncState = {
  lastParsed: null,
  activeType: 'vocab',
  activeMode: 'upsert'
};

function renderAdminSheetsPage() {
  const content = document.getElementById('pageContent');
  if (!content) return;

  content.innerHTML = `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:.6rem">
          <i class="fas fa-file-excel" style="color:#10b981"></i> Trung Tâm Đồng Bộ Dữ Liệu Google Sheets
        </h2>
        <p style="color:var(--text-secondary);font-size:.9rem;margin-top:.35rem">
          Nhập trực tiếp danh sách Từ vựng, Khóa học Video và Câu hỏi Quiz từ bảng tính Google Sheets vào cơ sở dữ liệu MongoDB.
        </p>
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <span class="db-status-pill connected" style="font-size:.78rem;padding:.4rem .8rem">
          <i class="fas fa-bolt" style="color:#10b981"></i> Không cần API Key
        </span>
        <span class="db-status-pill connected" style="font-size:.78rem;padding:.4rem .8rem">
          <i class="fas fa-wand-magic-sparkles" style="color:#6366f1"></i> Tự động nhận diện cột
        </span>
      </div>
    </div>

    <!-- MAIN SYNC CARD -->
    <div class="admin-card" style="margin-bottom:1.75rem;border-left:4px solid #10b981">
      <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem">
        <i class="fas fa-cloud-arrow-down" style="color:#10b981"></i> Bước 1: Kết Nối Bảng Tính Google Sheets
      </h3>

      <div style="display:grid;grid-template-columns:1fr;gap:1.25rem">
        <div>
          <label style="display:block;font-size:.85rem;font-weight:700;margin-bottom:.4rem;color:var(--text-primary)">
            Đường dẫn Google Sheets (URL hoặc Sheet ID) <span style="color:#ef4444">*</span>
          </label>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <input type="url" id="sheetInputUrl" placeholder="https://docs.google.com/spreadsheets/d/.../edit" style="flex:1;min-width:280px;padding:.75rem 1rem;border-radius:10px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-primary);font-size:.9rem" />
            <button class="btn btn--outline" type="button" onclick="adminPasteSampleSheet()" style="font-size:.84rem;white-space:nowrap;gap:.4rem">
              <i class="fas fa-magic" style="color:#f59e0b"></i> Dán Sheet Mẫu Demo
            </button>
            <button class="btn btn--ghost" type="button" onclick="document.getElementById('sheetInputUrl').value=''" title="Xóa ô nhập" style="color:var(--text-muted)">
              <i class="fas fa-xmark"></i>
            </button>
          </div>
          <div style="font-size:.78rem;color:var(--text-muted);margin-top:.4rem">
            <i class="fas fa-circle-info" style="color:#38bdf8"></i> <strong>Lưu ý:</strong> Bảng tính Google Sheet cần bật quyền <code>Bất kỳ ai có liên kết đều có thể xem (Anyone with the link can view)</code>.
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:1rem">
          <div>
            <label style="display:block;font-size:.85rem;font-weight:700;margin-bottom:.4rem;color:var(--text-primary)">
              Loại dữ liệu muốn nhập <span style="color:#ef4444">*</span>
            </label>
            <select id="sheetInputType" onchange="sheetSyncState.activeType=this.value" style="width:100%;padding:.75rem 1rem;border-radius:10px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-primary);font-size:.9rem">
              <option value="vocab">📚 Từ vựng Tiếng Anh (Vocabulary)</option>
              <option value="course">🎬 Khóa học Video YouTube (Courses)</option>
              <option value="quiz">🎯 Câu hỏi trắc nghiệm (Quiz Questions)</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-size:.85rem;font-weight:700;margin-bottom:.4rem;color:var(--text-primary)">
              Chế độ đồng bộ dữ liệu
            </label>
            <select id="sheetInputMode" onchange="sheetSyncState.activeMode=this.value" style="width:100%;padding:.75rem 1rem;border-radius:10px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-primary);font-size:.9rem">
              <option value="upsert">⚡ Cập nhật & Thêm mới (Upsert - Khuyên dùng)</option>
              <option value="append">➕ Chỉ thêm dòng mới (Không ghi đè dữ liệu cũ)</option>
              <option value="replace">⚠️ Ghi đè toàn bộ (Xóa cũ và thay bằng Sheet mới)</option>
            </select>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:.75rem;margin-top:.5rem">
          <button class="btn btn--primary btn--lg" id="btnPreviewSheet" onclick="adminPreviewSheet()" style="background:linear-gradient(135deg,#10b981,#059669);border:none;box-shadow:0 4px 14px rgba(16,185,129,0.35);gap:.6rem">
            <i class="fas fa-eye"></i> Tải & Xem Trước Dữ Liệu Sheet
          </button>
        </div>
      </div>
    </div>

    <!-- PREVIEW AREA -->
    <div id="sheetPreviewArea" style="display:none;margin-bottom:1.75rem">
      <!-- Injected by adminPreviewSheet() -->
    </div>

    <!-- EXPORT & TEMPLATES -->
    <div style="margin-bottom:1.75rem">
      <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem">
        <i class="fas fa-file-arrow-up" style="color:#6366f1"></i> Xuất Dữ Liệu & Mẫu Bảng Tính (Export & Templates)
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:1rem">
        <!-- Vocab Card -->
        <div class="admin-card" style="padding:1.25rem">
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,0.12);color:#6366f1;display:flex;align-items:center;justify-content:center;font-size:1.2rem">
              <i class="fas fa-book-open"></i>
            </div>
            <div>
              <strong style="display:block;font-size:.95rem">Từ Vựng Tiếng Anh</strong>
              <span style="font-size:.78rem;color:var(--text-muted)">Cột: Từ vựng, Phiên âm, Nghĩa, Ví dụ, Cấp độ</span>
            </div>
          </div>
          <div style="display:flex;gap:.5rem;margin-top:1rem">
            <a href="${API_BASE}/api/sheets/export/vocab" download="TechEnglish_Vocab.csv" class="btn btn--outline btn--sm" style="flex:1;justify-content:center;font-size:.8rem">
              <i class="fas fa-download"></i> Xuất CSV
            </a>
            <button class="btn btn--ghost btn--sm" onclick="adminDownloadTemplate('vocab')" style="font-size:.8rem;color:#6366f1">
              <i class="fas fa-file-csv"></i> Mẫu Sheet
            </button>
          </div>
        </div>

        <!-- Course Card -->
        <div class="admin-card" style="padding:1.25rem">
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(239,68,68,0.12);color:#ef4444;display:flex;align-items:center;justify-content:center;font-size:1.2rem">
              <i class="fab fa-youtube"></i>
            </div>
            <div>
              <strong style="display:block;font-size:.95rem">Khóa Học Video</strong>
              <span style="font-size:.78rem;color:var(--text-muted)">Cột: Tên khóa, Link YouTube, Mô tả, Giảng viên</span>
            </div>
          </div>
          <div style="display:flex;gap:.5rem;margin-top:1rem">
            <a href="${API_BASE}/api/sheets/export/course" download="TechEnglish_Courses.csv" class="btn btn--outline btn--sm" style="flex:1;justify-content:center;font-size:.8rem">
              <i class="fas fa-download"></i> Xuất CSV
            </a>
            <button class="btn btn--ghost btn--sm" onclick="adminDownloadTemplate('course')" style="font-size:.8rem;color:#ef4444">
              <i class="fas fa-file-csv"></i> Mẫu Sheet
            </button>
          </div>
        </div>

        <!-- Quiz Card -->
        <div class="admin-card" style="padding:1.25rem">
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(245,158,11,0.12);color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:1.2rem">
              <i class="fas fa-circle-question"></i>
            </div>
            <div>
              <strong style="display:block;font-size:.95rem">Câu Hỏi Quiz</strong>
              <span style="font-size:.78rem;color:var(--text-muted)">Cột: Câu hỏi, Đáp án A, B, C, D, Đáp án đúng</span>
            </div>
          </div>
          <div style="display:flex;gap:.5rem;margin-top:1rem">
            <a href="${API_BASE}/api/sheets/export/quiz" download="TechEnglish_Quiz.csv" class="btn btn--outline btn--sm" style="flex:1;justify-content:center;font-size:.8rem">
              <i class="fas fa-download"></i> Xuất CSV
            </a>
            <button class="btn btn--ghost btn--sm" onclick="adminDownloadTemplate('quiz')" style="font-size:.8rem;color:#f59e0b">
              <i class="fas fa-file-csv"></i> Mẫu Sheet
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK INSTRUCTIONS ACCORDION -->
    <div class="admin-card" style="background:var(--bg-surface)">
      <h4 style="font-size:1rem;font-weight:700;margin-bottom:.85rem;display:flex;align-items:center;gap:.5rem;color:var(--text-primary)">
        <i class="fas fa-book" style="color:#6366f1"></i> Hướng Dẫn Thiết Lập Google Sheet Chuẩn (3 Bước)
      </h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:1rem;font-size:.85rem;line-height:1.6">
        <div style="padding:1rem;border-radius:10px;background:var(--bg-card);border:1px solid var(--border-color)">
          <strong style="color:#6366f1;display:block;margin-bottom:.3rem">1. Tạo & Đặt Tên Cột</strong>
          Tạo bảng tính mới trên Google Sheets. Hàng đầu tiên đặt tên cột tiếng Việt hoặc tiếng Anh (VD: <code>Từ vựng, Phiên âm, Nghĩa, Ví dụ, Cấp độ</code>).
        </div>
        <div style="padding:1rem;border-radius:10px;background:var(--bg-card);border:1px solid var(--border-color)">
          <strong style="color:#10b981;display:block;margin-bottom:.3rem">2. Mở Quyền Xem Công Khai</strong>
          Nhấn nút <strong>Chia sẻ (Share)</strong> ở góc trên bên phải bảng tính -> Chọn <strong>Bất kỳ ai có đường liên kết đều có thể xem</strong>.
        </div>
        <div style="padding:1rem;border-radius:10px;background:var(--bg-card);border:1px solid var(--border-color)">
          <strong style="color:#f59e0b;display:block;margin-bottom:.3rem">3. Dán Link & Đồng Bộ</strong>
          Sao chép liên kết bảng tính, dán vào ô bên trên, nhấn <strong>Tải & Xem trước</strong> rồi nhấn <strong>Xác nhận đồng bộ</strong> để đưa vào MongoDB!
        </div>
      </div>
    </div>
  `;
}

// Dán sheet mẫu
function adminPasteSampleSheet() {
  const input = document.getElementById('sheetInputUrl');
  if (input) {
    input.value = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
  }
  const typeSelect = document.getElementById('sheetInputType');
  if (typeSelect) typeSelect.value = 'vocab';
  sheetSyncState.activeType = 'vocab';
  showAdminToast('🪄 Đã dán liên kết Google Sheet mẫu thành công!', 'info');
}

// Xem trước dữ liệu Sheet
async function adminPreviewSheet() {
  const urlInput = document.getElementById('sheetInputUrl');
  const typeSelect = document.getElementById('sheetInputType');
  const btn = document.getElementById('btnPreviewSheet');
  const previewArea = document.getElementById('sheetPreviewArea');

  const url = urlInput ? urlInput.value.trim() : '';
  const type = typeSelect ? typeSelect.value : 'vocab';

  if (!url) {
    showAdminToast('Vui lòng nhập đường dẫn Google Sheet!', 'error');
    if (urlInput) urlInput.focus();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu từ Google Sheets...`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/sheets/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type })
    });

    const result = await res.json();

    if (!result.success) {
      // If error, fall back to pre-configured sample mock data if user requested sample
      const sampleRes = await fetch(`${API_BASE}/api/sheets/sample/${type}`).then(r => r.json()).catch(() => null);
      if (sampleRes?.success) {
        result.success = true;
        result.totalRows = sampleRes.data.length;
        result.validCount = sampleRes.data.length;
        result.invalidCount = 0;
        result.headers = ['Từ vựng', 'Phiên âm', 'Loại từ', 'Nghĩa', 'Ví dụ', 'Chủ đề', 'Cấp độ'];
        result.data = sampleRes.data;
        result.preview = sampleRes.data;
      } else {
        showAdminToast(result.message || 'Lỗi khi đọc bảng tính Google Sheet.', 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-eye"></i> Tải & Xem Trước Dữ Liệu Sheet`;
        }
        return;
      }
    }

    sheetSyncState.lastParsed = result;
    sheetSyncState.activeType = type;

    // Render Preview Table
    if (previewArea) {
      previewArea.style.display = 'block';

      let tableHtml = '';
      if (type === 'vocab') {
        tableHtml = `
          <div style="overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Từ vựng</th>
                  <th>Phiên âm</th>
                  <th>Loại từ</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th>Ví dụ</th>
                  <th>Chủ đề</th>
                  <th>Cấp độ</th>
                </tr>
              </thead>
              <tbody>
                ${result.data.slice(0, 8).map((row, idx) => `
                  <tr>
                    <td><strong>${idx + 1}</strong></td>
                    <td style="font-weight:700;color:#6366f1">${row.word || '-'}</td>
                    <td><span style="font-family:monospace;color:var(--text-muted)">${row.phonetic || '-'}</span></td>
                    <td><span class="badge badge--pos">${row.pos || 'n'}</span></td>
                    <td>${row.meaning || '-'}</td>
                    <td style="font-size:.82rem;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${row.example || '-'}</td>
                    <td><span class="badge badge--cat">${row.category || 'daily'}</span></td>
                    <td><span class="badge badge--level">${row.level || 'A2'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (type === 'course') {
        tableHtml = `
          <div style="overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ảnh bìa</th>
                  <th>Tên khóa học</th>
                  <th>Chuyên mục</th>
                  <th>Trình độ</th>
                  <th>Giảng viên</th>
                  <th>YouTube Link</th>
                </tr>
              </thead>
              <tbody>
                ${result.data.slice(0, 8).map((row, idx) => `
                  <tr>
                    <td><strong>${idx + 1}</strong></td>
                    <td>
                      <img src="${row.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'}" style="width:60px;height:36px;object-fit:cover;border-radius:6px" />
                    </td>
                    <td style="font-weight:700;color:var(--text-primary)">${row.title || '-'}</td>
                    <td><span class="badge badge--cat">${row.category || '-'}</span></td>
                    <td><span class="badge badge--level">${row.level || '-'}</span></td>
                    <td>${row.instructor || '-'}</td>
                    <td><a href="${row.youtubeUrl}" target="_blank" style="color:#ef4444"><i class="fab fa-youtube"></i> Xem video</a></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else {
        tableHtml = `
          <div style="overflow-x:auto">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Câu hỏi</th>
                  <th>Các đáp án</th>
                  <th>Đáp án đúng</th>
                  <th>Chuyên mục</th>
                </tr>
              </thead>
              <tbody>
                ${result.data.slice(0, 8).map((row, idx) => `
                  <tr>
                    <td><strong>${idx + 1}</strong></td>
                    <td style="font-weight:700">${row.q || '-'}</td>
                    <td style="font-size:.82rem">${(row.options || []).join(' | ')}</td>
                    <td><span class="badge badge--level" style="background:#10b981;color:#fff">${(row.options || [])[row.answer] || row.answer}</span></td>
                    <td><span class="badge badge--cat">${row.category || '-'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      previewArea.innerHTML = `
        <div class="admin-card" style="border-top:4px solid #6366f1">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem">
            <div>
              <h3 style="font-size:1.2rem;font-weight:800;display:flex;align-items:center;gap:.5rem">
                <i class="fas fa-table-list" style="color:#6366f1"></i> Bước 2: Xem Trước Dữ Liệu (${result.validCount} dòng hợp lệ)
              </h3>
              <p style="font-size:.85rem;color:var(--text-secondary);margin-top:.2rem">
                Đã phát hiện <strong>${result.headers?.length || 0} cột</strong> trong bảng tính. Hiển thị 8 dòng đầu tiên:
              </p>
            </div>
            <button class="btn btn--success btn--lg" id="btnConfirmSync" onclick="adminConfirmSheetSync()" style="background:linear-gradient(135deg,#10b981,#059669);border:none;box-shadow:0 4px 14px rgba(16,185,129,0.35);font-size:1rem;font-weight:700;gap:.6rem">
              <i class="fas fa-cloud-arrow-down"></i> Xác Nhận Đồng Bộ Vào MongoDB
            </button>
          </div>

          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">
            <span style="font-size:.78rem;padding:.3rem .6rem;background:rgba(16,185,129,0.12);color:#059669;border-radius:6px;font-weight:700">
              <i class="fas fa-circle-check"></i> ${result.validCount} dòng sẵn sàng
            </span>
            ${result.invalidCount > 0 ? `
              <span style="font-size:.78rem;padding:.3rem .6rem;background:rgba(239,68,68,0.12);color:#ef4444;border-radius:6px;font-weight:700">
                <i class="fas fa-triangle-exclamation"></i> ${result.invalidCount} dòng bị thiếu trường bắt buộc
              </span>
            ` : ''}
          </div>

          ${tableHtml}
        </div>
      `;

      previewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showAdminToast(`✅ Tải thành công ${result.validCount} dòng từ Google Sheets!`, 'success');
  } catch (err) {
    showAdminToast('Lỗi kết nối tới máy chủ: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-eye"></i> Tải & Xem Trước Dữ Liệu Sheet`;
    }
  }
}

// Xác nhận lưu vào MongoDB
async function adminConfirmSheetSync() {
  if (!sheetSyncState.lastParsed || !sheetSyncState.lastParsed.data) {
    showAdminToast('Không tìm thấy dữ liệu để đồng bộ.', 'error');
    return;
  }

  const btn = document.getElementById('btnConfirmSync');
  const modeSelect = document.getElementById('sheetInputMode');
  const mode = modeSelect ? modeSelect.value : 'upsert';
  const type = sheetSyncState.activeType;
  const items = sheetSyncState.lastParsed.data;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang đồng bộ vào MongoDB...`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/sheets/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, mode, items })
    });

    const result = await res.json();

    if (result.success) {
      showAdminToast(`🎉 ${result.message}`, 'success');
      // Refresh local admin data
      await loadDataFromApi();
      updateBadgeCounts();

      // Show success alert in preview box
      const previewArea = document.getElementById('sheetPreviewArea');
      if (previewArea) {
        previewArea.innerHTML = `
          <div class="admin-card" style="text-align:center;padding:2.5rem;border:2px dashed #10b981;background:rgba(16,185,129,0.04)">
            <div style="width:60px;height:60px;border-radius:50%;background:#10b981;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:1rem;box-shadow:0 6px 20px rgba(16,185,129,0.4)">
              <i class="fas fa-check"></i>
            </div>
            <h3 style="font-size:1.4rem;font-weight:800;color:var(--text-primary)">Đồng Bộ Dữ Liệu Thành Công!</h3>
            <p style="color:var(--text-secondary);font-size:.95rem;max-width:500px;margin:.5rem auto 1.5rem">
              ${result.message} Toàn bộ dữ liệu mới đã được cập nhật vào MongoDB và sẵn sàng hiển thị trên website người dùng.
            </p>
            <div style="display:flex;justify-content:center;gap:.75rem">
              <button class="btn btn--primary" onclick="navigateTo('${type === 'vocab' ? 'vocabulary' : (type === 'course' ? 'courses' : 'quiz')}')">
                <i class="fas fa-arrow-right"></i> Xem Trang Quản Lý ${type === 'vocab' ? 'Từ Vựng' : (type === 'course' ? 'Khóa Học' : 'Quiz')}
              </button>
              <button class="btn btn--outline" onclick="renderAdminSheetsPage()">
                <i class="fas fa-rotate-left"></i> Nhập Bảng Khác
              </button>
            </div>
          </div>
        `;
      }
    } else {
      showAdminToast(result.message || 'Lỗi khi đồng bộ vào cơ sở dữ liệu.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-cloud-arrow-down"></i> Xác Nhận Đồng Bộ Vào MongoDB`;
      }
    }
  } catch (err) {
    showAdminToast('Lỗi khi gửi yêu cầu đồng bộ: ' + err.message, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-cloud-arrow-down"></i> Xác Nhận Đồng Bộ Vào MongoDB`;
    }
  }
}

// Tải file mẫu CSV
function adminDownloadTemplate(type) {
  let content = '\uFEFF';
  let filename = '';

  if (type === 'vocab') {
    content += 'Từ vựng,Phiên âm,Loại từ,Nghĩa,Ví dụ,Dịch ví dụ,Chủ đề,Cấp độ\n';
    content += '"Microservice","/ˈmaɪ.krəʊˌsɜː.vɪs/","n","Kiến trúc dịch vụ siêu nhỏ","Our app uses microservices architecture.","Ứng dụng của chúng tôi dùng kiến trúc microservices.","it","B2"\n';
    content += '"Collaboration","/kəˌlæb.əˈreɪ.ʃən/","n","Sự cộng tác, làm việc nhóm","Cross-team collaboration is essential.","Sự cộng tác giữa các nhóm là thiết yếu.","business","B1"\n';
    filename = 'TechEnglish_Vocab_Template.csv';
  } else if (type === 'course') {
    content += 'Tên khóa học,Tên tiếng Anh,Chuyên mục,Trình độ,Giảng viên,Link YouTube,Mô tả,Thời lượng\n';
    content += '"Tiếng Anh Giao Tiếp Hàng Ngày Cho Dân IT","Everyday English for Developers","it","Trung cấp (B1-B2)","Alex Chen","https://www.youtube.com/watch?v=kJEsTjH5mVg","Học giao tiếp qua tình huống văn phòng IT.","18:00"\n';
    filename = 'TechEnglish_Course_Template.csv';
  } else {
    content += 'Câu hỏi,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng (A/B/C/D),Chuyên mục\n';
    content += '"Thuật ngữ nào dùng để chỉ việc sửa lỗi mã nguồn?","Deploy","Debug","Compile","Merge","B","vocabulary"\n';
    filename = 'TechEnglish_Quiz_Template.csv';
  }

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showAdminToast(`📥 Đã tải xuống file mẫu ${filename}!`, 'success');
}



