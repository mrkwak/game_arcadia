import type { BattleState, BattleUnit, SpriteSheetConfig } from '../types';
import { FIELD_WIDTH, ALLY_BASE_X, ENEMY_BASE_X } from '../systems/battleEngine';
import { SPRITE_SHEETS, CARD_SPRITE_MAP, BACKGROUND_LAYERS, GROUND_TILESET, BASE_BUILDING, DECORATIONS } from './spriteConfig';
import { getImage } from './SpriteLoader';
import { getAnimState, setAnimation, updateAnimations, drawSprite, resetAllAnimations, SPRITE_DRAW_SIZE } from './SpriteAnimator';

// ===== 상수 =====

export const CANVAS_HEIGHT = 300;
const GROUND_Y = 220;
const UNIT_SIZE = 28;
const HP_BAR_WIDTH = 30;
const HP_BAR_HEIGHT = 4;
const HP_BAR_OFFSET = 8;
const BASE_WIDTH = 30;
const BASE_HEIGHT = 60;

// ===== 파티클 시스템 =====

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'damage' | 'heal' | 'spark' | 'star';
  text?: string;
}

let particles: Particle[] = [];

const addDamageText = (x: number, damage: number, isHeal: boolean = false): void => {
  particles.push({
    x,
    y: GROUND_Y - SPRITE_DRAW_SIZE - 10,
    vx: (Math.random() - 0.5) * 20,
    vy: -40 - Math.random() * 20,
    life: 1.0,
    maxLife: 1.0,
    color: isHeal ? '#4caf50' : '#ff5252',
    size: damage > 50 ? 14 : damage > 20 ? 12 : 10,
    type: isHeal ? 'heal' : 'damage',
    text: isHeal ? `+${damage}` : `-${damage}`,
  });
};

const addSparkEffect = (x: number, color: string = '#ffeb3b'): void => {
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI * 2 / 4) * i + Math.random() * 0.5;
    particles.push({
      x,
      y: GROUND_Y - SPRITE_DRAW_SIZE / 2,
      vx: Math.cos(angle) * (30 + Math.random() * 20),
      vy: Math.sin(angle) * (30 + Math.random() * 20),
      life: 0.4,
      maxLife: 0.4,
      color,
      size: 3 + Math.random() * 2,
      type: 'spark',
    });
  }
};

const updateParticles = (dt: number): void => {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.type === 'damage' || p.type === 'heal') {
      p.vy -= 30 * dt;
    }
    if (p.type === 'spark' || p.type === 'star') {
      p.vy += 80 * dt;
      p.size *= 0.97;
    }
  });
};

