/**
 * Web Audio API 기반 사운드 시스템
 * 외부 파일 없이 프로시저럴 사운드 생성
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;

/** 오디오 컨텍스트 초기화 (유저 인터랙션 후 호출) */
const ensureAudioCtx = (): AudioContext | null => {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.3;
      masterGain.connect(audioCtx.destination);
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

/** 음소거 토글 */
export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  if (masterGain) {
    masterGain.gain.value = isMuted ? 0 : 0.3;
  }
  return isMuted;
};

export const getMuted = (): boolean => isMuted;

/** 기본 비프음 생성 */
const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
): void => {
  const ctx = ensureAudioCtx();
  if (!ctx || !masterGain || isMuted) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

/** 노이즈 생성 (타격음용) */
const playNoise = (duration: number, volume: number = 0.2): void => {
  const ctx = ensureAudioCtx();
  if (!ctx || !masterGain || isMuted) return;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  source.start();
};

// ===== 게임 사운드 =====

/** 버튼 클릭 */
export const playClick = (): void => {
  playTone(800, 0.08, 'sine', 0.15);
};

/** 소환 사운드 */
export const playSummon = (): void => {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  // 상승 음
  playTone(300, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(500, 0.15, 'sine', 0.2), 60);
  setTimeout(() => playTone(700, 0.2, 'sine', 0.15), 120);
};

/** 공격 사운드 */
export const playAttack = (): void => {
  playNoise(0.08, 0.15);
  playTone(200, 0.05, 'square', 0.08);
};

/** 스킬 사운드 */
export const playSkill = (): void => {
  playTone(600, 0.2, 'sawtooth', 0.1);
  setTimeout(() => playTone(900, 0.15, 'sine', 0.12), 50);
};

/** 힐 사운드 */
export const playHeal = (): void => {
  playTone(523, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 80);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.1), 160);
};

/** 승리 사운드 */
export const playVictory = (): void => {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.15), i * 120);
  });
};

/** 패배 사운드 */
export const playDefeat = (): void => {
  playTone(300, 0.4, 'sine', 0.15);
  setTimeout(() => playTone(250, 0.4, 'sine', 0.12), 200);
  setTimeout(() => playTone(200, 0.6, 'sine', 0.1), 400);
};

/** 가챠 뽑기 사운드 */
export const playGachaPull = (): void => {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => playTone(400 + i * 100, 0.1, 'sine', 0.1), i * 80);
  }
};

/** 가챠 결과 - 높은 등급 */
export const playGachaHighGrade = (): void => {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'sine', 0.12), i * 80);
  });
};

/** 가챠 결과 - 일반 */
export const playGachaNormalGrade = (): void => {
  playTone(500, 0.15, 'sine', 0.1);
  setTimeout(() => playTone(600, 0.2, 'sine', 0.08), 80);
};

/** 강화 성공 */
export const playEnhanceSuccess = (): void => {
  playTone(440, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(554, 0.1, 'sine', 0.15), 80);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.15), 160);
  setTimeout(() => playTone(880, 0.3, 'sine', 0.12), 240);
};

/** 강화 실패 */
export const playEnhanceFail = (): void => {
  playTone(300, 0.15, 'square', 0.08);
  setTimeout(() => playTone(250, 0.2, 'square', 0.06), 100);
};

/** 웨이브 시작 */
export const playWaveStart = (): void => {
  playNoise(0.1, 0.1);
  playTone(400, 0.15, 'sawtooth', 0.08);
  setTimeout(() => playTone(500, 0.2, 'sawtooth', 0.08), 100);
};

/** 코인 획득 */
export const playCoin = (): void => {
  playTone(1200, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(1600, 0.08, 'sine', 0.08), 40);
};
