import type { AnimationState, UnitAnimationState, SpriteSheetConfig } from '../types';
import { getImage } from './SpriteLoader';

// ===== 상수 =====

const ANIMATION_FPS = 8;
const FRAME_DURATION = 1 / ANIMATION_FPS;

/** 캔버스에 그릴 스프라이트 크기 (32px 원본 → 48px 표시) */
export const SPRITE_DRAW_SIZE = 48;

// ===== 유닛별 애니메이션 상태 =====

const animationStates: Map<string, UnitAnimationState> = new Map();

/** 초기 애니메이션 상태 생성 */
const createAnimState = (initial: AnimationState = 'idle'): UnitAnimationState => ({
  current: initial,
  frameIndex: 0,
  frameTimer: 0,
  oneShot: false,
  finished: false,
});

// ===== 공개 API =====

/** 유닛의 애니메이션 상태 가져오기 (없으면 자동 생성) */
export const getAnimState = (unitId: string): UnitAnimationState => {
  let state = animationStates.get(unitId);
  if (!state) {
    state = createAnimState('idle');
    animationStates.set(unitId, state);
  }
  return state;
};

/** 유닛의 애니메이션 전환 */
export const setAnimation = (unitId: string, anim: AnimationState): void => {
  const state = getAnimState(unitId);

  // death는 절대 중단 안 됨
  if (state.current === 'death') return;

  // oneShot 재생 중에는 death/hit만 인터럽트 가능
  if (state.oneShot && !state.finished && anim !== 'death' && anim !== 'hit') return;

  // 같은 애니메이션 반복 방지 (루프 애니메이션만)
  if (!state.oneShot && state.current === anim) return;

  const isOneShot = anim === 'attack' || anim === 'hit' || anim === 'death';

  animationStates.set(unitId, {
    current: anim,
    frameIndex: 0,
    frameTimer: 0,
    oneShot: isOneShot,
    finished: false,
  });
};

/** 모든 유닛의 애니메이션 프레임 업데이트 (매 렌더 프레임 호출) */
export const updateAnimations = (dt: number, spriteConfigs: Map<string, SpriteSheetConfig>): void => {
  for (const [unitId, state] of animationStates) {
    if (state.finished) continue;

    state.frameTimer += dt;

    if (state.frameTimer >= FRAME_DURATION) {
      state.frameTimer -= FRAME_DURATION;

      const config = spriteConfigs.get(unitId);
      if (!config) continue;

      const animConfig = config.animations[state.current];
      if (!animConfig) continue;

      const nextFrame = state.frameIndex + 1;

      if (nextFrame >= animConfig.frameCount) {
        if (state.oneShot) {
          if (state.current === 'death') {
            // death는 마지막 프레임에서 정지
            state.frameIndex = animConfig.frameCount - 1;
            state.finished = true;
          } else {
            // attack/hit → idle로 복귀
            animationStates.set(unitId, createAnimState('idle'));
          }
        } else {
          // 루프
          state.frameIndex = 0;
        }
      } else {
        state.frameIndex = nextFrame;
      }
    }
  }
};

/** 스프라이트 프레임을 캔버스에 그리기 */
export const drawSprite = (
  ctx: CanvasRenderingContext2D,
  spriteConfig: SpriteSheetConfig,
  animState: UnitAnimationState,
  x: number,
  y: number,
  flipH: boolean,
  scale: number = SPRITE_DRAW_SIZE,
  isBoss: boolean = false,
): void => {
  const img = getImage(spriteConfig.src);
  if (!img) return;

  const animConfig = spriteConfig.animations[animState.current];
  if (!animConfig) return;

  const fw = spriteConfig.frameWidth;
  const fh = spriteConfig.frameHeight;
  const srcX = animState.frameIndex * fw;
  const srcY = animConfig.row * fh;

  const drawSize = isBoss ? scale * 1.3 : scale;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (flipH) {
    ctx.translate(x, y - drawSize);
    ctx.scale(-1, 1);
    ctx.drawImage(img, srcX, srcY, fw, fh, -drawSize / 2, 0, drawSize, drawSize);
  } else {
    ctx.drawImage(img, srcX, srcY, fw, fh, x - drawSize / 2, y - drawSize, drawSize, drawSize);
  }

  ctx.restore();
};

/** 유닛 애니메이션 상태 제거 */
export const removeAnimState = (unitId: string): void => {
  animationStates.delete(unitId);
};

/** 전체 애니메이션 상태 리셋 */
export const resetAllAnimations = (): void => {
  animationStates.clear();
};
