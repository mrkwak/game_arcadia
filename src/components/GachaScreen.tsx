import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { getGradeInfo } from '../data/cards';
import { BANNERS, pull, pull10 } from '../systems/gacha';
import { playGachaPull, playGachaHighGrade, playGachaNormalGrade } from '../systems/sound';
import type { PullResult, Pull10Result } from '../types';
import './styles.css';

export const GachaScreen = () => {
  const store = usePlayerStore();
  const { gold, ticket, crystal, setScreen } = store;
  const [result, setResult] = useState<PullResult | null>(null);
  const [result10, setResult10] = useState<Pull10Result | null>(null);
  const [animating, setAnimating] = useState(false);

  const handlePull = (bannerType: string) => {
    setResult10(null);
    setAnimating(true);
    playGachaPull();
    setTimeout(() => {
      const res = pull(
        bannerType,
        store.hasResource,
        store.spendResource,
        store.addCard,
        store.pityCount[bannerType] ?? 0,
        () => store.incrementPity(bannerType),
        () => store.resetPity(bannerType),
        store.getCardCount,
      );
      setResult(res);
      setAnimating(false);
      if (res.ok && res.grade && res.grade >= 3) playGachaHighGrade();
      else if (res.ok) playGachaNormalGrade();
    }, 500);
  };

  const handlePull10 = (bannerType: string) => {
    setResult(null);
    setAnimating(true);
    playGachaPull();
    setTimeout(() => {
      const res = pull10(
        bannerType,
        store.hasResource,
        store.spendResource,
        store.addCard,
        store.pityCount[bannerType] ?? 0,
        (count) => {
          // setPity 구현: reset 후 increment로 맞춤
          store.resetPity(bannerType);
          for (let i = 0; i < count; i++) store.incrementPity(bannerType);
        },
        store.getCardCount,
      );
      setResult10(res);
      setAnimating(false);
      if (res.ok && res.cards?.some(c => c.grade >= 3)) playGachaHighGrade();
      else if (res.ok) playGachaNormalGrade();
    }, 800);
  };

  return (
    <div className="screen gacha-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setScreen('main')}>← 돌아가기</button>
        <h2>🎰 뽑기</h2>
      </div>

      <div className="resource-bar">
        <span className="resource">💰 {gold}</span>
        <span className="resource">🎫 {ticket}</span>
        <span className="resource">💎 {crystal}</span>
      </div>

      {/* 배너 */}
      <div className="gacha-banners">
        {Object.entries(BANNERS).map(([type, banner]) => (
          <div key={type} className="banner-card">
            <h3>{banner.name}</h3>
            <div className="banner-buttons">
              <button
                className="gacha-btn"
                onClick={() => handlePull(type)}
                disabled={animating}
              >
                1회 ({banner.cost.amount} {banner.cost.currency === 'gold' ? '💰' : banner.cost.currency === 'ticket' ? '🎫' : '💎'})
              </button>
              <button
                className="gacha-btn gacha-btn-10"
                onClick={() => handlePull10(type)}
                disabled={animating}
              >
                10연차 ({banner.cost10.amount} {banner.cost10.currency === 'gold' ? '💰' : banner.cost10.currency === 'ticket' ? '🎫' : '💎'})
              </button>
            </div>
            <div className="pity-info">
              천장: {store.pityCount[type] ?? 0}/{banner.pity.count}
            </div>
          </div>
        ))}
      </div>

      {/* 결과 */}
      {animating && <div className="gacha-animating">✨ 뽑는 중... ✨</div>}

      {result && result.ok && result.card && (
        <div className="gacha-result single">
          <h3>뽑기 결과!</h3>
          <div
            className="result-card"
            style={{ borderColor: getGradeInfo(result.grade!).color }}
          >
            <div className="result-emoji">{result.card.emoji}</div>
            <div className="result-name">{result.card.name}</div>
            <div className="result-grade" style={{ color: getGradeInfo(result.grade!).color }}>
              {getGradeInfo(result.grade!).stars}
            </div>
            <div className="result-role">{result.card.role}</div>
            {result.isNew && <div className="result-new">NEW!</div>}
          </div>
        </div>
      )}

      {result && !result.ok && (
        <div className="gacha-result error">{result.msg}</div>
      )}

      {result10 && result10.ok && result10.cards && (
        <div className="gacha-result multi">
          <h3>10연차 결과!</h3>
          <div className="result-grid">
            {result10.cards.map((c, i) => {
              const grade = getGradeInfo(c.grade);
              return (
                <div key={i} className="result-card-mini" style={{ borderColor: grade.color }}>
                  <span className="mini-emoji">{c.card.emoji}</span>
                  <span className="mini-name">{c.card.name}</span>
                  <span className="mini-grade" style={{ color: grade.color }}>{grade.stars}</span>
                  {c.isNew && <span className="mini-new">NEW</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result10 && !result10.ok && (
        <div className="gacha-result error">{result10.msg}</div>
      )}
    </div>
  );
};
