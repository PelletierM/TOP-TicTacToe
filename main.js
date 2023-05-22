const boardSize = 3;
const winStreak = 3;

function generateBoard(size) {
  let gameboard = {};
  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y < size; y += 1) {
      gameboard[`x${x}y${y}`] = false;
    }
  }
  return gameboard;
}

const checkGameOver = (() => {
  function checkOffsetOverflow(position) {
    let x = position[0];
    let y = position[1];
    if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) {
      return true;
    }
    return false;
  }

  function checkAdjacentMatch(board, position, newPosition) {
    if (board[`x${position[0]}y${position[1]}`] === board[`x${newPosition[0]}y${newPosition[1]}`]) {
      return true;
    }
    return false;
  }

  function checkNext(board, position, offset, counter) {
    let newPosition = [position[0] + offset[0], position[1] + offset[1]];
    if (!checkOffsetOverflow(newPosition) && checkAdjacentMatch(board, position, newPosition)) {
      let newCount = counter + 1;
      if (newCount >= winStreak - 2) {
        return true;
      }
      return checkNext(board, newPosition, offset, newCount);
    }
    return false;
  }

  function checkAround(board, position) {
    for (let x = -1; x < 2; x += 1) {
      for (let y = -1; y < 2; y += 1) {
        let newPosition = [position[0] + x, position[1] + y];
        if (!checkOffsetOverflow(newPosition) && (!(y === 0 && x === 0))) {
          if (checkAdjacentMatch(board, position, newPosition)) {
            let currentOffset = [x, y];
            if (checkNext(board, newPosition, currentOffset, 0)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  function checkWin(gameboard) {
    for (let x = 0; x < boardSize; x += 1) {
      for (let y = 0; y < boardSize; y += 1) {
        const position = [x, y];
        const currentValue = gameboard[`x${x}y${y}`];
        if (currentValue && checkAround(gameboard, position)) {
          return currentValue;
        }
      }
    }
    return false;
  }

  function checkFullBoard(gameboard) {
    let output = true;
    Object.keys(gameboard).forEach((key) => {
      if (!gameboard[key]) {
        output = false;
      }
    });
    return output;
  }

  // eslint-disable-next-line no-shadow
  function checkGameOver(gameboard) {
    let output = {
      win: checkWin(gameboard),
      fullBoard: checkFullBoard(gameboard),
    };
    return output;
  }
  return checkGameOver;
})();

const createPlayer = (() => {
  const generateCounter = () => {
    let count = 0;
    return () => {
      count += 1;
      return count;
    };
  };

  const counter = generateCounter();

  const Player = (username, isHuman) => {
    let output = {
      id: counter(),
      isHuman,
      username,
    };
    return output;
  };
  return Player;
})();

let board1 = generateBoard(3);
let testBoard = {
  x0y0: 'max',
  x0y1: 'max',
  x0y2: 'Andy',
  x1y0: 'max',
  x1y1: 'tom',
  x1y2: 'Andy',
  x2y0: 'max',
  x2y1: 'tom',
  x2y2: 'Mike',
};
