const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

class Sound {
  constructor() {
    this.env = audioContext.createGain();
    this.env.connect(audioContext.destination);
    this.env.gain.setValueAtTime(0, audioContext.currentTime);

    this.lowpass = audioContext.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 1000;
    this.lowpass.connect(this.env);

    this.osc = audioContext.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.connect(this.lowpass);
    this.osc.start();

    this.env.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.2);
  }

  update(x, y) {
    const freq = 100 + 800 * (x / canvas.width);
    const cutoff = 500 + 3000 * (1 - y / canvas.height);
    this.osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    this.lowpass.frequency.setValueAtTime(cutoff, audioContext.currentTime);
  }

  stop() {
    this.env.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
    this.osc.stop(audioContext.currentTime + 0.5);
  }
}

let localSound = null;
canvas.addEventListener('mousedown', (e) => {
  if (!localSound) {
    localSound = new Sound();
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (localSound) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    localSound.update(x, y);
    socket.send(JSON.stringify(['handmove', x, y]));
  }
});

canvas.addEventListener('mouseup', () => {
  if (localSound) {
    localSound.stop();
    localSound = null;
  }
});
