import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/Landing/LandingPage';
import { AuthPage } from './components/Auth/AuthPage';
import { MainHome } from './components/Home/MainHome';
import { GameSequenceManager } from './components/Games/GameSequenceManager';
import { ImprovedMemoryGame } from './components/Games/ImprovedMemoryGame';
import { ImprovedAttentionGame } from './components/Games/ImprovedAttentionGame';
import { LogicGame } from './components/Games/LogicGame';
import { VisualGame } from './components/Games/VisualGame';
import { PatternGame } from './components/Games/PatternGame';
import { CreativeGame } from './components/Games/CreativeGame';
import { GameReport } from './components/Games/GameReport';
import { AssessmentPaths } from './components/Games/AssessmentPaths';
import { AnalyzingScreen } from './components/Games/AnalyzingScreen';
import { MiniReportScreen } from './components/Games/MiniReportScreen';
import { ReportsPage } from './components/Reports/ReportsPage';
import { ConsultationPage } from './components/Consultation/ConsultationPage';
import { BehaviorPage } from './components/Behavior/BehaviorPage';
import { StorePage } from './components/Store/StorePage';
import { AIAssistantPage } from './components/AIAssistant/AIAssistantPage';
import { supabase } from './lib/supabase';
import { analyzeGameSession, generateComprehensiveReport } from './services/analysisService';
import { generateMiniReport } from './services/scoringService';
import { GameType, Child, GameSession, GameReport as GameReportType, ComprehensiveReport } from './types';
import { Loader2 } from 'lucide-react';

type Screen =
  | 'landing'
  | 'auth'
  | 'home'
  | 'assessment-paths'
  | 'game-sequence'
  | 'game'
  | 'analyzing'
  | 'mini-report'
  | 'game-report'
  | 'final-report-loading'
  | 'final-report'
  | 'reports'
  | 'consultation'
  | 'behavior'
  | 'store'
  | 'ai-assistant';

