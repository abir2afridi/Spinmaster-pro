
// Utility to generate synthesized sounds so the app works offline/without external assets

class AudioManager {
  private context: AudioContext | null = null;

  private getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  public playTick(preset: string = 'classic') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (preset) {
        case 'mechanical':
           // Short, sharp click
           const osc1 = ctx.createOscillator();
           const gain1 = ctx.createGain();
           osc1.type = 'square';
           osc1.frequency.setValueAtTime(200, now);
           osc1.frequency.exponentialRampToValueAtTime(50, now + 0.03);
           
           gain1.gain.setValueAtTime(0.1, now);
           gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
           
           osc1.connect(gain1);
           gain1.connect(ctx.destination);
           osc1.start(now);
           osc1.stop(now + 0.03);
           break;

        case 'bubble':
           // Popping sound
           const osc2 = ctx.createOscillator();
           const gain2 = ctx.createGain();
           osc2.type = 'sine';
           osc2.frequency.setValueAtTime(500, now);
           osc2.frequency.linearRampToValueAtTime(800, now + 0.05);
           
           gain2.gain.setValueAtTime(0.1, now);
           gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
           
           osc2.connect(gain2);
           gain2.connect(ctx.destination);
           osc2.start(now);
           osc2.stop(now + 0.05);
           break;

        case 'soft':
           // Gentle tap/click
           const osc3 = ctx.createOscillator();
           const gain3 = ctx.createGain();
           osc3.type = 'sine';
           osc3.frequency.setValueAtTime(800, now);
           osc3.frequency.exponentialRampToValueAtTime(400, now + 0.03);
           
           gain3.gain.setValueAtTime(0.05, now);
           gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
           
           osc3.connect(gain3);
           gain3.connect(ctx.destination);
           osc3.start(now);
           osc3.stop(now + 0.03);
           break;

        case 'classic':
        default:
          // Standard tick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.05);
          break;
      }
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }

  public playWin(preset: string = 'fanfare') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (preset) {
        case 'success':
           // Simple C Major Chord stabs
           [523.25, 659.25, 783.99].forEach((freq) => {
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             osc.type = 'triangle';
             osc.frequency.value = freq;
             gain.gain.setValueAtTime(0.1, now);
             gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
             osc.connect(gain);
             gain.connect(ctx.destination);
             osc.start(now);
             osc.stop(now + 1.0);
           });
           break;

        case 'arcade':
           // 8-bit jump/coin style
           const osc = ctx.createOscillator();
           const gain = ctx.createGain();
           osc.type = 'square';
           osc.frequency.setValueAtTime(440, now);
           osc.frequency.linearRampToValueAtTime(880, now + 0.1);
           osc.frequency.linearRampToValueAtTime(1760, now + 0.2);
           
           gain.gain.setValueAtTime(0.05, now);
           gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
           gain.gain.linearRampToValueAtTime(0, now + 0.3);
           
           osc.connect(gain);
           gain.connect(ctx.destination);
           osc.start(now);
           osc.stop(now + 0.3);
           break;

        case 'soft':
            // Gentle chime
            [392.00, 523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.value = freq;
                
                const start = now + i * 0.1;
                gain1.gain.setValueAtTime(0, start);
                gain1.gain.linearRampToValueAtTime(0.1, start + 0.05);
                gain1.gain.exponentialRampToValueAtTime(0.001, start + 2.0);
                
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(start);
                osc1.stop(start + 2.0);
            });
            break;

        case 'fanfare':
        default:
           // Classic Arpeggio
          [0, 0.2, 0.4, 0.6, 0.8].forEach((offset, i) => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            
            osc2.type = 'sine';
            // Major chord frequencies extended
            const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; 
            osc2.frequency.value = freqs[i] || 523.25;

            gain2.gain.setValueAtTime(0.1, now + offset);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.6);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + offset);
            osc2.stop(now + offset + 0.6);
          });
          break;
      }

    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }
}

export const audioManager = new AudioManager();
