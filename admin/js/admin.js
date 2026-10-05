// =====================================================================
// ENGLISH MASTER – ADMIN JS  (admin/js/admin.js)
// =====================================================================

// ───────────── API BASE & ADMIN STATE ─────────────
const API_BASE = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

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
    const [resVocab, resGrammar, resQuiz, resMedia, resUsers] = await Promise.all([
      fetch(`${API_BASE}/api/vocab`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/grammar`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/quiz`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/media`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/users`).then(r => r.json()).catch(() => null)
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
function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const err  = document.getElementById('loginError');

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    localStorage.setItem('em_admin_session', 'true');
    document.getElementById('adminName').textContent = user;
    showAdmin();
  } else {
    err.textContent = '❌ Sai tên đăng nhập hoặc mật khẩu!';
    setTimeout(() => { err.textContent = ''; }, 3000);
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
  document.getElementById('loginScreen').style.display  = 'flex';
  document.getElementById('adminLayout').style.display  = 'none';
  adminState.loggedIn = false;
  document.getElementById('loginForm').reset();
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
  itcourses:  { label: 'Quản lý Khóa học CNTT', icon: 'fas fa-laptop-code' },
  media:      { label: 'Thư viện Media',    icon: 'fas fa-images' },
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
    itcourses:  renderITCoursesPage,
    media:      renderMediaPage,
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

function changePassword() {
  const old  = document.getElementById('s_oldPass').value;
  const nw   = document.getElementById('s_newPass').value;
  const conf = document.getElementById('s_confirmPass').value;
  if (old !== ADMIN_CREDENTIALS.password) { showAdminToast('❌ Mật khẩu hiện tại không đúng!', 'error'); return; }
  if (nw.length < 6) { showAdminToast('❌ Mật khẩu mới phải ít nhất 6 ký tự!', 'error'); return; }
  if (nw !== conf) { showAdminToast('❌ Xác nhận mật khẩu không khớp!', 'error'); return; }
  ADMIN_CREDENTIALS.password = nw;
  showAdminToast('✅ Đổi mật khẩu thành công!', 'success');
  ['s_oldPass','s_newPass','s_confirmPass'].forEach(id => document.getElementById(id).value = '');
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
  const itEl = document.getElementById('itCourseCountBadge');
  if (vEl) vEl.textContent = adminState.vocab.length;
  if (qEl) qEl.textContent = Object.values(adminState.quizData).flat().length;
  if (mEl) mEl.textContent = (adminState.mediaList || []).length;
  if (uEl) uEl.textContent = adminUsersList.length;
  if (nEl) nEl.textContent = (typeof TECH_NEWS_DATA !== 'undefined' ? TECH_NEWS_DATA.length : 6);
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

