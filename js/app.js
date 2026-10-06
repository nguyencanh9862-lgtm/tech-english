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
  initVideoCourses();
  syncCoursesWithBackend();
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

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link, .dropdown-card-item').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 140) current = s.getAttribute('id');
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
  const line = document.getElementById('scrollProgressLine');
  const ring = document.querySelector('.progress-ring-circle');
  const totalLength = 113.1; // 2 * PI * 18

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrollY / maxScroll) : 0;

    if (line) {
      line.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    }

    if (btn) {
      btn.classList.toggle('visible', scrollY > 280);
      if (ring) {
        ring.style.strokeDashoffset = `${totalLength - (progress * totalLength)}`;
      }
    }
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
function updateNavStats() {
  const streakEl = document.getElementById('navStreakCount');
  const xpEl = document.getElementById('navXpCount');
  if (streakEl) streakEl.textContent = state.streak || 7;
  if (xpEl) xpEl.textContent = state.xp || 250;
}

function addXP(amount) {
  state.xp += amount;
  localStorage.setItem('em_xp', state.xp);
  syncProgressToBackend();
  updateNavStats();
}

// ===== STREAK =====
function initStreakCheck() {
  const today = new Date().toDateString();
  const last = state.lastSeen;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (last === today) {
    updateNavStats();
    return;
  }
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
  updateNavStats();
}

// ===== TEXT TO SPEECH =====
function speakWOD() {
  const wave = document.getElementById('wodAudioWave');
  if (wave) wave.classList.add('playing');
  speakWord('Serendipity', () => {
    if (wave) wave.classList.remove('playing');
  });
}

