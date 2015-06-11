(function () {
  var angular = require('angular');
  var base62 = require('base62');

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
    }).when('/', {
      controller: 'WelcomeController',
      controllerAs: 'welcome_controller',
      templateUrl: '/partials/welcome.html'
    }).otherwise({
      redirectTo: '/'
    });
  });


  game.factory('socket', function (SocketFactory) {
    return SocketFactory();
  });

  game.controller('AppController', function ($location) {
    this.start_new_game = function () {
      var now = new Date();
      var new_game_id = base62.encode(now);
      $location.path('/g/' + new_game_id + '/');
    };
  });

  game.controller('WelcomeController', function () {

  });

  game.controller('GameController', function ($routeParams) {
    console.log($routeParams);
    this.game = $routeParams.game;
  });

}());