const drawParticles = (ctx: CanvasRenderingContext2D, scaleX: number): void => {
  particles.forEach(p => {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;

    if (p.type === 'damage' || p.type === 'heal') {
      ctx.fillStyle = p.color;
      ctx.font = `bold ${p.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeText(p.text!, p.x * scaleX, p.y);
      ctx.fillText(p.text!, p.x * scaleX, p.y);
    } else if (p.type === 'spark') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * scaleX, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'star') {
      ctx.fillStyle = p.color;
      drawStarShape(ctx, p.x * scaleX, p.y, p.size, p.size / 2, 5);
    }
  });

  ctx.globalAlpha = 1;
};

const drawStarShape = (
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  outerR: number, innerR: number, points: number,
): void => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
};

// ===== 배경 (챕터별 폴백) =====

const CHAPTER_BACKGROUNDS: Record<number, { sky: string; ground: string; groundDark: string }> = {
  1: { sky: '#1a3a2a', ground: '#2d5a1e', groundDark: '#1e4012' },
  2: { sky: '#1a1a2e', ground: '#2a1a3a', groundDark: '#1e0e2e' },
  3: { sky: '#2e1a1a', ground: '#3a1a1a', groundDark: '#2e0e0e' },
};

// ===== 유틸 =====

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void => {
  if (w < 0) return;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const shadeColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

// ===== 렌더링 함수 =====

/** 배경 그리기 — Oak Woods 패럴렉스 + 폴백 */
const drawBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  chapter: number,
  timer: number,
): void => {
  const layer1 = getImage(BACKGROUND_LAYERS[0]);
  const layer2 = getImage(BACKGROUND_LAYERS[1]);
  const layer3 = getImage(BACKGROUND_LAYERS[2]);

  if (layer1 && layer2 && layer3) {
    // === Oak Woods 패럴렉스 배경 ===
    ctx.imageSmoothingEnabled = false;

    // Layer 1: 하늘 (정적)
    const bgScale = GROUND_Y / layer1.height;
    const scaledW = layer1.width * bgScale;
    for (let x = 0; x < width; x += scaledW) {
      ctx.drawImage(layer1, x, 0, scaledW, GROUND_Y);
    }

    // Layer 2: 먼 나무 (느린 스크롤)
    const offset2 = (timer * 3) % scaledW;
    for (let x = -offset2; x < width + scaledW; x += scaledW) {
      ctx.drawImage(layer2, x, 0, scaledW, GROUND_Y);
    }

    // Layer 3: 가까운 나무 (빠른 스크롤)
    const offset3 = (timer * 8) % scaledW;
    for (let x = -offset3; x < width + scaledW; x += scaledW) {
      ctx.drawImage(layer3, x, 0, scaledW, GROUND_Y);
    }

    // 챕터별 색상 틴트
    const tints: Record<number, string> = {
      1: 'rgba(0, 50, 0, 0.08)',
      2: 'rgba(30, 0, 50, 0.2)',
      3: 'rgba(50, 0, 0, 0.2)',
    };
    ctx.fillStyle = tints[chapter] ?? tints[1];
    ctx.fillRect(0, 0, width, GROUND_Y);

    ctx.imageSmoothingEnabled = true;
  } else {
    // === 폴백: 기존 그라디언트 배경 ===
    const colors = CHAPTER_BACKGROUNDS[chapter] ?? CHAPTER_BACKGROUNDS[1];
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, colors.sky);
    skyGrad.addColorStop(1, colors.groundDark);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, GROUND_Y);

    // 배경 별
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 12; i++) {
      const starX = (i * 71 + 13) % width;
      const starY = (i * 37 + 7) % (GROUND_Y - 30);
      const twinkle = Math.sin(timer * 2 + i * 1.5) * 0.5 + 0.5;
      ctx.globalAlpha = twinkle * 0.4 + 0.1;
      ctx.fillRect(starX, starY, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  }

  // === 바닥 ===
  const tileset = getImage(GROUND_TILESET);
  if (tileset) {
    ctx.imageSmoothingEnabled = false;
    const tileSize = 24;
    const groundScale = 2;
    const scaledTile = tileSize * groundScale;

    // 타일 반복으로 바닥 채우기
    for (let x = 0; x < width; x += scaledTile) {
      // 상단 표면 (타일셋 첫 번째 타일)
      ctx.drawImage(tileset, 0, 0, tileSize, tileSize, x, GROUND_Y, scaledTile, scaledTile);
      // 아래 흙 채우기
      for (let y = GROUND_Y + scaledTile; y < CANVAS_HEIGHT; y += scaledTile) {
        ctx.drawImage(tileset, tileSize, tileSize, tileSize, tileSize, x, y, scaledTile, scaledTile);
      }
    }
    ctx.imageSmoothingEnabled = true;
  } else {
    // 폴백 바닥
    const colors = CHAPTER_BACKGROUNDS[chapter] ?? CHAPTER_BACKGROUNDS[1];
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, colors.ground);
    groundGrad.addColorStop(1, colors.groundDark);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, width, CANVAS_HEIGHT - GROUND_Y);
  }

  // 지면 라인
  const lineGrad = ctx.createLinearGradient(0, GROUND_Y, width, GROUND_Y);
  lineGrad.addColorStop(0, 'rgba(255,255,255,0.1)');
  lineGrad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  lineGrad.addColorStop(1, 'rgba(255,255,255,0.1)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(width, GROUND_Y);
  ctx.stroke();

  // 풀 장식
  const grass1 = getImage(DECORATIONS.grass1);
  const grass2 = getImage(DECORATIONS.grass2);
  if (grass1 && grass2) {
    ctx.imageSmoothingEnabled = false;
    const grasses = [grass1, grass2];
    for (let i = 0; i < 15; i++) {
      const gx = (i * 47 + 20) % width;
      const grassImg = grasses[i % 2];
      ctx.drawImage(grassImg, gx, GROUND_Y - 10, 20, 16);
    }
    ctx.imageSmoothingEnabled = true;
  }
};

/** 기지 그리기 — Oak Woods Shop + 폴백 */
const drawBase = (
  ctx: CanvasRenderingContext2D,
  x: number, hp: number, maxHP: number,
  isAlly: boolean, scaleX: number, timer: number,
): void => {
  const drawX = x * scaleX;
  const hpPercent = hp / maxHP;

  const shopImg = getImage(BASE_BUILDING);

  if (shopImg) {
    // === Oak Woods 건물 기지 ===
    ctx.imageSmoothingEnabled = false;

    const shopW = 70;
    const shopH = 56;
    const shopX = drawX - shopW / 2;
    const shopY = GROUND_Y - shopH;

    // 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(drawX, GROUND_Y + 2, shopW / 2 + 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 건물 그리기
    ctx.drawImage(shopImg, shopX, shopY, shopW, shopH);

    // 아군/적 색상 틴트
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = isAlly ? '#4caf50' : '#f44336';
    ctx.fillRect(shopX, shopY, shopW, shopH);
    ctx.globalAlpha = 1;

    ctx.imageSmoothingEnabled = true;

    // HP 바
    const barWidth = 54;
    const barX = drawX - barWidth / 2;
    const barY = shopY - 14;

    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    roundRect(ctx, barX, barY, barWidth, 8, 3);
    ctx.fill();
    ctx.stroke();

    const hpColor = hpPercent > 0.5 ? '#4caf50' : hpPercent > 0.2 ? '#ff9800' : '#f44336';
    const hpGrad = ctx.createLinearGradient(barX, barY, barX, barY + 8);
    hpGrad.addColorStop(0, hpColor);
    hpGrad.addColorStop(1, shadeColor(hpColor, -30));
    ctx.fillStyle = hpGrad;
    if ((barWidth - 2) * hpPercent > 0) {
      roundRect(ctx, barX + 1, barY + 1, (barWidth - 2) * hpPercent, 6, 2);
      ctx.fill();
    }

    ctx.fillStyle = 'white';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.ceil(hp)}`, drawX, barY + 4);

    // 위험 깜빡임
    if (hpPercent < 0.3 && isAlly) {
      const blink = Math.sin(timer * 8) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(244, 67, 54, ${blink * 0.15})`;
      ctx.fillRect(shopX - 2, shopY - 2, shopW + 4, shopH + 4);
    }
  } else {
    // === 폴백: 기존 사각형+이모지 기지 ===
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(drawX, GROUND_Y + 3, BASE_WIDTH / 2 + 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const baseGrad = ctx.createLinearGradient(
      drawX - BASE_WIDTH / 2, GROUND_Y - BASE_HEIGHT,
      drawX + BASE_WIDTH / 2, GROUND_Y,
    );
    if (isAlly) {
      baseGrad.addColorStop(0, '#66bb6a');
      baseGrad.addColorStop(1, '#2e7d32');
    } else {
      baseGrad.addColorStop(0, '#ef5350');
      baseGrad.addColorStop(1, '#b71c1c');
    }
    ctx.fillStyle = baseGrad;
    ctx.fillRect(drawX - BASE_WIDTH / 2, GROUND_Y - BASE_HEIGHT, BASE_WIDTH, BASE_HEIGHT);

    ctx.strokeStyle = isAlly ? '#a5d6a7' : '#ef9a9a';
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX - BASE_WIDTH / 2, GROUND_Y - BASE_HEIGHT, BASE_WIDTH, BASE_HEIGHT);

    ctx.beginPath();
    ctx.moveTo(drawX - BASE_WIDTH / 2 - 5, GROUND_Y - BASE_HEIGHT);
    ctx.lineTo(drawX, GROUND_Y - BASE_HEIGHT - 20);
    ctx.lineTo(drawX + BASE_WIDTH / 2 + 5, GROUND_Y - BASE_HEIGHT);
    ctx.closePath();
    const roofGrad = ctx.createLinearGradient(drawX, GROUND_Y - BASE_HEIGHT - 20, drawX, GROUND_Y - BASE_HEIGHT);
    if (isAlly) {
      roofGrad.addColorStop(0, '#81c784');
      roofGrad.addColorStop(1, '#4caf50');
    } else {
      roofGrad.addColorStop(0, '#e57373');
      roofGrad.addColorStop(1, '#d32f2f');
    }
    ctx.fillStyle = roofGrad;
    ctx.fill();

    const barWidth = 54;
    const barX = drawX - barWidth / 2;
    const barY = GROUND_Y - BASE_HEIGHT - 32;

    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    roundRect(ctx, barX, barY, barWidth, 8, 3);
    ctx.fill();
    ctx.stroke();

    const hpColor = hpPercent > 0.5 ? '#4caf50' : hpPercent > 0.2 ? '#ff9800' : '#f44336';
    const hpGrad = ctx.createLinearGradient(barX, barY, barX, barY + 8);
    hpGrad.addColorStop(0, hpColor);
    hpGrad.addColorStop(1, shadeColor(hpColor, -30));
    ctx.fillStyle = hpGrad;
    if ((barWidth - 2) * hpPercent > 0) {
      roundRect(ctx, barX + 1, barY + 1, (barWidth - 2) * hpPercent, 6, 2);
      ctx.fill();
    }

    ctx.fillStyle = 'white';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.ceil(hp)}`, drawX, barY + 4);

    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isAlly ? '🏰' : '🏴', drawX, GROUND_Y - BASE_HEIGHT + 30);

    if (hpPercent < 0.3 && isAlly) {
      const blink = Math.sin(timer * 8) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(244, 67, 54, ${blink * 0.15})`;
      ctx.fillRect(drawX - BASE_WIDTH / 2 - 2, GROUND_Y - BASE_HEIGHT - 2, BASE_WIDTH + 4, BASE_HEIGHT + 4);
    }
  }
};

// ===== 공격 감지 (atkTimer 추적) =====

let prevAtkTimers: Map<string, number> = new Map();

/** 유닛 그리기 — 스프라이트 + 폴백 이모지 */
const drawUnit = (
  ctx: CanvasRenderingContext2D,
  unit: BattleUnit,
  scaleX: number,
  timer: number,
): void => {
  if (unit.hp <= 0) return;

  const x = unit.pos * scaleX;

  // 스프라이트 설정 조회
  const spriteKey = CARD_SPRITE_MAP[unit.cardId];
  const spriteConfig = spriteKey ? SPRITE_SHEETS[spriteKey] : undefined;
  const hasSprite = spriteConfig && getImage(spriteConfig.src);

  if (hasSprite && spriteConfig) {
    // === 스프라이트 렌더링 ===

    // 애니메이션 상태 판별
    const animState = getAnimState(unit.id);
    const prevAtkTimer = prevAtkTimers.get(unit.id);

    // attack 감지: atkTimer가 >0 → 0으로 리셋
    if (prevAtkTimer !== undefined && prevAtkTimer > 0 && unit.atkTimer === 0) {
      setAnimation(unit.id, 'attack');
    }
    // walk vs idle (oneShot이 아닐 때만)
    else if (!animState.oneShot || animState.finished) {
      if (unit.atkTimer === 0) {
        setAnimation(unit.id, 'walk');
      } else {
        setAnimation(unit.id, 'idle');
      }
    }

    prevAtkTimers.set(unit.id, unit.atkTimer);

    // 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    const shadowSize = unit.isBoss ? SPRITE_DRAW_SIZE * 0.45 : SPRITE_DRAW_SIZE * 0.3;
    ctx.ellipse(x, GROUND_Y + 2, shadowSize, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 보스 글로우
    if (unit.isBoss) {
      const glow = Math.sin(timer * 3) * 0.3 + 0.7;
      const drawSize = SPRITE_DRAW_SIZE * 1.3;
      ctx.strokeStyle = `rgba(255, 152, 0, ${glow * 0.6})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - drawSize / 2 - 2, GROUND_Y - drawSize - 2, drawSize + 4, drawSize + 4);
    }

    // 바운스 (이동 중)
    const isMoving = animState.current === 'walk';
    const bounce = isMoving ? Math.sin(timer * 8 + unit.pos * 0.1) * 2 : 0;

    // 스프라이트 그리기 (적 = 좌우 반전)
    const flipH = !unit.isAlly;
    drawSprite(ctx, spriteConfig, animState, x, GROUND_Y + bounce, flipH, SPRITE_DRAW_SIZE, unit.isBoss);

    // HP바
    const drawSize = unit.isBoss ? SPRITE_DRAW_SIZE * 1.3 : SPRITE_DRAW_SIZE;
    const hpPercent = unit.hp / unit.maxHP;
    const barW = unit.isBoss ? HP_BAR_WIDTH + 10 : HP_BAR_WIDTH;
    const barX = x - barW / 2;
    const barY = GROUND_Y - drawSize - HP_BAR_OFFSET + bounce;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, HP_BAR_HEIGHT + 2);

    const hpColor = unit.isAlly
      ? (hpPercent > 0.5 ? '#4caf50' : hpPercent > 0.2 ? '#ff9800' : '#f44336')
      : '#f44336';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barW * hpPercent, HP_BAR_HEIGHT);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(barX, barY, barW * hpPercent, HP_BAR_HEIGHT / 2);

    // 보스 이름
    if (unit.isBoss) {
      ctx.fillStyle = '#ff9800';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(unit.name, x, GROUND_Y + 3);
    }
  } else {
    // === 폴백: 이모지 렌더링 ===
    const y = GROUND_Y - UNIT_SIZE / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y + 2, UNIT_SIZE / 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (unit.isBoss) {
      const glow = Math.sin(timer * 3) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(255, 152, 0, ${glow * 0.6})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - UNIT_SIZE / 2 - 4, y - UNIT_SIZE / 2 - 4, UNIT_SIZE + 8, UNIT_SIZE + 8);
    }

    const isMoving = unit.atkTimer === 0;
    const bounce = isMoving ? Math.sin(timer * 8 + unit.pos * 0.1) * 2 : 0;
    ctx.font = `${unit.isBoss ? UNIT_SIZE + 8 : UNIT_SIZE}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.emoji, x, y + bounce);

    const hpPercent = unit.hp / unit.maxHP;
    const barW = unit.isBoss ? HP_BAR_WIDTH + 10 : HP_BAR_WIDTH;
    const barX = x - barW / 2;
    const barY = y - UNIT_SIZE / 2 - HP_BAR_OFFSET + bounce;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, HP_BAR_HEIGHT + 2);

    const hpColor = unit.isAlly
      ? (hpPercent > 0.5 ? '#4caf50' : hpPercent > 0.2 ? '#ff9800' : '#f44336')
      : '#f44336';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barW * hpPercent, HP_BAR_HEIGHT);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(barX, barY, barW * hpPercent, HP_BAR_HEIGHT / 2);

    if (unit.isBoss) {
      ctx.fillStyle = '#ff9800';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(unit.name, x, y + UNIT_SIZE / 2 + 3);
    }
  }
};

/** 마나 바 그리기 */
const drawManaBar = (
  ctx: CanvasRenderingContext2D,
  mana: number, maxMana: number,
  width: number, timer: number,
): void => {
  const barY = CANVAS_HEIGHT - 22;
  const barHeight = 14;
  const padding = 10;
  const barWidth = width - padding * 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, padding - 1, barY - 1, barWidth + 2, barHeight + 2, 4);
  ctx.fill();

  const manaPercent = mana / maxMana;
  const gradient = ctx.createLinearGradient(padding, barY, padding + barWidth * manaPercent, barY);
  gradient.addColorStop(0, '#1565c0');
  gradient.addColorStop(0.5, '#2196f3');
  gradient.addColorStop(1, '#42a5f5');
  ctx.fillStyle = gradient;
  if (barWidth * manaPercent > 0) {
    roundRect(ctx, padding, barY, barWidth * manaPercent, barHeight, 3);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  if (barWidth * manaPercent > 0) {
    roundRect(ctx, padding, barY, barWidth * manaPercent, barHeight / 2, 3);
    ctx.fill();
  }

  if (manaPercent > 0.5) {
    const shimmerX = ((timer * 60) % (barWidth * manaPercent));
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(padding + shimmerX, barY + 1, 8, barHeight - 2);
  }

  ctx.strokeStyle = '#0d47a1';
  ctx.lineWidth = 1;
  roundRect(ctx, padding, barY, barWidth, barHeight, 3);
  ctx.stroke();

  ctx.fillStyle = 'white';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`💧 ${Math.floor(mana)}/${maxMana}`, width / 2, barY + barHeight / 2);
};

/** 웨이브 정보 그리기 */
const drawWaveInfo = (
  ctx: CanvasRenderingContext2D,
  currentWave: number, totalWaves: number,
  timer: number, width: number,
): void => {
  const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
  headerGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  headerGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
  headerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, width, 26);

  ctx.strokeStyle = 'rgba(255, 152, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.lineTo(width, 26);
  ctx.stroke();

  ctx.fillStyle = '#ff9800';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⚔ WAVE ${currentWave + 1}/${totalWaves}`, 10, 13);

  ctx.fillStyle = '#e0e0e0';
  ctx.textAlign = 'right';
  const minutes = Math.floor(timer / 60);
  const seconds = Math.floor(timer % 60);
  ctx.fillText(`⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`, width - 10, 13);
};

