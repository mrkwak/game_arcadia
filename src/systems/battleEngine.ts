import type { BattleUnit, BattleState, BattleResult, CardData, Wave } from '../types';
import { findCardById } from '../data/cards';
import { findStageById } from '../data/stages';

// ===== 상수 =====

/** 전장 크기 (가로 픽셀 기준) */
export const FIELD_WIDTH = 800;

/** 기지 위치 */
export const ALLY_BASE_X = 40;
export const ENEMY_BASE_X = FIELD_WIDTH - 40;

/** 마나 설정 */
const INITIAL_MANA = 30;
const MAX_MANA = 100;
const MANA_REGEN = 3; // 초당

/** 기지 HP */
const BASE_HP = 2000;

/** 유닛 이동 속도 (초당 픽셀) */
const MOVE_SPEED = 25;

/** 레벨 보정 계수 */
const LEVEL_SCALE = 0.1;

// ===== 유틸 함수 =====

/** 고유 ID 생성 */
let unitIdCounter = 0;
const generateUnitId = (): string => `unit_${++unitIdCounter}`;

/** 레벨 보정 스탯 계산 */
const applyLevelScale = (base: number, level: number): number =>
  Math.floor(base * (1 + LEVEL_SCALE * (level - 1)));

/** 카드 → 전투 유닛 변환 */
export const createBattleUnit = (
  card: CardData,
  level: number,
  isAlly: boolean,
  isBoss: boolean = false,
): BattleUnit => ({
  id: generateUnitId(),
  name: card.name,
  emoji: card.emoji,
  cardId: card.id,
  hp: applyLevelScale(card.baseHP, level) * (isBoss ? 3 : 1),
  maxHP: applyLevelScale(card.baseHP, level) * (isBoss ? 3 : 1),
  atk: applyLevelScale(card.baseATK, level) * (isBoss ? 2 : 1),
  def: applyLevelScale(card.baseDEF, level),
  atkSpeed: card.atkSpeed,
  range: card.range * 30, // 사거리를 픽셀로 변환
  pos: isAlly ? ALLY_BASE_X + 30 : ENEMY_BASE_X - 30,
  atkTimer: 0,
  skill: card.skill,
  skillTimer: 0,
  level,
  isBoss,
  isAlly,
});

// ===== 전투 상태 초기화 =====

/** 전투 초기 상태 생성 */
export const createBattleState = (
  stageId: string,
  _deckCardIds: readonly string[],
  _cardLevels: Record<string, number>,
): BattleState | null => {
  const stage = findStageById(stageId);
  if (!stage) return null;

  unitIdCounter = 0;

  // 첫 웨이브 적을 pendingEnemies에 넣어서 순차 스폰
  const firstWave = stage.waves[0];
  const pendingEnemies = createWaveEnemies(firstWave, 1);

  return {
    stageId,
    currentWave: 0,
    totalWaves: stage.waves.length,
    allies: [],
    enemies: [],
    pendingEnemies,
    baseHP: BASE_HP,
    maxBaseHP: BASE_HP,
    enemyBaseHP: BASE_HP,
    mana: INITIAL_MANA,
    maxMana: MAX_MANA,
    manaRegen: MANA_REGEN,
    timer: 0,
    spawnTimer: 0,
    result: null,
    log: [`스테이지 ${stageId} 전투 시작!`],
  };
};

/** 웨이브 적 유닛 생성 */
const createWaveEnemies = (wave: Wave, waveNum: number): BattleUnit[] =>
  wave.enemies.flatMap(group => {
    const card = findCardById(group.id);
    if (!card) return [];
    const level = waveNum; // 웨이브 번호 = 적 레벨
    return Array.from({ length: group.count }, () =>
      createBattleUnit(card, level, false, wave.isBoss ?? false),
    );
  });

// ===== 전투 틱 업데이트 =====

/** 데미지 계산 (순수 함수) */
const calculateDamage = (atk: number, def: number): number =>
  Math.max(1, Math.floor(atk - def * 0.5));

