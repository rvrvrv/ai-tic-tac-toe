const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
const corners = [0, 2, 6, 8];
let boardState = [];
let emptySpaces = [];
let human = '';
let opponent = '';
let round = 0;
let gameOver = true;

// Show button with animation
function showButton(btn) {
  if (btn === 'reset') {
    $('#resetBtn')
      .removeClass('fadeOutLeft')
      .addClass('fadeInLeft')
      .show();
  } else {
    $('#newBtn')
      .removeClass('flipOutY')
      .addClass('flipInY')
      .show();
  }
}

// Hide button with animation
function hideButton(btn) {
  if (btn === 'reset') {
    $('#resetBtn')
      .removeClass('fadeInLeft')
      .addClass('fadeOutLeft');
  } else {
    $('#newBtn')
      .removeClass('flipInY')
      .addClass('flipOutY');
  }
}

// Clear and reset the board
function newGame() {
  $('.board').fadeOut(100, () => {
    gameOver = false;
    boardState = [];
    emptySpaces = [];
    round = 0;
    $('.info').hide();
    $('.start-info').show();
    $('.player').empty();
    $('#status').text("'s turn");
    $('.col-xs-4').html('&nbsp;');
    $('.col-xs-4').css({
      color: 'black',
      transition: 'color .8s .2s'
    });
  });
}

// Map state of the board to an array
function getBoardState() {
  for (let b = 0; b < 9; b++) {
    boardState[b] = $(`#${b}`).html();
  }
}

// Switch turns
function switchTurns(player, who) {
  round++;
  const next = player === 'X' ? 'O' : 'X';
  $('.player').text(next);
  if (who === 'Human') aiTurn(next);
}

// Game ends in tie
function tieGame() {
  gameOver = true;
  hideButton('reset');
  showButton('new');
  $('.player').text('');
  $('#status').text("It's a tie!");
  $('.col-xs-4').css('color', 'sienna');
}

// Return winning results
function winResults(player, winArr) {
  $('.player').text(player);
  $('#status').text(' won the game!');

  winArr.forEach((z) => {
    $(`#${z}`).css('color', 'chartreuse');
  });

  hideButton('reset');
  showButton('new');
}

// Check for victory
function winCheck(player, who) {
  const playerArr = [];
  // If player has 3 symbols on board,
  // actually check for win
  if (round > 2) {
    getBoardState();
    // Check board for one player's marks,
    // store in playerArr
    boardState.forEach((p, i) => {
      if (p === player) playerArr.push(i);
    });

    // See if player's marks match a winning line
    winningLines.forEach((winLine) => {
      if (
        playerArr.includes(winLine[0])
        && playerArr.includes(winLine[1])
        && playerArr.includes(winLine[2])
      ) {
        gameOver = true;
        return winResults(player, winLine);
      }
    });
    // If board is full and no one won, it's a tie
    if (round === 8 && !gameOver) return tieGame();
  }
  // If no won one and there is no tie, keep playing
  if (!gameOver) switchTurns(player, who);
}

// Check for one move away from a win
function checkPotentialWin(arr) {
  for (let z = 0; z < 8; z++) {
    if (
      arr.includes(winningLines[z][0])
      && arr.includes(winningLines[z][1])
      && $(`#${winningLines[z][2]}`).html() === '&nbsp;'
    ) {
      return winningLines[z][2];
    } if (
      arr.includes(winningLines[z][0])
      && arr.includes(winningLines[z][2])
      && $(`#${winningLines[z][1]}`).html() === '&nbsp;'
    ) {
      return winningLines[z][1];
    } if (
      arr.includes(winningLines[z][1])
      && arr.includes(winningLines[z][2])
      && $(`#${winningLines[z][0]}`).html() === '&nbsp;'
    ) {
      return winningLines[z][0];
    }
  }
}

// Perform AI's move
function aiMove(spot, player) {
  $(spot).text(player).css('color', 'white');
  setTimeout(() => winCheck(player, 'AI'), 500);
}

// AI Logic
function aiTurn(player) {
  // Store and display current player/opponent
  opponent = player === 'O' ? 'X' : 'O';

  // During 1st round, go for middle or random corner
  if (round === 1) {
    return ($('#4').html() === '&nbsp;')
      ? aiMove('#4', player) // Middle
      : aiMove(`#${corners[Math.floor(Math.random() * 4)]}`, player); // Corner
  }

  // During 2nd rounder or later, implement actual logic
  getBoardState();

  // Check board for self (AI) & opponent marks,
  // store in selfArr and oppArr
  const selfArr = [];
  boardState.forEach((s, i) => {
    if (s === player) selfArr.push(i);
  });
  const oppArr = [];
  boardState.forEach((o, i) => {
    if (o === opponent) oppArr.push(i);
  });

  // If there's a winning move, take it
  let move = checkPotentialWin(selfArr);
  if (move >= 0) return aiMove(`#${move}`, player);
  if (round % 2 !== 0) {
    // If human (opponent) has a winning move, and AI hasn't moved yet,
    // block human's move
    move = checkPotentialWin(oppArr);
    if (move >= 0) return aiMove(`#${move}`, player);
  }
  // Otherwise, move somewhere else
  if (round % 2 !== 0) {
    // Determine open board positions
    emptySpaces = [];
    for (let e = 0; e < 9; e++) {
      if (boardState[e] === '&nbsp;') emptySpaces.push(e);
    }
    // Pick random open spot
    const randomSpot = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
    return aiMove(`#${randomSpot}`, player);
  }
}

// INTERFACE (BUTTON ACTIONS)

// X and O buttons at start of game
$('.choice').click(function () {
  human = $(this).text();
  $('.player').text(human);
  $('.start-info').fadeOut(100, () => {
    $('.board').show();
    $('.info').show();
    showButton('reset');
  });
});

// Reset Button
$('#resetBtn').click(() => {
  hideButton('reset');
  newGame();
});

// New Game Button
$('#newBtn').click(() => {
  hideButton('new');
  newGame();
});

// When hovering over empty board space, change cursor to pointer
$('.col-xs-4').mouseenter(function () {
  if (!gameOver && $(this).html() === '&nbsp;') {
    $(this).css('cursor', 'pointer');
  }
});

// When leaving board space, restore cursor to default
$('.col-xs-4').mouseleave(function () {
  $(this).css('cursor', 'default');
});

// User clicks on board
$('.col-xs-4').click(function () {
  // First, ensure it's the user's turn
  if (round % 2 || gameOver) return;
  // Ensure space is blank
  if ($(this).html() === '&nbsp;') {
    $(this).css({
      cursor: 'default',
      color: 'white',
      transition: 'color .1s'
    });
    // Mark board, disable space, and check for win
    $(this).text(human);
    winCheck(human, 'Human');
  }
});

$(document).ready(newGame());
