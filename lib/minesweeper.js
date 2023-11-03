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

const gameZone = document.getElementById("minesweeper");

const genGrid = (grid) => {
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

const getLoc = (tile) => {
  const x = tile.cellIndex;
  const y = tile.parentElement.rowIndex;
  return { x, y };
};

const grid = makeArray(8, 8, 10);
genGrid(grid);

const scanNeighbours = ({ x, y }, maxX, maxY) => {
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
    return grid[mini[1]][mini[0]];
  });

  return bombs.filter((value) => value !== 0).length;
};
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
    if (target.dataset.bomb === "true") {
      target.classList.add("mine");
      gameOver = true;
    } else if (target.dataset.bomb === "false") {
      const bombsNear = scanNeighbours(getLoc(target), grid[0].length, grid.length);
      if (bombsNear === 0) {
        target.classList.replace("unopened", "opened");
      } else {
        target.classList.replace("unopened", `mine-neighbour-${bombsNear}`);
      }
    }
  }
};

gameZone.addEventListener("click", dig);
gameZone.addEventListener("contextmenu", plantFlag);
