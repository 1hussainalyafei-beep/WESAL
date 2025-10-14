import { useState } from 'react';
import { LandingPage } from './components/Landing/LandingPage';
import { MainHome } from './components/Home/MainHome';
import { GameSequenceManager } from './components/Games/GameSequenceManager';
import { ImprovedMemoryGame } from './components/Games/ImprovedMemoryGame';
import { ImprovedAttentionGame } from './components/Games/ImprovedAttentionGame';
import { LogicGame } from './components/Games/LogicGame';
import { VisualGame } from './components/Games/VisualGame';
import { PatternGame } from './components/Games/PatternGame';
import { CreativeGame } from './components/Games/CreativeGame';
import { AssessmentPaths } from './components/Games/AssessmentPaths';
import { MiniReportAnimation } from './components/Analysis/MiniReportAnimation';
import { FinalReportAnimation } from './components/Analysis/FinalReportAnimation';
import { MiniReportScreen } from './components/Games/MiniReportScreen';
import { ReportsPage } from './components/Reports/ReportsPage';
import { ConsultationPage } from './components/Consultation/ConsultationPage';
import { StorePage } from './components/Store/StorePage';
import { AIAssistantPage } from './components/AIAssistant/AIAssistantPage';
import { storageService, type GameData } from './services/storageService';
import { MiniReportService } from './services/miniReportService';
import { FinalReportService } from './services/finalReportService';
import type { GameType } from './types';

type Screen =
  | 'landing'
  | 'home'
  | 'assessment-paths'
  | 'game-sequence'
  | 'game'
  | 'analyzing'
  | 'mini-report'
  | 'final-report-loading'
  | 'reports'
  | 'consultation'
  | 'store'
  | 'ai-assistant';

