/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Sound played when the user clicks a color to place a bet or start spinning.
 * A neat, upbeat synth chirp.
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.08); // To C6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.warn("Audio Context playback failed or blocked:", error);
  }
}

/**
 * Sound played when the wheel transitions over segment boundary notches.
 * A short, crisp, highly-damped wooden tick sound.
 */
export function playTickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.04);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (error) {
    // Fail silently since ticks are played repeatedly
  }
}

/**
 * Sound played when the user wins.
 * A brilliant, celebratory major arpeggio fanfare in C Major.
 */
export function playWinSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // C5, E5, G5, C6, E6, G6, C7
    scale.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Mix sine and triangle for a warmer retro sound
      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now + index * 0.07);

      gain.gain.setValueAtTime(0.08, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.005, now + index * 0.07 + 0.35);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.35);
    });
  } catch (error) {
    console.warn("Could not play win sound:", error);
  }
}

/**
 * Sound played when the user loses.
 * A gloomy, low-pitch descending tone slide (wah-wah effect).
 */
export function playLossSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sawtooth"; // Richer harmonics for a sad buzzer sound
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.linearRampToValueAtTime(110.00, now + 0.45); // Down to A2

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

    // Apply a lowpass filter to make it sound muffled and sadder
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.45);

    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (error) {
    console.warn("Could not play loss sound:", error);
  }
}
