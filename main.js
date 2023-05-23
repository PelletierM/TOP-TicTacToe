const boardSize = 3;
const winStreak = 3;
let players = {};

const checkGameOver = (() => {
  function checkOffsetOverflow(position) {
    let x = position[0];
    let y = position[1];
    if (x < 1 || y < 1 || x > boardSize || y > boardSize) {
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
    for (let x = 1; x <= boardSize; x += 1) {
      for (let y = 1; y <= boardSize; y += 1) {
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
  const Player = (username, isHuman) => {
    let newPlayer = {
      username,
      isHuman,
    };
    return newPlayer;
  };
  return Player;
})();

const mainBoard = (() => {
  function generateBoardVirtual(size) {
    let gameboard = {};
    for (let x = 1; x <= size; x += 1) {
      for (let y = 1; y <= size; y += 1) {
        gameboard[`x${x}y${y}`] = false;
      }
    }
    return gameboard;
  }

  function generateBoardDOM(board) {
    const container = document.querySelector('.gameboard');
    document.querySelector(':root').style.setProperty('--board-size', boardSize);
    Object.keys(board).forEach((key) => {
      const element = document.createElement('div');
      element.dataset.index = key;
      container.appendChild(element);
    });
  }

  const boardVirtual = generateBoardVirtual(boardSize);
  generateBoardDOM(boardVirtual);
  return boardVirtual;
})();

players[`player${Object.keys(players).length + 1}`] = createPlayer('Mike', true);
players[`player${Object.keys(players).length + 1}`] = createPlayer('Tom', true);

const container = document.querySelector('.gameboard');
let currentPlayerKey = `${Object.keys(players)[Math.floor(Math.random()
* Object.keys(players).length)]}`;

function nextPlayer(currentPlayer) {
  let currentIndex = Object.keys(players).indexOf(currentPlayer);
  if (currentIndex + 1 >= Object.keys(players).length) {
    return `${Object.keys(players)[0]}`;
  }
  return `${Object.keys(players)[currentIndex + 1]}`;
}

/*
function selectPositionAI(options) {
  let optionsRating = [];
  options.forEach((option) => {
    let winningOdds = {};
    for (let i = 1; i <= options.length; i += 1) {
      winningOdds[i] = 0;
    }

    const simulate = (currentOption, realOptions, realBoard, currentPlayerID, level) => {
      let simSelect = [];
      (() => {
        let simOptions = realOptions.slice();
        let simBoard = {};
        Object.keys(realBoard).forEach((key) => {
          simBoard[key] = realBoard[key];
        });
        simBoard[currentOption] = currentPlayerID;
        let simGameState = checkGameOver(simBoard);
        if (simGameState.win) {
          if (currentPlayerID === currentPlayerKey) {
            simSelect.push(currentOption);
          } else {
              );
          }
        } else {
          simOptions.splice(simOptions.indexOf(currentOption), 1);
          let nextLevel = level + 1;
          let nextSimPlayer = nextPlayer(currentPlayerID);
          simOptions.forEach((simOption) => simulate(simOption, simOptions, simBoard, nextSimPlayer, nextLevel));
        }
      })();
    };
    simulate(option, options, mainBoard, currentPlayerKey, 1);
    optionsRating.push(winningOdds);
  });
  console.log(optionsRating, options);
}
*/

function selectPositionAI(options) {
  options.forEach((option) => {
    // eslint-disable-next-line max-len
    function simulate(currentOption, parentOptions, parentBoard, playerKey, parentLevel, parentOptionScore) {
      let simOptions = parentOptions.slice();
      let simBoard = {};
      Object.keys(parentBoard).forEach((key) => {
        simBoard[key] = parentBoard[key];
      });
      const simLevel = parentLevel + 1;
      let simOptionScore = {};
      simOptionScore[simLevel] = {
        value: 0,
        forcedOffense: 0,
        forcedDefense: 0,
      };
      Object.assign(simOptionScore, parentOptionScore);
      simBoard[currentOption] = playerKey;
      if (checkGameOver(simBoard).win) {
        simOptionScore[simLevel].forcedOffense += 1;
        return simOptionScore;
      }
      let nextPlayerKey = nextPlayer(playerKey);
      simBoard[currentOption] = nextPlayerKey;
      if (checkGameOver(simBoard).win) {
        simOptionScore[simLevel].forcedDefense += 1;
        simBoard[currentOption] = playerKey;
        return simOptionScore;
      }
    }
    simulate(option, options, mainBoard, currentPlayerKey, 0, {});
  });
}

function playRoundAI() {
  if (players[currentPlayerKey].isHuman) {
    const validPositions = Object.keys(mainBoard).filter((key) => !mainBoard[key]);
    selectPositionAI(validPositions);
  }
}

function playRoundHuman(event) {
  const position = event.target.dataset.index;
  const currentElement = document.querySelector(`[data-index='${position}']`);
  if (!mainBoard[position]) {
    currentElement.classList.add(currentPlayerKey);
    mainBoard[position] = currentPlayerKey;
    if (checkGameOver(mainBoard).win || checkGameOver(mainBoard).fullBoard) {
      container.removeEventListener('click', playRoundHuman);
    } else {
      currentPlayerKey = nextPlayer(currentPlayerKey);
    }
    playRoundAI();
  }
}

container.addEventListener('click', playRoundHuman);
