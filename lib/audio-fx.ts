let audioContext: AudioContext | null = null;

export function playHexHoverBeep() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;

  audioContext ??= new AudioContextClass();
  const context = audioContext;
  void context.resume().then(() => {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.018, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.032);
  }).catch(() => {
    // Browsers may reject hover audio until a user gesture; the next hover retries.
  });
}
