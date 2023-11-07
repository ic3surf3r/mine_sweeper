const digSound = new Audio("/sounds/dig.mp3");

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

const chunkify = (array, chunk) => {
  const perChunk = chunk;

  const result = array.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
  return result;
};

const makeArray = (cols, rows, bombs) => {
  const total = cols * rows;
  const noBobs = total - bombs;
  const grid = [];
  for (let i = 0; i < noBobs; i++) {
    grid.push(0);
  }
  for (let i = 0; i < bombs; i++) {
    grid.push(1);
  }
  const shuffled = shuffle(grid);
  return chunkify(shuffled, cols);
};

const getLoc = (tile) => {
  const x = tile.cellIndex;
  const y = tile.parentElement.rowIndex;
  return { x, y };
};

const genGrid = (grid, gameZone) => {
  grid.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      if (cell === 1) {
        const content = `<td class="unopened" data-bomb="true"></td>`;
        tr.insertAdjacentHTML("beforeend", content);
      } else {
        const content = `<td class="unopened" data-bomb="false"></td>`;
        tr.insertAdjacentHTML("beforeend", content);
      }
    });
    gameZone.appendChild(tr);
  });
};

const scanNeighbours = ({ x, y }, maxX, maxY, ref) => {
  const arr = [
    x - 1 >= 0 && y - 1 >= 0 ? [x - 1, y - 1] : [x, y],
    y - 1 >= 0 ? [x, y - 1] : [x, y],
    x + 1 < maxX && y - 1 >= 0 ? [x + 1, y - 1] : [x, y],
    x - 1 >= 0 ? [x - 1, y] : [x, y],
    x + 1 < maxX ? [x + 1, y] : [x, y],
    x - 1 >= 0 && y + 1 < maxY ? [x - 1, y + 1] : [x, y],
    y + 1 < maxY ? [x, y + 1] : [x, y],
    x + 1 < maxX && y + 1 < maxY ? [x + 1, y + 1] : [x, y],
  ];
  const bombs = arr.map((mini) => {
    // return ref[mini[1]][mini[0]];
    return ref[mini[1]][mini[0]] !== 0 ? mini : 0;
  });
  const filtered = bombs.filter((value) => value !== 0);

  return [arr.filter((n) => !filtered.includes(n)), filtered.length, arr];
};

const howManyBombs = (target, grid) => {
  const res = scanNeighbours(getLoc(target), grid[0].length, grid.length, grid);
  const notBombs = res[0];
  const bombsNear = res[1];
  if (bombsNear === 0) {
    noBombsNear(target, notBombs, grid);
  } else {
    target.classList.replace("unopened", `mine-neighbour-${bombsNear}`);
  }
};

const uncoverAllNeighbours = (target, grid) => {
  const table = document.getElementById("minesweeper");
  const res = scanNeighbours(getLoc(target), grid[0].length, grid.length, grid);
  const neighbours = res[2];
  let wasBomb = false;
  neighbours.forEach((loc) => {
    const cell = table.rows[loc[1]].cells[loc[0]];
    if (!cell.classList.contains("flagged")) {
      const isBomb = uncover(cell, grid);
      if (isBomb) {
        wasBomb = true;
      }
    }
  });
  return wasBomb;
};

const noBombsNear = (target, array, grid) => {
  target.classList.replace("unopened", "opened");
  const table = document.getElementById("minesweeper");
  array.forEach((loc) => {
    const element = table.rows[loc[1]].cells[loc[0]];
    if (element.dataset.bomb === "false") {
      const res = scanNeighbours(getLoc(element), grid[0].length, grid.length, grid);
      const bombsNear = res[1];
      if (bombsNear === 0) {
        element.classList.replace("unopened", "opened");
      } else {
        element.classList.replace("unopened", `mine-neighbour-${bombsNear}`);
      }
    }
  });
};

const uncover = (target, grid) => {
  if (target.dataset.bomb === "true") {
    target.classList.add("mine");
    return true;
  } else if (target.dataset.bomb === "false") {
    digSound.play();
    howManyBombs(target, grid);
    return false;
  }
};

const doubleClick = (target, grid) => {
  if (!target.classList.contains("flagged")) {
    const lost = uncoverAllNeighbours(target, grid);
    return lost;
  }
};

const checkIfWon = (numBombs) => {
  const flaggedOrUnopened = document.querySelectorAll(".flagged,.unopened");
  return flaggedOrUnopened.length === numBombs;
};

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
