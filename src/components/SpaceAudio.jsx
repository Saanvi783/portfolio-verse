class SpaceAudioEngine {
  constructor() {
    this.ctx = null;
    this.droneGain = null;
    this.oscillators = [];
    this.lfo = null;
    this.filter = null;
    this.isPlaying = false;
    this.masterGain = null;
  }
  
  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    
    // Create master volume node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.35; // Comfortable volume
    this.masterGain.connect(this.ctx.destination);
  }
  
  startDrone() {
    this.init();
    if (!this.ctx) return;
    if (this.isPlaying) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const now = this.ctx.currentTime;
    
    // Create low pass filter to give a deep, underwater space atmosphere
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 130;
    this.filter.Q.value = 5;
    
    // Create Drone Gain Node
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, now);
    
    // Generate detuned low oscillators for rich chorusing effect
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(55, now); // A1 note
    
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(55.3, now); // Slightly detuned
    
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(110, now); // A2 note (one octave up) for body
    
    // Connect oscillators to filter
    osc1.connect(this.filter);
    osc2.connect(this.filter);
    osc3.connect(this.filter);
    
    // Synthesize LFO to modulate filter cutoff frequency, making the sound "breathe"
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.12, now); // Very slow rate (8 seconds per cycle)
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(35, now); // Modulate cut-off by +/- 35Hz
    
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    
    // Connect filter to gain node, then to master
    this.filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    
    // Start nodes
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    this.lfo.start(now);
    
    this.oscillators = [osc1, osc2, osc3];
    
    // Smoothly fade in over 3 seconds to prevent pop/click
    this.droneGain.gain.linearRampToValueAtTime(0.6, now + 3.0);
    this.isPlaying = true;
  }
  
  stopDrone() {
    if (!this.isPlaying || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    if (this.droneGain) {
      // Fade out over 1.2 seconds
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.linearRampToValueAtTime(0, now + 1.2);
      
      const currentOscillators = [...this.oscillators];
      const currentLfo = this.lfo;
      
      setTimeout(() => {
        try {
          if (currentLfo) currentLfo.stop();
          currentOscillators.forEach(osc => osc.stop());
        } catch (e) {
          console.warn("Error stopping synth nodes: ", e);
        }
      }, 1300);
      
      this.oscillators = [];
      this.lfo = null;
      this.isPlaying = false;
    }
  }
  
  playChime() {
    if (!this.ctx || !this.isPlaying || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    
    // Create synth chime nodes
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator(); // Ring modulator helper
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sine';
    // Celestial notes: C5, E5, G5, A5, C6
    const freqs = [523.25, 659.25, 783.99, 880.00, 1046.50];
    const targetFreq = freqs[Math.floor(Math.random() * freqs.length)];
    osc.frequency.setValueAtTime(targetFreq, now);
    
    // Add minor FM modulation for metallic bell tone
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(targetFreq * 1.5, now);
    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(80, now);
    
    osc2.connect(modGain);
    modGain.connect(osc.frequency);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(targetFreq, now);
    filter.Q.value = 2;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc2.start(now);
    
    osc.stop(now + 1.6);
    osc2.stop(now + 1.6);
  }
  
  playWoosh() {
    if (!this.ctx || !this.isPlaying || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    const duration = 1.8;
    
    // Create nodes for spacecraft acceleration sweep
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(35, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + duration * 0.7);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(60, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + duration * 0.6);
    filter.Q.value = 6;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + duration + 0.1);
  }
  
  playClick() {
    if (!this.ctx || !this.isPlaying || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const spaceAudio = new SpaceAudioEngine();
