const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const uniqueRandom = require('unique-random');
const rand = uniqueRandom(0, 47);
const rand2 = uniqueRandom(0, 47);

const publicPath = path.join(__dirname, './../frontend');
const cards = require('./assets/carti-jucator');
const specialCards = require('./assets/carti-speciale');
const playersManagement = require('./players');
const leaderCards = require('./assets/carti-leader');

const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let players = {};
let playerCardsSubmited = false;
let specialCardsSubmited = false;
let leaderCardsSubmited = false;
let randomDigits = [];
let randomDigits2 = [];
let sendedCards = [];
let sendedCards2 = [];
let playerEnded;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');
    console.log(io.engine.clientsCount);
    for (let i = 0; i < 24; i++) {
        randomDigits[i] = rand();
        randomDigits2[i] = rand2();
    }
    if (tooManyPlayers()) {
        socket.disconnect(true);
        console.log(`Disconnected socket`);
    }

    if (isGameReady()) {
        for (let i = 0; i < 24; i++) {
            sendedCards[i] = cards.cards[randomDigits[i]];
            sendedCards2[i] = cards.cards[randomDigits2[i]];
        }
        io.to(`${socket.id}`).emit('startGame', sendedCards);
        socket.broadcast.emit('startGame', sendedCards2);
        players = playersManagement.initPlayers(io);
        console.log(players);
        console.log(Object.keys(players));
    }

    socket.on('cardsSubmit', (cards) => {
        players[socket.id].hand = cards;
        playerCardsSubmited = true;
        io.to(`${socket.id}`).emit('sendSpecial', specialCards.cards);
      });

      socket.on('submitSpecial', (cards) => {
        for (let card of cards) {
            players[socket.id].hand.push(card);
        }
        specialCardsSubmited = true;
        io.to(`${socket.id}`).emit('sendLeader', leaderCards.cards);
      })

      socket.on('submitLeader', (cards) => {
        for (let card of cards) {
            players[socket.id].hand.push(card);
        }
        console.log(players);
        console.log(cards);
        leaderCardsSubmited = true;
        io.to(`${socket.id}`).emit('boardRender', "Bine boss");
      });

      socket.on('startRound1', (recv) => {
        players[socket.id].hand.splice(0, players[socket.id].hand.length);
        for (let aux of recv.cards) {
            players[socket.id].hand.push(aux);
        }
        if (recv.lane === "goalkeeper") {
            players[socket.id].board.goalKeeper.push(recv.card);
        } else if (recv.lane === "defence") {
            players[socket.id].board.defenceLine.push(recv.card);
        } else if (recv.lane === "mid") {
            players[socket.id].board.midLine.push(recv.card);
        } else if (recv.lane === "attack") {
            players[socket.id].board.attackLine.push(recv.card);
        }
        players[socket.id].score =  players[socket.id].score + recv.card.attack + recv.card.defence;
        if (socket.id === Object.keys(players)[0]) {
            io.to(`${socket.id}`).emit('Round1', {
                player: players[socket.id], 
                enemyBoard: players[Object.keys(players)[1]].board,
                enemyScore: players[Object.keys(players)[1]].score
            });
            socket.broadcast.emit('Round1Enemy', {
                myBoard: players[Object.keys(players)[1]].board,
                myScore: players[Object.keys(players)[1]].score,
                enemyBoard: players[socket.id].board,
                enemyScore: players[socket.id].score
            });
        } else if (socket.id === Object.keys(players)[1]) {
            io.to(`${socket.id}`).emit('Round1', {
                player: players[socket.id], 
                enemyBoard: players[Object.keys(players)[0]].board,
                enemyScore: players[Object.keys(players)[0]].score
            });
            socket.broadcast.emit('Round1Enemy', {
                myBoard: players[Object.keys(players)[0]].board,
                myScore: players[Object.keys(players)[0]].score,
                enemyBoard: players[socket.id].board,
                enemyScore: players[socket.id].score
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
});

let isGameReady = function () {
    return io.engine.clientsCount === 2;
};

let tooManyPlayers = function () {
    return io.engine.clientsCount > 2;
} 

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});

function randomDataSet(dataSetSize, minValue, maxValue) {
    return new Array(dataSetSize).fill(0).map(function(n) {
      return Math.random() * (maxValue - minValue) + minValue;
    });
}

//console.log(cards);