/** 가장 가까운 적 찾기 */
const findClosestEnemy = (
  unit: BattleUnit,
  targets: BattleUnit[],
): BattleUnit | null => {
  if (targets.length === 0) return null;

  return targets.reduce<BattleUnit | null>((closest, target) => {
    const dist = Math.abs(unit.pos - target.pos);
    if (!closest) return target;
    return dist < Math.abs(unit.pos - closest.pos) ? target : closest;
  }, null);
};

/** 유닛이 사거리 내에 적이 있는지 확인 */
const isInRange = (unit: BattleUnit, target: BattleUnit): boolean =>
  Math.abs(unit.pos - target.pos) <= unit.range;

/** 단일 유닛 업데이트 (이동 + 공격) */
const updateUnit = (
  unit: BattleUnit,
  targets: BattleUnit[],
  dt: number,
): { unit: BattleUnit; damageEvents: Array<{ targetId: string; damage: number }> } => {
  if (unit.hp <= 0) return { unit, damageEvents: [] };

  const closest = findClosestEnemy(unit, targets);
  const damageEvents: Array<{ targetId: string; damage: number }> = [];

  // 스킬 타이머 업데이트
  const updatedSkillTimer = unit.skillTimer > 0 ? unit.skillTimer - dt : 0;

  if (closest && isInRange(unit, closest)) {
    // 사거리 내 → 공격
    const newAtkTimer = unit.atkTimer + dt;
    const atkInterval = 1 / unit.atkSpeed;

    if (newAtkTimer >= atkInterval) {
      // 스킬 사용 가능한지 확인
      if (unit.skill && updatedSkillTimer <= 0 && unit.skill.damage) {
        // 스킬 공격
        const skillDmg = unit.skill.damage;
        if (unit.skill.aoe) {
          // 광역: 사거리 내 모든 적에게 데미지
          targets
            .filter(t => isInRange(unit, t) && t.hp > 0)
            .forEach(t => damageEvents.push({ targetId: t.id, damage: skillDmg }));
        } else if (unit.skill.hits) {
          // 연타: 여러 번 공격
          for (let h = 0; h < unit.skill.hits; h++) {
            damageEvents.push({ targetId: closest.id, damage: skillDmg });
          }
        } else {
          // 단일 스킬 공격
          damageEvents.push({ targetId: closest.id, damage: skillDmg });
        }
        return {
          unit: { ...unit, atkTimer: 0, skillTimer: unit.skill.cooldown },
          damageEvents,
        };
      }

      // 일반 공격
      const dmg = calculateDamage(unit.atk, closest.def);
      damageEvents.push({ targetId: closest.id, damage: dmg });
      return {
        unit: { ...unit, atkTimer: 0, skillTimer: updatedSkillTimer },
        damageEvents,
      };
    }

    return {
      unit: { ...unit, atkTimer: newAtkTimer, skillTimer: updatedSkillTimer },
      damageEvents,
    };
  }

  // 사거리 밖 → 이동
  const direction = unit.isAlly ? 1 : -1;
  const newPos = unit.pos + MOVE_SPEED * dt * direction;

  // 기지 위치를 넘지 않도록 제한
  const clampedPos = unit.isAlly
    ? Math.min(newPos, ENEMY_BASE_X - 10)
    : Math.max(newPos, ALLY_BASE_X + 10);

  return {
    unit: { ...unit, pos: clampedPos, skillTimer: updatedSkillTimer },
    damageEvents,
  };
};

/** 데미지 이벤트 적용 */
const applyDamageEvents = (
  units: BattleUnit[],
  events: Array<{ targetId: string; damage: number }>,
): BattleUnit[] =>
  units.map(u => {
    const totalDmg = events
      .filter(e => e.targetId === u.id)
      .reduce((sum, e) => sum + e.damage, 0);
    return totalDmg > 0 ? { ...u, hp: Math.max(0, u.hp - totalDmg) } : u;
  });

