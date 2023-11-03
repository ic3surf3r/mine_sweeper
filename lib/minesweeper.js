import { makeArray, genGrid, uncover } from "/lib/utils.js";

const gameZone = document.getElementById("minesweeper");

const grid = makeArray(8, 8, 10);
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
  }
};

gameZone.addEventListener("click", dig);
gameZone.addEventListener("contextmenu", plantFlag);
