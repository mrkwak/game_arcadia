import type { CardData, GradeInfo } from '../types';

/** 등급 정보 테이블 */
export const GRADE_TABLE: Record<number, GradeInfo> = {
  1: { label: '★', color: '#9e9e9e', stars: '★' },
  2: { label: '★★', color: '#4caf50', stars: '★★' },
  3: { label: '★★★', color: '#2196f3', stars: '★★★' },
  4: { label: '★★★★', color: '#9c27b0', stars: '★★★★' },
  5: { label: '★★★★★', color: '#ff9800', stars: '★★★★★' },
};

/** 전체 카드 데이터 (37장) — 동물 왕국 컨셉 */
export const ALL_CARDS: readonly CardData[] = [
  // ===== 아군 유닛 (22장) =====

  // ★ 신병 (6장)
  { id: 'warrior_basic', name: '돌격멧돼지', emoji: '🐗', type: 'unit', grade: 1, role: 'melee', baseHP: 120, baseATK: 25, baseDEF: 10, atkSpeed: 1.0, range: 1, cost: 3 },
  { id: 'archer_basic', name: '꼬마사슴', emoji: '🦌', type: 'unit', grade: 1, role: 'ranged', baseHP: 80, baseATK: 30, baseDEF: 5, atkSpeed: 1.2, range: 4, cost: 3 },
  { id: 'mage_basic', name: '마법여우', emoji: '🦊', type: 'unit', grade: 1, role: 'mage', baseHP: 70, baseATK: 35, baseDEF: 3, atkSpeed: 0.8, range: 5, cost: 4, skill: { name: '여우불', damage: 40, cooldown: 5 } },
  { id: 'thief_basic', name: '회색늑대', emoji: '🐺', type: 'unit', grade: 1, role: 'assassin', baseHP: 90, baseATK: 28, baseDEF: 5, atkSpeed: 1.5, range: 1, cost: 3 },
  { id: 'knight_basic', name: '방패멧돼지', emoji: '🐗', type: 'unit', grade: 1, role: 'tank', baseHP: 200, baseATK: 15, baseDEF: 20, atkSpeed: 0.7, range: 1, cost: 4 },
  { id: 'healer_basic', name: '솜뭉치토끼', emoji: '🐰', type: 'unit', grade: 1, role: 'support', baseHP: 80, baseATK: 10, baseDEF: 5, atkSpeed: 0.8, range: 3, cost: 4, skill: { name: '당근치유', heal: 50, cooldown: 6 } },

  // ★★ 정규병 (6장)
  { id: 'fighter', name: '전투멧돼지', emoji: '🐗', type: 'unit', grade: 2, role: 'melee', baseHP: 220, baseATK: 45, baseDEF: 18, atkSpeed: 1.1, range: 1, cost: 5, skill: { name: '돌진', damage: 60, cooldown: 5 } },
  { id: 'hunter', name: '사냥꾼사슴', emoji: '🦌', type: 'unit', grade: 2, role: 'ranged', baseHP: 150, baseATK: 55, baseDEF: 8, atkSpeed: 1.3, range: 5, cost: 5, skill: { name: '뿔연타', damage: 30, hits: 3, cooldown: 6 } },
  { id: 'wizard', name: '화염여우', emoji: '🦊', type: 'unit', grade: 2, role: 'mage', baseHP: 130, baseATK: 60, baseDEF: 6, atkSpeed: 0.9, range: 5, cost: 6, skill: { name: '도깨비불', damage: 70, cooldown: 5 } },
  { id: 'rogue', name: '어둠늑대', emoji: '🐺', type: 'unit', grade: 2, role: 'assassin', baseHP: 160, baseATK: 50, baseDEF: 10, atkSpeed: 1.7, range: 1, cost: 5, skill: { name: '급습', damage: 80, cooldown: 6 } },
  { id: 'gunslinger', name: '가시사슴', emoji: '🦌', type: 'unit', grade: 2, role: 'ranged', baseHP: 140, baseATK: 52, baseDEF: 7, atkSpeed: 1.4, range: 5, cost: 5, skill: { name: '뿔난사', damage: 25, hits: 4, cooldown: 5 } },
  { id: 'priest', name: '치유토끼', emoji: '🐰', type: 'unit', grade: 2, role: 'support', baseHP: 150, baseATK: 20, baseDEF: 10, atkSpeed: 0.9, range: 4, cost: 6, skill: { name: '풀잎치유', heal: 80, cooldown: 5 } },

  // ★★★ 정예 (6장)
  { id: 'crusader', name: '철갑멧돼지', emoji: '🐗', type: 'unit', grade: 3, role: 'melee', baseHP: 400, baseATK: 80, baseDEF: 30, atkSpeed: 1.2, range: 1, cost: 7, skill: { name: '파쇄돌격', damage: 120, cooldown: 5 } },
  { id: 'ranger', name: '왕뿔사슴', emoji: '🦌', type: 'unit', grade: 3, role: 'ranged', baseHP: 280, baseATK: 95, baseDEF: 14, atkSpeed: 1.5, range: 6, cost: 7, skill: { name: '뿔비', damage: 50, aoe: true, cooldown: 6 } },
  { id: 'archmage', name: '구미호', emoji: '🦊', type: 'unit', grade: 3, role: 'mage', baseHP: 250, baseATK: 110, baseDEF: 10, atkSpeed: 1.0, range: 6, cost: 8, skill: { name: '여우화염', damage: 100, aoe: true, cooldown: 7 } },
  { id: 'assassin', name: '그림자늑대', emoji: '🐺', type: 'unit', grade: 3, role: 'assassin', baseHP: 300, baseATK: 90, baseDEF: 15, atkSpeed: 2.0, range: 1, cost: 7, skill: { name: '그림자이빨', damage: 150, cooldown: 6 } },
  { id: 'captain', name: '돌격대장사슴', emoji: '🦌', type: 'unit', grade: 3, role: 'ranged', baseHP: 320, baseATK: 85, baseDEF: 18, atkSpeed: 1.5, range: 5, cost: 7, skill: { name: '뿔폭격', damage: 80, aoe: true, cooldown: 6 } },
  { id: 'bishop', name: '달빛토끼', emoji: '🐰', type: 'unit', grade: 3, role: 'support', baseHP: 280, baseATK: 30, baseDEF: 18, atkSpeed: 1.0, range: 5, cost: 8, skill: { name: '달빛축복', heal: 150, cooldown: 5 } },

  // ★★★★ 전설 (4장)
  { id: 'hero', name: '전설의곰', emoji: '🐻', type: 'unit', grade: 4, role: 'melee', baseHP: 700, baseATK: 150, baseDEF: 50, atkSpeed: 1.3, range: 2, cost: 10, skill: { name: '곰의분노', damage: 200, cooldown: 4 } },
  { id: 'bowmaster', name: '숲의왕사슴', emoji: '🦌', type: 'unit', grade: 4, role: 'ranged', baseHP: 500, baseATK: 170, baseDEF: 25, atkSpeed: 2.0, range: 7, cost: 10, skill: { name: '폭풍의뿔', damage: 80, hits: 5, cooldown: 5 } },
  { id: 'sage', name: '천년여우', emoji: '🦊', type: 'unit', grade: 4, role: 'mage', baseHP: 450, baseATK: 200, baseDEF: 20, atkSpeed: 1.1, range: 7, cost: 11, skill: { name: '빙결의꼬리', damage: 180, aoe: true, cooldown: 6 } },
  { id: 'shadowlord', name: '늑대왕', emoji: '🐺', type: 'unit', grade: 4, role: 'assassin', baseHP: 550, baseATK: 180, baseDEF: 30, atkSpeed: 2.2, range: 2, cost: 10, skill: { name: '늑대왕의울부짖음', damage: 250, cooldown: 5 } },

  // ★★★★★ 신화 (2장)
  { id: 'paladin', name: '신수곰', emoji: '🐻', type: 'unit', grade: 5, role: 'melee', baseHP: 1200, baseATK: 250, baseDEF: 80, atkSpeed: 1.5, range: 2, cost: 14, skill: { name: '대지의포효', damage: 350, aoe: true, cooldown: 5 } },
  { id: 'divine_archer', name: '불사조', emoji: '🔥', type: 'unit', grade: 5, role: 'ranged', baseHP: 800, baseATK: 300, baseDEF: 40, atkSpeed: 2.5, range: 8, cost: 14, skill: { name: '불꽃폭풍', damage: 150, hits: 6, cooldown: 4 } },

  // ===== 몬스터 카드 (15장) =====

  // ★ (4장)
  { id: 'slime', name: '아기토끼', emoji: '🐰', type: 'monster', grade: 1, role: 'tank', baseHP: 150, baseATK: 15, baseDEF: 12, atkSpeed: 0.8, range: 1, cost: 2 },
  { id: 'snail', name: '느림보토끼', emoji: '🐰', type: 'monster', grade: 1, role: 'tank', baseHP: 180, baseATK: 10, baseDEF: 18, atkSpeed: 0.5, range: 1, cost: 2 },
  { id: 'boar', name: '야생멧돼지', emoji: '🐗', type: 'monster', grade: 1, role: 'melee', baseHP: 130, baseATK: 22, baseDEF: 8, atkSpeed: 1.0, range: 1, cost: 3 },
  { id: 'treant', name: '숲의파수꾼', emoji: '🐻', type: 'monster', grade: 1, role: 'tank', baseHP: 200, baseATK: 12, baseDEF: 15, atkSpeed: 0.6, range: 1, cost: 3 },

  // ★★ (3장)
  { id: 'wolf', name: '들늑대', emoji: '🐺', type: 'monster', grade: 2, role: 'melee', baseHP: 250, baseATK: 45, baseDEF: 12, atkSpeed: 1.3, range: 1, cost: 5, skill: { name: '물어뜯기', damage: 55, cooldown: 4 } },
  { id: 'evil_eye', name: '요술여우', emoji: '🦊', type: 'monster', grade: 2, role: 'mage', baseHP: 180, baseATK: 55, baseDEF: 8, atkSpeed: 1.0, range: 4, cost: 5, skill: { name: '환술', damage: 65, cooldown: 5 } },
  { id: 'ghost', name: '망령늑대', emoji: '🐺', type: 'monster', grade: 2, role: 'assassin', baseHP: 160, baseATK: 50, baseDEF: 5, atkSpeed: 1.5, range: 1, cost: 4, skill: { name: '저주의이빨', damage: 70, cooldown: 6 } },

  // ★★★ (3장)
  { id: 'fire_drake', name: '화염새', emoji: '🔥', type: 'monster', grade: 3, role: 'mage', baseHP: 380, baseATK: 100, baseDEF: 20, atkSpeed: 1.0, range: 5, cost: 8, skill: { name: '화염질풍', damage: 90, aoe: true, cooldown: 5 } },
  { id: 'werewolf', name: '광폭늑대', emoji: '🐺', type: 'monster', grade: 3, role: 'melee', baseHP: 450, baseATK: 85, baseDEF: 25, atkSpeed: 1.5, range: 1, cost: 7, skill: { name: '광폭화', damage: 130, cooldown: 6 } },
  { id: 'minotaur', name: '거대멧돼지', emoji: '🐗', type: 'monster', grade: 3, role: 'tank', baseHP: 600, baseATK: 70, baseDEF: 35, atkSpeed: 0.8, range: 1, cost: 8, skill: { name: '파괴돌진', damage: 100, cooldown: 5 } },

  // ★★★★ (2장)
  { id: 'dark_knight', name: '어둠의곰', emoji: '🐻', type: 'monster', grade: 4, role: 'melee', baseHP: 800, baseATK: 160, baseDEF: 45, atkSpeed: 1.2, range: 2, cost: 11, skill: { name: '어둠발톱', damage: 220, cooldown: 5 } },
  { id: 'red_demon', name: '요호여우', emoji: '🦊', type: 'monster', grade: 4, role: 'mage', baseHP: 650, baseATK: 190, baseDEF: 30, atkSpeed: 1.0, range: 6, cost: 11, skill: { name: '지옥불꽃', damage: 160, aoe: true, cooldown: 5 } },

  // ★★★★★ (3장)
  { id: 'golem', name: '태고의곰', emoji: '🐻', type: 'monster', grade: 5, role: 'tank', baseHP: 2000, baseATK: 180, baseDEF: 100, atkSpeed: 0.6, range: 1, cost: 15, skill: { name: '대지진', damage: 250, aoe: true, cooldown: 7 } },
  { id: 'dragon_lord', name: '폭풍의새', emoji: '🔥', type: 'monster', grade: 5, role: 'mage', baseHP: 1000, baseATK: 280, baseDEF: 50, atkSpeed: 1.0, range: 7, cost: 15, skill: { name: '폭풍날개', damage: 200, aoe: true, cooldown: 5 } },
  { id: 'chaos_king', name: '혼돈의곰왕', emoji: '🐻', type: 'monster', grade: 5, role: 'melee', baseHP: 1500, baseATK: 250, baseDEF: 70, atkSpeed: 1.2, range: 2, cost: 16, skill: { name: '혼돈의포효', damage: 300, aoe: true, cooldown: 6 } },
];

// ===== 유틸 함수 =====

/** ID로 카드 찾기 */
export const findCardById = (id: string): CardData | undefined =>
  ALL_CARDS.find(card => card.id === id);

/** 등급으로 카드 필터링 */
export const filterByGrade = (grade: number): CardData[] =>
  ALL_CARDS.filter(card => card.grade === grade);

/** 타입으로 카드 필터링 */
export const filterByType = (type: 'unit' | 'monster'): CardData[] =>
  ALL_CARDS.filter(card => card.type === type);

/** 등급 정보 가져오기 */
export const getGradeInfo = (grade: number): GradeInfo =>
  GRADE_TABLE[grade] ?? { label: '?', color: '#999', stars: '?' };