/** 힐러 유닛 업데이트 (아군 회복) */
const processHealing = (
  allies: BattleUnit[],
  _dt: number,
): BattleUnit[] =>
  allies.map(unit => {
    if (!unit.skill?.heal || unit.hp <= 0 || unit.skillTimer > 0) return unit;

    // 가장 HP가 낮은 아군 찾기
    const injured = allies
      .filter(a => a.hp > 0 && a.hp < a.maxHP && a.id !== unit.id)
      .sort((a, b) => (a.hp / a.maxHP) - (b.hp / b.maxHP))[0];

    if (!injured) return unit;

    return { ...unit, skillTimer: unit.skill.cooldown };
  });

/** 힐 적용 (별도 패스) */
const applyHealing = (allies: BattleUnit[]): BattleUnit[] => {
  const healers = allies.filter(u => u.skill?.heal && u.hp > 0 && u.skillTimer === u.skill!.cooldown);
  if (healers.length === 0) return allies;

  return allies.map(unit => {
    if (unit.hp <= 0 || unit.hp >= unit.maxHP) return unit;

    const healAmount = healers.reduce((sum, healer) => {
      const injured = allies
        .filter(a => a.hp > 0 && a.hp < a.maxHP && a.id !== healer.id)
        .sort((a, b) => (a.hp / a.maxHP) - (b.hp / b.maxHP))[0];

      if (injured?.id === unit.id) return sum + (healer.skill?.heal ?? 0);
      return sum;
    }, 0);

    if (healAmount <= 0) return unit;
    return { ...unit, hp: Math.min(unit.maxHP, unit.hp + healAmount) };
  });
};

/** 적 스폰 (펜딩 → 필드) */
const spawnPendingEnemies = (
  state: BattleState,
  dt: number,
  spawnInterval: number,
): { enemies: BattleUnit[]; pendingEnemies: BattleUnit[]; spawnTimer: number } => {
  const newTimer = state.spawnTimer + dt;

  if (newTimer >= spawnInterval && state.pendingEnemies.length > 0) {
    const [next, ...rest] = state.pendingEnemies;
    return {
      enemies: [...state.enemies, next],
      pendingEnemies: rest,
      spawnTimer: 0,
    };
  }

  return {
    enemies: state.enemies,
    pendingEnemies: state.pendingEnemies,
    spawnTimer: newTimer,
  };
};

/** 기지 공격 체크 */
const checkBaseAttack = (
  units: BattleUnit[],
  isAllyBase: boolean,
  dt: number,
): number => {
  const attackers = units.filter(u => {
    if (u.hp <= 0) return false;
    if (isAllyBase) return !u.isAlly && u.pos <= ALLY_BASE_X + 20;
    return u.isAlly && u.pos >= ENEMY_BASE_X - 20;
  });

  return attackers.reduce((totalDmg, attacker) => {
    const dmg = attacker.atk * dt * attacker.atkSpeed;
    return totalDmg + dmg;
  }, 0);
};

/** 승리/패배 체크 */
const checkResult = (state: BattleState): BattleResult | null => {
  if (state.baseHP <= 0) {
    return { victory: false, stars: 0 };
  }

  if (state.enemyBaseHP <= 0) {
    const hpPercent = state.baseHP / state.maxBaseHP;
    const stars = hpPercent >= 0.8 ? 3 : hpPercent >= 0.4 ? 2 : 1;
    return { victory: true, stars };
  }

  return null;
};

/** 다음 웨이브 체크 */
const checkNextWave = (state: BattleState): BattleState => {
  // 현재 웨이브의 적이 모두 처치되고 펜딩도 없으면 다음 웨이브
  const livingEnemies = state.enemies.filter(e => e.hp > 0);
  if (livingEnemies.length > 0 || state.pendingEnemies.length > 0) return state;

  const nextWaveIndex = state.currentWave + 1;
  const stage = findStageById(state.stageId);
  if (!stage || nextWaveIndex >= stage.waves.length) {
    // 모든 웨이브 클리어 → 적 기지에 데미지
    return {
      ...state,
      enemyBaseHP: 0,
      log: [...state.log, '모든 웨이브 클리어! 승리!'],
    };
  }

  // 다음 웨이브 적 생성
  const nextWave = stage.waves[nextWaveIndex];
  const newEnemies = createWaveEnemies(nextWave, nextWaveIndex + 1);

  return {
    ...state,
    currentWave: nextWaveIndex,
    pendingEnemies: newEnemies,
    spawnTimer: 0,
    log: [...state.log, `웨이브 ${nextWaveIndex + 1} 시작!`],
  };
};

