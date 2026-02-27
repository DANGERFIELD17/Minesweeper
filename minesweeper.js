const ROWS = 9, COLS = 9, MINES = 10;
let board, gameOver, revealedCount;

function createBoard() {
  board = Array.from({length: ROWS}, () => Array.from({length: COLS}, () => ({
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    adjacentMines: 0
  })));
  gameOver = false;
  revealedCount = 0;
  placeMines();
  calculateAdjacentMines();
}

function placeMines() {
  let placed = 0;
  while (placed < MINES) {
    let r = Math.floor(Math.random() * ROWS);
    let c = Math.floor(Math.random() * COLS);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }
}

function calculateAdjacentMines() {
  const dr = [-1,-1,-1,0,0,1,1,1], dc = [-1,0,1,-1,1,-1,0,1];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let i = 0; i < 8; i++) {
        let nr = r + dr[i], nc = c + dc[i];
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) count++;
      }
      board[r][c].adjacentMines = count;
    }
  }
}

function reveal(r, c) {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
  let cell = board[r][c];
  if (cell.isRevealed || cell.isFlagged) return;
  cell.isRevealed = true;
  revealedCount++;
  if (cell.adjacentMines === 0 && !cell.isMine) {
    const dr = [-1,-1,-1,0,0,1,1,1], dc = [-1,0,1,-1,1,-1,0,1];
    for (let i = 0; i < 8; i++) {
      reveal(r + dr[i], c + dc[i]);
    }
  }
}

function renderBoard() {
  const gameDiv = document.getElementById('game');
  gameDiv.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      if (cell.isRevealed) {
        cellDiv.classList.add('revealed');
        if (cell.isMine) {
          cellDiv.classList.add('mine');
          cellDiv.textContent = '💣';
        } else if (cell.adjacentMines > 0) {
          cellDiv.textContent = cell.adjacentMines;
        }
      } else if (cell.isFlagged) {
        cellDiv.classList.add('flagged');
        cellDiv.textContent = '🚩';
      }
      cellDiv.addEventListener('click', e => {
        if (gameOver) return;
        if (e.shiftKey) {
          cell.isFlagged = !cell.isFlagged;
        } else {
          if (cell.isFlagged) return;
          if (cell.isMine) {
            cell.isRevealed = true;
            gameOver = true;
            showMessage('BOOM! Game Over!');
            revealAllMines();
          } else {
            reveal(r, c);
            if (checkWin()) {
              gameOver = true;
              showMessage('Congratulations! You win!');
            }
          }
        }
        renderBoard();
      });
      gameDiv.appendChild(cellDiv);
    }
  }
}

function revealAllMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) board[r][c].isRevealed = true;
    }
  }
}

function checkWin() {
  return revealedCount === ROWS * COLS - MINES;
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
}

document.getElementById('restart').addEventListener('click', () => {
  createBoard();
  showMessage('');
  renderBoard();
});


createBoard();
renderBoard();
