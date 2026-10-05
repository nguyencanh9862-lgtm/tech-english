// ===================================================================
// ENGLISH MASTER – APP (app.js)
// ===================================================================

// ===== STATE =====
let state = {
  xp: parseInt(localStorage.getItem('em_xp') || '0'),
  streak: parseInt(localStorage.getItem('em_streak') || '0'),
  learnedWords: parseInt(localStorage.getItem('em_words') || '0'),
  earnedBadges: JSON.parse(localStorage.getItem('em_badges') || '[]'),
  lastSeen: localStorage.getItem('em_lastSeen') || null,
  quiz: {
    type: null,
    questions: [],
    current: 0,
    score: 0,
    correct: 0,
    timer: null,
    timeLeft: 30,
    startTime: null,
  },
  flashcard: {
    cards: [],
    index: 0,
    flipped: false,
  },
  vocab: {
    filter: 'all',
    shown: 8,
  }
};

let currentCard = {};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initCounters();
  renderVocabGrid();
  renderGrammar(0);
  renderFlashcards('all');
  renderProgressDashboard();
  renderBadges();
  initAOS();
  initStreakCheck();
  setupVocabFilter();
  setupGrammarMenu();
  setupLoadMore();
  setupFlashcardCategory();
  setupScrollTop();
  syncVocabWithBackend();
  initAuth();
  initITAcademy();
  initCodePlayground();
  initTechNews();
  syncNewsWithBackend();
  syncITCoursesWithBackend();
});

function getAppImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
  return base + img;
}

async function syncVocabWithBackend() {
  try {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    const res = await fetch(`${base}/api/vocab`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        VOCABULARY_DATA.length = 0;
        VOCABULARY_DATA.push(...data.data);
        renderVocabGrid(state.vocab.filter, state.vocab.shown);
      }
    }
  } catch (e) {
    const saved = localStorage.getItem('em_admin_vocab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          VOCABULARY_DATA.length = 0;
          VOCABULARY_DATA.push(...parsed);
          renderVocabGrid(state.vocab.filter, state.vocab.shown);
        }
      } catch (err) {}
    }
  }
}

// ===== NAVBAR =====
function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navbar = document.getElementById('navbar');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });
}

// ===== SCROLL HELPERS =====
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupScrollTop() {
  const btn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
}

// ===== COUNTER ANIMATION =====
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      let count = 0;
      const step = Math.ceil(target / 80);
      const interval = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count.toLocaleString('vi-VN');
        if (count >= target) clearInterval(interval);
      }, 20);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ===== AOS (Animate on Scroll) =====