/** 결과 오버레이 그리기 */
const drawResult = (
  ctx: CanvasRenderingContext2D,
  victory: boolean, stars: number,
  width: number, _timer: number,
): void => {
  const overlayGrad = ctx.createRadialGradient(
    width / 2, CANVAS_HEIGHT / 2, 0,
    width / 2, CANVAS_HEIGHT / 2, width / 2,
  );
  if (victory) {
    overlayGrad.addColorStop(0, 'rgba(76, 175, 80, 0.3)');
    overlayGrad.addColorStop(1, 'rgba(76, 175, 80, 0.6)');
  } else {
    overlayGrad.addColorStop(0, 'rgba(244, 67, 54, 0.3)');
    overlayGrad.addColorStop(1, 'rgba(244, 67, 54, 0.6)');
  }
  ctx.fillStyle = overlayGrad;
  ctx.fillRect(0, 0, width, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, width / 2 - 100, CANVAS_HEIGHT / 2 - 40, 200, 80, 12);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(victory ? '🎉 승리!' : '💀 패배...', width / 2, CANVAS_HEIGHT / 2 - 15);

  if (victory) {
    ctx.font = '24px serif';
    ctx.fillStyle = '#ff9800';
    ctx.fillText(
      '★'.repeat(stars) + '☆'.repeat(3 - stars),
      width / 2, CANVAS_HEIGHT / 2 + 20,
    );
  }
};

