const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

class Sound {
  constructor() {
    const now = audioContext.currentTime;

    this.env = audioContext.createGain();
    this.env.connect(audioContext.destination);
    this.env.gain.setValueAtTime(0, now);

    this.filter = audioContext.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1000;
    this.filter.connect(this.env);

    this.osc = audioContext.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.connect(this.filter);
    this.osc.start(now);

    this.env.gain.linearRampToValueAtTime(1, now + 0.2);
  }

  update(x, y) {
    const freq = 100 + 900 * x;
    const cutoff = 500 + 3000 * (1 - y);
    this.osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    this.filter.frequency.setValueAtTime(cutoff, audioContext.currentTime);
  }

  stop() {
    const now = audioContext.currentTime;
    this.env.gain.linearRampToValueAtTime(0, now + 0.2);
    this.osc.stop(now + 0.5);
  }
}

const remoteSounds = {};
function getRemoteSound(id) {
  if (!remoteSounds[id]) {
    remoteSounds[id] = new Sound();
  }
  return remoteSounds[id];
}
