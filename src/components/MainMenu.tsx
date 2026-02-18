import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { toggleMute, getMuted, playClick } from '../systems/sound';
import type { Screen } from '../types';
import './styles.css';

const MENU_BUTTONS: Array<{ screen: Screen; label: string; emoji: string }> = [
  { screen: 'stage', label: '출전', emoji: '⚔️' },
  { screen: 'gacha', label: '뽑기', emoji: '🎰' },
  { screen: 'cards', label: '카드목록', emoji: '📋' },
  { screen: 'deck', label: '덱 관리', emoji: '🃏' },
  { screen: 'enhance', label: '강화', emoji: '⬆️' },
];

export const MainMenu = () => {
  const { playerName, level, exp, expToNext, gold, ticket, crystal, inventory, setScreen, resetGame } = usePlayerStore();
  const cardCount = Object.keys(inventory).length;
  const [muted, setMuted] = useState(getMuted());
  const [showReset, setShowReset] = useState(false);

  const handleMute = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

  const handleReset = () => {
    if (showReset) {
      resetGame();
      setShowReset(false);
    } else {
      setShowReset(true);
    }
  };

  return (
    <div className="screen main-menu">
      <h1 className="game-title">🏰 아르카디아 디펜더즈</h1>

      <div className="player-info">
        <span className="player-name">{playerName}</span>
        <span className="player-level">Lv.{level}</span>
        <div className="exp-bar">
          <div className="exp-fill" style={{ width: `${(exp / expToNext) * 100}%` }} />
          <span className="exp-text">{exp}/{expToNext}</span>
        </div>
      </div>

      <div className="resource-bar">
        <span className="resource">💰 {gold}</span>
        <span className="resource">🎫 {ticket}</span>
        <span className="resource">💎 {crystal}</span>
        <span className="resource">🃏 {cardCount}장</span>
      </div>

      <div className="menu-buttons">
        {MENU_BUTTONS.map(({ screen, label, emoji }) => (
          <button
            key={screen}
            className="menu-btn"
            onClick={() => { playClick(); setScreen(screen); }}
          >
            <span className="btn-emoji">{emoji}</span>
            <span className="btn-label">{label}</span>
          </button>
        ))}
      </div>

      {/* 하단 설정 */}
      <div className="settings-bar">
        <button className="settings-btn" onClick={handleMute}>
          {muted ? '🔇 음소거' : '🔊 사운드'}
        </button>
        <button
          className={`settings-btn ${showReset ? 'danger' : ''}`}
          onClick={handleReset}
        >
          {showReset ? '⚠️ 정말 리셋?' : '🔄 데이터 리셋'}
        </button>
        {showReset && (
          <button className="settings-btn" onClick={() => setShowReset(false)}>
            취소
          </button>
        )}
      </div>
    </div>
  );
};
