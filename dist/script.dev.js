"use strict";

/* ==========================================================================
   TIMELESS NEW YEAR - CINEMATIC WEB EXPERIENCE
   Vanilla JavaScript - No dependencies
   
   ANIMATION TIMING BREAKDOWN:
   ---------------------------
   Phase 0 (Arrival): Immediate, user waits
   Phase 1 (Initiation): ~2000ms audio fade-in, background transition
   Phase 2 (Countdown): 10 numbers × 1000ms each = 10000ms
     - Each number: 100ms fade-in, 600ms hold, 300ms dissolve
   Phase 3 (Zero Moment): 300ms silence/blackout
   Phase 4 (Release): ~8000ms fireworks bloom
   Phase 5 (Message): Fades in during Phase 4, ~2400ms transition
   Phase 6 (Afterglow): Indefinite, controls appear after ~3000ms
   
   CUSTOMIZATION GUIDE:
   --------------------
   - Text: Modify textConfig object below
   - Timing: Modify timingConfig object below
   - Colors: Modify CSS custom properties in style.css
   - Sounds: Replace files in /assets folder
   ========================================================================== */
(function () {
  'use strict';
  /* --------------------------------------------------------------------------
     Configuration - CUSTOMIZE HERE
     -------------------------------------------------------------------------- */

  var textConfig = {
    arrivalPrompt: 'Begin when ready.',
    mainMessage: 'Happy New Year',
    subMessage: 'A moment begins.' // Alternatives: 'Forward.', 'Begin.', ''

  };
  var timingConfig = {
    // Phase transitions (milliseconds)
    initiationDuration: 2000,
    // Audio fade-in time
    countdownInterval: 1000,
    // Time per countdown number
    numberFadeIn: 100,
    // Number appear duration
    numberHold: 600,
    // Number visible duration
    numberDissolve: 300,
    // Number fade duration
    zeroMomentPause: 300,
    // Silence after zero
    fireworksDuration: 8000,
    // Main fireworks display
    messageDelay: 1500,
    // Delay before message appears
    controlsDelay: 5000,
    // Delay before controls appear
    // Audio
    audioFadeInDuration: 2000,
    audioFadeOutDuration: 3000
  };
  var audioConfig = {
    ambientSrc: 'assets/ambient.mp3',
    tickSrc: 'assets/tick.mp3',
    fireworkSrc: 'assets/firework.mp3',
    ambientVolume: 0.4,
    tickVolume: 0.15,
    fireworkVolume: 0.3
  };
  /* --------------------------------------------------------------------------
     State Management
     -------------------------------------------------------------------------- */

  var state = {
    phase: 'arrival',
    // arrival, initiation, countdown, zero, release, message, afterglow
    countdownValue: 10,
    isMuted: false,
    audioInitialized: false
  };
  /* --------------------------------------------------------------------------
     Audio Manager
     -------------------------------------------------------------------------- */

  var AudioManager = {
    context: null,
    ambient: null,
    tick: null,
    firework: null,
    ambientGain: null,
    init: function init() {
      return regeneratorRuntime.async(function init$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!state.audioInitialized) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return");

            case 2:
              try {
                // Create audio context on user interaction
                this.context = new (window.AudioContext || window.webkitAudioContext)(); // Create gain node for ambient music

                this.ambientGain = this.context.createGain();
                this.ambientGain.connect(this.context.destination);
                this.ambientGain.gain.value = 0; // Create audio elements

                this.ambient = new Audio(audioConfig.ambientSrc);
                this.ambient.loop = true;
                this.ambient.volume = audioConfig.ambientVolume;
                this.tick = new Audio(audioConfig.tickSrc);
                this.tick.volume = audioConfig.tickVolume;
                this.firework = new Audio(audioConfig.fireworkSrc);
                this.firework.volume = audioConfig.fireworkVolume;
                state.audioInitialized = true;
              } catch (e) {
                console.warn('Audio initialization failed:', e);
              }

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    },
    playAmbient: function playAmbient() {
      return regeneratorRuntime.async(function playAmbient$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(!this.ambient || state.isMuted)) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return");

            case 2:
              _context2.prev = 2;
              this.ambient.volume = 0;
              _context2.next = 6;
              return regeneratorRuntime.awrap(this.ambient.play());

            case 6:
              this.fadeIn(this.ambient, audioConfig.ambientVolume, timingConfig.audioFadeInDuration);
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](2);
              console.warn('Ambient playback failed:', _context2.t0);

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[2, 9]]);
    },
    playTick: function playTick() {
      if (!this.tick || state.isMuted) return;

      try {
        this.tick.currentTime = 0;
        this.tick.play()["catch"](function () {});
      } catch (e) {// Silent fail for tick
      }
    },
    playFirework: function playFirework() {
      if (!this.firework || state.isMuted) return;

      try {
        this.firework.currentTime = 0;
        this.firework.play()["catch"](function () {});
      } catch (e) {// Silent fail for firework
      }
    },
    fadeIn: function fadeIn(audio, targetVolume, duration) {
      var _this = this;

      var startVolume = audio.volume;
      var startTime = performance.now();

      var fade = function fade(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * _this.easeOut(progress);

        if (progress < 1) {
          requestAnimationFrame(fade);
        }
      };

      requestAnimationFrame(fade);
    },
    fadeOut: function fadeOut(audio, duration) {
      var _this2 = this;

      var startVolume = audio.volume;
      var startTime = performance.now();

      var fade = function fade(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume * (1 - _this2.easeOut(progress));

        if (progress < 1) {
          requestAnimationFrame(fade);
        }
      };

      requestAnimationFrame(fade);
    },
    easeOut: function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    },
    toggleMute: function toggleMute() {
      state.isMuted = !state.isMuted;

      if (this.ambient) {
        this.ambient.muted = state.isMuted;
      }

      if (this.tick) {
        this.tick.muted = state.isMuted;
      }

      if (this.firework) {
        this.firework.muted = state.isMuted;
      }

      return state.isMuted;
    },
    stopAll: function stopAll() {
      if (this.ambient) {
        this.fadeOut(this.ambient, 1000);
      }
    }
  };
  /* --------------------------------------------------------------------------
     Star Field Canvas
     -------------------------------------------------------------------------- */

  var StarField = {
    canvas: null,
    ctx: null,
    stars: [],
    animationId: null,
    init: function init() {
      var _this3 = this;

      this.canvas = document.getElementById('stars');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.createStars();
      this.animate();
      window.addEventListener('resize', function () {
        return _this3.resize();
      });
    },
    resize: function resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    createStars: function createStars() {
      var count = Math.floor(window.innerWidth * window.innerHeight / 8000);
      this.stars = [];

      for (var i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.01 + 0.005
        });
      }
    },
    animate: function animate() {
      var _this4 = this;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.stars.forEach(function (star) {
        star.pulse += star.pulseSpeed;
        var opacity = star.opacity * (0.5 + 0.5 * Math.sin(star.pulse));

        _this4.ctx.beginPath();

        _this4.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        _this4.ctx.fillStyle = "rgba(255, 255, 255, ".concat(opacity, ")");

        _this4.ctx.fill();
      });
      this.animationId = requestAnimationFrame(function () {
        return _this4.animate();
      });
    }
  };
  /* --------------------------------------------------------------------------
     Fireworks Canvas
     -------------------------------------------------------------------------- */

  var Fireworks = {
    canvas: null,
    ctx: null,
    particles: [],
    rockets: [],
    animationId: null,
    isActive: false,
    init: function init() {
      var _this5 = this;

      this.canvas = document.getElementById('fireworks');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', function () {
        return _this5.resize();
      });
    },
    resize: function resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    start: function start() {
      this.isActive = true;
      this.canvas.classList.add('active');
      this.launchSequence();
      this.animate();
    },
    launchSequence: function launchSequence() {
      var _this6 = this;

      // Deliberate, paced launches - not chaotic
      var launches = [{
        delay: 0,
        x: 0.5
      }, {
        delay: 800,
        x: 0.3
      }, {
        delay: 1200,
        x: 0.7
      }, {
        delay: 2000,
        x: 0.4
      }, {
        delay: 2500,
        x: 0.6
      }, {
        delay: 3200,
        x: 0.2
      }, {
        delay: 3800,
        x: 0.8
      }, {
        delay: 4500,
        x: 0.5
      }, {
        delay: 5200,
        x: 0.35
      }, {
        delay: 5800,
        x: 0.65
      }, {
        delay: 6500,
        x: 0.45
      }, {
        delay: 7200,
        x: 0.55
      }];
      launches.forEach(function (launch) {
        setTimeout(function () {
          if (_this6.isActive) {
            _this6.createRocket(launch.x);
          }
        }, launch.delay);
      });
    },
    createRocket: function createRocket(xPercent) {
      var x = this.canvas.width * xPercent;
      var targetY = this.canvas.height * (0.2 + Math.random() * 0.3);
      this.rockets.push({
        x: x,
        y: this.canvas.height,
        targetY: targetY,
        speed: 8 + Math.random() * 4,
        trail: []
      });
    },
    explode: function explode(x, y) {
      AudioManager.playFirework(); // Warm, soft color palette - no neon

      var colors = ['rgba(255, 230, 200, ', // Warm white
      'rgba(255, 200, 150, ', // Soft gold
      'rgba(255, 180, 140, ', // Peach
      'rgba(200, 180, 255, ', // Soft lavender
      'rgba(180, 200, 255, ' // Soft blue
      ];
      var color = colors[Math.floor(Math.random() * colors.length)];
      var particleCount = 80 + Math.floor(Math.random() * 40);

      for (var i = 0; i < particleCount; i++) {
        var angle = Math.PI * 2 * i / particleCount + Math.random() * 0.2;
        var velocity = 2 + Math.random() * 4;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          decay: 0.008 + Math.random() * 0.008,
          color: color,
          size: 2 + Math.random() * 2,
          trail: []
        });
      }
    },
    animate: function animate() {
      var _this7 = this;

      // Fade effect for afterimage/lingering light
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Update and draw rockets

      this.rockets = this.rockets.filter(function (rocket) {
        rocket.y -= rocket.speed; // Trail

        rocket.trail.push({
          x: rocket.x,
          y: rocket.y
        });
        if (rocket.trail.length > 10) rocket.trail.shift(); // Draw trail

        rocket.trail.forEach(function (point, i) {
          var alpha = i / rocket.trail.length * 0.5;

          _this7.ctx.beginPath();

          _this7.ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);

          _this7.ctx.fillStyle = "rgba(255, 200, 150, ".concat(alpha, ")");

          _this7.ctx.fill();
        });

        if (rocket.y <= rocket.targetY) {
          _this7.explode(rocket.x, rocket.y);

          return false;
        }

        return true;
      }); // Update and draw particles

      this.particles = this.particles.filter(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity

        p.vx *= 0.99; // Air resistance

        p.life -= p.decay; // Trail for afterimage

        p.trail.push({
          x: p.x,
          y: p.y,
          life: p.life
        });
        if (p.trail.length > 5) p.trail.shift(); // Draw trail

        p.trail.forEach(function (point, i) {
          var alpha = point.life * 0.3 * (i / p.trail.length);

          _this7.ctx.beginPath();

          _this7.ctx.arc(point.x, point.y, p.size * 0.5, 0, Math.PI * 2);

          _this7.ctx.fillStyle = p.color + alpha + ')';

          _this7.ctx.fill();
        }); // Draw particle

        if (p.life > 0) {
          _this7.ctx.beginPath();

          _this7.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);

          _this7.ctx.fillStyle = p.color + p.life + ')';

          _this7.ctx.fill();
        }

        return p.life > 0;
      });
      this.animationId = requestAnimationFrame(function () {
        return _this7.animate();
      });
    },
    fadeOut: function fadeOut() {
      var _this8 = this;

      // Stop launching but let existing particles finish
      this.isActive = false;
      setTimeout(function () {
        _this8.canvas.classList.remove('active');
      }, 3000);
    }
  };
  /* --------------------------------------------------------------------------
     Experience Controller
     -------------------------------------------------------------------------- */

  var Experience = {
    elements: {},
    init: function init() {
      // Cache DOM elements
      this.elements = {
        body: document.body,
        phaseArrival: document.getElementById('phase-arrival'),
        phaseCountdown: document.getElementById('phase-countdown'),
        phaseMessage: document.getElementById('phase-message'),
        beginButton: document.getElementById('beginButton'),
        countdownNumber: document.getElementById('countdownNumber'),
        controls: document.getElementById('controls'),
        replayButton: document.getElementById('replayButton'),
        soundToggle: document.getElementById('soundToggle'),
        messageMain: document.querySelector('.message-main'),
        messageSub: document.querySelector('.message-sub')
      }; // Set customizable text

      document.querySelector('.arrival-text').textContent = textConfig.arrivalPrompt;
      this.elements.messageMain.textContent = textConfig.mainMessage;
      this.elements.messageSub.textContent = textConfig.subMessage; // Initialize visual systems

      StarField.init();
      Fireworks.init(); // Bind events

      this.bindEvents();
    },
    bindEvents: function bindEvents() {
      var _this9 = this;

      this.elements.beginButton.addEventListener('click', function () {
        return _this9.begin();
      });
      this.elements.replayButton.addEventListener('click', function () {
        return _this9.replay();
      });
      this.elements.soundToggle.addEventListener('click', function () {
        return _this9.toggleSound();
      }); // Keyboard accessibility

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && state.phase === 'arrival') {
          _this9.begin();
        }

        if (e.key === 'm' && state.phase === 'afterglow') {
          _this9.toggleSound();
        }
      });
    },
    begin: function begin() {
      var _this10 = this;

      return regeneratorRuntime.async(function begin$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // Phase 1: Initiation
              state.phase = 'initiation'; // Initialize audio on user interaction

              _context3.next = 3;
              return regeneratorRuntime.awrap(AudioManager.init());

            case 3:
              // Hide cursor for immersion
              this.elements.body.classList.add('immersive'); // Start ambient audio

              AudioManager.playAmbient(); // Transition out arrival

              this.elements.phaseArrival.classList.remove('active'); // Wait for initiation to complete

              setTimeout(function () {
                _this10.startCountdown();
              }, timingConfig.initiationDuration);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    },
    startCountdown: function startCountdown() {
      // Phase 2: Countdown
      state.phase = 'countdown';
      state.countdownValue = 10;
      this.elements.phaseCountdown.classList.add('active');
      this.showNumber();
    },
    showNumber: function showNumber() {
      var _this11 = this;

      var num = state.countdownValue;
      var el = this.elements.countdownNumber;
      var phase = this.elements.phaseCountdown; // Update visual pressure (subtle brightness increase)

      for (var i = 1; i <= 10; i++) {
        phase.classList.remove("pressure-".concat(i));
      }

      phase.classList.add("pressure-".concat(11 - num)); // Display number

      el.textContent = num;
      el.classList.remove('dissolve');
      el.classList.add('visible'); // Play tick (felt, not heard - very subtle)

      AudioManager.playTick(); // Schedule dissolve

      setTimeout(function () {
        el.classList.add('dissolve');
        el.classList.remove('visible'); // Schedule next number or zero moment

        setTimeout(function () {
          state.countdownValue--;

          if (state.countdownValue > 0) {
            _this11.showNumber();
          } else {
            _this11.zeroMoment();
          }
        }, timingConfig.numberDissolve);
      }, timingConfig.numberFadeIn + timingConfig.numberHold);
    },
    zeroMoment: function zeroMoment() {
      var _this12 = this;

      // Phase 3: Zero Moment - Breath
      state.phase = 'zero'; // Hide countdown

      this.elements.phaseCountdown.classList.remove('active'); // Pure silence and darkness for 300ms
      // This pause matters.

      setTimeout(function () {
        _this12.release();
      }, timingConfig.zeroMomentPause);
    },
    release: function release() {
      var _this13 = this;

      // Phase 4: Release
      state.phase = 'release'; // Start fireworks

      Fireworks.start(); // Show message after delay

      setTimeout(function () {
        _this13.showMessage();
      }, timingConfig.messageDelay); // Transition to afterglow

      setTimeout(function () {
        _this13.afterglow();
      }, timingConfig.fireworksDuration);
    },
    showMessage: function showMessage() {
      // Phase 5: Message
      state.phase = 'message';
      this.elements.phaseMessage.classList.add('active');
    },
    afterglow: function afterglow() {
      var _this14 = this;

      // Phase 6: Afterglow
      state.phase = 'afterglow'; // Fade out fireworks

      Fireworks.fadeOut(); // Restore cursor

      this.elements.body.classList.remove('immersive'); // Show controls

      setTimeout(function () {
        _this14.elements.controls.classList.add('visible');
      }, timingConfig.controlsDelay - timingConfig.fireworksDuration);
    },
    replay: function replay() {
      // Reset state
      state.phase = 'arrival';
      state.countdownValue = 10; // Reset UI

      this.elements.body.classList.remove('immersive');
      this.elements.phaseArrival.classList.add('active');
      this.elements.phaseCountdown.classList.remove('active');
      this.elements.phaseMessage.classList.remove('active');
      this.elements.controls.classList.remove('visible'); // Remove pressure classes

      for (var i = 1; i <= 10; i++) {
        this.elements.phaseCountdown.classList.remove("pressure-".concat(i));
      } // Clear canvases


      Fireworks.isActive = false;
      Fireworks.particles = [];
      Fireworks.rockets = [];
      Fireworks.ctx.clearRect(0, 0, Fireworks.canvas.width, Fireworks.canvas.height);
      Fireworks.canvas.classList.remove('active'); // Reset audio

      if (AudioManager.ambient) {
        AudioManager.ambient.currentTime = 0;
        AudioManager.ambient.pause();
      }
    },
    toggleSound: function toggleSound() {
      var muted = AudioManager.toggleMute();
      this.elements.soundToggle.classList.toggle('muted', muted);
    }
  };
  /* --------------------------------------------------------------------------
     Initialize on DOM Ready
     -------------------------------------------------------------------------- */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      return Experience.init();
    });
  } else {
    Experience.init();
  }
})();
//# sourceMappingURL=script.dev.js.map
