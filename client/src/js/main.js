(function () {
  'use strict';
  var angular = require('angular');
  var base62 = require('base62');
  var Trianglify = require('./trianglify');

  var game = angular.module('game', [
    require('angular-socket-io'),
    require('angular-route'),
    require('./sound-manager'),
    require('./keyboard')
    ]
  );
  game.config(function($locationProvider, $routeProvider, SoundManagerProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/g/:game/', {
      controller: 'GameController',
      controllerAs: 'game_controller',
      templateUrl: '/partials/game.html'
    })
    .when('/g/:game/welcome/', {
      controller: 'WelcomeController',
      controllerAs: 'welcome_controller',
      templateUrl: '/partials/welcome.html',
    })
    .when('/', {
      controller: 'WelcomeController',
      controllerAs: 'welcome_controller',
      templateUrl: '/partials/welcome.html'
    }).otherwise({
      redirectTo: '/'
    });

    SoundManagerProvider.set_sounds_root('/sounds/');
  });


  game.factory('socket', function (socketFactory) {
    return socketFactory();
  });

  game.controller('AppController', function ($location, $routeParams) {
    this.start_game = function () {
      var game_id = $routeParams.game;
      if (!game_id) {
        var now = new Date();
        game_id = base62.encode(now);
      }
      $location.path('/g/' + game_id + '/');
    };
  });

  game.controller('WelcomeController', function () {

  });

  game.controller('GameController', function ($scope, $location, $routeParams, socket, SoundManager) {
    if (!$scope.app.name) {
      $location.path('/g/' + $routeParams.game + '/welcome/');
      return;
    }

    var ctrl = this;
    ctrl.instruments = [
      'clap',
      'crash',
      'fm',
      'hihat',
      'kick',
      'laser',
      'openhat',
      'perc',
      'shaker',
      'snare',
      'tom'
    ];
    ctrl.connected = false;
    ctrl.participants = [];

    ctrl.game = $routeParams.game;

    // Operations broadcasted to other peers
    socket.emit('join-game', {username: $scope.app.name, game: $routeParams.game});

    var sounds = SoundManager.add_sounds(ctrl.instruments);

    var play_sound = function (instrument) {
      sounds.then(function () {
        SoundManager.play(instrument);
      });
    };

    ctrl.play_instrument = function (instrument) {
      play_sound(instrument);
      socket.emit('play-instrument', {
        instrument: instrument
      });
    };

    // Operations originating from other peers
    socket.on('game-joined', function (users) {
      ctrl.connected = true;
      ctrl.show_participants(users);
    });

    socket.on('user-joined', function (user) {
      ctrl.add_participant(user);
    });

    socket.on('user-left', function (user) {
      ctrl.remove_participant(user);
    });

    socket.on('play-instrument', function (data) {
      console.log(data);
      play_sound(data.instrument);
    });

    ctrl.show_participants = function (users) {
      ctrl.participants = users;
    };

    ctrl.add_participant = function (user) {
      ctrl.participants[user.id] = user.username;
    };

    ctrl.remove_participant = function (user) {
      delete ctrl.participants[user.id];
    };
  });


  game.directive('avatar', function () {
    var directive = {
      scope: {
        name: '='
      },
      link: function (scope) {
        scope.$watch('name', function (name) {
          var now = new Date();
          var seed = name ? name : now.valueOf();
          var pattern = Trianglify({
              width: 60,
              height: 60,
              cell_size: 20,
              seed: seed
          });
          scope.avatar_url = pattern.png();
        });
      },
      template: '<img ng-src="{{ avatar_url }}" alt="Avatar for {{ name }}" />'
    };
    return directive;
  });

  game.filter('key_trigger', function () {
    var letters = 'qwertyuiopasdfghjklzxcvbnm'.split('');
    return function (index) {
      return letters[index];
    };
  });

}());