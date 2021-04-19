let hubConnection;
let gameId;


function createGame() {
    let inputInstance = M.Chips.getInstance($('#create__tags-input'))
    let tags = inputInstance.chipsData.map(a => a.tag)

    // Clear input
    for (var i = inputInstance.chipsData.length - 1; i >= 0; i--)
        inputInstance.deleteChip(i)

    createGameRequest(Date.now().toString(), tags.join("\n"))
    showGameScreen()
}

async function createGameRequest(id, tags) {
    await connectToHub(id)

    hubConnection.invoke('CreateGame', id, tags)

    tableInit()
}

async function connectToGame(id) {
    await connectToGameRequest(id)
    showGameScreen()
    let inputInstance = M.Chips.getInstance($('#connect__tags-input'))
    let tags = inputInstance.chipsData.map(a => a.tag)

    // Clear input
    for (var i = inputInstance.chipsData.length - 1; i >= 0; i--)
        inputInstance.deleteChip(i)
}

async function connectToGameRequest(id) {
    await connectToHub(id)

    hubConnection.invoke('ConnectToGame', id)

    tableInit()
}


async function connectToHub(id) {
    hubConnection = new signalR.HubConnectionBuilder().withUrl("/hub").build()
    gameId = id.toString();

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
    const gameIdElement = document.getElementById('game-id')

    const $ivory = '#F6F7EB'
    const $green = '#16b550'

    gameIdElement.textContent = gameId
    const defaultTilesArray = [0, 1, 2, 3, 4, 5, 6, 7, 8]

    function addTiles() {
        defaultTilesArray.forEach((index) => {
            const tile = document.createElement('div')
            tile.id = index
            tile.classList.add('tile')
            tile.addEventListener('click', () => handleClick(tile))
            gameboard.appendChild(tile)
        })
    }
    addTiles()
    const tiles = document.querySelectorAll('.tile')

    function displayMessage(message) {
        gameOverMsg.style.display = 'block'
        winner.textContent = message
        setTimeout(() => {
            showConnectScreen()
            resetTable()
        }, 2500)
    }

    function resetTable() {
        tiles.forEach((tile) => {
            tile.textContent = ''
            tile.style.color = $ivory
        })
        gameId = ""

        gameOverMsg.style.display = 'none'
    }


    // Hub functions

    function handleClick(tile) {
        if (tile.textContent === '') {
            hubConnection.invoke('HandlePlayerTurn', gameId, parseInt(tile.id))
        }
    }

    hubConnection.on('ReceiveMessage', function (message) {
        console.log(message)
    })

    hubConnection.on('ReceiveYourSymbol', function (symbol) {
        document.getElementById('playerX').textContent = 'Opponent'
        document.getElementById('playerO').textContent = 'Opponent'
        document.getElementById('player' + symbol).textContent = 'You'
    })

    hubConnection.on('ReceiveTileValues', function(tileServerValues) {
        console.log(tileServerValues)
        for (var i = 0; i < tiles.length; i++) {
            tiles[i].textContent = tileServerValues[i]
            defaultTilesArray[i] = tileServerValues[i]
        }
    })

    hubConnection.on('ReceiveGameOver', function(message, winTiles) {
        console.log(message + winTiles)

        if (winTiles.length > 0) winTiles.forEach(t => tiles[t].style.color = $green)
        displayMessage(message)
    })
}