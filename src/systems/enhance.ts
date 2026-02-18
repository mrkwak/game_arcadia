import type { OwnedCard, Grade } from '../types';

// ===== 강화 상수 =====

/** 레벨업에 필요한 중복 카드 수 (등급별) */
const UPGRADE_COST: Record<Grade, number> = {
  1: 3,   // ★ 노멀: 3장
  2: 4,   // ★★ 레어: 4장
  3: 5,   // ★★★ 에픽: 5장
  4: 8,   // ★★★★ 레전드: 8장
  5: 10,  // ★★★★★ 신화: 10장
};

/** 레벨업에 필요한 골드 (등급 × 레벨 × 배율) */
const GOLD_MULTIPLIER: Record<Grade, number> = {
  1: 50,
  2: 100,
  3: 200,
  4: 500,
  5: 1000,
};

/** 최대 레벨 (등급별) */
const MAX_LEVEL: Record<Grade, number> = {
  1: 10,
  2: 15,
  3: 20,
  4: 25,
  5: 30,
};

// ===== 순수 함수 =====

/** 레벨업에 필요한 중복 카드 수 조회 */
export const getUpgradeCardCost = (grade: Grade): number =>
  UPGRADE_COST[grade];

/** 레벨업에 필요한 골드 계산 */
export const getUpgradeGoldCost = (grade: Grade, currentLevel: number): number =>
  GOLD_MULTIPLIER[grade] * currentLevel;

/** 최대 레벨 조회 */
export const getMaxLevel = (grade: Grade): number =>
  MAX_LEVEL[grade];

/** 강화 가능 여부 체크 */
export const canEnhance = (
  grade: Grade,
  owned: OwnedCard,
  gold: number,
): { ok: boolean; reason?: string } => {
  const maxLv = getMaxLevel(grade);
  if (owned.level >= maxLv) {
    return { ok: false, reason: '최대 레벨입니다!' };
  }

  const cardCost = getUpgradeCardCost(grade);
  if (owned.count < cardCost + 1) {
    // +1은 본체 카드 (나머지가 재료)
    return { ok: false, reason: `카드 ${cardCost}장 필요 (보유: ${owned.count - 1}장)` };
  }

  const goldCost = getUpgradeGoldCost(grade, owned.level);
  if (gold < goldCost) {
    return { ok: false, reason: `골드 ${goldCost} 필요 (보유: ${gold})` };
  }

  return { ok: true };
};

/** 강화 실행 결과 타입 */
export interface EnhanceResult {
  readonly ok: boolean;
  readonly newLevel?: number;
  readonly cardCost?: number;
  readonly goldCost?: number;
  readonly msg?: string;
}

/** 강화 실행 (스토어 연동은 호출측에서) */
export const executeEnhance = (
  grade: Grade,
  owned: OwnedCard,
  gold: number,
): EnhanceResult => {
  const check = canEnhance(grade, owned, gold);
  if (!check.ok) {
    return { ok: false, msg: check.reason };
  }

  const cardCost = getUpgradeCardCost(grade);
  const goldCost = getUpgradeGoldCost(grade, owned.level);

  return {
    ok: true,
    newLevel: owned.level + 1,
    cardCost,
    goldCost,
  };
};

/** 스탯 증가 미리보기 (레벨 차이에 따른 증가율) */
export const getStatPreview = (
  baseStat: number,
  currentLevel: number,
): { current: number; next: number } => {
  const levelScale = 0.1;
  const current = Math.floor(baseStat * (1 + levelScale * (currentLevel - 1)));
  const next = Math.floor(baseStat * (1 + levelScale * currentLevel));
  return { current, next };
};
