import type { SpriteSheetConfig, SpriteFrameConfig } from '../types';

// ===== 헬퍼 =====

const anim = (row: number, frameCount: number): SpriteFrameConfig => ({ row, frameCount });

// ===== 스프라이트시트 설정 =====
// MiniFolks (lyaseek) — 32x32 프레임
// 각 PNG의 실제 크기로 cols 계산: width / 32

export const SPRITE_SHEETS: Record<string, SpriteSheetConfig> = {
  // MiniFox.png: 192x192 → 6cols × 6rows
  fox: {
    src: 'assets/MiniFox.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 4),
      attack: anim(3, 6),
      hit:    anim(4, 2),
      death:  anim(5, 4),
    },
  },

  // MiniWolf.png: 224x256 → 7cols × 8rows
  wolf: {
    src: 'assets/MiniWolf.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 6),
      attack: anim(3, 5),
      hit:    anim(6, 2),
      death:  anim(7, 4),
    },
  },

  // MiniBear.png: 320x256 → 10cols × 8rows
  bear: {
    src: 'assets/MiniBear.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 6),
      attack: anim(3, 6),
      hit:    anim(6, 2),
      death:  anim(7, 4),
    },
  },

  // MiniBoar.png: 160x192 → 5cols × 6rows
  boar: {
    src: 'assets/MiniBoar.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 4),
      attack: anim(3, 5),
      hit:    anim(4, 2),
      death:  anim(5, 4),
    },
  },

  // MiniDeer1.png: 160x192 → 5cols × 6rows
  deer: {
    src: 'assets/MiniDeer1.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 4),
      attack: anim(3, 5),
      hit:    anim(4, 2),
      death:  anim(5, 4),
    },
  },

  // MiniDeer2.png: 224x224 → 7cols × 7rows
  deer2: {
    src: 'assets/MiniDeer2.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 4),
      attack: anim(3, 5),
      hit:    anim(5, 2),
      death:  anim(6, 4),
    },
  },

  // MiniBunny.png: 128x128 → 4cols × 4rows
  bunny: {
    src: 'assets/MiniBunny.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 4),
      attack: anim(1, 4),  // 공격 없음 → walk 재사용
      hit:    anim(2, 2),
      death:  anim(3, 3),
    },
  },

  // MiniBird.png: 64x48 → 16x16 프레임! 4cols × 3rows
  bird: {
    src: 'assets/MiniBird.png',
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      idle:   anim(0, 4),
      walk:   anim(1, 4),  // fly 애니메이션
      attack: anim(1, 4),  // fly 재사용
      hit:    anim(0, 4),  // idle 재사용
      death:  anim(2, 3),
    },
  },
};

// ===== 카드 ID → 스프라이트 매핑 =====
// 동물끼리 싸우는 컨셉

export const CARD_SPRITE_MAP: Record<string, string> = {
  // === 아군 유닛 카드 ===
  // 근접/탱커 → boar
  warrior_basic: 'boar',
  knight_basic: 'boar',
  fighter: 'boar',
  crusader: 'boar',
  hero: 'bear',
  paladin: 'bear',

  // 원거리 → deer
  archer_basic: 'deer',
  hunter: 'deer',
  gunslinger: 'deer2',
  ranger: 'deer2',
  bowmaster: 'deer2',
  captain: 'deer2',
  divine_archer: 'bird',

  // 마법사 → fox
  mage_basic: 'fox',
  wizard: 'fox',
  archmage: 'fox',
  sage: 'fox',

  // 암살자 → wolf
  thief_basic: 'wolf',
  rogue: 'wolf',
  assassin: 'wolf',
  shadowlord: 'wolf',

  // 서포트 → bunny
  healer_basic: 'bunny',
  priest: 'bunny',
  bishop: 'bunny',

  // === 몬스터 카드 ===
  slime: 'bunny',
  snail: 'bunny',
  boar: 'boar',
  treant: 'bear',
  wolf: 'wolf',
  evil_eye: 'fox',
  ghost: 'wolf',
  fire_drake: 'bird',
  werewolf: 'wolf',
  minotaur: 'boar',
  dark_knight: 'bear',
  red_demon: 'fox',
  golem: 'bear',
  dragon_lord: 'bird',
  chaos_king: 'bear',
};

// ===== Oak Woods 환경 에셋 =====

export const BACKGROUND_LAYERS = [
  'assets/oak_woods_v1.0/background/background_layer_1.png',
  'assets/oak_woods_v1.0/background/background_layer_2.png',
  'assets/oak_woods_v1.0/background/background_layer_3.png',
];

export const GROUND_TILESET = 'assets/oak_woods_v1.0/oak_woods_tileset.png';

export const BASE_BUILDING = 'assets/oak_woods_v1.0/decorations/shop.png';

export const DECORATIONS = {
  grass1: 'assets/oak_woods_v1.0/decorations/grass_1.png',
  grass2: 'assets/oak_woods_v1.0/decorations/grass_2.png',
  grass3: 'assets/oak_woods_v1.0/decorations/grass_3.png',
  rock1: 'assets/oak_woods_v1.0/decorations/rock_1.png',
  rock2: 'assets/oak_woods_v1.0/decorations/rock_2.png',
  fence1: 'assets/oak_woods_v1.0/decorations/fence_1.png',
};