function initAOS() {
  const aosEls = document.querySelectorAll('[data-aos]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('aos-animate'), +delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  aosEls.forEach(el => obs.observe(el));
}

// ===== VOCABULARY =====
function renderVocabGrid(filter = 'all', limit = 8) {
  const grid = document.getElementById('vocabGrid');
  const data = filter === 'all' ? VOCABULARY_DATA : VOCABULARY_DATA.filter(w => w.category === filter);
  const shown = data.slice(0, limit);

  grid.innerHTML = shown.map(w => `
    <div class="vocab-card" data-category="${w.category}" data-id="${w.id}">
      <div class="vocab-card-header">
        <span class="vocab-level level--${w.level.toLowerCase()}">${w.level}</span>
        <span class="vocab-pos">${w.pos}</span>
      </div>
      ${w.image ? `<img src="${getAppImageUrl(w.image)}" alt="${w.word}" class="vocab-card-img" onerror="this.style.display='none'" />` : ''}
      <h3 class="vocab-word">${w.word}</h3>
      <p class="vocab-phonetic">${w.phonetic}</p>
      <p class="vocab-meaning">${w.meaning}</p>
      <div class="vocab-card-footer">
        <button class="btn btn--ghost btn--xs" onclick="speakWord('${w.word}')">
          <i class="fas fa-volume-up"></i>
        </button>
        <button class="btn btn--ghost btn--xs" onclick="toggleLearnWord(${w.id}, this)">
          <i class="fas fa-bookmark"></i>
        </button>
        <button class="btn btn--ghost btn--xs" onclick="showWordDetail(${w.id})">
          Xem thêm <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Mark learned
  const learned = JSON.parse(localStorage.getItem('em_learned') || '[]');
  grid.querySelectorAll('.vocab-card').forEach(card => {
    if (learned.includes(+card.dataset.id)) card.classList.add('learned');
  });
}

function setupVocabFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.vocab.filter = btn.dataset.filter;
      state.vocab.shown = 8;
      renderVocabGrid(state.vocab.filter, state.vocab.shown);
    });
  });
}

function setupLoadMore() {
  document.getElementById('loadMoreVocab').addEventListener('click', () => {
    state.vocab.shown += 8;
    renderVocabGrid(state.vocab.filter, state.vocab.shown);
    const max = state.vocab.filter === 'all' ? VOCABULARY_DATA.length : VOCABULARY_DATA.filter(w => w.category === state.vocab.filter).length;
    if (state.vocab.shown >= max) {
      document.getElementById('loadMoreVocab').style.display = 'none';
    }
  });
}

function toggleLearnWord(id, btn) {
  let learned = JSON.parse(localStorage.getItem('em_learned') || '[]');
  if (learned.includes(id)) {
    learned = learned.filter(x => x !== id);
    btn.closest('.vocab-card').classList.remove('learned');
    showToast('Đã bỏ bookmark từ này', 'info');
  } else {
    learned.push(id);
    btn.closest('.vocab-card').classList.add('learned');
    addXP(5);
    state.learnedWords++;
    localStorage.setItem('em_words', state.learnedWords);
    renderProgressDashboard();
    showToast('✅ Đã lưu từ! +5 XP', 'success');
  }
  localStorage.setItem('em_learned', JSON.stringify(learned));
  syncProgressToBackend();
}

function showWordDetail(id) {
  const word = VOCABULARY_DATA.find(w => w.id === id);
  if (!word) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
        <i class="fas fa-times"></i>
      </button>
      ${word.image ? `
        <div style="text-align:center;margin-bottom:1rem">
          <img src="${getAppImageUrl(word.image)}" alt="${word.word}" class="modal-word-img" />
        </div>
      ` : ''}
      <div class="modal-word-header">
        <h2>${word.word}</h2>
        <p class="vocab-phonetic">${word.phonetic}</p>
        <span class="vocab-pos">${word.pos}</span>
        <button class="btn btn--ghost btn--sm" onclick="speakWord('${word.word}')">
          <i class="fas fa-volume-up"></i> Nghe
        </button>
      </div>
      <div class="modal-word-body">
        <div class="modal-section">
          <h4><i class="fas fa-language"></i> Nghĩa</h4>
          <p>${word.meaning}</p>
        </div>
        <div class="modal-section">
          <h4><i class="fas fa-quote-left"></i> Ví dụ</h4>
          <p class="example-en">${word.example}</p>
          <p class="example-vi">${word.exampleVi}</p>
        </div>
        <div class="modal-section">
          <span class="vocab-level level--${word.level.toLowerCase()}">${word.level}</span>
          <span class="category-tag">${getCategoryLabel(word.category)}</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function getCategoryLabel(cat) {
  const labels = { daily: '🏠 Hàng ngày', business: '💼 Kinh doanh', travel: '✈️ Du lịch', academic: '🎓 Học thuật', idiom: '💬 Thành ngữ' };
  return labels[cat] || cat;
}

// ===== GRAMMAR =====
function renderGrammar(index) {
  const lesson = GRAMMAR_LESSONS[index];
  const content = document.getElementById('grammarContent');
  content.innerHTML = `
    <div class="grammar-lesson" data-aos="fade-left">
      <div class="lesson-header" style="border-color:${lesson.color}">
        <h3 style="color:${lesson.color}">${lesson.title}</h3>
        <div class="formula-box" style="background:${lesson.color}20; border-color:${lesson.color}40">
          <code>${lesson.formula}</code>
        </div>
      </div>
      <p class="lesson-desc">${lesson.description}</p>
      
      <div class="lesson-uses">
        <h4><i class="fas fa-lightbulb" style="color:#f59e0b"></i> Cách dùng</h4>
        <ul>${lesson.uses.map(u => `<li>${u}</li>`).join('')}</ul>
      </div>

      <div class="lesson-examples">
        <h4><i class="fas fa-comment-dots" style="color:${lesson.color}"></i> Ví dụ</h4>
        <div class="examples-list">
          ${lesson.examples.map(ex => `
            <div class="example-item">
              <div class="example-en">
                <button class="speak-btn" onclick="speakWord('${ex.en.replace(/'/g, "\\'")}')">
                  <i class="fas fa-volume-up"></i>
                </button>
                <span>${ex.en}</span>
              </div>
              <div class="example-vi">${ex.vi}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="lesson-signals">
        <h4><i class="fas fa-tag" style="color:#6366f1"></i> Dấu hiệu nhận biết</h4>
        <div class="signals-wrap">
          ${lesson.signals.map(s => `<span class="signal-tag">${s}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
  initAOS();
}

function setupGrammarMenu() {
  document.querySelectorAll('.grammar-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.grammar-menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderGrammar(+item.dataset.lesson);
    });
  });
}

// ===== QUIZ =====
function startQuiz(type) {
  const questions = [...QUIZ_DATA[type]].sort(() => Math.random() - 0.5).slice(0, 10);
  state.quiz = { type, questions, current: 0, score: 0, correct: 0, timer: null, timeLeft: 30, startTime: Date.now() };

  document.getElementById('quizStart').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizGame').style.display = 'block';
  document.getElementById('quizTypeLabel').textContent = getQuizTypeLabel(type);

  renderQuestion();
}

function getQuizTypeLabel(type) {
  const labels = {
    vocabulary: '📖 Từ vựng',
    grammar: '✏️ Ngữ pháp',
    listening: '🎧 Nghe hiểu',
    mixed: '🔀 Tổng hợp',
    it: '💻 CNTT & IT English'
  };
  return labels[type] || type;
}

function renderQuestion() {
  const { questions, current } = state.quiz;
  const q = questions[current];
  const total = questions.length;

  document.getElementById('quizProgress').textContent = `Câu ${current + 1} / ${total}`;
  document.getElementById('quizProgressFill').style.width = `${(current / total) * 100}%`;
  document.getElementById('questionText').textContent = q.q;
  document.getElementById('liveScore').textContent = state.quiz.score;

  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = q.options.map((opt, i) => `
    <button class="option-btn" onclick="selectAnswer(${i})">${opt}</button>
  `).join('');

  // Listening auto-play
  if (q.audio) setTimeout(() => speakWord(q.audio), 300);

  startTimer();
}

function startTimer() {
  clearInterval(state.quiz.timer);
  state.quiz.timeLeft = 30;
  updateTimer();
  state.quiz.timer = setInterval(() => {
    state.quiz.timeLeft--;
    updateTimer();
    if (state.quiz.timeLeft <= 0) {
      clearInterval(state.quiz.timer);
      timeUp();
    }
  }, 1000);
}

function updateTimer() {
  const display = document.getElementById('timerDisplay');
  display.textContent = state.quiz.timeLeft;
  display.style.color = state.quiz.timeLeft <= 10 ? '#ef4444' : '';
  display.style.fontWeight = state.quiz.timeLeft <= 10 ? '900' : '';
}

function timeUp() {
  markOptions(state.quiz.questions[state.quiz.current].answer, -1);
  setTimeout(nextQuestion, 1500);
}

function selectAnswer(selected) {
  clearInterval(state.quiz.timer);
  const correct = state.quiz.questions[state.quiz.current].answer;
  const isCorrect = selected === correct;

  if (isCorrect) {
    const bonus = Math.ceil(state.quiz.timeLeft / 3);
    state.quiz.score += 10 + bonus;
    state.quiz.correct++;
  }

  document.getElementById('liveScore').textContent = state.quiz.score;
  markOptions(correct, selected);
  setTimeout(nextQuestion, 1200);
}

function markOptions(correct, selected) {
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    else if (i === selected && i !== correct) btn.classList.add('wrong');
  });
}

function nextQuestion() {
  state.quiz.current++;
  if (state.quiz.current >= state.quiz.questions.length) {
    endQuiz();
  } else {
    renderQuestion();
  }
}

