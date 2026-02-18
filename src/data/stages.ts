import type { StageData, ChapterData } from '../types';

/** 전체 스테이지 데이터 */
export const ALL_STAGES: readonly StageData[] = [
  // ===== 챕터 1: 초원 지대 =====
  {
    id: '1-1', name: '평화로운 초원', chapter: 1, order: 1, stamina: 5,
    expReward: 30, goldReward: 80,
    waves: [
      { enemies: [{ id: 'slime', count: 5 }], spawnInterval: 2 },
      { enemies: [{ id: 'snail', count: 4 }, { id: 'boar', count: 2 }], spawnInterval: 1.8 },
    ],
  },
  {
    id: '1-2', name: '숲 입구', chapter: 1, order: 2, stamina: 5,
    expReward: 40, goldReward: 100,
    waves: [
      { enemies: [{ id: 'snail', count: 6 }, { id: 'boar', count: 3 }], spawnInterval: 1.8 },
      { enemies: [{ id: 'boar', count: 5 }, { id: 'slime', count: 3 }], spawnInterval: 1.5 },
    ],
  },
  {
    id: '1-3', name: '깊은 숲', chapter: 1, order: 3, stamina: 8,
    expReward: 60, goldReward: 150,
    waves: [
      { enemies: [{ id: 'boar', count: 5 }, { id: 'treant', count: 3 }], spawnInterval: 1.5 },
      { enemies: [{ id: 'treant', count: 4 }, { id: 'slime', count: 4 }], spawnInterval: 1.3 },
      { enemies: [{ id: 'ghost', count: 1 }], spawnInterval: 3, isBoss: true },
    ],
  },

  // ===== 챕터 2: 암흑 협곡 =====
  {
    id: '2-1', name: '어둠의 동굴', chapter: 2, order: 1, stamina: 8,
    expReward: 70, goldReward: 180,
    waves: [
      { enemies: [{ id: 'ghost', count: 4 }, { id: 'evil_eye', count: 3 }], spawnInterval: 1.5 },
      { enemies: [{ id: 'wolf', count: 5 }, { id: 'evil_eye', count: 3 }], spawnInterval: 1.3 },
    ],
  },
  {
    id: '2-2', name: '지하 수로', chapter: 2, order: 2, stamina: 8,
    expReward: 85, goldReward: 220,
    waves: [
      { enemies: [{ id: 'wolf', count: 5 }, { id: 'ghost', count: 4 }], spawnInterval: 1.3 },
      { enemies: [{ id: 'evil_eye', count: 4 }, { id: 'wolf', count: 4 }], spawnInterval: 1.2 },
      { enemies: [{ id: 'fire_drake', count: 1 }], spawnInterval: 3, isBoss: true },
    ],
  },
  {
    id: '2-3', name: '용암 지대', chapter: 2, order: 3, stamina: 10,
    expReward: 100, goldReward: 280,
    waves: [
      { enemies: [{ id: 'fire_drake', count: 3 }, { id: 'werewolf', count: 2 }], spawnInterval: 1.2 },
      { enemies: [{ id: 'werewolf', count: 4 }, { id: 'minotaur', count: 2 }], spawnInterval: 1.0 },
      { enemies: [{ id: 'dark_knight', count: 1 }], spawnInterval: 3, isBoss: true },
    ],
  },

  // ===== 챕터 3: 혼돈의 성 =====
  {
    id: '3-1', name: '설원 전초기지', chapter: 3, order: 1, stamina: 10,
    expReward: 120, goldReward: 350,
    waves: [
      { enemies: [{ id: 'minotaur', count: 4 }, { id: 'werewolf', count: 3 }], spawnInterval: 1.0 },
      { enemies: [{ id: 'dark_knight', count: 2 }, { id: 'fire_drake', count: 3 }], spawnInterval: 1.0 },
      { enemies: [{ id: 'red_demon', count: 1 }], spawnInterval: 3, isBoss: true },
    ],
  },
  {
    id: '3-2', name: '혼돈의 회랑', chapter: 3, order: 2, stamina: 12,
    expReward: 150, goldReward: 450,
    waves: [
      { enemies: [{ id: 'red_demon', count: 2 }, { id: 'dark_knight', count: 3 }], spawnInterval: 1.0 },
      { enemies: [{ id: 'minotaur', count: 4 }, { id: 'red_demon', count: 2 }], spawnInterval: 0.8 },
      { enemies: [{ id: 'golem', count: 1 }], spawnInterval: 3, isBoss: true },
    ],
  },
  {
    id: '3-3', name: '최종 결전', chapter: 3, order: 3, stamina: 15,
    expReward: 200, goldReward: 600,
    waves: [
      { enemies: [{ id: 'red_demon', count: 3 }, { id: 'dark_knight', count: 4 }], spawnInterval: 0.8 },
      { enemies: [{ id: 'golem', count: 1 }, { id: 'red_demon', count: 2 }], spawnInterval: 0.8 },
      { enemies: [{ id: 'chaos_king', count: 1 }], spawnInterval: 3, isBoss: true },
    ],
  },
];

/** 챕터 이름 */
export const CHAPTER_NAMES: Record<number, string> = {
  1: '초원 지대',
  2: '암흑 협곡',
  3: '혼돈의 성',
};

// ===== 유틸 함수 =====

/** 스테이지 ID로 찾기 */
export const findStageById = (id: string): StageData | undefined =>
  ALL_STAGES.find(s => s.id === id);

/** 스테이지 순서 목록 */
export const STAGE_ORDER: readonly string[] =
  ALL_STAGES.map(s => s.id);

/** 챕터별 그룹 */
export const getChapters = (): ChapterData[] =>
  [1, 2, 3].map(chapterId => ({
    id: chapterId,
    name: CHAPTER_NAMES[chapterId],
    stages: ALL_STAGES.filter(s => s.chapter === chapterId),
  }));

/** 스테이지 해금 조건 체크 */
export const isStageUnlocked = (
  stageId: string,
  clearedStages: Record<string, { stars: number }>,
): boolean => {
  if (stageId === '1-1') return true;
  const idx = STAGE_ORDER.indexOf(stageId);
  if (idx <= 0) return false;
  const prevId = STAGE_ORDER[idx - 1];
  return prevId in clearedStages;
};

/** 스테이지 클리어 보상 계산 */
export const calculateRewards = (
  stageId: string,
  stars: number,
): { exp: number; gold: number } | null => {
  const stage = findStageById(stageId);
  if (!stage) return null;
  const mult = 0.5 + stars * 0.25;
  return {
    exp: Math.floor(stage.expReward * mult),
    gold: Math.floor(stage.goldReward * mult),
  };
};
