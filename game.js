// 테트로미노 모양 정의
const TETROMINOS = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
};
const COLORS = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0', S: '#00f000',
  Z: '#f00000', J: '#0000f0', L: '#f0a000'
};

const ROWS = 20, COLS = 10;
let board = Array.from({length: ROWS}, () => Array(COLS).fill(''));
let current, next, pos, score = 0, level = 1, dropInterval = 1000, timer;

function randomTetromino() {
  const keys = Object.keys(TETROMINOS);
  const key = keys[Math.floor(Math.random()*keys.length)];
  return { shape: TETROMINOS[key], type: key };
}

function drawBoard() {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.background = board[r][c] ? COLORS[board[r][c]] : '';
      boardDiv.appendChild(cell);
    }
  }
}

function drawTetromino(shape, pos, type) {
  shape.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v && pos.y + y >= 0) {
        const idx = (pos.y + y) * COLS + (pos.x + x);
        const cell = document.getElementById('board').children[idx];
        if (cell) cell.style.background = COLORS[type];
      }
    });
  });
}

function canMove(shape, pos) {
  return shape.every((row, y) =>
    row.every((v, x) => {
      if (!v) return true;
      const ny = pos.y + y, nx = pos.x + x;
      return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !board[ny][nx]);
    })
  );
}

function merge(shape, pos, type) {
  shape.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v && pos.y + y >= 0) board[pos.y + y][pos.x + x] = type;
    });
  });
}

function clearLines() {
  let cleared = 0;
  board = board.filter(row => {
    if (row.every(cell => cell)) { cleared++; return false; }
    return true;
  });
  while (board.length < ROWS) board.unshift(Array(COLS).fill(''));
  score += cleared * 100;
  if (cleared) {
    document.getElementById('score').textContent = score;
    if (score >= level * 500) {
      level++;
      document.getElementById('level').textContent = level;
      dropInterval = Math.max(100, dropInterval - 100);
      clearInterval(timer);
      timer = setInterval(gameLoop, dropInterval);
    }
  }
}

function nextTetromino() {
  current = next;
  pos = { x: 3, y: -2 };
  next = randomTetromino();
  drawNext();
  if (!canMove(current.shape, pos)) {
    alert('게임 오버!');
    clearInterval(timer);
  }
}

function drawNext() {
  const nextDiv = document.getElementById('next');
  nextDiv.innerHTML = '';
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (next.shape[y] && next.shape[y][x]) {
        cell.style.background = COLORS[next.type];
      }
      nextDiv.appendChild(cell);
    }
  }
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

function drop() {
  const newPos = { x: pos.x, y: pos.y + 1 };
  if (canMove(current.shape, newPos)) {
    pos = newPos;
  } else {
    merge(current.shape, pos, current.type);
    clearLines();
    nextTetromino();
  }
  drawBoard();
  drawTetromino(current.shape, pos, current.type);
}

function hardDrop() {
  while (canMove(current.shape, { x: pos.x, y: pos.y + 1 })) {
    pos.y++;
  }
  drop();
}

function gameLoop() {
  drop();
}

document.addEventListener('keydown', e => {
  if (!current) return;
  if (e.key === 'a' || e.key === 'A') {
    const newPos = { x: pos.x - 1, y: pos.y };
    if (canMove(current.shape, newPos)) pos = newPos;
  } else if (e.key === 'd' || e.key === 'D') {
    const newPos = { x: pos.x + 1, y: pos.y };
    if (canMove(current.shape, newPos)) pos = newPos;
  } else if (e.key === 's' || e.key === 'S') {
    const newPos = { x: pos.x, y: pos.y + 1 };
    if (canMove(current.shape, newPos)) pos = newPos;
  } else if (e.key === 'w' || e.key === 'W') {
    const rotated = rotate(current.shape);
    if (canMove(rotated, pos)) current.shape = rotated;
  } else if (e.key === ' ') {
    hardDrop();
  }
  drawBoard();
  drawTetromino(current.shape, pos, current.type);
});

function startGame() {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(''));
  score = 0; level = 1; dropInterval = 1000;
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  next = randomTetromino();
  nextTetromino();
  timer = setInterval(gameLoop, dropInterval);
}

window.onload = startGame; 