// ===== 메인 틱 함수 =====

/** 전투 1틱 업데이트 (순수 함수) */
export const battleTick = (state: BattleState, dt: number): BattleState => {
  // 이미 결과가 나왔으면 변경 없음
  if (state.result) return state;

  // 1. 마나 회복
  const newMana = Math.min(state.maxMana, state.mana + state.manaRegen * dt);

  // 2. 적 스폰
  const stage = findStageById(state.stageId);
  const currentWaveData = stage?.waves[state.currentWave];
  const spawnInterval = currentWaveData?.spawnInterval ?? 1.5;
  const spawnResult = spawnPendingEnemies(state, dt, spawnInterval);

  // 3. 아군 유닛 업데이트
  let allyDamageEvents: Array<{ targetId: string; damage: number }> = [];
  const updatedAllies = state.allies
    .filter(u => u.hp > 0)
    .map(unit => {
      const result = updateUnit(unit, spawnResult.enemies.filter(e => e.hp > 0), dt);
      allyDamageEvents = [...allyDamageEvents, ...result.damageEvents];
      return result.unit;
    });

  // 4. 적 유닛 업데이트
  let enemyDamageEvents: Array<{ targetId: string; damage: number }> = [];
  const updatedEnemies = spawnResult.enemies
    .filter(u => u.hp > 0)
    .map(unit => {
      const result = updateUnit(unit, updatedAllies.filter(a => a.hp > 0), dt);
      enemyDamageEvents = [...enemyDamageEvents, ...result.damageEvents];
      return result.unit;
    });

  // 5. 데미지 적용
  const alliesAfterDmg = applyDamageEvents(updatedAllies, enemyDamageEvents);
  const enemiesAfterDmg = applyDamageEvents(updatedEnemies, allyDamageEvents);

  // 6. 힐러 처리
  const alliesAfterHeal = applyHealing(processHealing(alliesAfterDmg, dt));

  // 7. 기지 공격
  const allyBaseDmg = checkBaseAttack(enemiesAfterDmg, true, dt);
  const enemyBaseDmg = checkBaseAttack(alliesAfterHeal, false, dt);
  const newBaseHP = Math.max(0, state.baseHP - allyBaseDmg);
  const newEnemyBaseHP = Math.max(0, state.enemyBaseHP - enemyBaseDmg);

  // 8. 상태 조합
  let newState: BattleState = {
    ...state,
    allies: alliesAfterHeal,
    enemies: enemiesAfterDmg,
    pendingEnemies: spawnResult.pendingEnemies,
    baseHP: newBaseHP,
    enemyBaseHP: newEnemyBaseHP,
    mana: newMana,
    timer: state.timer + dt,
    spawnTimer: spawnResult.spawnTimer,
  };

  // 9. 승리/패배 체크
  const result = checkResult(newState);
  if (result) {
    return { ...newState, result };
  }

  // 10. 다음 웨이브 체크
  newState = checkNextWave(newState);

  return newState;
};

// ===== 유닛 소환 =====

/** 유닛 소환 (마나 소비) */
export const summonUnit = (
  state: BattleState,
  cardId: string,
  cardLevel: number,
): BattleState => {
  if (state.result) return state;

  const card = findCardById(cardId);
  if (!card) return state;

  const manaCost = card.cost * 3;
  if (state.mana < manaCost) return state;

  const unit = createBattleUnit(card, cardLevel, true);

  return {
    ...state,
    allies: [...state.allies, unit],
    mana: state.mana - manaCost,
    log: [...state.log, `${card.name} 소환! (마나 -${manaCost})`],
  };
};

/** 소환 가능 여부 체크 */
export const canSummon = (state: BattleState, cardId: string): boolean => {
  const card = findCardById(cardId);
  if (!card) return false;
  return state.mana >= card.cost * 3;
};

/** 소환 코스트 조회 */
export const getSummonCost = (cardId: string): number => {
  const card = findCardById(cardId);
  return card ? card.cost * 3 : 0;
};
