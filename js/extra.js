'use strict';

function safeClick(elBtn) {
    if (!gGame.isOn || gLevel.isMarkMode) return;
    if (gGame.bonus.isShowNeigs) return;
    if (!gGame.bonus.safetyCell) return;
    var position = getNonMineCells();
    var elCell = document.querySelector('.' + getClassName(position));
    elCell.classList.add('highlight');
    clearTimeout(gGame.timeout);
    setTimeout(function () {
        elCell.classList.remove('highlight');
    }, 1000)
    gGame.bonus.safetyCell--;
    if (gGame.bonus.safetyCell > 0) {
        renderStatus(`Only ${gGame.bonus.safetyCell} safety click(s) left.`, 1000);
    } else {
        renderStatus(`No safety clicks left!`, 1000);
    }
    elBtn.innerText = `Get safety click (${gGame.bonus.safetyCell})`;
}

function useHints(elBtn) {
    if (!gGame.isOn || gLevel.isMarkMode || gGame.bonus.isShowNeigs || !gGame.bonus.showNeigs) return;
    gGame.bonus.showNeigs--;
    gGame.bonus.isShowNeigs = true;
    elBtn.innerText = `Use hint (${gGame.bonus.showNeigs})`;
    elBtn.classList.add('highlight');
}

function undoMove() {
    if (!gGame.isOn) return;
    if (gLevel.isMarkMode) return;
    if (gGame.bonus.isShowNeigs) return;
    if (!gUndo.length) {
        initGame();
        return;
    }
    var resetCells = gUndo.pop();
    // // UNDO TIME
    // if (gUndo.length > 0) {
    //     var prevRun = (gUndo[gUndo.length - 1][0]);
    //     if (prevRun) gGame.time.start += (resetCells[0] - prevRun);
    // } else {
    //     renderTimer(true);
    // }
    for (var i = 1; i < resetCells.length; i++) {
        var position = resetCells[i];
        var cell = gBoard[position.i][position.j];
        if (cell.isShown) {
            gGame.count.shown--;
            cell.isShown = false;
        }
        if (cell.isMarked) {
            gGame.count.marked--;
            cell.isMarked = false;
        } else if (cell.isMine) {
            gGame.lives++;
        } else {
            gGame.count.seccess--;
        }
        var elCell = document.querySelector('.' + getClassName(position));
        elCell.classList.remove('marked', 'pressed', 'mine');
        elCell.innerHTML = '';
    }
    renderLives();
    renderFlag();
    renderScore(gGame.count.seccess);
}

function setSevenBoomMode(elBtn) {
    if (gTimer) return;
    if (!gGame.isOn || gLevel.mode === MODE_MANUAL) return;
    clearTimeout(gGame.timeout);
    gGame.timeout = null;
    if (gLevel.mode !== MODE_7BOOM) {
        gLevel.mode = MODE_7BOOM;
        initGame(gLevel.size, gGame.mines, null, MODE_7BOOM);
        elBtn.classList.add('btn-white');
        toggleModal('7-BOOM MODE', 1000);
    } else {
        elBtn.classList.remove('btn-white');
        initGame(gLevel.size, gLevel.mines, null, MODE_RANDOM);
        elBtn.classList.remove('btn-white');
        toggleModal(gLevel.level, 1000);
    }
    gScores = readLocalstorage(gLevel.mode + gLevel.level);
    renderScoresBtn();
}

function setMinesPositions(elBtn) {
    if (gTimer) return;
    if (!gGame.isOn || gLevel.mode === MODE_7BOOM) return;
    gLevel.isMarkMode = !gLevel.isMarkMode;
    if (gLevel.isMarkMode) {
        elBtn.classList.add('highlight');
        elBtn.innerText = 'Apply';
        renderStatus(`Put mines on board and press "apply" when done!`);
        gBoard = createBoard(gLevel.size, 0, MODE_MANUAL);
        renderBoard(gBoard);
        toggleModal('CUSTOM MODE!', 1000);
    } else if (gManual.length > 0) {
        gLevel.mode = MODE_MANUAL;
        elBtn.classList.remove('highlight');
        elBtn.innerText = 'Manually position';
        elBtn.classList.add('btn-white');
        gGame.mines = gManual.length;
        renderStatus(`${elBtn.innerText} mode: board size ${gLevel.size}X${gLevel.size}, mines: ${gGame.mines}`, 3000);
        gBoard = createBoard(gLevel.size, gGame.mines, MODE_MANUAL);
        renderBoard(gBoard);
        renderPanel();
        gManual = [];
    } else {
        gGame.isOn = false;
        gLevel.mode = MODE_RANDOM;
        elBtn.classList.remove('highlight');
        elBtn.innerText = 'Manually position';
        var elMode = document.querySelector('.level-btn.btn-white');
        renderStatus(`No mines on board, game will be set to "${gLevel.level}" mode...`);
        gGame.timeout = setTimeout(function () {
            initGame(gLevel.size, gGame.mines, elMode);
        }, 2000);
    }
    gScores = readLocalstorage(gLevel.mode + gLevel.level);
    renderScoresBtn();
}

