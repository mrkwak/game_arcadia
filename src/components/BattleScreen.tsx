import { useRef, useEffect, useState, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { findCardById, getGradeInfo } from '../data/cards';
import { findStageById } from '../data/stages';
import {
  createBattleState,
  battleTick,
  summonUnit,
  canSummon,
  getSummonCost,
} from '../systems/battleEngine';
import { renderBattle, CANVAS_HEIGHT, resetParticles } from '../canvas/BattleRenderer';
import { preloadAllSprites } from '../canvas/SpriteLoader';
import { playSummon, playVictory, playDefeat, playWaveStart } from '../systems/sound';
import type { BattleState, BattleResult } from '../types';
import './styles.css';

interface BattleScreenProps {
  stageId: string;
  onBattleEnd: (result: BattleResult, stageId: string) => void;
  onRetreat: () => void;
}

export const BattleScreen = ({ stageId, onBattleEnd, onRetreat }: BattleScreenProps) => {
  const { decks, activeDeck, inventory } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const battleStateRef = useRef<BattleState | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [currentState, setCurrentState] = useState<BattleState | null>(null);
  const resultHandledRef = useRef(false);
  const prevWaveRef = useRef(0);

  const deck = decks[activeDeck];
  const stage = findStageById(stageId);

  const [spritesReady, setSpritesReady] = useState(false);

  /** 스프라이트 프리로드 */
  useEffect(() => {
    preloadAllSprites().then(() => setSpritesReady(true));
  }, []);

  /** 전투 상태 초기화 */
  useEffect(() => {
    const cardLevels: Record<string, number> = {};
    deck.cards.forEach(id => {
      cardLevels[id] = inventory[id]?.level ?? 1;
    });

    resetParticles();
    const initialState = createBattleState(stageId, deck.cards, cardLevels);
    if (initialState) {
      battleStateRef.current = initialState;
      setCurrentState(initialState);
    }
  }, [stageId, deck.cards, inventory]);

  /** 게임 루프 */
  useEffect(() => {
    if (!battleStateRef.current) return;

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;

      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // dt 제한 (탭 비활성화 시 큰 dt 방지)
      const dt = Math.min(rawDt, 0.1) * (isPaused ? 0 : speed);

      if (battleStateRef.current && dt > 0) {
        battleStateRef.current = battleTick(battleStateRef.current, dt);

        // 웨이브 변경 감지
        if (battleStateRef.current.currentWave !== prevWaveRef.current) {
          prevWaveRef.current = battleStateRef.current.currentWave;
          playWaveStart();
        }

        // React 상태 업데이트 (throttle: 60fps → 매 프레임)
        setCurrentState({ ...battleStateRef.current });

        // 캔버스 렌더링
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            renderBattle(ctx, battleStateRef.current, canvas.width);
          }
        }

        // 결과 확인: 최종 프레임 렌더링 후 3초 뒤 결과 화면 이동
        if (battleStateRef.current.result && !resultHandledRef.current) {
          resultHandledRef.current = true;
          if (battleStateRef.current.result.victory) playVictory();
          else playDefeat();
          // 결과 오버레이가 보이는 상태에서 마지막 렌더링
          const finalCanvas = canvasRef.current;
          if (finalCanvas) {
            const finalCtx = finalCanvas.getContext('2d');
            if (finalCtx) {
              renderBattle(finalCtx, battleStateRef.current, finalCanvas.width);
            }
          }
          setTimeout(() => {
            if (battleStateRef.current?.result) {
              onBattleEnd(battleStateRef.current.result, stageId);
            }
          }, 3000);
          return; // 루프 중단
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPaused, speed, stageId, onBattleEnd]);

  /** 유닛 소환 핸들러 */
  const handleSummon = useCallback((cardId: string) => {
    if (!battleStateRef.current) return;
    const level = inventory[cardId]?.level ?? 1;
    const prevMana = battleStateRef.current.mana;
    battleStateRef.current = summonUnit(battleStateRef.current, cardId, level);
    if (battleStateRef.current.mana < prevMana) {
      playSummon();
    }
    setCurrentState({ ...battleStateRef.current });
  }, [inventory]);

  if (!stage) {
    return <div className="screen"><div className="empty-message">스테이지를 찾을 수 없습니다</div></div>;
  }

  return (
    <div className="screen battle-screen">
      {/* 상단 정보 */}
      <div className="battle-header">
        <button className="back-btn" onClick={onRetreat}>포기</button>
        <h2>{stage.name}</h2>
        <div className="battle-controls">
          <button
            className={`speed-btn ${isPaused ? 'active' : ''}`}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            className={`speed-btn ${speed === 2 ? 'active' : ''}`}
            onClick={() => setSpeed(speed === 1 ? 2 : 1)}
          >
            {speed}x
          </button>
        </div>
      </div>

      {/* 캔버스 (전투 필드) */}
      <canvas
        ref={canvasRef}
        width={440}
        height={CANVAS_HEIGHT}
        className="battle-canvas"
      />

      {/* 전투 로그 (최근 1줄) */}
      {currentState && currentState.log.length > 0 && (
        <div className="battle-log">
          {currentState.log[currentState.log.length - 1]}
        </div>
      )}

      {/* 소환 카드 슬롯 */}
      <div className="summon-slots">
        {deck.cards.map(cardId => {
          const card = findCardById(cardId);
          if (!card) return null;

          const grade = getGradeInfo(card.grade);
          const cost = getSummonCost(cardId);
          const affordable = currentState ? canSummon(currentState, cardId) : false;

          return (
            <button
              key={cardId}
              className={`summon-card ${affordable ? 'affordable' : 'expensive'}`}
              style={{ borderColor: grade.color }}
              onClick={() => handleSummon(cardId)}
              disabled={!affordable || !!currentState?.result}
            >
              <span className="summon-emoji">{card.emoji}</span>
              <span className="summon-name">{card.name}</span>
              <span className="summon-cost">💧{cost}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
