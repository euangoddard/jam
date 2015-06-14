(function () {
  var angular = require('angular');
  var base62 = require('base62');
  var Trianglify = require('./trianglify');

  var game = angular.module('game', [
    require('angular-socket-io'),
    require('angular-route')
    ]
  );
  game.config(function($locationProvider, $routeProvider) {
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

  game.controller('GameController', function ($scope, $location, $routeParams, socket) {
    if (!$scope.app.name) {
      $location.path('/g/' + $routeParams.game + '/welcome/');
      return;
    }

    var ctrl = this;
    ctrl.connected = false;
    ctrl.participants = [];

    ctrl.game = $routeParams.game;
    socket.emit('add-user', $scope.app.name);

    socket.on('login', function (data) {
      ctrl.connected = true;
      // Display the welcome message
      ctrl.show_participants(Object.keys(data.usernames));
    });

    socket.on('user-joined', function (data) {
      ctrl.add_participant(data.username);
    });

    socket.on('user-left', function (data) {
      ctrl.remove_participant(data.username);
    });

    ctrl.show_participants = function (usernames) {
      ctrl.participants = usernames;
    };

    ctrl.add_participant = function (username) {
      ctrl.participants.push(username);
    };

    ctrl.remove_participant = function (username) {
      var index = ctrl.participants.indexOf(username);
      if (index !== -1) {
        ctrl.participants.splice(index, 1);  
      }
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
      template: '<img src="{{ avatar_url }}" alt="Avatar for {{ name }}" />'
    };
    return directive;
  });

}());
