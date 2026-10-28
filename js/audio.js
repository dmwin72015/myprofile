/**
 * ==============================================================================
 * Minecraft Audio Engine (Web Audio API Synthesizer)
 * 100% 独立离线合成，无需加载任何外部音频文件，零报错零延迟！
 * ==============================================================================
 */

class MinecraftAudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmEnabled = false;
    this.bgmTimer = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    
    // 从 localStorage 读取偏好
    const savedSfx = localStorage.getItem('mc_sfx');
    if (savedSfx !== null) {
      this.sfxEnabled = savedSfx === 'true';
    }
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 1.0 : 0.0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. 经典木质 UI 点击声 (Minecraft Button Click)
  playClick() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // 瞬态方波冲击
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.04);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.045);

    // 辅助白噪音模拟木质按压质感
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(2, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(t);
  }

  // 2. 经验球拾取音效 (XP Orb - 随机音调)
  playOrb() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const pitches = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const freq = pitches[Math.floor(Math.random() * pitches.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 3. 升级音效 (Level Up Arpeggio)
  playLevelUp() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const notes = [
      { f: 440.00, t: 0.00 }, // A4
      { f: 554.37, t: 0.08 }, // C#5
      { f: 659.25, t: 0.16 }, // E5
      { f: 880.00, t: 0.24 }, // A5
      { f: 1108.73, t: 0.32 }, // C#6
      { f: 1318.51, t: 0.40 }  // E6
    ];

    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0, now + note.t);
      gain.gain.linearRampToValueAtTime(0.25, now + note.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + note.t);
      osc.stop(now + note.t + 0.32);
    });
  }

  // 4. 物品拿起/放下轻声 (Pop)
  playPop() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // 5. 成就达成号角 (Achievement Fanfare)
  playAchievement() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    const chords = [
      { f: 523.25, start: 0.0, dur: 0.15 },
      { f: 659.25, start: 0.15, dur: 0.15 },
      { f: 783.99, start: 0.3, dur: 0.15 },
      { f: 1046.50, start: 0.45, dur: 0.55 }
    ];

    chords.forEach(c => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, t + c.start);

      gain.gain.setValueAtTime(0.35, t + c.start);
      gain.gain.exponentialRampToValueAtTime(0.001, t + c.start + c.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + c.start);
      osc.stop(t + c.start + c.dur + 0.05);
    });
  }

  // 6. 受伤 "Oof!" 音效
  playHurt() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // 7. 进食音效 (Eating Crunch)
  playEat() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const offset = i * 0.08;
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 400, t + offset);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(t + offset);
    }
  }

  // 8. 翻书声 (Book Page Turn)
  playPage() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // 9. 箱子开关木轴声
  playChest() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 10. 原版脚步声 (Footstep sound on grass/wood)
  playStep() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450 + Math.random() * 100, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // 11. C418 风格悠扬治愈背景钢琴生成器 (Generative Ambient Piano)
  toggleBgm() {
    this.ensureContext();
    this.bgmEnabled = !this.bgmEnabled;

    if (this.bgmEnabled) {
      this.startAmbientBgm();
    } else {
      this.stopAmbientBgm();
    }
    return this.bgmEnabled;
  }

  startAmbientBgm() {
    if (this.bgmTimer) clearInterval(this.bgmTimer);

    // C418 经典五声音阶与舒缓和弦
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [196.00, 246.94, 293.66, 392.00]  // G6 (G3, B3, D4, G4)
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.bgmEnabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const currentChord = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      // 依次轻柔敲击琴键
      currentChord.forEach((freq, i) => {
        const noteTime = t + i * 0.4 + (Math.random() * 0.1);
        
        // 双振荡器模拟钢琴温润泛音
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, noteTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, noteTime); // 8度泛音

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, noteTime);
        filter.frequency.exponentialRampToValueAtTime(300, noteTime + 2.5);

        noteGain.gain.setValueAtTime(0, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.08, noteTime + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 3.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc1.start(noteTime);
        osc2.start(noteTime);
        osc1.stop(noteTime + 3.8);
        osc2.stop(noteTime + 3.8);
      });
    };

    playChord();
    this.bgmTimer = setInterval(playChord, 5200); // 每 5.2 秒奏响一段梦幻和弦
  }

  stopAmbientBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // 12. 调试小黄鸭嘎嘎叫 (Rubber Duck Quack)
  playQuack() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    for (let i = 0; i < 2; i++) {
      const offset = i * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, t + offset);
      osc.frequency.exponentialRampToValueAtTime(320, t + offset + 0.11);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, t + offset);
      filter.Q.setValueAtTime(4.0, t + offset);

      gain.gain.setValueAtTime(0.35, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.13);
    }
  }

  // 13. 庭院单车清脆车铃 (Bicycle Bell Ding-Ding)
  playBell() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    const notes = [
      { f: 2093, dt: 0.00 }, // C7
      { f: 2637, dt: 0.09 }  // E7
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, t + n.dt);

      gain.gain.setValueAtTime(0, t + n.dt);
      gain.gain.linearRampToValueAtTime(0.4, t + n.dt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.dt + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + n.dt);
      osc.stop(t + n.dt + 0.46);
    });
  }

  // 14. 冰箱冰饮畅饮音效 (Cold Drink Glug)
  playDrink() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const dt = i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + i * 40, t + dt);
      osc.frequency.exponentialRampToValueAtTime(160, t + dt + 0.09);

      gain.gain.setValueAtTime(0.4, t + dt);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dt + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + dt);
      osc.stop(t + dt + 0.1);
    }
  }

  // 15. 安睡入眠与醒来摇篮曲音效 (Sleep & Wake Lullaby)
  playSleep() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    const chords = [
      { f: 440.0, dt: 0.0 }, // A4
      { f: 554.3, dt: 0.2 }, // C#5
      { f: 659.2, dt: 0.4 }, // E5
      { f: 880.0, dt: 0.6 }  // A5
    ];

    chords.forEach(c => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, t + c.dt);

      gain.gain.setValueAtTime(0.25, t + c.dt);
      gain.gain.exponentialRampToValueAtTime(0.001, t + c.dt + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + c.dt);
      osc.stop(t + c.dt + 0.85);
    });
  }

  // 16. 庭院秋千悠扬轻风音效 (Yard Swing)
  playSwing() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(420, t + 0.25);
    osc.frequency.linearRampToValueAtTime(260, t + 0.5);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.56);
  }

  // 17. 温暖爱心互动音效 (Heart Hug / Love)
  playHeart() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    const tones = [523.25, 659.25, 783.99, 1046.50];
    tones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.38);
    });
  }

  // 扑通入水声 (Minecraft Water Splash)
  playSplash() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // 低频入水冲击波
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);
    oscGain.gain.setValueAtTime(0.65, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);

    // 水花飞溅滤波噪波
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.35);
    filter.Q.setValueAtTime(4.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(t);
  }

  // 狗吠声 (Minecraft Dog Bark) - 欢快生动的两声短吠
  playBark(pitch = 1.0) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t0 = this.ctx.currentTime;
    const barks = [0, 0.11]; // 汪！汪！
    barks.forEach((offset, idx) => {
      const t = t0 + offset;
      const baseFreq = (idx === 0 ? 360 : 410) * pitch;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * 0.85, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, t + 0.025);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.085);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2.1, t);
      filter.Q.setValueAtTime(3.2, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.095);
    });
  }

  // 猫咪轻柔喵叫声 (Minecraft Cat Meow)
  playMeow() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(480, t);
    osc.frequency.linearRampToValueAtTime(740, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.35);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(7, t);
    lfoGain.gain.setValueAtTime(12, t);
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.36);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.035);
    gain.gain.setValueAtTime(0.35, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // 萌宠召唤口哨声 (Pet Whistle Call) - 清脆欢快双音口哨 啾啾~
  playWhistle() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t0 = this.ctx.currentTime;
    const notes = [
      { f1: 1760, f2: 2420, start: 0, dur: 0.12 },
      { f1: 2150, f2: 2880, start: 0.13, dur: 0.20 }
    ];

    notes.forEach(n => {
      const t = t0 + n.start;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f1, t);
      osc.frequency.exponentialRampToValueAtTime(n.f2, t + n.dur * 0.7);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.dur + 0.01);
    });
  }

  // 猫咪满足呼噜声 (Cat Purr) - 喉音连续舒适共鸣
  playPurr() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, t);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(26, t);
    lfoGain.gain.setValueAtTime(0.22, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);

    lfo.connect(gain.gain);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.95);
    lfo.stop(t + 0.95);
  }

  // 单车清脆车铃声 (Bicycle Bell Ding-Ding) - 清脆明亮的两声连续车铃
  playBikeBell() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    const t0 = this.ctx.currentTime;
    [0, 0.13].forEach((offset, idx) => {
      const t = t0 + offset;
      const baseFreq = idx === 0 ? 2093 : 2637; // C7 -> E7

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  // 切换音效开关
  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    localStorage.setItem('mc_sfx', this.sfxEnabled);
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 1.0 : 0.0, this.ctx.currentTime);
    }
    if (this.sfxEnabled) {
      this.playClick();
    }
    return this.sfxEnabled;
  }
}

// 挂载全局音频单例
window.MCAudio = new MinecraftAudioEngine();