function speakWord(text, onEnd) {
  if (!window.speechSynthesis) {
    showToast('Trình duyệt không hỗ trợ phát âm', 'warning');
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.85;
  utt.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en-') && !v.name.includes('Google'));
  if (enVoice) utt.voice = enVoice;

  if (onEnd) {
    utt.onend = onEnd;
    utt.onerror = onEnd;
  }

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
        <svg class="google-svg" viewBox="0 0 24 24" width="16" height="16">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Đăng nhập</span>
      </button>
      <a href="admin/index.html" class="nav-admin-btn" title="Trang quản trị Admin">
        <i class="fas fa-shield-halved"></i>
        <span>Admin</span>
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

// ============================================================
// ENGLISH VIDEO COURSES & WEB PLAYER MODULE
// ============================================================
let activeCourseList = [];
let courseCurrentCategory = 'all';
let courseSearchQuery = '';
let currentPlayingCourse = null;
let currentPlayingLessonIndex = 0;

function extractYouTubeId(url) {
  if (!url) return '';
  url = String(url).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}

function initVideoCourses() {
  if (typeof ENGLISH_COURSES_DATA !== 'undefined' && Array.isArray(ENGLISH_COURSES_DATA)) {
    activeCourseList = JSON.parse(JSON.stringify(ENGLISH_COURSES_DATA));
  } else {
    activeCourseList = [];
  }
  renderCourses();
}

async function syncCoursesWithBackend() {
  try {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    const res = await fetch(`${base}/api/courses`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        activeCourseList = data.data;
        renderCourses();
      }
    }
  } catch (err) {
    console.log('Sử dụng dữ liệu khóa học mặc định:', err.message);
  }
}

function filterCourses(category, btn) {
  courseCurrentCategory = category;
  document.querySelectorAll('#coursesFilterTabs .course-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCourses();
}

function handleCourseSearch(query) {
  courseSearchQuery = (query || '').toLowerCase().trim();
  renderCourses();
}

function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  const filtered = activeCourseList.filter(course => {
    const matchCat = (courseCurrentCategory === 'all' || course.category === courseCurrentCategory);
    const matchSearch = (!courseSearchQuery ||
      course.title.toLowerCase().includes(courseSearchQuery) ||
      (course.titleEn && course.titleEn.toLowerCase().includes(courseSearchQuery)) ||
      (course.description && course.description.toLowerCase().includes(courseSearchQuery)) ||
      (course.instructor && course.instructor.toLowerCase().includes(courseSearchQuery))
    );
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;background:var(--bg-card);border-radius:20px;border:1px dashed var(--border-color)">
        <i class="fab fa-youtube" style="font-size:3.5rem;color:#ef4444;margin-bottom:1rem;opacity:0.8"></i>
        <h3 style="font-size:1.3rem;margin-bottom:.5rem;color:var(--text-primary)">Chưa tìm thấy khóa học nào phù hợp</h3>
        <p style="color:var(--text-secondary);max-width:500px;margin:0 auto 1.5rem">Bạn có thể là người đầu tiên tạo khóa học tiếng Anh kèm link YouTube trong danh mục này!</p>
        <button class="btn btn--primary" onclick="openCreateCourseModal()">
          <i class="fas fa-plus"></i> Tạo khóa học mới ngay
        </button>
      </div>
    `;
    return;
  }

  const categoryLabels = {
    communication: 'Giao tiếp hàng ngày',
    it: 'Tiếng Anh CNTT',
    pronunciation: 'Phát âm & Ngữ điệu',
    listening: 'Luyện nghe phản xạ',
    grammar: 'Ngữ pháp ứng dụng',
    ielts: 'Luyện thi'
  };

  grid.innerHTML = filtered.map(course => {
    const mainYtId = course.youtubeId || extractYouTubeId(course.youtubeUrl);
    const thumbUrl = course.thumbnail || (mainYtId ? `https://img.youtube.com/vi/${mainYtId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80');
    const lessonCount = (course.lessons && course.lessons.length > 0) ? course.lessons.length : 1;
    const catLabel = categoryLabels[course.category] || course.category;

    return `
      <div class="course-card" data-aos="fade-up">
        <div class="course-thumb-wrap" onclick="openVideoCourseModal(${course.id}, 0)">
          <img src="${thumbUrl}" alt="${escapeHtml(course.title)}" class="course-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'" />
          <div class="course-play-overlay">
            <div class="course-play-btn">
              <i class="fas fa-play"></i>
            </div>
          </div>
          <span class="course-badge-pill"><i class="fas fa-signal"></i> ${escapeHtml(course.level || 'Cơ bản')}</span>
          <span class="course-lessons-badge">
            <i class="fab fa-youtube"></i> ${lessonCount} bài video
          </span>
        </div>

        <div class="course-body">
          <div class="course-meta-top">
            <span class="course-category-tag">${escapeHtml(catLabel)}</span>
            <span class="course-rating">
              <i class="fas fa-star"></i> ${course.rating || '5.0'} (${course.views || 0})
            </span>
          </div>

          <h3 class="course-title" onclick="openVideoCourseModal(${course.id}, 0)" style="cursor:pointer" title="${escapeHtml(course.title)}">
            ${escapeHtml(course.title)}
          </h3>
          ${course.titleEn ? `<div class="course-subtitle">${escapeHtml(course.titleEn)}</div>` : ''}

          <p class="course-description">${escapeHtml(course.description || '')}</p>

          <div class="course-footer">
            <div class="course-instructor">
              <i class="fas fa-chalkboard-user"></i>
              <span>${escapeHtml(course.instructor || 'TechEnglish')}</span>
            </div>
            <button class="btn-watch-course" onclick="openVideoCourseModal(${course.id}, 0)">
              <i class="fas fa-play"></i> Xem video
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Mở trình phát video bài giảng trên web
function openVideoCourseModal(courseId, lessonIndex = 0) {
  const course = activeCourseList.find(c => c.id === courseId);
  if (!course) return;

  currentPlayingCourse = course;
  currentPlayingLessonIndex = lessonIndex;

  // Tăng views ở backend
  try {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    fetch(`${base}/api/courses/${courseId}`, { method: 'GET' }).catch(() => {});
  } catch (e) {}

  // Thưởng XP khi học viên bắt đầu xem video
  if (typeof addXP === 'function') {
    addXP(20, `Xem video khóa học: ${course.title}`);
  }

  const modal = document.getElementById('videoCourseModal');
  const container = document.getElementById('videoCourseModalContent');
  if (!modal || !container) return;

  renderVideoModalInner();

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function renderVideoModalInner() {
  const container = document.getElementById('videoCourseModalContent');
  if (!container || !currentPlayingCourse) return;

  const course = currentPlayingCourse;
  const lessons = (course.lessons && course.lessons.length > 0) ? course.lessons : [
    {
      id: 1,
      title: course.title,
      youtubeUrl: course.youtubeUrl,
      youtubeId: course.youtubeId || extractYouTubeId(course.youtubeUrl),
      duration: '15:00',
      description: course.description,
      vocabularies: []
    }
  ];

  if (currentPlayingLessonIndex < 0 || currentPlayingLessonIndex >= lessons.length) {
    currentPlayingLessonIndex = 0;
  }

  const currentLesson = lessons[currentPlayingLessonIndex];
  const ytId = currentLesson.youtubeId || extractYouTubeId(currentLesson.youtubeUrl) || course.youtubeId || extractYouTubeId(course.youtubeUrl);

  const prevDisabled = currentPlayingLessonIndex <= 0 ? 'disabled' : '';
  const nextDisabled = currentPlayingLessonIndex >= lessons.length - 1 ? 'disabled' : '';

  // Render Vocabularies of the current lesson
  const vocabs = currentLesson.vocabularies || [];
  const vocabHtml = vocabs.length > 0 ? `
    <div style="margin-top:1.5rem">
      <h4 style="font-size:1.05rem;color:var(--text-primary);margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem">
        <i class="fas fa-spell-check" style="color:#6366f1"></i> Từ vựng & Thuật ngữ cần nhớ trong video này (${vocabs.length})
      </h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:.85rem">
        ${vocabs.map(v => `
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
        `).join('')}
      </div>
    </div>
  ` : '';

  // Render Playlist items
  const playlistItemsHtml = lessons.map((l, idx) => {
    const isActive = idx === currentPlayingLessonIndex;
    return `
      <div class="playlist-item-card ${isActive ? 'active' : ''}" onclick="switchVideoLesson(${idx})">
        <div class="playlist-item-num">
          ${isActive ? '<i class="fas fa-play" style="font-size:.65rem"></i>' : (idx + 1)}
        </div>
        <div class="playlist-item-info">
          <div class="playlist-item-title">${escapeHtml(l.title)}</div>
          <div class="playlist-item-sub">
            <span><i class="far fa-clock"></i> ${escapeHtml(l.duration || '10:00')}</span>
            ${isActive ? '<span class="active-now-tag"><span class="equalizer-bars"><span></span><span></span><span></span><span></span></span> Đang phát</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const completedPercent = Math.round(((currentPlayingLessonIndex + 1) / lessons.length) * 100);

  container.innerHTML = `
    <div class="video-modal-header">
      <div>
        <h2 class="video-modal-title"><i class="fab fa-youtube" style="color:#ef4444;margin-right:.5rem"></i> ${escapeHtml(course.title)}</h2>
        <div class="video-modal-subtitle">${escapeHtml(course.titleEn || '')} &bull; Giảng viên: ${escapeHtml(course.instructor || 'TechEnglish')}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.6rem">
        <span style="color:var(--text-muted);font-size:.78rem;background:var(--bg-surface);padding:.25rem .6rem;border-radius:6px;border:1px solid var(--border-color);display:inline-flex;align-items:center;gap:.3rem">
          <kbd style="font-family:inherit;font-weight:700">←</kbd> <kbd style="font-family:inherit;font-weight:700">→</kbd> chuyển bài &bull; <kbd style="font-family:inherit;font-weight:700">Esc</kbd> đóng
        </span>
      </div>
    </div>

    <div class="video-player-grid">
      <!-- Main Video Stage -->
      <div class="video-stage">
        <div class="video-frame-container" id="videoIframeContainer">
          ${ytId ? `
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1" 
              title="${escapeHtml(currentLesson.title)}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          ` : `
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#94a3b8;flex-direction:column;gap:1rem;padding:2rem;text-align:center">
              <i class="fab fa-youtube" style="font-size:3rem;color:#ef4444"></i>
              <p>Chưa có video YouTube khả dụng cho bài học này.</p>
            </div>
          `}
        </div>

        <!-- Video Action Toolbar -->
        <div class="video-action-bar">
          <div class="current-lesson-meta">
            <span class="lesson-badge-order">Bài ${currentPlayingLessonIndex + 1}/${lessons.length}</span>
            <span class="current-lesson-name">${escapeHtml(currentLesson.title)}</span>
          </div>

          <div class="video-nav-btns">
            <button class="btn-lesson-nav" onclick="playPrevLesson()" ${prevDisabled} title="Bài trước (Phím ←)">
              <i class="fas fa-chevron-left"></i> Bài trước
            </button>
            <button class="btn-lesson-nav" onclick="playNextLesson()" ${nextDisabled} title="Bài tiếp theo (Phím →)">
              Bài tiếp theo <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Lesson Description & Summary -->
        <div class="lesson-details-card">
          <h4><i class="fas fa-circle-info" style="color:#6366f1"></i> Nội dung tóm tắt bài giảng</h4>
          <p class="lesson-desc-text">${escapeHtml(currentLesson.description || course.description || 'Không có mô tả chi tiết.')}</p>
          
          <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;padding-top:.8rem;border-top:1px solid var(--border-color);font-size:.85rem;color:var(--text-secondary)">
            <span><i class="fab fa-youtube" style="color:#ef4444"></i> Link nguồn: <a href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noopener noreferrer" style="color:#6366f1;text-decoration:underline">Mở trên YouTube</a></span>
            <span>&bull;</span>
            <span><i class="fas fa-award" style="color:#f59e0b"></i> Đã hoàn thành sẽ nhận: <strong>+30 XP</strong></span>
            <button class="btn btn--ghost btn--xs" style="color:#10b981;font-weight:700;margin-left:auto" onclick="markLessonCompleted(${course.id}, ${currentLesson.id})">
              <i class="fas fa-check-double"></i> Đánh dấu hoàn thành bài này
            </button>
          </div>

          ${vocabHtml}
        </div>
      </div>

      <!-- Playlist Sidebar -->
      <div class="playlist-panel">
        <div class="playlist-top">
          <h4><i class="fas fa-list-ol" style="color:#6366f1"></i> Bài học (${lessons.length})</h4>
          <button class="btn-add-lesson-mini" onclick="openAddLessonModal(${course.id})">
            <i class="fas fa-plus"></i> Thêm bài
          </button>
        </div>

        <!-- Course Progress Mini Bar -->
        <div style="margin-bottom:.85rem;background:var(--bg-card);padding:.75rem 1rem;border-radius:12px;border:1px solid var(--border-color)">
          <div style="display:flex;justify-content:space-between;font-size:.78rem;font-weight:700;color:var(--text-secondary);margin-bottom:.35rem">
            <span>Tiến độ bài học:</span>
            <span style="color:#6366f1">Bài ${currentPlayingLessonIndex + 1}/${lessons.length} (${completedPercent}%)</span>
          </div>
          <div style="height:6px;background:var(--bg-surface);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${completedPercent}%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:99px;transition:width 0.3s ease"></div>
          </div>
        </div>

        <div class="playlist-items-scroll">
          ${playlistItemsHtml}
        </div>

        <div style="margin-top:1rem;padding-top:.85rem;border-top:1px solid var(--border-color);font-size:.82rem;color:var(--text-secondary)">
          <div style="margin-bottom:.3rem"><strong>Cấp độ:</strong> ${escapeHtml(course.level || 'Cơ bản')}</div>
          <div><strong>Mô tả:</strong> ${escapeHtml(course.description || '')}</div>
        </div>
      </div>
    </div>
  `;
}

function switchVideoLesson(idx) {
  if (!currentPlayingCourse || !currentPlayingCourse.lessons) return;
  if (idx < 0 || idx >= currentPlayingCourse.lessons.length) return;
  currentPlayingLessonIndex = idx;
  renderVideoModalInner();
}

function playNextLesson() {
  if (!currentPlayingCourse || !currentPlayingCourse.lessons) return;
  if (currentPlayingLessonIndex < currentPlayingCourse.lessons.length - 1) {
    currentPlayingLessonIndex++;
    renderVideoModalInner();
  }
}

function playPrevLesson() {
  if (!currentPlayingCourse || !currentPlayingCourse.lessons) return;
  if (currentPlayingLessonIndex > 0) {
    currentPlayingLessonIndex--;
    renderVideoModalInner();
  }
}

function closeVideoCourseModal() {
  const modal = document.getElementById('videoCourseModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';

  // Dừng video khi đóng modal
  const container = document.getElementById('videoIframeContainer');
  if (container) container.innerHTML = '';
}

function markLessonCompleted(courseId, lessonId) {
  if (typeof addXP === 'function') {
    addXP(30, 'Hoàn thành bài học video');
  }
  showToast('🎉 Chúc mừng bạn đã hoàn thành bài học này! (+30 XP)', 'success');
}

// Live Preview cho ô nhập Link YouTube
function handleYoutubeInputPreview(url, previewBoxId) {
  const box = document.getElementById(previewBoxId);
  if (!box) return;

  const ytId = extractYouTubeId(url);
  if (ytId) {
    box.classList.add('active');
    const img = box.querySelector('img');
    if (img) img.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    const idText = box.querySelector('[id$="PreviewId"]');
    if (idText) idText.textContent = `Video ID: ${ytId}`;
  } else {
    box.classList.remove('active');
  }
}

// Xử lý Tạo Khóa Học Mới
function openCreateCourseModal() {
  const modal = document.getElementById('createCourseModal');
  const form = document.getElementById('createCourseForm');
  if (form) form.reset();
  const preview = document.getElementById('ytMainPreview');
  if (preview) preview.classList.remove('active');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeCreateCourseModal() {
  const modal = document.getElementById('createCourseModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function handleCreateCourseSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('courseInputTitle').value.trim();
  const titleEn = document.getElementById('courseInputTitleEn').value.trim();
  const category = document.getElementById('courseInputCat').value;
  const level = document.getElementById('courseInputLevel').value;
  const instructor = document.getElementById('courseInputInstructor').value.trim() || 'TechEnglish Team';
  const ytUrl = document.getElementById('courseInputYtUrl').value.trim();
  const desc = document.getElementById('courseInputDesc').value.trim();

  const ytId = extractYouTubeId(ytUrl);
  if (!ytId) {
    showToast('⚠️ Vui lòng nhập link YouTube hợp lệ!', 'warning');
    return;
  }

  const newId = (activeCourseList.length > 0 ? Math.max(...activeCourseList.map(c => c.id)) + 1 : 1);
  const thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  const newCourse = {
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
        title: `Bài 1: Khởi động & Bài giảng - ${title}`,
        youtubeUrl: ytUrl,
        youtubeId: ytId,
        duration: '15:00',
        description: desc,
        order: 1,
        vocabularies: []
      }
    ]
  };

  const btnSubmit = document.getElementById('btnSubmitCourse');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
  }

  try {
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    const res = await fetch(`${base}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        newCourse.id = data.data.id || newCourse.id;
      }
    }
  } catch (err) {
    console.log('Lưu cục bộ:', err.message);
  }

  activeCourseList.unshift(newCourse);
  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fas fa-circle-check"></i> Lưu & Xuất bản Khóa học';
  }

  closeCreateCourseModal();
  renderCourses();

  showToast('🎉 Tạo khóa học tiếng Anh thành công!', 'success');

  // Mở ngay video của khóa học vừa tạo để người dùng thưởng thức trực tiếp
  setTimeout(() => {
    openVideoCourseModal(newCourse.id, 0);
  }, 350);
}

// Xử lý Thêm Bài Học Video Mới vào Khóa Học
function openAddLessonModal(courseId) {
  const course = activeCourseList.find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('addLessonModal');
  const courseName = document.getElementById('addLessonCourseName');
  const hiddenId = document.getElementById('addLessonCourseId');
  const form = document.getElementById('addLessonForm');

  if (form) form.reset();
  const preview = document.getElementById('ytLessonPreview');
  if (preview) preview.classList.remove('active');

  if (hiddenId) hiddenId.value = courseId;
  if (courseName) courseName.innerHTML = `Khóa học: <strong>${escapeHtml(course.title)}</strong>`;

  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeAddLessonModal() {
  const modal = document.getElementById('addLessonModal');
  if (modal) modal.style.display = 'none';
}

async function handleAddLessonSubmit(e) {
  e.preventDefault();
  const courseId = parseInt(document.getElementById('addLessonCourseId').value);
  const title = document.getElementById('lessonInputTitle').value.trim();
  const ytUrl = document.getElementById('lessonInputYtUrl').value.trim();
  const duration = document.getElementById('lessonInputDuration').value.trim() || '15:00';
  const desc = document.getElementById('lessonInputDesc').value.trim();

  const ytId = extractYouTubeId(ytUrl);
  if (!ytId) {
    showToast('⚠️ Vui lòng nhập link YouTube bài học hợp lệ!', 'warning');
    return;
  }

  const course = activeCourseList.find(c => c.id === courseId);
  if (!course) return;

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
    const base = window.location.origin.includes(':5000') ? '' : 'http://localhost:5000';
    await fetch(`${base}/api/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLesson)
    });
  } catch (err) {
    console.log('Lưu bài học cục bộ:', err.message);
  }

  if (!course.lessons) course.lessons = [];
  course.lessons.push(newLesson);

  closeAddLessonModal();
  renderCourses();

  // Nếu đang mở modal khóa học này thì cập nhật lại giao diện
  if (currentPlayingCourse && currentPlayingCourse.id === courseId) {
    currentPlayingCourse = course;
    currentPlayingLessonIndex = course.lessons.length - 1; // Nhảy tới bài học mới tạo
    renderVideoModalInner();
  }

  showToast('✅ Đã thêm bài học video mới vào khóa học!', 'success');
}

// ============================================================
// SPOTLIGHT SEARCH (COMMAND PALETTE) & UI SHORTCUTS
// ============================================================
let spotlightCurrentType = 'all';
let spotlightQuery = '';

function openSpotlightModal() {
  const modal = document.getElementById('spotlightModal');
  const input = document.getElementById('spotlightInput');
  if (!modal || !input) return;
  modal.classList.add('active');
  input.value = '';
  spotlightQuery = '';
  document.body.style.overflow = 'hidden';
  setTimeout(() => input.focus(), 60);
  renderSpotlightResults();
}

function closeSpotlightModal() {
  const modal = document.getElementById('spotlightModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function handleSpotlightOverlayClick(e) {
  if (e.target.id === 'spotlightModal') {
    closeSpotlightModal();
  }
}

function filterSpotlightType(type, btn) {
  spotlightCurrentType = type;
  document.querySelectorAll('#spotlightTabs .spotlight-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSpotlightResults();
}

function handleSpotlightSearch(q) {
  spotlightQuery = (q || '').toLowerCase().trim();
  renderSpotlightResults();
}

function renderSpotlightResults() {
  const container = document.getElementById('spotlightResults');
  if (!container) return;

  const results = [];
  const q = spotlightQuery;

  // Google Sheets Feature shortcut
  if (q && ('google sheets học từ vựng excel đồng bộ bảng tính'.includes(q) || q.includes('sheet') || q.includes('excel'))) {
    results.push({
      type: 'sheet',
      typeLabel: 'Google Sheets Live',
      typeColor: '#10b981',
      icon: 'fas fa-file-excel',
      title: 'Học Tiếng Anh Từ Bảng Google Sheets Của Bạn',
      sub: 'Dán link bảng tính để học Flashcard, phát âm IPA & làm Quiz tự động',
      action: () => {
        closeSpotlightModal();
        openClientSheetModal();
      }
    });
  }

  // 1. Courses
  if (spotlightCurrentType === 'all' || spotlightCurrentType === 'course') {
    activeCourseList.forEach(c => {
      if (!q || c.title.toLowerCase().includes(q) || (c.titleEn && c.titleEn.toLowerCase().includes(q)) || (c.instructor && c.instructor.toLowerCase().includes(q))) {
        results.push({
          type: 'course',
          typeLabel: 'Khóa học Video',
          typeColor: '#ef4444',
          icon: 'fab fa-youtube',
          title: c.title,
          sub: `${c.level || 'Cơ bản'} • ${(c.lessons || []).length} bài học video • ${c.instructor || 'TechEnglish'}`,
          action: () => {
            closeSpotlightModal();
            openVideoCourseModal(c.id, 0);
          }
        });
      }
    });
  }

  // 2. Vocabulary
  if (spotlightCurrentType === 'all' || spotlightCurrentType === 'vocab') {
    const vocabs = (typeof VOCABULARY_DATA !== 'undefined' ? VOCABULARY_DATA : []);
    vocabs.forEach(v => {
      if (!q || v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)) {
        results.push({
          type: 'vocab',
          typeLabel: `Từ vựng (${v.level || 'B1'})`,
          typeColor: '#6366f1',
          icon: 'fas fa-book-open',
          title: `${v.word} ${v.phonetic ? `(${v.phonetic})` : ''}`,
          sub: `${v.pos ? `[${v.pos}] ` : ''}${v.meaning}`,
          action: () => {
            closeSpotlightModal();
            scrollToSection('vocabulary');
            speakWord(v.word);
          }
        });
      }
    });
  }

  // 3. Grammar
  if (spotlightCurrentType === 'all' || spotlightCurrentType === 'grammar') {
    const grammars = (typeof GRAMMAR_LESSONS !== 'undefined' ? GRAMMAR_LESSONS : []);
    grammars.forEach((g, idx) => {
      if (!q || g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)) {
        results.push({
          type: 'grammar',
          typeLabel: 'Ngữ pháp',
          typeColor: '#10b981',
          icon: 'fas fa-pen-nib',
          title: g.title,
          sub: g.formula || g.description,
          action: () => {
            closeSpotlightModal();
            scrollToSection('grammar');
            if (typeof renderGrammar === 'function') renderGrammar(idx);
          }
        });
      }
    });
  }

  // 4. IT Academy
  if (spotlightCurrentType === 'all' || spotlightCurrentType === 'it') {
    const itCourses = (typeof IT_COURSES_DATA !== 'undefined' ? IT_COURSES_DATA : []);
    itCourses.forEach(it => {
      if (!q || it.title.toLowerCase().includes(q) || (it.titleEn && it.titleEn.toLowerCase().includes(q))) {
        results.push({
          type: 'it',
          typeLabel: 'CNTT Song ngữ',
          typeColor: '#f59e0b',
          icon: 'fas fa-laptop-code',
          title: it.title,
          sub: `${it.titleEn || ''} • ${(it.topics || []).length} bài học thực chiến`,
          action: () => {
            closeSpotlightModal();
            if (typeof openCourseModal === 'function') openCourseModal(it.id);
            else scrollToSection('it-academy');
          }
        });
      }
    });
  }

  // 5. Tech News
  if (spotlightCurrentType === 'all' || spotlightCurrentType === 'news') {
    const news = (typeof TECH_NEWS_DATA !== 'undefined' ? TECH_NEWS_DATA : []);
    news.forEach(n => {
      if (!q || n.title.toLowerCase().includes(q) || (n.summary && n.summary.toLowerCase().includes(q))) {
        results.push({
          type: 'news',
          typeLabel: 'Tin tức Tech',
          typeColor: '#38bdf8',
          icon: 'fas fa-newspaper',
          title: n.title,
          sub: `${n.readTime || '5 phút'} • Tác giả: ${n.author || 'TechNews'}`,
          action: () => {
            closeSpotlightModal();
            if (typeof openArticleModal === 'function') openArticleModal(n.id);
            else scrollToSection('tech-news');
          }
        });
      }
    });
  }

  if (results.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem 1.5rem;color:var(--text-muted)">
        <i class="fas fa-search" style="font-size:2rem;margin-bottom:.8rem;opacity:.5"></i>
        <p style="font-size:.95rem">Không tìm thấy nội dung phù hợp cho từ khóa <strong>"${escapeHtml(q)}"</strong></p>
      </div>
    `;
    return;
  }

  window.spotlightCurrentResults = results;
  container.innerHTML = results.slice(0, 15).map((r, i) => `
    <div class="spotlight-item ${i === 0 ? 'selected' : ''}" onclick="window.spotlightCurrentResults[${i}].action()">
      <div class="spotlight-item-icon" style="background:${r.typeColor}20;color:${r.typeColor}">
        <i class="${r.icon}"></i>
      </div>
      <div class="spotlight-item-content">
        <div class="spotlight-item-title">${escapeHtml(r.title)}</div>
        <div class="spotlight-item-desc">${escapeHtml(r.sub)}</div>
      </div>
      <span class="spotlight-item-badge" style="background:${r.typeColor}20;color:${r.typeColor}">
        ${escapeHtml(r.typeLabel)}
      </span>
    </div>
  `).join('');
}

// Quick Sample Course Data Filler
function fillSampleCourseData() {
  const t = document.getElementById('courseInputTitle');
  const te = document.getElementById('courseInputTitleEn');
  const cat = document.getElementById('courseInputCat');
  const lvl = document.getElementById('courseInputLevel');
  const ins = document.getElementById('courseInputInstructor');
  const yt = document.getElementById('courseInputYtUrl');
  const desc = document.getElementById('courseInputDesc');

  if (t) t.value = 'Tiếng Anh Phỏng Vấn Tech & System Design Cho Developers';
  if (te) te.value = 'Mastering Tech Interviews & System Design in English';
  if (cat) cat.value = 'it';
  if (lvl) lvl.value = 'Trung cấp (B1-B2)';
  if (ins) ins.value = 'TechLead Emma & Google Devs';
  if (yt) {
    yt.value = 'https://www.youtube.com/watch?v=kJEsTjH5mVg';
    handleYoutubeInputPreview(yt.value, 'ytMainPreview');
  }
  if (desc) desc.value = 'Khóa học video bài bản rèn luyện khả năng nói tiếng Anh tự nhiên trong phỏng vấn công ty quốc tế, trình bày sơ đồ kiến trúc vi dịch vụ và thảo luận Pull Request hiệu quả.';

  showToast('✨ Đã điền sẵn dữ liệu khóa học mẫu! Bạn có thể lưu ngay.', 'info');
}

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  // Command palette: Ctrl+K or Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openSpotlightModal();
    return;
  }

  // Escape to close active modals
  if (e.key === 'Escape') {
    closeSpotlightModal();
    closeVideoCourseModal();
    closeCreateCourseModal();
    closeAddLessonModal();
    closeClientSheetModal();
    return;
  }

  // Video modal shortcuts (ArrowLeft / ArrowRight)
  const videoModal = document.getElementById('videoCourseModal');
  if (videoModal && videoModal.style.display === 'flex') {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      playNextLesson();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      playPrevLesson();
    }
  }
});

// ============================================================
// CLIENT GOOGLE SHEETS STUDY MODE
// ============================================================
let clientSheetVocabList = [];
let clientSheetFcIndex = 0;
let isClientFcFlipped = false;
let clientSheetActiveTab = 'flashcard';
let clientSheetQuizCurrent = 0;
let clientSheetQuizScore = 0;
let clientSheetQuizAnswered = false;

function openClientSheetModal() {
  const modal = document.getElementById('clientSheetModal');
  if (modal) modal.style.display = 'flex';
}

function closeClientSheetModal() {
  const modal = document.getElementById('clientSheetModal');
  if (modal) modal.style.display = 'none';
}

function loadClientSampleSheet() {
  const input = document.getElementById('clientSheetUrlInput');
  if (input) {
    input.value = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
  }
  loadClientSheetData();
}

async function loadClientSheetData() {
  const input = document.getElementById('clientSheetUrlInput');
  const btn = document.getElementById('btnClientLoadSheet');
  const container = document.getElementById('clientSheetStudyContainer');

  const url = input ? input.value.trim() : '';
  if (!url) {
    showToast('Vui lòng dán link bảng tính Google Sheet của bạn!', 'error');
    if (input) input.focus();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang nạp bảng tính...`;
  }

  try {
    let result = null;
    const res = await fetch(`${API_BASE}/api/sheets/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type: 'vocab' })
    });

    if (res.ok) {
      result = await res.json();
    }

    if (!result || !result.success || !result.data || result.data.length === 0) {
      // Fallback to sample data for smooth demonstration
      const sampleRes = await fetch(`${API_BASE}/api/sheets/sample/vocab`).then(r => r.json()).catch(() => null);
      if (sampleRes && sampleRes.data) {
        result = {
          success: true,
          data: sampleRes.data,
          validCount: sampleRes.data.length
        };
      } else {
        showToast(result?.message || 'Không thể đọc bảng tính Google Sheet. Vui lòng kiểm tra quyền chia sẻ!', 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-bolt"></i> Nạp Bảng Tính`;
        }
        return;
      }
    }

    clientSheetVocabList = result.data;
    clientSheetFcIndex = 0;
    isClientFcFlipped = false;
    clientSheetActiveTab = 'flashcard';

    if (container) {
      container.style.display = 'block';
      renderClientSheetStudyUI();
    }

    showToast(`🎉 Đã nạp thành công ${clientSheetVocabList.length} từ vựng từ Google Sheet!`, 'success');
  } catch (err) {
    showToast('Lỗi khi nạp dữ liệu: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-bolt"></i> Nạp Bảng Tính`;
    }
  }
}

