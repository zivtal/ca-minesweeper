'use strict';

const MINE = '💣';
const FLAG = '🚩';
const HAPPY = '😃';
const LOSE = '😔';
const CONFIUSED = '😖';
const THINK = '🤔';
const LIVE = '❤️';
const DEATH = '❌';
const WIN = '😎';

var gLevel;
var gGame;
var gBoard;
var gUndo;
var gManual;
var gScores;
var gTimer;

function initGame(size = (gLevel) ? gLevel.size : 4, mines = (gLevel) ? gLevel.mines : 2, elBtn, mode = MODE_RANDOM) {
    renderButton(elBtn);
    var elMode = document.querySelector('.btn.level.btn-white');
    gLevel = {
        size: size,
        mines: mines,
        status: '',
        mode: mode,
        level: elMode.innerText,
        isMarkMode: (mode === MODE_MANUAL) ? true : false,
    }
    gUndo = [];
    if (!gManual) gManual = [];
    if (gGame) {
        clearTimeout(gGame.timeout);
        gGame.timeout = null;
    }
    clearInterval(gTimer);
    gTimer = null;
    gGame = createGame();
    gBoard = createBoard(gLevel.size, gGame.mines, mode);
    renderGame(gGame);
    renderBoard(gBoard);
    if (elBtn) toggleModal(gLevel.level, 1000);
    document.addEventListener('contextmenu', event => event.preventDefault());
}

function renderButton(elBtn) {
    if (elBtn) {
        var elBtns = document.querySelectorAll('.level-btn');
        for (var i = 0; i < elBtns.length; i++) {
            elBtns[i].classList.remove('btn-white');
            elBtns[i].classList.remove('highlight');
        }
        elBtns = document.querySelectorAll('.btn');
        for (var i = 0; i < elBtns.length; i++) {
            elBtns[i].classList.remove('btn-white');
            elBtns[i].classList.remove('highlight');
        }
        elBtn.classList.add('btn-white');
    }
}

function createGame(lives = 3) {
    if (gGame) {
        clearInterval(gTimer);
    }
    return {
        isOn: true,
        time: {
            start: null,
            run: null,
        },
        run: null,
        mines: gLevel.mines,
        count: {
            shown: 0,
            marked: 0,
            seccess: 0,
        },
        bonus: {
            safetyCell: 3,
            showNeigs: 3,
            isShowNeigs: false,
        },
        lives: lives,
        timeout: null,
        update: null,
    }
}

function renderGame() {
    toggleModal();
    hideScoreTable();
    renderButtons();
    renderStatus(`${gLevel.level} mode: board size: ${gLevel.size}X${gLevel.size}, mines: ${gGame.mines}`, 3000);
    renderPanel();
    gScores = readLocalstorage(gLevel.mode + gLevel.level);
    renderScoresBtn();
}

function renderButtons() {
    var elBtns = document.querySelectorAll('btn');
    for (var i = 0; i < elBtns.length; i++) {
        elBtn[i].classList.remove('btn-white');
        elBtn[i].classList.remove('highlight');
    }
    var elBtn1 = document.querySelector('.btn.safeclick');
    elBtn1.innerText = `Get safety click (${gGame.bonus.safetyCell})`;
    var elBtn2 = document.querySelector('.btn.hints');
    elBtn2.innerText = `Use hint (${gGame.bonus.showNeigs})`;
    if (gLevel.mode !== MODE_7BOOM) {
        var elBtn = document.querySelector('.btn.sevenboom');
        elBtn.classList.remove('btn-white');
    }
    var elBtn = document.querySelector('.btn.manualpos');
    elBtn.innerText = 'Manually position';
}

function renderPanel() {
    renderScore();
    renderTimer(true);
    renderLives();
    renderFlag();
}

function renderFlag() {
    var elFlag = document.querySelector('.flag-display .flag');
    elFlag.innerText = gGame.mines - (gGame.count.shown - gGame.count.seccess) - gGame.count.marked;
}

function toggleScoreTable(elBtn) {
    if (!elBtn.classList.contains('clicked') && gScores.length > 0) {
        toggleModal();
        gScores.sort(function (a, b) { b.score - a.score });
        var strHTML = `<tr style="font-weight: bold;">
        <td>Name:</td>
        <td>Time:</td>
        <td>Score:</td>
        <td>Live:</td>
        </tr>`;
        for (var i = 0; i < gScores.length; i++) {
            var player = gScores[i];
            strHTML += `<tr>
            <td>${player.name}</td>
            <td>${player.time}</td>
            <td>${player.score}</td>
            <td>${player.live}</td>
            </tr>`;
        }
        var elScoresTable = document.querySelector('.scores');
        elScoresTable.innerHTML = strHTML;
        elScoresTable.style.display = 'block';
        showScoreTable();
    } else {
        hideScoreTable();
    }
}

function showScoreTable(elBtn) {
    if (!elBtn) elBtn = document.querySelector('.scores-btn');
    elBtn.classList.add('clicked');
    var elBoard = document.querySelector('.board');
    elBoard.style.display = 'none';
}

function hideScoreTable(elBtn) {
    if (!elBtn) elBtn = document.querySelector('.scores-btn');
    elBtn.classList.remove('clicked');
    var elScoresTable = document.querySelector('.scores');
    elScoresTable.style.display = 'none';
    var elBoard = document.querySelector('.board');
    elBoard.style.display = 'block';
}

function renderScoresBtn() {
    var elScoreBtn = document.querySelector('.scores-btn');
    if (gScores.length > 0) {
        elScoreBtn.style.visibility = 'visible';
    } else {
        elScoreBtn.style.visibility = 'hidden';
    }
}

