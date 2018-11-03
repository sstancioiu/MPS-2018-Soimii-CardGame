const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, './../frontend');
const cards = require('./assets/carti-jucator');
const specialCards = require('./assets/carti-speciale');
const playersManagement = require('./players');
const leaderCards = [specialCards.cards[0], specialCards.cards[1]];

const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let players = {};
let playerCardsSubmited = false;
let specialCardsSubmited = false;
let leaderCardsSubmited = false;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');
    console.log(io.engine.clientsCount);
    if (tooManyPlayers()) {
        socket.disconnect(true);
        console.log(`Disconnected socket`);
    }

    if (isGameReady()) {
        io.emit('startGame', cards.cards);
        players = playersManagement.initPlayers(io);
        console.log(players);
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
        io.to(`${socket.id}`).emit('sendLeader', leaderCards);
      })

      socket.on('submitLeader', (cards) => {
        for (let card of cards) {
            players[socket.id].hand.push(card);
        }
        console.log(players);
        console.log(cards);
        leaderCardsSubmited = true;
        io.to(`${socket.id}`).emit('boardRender', "Bine boss");
      })

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

//console.log(cards);