$('.chips-placeholder').chips({
    placeholder: 'Enter a tag',
    secondaryPlaceholder: '+Tag',
});

function showCreateScreen() {
    showScreenById('#create-section')
}

async function showConnectScreen() {
    showScreenById('#connect-section')

    let o = await fetch('/getgameslist')
        .then(function(response) {
            return response.text()
        })
        .then(function(text) {
            return JSON.parse(text)
        })
        .catch(function(err) {
            console.warn('Something went wrong.', err)
        })


    let cont = document.getElementById('games-list')
    cont.innerHTML = ""
    o.forEach(g => {
        cont.innerHTML += '<div class="card teal darken-1"><div class="card-content white-text"><span class="card-title">' + g.Id + '</span><p>#' + g.Tags.join(" #") + '</p></div><div class="card-action"><a class="waves-effect waves-light btn-small white teal-text"><i class="material-icons left">power</i>Connect</a></div></div>'
    })
}

function showGameScreen() {
    showScreenById('#game-section')
}

function showScreenById(id) {
    $('#create-section').addClass('hide')
    $('#connect-section').addClass('hide')
    $('#game-section').addClass('hide')

    $(id).removeClass('hide')
}

async function showGamesToConnect() {
    fetch('/getgameslist')
        .then((response) => {
            return JSON.parse(response)
        })
}