function endQuiz() {
  const elapsed = Math.round((Date.now() - state.quiz.startTime) / 1000);
  const { score, correct, questions } = state.quiz;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);

  document.getElementById('quizGame').style.display = 'none';
  document.getElementById('quizResult').style.display = 'flex';

  const icon = pct === 100 ? '🏆' : pct >= 70 ? '🎉' : pct >= 40 ? '👍' : '📚';
  const title = pct === 100 ? 'Xuất sắc!' : pct >= 70 ? 'Tốt lắm!' : pct >= 40 ? 'Cố gắng hơn!' : 'Hãy ôn tập thêm!';
  const msg = pct === 100 ? 'Bạn đã trả lời đúng tất cả câu hỏi!' : `Bạn đúng ${correct}/${total} câu. Tiếp tục cố gắng!`;

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultMessage').textContent = msg;
  document.getElementById('resultScore').textContent = score;
  document.getElementById('resultCorrect').textContent = `${correct}/${total}`;
  document.getElementById('resultTime').textContent = `${elapsed}s`;

  // XP & badges
  addXP(score);
  checkBadges(pct, elapsed, correct);
  renderProgressDashboard();
}

function retryQuiz() {
  startQuiz(state.quiz.type);
}

function resetQuiz() {
  document.getElementById('quizGame').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizStart').style.display = 'flex';
}

// ===== FLASHCARDS =====
function renderFlashcards(cat) {
  let cards = cat === 'all' ? VOCABULARY_DATA : VOCABULARY_DATA.filter(w => w.category === cat);
  state.flashcard.cards = cards;
  state.flashcard.index = 0;
  state.flashcard.flipped = false;
  showFlashcard();
}

function showFlashcard() {
  const { cards, index } = state.flashcard;
  if (!cards.length) return;
  const card = cards[index];
  currentCard = card;
  document.getElementById('fcCategory').textContent = getCategoryLabel(card.category);
  document.getElementById('fcWord').textContent = card.word;
  document.getElementById('fcPhonetic').textContent = card.phonetic;
  document.getElementById('fcPos').textContent = card.pos.toUpperCase();
  document.getElementById('fcMeaning').textContent = card.meaning;
  document.getElementById('fcExample').textContent = `"${card.example}"`;
  document.getElementById('fcExampleVi').textContent = card.exampleVi;
  document.getElementById('fcCurrent').textContent = index + 1;
  document.getElementById('fcTotal').textContent = cards.length;

  // Reset flip
  state.flashcard.flipped = false;
  document.getElementById('flashcardInner').classList.remove('flipped');

  document.getElementById('fcPrev').disabled = index === 0;
  document.getElementById('fcNext').disabled = index === cards.length - 1;
}

function flipCard() {
  state.flashcard.flipped = !state.flashcard.flipped;
  document.getElementById('flashcardInner').classList.toggle('flipped', state.flashcard.flipped);
}

function nextCard() {
  if (state.flashcard.index < state.flashcard.cards.length - 1) {
    state.flashcard.index++;
    showFlashcard();
  }
}

function prevCard() {
  if (state.flashcard.index > 0) {
    state.flashcard.index--;
    showFlashcard();
  }
}

function shuffleFlashcards() {
  state.flashcard.cards = [...state.flashcard.cards].sort(() => Math.random() - 0.5);
  state.flashcard.index = 0;
  showFlashcard();
  showToast('🔀 Đã trộn bài!', 'info');
}

function markCard(difficulty) {
  const msgs = { easy: '✅ Tốt! +10 XP', medium: '👍 Bình thường +5 XP', hard: '📚 Hãy ôn lại từ này' };
  const xps = { easy: 10, medium: 5, hard: 0 };
  showToast(msgs[difficulty], difficulty === 'hard' ? 'warning' : 'success');
  addXP(xps[difficulty]);
  renderProgressDashboard();
  if (state.flashcard.index < state.flashcard.cards.length - 1) {
    setTimeout(nextCard, 300);
  }
}

function setupFlashcardCategory() {
  document.getElementById('flashcardCategory').addEventListener('change', e => {
    renderFlashcards(e.target.value);
  });
}

// ===== PROGRESS =====
function renderProgressDashboard() {
  // Words
  const learnedWords = state.learnedWords;
  document.getElementById('learnedWords').textContent = learnedWords;
  const wPct = Math.min((learnedWords / 100) * 100, 100);
  document.getElementById('wordProgress').style.width = wPct + '%';
  document.getElementById('wordProgressText').textContent = `${learnedWords} / 100 từ hôm nay`;

  // Streak
  document.getElementById('streakDays').textContent = state.streak;
  const flames = document.getElementById('streakFlames');
  flames.innerHTML = Array.from({ length: Math.min(state.streak, 7) }, () => '<i class="fas fa-fire" style="color:#f59e0b"></i>').join('');

  // XP
  const xp = state.xp;
  document.getElementById('xpPoints').textContent = xp;
  const xpPct = Math.min((xp % 500) / 500 * 100, 100);
  document.getElementById('xpProgress').style.width = xpPct + '%';
  document.getElementById('xpProgressText').textContent = `${xp % 500} / 500 XP lên cấp`;

  renderBadges();
}

// ===== BADGES =====
function renderBadges() {
  const grid = document.getElementById('badgesGrid');
  if (!grid) return;
  grid.innerHTML = BADGES.map(b => {
    const earned = state.earnedBadges.includes(b.id);
    return `
      <div class="badge-item ${earned ? 'earned' : 'locked'}" title="${b.name}: ${b.desc}">
        <span>${earned ? b.icon : '🔒'}</span>
        <small>${b.name}</small>
      </div>
    `;
  }).join('');
}

function checkBadges(pct, elapsed, correct) {
  const toAdd = [];
  if (!state.earnedBadges.includes('first_quiz')) toAdd.push('first_quiz');
  if (pct === 100 && !state.earnedBadges.includes('perfect_score')) toAdd.push('perfect_score');
  if (elapsed < 60 && !state.earnedBadges.includes('speed_demon')) toAdd.push('speed_demon');

  toAdd.forEach(id => {
    state.earnedBadges.push(id);
    const badge = BADGES.find(b => b.id === id);
    showToast(`🏅 Huy hiệu mới: ${badge.icon} ${badge.name}!`, 'success');
  });
  localStorage.setItem('em_badges', JSON.stringify(state.earnedBadges));
  renderBadges();
  syncProgressToBackend();
}

