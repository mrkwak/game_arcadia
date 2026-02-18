import { usePlayerStore } from '../store/playerStore';
import { findCardById, getGradeInfo } from '../data/cards';
import './styles.css';

export const CardList = () => {
  const { inventory, setScreen } = usePlayerStore();

  const cards = Object.entries(inventory)
    .map(([id, owned]) => {
      const data = findCardById(id);
      if (!data) return null;
      return { ...data, ...owned };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.grade - a!.grade) || a!.name.localeCompare(b!.name));

  return (
    <div className="screen card-list-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setScreen('main')}>← 돌아가기</button>
        <h2>📋 카드 목록 ({cards.length}장)</h2>
      </div>
      <div className="card-grid">
        {cards.map(card => {
          if (!card) return null;
          const grade = getGradeInfo(card.grade);
          return (
            <div
              key={card.id}
              className="card-item"
              style={{ borderColor: grade.color }}
            >
              <div className="card-emoji">{card.emoji}</div>
              <div className="card-name">{card.name}</div>
              <div className="card-grade" style={{ color: grade.color }}>{grade.stars}</div>
              <div className="card-info">
                <span>Lv.{card.level}</span>
                <span>x{card.count}</span>
              </div>
              <div className="card-stats">
                <span>❤️{card.baseHP}</span>
                <span>⚔️{card.baseATK}</span>
                <span>🛡️{card.baseDEF}</span>
              </div>
              <div className="card-role">{card.role}</div>
            </div>
          );
        })}
      </div>
      {cards.length === 0 && (
        <div className="empty-message">카드가 없습니다! 뽑기를 해보세요!</div>
      )}
    </div>
  );
};
