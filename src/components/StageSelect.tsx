import { usePlayerStore } from '../store/playerStore';
import { getChapters, isStageUnlocked } from '../data/stages';
import './styles.css';

interface StageSelectProps {
  onStartBattle: (stageId: string) => void;
}

export const StageSelect = ({ onStartBattle }: StageSelectProps) => {
  const { clearedStages, setScreen } = usePlayerStore();
  const chapters = getChapters();

  return (
    <div className="screen stage-select-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setScreen('main')}>← 돌아가기</button>
        <h2>⚔️ 스테이지 선택</h2>
      </div>

      {chapters.map(chapter => (
        <div key={chapter.id} className="chapter">
          <h3 className="chapter-title">챕터 {chapter.id}: {chapter.name}</h3>
          <div className="stage-list">
            {chapter.stages.map(stage => {
              const unlocked = isStageUnlocked(stage.id, clearedStages);
              const cleared = clearedStages[stage.id];
              const stars = cleared?.stars ?? 0;

              return (
                <button
                  key={stage.id}
                  className={`stage-btn ${unlocked ? 'unlocked' : 'locked'} ${cleared ? 'cleared' : ''}`}
                  onClick={() => unlocked && onStartBattle(stage.id)}
                  disabled={!unlocked}
                >
                  <div className="stage-id">{stage.id}</div>
                  <div className="stage-name">{stage.name}</div>
                  <div className="stage-waves">웨이브: {stage.waves.length}</div>
                  {cleared ? (
                    <div className="stage-stars">
                      {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                    </div>
                  ) : unlocked ? (
                    <div className="stage-new">NEW</div>
                  ) : (
                    <div className="stage-locked">🔒</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
