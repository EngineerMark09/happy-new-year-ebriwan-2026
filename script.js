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

(function() {
  'use strict';

  /* --------------------------------------------------------------------------
     Configuration - CUSTOMIZE HERE
     -------------------------------------------------------------------------- */
  
  const textConfig = {
    arrivalPrompt: 'Begin when ready.',
    mainMessage: 'Happy New Year',
    subMessage: 'A moment begins.'  // Alternatives: 'Forward.', 'Begin.', ''
  };

  const timingConfig = {
    // Phase transitions (milliseconds)
    initiationDuration: 2000,      // Audio fade-in time
    countdownInterval: 1000,       // Time per countdown number
    numberFadeIn: 100,             // Number appear duration
    numberHold: 600,               // Number visible duration
    numberDissolve: 300,           // Number fade duration
    zeroMomentPause: 300,          // Silence after zero
    fireworksDuration: 8000,       // Main fireworks display
    messageDelay: 1500,            // Delay before message appears
    controlsDelay: 5000,           // Delay before controls appear
    
    // Audio
    audioFadeInDuration: 2000,
    audioFadeOutDuration: 3000
  };

  const audioConfig = {
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
  
  const state = {
    phase: 'arrival',  // arrival, initiation, countdown, zero, release, message, afterglow
    countdownValue: 10,
    isMuted: false,
    audioInitialized: false
  };

  /* --------------------------------------------------------------------------
     Audio Manager
     -------------------------------------------------------------------------- */
  
  const AudioManager = {
    context: null,
    ambient: null,
    tick: null,
    firework: null,
    ambientGain: null,

    async init() {
      if (state.audioInitialized) return;
      
      try {
        // Create audio context on user interaction
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create gain node for ambient music
        this.ambientGain = this.context.createGain();
        this.ambientGain.connect(this.context.destination);
        this.ambientGain.gain.value = 0;

        // Create audio elements
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
    },

    async playAmbient() {
      if (!this.ambient || state.isMuted) return;
      
      try {
        this.ambient.volume = 0;
        await this.ambient.play();
        this.fadeIn(this.ambient, audioConfig.ambientVolume, timingConfig.audioFadeInDuration);
      } catch (e) {
        console.warn('Ambient playback failed:', e);
      }
    },

    playTick() {
      if (!this.tick || state.isMuted) return;
      
      try {
        this.tick.currentTime = 0;
        this.tick.play().catch(() => {});
      } catch (e) {
        // Silent fail for tick
      }
    },

    playFirework() {
      if (!this.firework || state.isMuted) return;
      
      try {
        this.firework.currentTime = 0;
        this.firework.play().catch(() => {});
      } catch (e) {
        // Silent fail for firework
      }
    },

    fadeIn(audio, targetVolume, duration) {
      const startVolume = audio.volume;
      const startTime = performance.now();
      
      const fade = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = startVolume + (targetVolume - startVolume) * this.easeOut(progress);
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        }
      };
      
      requestAnimationFrame(fade);
    },

    fadeOut(audio, duration) {
      const startVolume = audio.volume;
      const startTime = performance.now();
      
      const fade = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = startVolume * (1 - this.easeOut(progress));
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        }
      };
      
      requestAnimationFrame(fade);
    },

    easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    },

    toggleMute() {
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

    stopAll() {
      if (this.ambient) {
        this.fadeOut(this.ambient, 1000);
      }
    }
  };

  /* --------------------------------------------------------------------------
     Star Field Canvas
     -------------------------------------------------------------------------- */
  
  const StarField = {
    canvas: null,
    ctx: null,
    stars: [],
    animationId: null,

    init() {
      this.canvas = document.getElementById('stars');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.createStars();
      this.animate();
      
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    createStars() {
      const count = Math.floor((window.innerWidth * window.innerHeight) / 8000);
      this.stars = [];
      
      for (let i = 0; i < count; i++) {
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

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.stars.forEach(star => {
        star.pulse += star.pulseSpeed;
        const opacity = star.opacity * (0.5 + 0.5 * Math.sin(star.pulse));
        
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.fill();
      });
      
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  };

  /* --------------------------------------------------------------------------
     Fireworks Canvas
     -------------------------------------------------------------------------- */
  
  const Fireworks = {
    canvas: null,
    ctx: null,
    particles: [],
    rockets: [],
    animationId: null,
    isActive: false,

    init() {
      this.canvas = document.getElementById('fireworks');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    start() {
      this.isActive = true;
      this.canvas.classList.add('active');
      this.launchSequence();
      this.animate();
    },

    launchSequence() {
      // Deliberate, paced launches - not chaotic
      const launches = [
        { delay: 0, x: 0.5 },
        { delay: 800, x: 0.3 },
        { delay: 1200, x: 0.7 },
        { delay: 2000, x: 0.4 },
        { delay: 2500, x: 0.6 },
        { delay: 3200, x: 0.2 },
        { delay: 3800, x: 0.8 },
        { delay: 4500, x: 0.5 },
        { delay: 5200, x: 0.35 },
        { delay: 5800, x: 0.65 },
        { delay: 6500, x: 0.45 },
        { delay: 7200, x: 0.55 }
      ];

      launches.forEach(launch => {
        setTimeout(() => {
          if (this.isActive) {
            this.createRocket(launch.x);
          }
        }, launch.delay);
      });
    },

    createRocket(xPercent) {
      const x = this.canvas.width * xPercent;
      const targetY = this.canvas.height * (0.2 + Math.random() * 0.3);
      
      this.rockets.push({
        x: x,
        y: this.canvas.height,
        targetY: targetY,
        speed: 8 + Math.random() * 4,
        trail: []
      });
    },

    explode(x, y) {
      AudioManager.playFirework();
      
      // Warm, soft color palette - no neon
      const colors = [
        'rgba(255, 230, 200, ',   // Warm white
        'rgba(255, 200, 150, ',   // Soft gold
        'rgba(255, 180, 140, ',   // Peach
        'rgba(200, 180, 255, ',   // Soft lavender
        'rgba(180, 200, 255, '    // Soft blue
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particleCount = 80 + Math.floor(Math.random() * 40);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const velocity = 2 + Math.random() * 4;
        
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

    animate() {
      // Fade effect for afterimage/lingering light
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Update and draw rockets
      this.rockets = this.rockets.filter(rocket => {
        rocket.y -= rocket.speed;
        
        // Trail
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > 10) rocket.trail.shift();
        
        // Draw trail
        rocket.trail.forEach((point, i) => {
          const alpha = i / rocket.trail.length * 0.5;
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 200, 150, ${alpha})`;
          this.ctx.fill();
        });
        
        if (rocket.y <= rocket.targetY) {
          this.explode(rocket.x, rocket.y);
          return false;
        }
        return true;
      });

      // Update and draw particles
      this.particles = this.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.vx *= 0.99; // Air resistance
        p.life -= p.decay;
        
        // Trail for afterimage
        p.trail.push({ x: p.x, y: p.y, life: p.life });
        if (p.trail.length > 5) p.trail.shift();
        
        // Draw trail
        p.trail.forEach((point, i) => {
          const alpha = (point.life * 0.3) * (i / p.trail.length);
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, p.size * 0.5, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color + alpha + ')';
          this.ctx.fill();
        });
        
        // Draw particle
        if (p.life > 0) {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color + p.life + ')';
          this.ctx.fill();
        }
        
        return p.life > 0;
      });

      this.animationId = requestAnimationFrame(() => this.animate());
    },

    fadeOut() {
      // Stop launching but let existing particles finish
      this.isActive = false;
      
      setTimeout(() => {
        this.canvas.classList.remove('active');
      }, 3000);
    }
  };

  /* --------------------------------------------------------------------------
     Experience Controller
     -------------------------------------------------------------------------- */
  
  const Experience = {
    elements: {},

    init() {
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
      };

      // Set customizable text
      document.querySelector('.arrival-text').textContent = textConfig.arrivalPrompt;
      this.elements.messageMain.textContent = textConfig.mainMessage;
      this.elements.messageSub.textContent = textConfig.subMessage;

      // Initialize visual systems
      StarField.init();
      Fireworks.init();

      // Bind events
      this.bindEvents();
    },

    bindEvents() {
      this.elements.beginButton.addEventListener('click', () => this.begin());
      this.elements.replayButton.addEventListener('click', () => this.replay());
      this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
      
      // Keyboard accessibility
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && state.phase === 'arrival') {
          this.begin();
        }
        if (e.key === 'm' && state.phase === 'afterglow') {
          this.toggleSound();
        }
      });
    },

    async begin() {
      // Phase 1: Initiation
      state.phase = 'initiation';
      
      // Initialize audio on user interaction
      await AudioManager.init();
      
      // Hide cursor for immersion
      this.elements.body.classList.add('immersive');
      
      // Start ambient audio
      AudioManager.playAmbient();
      
      // Transition out arrival
      this.elements.phaseArrival.classList.remove('active');
      
      // Wait for initiation to complete
      setTimeout(() => {
        this.startCountdown();
      }, timingConfig.initiationDuration);
    },

    startCountdown() {
      // Phase 2: Countdown
      state.phase = 'countdown';
      state.countdownValue = 10;
      
      this.elements.phaseCountdown.classList.add('active');
      
      this.showNumber();
    },

    showNumber() {
      const num = state.countdownValue;
      const el = this.elements.countdownNumber;
      const phase = this.elements.phaseCountdown;
      
      // Update visual pressure (subtle brightness increase)
      for (let i = 1; i <= 10; i++) {
        phase.classList.remove(`pressure-${i}`);
      }
      phase.classList.add(`pressure-${11 - num}`);
      
      // Display number
      el.textContent = num;
      el.classList.remove('dissolve');
      el.classList.add('visible');
      
      // Play tick (felt, not heard - very subtle)
      AudioManager.playTick();
      
      // Schedule dissolve
      setTimeout(() => {
        el.classList.add('dissolve');
        el.classList.remove('visible');
        
        // Schedule next number or zero moment
        setTimeout(() => {
          state.countdownValue--;
          
          if (state.countdownValue > 0) {
            this.showNumber();
          } else {
            this.zeroMoment();
          }
        }, timingConfig.numberDissolve);
        
      }, timingConfig.numberFadeIn + timingConfig.numberHold);
    },

    zeroMoment() {
      // Phase 3: Zero Moment - Breath
      state.phase = 'zero';
      
      // Hide countdown
      this.elements.phaseCountdown.classList.remove('active');
      
      // Pure silence and darkness for 300ms
      // This pause matters.
      
      setTimeout(() => {
        this.release();
      }, timingConfig.zeroMomentPause);
    },

    release() {
      // Phase 4: Release
      state.phase = 'release';
      
      // Start fireworks
      Fireworks.start();
      
      // Show message after delay
      setTimeout(() => {
        this.showMessage();
      }, timingConfig.messageDelay);
      
      // Transition to afterglow
      setTimeout(() => {
        this.afterglow();
      }, timingConfig.fireworksDuration);
    },

    showMessage() {
      // Phase 5: Message
      state.phase = 'message';
      this.elements.phaseMessage.classList.add('active');
    },

    afterglow() {
      // Phase 6: Afterglow
      state.phase = 'afterglow';
      
      // Fade out fireworks
      Fireworks.fadeOut();
      
      // Restore cursor
      this.elements.body.classList.remove('immersive');
      
      // Show controls
      setTimeout(() => {
        this.elements.controls.classList.add('visible');
      }, timingConfig.controlsDelay - timingConfig.fireworksDuration);
    },

    replay() {
      // Reset state
      state.phase = 'arrival';
      state.countdownValue = 10;
      
      // Reset UI
      this.elements.body.classList.remove('immersive');
      this.elements.phaseArrival.classList.add('active');
      this.elements.phaseCountdown.classList.remove('active');
      this.elements.phaseMessage.classList.remove('active');
      this.elements.controls.classList.remove('visible');
      
      // Remove pressure classes
      for (let i = 1; i <= 10; i++) {
        this.elements.phaseCountdown.classList.remove(`pressure-${i}`);
      }
      
      // Clear canvases
      Fireworks.isActive = false;
      Fireworks.particles = [];
      Fireworks.rockets = [];
      Fireworks.ctx.clearRect(0, 0, Fireworks.canvas.width, Fireworks.canvas.height);
      Fireworks.canvas.classList.remove('active');
      
      // Reset audio
      if (AudioManager.ambient) {
        AudioManager.ambient.currentTime = 0;
        AudioManager.ambient.pause();
      }
    },

    toggleSound() {
      const muted = AudioManager.toggleMute();
      this.elements.soundToggle.classList.toggle('muted', muted);
    }
  };

  /* --------------------------------------------------------------------------
     Initialize on DOM Ready
     -------------------------------------------------------------------------- */
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Experience.init());
  } else {
    Experience.init();
  }

})();
