import { makeArray, genGrid, uncover, isGameWon, doubleClick } from "/lib/utils.js";

const gameZone = document.getElementById("minesweeper");
const numBombs = 10;

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
  doubleClick(e.target, grid);
};

gameZone.addEventListener("click", dig);
gameZone.addEventListener("contextmenu", plantFlag);
gameZone.addEventListener("dblclick", double);
