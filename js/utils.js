'use strict';

function readLocalstorage(key) {
    var scores;
    try {
        scores = JSON.parse(localStorage.getItem(key) || "[]");
        scores.sort(function (a, b) {
            return b.score - a.score;
        });
        return scores;
    } catch (e) {
        return [];
    }
}

function writeLocalstorage(player, scores, key) {
    if (!player.name) return;
    scores.push(player);
    scores.sort(function (a, b) {
        return b.score - a.score;
    });
    localStorage.setItem(key, JSON.stringify(scores));
}

function shuffle(input) {
    var input = input.slice();
    var output = [];
    while (input.length > 0) {
        output.push(input.splice(getRandomInt(0, input.length), 1)[0])
    }
    return output;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}