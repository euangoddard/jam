var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function () {
  console.log('listening on 0.0.0.0:3000');
});

app.use(express.static('./client/dist'));


app.get('/g/*', function (req, res) {
  res.sendFile(__dirname + '/client/dist/index.html');
});

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('play-instrument', function (data) {
    socket.broadcast.emit('play-instrument', {
      username: socket.username,
      instrument: data.instrument
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add-user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers,
      usernames: usernames
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user-joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user-left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
