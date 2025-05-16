function startWebRTC(peerId, initiator) {
  const pc = new RTCPeerConnection();
  peers[peerId] = pc;

  let dc;

  if (initiator) {
    dc = pc.createDataChannel('hand');
    setupDataChannel(peerId, dc);
  } else {
    pc.ondatachannel = event => {
      setupDataChannel(peerId, event.channel);
    };
  }

  pc.onicecandidate = event => {
    if (event.candidate) {
      sendSignal(peerId, { candidate: event.candidate });
    }
  };

  if (initiator) {
    pc.createOffer().then(offer => {
      pc.setLocalDescription(offer);
      sendSignal(peerId, { desc: offer });
    });
  }

  peers[peerId].pc = pc;
  peers[peerId].dc = dc;
}

function setupDataChannel(peerId, channel) {
  channel.onopen = () => console.log(`DataChannel to ${peerId} open`);
  channel.onmessage = (event) => {
    const { x, y } = JSON.parse(event.data);
    const sound = getRemoteSound(peerId);
    sound.update(x, y);
  };
  peers[peerId].dc = channel;
}

function handleSignal(peerId, data) {
  let pc = peers[peerId]?.pc;

  if (!pc) {
    pc = new RTCPeerConnection();
    peers[peerId] = { pc };
    pc.ondatachannel = event => {
      setupDataChannel(peerId, event.channel);
    };
    pc.onicecandidate = event => {
      if (event.candidate) sendSignal(peerId, { candidate: event.candidate });
    };
  }

  if (data.desc) {
    pc.setRemoteDescription(new RTCSessionDescription(data.desc)).then(() => {
      if (data.desc.type === 'offer') {
        pc.createAnswer().then(answer => {
          pc.setLocalDescription(answer);
          sendSignal(peerId, { desc: answer });
        });
      }
    });
  }

  if (data.candidate) {
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function broadcastMovement(x, y) {
  for (const peer of Object.values(peers)) {
    const dc = peer.dc;
    if (dc && dc.readyState === 'open') {
      dc.send(JSON.stringify({ x, y }));
    }
  }
}
