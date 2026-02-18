import { useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { findStageById, calculateRewards } from '../data/stages';
import { playCoin } from '../systems/sound';
import type { BattleResult } from '../types';
import './styles.css';

interface ResultScreenProps {
  stageId: string;
  result: BattleResult;
  onConfirm: () => void;
  onRetry: () => void;
}

export const ResultScreen = ({ stageId, result, onConfirm, onRetry }: ResultScreenProps) => {
  const { addExp, addResource, clearStage } = usePlayerStore();
  const stage = findStageById(stageId);
  const rewardedRef = useRef(false);

  /** 보상 계산 */
  const rewards = result.victory ? calculateRewards(stageId, result.stars) : null;

  /** 보상 수령 (한 번만 실행) */
  const handleConfirm = () => {
    if (result.victory && rewards && !rewardedRef.current) {
      rewardedRef.current = true;
      addExp(rewards.exp);
      addResource('gold', rewards.gold);
      clearStage(stageId, result.stars);
      playCoin();
    }
    onConfirm();
  };

  /** 재도전 */
  const handleRetry = () => {
    if (result.victory && rewards && !rewardedRef.current) {
      rewardedRef.current = true;
      addExp(rewards.exp);
      addResource('gold', rewards.gold);
      clearStage(stageId, result.stars);
      playCoin();
    }
    onRetry();
  };

  return (
    <div className="screen result-screen">
      {/* 결과 헤더 */}
      <div className={`result-banner ${result.victory ? 'victory' : 'defeat'}`}>
        <h1 className="result-title">
          {result.victory ? '🎉 승리!' : '💀 패배...'}
        </h1>
        {result.victory && (
          <div className="result-stars-display">
            {'★'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}
          </div>
        )}
      </div>

      {/* 스테이지 정보 */}
      <div className="result-stage-info">
        {stage && <span>{stage.id} - {stage.name}</span>}
      </div>

      {/* 보상 */}
      {result.victory && rewards && (
        <div className="result-rewards">
          <h3>획득 보상</h3>
          <div className="reward-items">
            <div className="reward-item">
              <span className="reward-icon">✨</span>
              <span className="reward-label">경험치</span>
              <span className="reward-value">+{rewards.exp}</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">💰</span>
              <span className="reward-label">골드</span>
              <span className="reward-value">+{rewards.gold}</span>
            </div>
          </div>
        </div>
      )}

      {/* 패배 메시지 */}
      {!result.victory && (
        <div className="defeat-message">
          <p>덱을 강화하거나 전략을 바꿔보세요!</p>
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="result-buttons">
        <button className="result-confirm-btn" onClick={handleConfirm}>
          {result.victory ? '확인' : '돌아가기'}
        </button>
        <button className="result-retry-btn" onClick={handleRetry}>
          🔄 재도전
        </button>
      </div>
    </div>
  );
};
