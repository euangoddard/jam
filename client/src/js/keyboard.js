'use strict';

var angular = require('angular');

var MODULE_NAME = 'jam.keyboard';
var keyboard = angular.module(MODULE_NAME, []);
module.exports = MODULE_NAME;


keyboard.factory('WindowKeyListener', function ($window, $rootScope) {
  var EVNET_NAME = 'window:keypress';

  angular.element($window).on('keypress', function (event) {
    $rootScope.$broadcast('window:keypress', [event.which]);
  });

  return {
    EVNET_NAME: EVNET_NAME
  };
});

keyboard.constant('KEY_CODES', {
  '[backspace]': 8,
  '[tab]': 9,
  '[enter]': 13,
  '[caps]': 20,
  '[esc]': 27,
  '[space]': 32,
  '[page-up]': 33,
  '[page-down]': 34,
  '[end]': 35,
  '[home]': 36,
  '[left-arrow]': 37,
  '[up-arrow]': 38,
  '[right-arrow]': 39,
  '[down-arrow]': 40,
  '[ins]': 45,
  '[del]': 46,
  '0': 48,
  '1': 49,
  '2': 50,
  '3': 51,
  '4': 52,
  '5': 53,
  '6': 54,
  '7': 55,
  '8': 56,
  '9': 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  a: 97,
  b: 98,
  c: 99,
  d: 100,
  e: 101,
  f: 102,
  g: 103,
  h: 104,
  i: 105,
  j: 106,
  k: 107,
  l: 108,
  m: 109,
  n: 110,
  o: 111,
  p: 112,
  q: 113,
  r: 114,
  s: 115,
  t: 116,
  u: 117,
  v: 118,
  w: 119,
  x: 120,
  y: 121,
  z: 122,
  '[left-meta]': 91,
  '[right-meta]': 92,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '[': 219,
  '\\': 220,
  ']': 221,
  '\'': 222
});

keyboard.directive('keyTrigger', function (WindowKeyListener, KEY_CODES) {
  var directive = {
    scope: false,
    link: function (scope, element, attrs) {
      var key = scope.$eval(attrs.keyTrigger);
      if (!key) {
        throw new Error('You must set a key via the "key-trigger" attribute');
      }
      var key_code_trigger = KEY_CODES[key];

      var target = attrs.keyTriggerTarget;
      element.text(key);

      scope.$on(WindowKeyListener.EVNET_NAME, function (event, args) {
        var key_code = args[0];
        if (key_code === key_code_trigger) {
          scope.$eval(target);
        }
      });
    },

  };
  return directive;
});