// ===== XP SYSTEM =====
function addXP(amount) {
  state.xp += amount;
  localStorage.setItem('em_xp', state.xp);
  syncProgressToBackend();
}

// ===== STREAK =====
function initStreakCheck() {
  const today = new Date().toDateString();
  const last = state.lastSeen;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (last === today) return;
  if (last === yesterday) {
    state.streak++;
  } else if (last && last !== today) {
    state.streak = 1;
  } else {
    state.streak = 1;
  }
  state.lastSeen = today;
  localStorage.setItem('em_streak', state.streak);
  localStorage.setItem('em_lastSeen', today);
  if (state.streak > 1) showToast(`🔥 Chuỗi ${state.streak} ngày! Tuyệt vời!`, 'success');
  renderProgressDashboard();
}

// ===== TEXT TO SPEECH =====
function speakWord(text) {
  if (!window.speechSynthesis) { showToast('Trình duyệt không hỗ trợ phát âm', 'warning'); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.85;
  utt.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en-') && !v.name.includes('Google'));
  if (enVoice) utt.voice = enVoice;

  window.speechSynthesis.speak(utt);
}

window.speechSynthesis?.addEventListener?.('voiceschanged', () => {});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

// ===== CONTACT FORM =====
function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value;
  const fb = document.getElementById('formFeedback');
  fb.className = 'form-feedback success';
  fb.textContent = `Cảm ơn ${name}! Chúng tôi sẽ phản hồi bạn sớm nhất.`;
  e.target.reset();
  setTimeout(() => { fb.textContent = ''; fb.className = 'form-feedback'; }, 5000);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextCard();
  if (e.key === 'ArrowLeft') prevCard();
  if (e.key === ' ' && document.getElementById('flashcard')) {
    e.preventDefault();
    flipCard();
  }
});

// ===================================================================
// USER AUTHENTICATION & GOOGLE LOGIN & SYNC
// ===================================================================
let currentUser = null;
let currentAuthTab = 'login';

function initAuth() {
  const token = localStorage.getItem('em_auth_token');
  const storedUser = localStorage.getItem('em_user');

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      renderNavAuth();
    } catch (e) {}
  }

  if (token) {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    fetch(`${base}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.user) {
        currentUser = data.user;
        localStorage.setItem('em_user', JSON.stringify(currentUser));
        if (currentUser.xp !== undefined && currentUser.xp > state.xp) {
          state.xp = currentUser.xp;
          localStorage.setItem('em_xp', state.xp);
        }
        if (currentUser.streak !== undefined && currentUser.streak > state.streak) {
          state.streak = currentUser.streak;
          localStorage.setItem('em_streak', state.streak);
        }
        if (currentUser.earnedBadges && currentUser.earnedBadges.length > state.earnedBadges.length) {
          state.earnedBadges = currentUser.earnedBadges;
          localStorage.setItem('em_badges', JSON.stringify(state.earnedBadges));
        }
        renderProgressDashboard();
        renderNavAuth();
      } else {
        currentUser = null;
        localStorage.removeItem('em_auth_token');
        localStorage.removeItem('em_user');
        renderNavAuth();
      }
    })
    .catch(() => {});
  } else {
    renderNavAuth();
  }

  initGoogleClient();
}

async function initGoogleClient() {
  try {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    const res = await fetch(`${base}/api/auth/config`);
    const cfg = await res.json();
    if (cfg && cfg.googleClientId && window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: handleGoogleCredentialResponse
      });
      const gEl = document.querySelector('.g_id_signin');
      if (gEl) {
        window.google.accounts.id.renderButton(gEl, {
          theme: 'outline',
          size: 'large',
          text: 'sign_in_with',
          shape: 'rectangular'
        });
      }
    }
  } catch (err) {}
}

function renderNavAuth() {
  const container = document.getElementById('navAuthContainer');
  if (!container) return;

  if (currentUser) {
    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=6366f1&color=fff';
    const avatarUrl = currentUser.avatar || defaultAvatar;

    container.innerHTML = `
      <div class="user-nav-profile" id="userNavProfile" onclick="toggleUserDropdown(event)">
        <img src="${avatarUrl}" class="user-nav-avatar" alt="${currentUser.name}" onerror="this.src='${defaultAvatar}'" />
        <span class="user-nav-name">${currentUser.name}</span>
        <i class="fas fa-chevron-down" style="font-size:.7rem;color:#94a3b8"></i>

        <div class="user-dropdown-menu" id="userDropdownMenu">
          <div class="user-dropdown-header">
            <strong>${currentUser.name}</strong>
            <span>${currentUser.email}</span>
          </div>
          <div class="user-dropdown-stats">
            <span><i class="fas fa-bolt"></i> ${state.xp} XP</span>
            <span><i class="fas fa-fire"></i> ${state.streak} ngày</span>
          </div>
          <a href="#progress" onclick="scrollToSection('progress')">
            <i class="fas fa-chart-line"></i> Tiến độ học tập
          </a>
          <a href="#vocabulary" onclick="scrollToSection('vocabulary')">
            <i class="fas fa-bookmark"></i> Đã lưu (${JSON.parse(localStorage.getItem('em_learned')||'[]').length} từ)
          </a>
          ${currentUser.role === 'admin' ? `
            <a href="admin/index.html" style="color:#6366f1;font-weight:700">
              <i class="fas fa-shield-halved"></i> Quản trị Admin
            </a>
          ` : `
            <a href="admin/index.html">
              <i class="fas fa-shield-halved"></i> Trang Admin
            </a>
          `}
          <button type="button" class="logout-btn" onclick="handleUserLogout(event)">
            <i class="fas fa-sign-out-alt"></i> Đăng xuất
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn--google-nav" onclick="openAuthModal()" id="btnNavLogin">
        <i class="fab fa-google"></i> Đăng nhập
      </button>
      <a href="admin/index.html" class="btn btn--outline nav-cta" style="font-size:.85rem;padding:.55rem 1.1rem">
        <i class="fas fa-shield-halved"></i> Admin
      </a>
    `;
  }
}

function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('userDropdownMenu');
  if (menu) menu.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  const profile = document.getElementById('userNavProfile');
  const menu = document.getElementById('userDropdownMenu');
  if (menu && menu.classList.contains('show')) {
    if (!profile || !profile.contains(e.target)) {
      menu.classList.remove('show');
    }
  }
});

function openAuthModal() {
  const m = document.getElementById('authModal');
  if (m) m.style.display = 'flex';
}

function closeAuthModal() {
  const m = document.getElementById('authModal');
  if (m) m.style.display = 'none';
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const groupName = document.getElementById('groupName');
  const submitBtn = document.getElementById('authSubmitBtn');
  const title = document.getElementById('authModalTitle');

  if (tab === 'register') {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    groupName.style.display = 'flex';
    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng ký tài khoản';
    title.textContent = 'Tạo tài khoản mới';
  } else {
    tabRegister.classList.remove('active');
    tabLogin.classList.add('active');
    groupName.style.display = 'none';
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
    title.textContent = 'Đăng nhập tài khoản';
  }
  const err = document.getElementById('authError');
  if (err) err.textContent = '';
}

async function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  showToast('Đang xác thực tài khoản Google...', 'info');

  const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
  try {
    const res = await fetch(`${base}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (data.success && data.user) {
      applyLoginSuccess(data);
    } else {
      showToast(data.message || 'Đăng nhập Google thất bại', 'error');
    }
  } catch (err) {
    showToast('Lỗi kết nối tới máy chủ: ' + err.message, 'error');
  }
}