function renderEmoji(status = HAPPY) {
    var elEmoji = document.querySelector('.panel .emoji');
    elEmoji.innerHTML = status;
}

function renderLives() {
    if (gGame.lives === 3) renderEmoji(HAPPY)
    var strHTML = '';
    for (var i = 0; i < 3; i++) {
        strHTML += (i >= gGame.lives) ? DEATH : LIVE;
    }
    var elLive = document.querySelector('.panel .live-display .live');
    elLive.innerHTML = strHTML;
    return strHTML;
}

function renderScore() {
    var lives = gGame.lives / 3 * 0.9;
    var time = (1 - Math.min(0.9, gGame.time.run / 1000 / gLevel.size ** 3));
    gGame.score = Math.round(gGame.count.seccess * 10 * lives * time);
    var elScore = document.querySelector('.score-display .score');
    elScore.innerHTML = gGame.score;
}

function renderTimer(isReset = false) {
    clearInterval(gTimer);
    gTimer = null;
    var elTime = document.querySelector('.panel .time-display .time');
    if (isReset) {
        elTime.innerText = 0;
        return;
    } else {
        gGame.time.start = Date.now();
        gTimer = setInterval(function () {
            gGame.time.run = (Date.now() - gGame.time.start);
            elTime.innerText = Math.round(gGame.time.run / 1000);
        }, 500);
    }
}

function renderStatus(message, timeout = 0) {
    var elStatus = document.querySelector('div .status');
    elStatus.innerHTML = message;
    if (timeout) {
        gGame.update = setTimeout(function () {
            if (elStatus.innerHTML === message) elStatus.innerHTML = ''; //gLevel.status
        }, timeout)
    } else if (!message) {
        gLevel.status = '';
    }
}

function clickOnCell(elCell, i, j) {
    if (!gGame.isOn) return;

    if (gLevel.isMarkMode) {
        if (!elCell.classList.contains('mine')) {
            elCell.classList.add('mine');
            gManual.push({ i: i, j: j })
        }
        return;
    }

    var cell = gBoard[i][j];
    if (cell.isShown || cell.isMarked) return;

    if (gGame.bonus.isShowNeigs) {
        showNeighbours(gBoard, { i: i, j: j });
        gGame.bonus.isShowNeigs = false;
        if (gGame.bonus.showNeigs) {
            renderStatus(`Only ${gGame.bonus.showNeigs} hint(s) left.`, 1000);
        } else {
            renderStatus(`No hints left!`, 1000);
        }
        return;
    }

    if (!gGame.count.shown) {
        renderTimer();
        if (gLevel.mode === MODE_RANDOM && cell.isMine) {
            swapCell1stStep(i, j);
        }
    }

    if (cell.isMine) {
        cell.isShown = true;
        gGame.count.shown++;
        elCell.classList.add('mine');
        elCell.innerHTML = MINE;
        gGame.lives--;
        gUndo.push([gGame.time.run, { i: i, j: j }]);
        renderLives();
        renderFlag();
        renderEmoji(CONFIUSED);
        if (!gGame.lives) {
            gameOver();
            return;
        }
        gGame.timeout = setTimeout(function () {
            renderEmoji(THINK);
        }, 1500)
    } else {
        var cells = showCellNeig(gBoard, { i: i, j: j });
        cells.unshift(gGame.time.run);
        gUndo.push(cells);
    }

    renderScore();
    if (!getNonMineCells()) gameComplete();
}

function flagMark(elCell, i, j) {
    if (!gGame.isOn || gLevel.isMarkMode) return;
    var cell = gBoard[i][j];
    if (!cell.isShown) {
        if (cell.isMarked) {
            cell.isMarked = false;
            gGame.count.marked--;
            elCell.classList.remove('marked');
            elCell.innerHTML = '';
        } else {
            if (gGame.count.marked >= gGame.mines - (gGame.count.shown - gGame.count.seccess)) {
                renderStatus('maximum flags has been reached.', 1000);
                return;
            }
            cell.isMarked = true;
            gGame.count.marked++;
            elCell.classList.add('marked');
            elCell.innerHTML = FLAG;
            gUndo.push([gGame.time.run, { i: i, j: j }]);
        }
    }
    renderFlag();
}

function resetGame(message = null) {
    clearInterval(gTimer);
    gTimer = null;
    gGame.isOn = false;
    clearTimeout(gGame.timeout);
    gGame.timeout = null;
    unhideBoard(gBoard);
    renderStatus((message) ? message : `Choose level to restart game`);
}

function gameOver(message = null) {
    resetGame(message);
    renderEmoji(LOSE);
    toggleModal('GAME OVER!');
}

function gameComplete() {
    resetGame();
    unhideBoard(gBoard);
    renderEmoji(WIN);
    toggleModal('COMPLETE!');
    if (gLevel.mode !== MODE_MANUAL) {
        setTimeout(function () {
            var key = gLevel.mode + gLevel.level;
            var name = prompt('Enter your name');
            if (name) writeLocalstorage({ name: name, time: gGame.time.run / 1000, live: renderLives(), score: gGame.score }, gScores, key);
            renderScoresBtn();
        }, 500);
    }
}

function toggleModal(message = null, timeout = null) {
    var elMessage = document.querySelector('.message');
    if (message) {
        var elHeader = elMessage.querySelector('h1');
        elHeader.innerText = message;
        elMessage.style = `display:block;opacity:1;`;
    } else {
        elMessage.style = `display:none;opacity:0;`;
    }
    if (timeout) setTimeout(function () {
        if (elHeader.innerText === message) { toggleModal(); }
    }, timeout);
}
