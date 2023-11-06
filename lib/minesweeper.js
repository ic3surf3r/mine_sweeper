import { makeArray, genGrid, uncover, isGameWon, doubleClick } from "/lib/utils.js";

const gameZone = document.getElementById("minesweeper");
const bombCounter = document.getElementById("bomb-count");
const diffSelector = document.getElementById("dif");

const pickDifficulty = (e) => {
  localStorage.setItem("dificulty", diffSelector.value);
  location.reload();
};

const diff = localStorage.getItem("dificulty");

let rows = 30;
let cols = 16;
let numBombs = 99;

if (diff === "3") {
  rows = 30;
  cols = 16;
  numBombs = 99;
  diffSelector.value = "3";
} else if (diff === "2") {
  rows = 16;
  cols = 16;
  numBombs = 40;
  diffSelector.value = "2";
} else {
  rows = 9;
  cols = 9;
  numBombs = 10;
  diffSelector.value = "1";
}
bombCounter.innerText = numBombs;
const grid = makeArray(cols, rows, numBombs);

diffSelector.addEventListener("change", pickDifficulty);

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
