'use strict';

var angular = require('angular');

var MODULE_NAME = 'jam.viz';
var viz = angular.module(MODULE_NAME, [require('./sound')]);

module.exports = MODULE_NAME;


viz.factory('VizualizerCoordinator', function () {

});

viz.directive('visualizeInstrument', function ($window, SoundManager) {
  var directive = {
    scope: false,
    link: function (scope, element, attrs) {
      var instrument = scope.$eval(attrs.visualizeInstrument);

      var canvas = document.createElement('canvas');
      var box = element[0];
      box.appendChild(canvas);
      var ctx = canvas.getContext('2d');

      var width;
      var height;
      var set_size = function () {
        width = box.clientWidth;
        height = box.clientHeight;
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
      };
      $window.addEventListener('resize', set_size);
      set_size();

      var raf_id;
      var vizualize = function () {
        raf_id = $window.requestAnimationFrame(vizualize);
        ctx.clearRect(0, 0, width, height);
        var data = SoundManager.get_visualization_data(instrument);
        var data_size = data.length;
        if (!data_size) {
          return;
        }
        var bar_width = (width / data_size) * 2.5;
        var bar_height;
        var x = 0;
        for (var i = 0; i < data_size; i++) {
          bar_height = data[i];
          ctx.fillStyle = 'rgb(50,' + (bar_height + 70) + ',50)';
          ctx.fillRect(x, height - bar_height / 2, bar_width, bar_height / 2);
          x += bar_width + 1;
        }
      };
      vizualize();

      scope.$on('$destroy', function () {
        $window.cancelAnimationFrame(raf_id);
        $window.removeEventListener('resize', set_size);
      });
    }
  };
  return directive;
});