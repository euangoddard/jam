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


var USERS_BY_GAME = {};
var USER_COUNTER = 0;

io.on('connection', function (socket) {

  socket.on('play-instrument', function (data) {
    socket.broadcast.emit('play-instrument', {
      username: socket.user_id,
      instrument: data.instrument
    });
  });

  socket.on('join-game', function (data) {
    var username = data.username;
    var user_id = ++USER_COUNTER;
    var game = data.game;

    socket.user_id = user_id;
    socket.game = game;

    var game_users = USERS_BY_GAME[game] || {};
    game_users[user_id] = username;
    USERS_BY_GAME[game] = game_users;

    socket.join(game);
    socket.emit('game-joined', game_users);
    socket.to(game);

    socket.broadcast.emit('user-joined', {
      id: user_id,
      username: username
    });
  });

  socket.on('disconnect', function () {
    if (socket.game && socket.user_id) {
      var game_users = USERS_BY_GAME[socket.game];
      delete game_users[socket.user_id];
      if (Object.keys(game_users).length === 0) {
        delete USERS_BY_GAME[socket.game];
      }

      socket.broadcast.emit('user-left', {
        id: socket.user_id
      });
    }
  });
});
