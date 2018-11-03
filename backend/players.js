let initPlayers = function (io) {
    let players = {};
    players[Object.keys(io.sockets.sockets)[0]] = {
        name: "Player 1",
        hand: [],
        board : {
            attackLine : [],
            midLine: [],
            defenceLine: [],
            goalKeeper: []
        }
    }

    players[Object.keys(io.sockets.sockets)[1]] = {
        name: "Player 2",
        hand: [],
        board : {
            attackLine : [],
            midLine: [],
            defenceLine: [],
            goalKeeper: []
        }
    }
    return players;
}

module.exports = { 
    initPlayers
}