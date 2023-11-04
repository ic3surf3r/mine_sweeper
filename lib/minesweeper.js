import { makeArray, genGrid, uncover, isGameWon, doubleClick } from "/lib/utils.js";

const gameZone = document.getElementById("minesweeper");
const bombCounter = document.getElementById("bomb-count");
const numBombs = 10;
bombCounter.innerText = numBombs;

const grid = makeArray(9, 9, numBombs);
genGrid(grid, gameZone);

let gameOver = false;

const plantFlag = (e) => {
  e.preventDefault();
  if (!gameOver) {
    const target = e.target;
    if (target.classList.contains("unopened") && !target.classList.contains("flagged")) {
      target.classList.add("flagged");
    } else {
      target.classList.remove("flagged");
    }
    const numFlagged = document.querySelectorAll(".flagged").length;
    bombCounter.innerText = numBombs - numFlagged;
    isGameWon(numBombs, gameOver);
  }
};

const dig = (e) => {
  if (!gameOver) {
    const target = e.target;
    if (!target.classList.contains("flagged")) {
      gameOver = uncover(target, grid);
    }
    isGameWon(numBombs, gameOver);
  }
};

const double = (e) => {
  gameOver = doubleClick(e.target, grid);
  isGameWon(numBombs, gameOver);
};

gameZone.addEventListener("click", dig);
gameZone.addEventListener("contextmenu", plantFlag);
gameZone.addEventListener("dblclick", double);
