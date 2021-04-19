function createGame() {
    let inputInstance = M.Chips.getInstance($('#create__tags-input'))
    let tags = inputInstance.chipsData.map(a => a.tag)

    // Clear input
    for (var i = inputInstance.chipsData.length - 1; i >= 0; i--)
        inputInstance.deleteChip(i)

    createGameRequest(Date.now(), tags.join("\n"))
    showGameScreen()
}

let hubConnection;

async function createGameRequest(id, tags) {
    await connectToHub()

    hubConnection.invoke('CreateGame', id, tags)

    tableInit()
}

function connectToGameRequest(id) {
    connectToHub()


    tableInit()
}


async function connectToHub() {
    hubConnection = new signalR.HubConnectionBuilder().withUrl("/hub").build()
    async function start() {
        try {
            await hubConnection.start()
            console.log("SignalR Connected.")
        } catch (err) {
            console.log(err)
            setTimeout(start, 3000)
        }
    }
    hubConnection.onclose(start)
    await start()

    return Promise.resolve(true)
}








function tableInit() {
    const gameboard = document.getElementById('gameboard')
    const gameOverMsg = document.getElementById('gameover-msg')
    const winner = document.getElementById('winner')

    let playerSymbol = ""
    let winSymbol = ""

    const $ivory = '#F6F7EB'
    const $green = '#16b550'

    const defaultTilesArray = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    let tilesArr = defaultTilesArray


    function addTiles() {
        tilesArr.forEach((index) => {
            const tile = document.createElement('div')
            tile.id = index
            tile.classList.add('tile')
            tile.addEventListener('click', () => handleClick(tile))
            gameboard.appendChild(tile)
        })
    }
    addTiles()
    const tiles = document.querySelectorAll('.tile')


    function initPalyer(tile) {
        hubConnection.invoke('InitPlayer', tile.id)
    }

    function setTilesActiveState(state) {
        tiles.forEach((tile) => {
            tile.textContent = ''
            tile.style.color = $ivory
        })
    }



    // Hub functions

    function handleClick(tile) {
        if (tile.textContent === '') {
            hubConnection.invoke('OnTileClick', tile.id)
        }
    }

    hubConnection.on('SendTurn', function(jsonString) {
        console.log(jsonString)
        let turnObj = JSON.parse(jsonString)
        document.getElementById(turnObj.tileId).textContent = turnObj.symbol
        tilesArr[turnObj.tileId] = turnObj.symbol

        checkForWin()
    })





    // End game & reset

    function checkForWin() {
        tilesArr[0] === tilesArr[1] && tilesArr[1] === tilesArr[2] ? gameOver(0, 1, 2) : false
        tilesArr[3] === tilesArr[4] && tilesArr[4] === tilesArr[5] ? gameOver(3, 4, 5) : false
        tilesArr[6] === tilesArr[7] && tilesArr[7] === tilesArr[8] ? gameOver(6, 7, 8) : false
        tilesArr[0] === tilesArr[3] && tilesArr[3] === tilesArr[6] ? gameOver(0, 3, 6) : false
        tilesArr[1] === tilesArr[4] && tilesArr[4] === tilesArr[7] ? gameOver(1, 4, 7) : false
        tilesArr[2] === tilesArr[5] && tilesArr[5] === tilesArr[8] ? gameOver(2, 5, 8) : false
        tilesArr[0] === tilesArr[4] && tilesArr[4] === tilesArr[8] ? gameOver(0, 4, 8) : false
        tilesArr[2] === tilesArr[4] && tilesArr[4] === tilesArr[6] ? gameOver(2, 4, 6) : false
    }

    function gameOver(val1, val2, val3) {
        isAnybodyWin = true
        winSymbol = tilesArr[val1];

        tiles[val1].style.color = $green
        tiles[val2].style.color = $green
        tiles[val3].style.color = $green

        displayMessage()
    }

    function displayMessage() {
        setTimeout(() => {
            gameOverMsg.style.display = 'block'
            winner.textContent = (winSymbol) ? winSymbol + ' Wins!' : 'Tie game!'
        }, 500)
    }

    function resetTable() {
        tiles.forEach((tile) => {
            tile.textContent = ''
            tile.style.color = $ivory
        })
        tilesArr = defaultTilesArray
        winSymbol = ""

        gameOverMsg.style.display = 'none'
    }
}