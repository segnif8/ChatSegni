const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001;

const users = {}; // Object to store username along with socket ID

app.use(express.static('public'));
app.use(express.json());

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('login', (data) => {
        if (!users[data.username]) {
            users[data.username] = socket.id; // Store user's socket ID
            io.emit('update online users', Object.keys(users)); // Notify all users of online users
            socket.emit('login success');
        } else {
            socket.emit('error', 'Invalid username or password.');
        }
    });

    socket.on('register', (data) => {
        if (users[data.username]) {
            socket.emit('error', 'Username already exists.');
        } else {
            users[data.username] = socket.id; // Store user's socket ID
            socket.emit('register success');
            io.emit('update online users', Object.keys(users)); // Notify all users of new user
        }
    });

    socket.on('join chat', (username) => {
        socket.join(username); // Join a room for private chat
    });

    socket.on('private message', ({ to, message }) => {
        const targetSocketId = users[to]; // Find the socket ID of the target user
        if (targetSocketId) {
            io.to(targetSocketId).emit('private message', {
                username: Object.keys(users).find(user => users[user] === socket.id),
                message: message
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // Remove user from online users when they disconnect
        for (const [username, id] of Object.entries(users)) {
            if (id === socket.id) {
                delete users[username];
                io.emit('update online users', Object.keys(users)); // Notify all users of the updated online users
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});