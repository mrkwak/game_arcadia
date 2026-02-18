import { usePlayerStore } from './store/playerStore';
import { MainMenu } from './components/MainMenu';
import { CardList } from './components/CardList';
import { DeckEdit } from './components/DeckEdit';
import { GachaScreen } from './components/GachaScreen';
import { StageSelect } from './components/StageSelect';
import { BattleScreen } from './components/BattleScreen';
import { ResultScreen } from './components/ResultScreen';
import { EnhanceScreen } from './components/EnhanceScreen';
import type { Screen, BattleResult } from './types';
import { useEffect, useState, useCallback } from 'react';

/** 화면 라우터: screen 상태에 따라 적절한 컴포넌트 렌더링 */
const ScreenRouter = ({ screen }: { screen: Screen }) => {
  const { setScreen } = usePlayerStore();

  /** 전투 관련 상태 (라우터 레벨에서 관리) */
  const [battleStageId, setBattleStageId] = useState<string>('');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

  /** 전투 시작 핸들러 */
  const handleStartBattle = useCallback((stageId: string) => {
    setBattleStageId(stageId);
    setBattleResult(null);
    setScreen('battle');
  }, [setScreen]);

  /** 전투 종료 핸들러 */
  const handleBattleEnd = useCallback((result: BattleResult, stageId: string) => {
    setBattleStageId(stageId);
    setBattleResult(result);
    setScreen('result');
  }, [setScreen]);

  /** 전투 포기 핸들러 */
  const handleRetreat = useCallback(() => {
    setScreen('stage');
  }, [setScreen]);

  /** 결과 확인 핸들러 */
  const handleResultConfirm = useCallback(() => {
    setScreen('main');
  }, [setScreen]);

  /** 재도전 핸들러 */
  const handleRetry = useCallback(() => {
    setBattleResult(null);
    setScreen('battle');
  }, [setScreen]);

  switch (screen) {
    case 'main':
      return <MainMenu />;
    case 'cards':
      return <CardList />;
    case 'deck':
      return <DeckEdit />;
    case 'gacha':
      return <GachaScreen />;
    case 'stage':
      return <StageSelect onStartBattle={handleStartBattle} />;
    case 'battle':
      return battleStageId ? (
        <BattleScreen
          stageId={battleStageId}
          onBattleEnd={handleBattleEnd}
          onRetreat={handleRetreat}
        />
      ) : (
        <MainMenu />
      );
    case 'result':
      return battleResult ? (
        <ResultScreen
          stageId={battleStageId}
          result={battleResult}
          onConfirm={handleResultConfirm}
          onRetry={handleRetry}
        />
      ) : (
        <MainMenu />
      );
    case 'enhance':
      return <EnhanceScreen />;
    default:
      return <MainMenu />;
  }
};

const App = () => {
  const { screen, loadGame, saveGame } = usePlayerStore();

  /** 앱 시작 시 세이브 로드 */
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  /** 화면 전환 시 자동 저장 (전투 중 제외) */
  useEffect(() => {
    if (screen !== 'battle') {
      saveGame();
    }
  }, [screen, saveGame]);

  return (
    <div className="app-container">
      <ScreenRouter screen={screen} />
    </div>
  );
};

export default App;