type AssessmentMode = 'single' | 'all' | null;

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [currentReport, setCurrentReport] = useState<GameReportType | null>(null);
  const [comprehensiveReport, setComprehensiveReport] = useState<ComprehensiveReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [completedGames, setCompletedGames] = useState<GameType[]>([]);
  const [currentSessionReports, setCurrentSessionReports] = useState<GameReportType[]>([]);
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>(null);
  const [currentMiniReport, setCurrentMiniReport] = useState<any>(null);
  const [currentGameName, setCurrentGameName] = useState('');

  useEffect(() => {
    if (user) {
      loadOrCreateChild();
      setCurrentScreen('home');
    } else {
      setCurrentScreen('landing');
    }
  }, [user]);

  const loadOrCreateChild = async () => {
    if (!user) return;

    try {
      const { data: existingChildren, error: fetchError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingChildren && existingChildren.length > 0) {
        setChild(existingChildren[0]);
      } else {
        const { data: newChild, error: createError } = await supabase
          .from('children')
          .insert({
            user_id: user.id,
            name: 'بطلنا',
            birth_date: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          })
          .select()
          .single();

        if (createError) throw createError;
        setChild(newChild);
      }
    } catch (error) {
      console.error('Error loading/creating child:', error);
    }
  };

  const handleGetStarted = () => {
    setCurrentScreen('auth');
  };

  const handleNavigate = (section: string) => {
    if (section === 'assessment') {
      setCompletedGames([]);
      setCurrentSessionReports([]);
      setAssessmentMode(null);
      setCurrentScreen('assessment-paths');
    } else {
      setCurrentScreen(section as Screen);
    }
  };

  const handleSelectAssessmentPath = (path: 'single' | 'all' | 'view-reports') => {
    if (path === 'view-reports') {
      setCurrentScreen('reports');
    } else {
      setAssessmentMode(path);
      setCurrentScreen('game-sequence');
    }
  };

  const handleGameSelect = (gameType: GameType) => {
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

    if (child) {
      supabase.from('behavior_logs').insert({
        child_id: child.id,
        event_type: 'game_start',
        game_type: gameType,
      });
    }
  };

  const handleGameComplete = async (gameData: any) => {
    if (!child || !selectedGame) return;

    setCurrentScreen('analyzing');

    try {
      const startTime = Date.now();
      const childAge = Math.floor(
        (Date.now() - new Date(child.birth_date).getTime()) / (365 * 24 * 60 * 60 * 1000)
      );

      const rawEvents = gameData.rawData?.events || [];
      const miniReport = generateMiniReport(rawEvents, selectedGame, childAge);

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          child_id: child.id,
          game_type: selectedGame,
          score: miniReport.score,
          duration_seconds: gameData.duration,
          raw_data: gameData.rawData,
          completed: true,
          started_at: new Date(startTime).toISOString(),
          metrics: {
            accuracy: miniReport.subScores.accuracy,
            latency: miniReport.subScores.latency,
            hesitation: miniReport.subScores.hesitation,
            stability: miniReport.subScores.stability,
          },
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const gptAnalysis = await analyzeGameSession(session, childAge);

      const { data: report, error: reportError } = await supabase
        .from('game_reports')
        .insert({
          session_id: session.id,
          analysis: gptAnalysis.analysis,
          performance_score: gptAnalysis.performance_score,
          status: miniReport.status,
          sub_scores: miniReport.subScores,
          reasons: miniReport.reasons,
          tip: gptAnalysis.quick_tip,
          flags: miniReport.flags,
          strengths: gptAnalysis.strengths,
          recommendations: gptAnalysis.recommendations,
          level: gptAnalysis.level,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      await supabase.from('behavior_logs').insert({
        child_id: child.id,
        event_type: 'game_complete',
        game_type: selectedGame,
        metadata: { score: miniReport.score, duration: gameData.duration },
      });

      setCompletedGames([...completedGames, selectedGame]);
      setCurrentSessionReports([...currentSessionReports, report]);
      setCurrentReport(report);
      setCurrentMiniReport({ ...miniReport, gptAnalysis });
    } catch (error) {
      console.error('Error handling game completion:', error);
      setCurrentScreen('game-sequence');
    }
  };

  const handleAnalyzingComplete = () => {
    setCurrentScreen('mini-report');
  };

  const handleMiniReportNext = () => {
    if (assessmentMode === 'all' && completedGames.length < 6) {
      setSelectedGame(null);
      setCurrentMiniReport(null);
      setCurrentScreen('game-sequence');
    } else {
      handleGenerateFinalReport();
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

  const handleNextGame = () => {
    setSelectedGame(null);
    setCurrentReport(null);
    setCurrentScreen('game-sequence');
  };

  const handleBackFromGame = () => {
    if (child && selectedGame) {
      supabase.from('behavior_logs').insert({
        child_id: child.id,
        event_type: 'game_quit',
        game_type: selectedGame,
      });
    }
    setSelectedGame(null);
    setCurrentScreen('game-sequence');
  };

  const handleSkipGame = () => {
    if (selectedGame) {
      setCompletedGames([...completedGames, selectedGame]);
    }
    setSelectedGame(null);
    setCurrentScreen('game-sequence');
  };

  const handleGenerateFinalReport = async () => {
    if (!child) return;

    setCurrentScreen('final-report-loading');

    try {
      const { data: allSessions, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_id', child.id)
        .in('game_type', completedGames)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const childAge = Math.floor(
        (Date.now() - new Date(child.birth_date).getTime()) / (365 * 24 * 60 * 60 * 1000)
      );

      const comprehensiveAnalysis = await generateComprehensiveReport(
        allSessions || [],
        child.name,
        childAge
      );

      const { data: finalReport, error: reportError } = await supabase
        .from('comprehensive_reports')
        .insert({
          child_id: child.id,
          overall_score: comprehensiveAnalysis.overall_score,
          cognitive_map: comprehensiveAnalysis.cognitive_map,
          detailed_analysis: comprehensiveAnalysis.detailed_analysis,
          recommendations: comprehensiveAnalysis.recommendations,
          specialist_alert: comprehensiveAnalysis.specialist_alert,
          encouragement: comprehensiveAnalysis.encouragement,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      setComprehensiveReport(finalReport);
      setCurrentScreen('final-report');
    } catch (error) {
      console.error('Error generating final report:', error);
      setCurrentScreen('game-sequence');
    }
  };

  const renderGame = () => {
    const gameProps = {
      onComplete: handleGameComplete,
      onBack: handleBackFromGame,
      onSkip: handleSkipGame,
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--primary-purple)' }} />
      </div>
    );
  }

  if (currentScreen === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!user || currentScreen === 'auth') {
    return <AuthPage />;
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--primary-purple)' }} />
      </div>
    );
  }

  if (currentScreen === 'final-report-loading') {
    return (
      <div className="min-h-screen flex items-center justify-center page-transition" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="card text-center max-w-md p-8">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--primary-purple)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            جارٍ إنشاء التقرير الشامل...
          </h2>
          <p style={{ color: 'var(--gray-400)' }}>
            الذكاء الاصطناعي يقوم بتحليل جميع نتائجك
          </p>
        </div>
      </div>
    );
  }

  switch (currentScreen) {
    case 'home':
      return <MainHome childName={child.name} onNavigate={handleNavigate} />;

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
          completedGames={completedGames}
          onSelectGame={handleGameSelect}
          onBack={() => setCurrentScreen(assessmentMode ? 'assessment-paths' : 'home')}
          onGenerateFinalReport={handleGenerateFinalReport}
          mode={assessmentMode || 'all'}
        />
      );

    case 'game':
      return renderGame();

    case 'analyzing':
      return (
        <AnalyzingScreen
          gameName={currentGameName}
          onComplete={handleAnalyzingComplete}
        />
      );

    case 'mini-report':
      if (!currentMiniReport) return null;
      return (
        <MiniReportScreen
          score={currentMiniReport.score}
          status={currentMiniReport.status}
          reasons={currentMiniReport.reasons}
          tip={currentMiniReport.tip}
          gameName={currentGameName}
          onNext={assessmentMode === 'all' ? handleMiniReportNext : undefined}
          onHome={handleMiniReportHome}
          onReplay={handleMiniReportReplay}
          showNext={assessmentMode === 'all'}
          gptAnalysis={currentMiniReport.gptAnalysis}
        />
      );

    case 'game-report':
      return (
        <GameReport
          report={currentReport}
          loading={reportLoading}
          onNextGame={handleNextGame}
          onHome={() => setCurrentScreen('home')}
          onConsult={() => setCurrentScreen('consultation')}
        />
      );

    case 'final-report':
      if (!comprehensiveReport) return null;
      return <ReportsPage childId={child.id} onBack={() => setCurrentScreen('home')} />;

    case 'reports':
      return <ReportsPage childId={child.id} onBack={() => setCurrentScreen('home')} />;

    case 'consultation':
      return <ConsultationPage onBack={() => setCurrentScreen('home')} />;

    case 'behavior':
      return <BehaviorPage childId={child.id} onBack={() => setCurrentScreen('home')} />;

    case 'store':
      return <StorePage onBack={() => setCurrentScreen('home')} />;

    case 'ai-assistant':
      return <AIAssistantPage onBack={() => setCurrentScreen('home')} />;

    default:
      return <MainHome childName={child.name} onNavigate={handleNavigate} />;
  }
}

export default App;
