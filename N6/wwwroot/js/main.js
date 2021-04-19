$('#create__tags-input').chips({
    placeholder: 'Enter a tag',
    secondaryPlaceholder: '+Tag',
});
$('#connect__tags-input').chips({
    placeholder: 'Enter a tag',
    secondaryPlaceholder: '+Tag',
    onChipAdd: () => {
        let inputInstance = M.Chips.getInstance($('#connect__tags-input'))
        let tags = inputInstance.chipsData.map(a => a.tag)
        showConnectScreen(tags)
    },
    onChipDelete: () => {
        let inputInstance = M.Chips.getInstance($('#connect__tags-input'))
        let tags = inputInstance.chipsData.map(a => a.tag)
        showConnectScreen(tags)
    },
});

function showCreateScreen() {
    showScreenById('#create-section')
}

async function showConnectScreen(filterTags) {
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
        if (!filterTags || filterTags.length === 0 || filterTags.every(t => g.Tags.includes(t)))
            cont.innerHTML += '<div class="card"><div class="card-content white-text"><span class="card-title">' + g.Id + '</span><p>#' + g.Tags.join(" #") +
                '</p></div><div class="card-action"><a onclick="connectToGame(\'' + g.Id + '\')" class="btn-small white transparent"><i class="material-icons left">power</i>Connect</a></div></div>'
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