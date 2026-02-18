import type { BannerData, CardData, Grade, PullResult, Pull10Result } from '../types';
import { filterByGrade } from '../data/cards';

/** 배너 데이터 */
export const BANNERS: Record<string, BannerData> = {
  normal: {
    name: '일반 뽑기',
    cost: { currency: 'gold', amount: 200 },
    cost10: { currency: 'gold', amount: 1800 },
    rates: { 1: 55, 2: 30, 3: 12, 4: 2.8, 5: 0.2 },
    pity: { count: 30, minGrade: 3 },
  },
  premium: {
    name: '프리미엄 뽑기',
    cost: { currency: 'ticket', amount: 1 },
    cost10: { currency: 'ticket', amount: 10 },
    rates: { 1: 30, 2: 35, 3: 25, 4: 8, 5: 2 },
    pity: { count: 20, minGrade: 4 },
  },
  legend: {
    name: '전설 뽑기',
    cost: { currency: 'crystal', amount: 30 },
    cost10: { currency: 'crystal', amount: 270 },
    rates: { 1: 0, 2: 20, 3: 45, 4: 28, 5: 7 },
    pity: { count: 15, minGrade: 5 },
  },
};

/** 등급 롤링 (천장 포함) */
export const rollGrade = (rates: Record<number, number>, pityCount: number, pity: BannerData['pity']): Grade => {
  if (pityCount >= pity.count) return pity.minGrade;

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const grade of [5, 4, 3, 2, 1]) {
    cumulative += rates[grade] ?? 0;
    if (roll <= cumulative) return grade as Grade;
  }

  // 확률 테이블에서 0이 아닌 첫 등급 반환
  for (const grade of [1, 2, 3, 4, 5]) {
    if ((rates[grade] ?? 0) > 0) return grade as Grade;
  }
  return 1;
};

/** 풀에서 랜덤 카드 선택 */
const pickRandomCard = (pool: CardData[]): CardData | undefined =>
  pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : undefined;

/** 1회 뽑기 (순수 함수 - 상태 변경은 호출측에서) */
export const executePull = (
  bannerType: string,
  pityCount: number,
): { card: CardData; grade: Grade; newPity: number } | null => {
  const banner = BANNERS[bannerType];
  if (!banner) return null;

  const currentPity = pityCount + 1;
  const grade = rollGrade(banner.rates, currentPity, banner.pity);
  const pool = filterByGrade(grade);
  const card = pickRandomCard(pool);

  if (!card) return null;

  const shouldResetPity = grade >= banner.pity.minGrade;
  return {
    card,
    grade,
    newPity: shouldResetPity ? 0 : currentPity,
  };
};

/** 단일 뽑기 (스토어 연동) */
export const pull = (
  bannerType: string,
  hasResource: (c: string, a: number) => boolean,
  spendResource: (c: string, a: number) => void,
  addCard: (id: string) => void,
  pityCount: number,
  incrementPity: () => void,
  resetPity: () => void,
  getCardCount: (id: string) => number,
): PullResult => {
  const banner = BANNERS[bannerType];
  if (!banner) return { ok: false, msg: '없는 배너' };
  if (!hasResource(banner.cost.currency, banner.cost.amount)) {
    return { ok: false, msg: `${banner.cost.currency} 부족!` };
  }

  spendResource(banner.cost.currency, banner.cost.amount);
  const result = executePull(bannerType, pityCount);

  if (!result) return { ok: false, msg: '뽑기 실패' };

  addCard(result.card.id);
  if (result.newPity === 0) resetPity(); else incrementPity();

  return {
    ok: true,
    card: result.card,
    grade: result.grade,
    isNew: getCardCount(result.card.id) === 1,
  };
};

/** 10연차 뽑기 */
export const pull10 = (
  bannerType: string,
  hasResource: (c: string, a: number) => boolean,
  spendResource: (c: string, a: number) => void,
  addCard: (id: string) => void,
  pityCount: number,
  setPity: (count: number) => void,
  getCardCount: (id: string) => number,
): Pull10Result => {
  const banner = BANNERS[bannerType];
  if (!banner) return { ok: false, msg: '없는 배너' };
  if (!hasResource(banner.cost10.currency, banner.cost10.amount)) {
    return { ok: false, msg: `${banner.cost10.currency} 부족!` };
  }

  spendResource(banner.cost10.currency, banner.cost10.amount);

  let currentPity = pityCount;
  const cards: Pull10Result['cards'] = [];

  for (let i = 0; i < 10; i++) {
    const result = executePull(bannerType, currentPity);
    if (result) {
      addCard(result.card.id);
      currentPity = result.newPity;
      cards!.push({
        card: result.card,
        grade: result.grade,
        isNew: getCardCount(result.card.id) === 1,
      });
    }
  }

  setPity(currentPity);
  return { ok: true, cards };
};
