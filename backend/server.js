const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, './../frontend');
const cards = require('./assets/carti-jucator');

const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

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
    }

    socket.on('cardsSubmit', (cards) => {
        console.log(cards);
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