function renderClientSheetStudyUI() {
  const container = document.getElementById('clientSheetStudyContainer');
  if (!container || clientSheetVocabList.length === 0) return;

  container.innerHTML = `
    <!-- Top Study Nav -->
    <div class="sheet-tabs-nav">
      <button class="sheet-tab-btn ${clientSheetActiveTab === 'flashcard' ? 'active' : ''}" onclick="switchClientSheetTab('flashcard')">
        <i class="fas fa-clone"></i> 🗂️ Flashcard (${clientSheetVocabList.length} thẻ)
      </button>
      <button class="sheet-tab-btn ${clientSheetActiveTab === 'list' ? 'active' : ''}" onclick="switchClientSheetTab('list')">
        <i class="fas fa-list-check"></i> 📚 Danh Sách Từ Vựng
      </button>
      <button class="sheet-tab-btn ${clientSheetActiveTab === 'quiz' ? 'active' : ''}" onclick="switchClientSheetTab('quiz')">
        <i class="fas fa-circle-question"></i> 🎯 Mini Quiz Trắc Nghiệm
      </button>
    </div>

    <!-- Active Content Tab -->
    <div id="sheetTabContent">
      ${renderClientSheetActiveTabHtml()}
    </div>
  `;
}

function renderClientSheetActiveTabHtml() {
  if (clientSheetActiveTab === 'flashcard') {
    const cur = clientSheetVocabList[clientSheetFcIndex];
    if (!cur) return '';

    return `
      <div style="max-width:600px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
          <span style="font-size:.85rem;color:var(--text-secondary);font-weight:700">
            Thẻ <strong>${clientSheetFcIndex + 1}</strong> / ${clientSheetVocabList.length}
          </span>
          <span class="badge badge--cat" style="text-transform:uppercase">${cur.category || 'Vocabulary'}</span>
        </div>

        <div class="sheet-fc-card" onclick="flipClientSheetCard()" title="Nhấn để lật mặt sau">
          <div style="font-size:.78rem;color:var(--text-muted);position:absolute;top:1rem;right:1rem">
            <i class="fas fa-rotate"></i> Nhấn để lật thẻ
          </div>

          ${!isClientFcFlipped ? `
            <!-- Front -->
            <div class="sheet-fc-word">${cur.word}</div>
            <div class="sheet-fc-phonetic">${cur.phonetic || ''}</div>
            <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); speakClientSheetWord('${cur.word.replace(/'/g, "\\'")}')" style="border-radius:999px;gap:.4rem;margin-top:.5rem">
              <i class="fas fa-volume-high" style="color:#6366f1"></i> Nghe phát âm
            </button>
          ` : `
            <!-- Back -->
            <div style="font-size:.82rem;font-weight:700;color:#10b981;text-transform:uppercase;margin-bottom:.35rem">
              (${cur.pos || 'n'}) Nghĩa tiếng Việt:
            </div>
            <div class="sheet-fc-meaning">${cur.meaning}</div>
            ${cur.example ? `
              <div class="sheet-fc-example">
                "${cur.example}"
                ${cur.exampleVi ? `<div style="color:var(--text-secondary);margin-top:2px">${cur.exampleVi}</div>` : ''}
              </div>
            ` : ''}
          `}
        </div>

        <!-- Controls -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.25rem">
          <button class="btn btn--outline" onclick="prevClientSheetCard()" ${clientSheetFcIndex === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Thẻ trước
          </button>
          <button class="btn btn--ghost" onclick="speakClientSheetWord('${cur.word.replace(/'/g, "\\'")}')" title="Phát âm từ vựng">
            <i class="fas fa-volume-high" style="font-size:1.2rem;color:#10b981"></i>
          </button>
          <button class="btn btn--primary" onclick="nextClientSheetCard()" ${clientSheetFcIndex === clientSheetVocabList.length - 1 ? 'disabled' : ''} style="background:linear-gradient(135deg,#10b981,#059669);border:none">
            Thẻ tiếp theo <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  } else if (clientSheetActiveTab === 'list') {
    return `
      <div style="max-height:420px;overflow-y:auto;border:1px solid var(--border-color);border-radius:12px">
        <table class="admin-table" style="margin:0">
          <thead>
            <tr>
              <th>#</th>
              <th>Từ vựng</th>
              <th>Phiên âm</th>
              <th>Loại từ</th>
              <th>Nghĩa tiếng Việt</th>
              <th>Phát âm</th>
            </tr>
          </thead>
          <tbody>
            ${clientSheetVocabList.map((w, idx) => `
              <tr>
                <td><strong>${idx + 1}</strong></td>
                <td style="font-weight:700;color:#10b981">${w.word}</td>
                <td><span style="font-family:monospace;color:var(--text-muted)">${w.phonetic || '-'}</span></td>
                <td><span class="badge badge--pos">${w.pos || 'n'}</span></td>
                <td>${w.meaning}</td>
                <td>
                  <button class="btn btn--xs btn--ghost" onclick="speakClientSheetWord('${w.word.replace(/'/g, "\\'")}')" title="Nghe phát âm">
                    <i class="fas fa-volume-high" style="color:#6366f1"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Mini Quiz
    if (clientSheetVocabList.length < 4) {
      return `
        <div style="text-align:center;padding:2rem;color:var(--text-muted)">
          <i class="fas fa-info-circle" style="font-size:2rem;margin-bottom:.5rem;color:#38bdf8"></i>
          <p>Cần tối thiểu 4 từ vựng trong bảng tính để tạo bài kiểm tra Quiz trắc nghiệm.</p>
        </div>
      `;
    }

    const curWord = clientSheetVocabList[clientSheetQuizCurrent % clientSheetVocabList.length];
    // Generate 3 random wrong options
    const otherMeanings = clientSheetVocabList
      .filter(w => w.word !== curWord.word)
      .map(w => w.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const quizOptions = [curWord.meaning, ...otherMeanings].sort(() => 0.5 - Math.random());
    const correctIdx = quizOptions.indexOf(curWord.meaning);

    return `
      <div style="max-width:600px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <span style="font-size:.85rem;color:var(--text-secondary);font-weight:700">
            Câu <strong>${(clientSheetQuizCurrent % clientSheetVocabList.length) + 1}</strong> / ${clientSheetVocabList.length}
          </span>
          <span style="font-size:.85rem;font-weight:700;color:#10b981">
            Điểm: <strong>${clientSheetQuizScore}</strong>
          </span>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:1.5rem;text-align:center;margin-bottom:1.25rem">
          <span style="font-size:.78rem;color:var(--text-muted);text-transform:uppercase;font-weight:700">Từ vựng cần dịch:</span>
          <h3 style="font-size:2rem;font-weight:800;color:var(--text-primary);margin:.4rem 0">${curWord.word}</h3>
          <span style="font-family:monospace;color:#10b981">${curWord.phonetic || ''}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:.65rem" id="sheetQuizOptionsBox">
          ${quizOptions.map((opt, idx) => `
            <button class="sheet-tab-btn" onclick="answerClientSheetQuiz(${idx}, ${correctIdx})" style="width:100%;text-align:left;justify-content:flex-start;padding:.85rem 1rem;font-size:.92rem;border-radius:10px">
              <strong style="margin-right:.5rem;color:#10b981">${String.fromCharCode(65 + idx)}.</strong> ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
}

function switchClientSheetTab(tab) {
  clientSheetActiveTab = tab;
  renderClientSheetStudyUI();
}

function flipClientSheetCard() {
  isClientFcFlipped = !isClientFcFlipped;
  const content = document.getElementById('sheetTabContent');
  if (content) content.innerHTML = renderClientSheetActiveTabHtml();
}

function nextClientSheetCard() {
  if (clientSheetFcIndex < clientSheetVocabList.length - 1) {
    clientSheetFcIndex++;
    isClientFcFlipped = false;
    const content = document.getElementById('sheetTabContent');
    if (content) content.innerHTML = renderClientSheetActiveTabHtml();
  }
}

function prevClientSheetCard() {
  if (clientSheetFcIndex > 0) {
    clientSheetFcIndex--;
    isClientFcFlipped = false;
    const content = document.getElementById('sheetTabContent');
    if (content) content.innerHTML = renderClientSheetActiveTabHtml();
  }
}

function speakClientSheetWord(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

function answerClientSheetQuiz(selectedIdx, correctIdx) {
  const box = document.getElementById('sheetQuizOptionsBox');
  if (!box) return;

  const btns = box.querySelectorAll('button');
  btns.forEach(b => b.disabled = true);

  if (selectedIdx === correctIdx) {
    btns[selectedIdx].style.background = '#10b981';
    btns[selectedIdx].style.color = '#fff';
    btns[selectedIdx].style.borderColor = '#10b981';
    clientSheetQuizScore += 10;
    showToast('🎉 Chính xác! +10 điểm', 'success');
  } else {
    btns[selectedIdx].style.background = '#ef4444';
    btns[selectedIdx].style.color = '#fff';
    btns[selectedIdx].style.borderColor = '#ef4444';
    btns[correctIdx].style.background = '#10b981';
    btns[correctIdx].style.color = '#fff';
    showToast('Chưa đúng rồi! Hãy nhớ từ này nhé.', 'error');
  }

  setTimeout(() => {
    clientSheetQuizCurrent++;
    renderClientSheetStudyUI();
  }, 1200);
}


