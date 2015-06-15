(function () {
  'use strict';

  var MODULE_NAME = 'sound-manager';

  var angular = require('angular');
  var Modernizr = require('./modernizr-audio');

  var sound = angular.module(MODULE_NAME, []);

  sound.provider('SoundManager', function () {

    var sounds = {};

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
            source.connect(context.destination);
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
        }
      };
    };

  });

  module.exports = MODULE_NAME;

}());
