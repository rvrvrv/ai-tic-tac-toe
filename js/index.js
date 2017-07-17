/*jshint browser: true, esversion: 6*/
/* global $, console */

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
let round = 0;
let opponent = '';
let gameOver = true;

$(document).ready(newGame());

//Clear and reset the board
function newGame() {
	$('.board').fadeOut(100, () => {
		gameOver = false;
		round = 0;
		$('.info').hide();
		$('.startInfo').show();
		for (var i = 0; i < 9; i++) {
			$('#' + i).html('&nbsp;');
			$('#' + i).css('color', 'white');
		}
		$('#player').empty();
		$('#status').text('\'s turn');
	});
}

//Check for victory
function winCheck(player, who) {
	var playerArr = [];
	//If player has 3 symbols on board,
	//actually check for win
	if (round > 2) {
		getBoardState();
		//Check board for one player's marks,
		//store in playerArr
		boardState.forEach(function (p, index) {
			if (p === player) playerArr.push(index);
		});

		//See if player's marks match a winning line
		winningLines.forEach(function (winLine) {
			if (
				playerArr.includes(winLine[0]) &&
				playerArr.includes(winLine[1]) &&
				playerArr.includes(winLine[2])
			) {
				gameOver = true;
				return winResults(player, winLine);
			}
		});
		//If board is full and no one won, it's a tie
		if (round === 9 && !gameOver) tieGame();
	}
	//If no won one and there is no tie, keep playing
	if (!gameOver) {
		switchTurns(player, who);
	}
}

//Return winning results
function winResults(player, winArr) {
	$('#player').text(player);
	$('#status').text(' won the game!');

	winArr.forEach(function (z) {
		$('#' + z).css('color', 'chartreuse');
	});

	hideButton('reset');
	showButton('new');
}

//Game ends in tie
function tieGame() {
	gameOver = true;
	hideButton('reset');
	showButton('new');
	$('#player').text('');
	$('#status').text('It\'s a tie!');
	for (var m = 0; m < 9; m++) {
		$('#' + m).css('color', 'sienna');
	}
}

//Switch turns
function switchTurns(player, who) {
	round++;
	if (who === 'Human') {
		aiTurn(`${player === 'X' ? 'O' : 'X'}`);
	}
}

//AI Logic
function aiTurn(player) {
	console.log('AI Turn, Round: ' + round);
	//Store player/opponent
	opponent = player === 'O' ? 'X' : 'O';

	//During 1st round, go for middle or corner
	if (round === 1) {
		//Take middle position
		if ($('#4').html() === '&nbsp;') return aiMove('#4', player);
		else
			//Otherwise, take random corner
			return aiMove('#' + corners[Math.floor(Math.random() * 4)], player);
	}
	//During 2nd rounder or later, implement actual logic
	getBoardState();

	//Check board for self (AI) & opponent marks,
	//store in selfArr and oppArr
	let selfArr = [];
	boardState.forEach((s, index) => {
		if (s === player) selfArr.push(index);
	});
	let oppArr = [];
	boardState.forEach((o, index) => {
		if (o === opponent) oppArr.push(index);
	});

	//If there's a winning move, take it
	let move = checkPotentialWin(selfArr, player);
	if (!isNaN(move)) return aiMove('#' + move, player);
	else if (round % 2 !== 0 && isNaN(move)) {
		//If human (opponent) has a winning move, and AI hasn't moved yet,
		//block human's move
		let move = checkPotentialWin(oppArr, player);
		if (!isNaN(move)) return aiMove('#' + move, player);
	}
	//Otherwise, move somewhere else
	if (round % 2 !== 0) {
		//Determine open board positions
		emptySpaces = [];
		for (var e = 0; e < 9; e++) {
			if (boardState[e] === '&nbsp;') emptySpaces.push(e);
		}
		//Pick random open spot
		var randomSpot =
			emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
		return aiMove('#' + randomSpot, player);
	}
}

//Perform AI's move
function aiMove(spot, player) {
	$(spot).text(player);
	winCheck(player, 'AI');
}

//Check for one move away from a win
function checkPotentialWin(arr, player) {
	let move = false;
	for (var z = 0; z < 8; z++) {
		if (
			arr.includes(winningLines[z][0]) &&
			arr.includes(winningLines[z][1]) &&
			$('#' + winningLines[z][2]).html() === '&nbsp;'
		) {
			move = winningLines[z][2];
			break;
		} else if (
			arr.includes(winningLines[z][0]) &&
			arr.includes(winningLines[z][2]) &&
			$('#' + winningLines[z][1]).html() === '&nbsp;'
		) {
			move = winningLines[z][1];
			break;
		} else if (
			arr.includes(winningLines[z][1]) &&
			arr.includes(winningLines[z][2]) &&
			$('#' + winningLines[z][0]).html() === '&nbsp;'
		) {
			move = winningLines[z][0];
			break;
		}
	}
	//If a potential move was found, return that move
	if (move) return move;
}

//Map state of the board to an array
function getBoardState() {
	for (var b = 0; b < 9; b++) {
		boardState[b] = $('#' + b).html();
	}
}

//Show button with animation
function showButton(btn) {
	if (btn === 'reset')
		$('#resetBtn').removeClass('fadeOutLeft').addClass('fadeInLeft').show();
	else $('#newBtn').removeClass('flipOutY').addClass('flipInY').show();
}

//Hide button with animation
function hideButton(btn) {
	if (btn === 'reset')
		$('#resetBtn').removeClass('fadeInLeft').addClass('fadeOutLeft');
	else $('#newBtn').removeClass('flipInY').addClass('flipOutY');
}

//INTERFACE (BUTTON ACTIONS)

//X and O buttons at start of game
$('#choiceX').click(() => {
	$('#player').text('X');
	$('.startInfo').fadeOut(100, () => {
		$('.board').show();
		$('.info').show();
		showButton('reset');
	});
});

$('#choiceO').click(function() {
	$('#player').text('O');
	$('.startInfo').fadeOut(100, () => {
		$('.board').show();
		$('.info').show();
		showButton('reset');
	});
});

//Reset Button
$('#resetBtn').click(() => {
	hideButton('reset');
	newGame();
});

//New Game Button
$('#newBtn').click(() => {
	hideButton('new');
	newGame();
});

//When hovering over empty board space, change cursor to pointer
$('.col-xs-4').mouseenter(function () {
	if (!gameOver && $(this).html() === '&nbsp;') {
		$(this).css('cursor', 'pointer');
	}
});

//When leaving board space, restore cursor to default
$('.col-xs-4').mouseleave(function () {
	$(this).css('cursor', 'default');
});

//User clicks on board
$('.col-xs-4').click(function () {
	let human = $('#player').text();
	if (!gameOver) {
		//Ensure space is blank
		if ($(this).html() === '&nbsp;') {
			$(this).css('cursor', 'default');
			//Mark board, disable space, and check for win
			$(this).text(human);
			winCheck(human, 'Human');
		}
	}
});
