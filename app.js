const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const app = express();
const formatMessage = require('./utils/messages');
const server = http.createServer(app);
const io = socketio(server);
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users.js');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index.html');
});

const botName = 'Chat Cord Bot';

// run when client connect
io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    console.log(user);
    socket.join(user.room);
    socket.emit('message', formatMessage(botName, 'Welcome to chat cord'));

    // broadcast when user connect
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has join the chat`));

    // send user and room info
    io.to(user.room).emit('roomusers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });

  });

  // listen for chat message
  socket.on('chat', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Run when client disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user)
    {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
      // send user and room info
      io.to(user.room).emit('roomusers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server was started on PORT ${PORT}`));