// ===== HP 변화 추적 =====

let prevAllies: Map<string, number> = new Map();
let prevEnemies: Map<string, number> = new Map();

/** HP 변화 감지 → 파티클 + 히트 애니메이션 */
const detectHPChanges = (state: BattleState): void => {
  state.allies.forEach(unit => {
    const prevHP = prevAllies.get(unit.id);
    if (prevHP !== undefined) {
      const diff = prevHP - unit.hp;
      if (diff > 0.5) {
        addDamageText(unit.pos, Math.round(diff));
        addSparkEffect(unit.pos, '#ff5252');
        // hit 애니메이션 트리거
        if (unit.hp > 0) setAnimation(unit.id, 'hit');
      } else if (diff < -0.5) {
        addDamageText(unit.pos, Math.round(-diff), true);
      }
    }
    prevAllies.set(unit.id, unit.hp);
  });

  state.enemies.forEach(unit => {
    const prevHP = prevEnemies.get(unit.id);
    if (prevHP !== undefined) {
      const diff = prevHP - unit.hp;
      if (diff > 0.5) {
        addDamageText(unit.pos, Math.round(diff));
        addSparkEffect(unit.pos, '#ffeb3b');
        // hit 애니메이션 트리거
        if (unit.hp > 0) setAnimation(unit.id, 'hit');
      }
    }
    prevEnemies.set(unit.id, unit.hp);
  });

  // 죽은 유닛 정리
  const aliveAllyIds = new Set(state.allies.filter(u => u.hp > 0).map(u => u.id));
  const aliveEnemyIds = new Set(state.enemies.filter(u => u.hp > 0).map(u => u.id));
  for (const id of prevAllies.keys()) { if (!aliveAllyIds.has(id)) prevAllies.delete(id); }
  for (const id of prevEnemies.keys()) { if (!aliveEnemyIds.has(id)) prevEnemies.delete(id); }
};

