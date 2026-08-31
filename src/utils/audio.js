// Web Audio API procedural aerosol spray sound synthesizer
let audioCtx = null;
let noiseNode = null;
let gainNode = null;
let filterNode = null;
let isAudioMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setSoundMuted = (muted) => {
  isAudioMuted = muted;
};

export const isSoundMuted = () => isAudioMuted;

// Start continuous pressurized aerosol hiss
export const startSpraySound = (pattern = 'mist') => {
  if (isAudioMuted) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (noiseNode) {
      stopSpraySound();
    }

    // Create 1-second white noise buffer
    const bufferSize = ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // Filter tuned to aerosol mist frequency
    filterNode = ctx.createBiquadFilter();
    
    if (pattern === 'jet') {
      filterNode.type = 'bandpass';
      filterNode.frequency.setValueAtTime(3200, ctx.currentTime);
      filterNode.Q.setValueAtTime(4.0, ctx.currentTime);
    } else if (pattern === 'foam') {
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1400, ctx.currentTime);
      filterNode.Q.setValueAtTime(1.5, ctx.currentTime);
    } else {
      // Mist / Fan
      filterNode.type = 'highpass';
      filterNode.frequency.setValueAtTime(2400, ctx.currentTime);
      filterNode.Q.setValueAtTime(0.8, ctx.currentTime);
    }

    gainNode = ctx.createGain();
    // Fast fade-in envelope
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseNode.start();
  } catch (e) {
    console.warn('Audio synthesis notice:', e);
  }
};

// Stop spray hiss with realistic release puff
export const stopSpraySound = () => {
  if (!gainNode || !audioCtx) return;

  try {
    const ctx = audioCtx;
    // Release envelope
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    setTimeout(() => {
      if (noiseNode) {
        try {
          noiseNode.stop();
          noiseNode.disconnect();
        } catch (err) {}
        noiseNode = null;
      }
    }, 90);
  } catch (e) {
    console.warn(e);
  }
};

// Canister shake rattle sound
export const playCanisterShakeSound = () => {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Metallic click oscillator
    const osc = ctx.createOscillator();
    const clickGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);

    clickGain.gain.setValueAtTime(0.2, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(clickGain);
    clickGain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};
