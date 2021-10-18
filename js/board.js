'use strict';

const MODE_RANDOM = '_RANDOM';
const MODE_7BOOM = '_7BOOM';
const MODE_MANUAL = '_MANUAL';

function createBoard(size = 4, mines = 2, mode = MODE_RANDOM) {
    var possitions = [];
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            possitions.push({ i: i, j: j })
        }
    }
    switch (mode) {
        case MODE_7BOOM:
            putSevenBoomMines(board, possitions);
            break;
        case MODE_MANUAL:
            putMinesOnBoard(board, gManual, null, MODE_MANUAL);
            break;
        default:
        case MODE_RANDOM:
            putMinesOnBoard(board, possitions, mines);
            break;

    }
    setAroundCount(board, possitions)
    return board;
}

function putSevenBoomMines(board, positions) {
    var count = 0;
    for (var i = 1; i < positions.length; i++) {
        var position = positions[i];
        if (i.toString().includes('7') || i % 7 === 0) {
            board[position.i][position.j].isMine = true;
            count++;
        }
    }
    gGame.mines = count;
}

function putMinesOnBoard(board, positions, mines, mode) {
    var positions = positions.slice();
    if (!mines) mines = positions.length;
    for (var i = 0; i < mines && positions.length > 0; i++) {
        var mine = (mode === MODE_MANUAL) ? positions.pop() : positions.splice(getRandomInt(0, positions.length - 1), 1)[0];
        board[mine.i][mine.j].isMine = true;
    }
}

function setAroundCount(board, positions) {
    for (var i = 0; i < positions.length; i++) {
        setCellMinesCount(board, positions[i]);
    }
}

function setCellMinesCount(board, position = { i: null, j: null }, reCall = false) {
    var count = 0;
    for (var i = position.i - 1; i <= position.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = position.j - 1; j <= position.j + 1; j++) {
            if (i === position.i && j === position.j) continue;
            if (j < 0 || j > board[i].length - 1) continue;
            if (board[i][j].isMine) count++;
            if (reCall) setCellMinesCount(board, { i: i, j: j }, false);
        }
    }
    board[position.i][position.j].minesAroundCount = count;
}

function getNeighbours(board, position = { i: null, j: null }, isIncluded = true) {
    var neighbours = [];
    for (var i = position.i - 1; i <= position.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = position.j - 1; j <= position.j + 1; j++) {
            if (!isIncluded && i === position.i && j === position.j) continue;
            if (j < 0 || j > board[i].length - 1) continue;
            neighbours.push({ i: i, j: j });
        }
    }
    return neighbours;
}

function showCellNeig(board, position = { i: i, j: j }, expended = true, moves = []) {
    var positions;
    var cell = board[position.i][position.j];
    if (!cell.minesAroundCount) {
        positions = getNeighbours(board, position, true);
    } else {
        positions = [position];
    }
    for (var i = 0; i < positions.length; i++) {
        var current = positions[i];
        cell = board[current.i][current.j];
        if (cell.isShown) continue;
        cell.isShown = true;
        gGame.count.shown++;
        gGame.count.seccess++;
        moves.push(current);
        var cellClassname = getClassName(current);
        var elCell = document.querySelector('.' + cellClassname);
        elCell.classList.add('pressed');
        if (cell.minesAroundCount && !cell.isMine) {
            elCell.innerHTML = cell.minesAroundCount;
        }
        showCellNeig(board, current, expended, moves)
    }
    return moves;
}

function getNonMineCells(excludeCell = { i: null, j: null }) {
    var positions = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            if (excludeCell.i === i && excludeCell.j === j) continue;
            if (!cell.isMine && !cell.isShown) positions.push({ i: i, j: j });
        }
    }
    positions = shuffle(positions);
    return positions.pop();
}

function swapCell1stStep(i, j) {
    var position = getNonMineCells({ i: i, j: j });
    gBoard[i][j].isMine = false;
    gBoard[position.i][position.j].isMine = true;
    setCellMinesCount(gBoard, { i: i, j: j }, true);
    setCellMinesCount(gBoard, position, true);
}

function showNeighbours(board, position) {
    var positions = getNeighbours(board, position, true);
    var elBtn = document.querySelector('.btn.hints');
    elBtn.classList.remove('highlight');

    for (var i = 0; i < positions.length; i++) {
        var current = positions[i];
        var cell = board[current.i][current.j];
        if (cell.isShown) continue;
        var cellClassname = getClassName(current);
        var elCell = document.querySelector('.' + cellClassname);
        if (cell.isMine) {
            elCell.innerHTML = MINE;
        } else if (cell.minesAroundCount) {
            elCell.innerHTML = cell.minesAroundCount;
        }
        elCell.classList.add('highlight');
    }
    setTimeout(function () {
        for (var i = 0; i < positions.length; i++) {
            var current = positions[i];
            var cell = board[current.i][current.j];
            if (cell.isShown) continue;
            var cellClassname = getClassName(current);
            var elCell = document.querySelector('.' + cellClassname);
            if (!cell.isMarked) elCell.innerHTML = '';
            elCell.classList.remove('highlight');
        }
    }, 1000)
}

function renderBoard(board) {
    var size = (470 - gLevel.size * 1.5) / gLevel.size;
    var height = 28 * (16 / board.length);
    var width = 28 * (16 / board.length);
    var font = Math.round(height * 0.5);
    var strHTML = ``;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[i].length; j++) {
            strHTML += `<td class="${getClassName({ i, j })}" style="height:${size}px;width:${size}px;font-size:${font}px;" onclick="clickOnCell(this,${i},${j})" oncontextmenu="flagMark(this,${i},${j})"></td>`;
        }
        strHTML += `</tr>`;
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function renderCell(position = { i: null, j: null }, html = '') {
    var cell = getClassName(position);
    var elCell = document.querySelector('.' + cell);
    if (elCell) elCell.innerHTML = html;
}

function getClassName(position = { i: null, j: null }) {
    var cellClass = 'cell-' + position.i + '-' + position.j;
    return cellClass;
}

function unhideBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            if (!cell.isShown) {
                cell.isShown = true;
                var elCell = document.querySelector('.' + getClassName({ i: i, j: j }));
                if (cell.setAroundCount) elCell.innerHTML = cell.setAroundCount;
                if (cell.isMine) elCell.innerHTML = MINE;
            }
        }
    }
}