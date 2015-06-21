'use strict';

var MODULE_NAME = 'jam.sound';

var angular = require('angular');
var Modernizr = require('./modernizr-audio');

var sound = angular.module(MODULE_NAME, []);

sound.provider('SoundManager', function () {

  var sounds = {};

  var sound_analysers = {};

  var sounds_root = '/';

  var extension = Modernizr.audio.ogg ? 'ogg' : 'm4a';

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new window.AudioContext();

  this.set_sounds_root = function (root) {
    sounds_root = root;
    return this;
  };

  var get_sound_file_name = function (sound) {
    return sounds_root + sound + '.' + extension;
  };

  this.$get = function ($q) {

    var load_sound = function (sound) {
      var url = get_sound_file_name(sound);

      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      var sound_load_promise = $q(function (resolve) {
        request.onload = function () {
          context.decodeAudioData(request.response, function (buffer) {
            sounds[sound] = buffer;
            var analyser = context.createAnalyser();
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.85;
            analyser.fftSize = 128;
            sound_analysers[sound] = analyser;
            resolve(sound);
          });
        };
      });
      request.send();
      return sound_load_promise;
    };

    return {
      play: function (sound) {
        var sound_promise = $q(function (resolve) {
          var buffer = sounds[sound];
          var source = context.createBufferSource();
          source.buffer = buffer;

          var analyser = sound_analysers[sound];
          source.connect(analyser);
          analyser.connect(context.destination);

          source.onended = resolve;
          source.start(0);
        });
        return sound_promise;
      },

      add_sounds: function (sounds) {
        var sound_load_promises = [];
        angular.forEach(sounds, function (sound) {
          sound_load_promises.push(load_sound(sound));
        });
        return $q.all(sound_load_promises);
      },

      get_visualization_data: function (sound) {
        var analyser = sound_analysers[sound];
        if (!analyser) {
          return [];
        }
        var buffer_length = analyser.frequencyBinCount;
        var data = new Uint8Array(buffer_length);
        analyser.getByteFrequencyData(data);
        return data;
      }
    };
  };

});


module.exports = MODULE_NAME;
