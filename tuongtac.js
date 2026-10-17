// SYSTEM NAVIGATION & STATE
let currentGame = 'memory';
let isGameRunning = false;

function switchGame(gameType) {
  currentGame = gameType;
  isGameRunning = false;

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeNavBtn = document.querySelector(`.nav-btn[data-game="${gameType}"]`);
  if (activeNavBtn) activeNavBtn.classList.add('active');

  clearMemoryTimeouts();

  const memoryWrapper = document.getElementById('memoryWrapper');
  const themeSelector = document.getElementById('themeSelector');

  if (gameType === 'memory') {
    document.getElementById('gameTitle').textContent = "🎴 Lật Thẻ Bài";
    memoryWrapper.style.display = 'grid';
    themeSelector.style.display = 'flex';
    setupMemoryReadyState();
  }
}

// ==========================================
// GAME 1: LẬT BÀI
// ==========================================
const themes = [
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐸', '🐵'],
  ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🥑', '🍍', '🍑', '🥝', '🍔', '🍕'],
  ['🚗', '🚀', '✈️', '⛵', '🚁', '🚜', '🏎️', '🚲', '🚚', '🚒', '🚑', '🏍️'],
  ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🎯']
];
let themeIdx = 0, memoryTimer = null, previewInterval = null;
let memSeconds = 0, memMoves = 0, memMatched = 0;
let firstCard = null, secondCard = null, memLock = true;
let memoryTimeouts = [];

function clearMemoryTimeouts() {
  memoryTimeouts.forEach(t => clearTimeout(t));
  memoryTimeouts = [];
  if (previewInterval) clearInterval(previewInterval);
  if (memoryTimer) clearInterval(memoryTimer);
}

function changeMemoryTheme(index) {
  themeIdx = index;
  document.querySelectorAll('.theme-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === index);
  });
  setupMemoryReadyState();
}

function setupMemoryReadyState() {
  clearMemoryTimeouts();
  memLock = true;
  document.getElementById('dashboard').innerHTML = `
    <span>Thời gian: <span id="memTime">00:00</span></span>
    <span>Lật bài: <span id="memMoves">0</span></span>
  `;
  document.getElementById('previewMessage').textContent = "Nhấn 'BẮT ĐẦU CHƠI' để lật mở bộ bài ghi nhớ!";
  document.getElementById('memoryOverlay').style.display = 'flex';

  const board = document.getElementById('memoryBoard');
  board.innerHTML = '';
  let icons = themes[themeIdx];
  let cards = [...icons, ...icons].sort(() => Math.random() - 0.5);

  cards.forEach(icon => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.icon = icon;
    card.innerHTML = `<div class="front-face">${icon}</div><div class="back-face">❓</div>`;
    card.addEventListener('click', flipCard);
    board.appendChild(card);
  });
}

function startMemoryGameFromOverlay() {
  clearMemoryTimeouts();
  document.getElementById('memoryOverlay').style.display = 'none';
  isGameRunning = true;
  
  memSeconds = 0; 
  memMoves = 0; 
  memMatched = 0; 
  memLock = true;
  firstCard = null; 
  secondCard = null;

  const msg = document.getElementById('previewMessage');
  msg.textContent = "✨ Đang mở bộ bài...";

  const cards = document.querySelectorAll('.card');
  
  cards.forEach((card, index) => {
    let t = setTimeout(() => {
      card.classList.add('flip');

      if (index === cards.length - 1) {
        let t2 = setTimeout(() => {
          startMemoryCountdown();
        }, 300);
        memoryTimeouts.push(t2);
      }
    }, index * 40);
    memoryTimeouts.push(t);
  });
}

function startMemoryCountdown() {
  const msg = document.getElementById('previewMessage');
  let count = 5;
  msg.textContent = `Ghi nhớ vị trí: ${count}s`;
  
  previewInterval = setInterval(() => {
    count--;
    if (count > 0) {
      msg.textContent = `Ghi nhớ vị trí: ${count}s`;
    } else {
      clearInterval(previewInterval);
      msg.textContent = "🚀 Bắt đầu ghép bài!";
      document.querySelectorAll('.card').forEach(c => c.classList.remove('flip'));
      memLock = false;
      
      memoryTimer = setInterval(() => {
        memSeconds++;
        let m = String(Math.floor(memSeconds / 60)).padStart(2, '0');
        let s = String(memSeconds % 60).padStart(2, '0');
        document.getElementById('memTime').textContent = `${m}:${s}`;
      }, 1000);
    }
  }, 1000);
}

function flipCard() {
  if (memLock || !isGameRunning || this === firstCard) return;
  this.classList.add('flip');

  if (!firstCard) { 
    firstCard = this; 
    return; 
  }
  secondCard = this;
  memMoves++;
  document.getElementById('memMoves').textContent = memMoves;

  if (firstCard.dataset.icon === secondCard.dataset.icon) {
    let c1 = firstCard, c2 = secondCard;
    let t = setTimeout(() => { 
      c1.classList.add('matched'); 
      c2.classList.add('matched'); 
    }, 400);
    memoryTimeouts.push(t);

    memMatched++;
    [firstCard, secondCard] = [null, null];
    if (memMatched === themes[themeIdx].length) {
      clearInterval(memoryTimer);
      alert(`🎉 CHIẾN THẮNG!\nThời gian: ${document.getElementById('memTime').textContent}\nLượt lật: ${memMoves}`);
    }
  } else {
    memLock = true;
    let t = setTimeout(() => {
      if (firstCard) firstCard.classList.remove('flip');
      if (secondCard) secondCard.classList.remove('flip');
      [firstCard, secondCard] = [null, null];
      memLock = false;
    }, 800);
    memoryTimeouts.push(t);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  switchGame('memory');
});