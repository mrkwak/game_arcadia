// ===== 카드 관련 타입 =====

export type CardType = 'unit' | 'monster';
export type CardRole = 'melee' | 'ranged' | 'mage' | 'tank' | 'support' | 'assassin';
export type Grade = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  readonly name: string;
  readonly damage?: number;
  readonly heal?: number;
  readonly aoe?: boolean;
  readonly cooldown: number;
  readonly hits?: number;
}

export interface CardData {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly type: CardType;
  readonly grade: Grade;
  readonly role: CardRole;
  readonly baseHP: number;
  readonly baseATK: number;
  readonly baseDEF: number;
  readonly atkSpeed: number;
  readonly range: number;
  readonly cost: number;
  readonly skill?: Skill;
}

export interface GradeInfo {
  readonly label: string;
  readonly color: string;
  readonly stars: string;
}

// ===== 플레이어 관련 타입 =====

export interface OwnedCard {
  readonly level: number;
  readonly count: number;
}

export interface Deck {
  readonly name: string;
  readonly cards: readonly string[];
}

export interface PlayerState {
  readonly playerName: string;
  readonly level: number;
  readonly exp: number;
  readonly expToNext: number;
  readonly gold: number;
  readonly ticket: number;
  readonly crystal: number;
  readonly inventory: Record<string, OwnedCard>;
  readonly decks: Deck[];
  readonly activeDeck: number;
  readonly clearedStages: Record<string, { stars: number }>;
  readonly pityCount: Record<string, number>;
}

// ===== 스테이지 관련 타입 =====

export interface EnemyGroup {
  readonly id: string;
  readonly count: number;
}

export interface Wave {
  readonly enemies: readonly EnemyGroup[];
  readonly spawnInterval: number;
  readonly isBoss?: boolean;
}

export interface StageData {
  readonly id: string;
  readonly name: string;
  readonly chapter: number;
  readonly order: number;
  readonly stamina: number;
  readonly expReward: number;
  readonly goldReward: number;
  readonly waves: readonly Wave[];
}

export interface ChapterData {
  readonly id: number;
  readonly name: string;
  readonly stages: readonly StageData[];
}

// ===== 전투 관련 타입 =====

export interface BattleUnit {
  id: string;
  name: string;
  emoji: string;
  cardId: string;
  hp: number;
  maxHP: number;
  atk: number;
  def: number;
  atkSpeed: number;
  range: number;
  pos: number;
  atkTimer: number;
  skill?: Skill;
  skillTimer: number;
  level: number;
  isBoss: boolean;
  isAlly: boolean;
}

export interface BattleState {
  stageId: string;
  currentWave: number;
  totalWaves: number;
  allies: BattleUnit[];
  enemies: BattleUnit[];
  pendingEnemies: BattleUnit[];
  baseHP: number;
  maxBaseHP: number;
  enemyBaseHP: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  timer: number;
  spawnTimer: number;
  result: BattleResult | null;
  log: string[];
}

export interface BattleResult {
  readonly victory: boolean;
  readonly stars: number;
}

// ===== 가챠 관련 타입 =====

export interface BannerCost {
  readonly currency: 'gold' | 'ticket' | 'crystal';
  readonly amount: number;
}

export interface BannerData {
  readonly name: string;
  readonly cost: BannerCost;
  readonly cost10: BannerCost;
  readonly rates: Record<number, number>;
  readonly pity: { readonly count: number; readonly minGrade: Grade };
}

export interface PullResult {
  readonly ok: boolean;
  readonly card?: CardData;
  readonly grade?: Grade;
  readonly isNew?: boolean;
  readonly msg?: string;
}

export interface Pull10Result {
  readonly ok: boolean;
  readonly cards?: Array<{ card: CardData; grade: Grade; isNew: boolean }>;
  readonly msg?: string;
}

// ===== 스프라이트/애니메이션 타입 =====

export type AnimationState = 'idle' | 'walk' | 'attack' | 'hit' | 'death';

export interface SpriteFrameConfig {
  readonly row: number;
  readonly frameCount: number;
}

export interface SpriteSheetConfig {
  readonly src: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly animations: Record<AnimationState, SpriteFrameConfig>;
}

export interface UnitAnimationState {
  current: AnimationState;
  frameIndex: number;
  frameTimer: number;
  oneShot: boolean;
  finished: boolean;
}

// ===== 화면 타입 =====

export type Screen =
  | 'main'
  | 'cards'
  | 'deck'
  | 'stage'
  | 'battle'
  | 'gacha'
  | 'enhance'
  | 'result';