function triggerGoogleLogin() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        quickDemoLogin();
      }
    });
  } else {
    quickDemoLogin();
  }
}

async function quickDemoLogin() {
  const email = prompt('Nhập địa chỉ Gmail để đăng nhập:', 'student@gmail.com');
  if (!email) return;
  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  showToast('Đang đăng nhập bằng tài khoản Google...', 'info');
  const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';

  try {
    const res = await fetch(`${base}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          name,
          email,
          picture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=ea4335&color=fff',
          sub: 'google-' + Math.random().toString(36).substring(2, 10)
        }
      })
    });
    const data = await res.json();
    if (data.success && data.user) {
      applyLoginSuccess(data);
    } else {
      showToast(data.message || 'Lỗi đăng nhập', 'error');
    }
  } catch (err) {
    showToast('Lỗi máy chủ: ' + err.message, 'error');
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('authName')?.value.trim();
  const errEl = document.getElementById('authError');
  errEl.textContent = '';

  const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
  const endpoint = currentAuthTab === 'register' ? `${base}/api/auth/register` : `${base}/api/auth/login`;
  const payload = currentAuthTab === 'register' ? { name, email, password } : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success && data.user) {
      applyLoginSuccess(data);
    } else {
      errEl.textContent = data.message || 'Đăng nhập không thành công';
    }
  } catch (err) {
    errEl.textContent = 'Không thể kết nối đến server: ' + err.message;
  }
}

function applyLoginSuccess(data) {
  currentUser = data.user;
  localStorage.setItem('em_auth_token', data.token);
  localStorage.setItem('em_user', JSON.stringify(currentUser));

  if (currentUser.xp !== undefined && currentUser.xp > state.xp) {
    state.xp = currentUser.xp;
    localStorage.setItem('em_xp', state.xp);
  } else {
    syncProgressToBackend();
  }

  renderProgressDashboard();
  renderNavAuth();
  closeAuthModal();
  showToast(`🎉 Xin chào, ${currentUser.name}! Tiến độ đã đồng bộ trên MongoDB.`, 'success');
}

function handleUserLogout(e) {
  if (e) e.stopPropagation();
  currentUser = null;
  localStorage.removeItem('em_auth_token');
  localStorage.removeItem('em_user');
  renderNavAuth();
  showToast('👋 Đã đăng xuất thành công', 'info');
}

async function syncProgressToBackend() {
  const token = localStorage.getItem('em_auth_token');
  if (!token) return;

  const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
  const learned = JSON.parse(localStorage.getItem('em_learned') || '[]');

  try {
    await fetch(`${base}/api/auth/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        xp: state.xp,
        streak: state.streak,
        learnedWords: learned,
        earnedBadges: state.earnedBadges
      })
    });
  } catch (err) {}
}

