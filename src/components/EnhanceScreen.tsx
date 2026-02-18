import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { findCardById, getGradeInfo } from '../data/cards';
import {
  canEnhance,
  executeEnhance,
  getUpgradeCardCost,
  getUpgradeGoldCost,
  getMaxLevel,
  getStatPreview,
} from '../systems/enhance';
import { playEnhanceSuccess, playEnhanceFail } from '../systems/sound';
import type { Grade } from '../types';
import './styles.css';

export const EnhanceScreen = () => {
  const {
    inventory, gold, setScreen,
    upgradeCard, removeCard, spendResource,
  } = usePlayerStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  /** 보유 카드 목록 (등급 높은 순) */
  const ownedCards = Object.entries(inventory)
    .map(([id, owned]) => ({ id, ...owned, data: findCardById(id) }))
    .filter(c => c.data)
    .sort((a, b) => (b.data!.grade - a.data!.grade) || a.data!.name.localeCompare(b.data!.name));

  const selected = selectedId
    ? { id: selectedId, owned: inventory[selectedId], data: findCardById(selectedId) }
    : null;

  /** 강화 실행 핸들러 */
  const handleEnhance = () => {
    if (!selected?.data || !selected.owned) return;

    const result = executeEnhance(
      selected.data.grade as Grade,
      selected.owned,
      gold,
    );

    if (!result.ok) {
      setMessage(result.msg ?? '강화 실패');
      playEnhanceFail();
      return;
    }

    // 스토어 업데이트
    upgradeCard(selected.id);
    removeCard(selected.id, result.cardCost!);
    spendResource('gold', result.goldCost!);
    setMessage(`🎉 ${selected.data.name} Lv.${result.newLevel} 강화 성공!`);
    playEnhanceSuccess();
  };

  return (
    <div className="screen enhance-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setScreen('main')}>← 돌아가기</button>
        <h2>⬆️ 강화</h2>
        <span className="resource" style={{ marginLeft: 'auto' }}>💰 {gold}</span>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`enhance-message ${message.includes('성공') ? 'success' : 'fail'}`}>
          {message}
        </div>
      )}

      {/* 선택된 카드 상세 */}
      {selected?.data && selected.owned && (
        <div className="enhance-detail">
          <div
            className="enhance-card-preview"
            style={{ borderColor: getGradeInfo(selected.data.grade).color }}
          >
            <div className="enhance-emoji">{selected.data.emoji}</div>
            <div className="enhance-name">{selected.data.name}</div>
            <div className="enhance-grade" style={{ color: getGradeInfo(selected.data.grade).color }}>
              {getGradeInfo(selected.data.grade).stars}
            </div>
            <div className="enhance-level">
              Lv.{selected.owned.level} / {getMaxLevel(selected.data.grade as Grade)}
            </div>
            <div className="enhance-count">보유: {selected.owned.count}장</div>
          </div>

          {/* 스탯 미리보기 */}
          <div className="enhance-stats-preview">
            <h4>스탯 변화</h4>
            {(['baseHP', 'baseATK', 'baseDEF'] as const).map(stat => {
              const preview = getStatPreview(
                selected.data![stat],
                selected.owned!.level,
              );
              const label = stat === 'baseHP' ? '❤️ HP' : stat === 'baseATK' ? '⚔️ ATK' : '🛡️ DEF';
              return (
                <div key={stat} className="stat-change">
                  <span className="stat-label">{label}</span>
                  <span className="stat-current">{preview.current}</span>
                  <span className="stat-arrow">→</span>
                  <span className="stat-next">{preview.next}</span>
                </div>
              );
            })}
          </div>

          {/* 강화 비용 */}
          <div className="enhance-cost-info">
            <div className="cost-row">
              <span>필요 카드:</span>
              <span>{getUpgradeCardCost(selected.data.grade as Grade)}장</span>
            </div>
            <div className="cost-row">
              <span>필요 골드:</span>
              <span>💰 {getUpgradeGoldCost(selected.data.grade as Grade, selected.owned.level)}</span>
            </div>
          </div>

          {/* 강화 버튼 */}
          {(() => {
            const check = canEnhance(selected.data.grade as Grade, selected.owned, gold);
            return (
              <button
                className={`enhance-btn ${check.ok ? 'ready' : 'disabled'}`}
                onClick={handleEnhance}
                disabled={!check.ok}
              >
                {check.ok ? '⬆️ 강화하기' : check.reason}
              </button>
            );
          })()}
        </div>
      )}

      {/* 카드 선택 그리드 */}
      <div className="enhance-section-title">카드 선택</div>
      <div className="enhance-card-grid">
        {ownedCards.map(({ id, data, level, count }) => {
          if (!data) return null;
          const grade = getGradeInfo(data.grade);
          const isSelected = id === selectedId;

          return (
            <button
              key={id}
              className={`enhance-card-item ${isSelected ? 'selected' : ''}`}
              style={{ borderColor: isSelected ? '#ff9800' : grade.color }}
              onClick={() => {
                setSelectedId(id);
                setMessage('');
              }}
            >
              <span className="enhance-item-emoji">{data.emoji}</span>
              <span className="enhance-item-name">{data.name}</span>
              <span className="enhance-item-info" style={{ color: grade.color }}>
                {grade.stars}
              </span>
              <span className="enhance-item-info">Lv.{level} x{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
