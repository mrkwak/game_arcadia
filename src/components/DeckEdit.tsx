import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { findCardById, getGradeInfo } from '../data/cards';
import './styles.css';

export const DeckEdit = () => {
  const {
    decks, activeDeck, inventory,
    setActiveDeck, addToDeck, removeFromDeck, setScreen,
  } = usePlayerStore();

  const [selectedDeck, setSelectedDeck] = useState(activeDeck);
  const deck = decks[selectedDeck];

  const allOwnedCards = Object.entries(inventory)
    .map(([id, owned]) => ({ id, ...owned, data: findCardById(id) }))
    .filter(c => c.data)
    .sort((a, b) => (b.data!.grade - a.data!.grade));

  const deckCards = deck.cards
    .map(id => ({ id, data: findCardById(id) }))
    .filter(c => c.data);

  const availableCards = allOwnedCards.filter(
    c => !deck.cards.includes(c.id)
  );

  const handleAddCard = (cardId: string) => {
    addToDeck(selectedDeck, cardId);
  };

  const handleRemoveCard = (cardId: string) => {
    removeFromDeck(selectedDeck, cardId);
  };

  const handleSetActive = () => {
    setActiveDeck(selectedDeck);
  };

  return (
    <div className="screen deck-edit-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setScreen('main')}>← 돌아가기</button>
        <h2>🃏 덱 관리</h2>
      </div>

      {/* 덱 탭 */}
      <div className="deck-tabs">
        {decks.map((d, i) => (
          <button
            key={i}
            className={`deck-tab ${i === selectedDeck ? 'active' : ''} ${i === activeDeck ? 'is-active-deck' : ''}`}
            onClick={() => setSelectedDeck(i)}
          >
            {d.name} ({d.cards.length}/5)
            {i === activeDeck && ' ✓'}
          </button>
        ))}
      </div>

      {selectedDeck !== activeDeck && (
        <button className="set-active-btn" onClick={handleSetActive}>
          이 덱을 전투용으로 선택
        </button>
      )}

      {/* 현재 덱 카드 */}
      <div className="deck-section">
        <h3>현재 덱 ({deckCards.length}/5)</h3>
        <div className="deck-slots">
          {deckCards.map(({ id, data }) => {
            const grade = getGradeInfo(data!.grade);
            return (
              <div key={id} className="deck-card" style={{ borderColor: grade.color }}>
                <span className="deck-card-emoji">{data!.emoji}</span>
                <span className="deck-card-name">{data!.name}</span>
                <span className="deck-card-cost">코스트: {data!.cost}</span>
                <button className="remove-btn" onClick={() => handleRemoveCard(id)}>✕</button>
              </div>
            );
          })}
          {Array.from({ length: 5 - deckCards.length }).map((_, i) => (
            <div key={`empty-${i}`} className="deck-card empty">
              <span>빈 슬롯</span>
            </div>
          ))}
        </div>
      </div>

      {/* 보유 카드 */}
      <div className="deck-section">
        <h3>보유 카드</h3>
        <div className="available-cards">
          {availableCards.map(({ id, data }) => {
            const grade = getGradeInfo(data!.grade);
            return (
              <button
                key={id}
                className="available-card"
                style={{ borderColor: grade.color }}
                onClick={() => handleAddCard(id)}
                disabled={deck.cards.length >= 5}
              >
                <span>{data!.emoji}</span>
                <span>{data!.name}</span>
                <span style={{ color: grade.color }}>{grade.stars}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
