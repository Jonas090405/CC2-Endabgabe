const socket = new WebSocket('wss://nosch.uber.space/web-rooms/');
let clientId = null;
let clientCount = 0;
const infoDisplay = document.getElementById('info-display');

const otherSounds = {};

socket.addEventListener('open', () => {
  socket.send(JSON.stringify(['*enter-room*', 'collab-synth']));
  socket.send(JSON.stringify(['*subscribe-client-count*']));
  setInterval(() => socket.send(''), 30000);
});

socket.addEventListener('message', (event) => {
  if (!event.data) return;
  const data = JSON.parse(event.data);

  switch (data[0]) {
    case '*client-id*':
      clientId = data[1];
      break;

    case '*client-count*':
      clientCount = data[1];
      infoDisplay.textContent = `Verbundene Clients: ${clientCount}`;
      break;

    case 'handmove':
      const [_, x, y, sender] = data;
      if (sender === clientId) return;

      if (!otherSounds[sender]) {
        otherSounds[sender] = new Sound();
      }
      otherSounds[sender].update(x, y);
      break;

    case 'stop':
      const stopClient = data[1];
      if (otherSounds[stopClient]) {
        otherSounds[stopClient].stop();
        delete otherSounds[stopClient];
      }
      break;

    case '*error*':
      console.warn('Fehler:', ...data[1]);
      break;
  }
});
