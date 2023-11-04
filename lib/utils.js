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

export const makeArray = (cols, rows, bombs) => {
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

export const getLoc = (tile) => {
  const x = tile.cellIndex;
  const y = tile.parentElement.rowIndex;
  return { x, y };
};

export const genGrid = (grid, gameZone) => {
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

export const scanNeighbours = ({ x, y }, maxX, maxY, ref) => {
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

export const uncover = (target, grid) => {
  if (target.dataset.bomb === "true") {
    target.classList.add("mine");
    return true;
  } else if (target.dataset.bomb === "false") {
    howManyBombs(target, grid);
    return false;
  }
};

export const doubleClick = (target, grid) => {
  if (!target.classList.contains("flagged")) {
    const lost = uncoverAllNeighbours(target, grid);
    return lost;
  }
};

const checkIfWon = (numBombs) => {
  const flaggedOrUnopened = document.querySelectorAll(".flagged,.unopened");
  return flaggedOrUnopened.length === numBombs;
};

export const isGameWon = (numBombs, gameOver) => {
  const condition = document.getElementById("condition");
  if (gameOver) {
    condition.innerText = "You Lost 😢";
  } else if (checkIfWon(numBombs)) {
    condition.innerText = "You Won!";
  }
};
