const socket = io();
let username;

document.getElementById('login-btn').onclick = function() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
};

document.getElementById('register-btn').onclick = function() {
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
};

document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    username = formData.get('username');
    const password = formData.get('password');

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ username, password })
    })
    .then(response => {
        if (response.ok) {
            document.querySelector('.form-container').classList.add('hidden');
            document.getElementById('chatContainer').classList.remove('hidden');
            document.getElementById('userStatus').innerText = '(Online)';
            socket.emit('user connected', username);
        } else {
            alert('Login failed');
        }
    });
};

document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ username, password })
    })
    .then(response => {
        if (response.ok) {
            alert('Registration successful! You can now log in.');
        } else {
            alert('Registration failed');
        }
    });
};

document.getElementById('sendButton').onclick = function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput.value) {
        const msg = {
            user: username,
            text: messageInput.value,
            time: new Date()
        };
        socket.emit('chat message', msg);
        messageInput.value = '';
    }
};

// Show messages and timestamps
socket.on('chat message', function(msg) {
    const li = document.createElement('li');
    const timestamp = new Date(msg.time).toLocaleTimeString();
    li.innerHTML = `<strong>${msg.user}</strong>: ${msg.text} <span class="timestamp">(${timestamp})</span>`;
    document.getElementById('messages').appendChild(li);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight; // Scroll to bottom
});

// Handle user connection
socket.on('user connected', function(user) {
    const li = document.createElement('li');
    li.innerText = `${user} has joined the chat.`;
    document.getElementById('messages').appendChild(li);
});

// Notify users when they connect
socket.on('user disconnected', function(user) {
    const li = document.createElement('li');
    li.innerText = `${user} has left the chat.`;
    document.getElementById('messages').appendChild(li);
});