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
import { generateMiniReport, generateComprehensiveReport } from './services/openaiService';
import { assessmentPathManager } from './services/assessmentPathService';
import { MiniReportService } from './services/miniReportService';
import { FinalReportService } from './services/finalReportService';
import { BehaviorTrackingService } from './services/behaviorTrackingService';
import { MiniReportAnimation } from './components/Analysis/MiniReportAnimation';
import { FinalReportAnimation } from './components/Analysis/FinalReportAnimation';
import { GameType, Child, AssessmentPath, GameReport as GameReportType } from './types';
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

const ALL_GAMES: GameType[] = ['memory', 'attention', 'logic', 'visual', 'pattern', 'creative'];

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [currentPath, setCurrentPath] = useState<AssessmentPath | null>(null);
  const [currentReport, setCurrentReport] = useState<GameReportType | null>(null);
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

  useEffect(() => {
    if (currentScreen === 'analyzing') {
      const timer = setTimeout(() => {
        setCurrentScreen('mini-report');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

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
      setCurrentPath(null);
      setCurrentScreen('assessment-paths');
    } else {
      setCurrentScreen(section as Screen);
    }
  };

  const handleSelectAssessmentPath = async (path: 'single' | 'all' | 'view-reports') => {
    if (!child) return;

    if (path === 'view-reports') {
      setCurrentScreen('reports');
      return;
    }

    try {
      const targetGames = path === 'all' ? ALL_GAMES : [];
      const newPath = await assessmentPathManager.createPath(child.id, path, targetGames);
      setCurrentPath(newPath);
      setCurrentScreen('game-sequence');
    } catch (error) {
      console.error('Error creating assessment path:', error);
    }
  };

  const handleGameSelect = async (gameType: GameType) => {
    if (!child || !currentPath) return;

    const isCompleted = await assessmentPathManager.isGameCompletedInPath(currentPath.id, gameType);
    if (isCompleted) {
      console.log('Game already completed in this path');
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

    if (child && user) {
      const { data: childProfile } = await supabase
        .from('children_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (childProfile) {
        await BehaviorTrackingService.logGameStart(childProfile.id, '', gameType);
      }
    }
  };

  const handleGameComplete = async (gameData: any) => {
    if (!child || !selectedGame || !currentPath) return;

    setCurrentScreen('analyzing');

    try {
      const startTime = Date.now();

      const { data: childProfile } = await supabase
        .from('children_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const childAge = childProfile
        ? Math.floor((Date.now() - new Date(childProfile.birth_date).getTime()) / (365 * 24 * 60 * 60 * 1000))
        : Math.floor((Date.now() - new Date(child.birth_date).getTime()) / (365 * 24 * 60 * 60 * 1000));

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          child_id: child.id,
          game_type: selectedGame,
          assessment_path_id: currentPath.id,
          score: gameData.score || 0,
          duration_seconds: gameData.duration,
          raw_data: gameData.rawData,
          completed: true,
          hesitation_count: gameData.hesitationCount || 0,
          pause_count: gameData.pauseCount || 0,
          started_at: new Date(startTime).toISOString(),
          average_response_time: gameData.averageResponseTime || 0,
          accuracy_percentage: gameData.accuracyPercentage || 0,
          total_moves: gameData.totalMoves || 0,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      if (childProfile) {
        await BehaviorTrackingService.logGameComplete(
          childProfile.id,
          session.id,
          selectedGame,
          gameData.duration
        );
      }

      const miniReportData = await MiniReportService.generateMiniReport(
        session.id,
        childProfile?.id || child.id,
        selectedGame,
        session,
        childAge
      );

      if (miniReportData && childProfile) {
        await MiniReportService.saveMiniReport(
          session.id,
          childProfile.id,
          selectedGame,
          miniReportData
        );
      }

      const gptAnalysis = await generateMiniReport(session, childAge);

      const { data: report, error: reportError } = await supabase
        .from('game_reports')
        .insert({
          session_id: session.id,
          analysis: gptAnalysis.analysisText,
          performance_score: gptAnalysis.performanceScore,
          status: gptAnalysis.performanceLevel === 'above_normal' ? 'ممتاز' : gptAnalysis.performanceLevel === 'normal' ? 'جيد' : 'يحتاج تحسين',
          sub_scores: {},
          reasons: gptAnalysis.observations,
          tip: gptAnalysis.quickTip,
          flags: [],
          strengths: gptAnalysis.observations,
          recommendations: [gptAnalysis.quickTip],
          level: gptAnalysis.performanceLevel,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      await assessmentPathManager.addGameToPath(currentPath.id, selectedGame, session.id);
      await assessmentPathManager.updatePathScore(currentPath.id, {
        score: gameData.score || 0,
        duration: gameData.duration,
      });

      const updatedPath = await assessmentPathManager.getPathById(currentPath.id);
      setCurrentPath(updatedPath);
      setCurrentReport(report);
      setCurrentMiniReport({
        game: selectedGame,
        score: miniReportData?.score || gptAnalysis.performanceScore,
        status: gptAnalysis.performanceLevel === 'above_normal' ? 'ممتاز' : gptAnalysis.performanceLevel === 'normal' ? 'جيد' : 'يحتاج تحسين',
        subScores: {},
        reasons: gptAnalysis.observations,
        tip: miniReportData?.improvement_tip || gptAnalysis.quickTip,
        flags: [],
        markdownContent: miniReportData?.markdown_content || '',
        gptAnalysis: {
          analysis: gptAnalysis.analysisText,
          strengths: gptAnalysis.observations,
          recommendations: [gptAnalysis.quickTip],
        }
      });
    } catch (error) {
      console.error('Error handling game completion:', error);
      setCurrentScreen('game-sequence');
    }
  };

  const handleAnalyzingComplete = () => {
    setCurrentScreen('mini-report');
  };

  const handleMiniReportNext = async () => {
    if (!currentPath) return;

    const progress = await assessmentPathManager.getPathProgress(currentPath.id);

    if (progress.completed < progress.total) {
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
    setCurrentPath(null);
    setCurrentScreen('home');
  };

  const handleMiniReportReplay = () => {
    setCurrentMiniReport(null);
    setCurrentScreen('game');
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

  const handleGenerateFinalReport = async () => {
    if (!child || !currentPath || !user) return;

    setCurrentScreen('final-report-loading');

    try {
      const { data: childProfile } = await supabase
        .from('children_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!childProfile) {
        console.error('Child profile not found');
        setCurrentScreen('game-sequence');
        return;
      }

      const miniReports = await MiniReportService.getMiniReportsByPathId(currentPath.id);

      if (miniReports.length === 0) {
        console.error('No mini reports found');
        setCurrentScreen('game-sequence');
        return;
      }

      const childAge = Math.floor(
        (Date.now() - new Date(childProfile.birth_date).getTime()) / (365 * 24 * 60 * 60 * 1000)
      );

      const finalReportData = await FinalReportService.generateFinalReport(
        currentPath.id,
        childProfile.id,
        miniReports,
        childAge,
        childProfile.child_name
      );

      if (finalReportData) {
        await FinalReportService.saveFinalReport(
          currentPath.id,
          childProfile.id,
          finalReportData
        );
      }

      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('*')
        .in('id', currentPath.session_ids);

      if (sessionsError) throw sessionsError;

      const { data: allReports, error: reportsError } = await supabase
        .from('game_reports')
        .select('*')
        .in('session_id', currentPath.session_ids)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      const miniReportsData = allReports.map((report, index) => ({
        game_type: sessions[index]?.game_type as GameType,
        performance_score: report.performance_score,
        performance_level: report.level,
        analysis_text: report.analysis,
        observations: Array.isArray(report.reasons) ? report.reasons : [],
      }));

      const comprehensiveAnalysis = await generateComprehensiveReport(
        miniReportsData,
        childProfile.child_name,
        childAge
      );

      const { data: finalReport, error: reportError } = await supabase
        .from('comprehensive_reports')
        .insert({
          child_id: child.id,
          assessment_path_id: currentPath.id,
          overall_score: comprehensiveAnalysis.overallScore,
          cognitive_map: comprehensiveAnalysis.domainScores,
          detailed_analysis: comprehensiveAnalysis.aiSummary,
          recommendations: comprehensiveAnalysis.recommendations,
          specialist_alert: comprehensiveAnalysis.specialistAlert ? comprehensiveAnalysis.specialistAlertReason || '' : '',
          encouragement: comprehensiveAnalysis.aiSummary,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      await assessmentPathManager.linkComprehensiveReport(currentPath.id, finalReport.id);

      setCurrentScreen('reports');
    } catch (error) {
      console.error('Error generating final report:', error);
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
      <FinalReportAnimation gamesCompleted={currentPath?.completed_games?.length || 6} />
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
          childId={child.id}
          currentPath={currentPath}
          onSelectGame={handleGameSelect}
          onBack={() => {
            if (currentPath) {
              assessmentPathManager.abandonPath(currentPath.id);
            }
            setCurrentPath(null);
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
          score={currentMiniReport.score}
          status={currentMiniReport.status}
          reasons={currentMiniReport.reasons}
          tip={currentMiniReport.tip}
          gameName={currentGameName}
          onNext={currentPath?.path_type === 'all' ? handleMiniReportNext : undefined}
          onHome={handleMiniReportHome}
          onReplay={handleMiniReportReplay}
          showNext={currentPath?.path_type === 'all'}
          markdownContent={currentMiniReport.markdownContent}
          gptAnalysis={currentMiniReport.gptAnalysis}
        />
      );

    case 'game-report':
      return (
        <GameReport
          report={currentReport}
          loading={false}
          onNextGame={() => setCurrentScreen('game-sequence')}
          onHome={() => setCurrentScreen('home')}
          onConsult={() => setCurrentScreen('consultation')}
        />
      );

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
