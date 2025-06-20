(() => {
  const boardEl = document.querySelector('.board');
  const statusEl = document.querySelector('.status');
  const modeRadios = document.querySelectorAll('input[name="game-mode"]');
  const resetBtn = document.querySelector('.btn-reset');

  let board = Array(9).fill(null); // stores 'X', 'O', or null
  let currentPlayer = 'X';
  let gameActive = true;
  let vsAI = false;

  // Winning combinations
  const winningLines = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6] // diagonals
  ];

  // Init board cells
  function initBoard() {
    boardEl.innerHTML = '';
    for(let i=0; i<9; i++) {
      const cell = document.createElement('button');
      cell.classList.add('cell');
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Cell ${i+1}`);
      cell.setAttribute('data-index', i);
      cell.addEventListener('click', handleCellClick);
      boardEl.appendChild(cell);
    }
  }

  
  function handleCellClick(e) {
    const idx = +e.target.dataset.index;
    if(!gameActive || board[idx] !== null) return;

    makeMove(idx, currentPlayer);
    if(checkGameEnd()) return;

    switchPlayer();

    if(vsAI && gameActive && currentPlayer === 'O') {
      // AI move with slight delay for better UX
      setTimeout(aiMove, 350);
    }
  }

  // Make a move
  function makeMove(idx, player) {
    board[idx] = player;
    const cell = boardEl.querySelector(`button[data-index="${idx}"]`);
    cell.textContent = player;
    cell.classList.add('occupied', player.toLowerCase());
    cell.setAttribute('aria-label', `Cell ${idx+1}, ${player}`);
  }

  // Switch player
  function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`Player ${currentPlayer}'s turn`);
  }

  // Check for win or draw
  function checkGameEnd() {
    for(const line of winningLines) {
      const [a,b,c] = line;
      if(board[a] && board[a] === board[b] && board[b] === board[c]) {
        // We have a winner
        gameActive = false;
        highlightWin(line);
        updateStatus(`Player ${board[a]} wins!`);
        disableBoard();
        return true;
      }
    }
    if(board.every(cell => cell !== null)) {
      gameActive = false;
      updateStatus("It's a draw!");
      disableBoard();
      return true;
    }
    return false;
  }

  // Highlight winning combination
  function highlightWin(indices) {
    indices.forEach(i => {
      const cell = boardEl.querySelector(`button[data-index="${i}"]`);
      cell.style.background = 'linear-gradient(135deg, #8b5cf6, #06b6d4)';
      cell.style.color = '#fff';
    });
  }

  // Disable board after game end
  function disableBoard() {
    boardEl.querySelectorAll('button.cell').forEach(cell => {
      cell.classList.add('disabled');
      cell.disabled = true;
    });
  }

  // Enable board on reset
  function enableBoard() {
    boardEl.querySelectorAll('button.cell').forEach(cell => {
      cell.classList.remove('disabled');
      cell.disabled = false;
      cell.style.background = '';
      cell.style.color = '';
    });
  }

  // Update status text
  function updateStatus(text) {
    statusEl.textContent = text;
  }

  // AI move logic: check winning, block losing, else random
  function aiMove() {
    if (!gameActive) return;
    // Try to win
    let move = findBestMove('O');
    // Try to block
    if (move === -1) move = findBestMove('X');
    // Else random
    if (move === -1) move = findRandomMove();

    if(move !== -1) {
      makeMove(move, 'O');
      if(checkGameEnd()) return;
      switchPlayer();
    }
  }

  // Find best move for player to win next round
  function findBestMove(player) {
    for(const line of winningLines) {
      const marks = line.map(i => board[i]);
      if(marks.filter(mark => mark === player).length === 2 && marks.includes(null)) {
        // Return index of empty cell
        return line[marks.indexOf(null)];
      }
    }
    return -1;
  }

  // Find random available cell index
  function findRandomMove() {
    const emptyIndices = board.map((v,i) => v === null ? i : -1).filter(i => i !== -1);
    if(emptyIndices.length === 0) return -1;
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Reset game to initial state
  function resetGame() {
    board.fill(null);
    currentPlayer = 'X';
    gameActive = true;
    enableBoard();
    updateStatus(`Player ${currentPlayer}'s turn`);
    boardEl.querySelectorAll('button.cell').forEach(cell => cell.textContent = '');
  }

  // Change game mode handler
  function onModeChange(e) {
    vsAI = e.target.value === 'ai';
    resetGame();
  }

  // Initialize
  function init() {
    initBoard();
    updateStatus(`Player ${currentPlayer}'s turn`);
    modeRadios.forEach(radio =>
      radio.addEventListener('change', onModeChange));
    resetBtn.addEventListener('click', resetGame);
  }

  init();

})();
