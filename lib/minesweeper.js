import { makeArray, genGrid, uncover, isGameWon } from "/lib/utils.js";

const gameZone = document.getElementById("minesweeper");
const numBombs = 10;

const grid = makeArray(9, 9, numBombs);
genGrid(grid, gameZone);

let gameOver = false;

const plantFlag = (e) => {
  e.preventDefault();
  if (!gameOver) {
    const target = e.target;
    if (target.classList.contains("unopened")) {
      target.classList.add("flagged");
    }
  }
};

const dig = (e) => {
  if (!gameOver) {
    const target = e.target;
    gameOver = uncover(target, grid);
    isGameWon(numBombs, gameOver);
  }
};

gameZone.addEventListener("click", dig);
gameZone.addEventListener("contextmenu", plantFlag);
