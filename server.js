const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let usernames = [];

server.listen(process.env.PORT || 3000);
console.log('Server running...');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
    console.log('Socket Connected...');

    socket.on('new user', (data, cb) => {
        if (usernames.includes(data)) {
            cb(false);
        } else {
            cb(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsernames();
        }
    });

    // update usernames
    function updateUsernames() {
        io.sockets.emit('usernames', usernames);
    }

    // send message
    socket.on('send message', (data) => {
        io.sockets.emit('new message', { msg: data, user: socket.username });
    });

    // disconnect
    socket.on('disconnect', (data) => {
        if (!socket.username) {
            return;
        }
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsernames();
    });
});