document.addEventListener('DOMContentLoaded', () => {

    const gameboard = document.getElementById('gameboard');
    const gameOverMsg = document.getElementById('gameover-msg');
    const winner = document.getElementById('winner');
    const resetBtn = document.getElementById('reset-btn');
    const playerTurn = document.getElementById('player-turn');
    playerTurn.textContent = 'X';

    const $ivory = '#F6F7EB';
    const $green = '#16b550';

    let tilesArr = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8
    ];

    let isXTurn = true;
    let isGameOver = false;
    let validPlays = 0;
    let winningCombo;

    const addTiles = () => {
        tilesArr.forEach((index) => {
            const tile = document.createElement('div');
            tile.id = index;
            tile.classList.add('tile');
            tile.addEventListener('click', () => handleClick(tile));
            gameboard.appendChild(tile);
        });
    }
    addTiles();
    const tiles = document.querySelectorAll('.tile');
















    const handleClick = (tile) => {
        if (isXTurn && tile.textContent === '') {
            hubConnection.invoke('OnTileClick', tile.id);
            markX(tile);
        } else if (!isXTurn && tile.textContent === '') {
            hubConnection.invoke('OnTileClick', tile.id);
            markO(tile);
        }
    }

    const hubConnection = new signalR.HubConnectionBuilder().withUrl("/hub").build();
    async function start() {
        try {
            await hubConnection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.log(err);
            setTimeout(start, 3000);
        }
    };
    hubConnection.onclose(start);
    start();

    hubConnection.on('SendTurn', function(tileId, symbol) {    
        console.log(tileId + ": " + symbol);
    });

























    const markX = (tile) => {
        tile.textContent = 'X';
        tilesArr[tile.id] = 'X';
        validPlays++;
        isXTurn = !isXTurn;
        isXTurn ? playerTurn.textContent = 'X' : playerTurn.textContent = 'O';
        checkForWin();
        validPlays === 9 ? displayMessage() : false;
    }

    const markO = (tile) => {
        tile.textContent = 'O';
        tilesArr[tile.id] = 'O';
        validPlays++;
        isXTurn = !isXTurn;
        isXTurn ? playerTurn.textContent = 'X' : playerTurn.textContent = 'O';
        checkForWin();
        validPlays === 9 ? displayMessage() : false;
    }

    const checkForWin = () => {
        tilesArr[0] === tilesArr[1] &&
            tilesArr[1] === tilesArr[2] &&
            tilesArr[0] === tilesArr[2] ?
            gameOver(0) :
            false;

        tilesArr[3] === tilesArr[4] &&
            tilesArr[4] === tilesArr[5] &&
            tilesArr[3] === tilesArr[5] ?
            gameOver(1) :
            false;

        tilesArr[6] === tilesArr[7] &&
            tilesArr[7] === tilesArr[8] &&
            tilesArr[6] === tilesArr[8] ?
            gameOver(2) :
            false;

        tilesArr[0] === tilesArr[3] &&
            tilesArr[3] === tilesArr[6] &&
            tilesArr[0] === tilesArr[6] ?
            gameOver(3) :
            false;

        tilesArr[1] === tilesArr[4] &&
            tilesArr[4] === tilesArr[7] &&
            tilesArr[1] === tilesArr[7] ?
            gameOver(4) :
            false;

        tilesArr[2] === tilesArr[5] &&
            tilesArr[5] === tilesArr[8] &&
            tilesArr[2] === tilesArr[8] ?
            gameOver(5) :
            false;

        tilesArr[0] === tilesArr[4] &&
            tilesArr[4] === tilesArr[8] &&
            tilesArr[0] === tilesArr[8] ?
            gameOver(6) :
            false;

        tilesArr[2] === tilesArr[4] &&
            tilesArr[4] === tilesArr[6] &&
            tilesArr[2] === tilesArr[6] ?
            gameOver(7) :
            false;

    }

    const gameOver = (val) => {
        isGameOver = true;
        winningCombo = val;
        switch (winningCombo) {
            case 0:
                tiles[0].style.color = $green;
                tiles[1].style.color = $green;
                tiles[2].style.color = $green;
                break;
            case 1:
                tiles[3].style.color = $green;
                tiles[4].style.color = $green;
                tiles[5].style.color = $green;
                break;
            case 2:
                tiles[6].style.color = $green;
                tiles[7].style.color = $green;
                tiles[8].style.color = $green;
                break;
            case 3:
                tiles[0].style.color = $green;
                tiles[3].style.color = $green;
                tiles[6].style.color = $green;
                break;
            case 4:
                tiles[1].style.color = $green;
                tiles[4].style.color = $green;
                tiles[7].style.color = $green;
                break;
            case 5:
                tiles[2].style.color = $green;
                tiles[5].style.color = $green;
                tiles[8].style.color = $green;
                break;
            case 6:
                tiles[0].style.color = $green;
                tiles[4].style.color = $green;
                tiles[8].style.color = $green;
                break;
            case 7:
                tiles[2].style.color = $green;
                tiles[4].style.color = $green;
                tiles[6].style.color = $green;
        }
        displayMessage();
    }

    const displayMessage = () => {
        if (isGameOver) {
            setTimeout(() => {
                gameOverMsg.style.display = 'block';
                playerTurn.textContent === 'X' ? winner.textContent = 'O Wins!' : winner.textContent = 'X Wins!';
            }, 1000);
        }
        if (!isGameOver) {
            gameOverMsg.style.display = 'block';
            winner.textContent = 'Tie Game!'
        }
    }

    const reset = () => {
        tiles.forEach((tile) => {
            tile.textContent = '';
            tile.style.color = $ivory;
        });
        tilesArr = [
            0, 1, 2,
            3, 4, 5,
            6, 7, 8
        ];
        winningCombo = '';
        isXTurn = true;
        isGameOver = false;
        validPlays = 0;
        playerTurn.textContent = 'X';
        gameOverMsg.style.display = 'none';
    }

    resetBtn.addEventListener('click', () => reset());










});