import { create } from 'zustand';
import type { PlayerState, Deck, OwnedCard, Screen } from '../types';

const MAX_DECK_SIZE = 5;
const MAX_DECKS = 5;
const INITIAL_DECK_CARDS = ['warrior_basic', 'archer_basic', 'mage_basic', 'snail', 'boar'];

/** 초기 인벤토리 (시작 카드) */
const initialInventory: Record<string, OwnedCard> = {
  warrior_basic: { level: 1, count: 1 },
  archer_basic: { level: 1, count: 1 },
  mage_basic: { level: 1, count: 1 },
  snail: { level: 1, count: 1 },
  boar: { level: 1, count: 1 },
};

/** 초기 덱 */
const initialDecks: Deck[] = Array.from({ length: MAX_DECKS }, (_, i) => ({
  name: `덱 ${i + 1}`,
  cards: i === 0 ? INITIAL_DECK_CARDS : [],
}));

interface GameStore extends PlayerState {
  screen: Screen;
  setScreen: (screen: Screen) => void;

  // 자원 관리
  hasResource: (currency: string, amount: number) => boolean;
  spendResource: (currency: string, amount: number) => void;
  addResource: (currency: string, amount: number) => void;

  // 카드 관리
  addCard: (cardId: string) => void;
  removeCard: (cardId: string, count?: number) => void;
  hasCard: (cardId: string) => boolean;
  getCardCount: (cardId: string) => number;
  upgradeCard: (cardId: string) => void;

  // 덱 관리
  addToDeck: (deckIndex: number, cardId: string) => boolean;
  removeFromDeck: (deckIndex: number, cardId: string) => boolean;
  setActiveDeck: (index: number) => void;

  // 경험치/레벨
  addExp: (amount: number) => void;

  // 스테이지
  clearStage: (stageId: string, stars: number) => void;

  // 천장
  incrementPity: (bannerType: string) => void;
  resetPity: (bannerType: string) => void;

  // 세이브/로드
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
}

export const usePlayerStore = create<GameStore>((set, get) => ({
  // 초기 상태
  playerName: '소환사',
  level: 1,
  exp: 0,
  expToNext: 100,
  gold: 1000,
  ticket: 5,
  crystal: 100,
  inventory: { ...initialInventory },
  decks: initialDecks,
  activeDeck: 0,
  clearedStages: {},
  pityCount: {},
  screen: 'main',

  setScreen: (screen) => set({ screen }),

  // ===== 자원 관리 =====
  hasResource: (currency, amount) => {
    const state = get();
    const current = (state as unknown as Record<string, unknown>)[currency] as number ?? 0;
    return current >= amount;
  },

  spendResource: (currency, amount) => set(state => {
    const current = (state as unknown as Record<string, unknown>)[currency] as number ?? 0;
    return { [currency]: current - amount } as Partial<GameStore>;
  }),

  addResource: (currency, amount) => set(state => {
    const current = (state as unknown as Record<string, unknown>)[currency] as number ?? 0;
    return { [currency]: current + amount } as Partial<GameStore>;
  }),

  // ===== 카드 관리 =====
  addCard: (cardId) => set(state => {
    const existing = state.inventory[cardId];
    return {
      inventory: {
        ...state.inventory,
        [cardId]: existing
          ? { ...existing, count: existing.count + 1 }
          : { level: 1, count: 1 },
      },
    };
  }),

  removeCard: (cardId, count = 1) => set(state => {
    const existing = state.inventory[cardId];
    if (!existing) return state;
    const newCount = existing.count - count;
    if (newCount <= 0) {
      const { [cardId]: _, ...rest } = state.inventory;
      return { inventory: rest };
    }
    return {
      inventory: {
        ...state.inventory,
        [cardId]: { ...existing, count: newCount },
      },
    };
  }),

  hasCard: (cardId) => cardId in get().inventory,

  getCardCount: (cardId) => get().inventory[cardId]?.count ?? 0,

  upgradeCard: (cardId) => set(state => {
    const existing = state.inventory[cardId];
    if (!existing) return state;
    return {
      inventory: {
        ...state.inventory,
        [cardId]: { ...existing, level: existing.level + 1 },
      },
    };
  }),

  // ===== 덱 관리 =====
  addToDeck: (deckIndex, cardId) => {
    const state = get();
    const deck = state.decks[deckIndex];
    if (!deck) return false;
    if (deck.cards.length >= MAX_DECK_SIZE) return false;
    if (deck.cards.includes(cardId)) return false;
    if (!state.inventory[cardId]) return false;

    set({
      decks: state.decks.map((d, i) =>
        i === deckIndex ? { ...d, cards: [...d.cards, cardId] } : d
      ),
    });
    return true;
  },

  removeFromDeck: (deckIndex, cardId) => {
    const state = get();
    const deck = state.decks[deckIndex];
    if (!deck || !deck.cards.includes(cardId)) return false;

    set({
      decks: state.decks.map((d, i) =>
        i === deckIndex
          ? { ...d, cards: d.cards.filter(id => id !== cardId) }
          : d
      ),
    });
    return true;
  },

  setActiveDeck: (index) => set({ activeDeck: index }),

  // ===== 경험치/레벨 =====
  addExp: (amount) => set(state => {
    let { exp, level, expToNext } = state;
    exp += amount;
    while (exp >= expToNext) {
      exp -= expToNext;
      level += 1;
      expToNext = Math.floor(100 * Math.pow(1.2, level - 1));
    }
    return { exp, level, expToNext };
  }),

  // ===== 스테이지 =====
  clearStage: (stageId, stars) => set(state => ({
    clearedStages: {
      ...state.clearedStages,
      [stageId]: {
        stars: Math.max(stars, state.clearedStages[stageId]?.stars ?? 0),
      },
    },
  })),

  // ===== 천장 =====
  incrementPity: (bannerType) => set(state => ({
    pityCount: {
      ...state.pityCount,
      [bannerType]: (state.pityCount[bannerType] ?? 0) + 1,
    },
  })),

  resetPity: (bannerType) => set(state => ({
    pityCount: { ...state.pityCount, [bannerType]: 0 },
  })),

  // ===== 세이브/로드 =====
  saveGame: () => {
    const state = get();
    const saveData = {
      playerName: state.playerName,
      level: state.level,
      exp: state.exp,
      expToNext: state.expToNext,
      gold: state.gold,
      ticket: state.ticket,
      crystal: state.crystal,
      inventory: state.inventory,
      decks: state.decks,
      activeDeck: state.activeDeck,
      clearedStages: state.clearedStages,
      pityCount: state.pityCount,
    };
    localStorage.setItem('arcadia-save', JSON.stringify(saveData));
  },

  loadGame: () => {
    const raw = localStorage.getItem('arcadia-save');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      set(data);
    } catch {
      console.error('세이브 데이터 로드 실패');
    }
  },

  resetGame: () => {
    localStorage.removeItem('arcadia-save');
    set({
      playerName: '소환사',
      level: 1,
      exp: 0,
      expToNext: 100,
      gold: 1000,
      ticket: 5,
      crystal: 100,
      inventory: { ...initialInventory },
      decks: initialDecks,
      activeDeck: 0,
      clearedStages: {},
      pityCount: {},
      screen: 'main',
    });
  },
}));