/** 파티클 + 애니메이션 리셋 */
export const resetParticles = (): void => {
  particles = [];
  prevAllies.clear();
  prevEnemies.clear();
  prevAtkTimers.clear();
  resetAllAnimations();
};

// ===== 메인 렌더 함수 =====

export const renderBattle = (
  ctx: CanvasRenderingContext2D,
  state: BattleState,
  canvasWidth: number,
): void => {
  const scaleX = canvasWidth / FIELD_WIDTH;
  const dt = 1 / 60;

  const chapter = parseInt(state.stageId.split('-')[0]) || 1;

  ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);

  // HP 변화 감지 → 파티클 + 히트 애니메이션
  detectHPChanges(state);
  updateParticles(dt);

  // 애니메이션 프레임 업데이트
  const spriteConfigMap = new Map<string, SpriteSheetConfig>();
  [...state.allies, ...state.enemies].forEach(unit => {
    const key = CARD_SPRITE_MAP[unit.cardId];
    if (key && SPRITE_SHEETS[key]) {
      spriteConfigMap.set(unit.id, SPRITE_SHEETS[key]);
    }
  });
  updateAnimations(dt, spriteConfigMap);

  // 1. 배경
  drawBackground(ctx, canvasWidth, chapter, state.timer);

  // 2. 기지
  drawBase(ctx, ALLY_BASE_X, state.baseHP, state.maxBaseHP, true, scaleX, state.timer);
  drawBase(ctx, ENEMY_BASE_X, state.enemyBaseHP, state.maxBaseHP, false, scaleX, state.timer);

  // 3. 유닛
  state.allies.filter(u => u.hp > 0).forEach(unit => drawUnit(ctx, unit, scaleX, state.timer));
  state.enemies.filter(u => u.hp > 0).forEach(unit => drawUnit(ctx, unit, scaleX, state.timer));

  // 4. 파티클
  drawParticles(ctx, scaleX);

  // 5. 웨이브 정보
  drawWaveInfo(ctx, state.currentWave, state.totalWaves, state.timer, canvasWidth);

  // 6. 마나 바
  drawManaBar(ctx, state.mana, state.maxMana, canvasWidth, state.timer);

  // 7. 결과 오버레이
  if (state.result) {
    drawResult(ctx, state.result.victory, state.result.stars, canvasWidth, state.timer);
  }
};
