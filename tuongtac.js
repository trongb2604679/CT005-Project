// ==========================================
// HỆ THỐNG ĐIỀU HƯỚNG SPA
// ==========================================
let currentGame = 'memory';
let isGameRunning = false;

function switchGame(gameType) {
  currentGame = gameType;
  isGameRunning = false;

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeNavBtn = document.querySelector(`.nav-btn[data-game="${gameType}"]`);
  if (activeNavBtn) activeNavBtn.classList.add('active');

  stopCakeGame();
  clearMemoryTimeouts();

  const memoryWrapper = document.getElementById('memoryWrapper');
  const canvasWrapper = document.getElementById('canvasWrapper');
  const themeSelector = document.getElementById('themeSelector');

  if (gameType === 'memory') {
    document.getElementById('gameTitle').textContent = "🎴 Lật Thẻ Bài";
    memoryWrapper.style.display = 'grid';
    canvasWrapper.style.display = 'none';
    themeSelector.style.display = 'flex';
    setupMemoryReadyState();
  } else if (gameType === 'cake') {
    document.getElementById('gameTitle').textContent = "🎂 Xếp Bánh Kem";
    memoryWrapper.style.display = 'none';
    canvasWrapper.style.display = 'block';
    themeSelector.style.display = 'none';
    setupCakeReadyState();
  }
}

function pressStartButton() {
  document.getElementById('startOverlay').style.display = 'none';
  isGameRunning = true;
  if (currentGame === 'cake') startCakeGame();
}

// ==========================================
// GAME 1: LẬT THẺ BÀI
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

// ==========================================
// GAME 2: XẾP TÒA NHÀ BÁNH KEM
// ==========================================
let cakeLoop = null;
let stack = [], fallingPieces = [], stars = [];
let currentBlock = null, cakeScore = 0;
let cakeSpeed = 2.5, cakeDir = 1;
let plateY = 375;
const BLOCK_HEIGHT = 26;

const CAKE_COLORS = [
  { body: '#f43f5e', cream: '#fff1f2', cherry: '#be123c' },
  { body: '#fb923c', cream: '#fff7ed', cherry: '#c2410c' },
  { body: '#facc15', cream: '#fefce8', cherry: '#a16207' },
  { body: '#4ade80', cream: '#f0fdf4', cherry: '#15803d' },
  { body: '#38bdf8', cream: '#f0f9ff', cherry: '#0369a1' },
  { body: '#a855f7', cream: '#faf5ff', cherry: '#6b21a8' },
  { body: '#ec4899', cream: '#fdf2f8', cherry: '#be185d' }
];