// ===================================================================
// CHỨC NĂNG 1: THEME SÁNG / TỐI (LIGHT / DARK MODE TOGGLE)
// ===================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('em_theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-theme', isDark);
  document.documentElement.setAttribute('data-theme', theme);

  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    icon.style.color = isDark ? '#fbbf24' : '';
  }

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.setAttribute('title', isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối');
  }

  localStorage.setItem('em_theme', theme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem('em_theme') || (document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast(newTheme === 'dark' ? '🌙 Đã bật chế độ Giao diện Tối' : '☀️ Đã bật chế độ Giao diện Sáng', 'info');
}

// ===================================================================
// CHỨC NĂNG 2: HỌC CÔNG NGHỆ THÔNG TIN & LẬP TRÌNH (IT ACADEMY)
// ===================================================================
let itCurrentCategory = 'all';

function initITAcademy() {
  renderITCourses('all');
  renderITTerms('');
}

function filterITCourses(category, btn) {
  itCurrentCategory = category;
  document.querySelectorAll('#itCategoryTabs .it-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderITCourses(category);
}

function renderITCourses(category = 'all') {
  const grid = document.getElementById('itCoursesGrid');
  if (!grid) return;

  const list = (typeof IT_COURSES_DATA !== 'undefined' ? IT_COURSES_DATA : []).filter(c => {
    return category === 'all' || c.category === category;
  });

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">
        <i class="fas fa-code" style="font-size:2.5rem;margin-bottom:1rem;color:#6366f1"></i>
        <p>Chưa có khóa học nào trong danh mục này.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(course => {
    const vocabCount = course.keyVocab ? course.keyVocab.length : 0;
    const topicsPreview = (course.topics || []).slice(0, 2).map(t => `
      <div class="it-topic-item">
        <i class="fas fa-check-circle"></i>
        <span><strong>${escapeHtml(t.enTerm || t.title)}:</strong> ${escapeHtml(t.title)}</span>
      </div>
    `).join('');

    return `
      <div class="it-course-card" data-aos="fade-up">
        <div>
          <div class="it-card-top">
            <div class="it-icon-box" style="background:${course.color || '#6366f1'}">
              <i class="${course.icon || 'fas fa-code'}"></i>
            </div>
            <span class="it-level-tag"><i class="fas fa-layer-group"></i> ${escapeHtml(course.level)}</span>
          </div>

          <h3 class="it-course-title">${escapeHtml(course.title)}</h3>
          <div class="it-course-subtitle">${escapeHtml(course.titleEn || '')}</div>
          <p class="it-course-desc">${escapeHtml(course.description)}</p>

          <div class="it-topics-list">
            <div style="font-size:.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:.4rem">Nội dung trọng tâm:</div>
            ${topicsPreview}
          </div>
        </div>

        <div class="it-card-footer">
          <span class="it-vocab-count">
            <i class="fas fa-spell-check" style="color:#6366f1"></i> ${vocabCount} thuật ngữ IT
          </span>
          <button class="btn btn--primary btn--sm" onclick="openCourseModal(${course.id})">
            <i class="fas fa-book-open"></i> Học bài này
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openCourseModal(courseId) {
  const course = (typeof IT_COURSES_DATA !== 'undefined' ? IT_COURSES_DATA : []).find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('courseModal');
  const container = document.getElementById('courseModalContent');
  if (!modal || !container) return;

  const topicsHtml = (course.topics || []).map((t, idx) => `
    <div style="background:var(--bg-surface);border:1px solid var(--border-color);border-radius:16px;padding:1.5rem;margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem">
        <span style="width:26px;height:26px;background:#6366f1;color:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800">${idx + 1}</span>
        <h4 style="font-size:1.15rem;color:var(--text-primary);margin:0">${escapeHtml(t.title)}</h4>
      </div>
      <div style="color:#6366f1;font-weight:700;font-size:.88rem;margin-bottom:.5rem"><i class="fas fa-globe"></i> English Term: ${escapeHtml(t.enTerm || '')}</div>
      <p style="color:var(--text-secondary);font-size:.92rem;line-height:1.6;margin-bottom:.8rem">${escapeHtml(t.viDesc)}</p>
      
      ${t.enExplanation ? `
        <div style="background:rgba(99,102,241,0.06);border-left:3px solid #6366f1;padding:.6rem 1rem;border-radius:8px;font-size:.85rem;color:var(--text-secondary);margin-bottom:.9rem">
          <strong><i class="fas fa-comment-dots"></i> Professional English Context:</strong> <em>"${escapeHtml(t.enExplanation)}"</em>
        </div>
      ` : ''}

      ${t.codeSnippet ? `
        <div style="margin-bottom:.8rem">
          <div style="font-size:.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:.3rem"><i class="fas fa-code"></i> Code Snippet thực tế:</div>
          <pre style="background:#0b0e17;color:#93c5fd;padding:1rem;border-radius:10px;font-family:monospace;font-size:.85rem;overflow-x:auto;line-height:1.5"><code>${escapeHtml(t.codeSnippet)}</code></pre>
        </div>
      ` : ''}

      ${t.practicalTip ? `
        <div style="font-size:.82rem;color:#10b981;font-weight:600"><i class="fas fa-lightbulb"></i> Mẹo thực chiến: ${escapeHtml(t.practicalTip)}</div>
      ` : ''}
    </div>
  `).join('');

  const vocabHtml = (course.keyVocab || []).map(v => `
    <div class="article-vocab-card">
      <div class="vocab-card-header">
        <span class="vocab-card-word">${escapeHtml(v.word)}</span>
        <span class="vocab-card-phonetic">${escapeHtml(v.phonetic || '')}</span>
      </div>
      <div class="vocab-card-meaning">${escapeHtml(v.meaning)}</div>
      ${v.example ? `<div class="vocab-card-example">"${escapeHtml(v.example)}"</div>` : ''}
      <button class="btn btn--ghost btn--xs" style="margin-top:.4rem;padding:0" onclick="speakWord('${escapeJsString(v.word)}')">
        <i class="fas fa-volume-up"></i> Nghe phát âm
      </button>
    </div>
  `).join('');

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
      <div class="it-icon-box" style="background:${course.color || '#6366f1'}">
        <i class="${course.icon || 'fas fa-code'}"></i>
      </div>
      <div>
        <h2 style="font-size:1.6rem;color:var(--text-primary);margin-bottom:.2rem">${escapeHtml(course.title)}</h2>
        <div style="color:#6366f1;font-weight:700;font-size:.9rem">${escapeHtml(course.titleEn || '')}</div>
      </div>
    </div>

    <p style="color:var(--text-secondary);font-size:.95rem;line-height:1.7;margin-bottom:2rem">${escapeHtml(course.description)}</p>

    <h3 style="font-size:1.3rem;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem">
      <i class="fas fa-book-bookmark" style="color:#6366f1"></i> Các bài học chi tiết (${(course.topics || []).length} phần)
    </h3>
    ${topicsHtml}

    ${vocabHtml ? `
      <div class="article-vocab-box" style="margin-top:2rem">
        <h4><i class="fas fa-spell-check"></i> Thuật ngữ CNTT cần ghi nhớ trong khóa học</h4>
        <p class="vocab-box-sub">Trau dồi vốn từ tiếng Anh kỹ thuật giúp bạn viết code chuẩn và đọc hiểu tài liệu quốc tế</p>
        <div class="article-vocab-list">${vocabHtml}</div>
      </div>
    ` : ''}

    <div style="text-align:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border-color)">
      <button class="btn btn--primary" onclick="closeCourseModal(); scrollToSection('code-playground');">
        <i class="fas fa-terminal"></i> Thực hành code bài này ngay trong Sandbox
      </button>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Thưởng XP khi mở học bài
  addXP(15, `Khám phá bài học: ${course.title}`);
}

function closeCourseModal() {
  const modal = document.getElementById('courseModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// IT Terminology Explorer
function renderITTerms(filterText = '') {
  const grid = document.getElementById('itTermsGrid');
  if (!grid) return;

  const query = filterText.toLowerCase().trim();
  const list = (typeof IT_VOCABULARY_DATA !== 'undefined' ? IT_VOCABULARY_DATA : []).filter(item => {
    if (!query) return true;
    return item.word.toLowerCase().includes(query) ||
           item.meaning.toLowerCase().includes(query) ||
           (item.example && item.example.toLowerCase().includes(query));
  });

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted)">
        Không tìm thấy thuật ngữ phù hợp với từ khóa "${escapeHtml(filterText)}".
      </div>`;
    return;
  }

  grid.innerHTML = list.map(item => `
    <div class="it-term-card">
      <div>
        <div class="it-term-top">
          <span class="it-term-word">${escapeHtml(item.word)}</span>
          <button class="btn btn--ghost btn--xs" onclick="speakWord('${escapeJsString(item.word)}')" title="Phát âm">
            <i class="fas fa-volume-up"></i>
          </button>
        </div>
        <div class="it-term-phonetic">${escapeHtml(item.phonetic || '')} <small style="color:var(--text-muted)">(${escapeHtml(item.pos || 'term')})</small></div>
        <p class="it-term-meaning">${escapeHtml(item.meaning)}</p>
      </div>
      ${item.example ? `
        <div class="it-term-example">
          "${escapeHtml(item.example)}"
          ${item.exampleVi ? `<div style="font-size:.74rem;color:var(--text-muted);margin-top:.2rem">${escapeHtml(item.exampleVi)}</div>` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function filterITTerms(query) {
  renderITTerms(query);
}

// ===================================================================
// CHỨC NĂNG 3: TRÌNH THỰC HÀNH CODE TƯƠNG TÁC (CODE PLAYGROUND)
// ===================================================================
function initCodePlayground() {
  const select = document.getElementById('playgroundTemplateSelect');
  if (select && select.value) {
    loadCodeTemplate(select.value);
  }
}

function loadCodeTemplate(templateId) {
  const template = (typeof CODE_PLAYGROUND_TEMPLATES !== 'undefined' ? CODE_PLAYGROUND_TEMPLATES : []).find(t => t.id === templateId);
  const input = document.getElementById('playgroundCodeInput');
  if (template && input) {
    input.value = template.code;
    clearConsoleOutput();
    const consoleOutput = document.getElementById('playgroundConsoleOutput');
    if (consoleOutput) {
      consoleOutput.innerHTML = `<span class="console-msg-log">Đã tải mẫu: <strong>${escapeHtml(template.name)}</strong>. Nhấn "Chạy Code" để thực thi.</span>`;
    }
  }
}

function resetCodeTemplate() {
  const select = document.getElementById('playgroundTemplateSelect');
  if (select) loadCodeTemplate(select.value);
}

function clearCodeEditor() {
  const input = document.getElementById('playgroundCodeInput');
  if (input) input.value = '';
}

function clearConsoleOutput() {
  const consoleOutput = document.getElementById('playgroundConsoleOutput');
  if (consoleOutput) consoleOutput.innerHTML = '';
}

function runPlaygroundCode() {
  const input = document.getElementById('playgroundCodeInput');
  const consoleOutput = document.getElementById('playgroundConsoleOutput');
  if (!input || !consoleOutput) return;

  const code = input.value;
  if (!code.trim()) {
    consoleOutput.innerHTML = `<span class="console-msg-warn">⚠️ Trình soạn thảo đang trống. Hãy nhập mã JavaScript để chạy!</span>`;
    return;
  }

  consoleOutput.innerHTML = '';
  let logs = [];

  // Tạo mock console
  const customConsole = {
    log: (...args) => logs.push({ type: 'log', text: args.map(formatLogArg).join(' ') }),
    info: (...args) => logs.push({ type: 'log', text: args.map(formatLogArg).join(' ') }),
    warn: (...args) => logs.push({ type: 'warn', text: args.map(formatLogArg).join(' ') }),
    error: (...args) => logs.push({ type: 'error', text: args.map(formatLogArg).join(' ') })
  };

  try {
    const runFn = new Function('console', code);
    runFn(customConsole);

    if (logs.length === 0) {
      consoleOutput.innerHTML = `<span class="console-msg-success">✅ Mã đã thực thi thành công! (Không có kết quả console.log nào được in ra)</span>`;
    } else {
      consoleOutput.innerHTML = logs.map(l => {
        const cls = l.type === 'error' ? 'console-msg-error' : l.type === 'warn' ? 'console-msg-warn' : 'console-msg-log';
        return `<div class="${cls}">${escapeHtml(l.text)}</div>`;
      }).join('');
      consoleOutput.innerHTML += `<div class="console-msg-success" style="margin-top:.75rem">✨ [Execution Completed Successfully]</div>`;
    }

    // Thưởng XP và huy hiệu Dev
    addXP(25, 'Chạy mã JavaScript thành công trong Sandbox');
    unlockBadge('dev_master');

  } catch (err) {
    consoleOutput.innerHTML = `
      <div class="console-msg-error">❌ Runtime Error: ${escapeHtml(err.message)}</div>
      <div style="font-size:.78rem;color:#f87171;margin-top:.4rem">Gợi ý: Kiểm tra cú pháp, tên biến hoặc dấu ngoặc trong đoạn code trên.</div>
    `;
  }
}

function formatLogArg(arg) {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2);
    } catch (e) {
      return String(arg);
    }
  }
  return String(arg);
}

// ===================================================================
// CHỨC NĂNG 4: CỔNG TIN TỨC CÔNG NGHỆ THÔNG TIN (TECH NEWS PORTAL)
// ===================================================================
let newsCurrentCategory = 'all';
let newsSearchQuery = '';

function initTechNews() {
  renderTechNews('all', '');
}

function filterTechNews(category, btn) {
  newsCurrentCategory = category;
  document.querySelectorAll('#newsCategoryFilters .news-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTechNews(category, newsSearchQuery);
}

function handleNewsSearch(query) {
  newsSearchQuery = query;
  renderTechNews(newsCurrentCategory, query);
}

function renderTechNews(category = 'all', searchQuery = '') {
  const grid = document.getElementById('techNewsGrid');
  if (!grid) return;

  const query = searchQuery.toLowerCase().trim();
  const list = (typeof TECH_NEWS_DATA !== 'undefined' ? TECH_NEWS_DATA : []).filter(item => {
    const matchCategory = category === 'all' || item.category === category;
    if (!matchCategory) return false;
    if (!query) return true;
    return item.title.toLowerCase().includes(query) ||
           item.summary.toLowerCase().includes(query) ||
           (item.categoryLabel && item.categoryLabel.toLowerCase().includes(query));
  });

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">
        <i class="fas fa-newspaper" style="font-size:2.5rem;margin-bottom:1rem;color:#6366f1"></i>
        <p>Không tìm thấy bài viết tin tức nào phù hợp với bộ lọc hiện tại.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(article => {
    const vocabCount = article.keyVocab ? article.keyVocab.length : 0;
    const vocabWords = (article.keyVocab || []).slice(0, 3).map(v => v.word).join(', ');

    return `
      <div class="news-card" onclick="openArticleModal(${article.id})" data-aos="fade-up">
        <div class="news-image-wrap">
          <img src="${article.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(article.title)}" loading="lazy" />
          <span class="news-badge">${escapeHtml(article.categoryLabel || 'Công nghệ')}</span>
        </div>
        <div class="news-card-body">
          <div class="news-meta-row">
            <span><i class="fas fa-calendar-day"></i> ${escapeHtml(article.publishedAt || 'Hôm nay')}</span>
            <span><i class="fas fa-clock"></i> ${escapeHtml(article.readTime || '5 phút')}</span>
            <span><i class="fas fa-eye"></i> ${article.views || 0}</span>
          </div>

          <h3 class="news-card-title">${escapeHtml(article.title)}</h3>
          <p class="news-card-excerpt">${escapeHtml(article.summary)}</p>

          ${vocabCount > 0 ? `
            <div class="news-key-vocab-preview">
              <i class="fas fa-spell-check"></i>
              <span><strong>Từ vựng IT trong bài:</strong> ${escapeHtml(vocabWords)}...</span>
            </div>
          ` : ''}

          <div class="news-card-footer">
            <span><i class="fas fa-user-pen"></i> ${escapeHtml(article.author || 'Tech Team')}</span>
            <span class="news-read-link">Đọc bài viết <i class="fas fa-arrow-right"></i></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openArticleModal(newsId) {
  const article = (typeof TECH_NEWS_DATA !== 'undefined' ? TECH_NEWS_DATA : []).find(n => n.id === newsId);
  if (!article) return;

  // Tăng views
  article.views = (article.views || 0) + 1;

  const modal = document.getElementById('articleModal');
  const container = document.getElementById('articleModalContent');
  if (!modal || !container) return;

  const vocabHtml = (article.keyVocab || []).map(v => `
    <div class="article-vocab-card">
      <div class="vocab-card-header">
        <span class="vocab-card-word">${escapeHtml(v.word)}</span>
        <span class="vocab-card-phonetic">${escapeHtml(v.phonetic || '')}</span>
      </div>
      <div class="vocab-card-meaning">${escapeHtml(v.meaning)}</div>
      ${v.example ? `<div class="vocab-card-example">"${escapeHtml(v.example)}"</div>` : ''}
      <button class="btn btn--ghost btn--xs" style="margin-top:.4rem;padding:0" onclick="speakWord('${escapeJsString(v.word)}')">
        <i class="fas fa-volume-up"></i> Nghe phát âm
      </button>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="article-header">
      <div class="article-badge-row">
        <span class="it-pill"><i class="fas fa-tag"></i> ${escapeHtml(article.categoryLabel || 'Tin tức')}</span>
        <span class="it-pill"><i class="fas fa-clock"></i> ${escapeHtml(article.readTime || '5 phút đọc')}</span>
      </div>
      <h1 class="article-title">${escapeHtml(article.title)}</h1>
      <div class="article-meta">
        <span><i class="fas fa-user"></i> ${escapeHtml(article.author || 'Ban biên tập')}</span>
        <span><i class="fas fa-calendar"></i> ${escapeHtml(article.publishedAt || '')}</span>
        <span><i class="fas fa-eye"></i> ${article.views} lượt xem</span>
      </div>
    </div>

    ${article.image ? `<img src="${article.image}" alt="${escapeHtml(article.title)}" class="article-featured-img" />` : ''}

    <div class="article-body-content">
      ${article.content}
    </div>

    ${vocabHtml ? `
      <div class="article-vocab-box">
        <h4><i class="fas fa-lightbulb"></i> Key IT Vocabulary in this Article (Từ vựng tiếng Anh CNTT trong bài)</h4>
        <p class="vocab-box-sub">Nắm vững các thuật ngữ này giúp bạn nâng cao năng lực đọc báo và tài liệu công nghệ bằng tiếng Anh.</p>
        <div class="article-vocab-list">
          ${vocabHtml}
        </div>
      </div>
    ` : ''}

    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:1.5rem;border-top:1px solid var(--border-color);flex-wrap:wrap;gap:1rem">
      <div style="color:var(--text-muted);font-size:.85rem">
        <i class="fas fa-share-nodes"></i> Chia sẻ bài viết này với cộng đồng lập trình viên
      </div>
      <button class="btn btn--outline btn--sm" onclick="closeArticleModal()">
        <i class="fas fa-xmark"></i> Đóng cửa sổ
      </button>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Thưởng XP khi đọc tin tức
  addXP(10, `Đọc tin tức công nghệ: ${article.title}`);

  // Đếm số bài đã đọc để mở huy hiệu
  let readArticles = JSON.parse(localStorage.getItem('em_read_articles') || '[]');
  if (!readArticles.includes(newsId)) {
    readArticles.push(newsId);
    localStorage.setItem('em_read_articles', JSON.stringify(readArticles));
    if (readArticles.length >= 3) {
      unlockBadge('tech_reader');
    }
  }
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ===================================================================
// ĐỒNG BỘ BACKEND (SYNC WITH API)
// ===================================================================
async function syncNewsWithBackend() {
  try {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    const res = await fetch(`${base}/api/news`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        TECH_NEWS_DATA.length = 0;
        TECH_NEWS_DATA.push(...data.data);
        renderTechNews(newsCurrentCategory, newsSearchQuery);
      }
    }
  } catch (e) {
    // Sử dụng fallback dữ liệu tĩnh TECH_NEWS_DATA
  }
}

async function syncITCoursesWithBackend() {
  try {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    const res = await fetch(`${base}/api/it/courses`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        IT_COURSES_DATA.length = 0;
        IT_COURSES_DATA.push(...data.data);
        renderITCourses(itCurrentCategory);
      }
    }
  } catch (e) {
    // Sử dụng fallback dữ liệu tĩnh IT_COURSES_DATA
  }
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsString(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

