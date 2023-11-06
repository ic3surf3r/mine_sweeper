import { makeArray, genGrid, uncover, checkIfWon, doubleClick } from "/lib/utils.js";

const explosionSound = new Audio("/sounds/exp.mp3");

const gameZone = document.getElementById("minesweeper");
const bombCounter = document.getElementById("bomb-count");
const diffSelector = document.getElementById("dif");
const timer = document.getElementById("timer");

let seconds = 0;
let gameOver = false;

const pickDifficulty = (e) => {
  localStorage.setItem("dificulty", diffSelector.value);
  location.reload();
};

const timerFunc = () => {
  if (!gameOver) {
    seconds += 1;
    if (seconds <= 9) {
      timer.innerText = `0${seconds}`;
    } else {
      timer.innerText = seconds;
    }
  }
};

const isGameWon = (numBombs, isBomb) => {
  const condition = document.getElementById("condition");
  if (isBomb) {
    explosionSound.play();
    gameOver = true;
    condition.innerText = "You Lost 😢";
  } else if (checkIfWon(numBombs)) {
    gameOver = true;
    condition.innerText = "You Won!";
  }
};

document.addEventListener(
  "click",
  () => {
    setInterval(timerFunc, 1000);
  },
  { once: true }
);

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
    isGameWon(numBombs);
  }
};

const dig = (e) => {
  if (!gameOver) {
    const target = e.target;
    let isBomb = false;
    if (!target.classList.contains("flagged")) {
      isBomb = uncover(target, grid);
    }
    isGameWon(numBombs, isBomb);
  }
};

const double = (e) => {
  const isBomb = doubleClick(e.target, grid);
  isGameWon(numBombs, isBomb);
};

gameZone.addEventListener("click", dig);
gameZone.addEventListener("contextmenu", plantFlag);
gameZone.addEventListener("dblclick", double);