function setupCakeReadyState() {
  document.getElementById('dashboard').innerHTML = `
    <span>Tầng bánh: <span id="cakeScore">0</span></span>
    <span>Thao tác: Click / Space</span>
  `;
  document.getElementById('previewMessage').textContent = "Căn thời điểm thật chuẩn để thả bánh kem trùng khớp!";
  document.getElementById('startOverlay').style.display = 'flex';
  document.getElementById('overlayTitle').textContent = "🎂 XẾP TÒA NHÀ BÁNH KEM";

  const canvas = document.getElementById('mainCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400; 
  canvas.height = 400;

  stars = [];
  for (let i = 0; i < 35; i++) {
    stars.push({
      x: Math.random() * 400,
      y: Math.random() * 250,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random()
    });
  }

  stack = [];
  fallingPieces = [];
  cakeScore = 0;
  plateY = 375;

  stack.push({
    x: 100,
    y: 340,
    width: 200,
    color: CAKE_COLORS[0]
  });

  spawnNewBlock();
  renderCakeGame(ctx);
}

function spawnNewBlock() {
  let topBlock = stack[stack.length - 1];
  let colorIdx = stack.length % CAKE_COLORS.length;
  currentBlock = {
    x: 0,
    y: topBlock.y - BLOCK_HEIGHT,
    width: topBlock.width,
    color: CAKE_COLORS[colorIdx]
  };
  cakeDir = 1;
  cakeSpeed = 2.8 + (cakeScore * 0.28);
}

function startCakeGame() {
  const canvas = document.getElementById('mainCanvas');
  const ctx = canvas.getContext('2d');

  const dropAction = (e) => {
    if (currentGame === 'cake' && isGameRunning && currentBlock) {
      if (e && e.type === 'keydown' && e.code !== 'Space') return;
      dropCakeBlock();
    }
  };

  window.onkeydown = dropAction;
  canvas.onclick = dropAction;

  stopCakeGame();
  cakeLoop = setInterval(() => updateCakeGame(ctx), 1000 / 60);
}

function dropCakeBlock() {
  let prevBlock = stack[stack.length - 1];
  let deltaX = currentBlock.x - prevBlock.x;

  if (Math.abs(deltaX) >= currentBlock.width) {
    fallingPieces.push({
      x: currentBlock.x,
      y: currentBlock.y,
      width: currentBlock.width,
      vy: 2,
      color: currentBlock.color
    });
    currentBlock = null;
    stopCakeGame();
    isGameRunning = false;
    alert(`💥 GAME OVER!\nBạn đã thả hụt bánh kem!\nĐộ cao tòa nhà: ${cakeScore} tầng`);
    return;
  }

  let newWidth = currentBlock.width - Math.abs(deltaX);
  let newX = deltaX > 0 ? currentBlock.x : prevBlock.x;

  let pieceWidth = Math.abs(deltaX);
  let pieceX = deltaX > 0 ? newX + newWidth : currentBlock.x;

  if (pieceWidth > 0) {
    fallingPieces.push({
      x: pieceX,
      y: currentBlock.y,
      width: pieceWidth,
      vy: 2,
      color: currentBlock.color
    });
  }

  stack.push({
    x: newX,
    y: currentBlock.y,
    width: newWidth,
    color: currentBlock.color
  });

  cakeScore++;
  document.getElementById('cakeScore').textContent = cakeScore;

  if (stack.length > 8) {
    stack.forEach(b => b.y += BLOCK_HEIGHT);
    plateY += BLOCK_HEIGHT;
  }

  spawnNewBlock();
}

function updateCakeGame(ctx) {
  if (currentBlock) {
    currentBlock.x += cakeSpeed * cakeDir;
    if (currentBlock.x + currentBlock.width > 400) {
      currentBlock.x = 400 - currentBlock.width;
      cakeDir = -1;
    } else if (currentBlock.x < 0) {
      currentBlock.x = 0;
      cakeDir = 1;
    }
  }

  fallingPieces.forEach((p, idx) => {
    p.y += p.vy;
    p.vy += 0.4;
    if (p.y > 450) fallingPieces.splice(idx, 1);
  });

  renderCakeGame(ctx);
}

function renderCakeGame(ctx) {
  let bgGrad = ctx.createLinearGradient(0, 0, 0, 400);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
  ctx.beginPath(); 
  ctx.arc(330, 70, 45, 0, Math.PI * 2); 
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath(); 
  ctx.arc(330, 70, 30, 0, Math.PI * 2); 
  ctx.fill();

  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    ctx.globalAlpha = Math.abs(Math.sin(Date.now() * 0.002 + s.alpha * 10));
    ctx.beginPath(); 
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); 
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  if (plateY < 450) {
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(200, plateY, 140, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  stack.forEach(b => drawCakeLayer(ctx, b.x, b.y, b.width, b.color));

  if (currentBlock) {
    drawCakeLayer(ctx, currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.color);
  }

  fallingPieces.forEach(p => drawCakeLayer(ctx, p.x, p.y, p.width, p.color));
}

function drawCakeLayer(ctx, x, y, width, color) {
  ctx.save();
  ctx.fillStyle = color.body;
  ctx.fillRect(x, y, width, BLOCK_HEIGHT);

  ctx.fillStyle = color.cream;
  ctx.fillRect(x, y, width, 7);

  let waveStep = 12;
  for (let i = 0; i < width; i += waveStep) {
    ctx.beginPath();
    ctx.arc(x + i + 6, y + 7, 4, 0, Math.PI);
    ctx.fill();
  }

  if (width >= 30) {
    ctx.fillStyle = color.cherry;
    ctx.beginPath();
    ctx.arc(x + width / 2, y - 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(x, y + BLOCK_HEIGHT - 4, width, 4);
  ctx.restore();
}

function stopCakeGame() {
  if (cakeLoop) clearInterval(cakeLoop);
}

// Khởi chạy khi load trang
window.addEventListener('DOMContentLoaded', () => {
  switchGame('memory');
});