const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// let count = 0;

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  /*
  socket.emit('countUpdated', count);

  socket.on('increment', () => {
    count++;
    // socket.emit('countUpdated', count);
    io.emit('countUpdated', count);
  });
*/

  // socket.emit('message', 'Welcome!');
  // socket.emit('message', {
  //   text: 'Welcome',
  //   createdAt: new Date().getTime()
  // });
  // socket.emit('message', generateMessage('Welcome!'));
  // // socket.broadcast.emit('message', 'A new user has joined!');
  // socket.broadcast.emit('message', generateMessage('A new user has joined!'));


  // socket.on('sendMessage', (message) => {
  //   io.emit('message', message);
  // });

  // socket.on('join', ({ username, room }) => {
  // socket.on('join', ({ username, room }, callback) => {
  socket.on('join', (options, callback) => {
    // const { error, user } = addUser({ id: socket.id, username, room });
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error); // instead of return we could use else
    }

    // socket.join(room);
    socket.join(user.room);

    // socket.emit('message', generateMessage('Welcome!'));
    socket.emit('message', generateMessage('Admin', 'Welcome!'));

    // socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));
    // socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();

    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit
  })



  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    // io.emit('message', message);
    // io.emit('message', generateMessage(message));
    // io.to('Center City').emit('message', generateMessage(message));
    // io.to(user.room).emit('message', generateMessage(message));
    // io.to(user.room).emit(user.username, 'message', generateMessage(message));
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
    // callback('Delivered!');
  });

  // socket.on('sendLocation', (coords) => {
  //   io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
  // });

  // socket.on('sendLocation', (coords, callback) => {
  //   io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
  //   callback();
  // });

  socket.on('sendLocation', (coords, callback) => {
    // io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
    const user = getUser(socket.id);
    // io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    // callback();
    // io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      // io.to(user.room).emit('message', generateMessage(`${user.username} has left!`));
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }

    // io.emit('message', 'A user has left!')
    // io.emit('message', generateMessage('A user has left!'))
  });
});

// app.listen(port, () => {
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});