const ALL_GAMES: GameType[] = ['memory', 'attention', 'logic', 'visual', 'pattern', 'creative'];

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [currentGameName, setCurrentGameName] = useState('');
  const [completedGames, setCompletedGames] = useState<Set<GameType>>(new Set());
  const [currentMiniReport, setCurrentMiniReport] = useState<string | null>(null);
  const [currentGameScore, setCurrentGameScore] = useState<number>(0);
  const [pathType, setPathType] = useState<'single' | 'all'>('single');

  const handleGetStarted = () => {
    setCurrentScreen('home');
  };

  const handleNavigate = (section: string) => {
    if (section === 'assessment') {
      setCurrentScreen('assessment-paths');
    } else {
      setCurrentScreen(section as Screen);
    }
  };

  const handleSelectAssessmentPath = (path: 'single' | 'all' | 'view-reports') => {
    if (path === 'view-reports') {
      setCurrentScreen('reports');
      return;
    }

    setPathType(path);
    setCompletedGames(new Set());
    setCurrentScreen('game-sequence');
  };

  const handleGameSelect = (gameType: GameType) => {
    if (completedGames.has(gameType)) {
      console.log('اللعبة مكتملة بالفعل');
      return;
    }

    setSelectedGame(gameType);
    const gameNames: Record<GameType, string> = {
      memory: 'لعبة الذاكرة',
      attention: 'لعبة التركيز',
      logic: 'لعبة المنطق',
      visual: 'لعبة التفكير البصري',
      pattern: 'لعبة تمييز الأنماط',
      creative: 'لعبة الرسم الإبداعي',
    };
    setCurrentGameName(gameNames[gameType]);
    setCurrentScreen('game');
  };

  const handleGameComplete = async (gameData: any) => {
    if (!selectedGame) return;

    setCurrentScreen('analyzing');
    setCurrentGameScore(gameData.score || 50);

    try {
      console.log('🎮 جمع بيانات اللعبة:', gameData);

      const gameDataToSave: GameData = {
        id: `game_${Date.now()}`,
        gameType: selectedGame,
        score: gameData.score || 50,
        duration: gameData.duration || 0,
        clicks: gameData.clicks || 0,
        correctAnswers: gameData.correctAnswers || 0,
        wrongAnswers: gameData.wrongAnswers || 0,
        totalAttempts: gameData.totalAttempts || 1,
        timestamp: new Date().toISOString()
      };

      storageService.saveGameData(gameDataToSave);
      console.log('💾 تم حفظ بيانات اللعبة');

      console.log('🤖 إرسال البيانات إلى GPT للتحليل...');
      const analysis = await MiniReportService.generateAndSaveMiniReport(gameDataToSave);

      setCurrentMiniReport(analysis);
      setCompletedGames(prev => new Set([...prev, selectedGame]));

      setTimeout(() => {
        setCurrentScreen('mini-report');
      }, 3000);

    } catch (error) {
      console.error('❌ خطأ في معالجة إكمال اللعبة:', error);
      alert('حدث خطأ في التحليل. يرجى المحاولة مرة أخرى.');
      setCurrentScreen('game-sequence');
    }
  };

  const handleMiniReportNext = async () => {
    if (pathType === 'all' && completedGames.size < ALL_GAMES.length) {
      setSelectedGame(null);
      setCurrentMiniReport(null);
      setCurrentScreen('game-sequence');
    } else {
      await handleGenerateFinalReport();
    }
  };

  const handleMiniReportHome = () => {
    setSelectedGame(null);
    setCurrentMiniReport(null);
    setCurrentScreen('home');
  };

  const handleMiniReportReplay = () => {
    setCurrentMiniReport(null);
    setCurrentScreen('game');
  };

  const handleBackFromGame = () => {
    setSelectedGame(null);
    setCurrentScreen('game-sequence');
  };

  const handleGenerateFinalReport = async () => {
    setCurrentScreen('final-report-loading');

    try {
      console.log('📊 إنشاء التقرير الشامل...');
      await FinalReportService.generateAndSaveFinalReport(completedGames.size);
      console.log('✅ تم إنشاء التقرير الشامل بنجاح');

      setTimeout(() => {
        setCurrentScreen('reports');
      }, 3000);

    } catch (error) {
      console.error('❌ خطأ في إنشاء التقرير الشامل:', error);
      alert('حدث خطأ في إنشاء التقرير الشامل');
      setCurrentScreen('game-sequence');
    }
  };

  const renderGame = () => {
    const gameProps = {
      onComplete: handleGameComplete,
      onBack: handleBackFromGame,
      onSkip: handleBackFromGame,
    };

    switch (selectedGame) {
      case 'memory':
        return <ImprovedMemoryGame {...gameProps} />;
      case 'attention':
        return <ImprovedAttentionGame {...gameProps} />;
      case 'logic':
        return <LogicGame onComplete={handleGameComplete} />;
      case 'visual':
        return <VisualGame onComplete={handleGameComplete} />;
      case 'pattern':
        return <PatternGame onComplete={handleGameComplete} />;
      case 'creative':
        return <CreativeGame onComplete={handleGameComplete} />;
      default:
        return null;
    }
  };

  if (currentScreen === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentScreen === 'final-report-loading') {
    return <FinalReportAnimation gamesCompleted={completedGames.size} />;
  }

  switch (currentScreen) {
    case 'home':
      return <MainHome childName="بطلنا" onNavigate={handleNavigate} />;

    case 'assessment-paths':
      return (
        <AssessmentPaths
          onSelectPath={handleSelectAssessmentPath}
          onBack={() => setCurrentScreen('home')}
        />
      );

    case 'game-sequence':
      return (
        <GameSequenceManager
          childId="local"
          currentPath={{
            id: 'local-path',
            child_id: 'local',
            path_type: pathType,
            completed_games: Array.from(completedGames),
            target_games: pathType === 'all' ? ALL_GAMES : [],
            session_ids: [],
            created_at: new Date().toISOString(),
            status: 'in_progress',
            overall_score: 0
          }}
          onSelectGame={handleGameSelect}
          onBack={() => {
            setCompletedGames(new Set());
            setCurrentScreen('assessment-paths');
          }}
          onGenerateFinalReport={handleGenerateFinalReport}
        />
      );

    case 'game':
      return renderGame();

    case 'analyzing':
      return <MiniReportAnimation gameName={currentGameName} />;

    case 'mini-report':
      if (!currentMiniReport) return null;
      return (
        <MiniReportScreen
          score={currentGameScore}
          status={currentGameScore >= 80 ? 'ممتاز' : currentGameScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
          reasons={[currentMiniReport]}
          tip="استمر في الممارسة"
          gameName={currentGameName}
          onNext={pathType === 'all' ? handleMiniReportNext : undefined}
          onHome={handleMiniReportHome}
          onReplay={handleMiniReportReplay}
          showNext={pathType === 'all'}
          markdownContent={currentMiniReport}
        />
      );

    case 'reports':
      return <ReportsPage onBack={() => setCurrentScreen('home')} />;

    case 'consultation':
      return <ConsultationPage onBack={() => setCurrentScreen('home')} />;

    case 'store':
      return <StorePage onBack={() => setCurrentScreen('home')} />;

    case 'ai-assistant':
      return <AIAssistantPage onBack={() => setCurrentScreen('home')} />;

    default:
      return <MainHome childName="بطلنا" onNavigate={handleNavigate} />;
  }
}

export default App;
