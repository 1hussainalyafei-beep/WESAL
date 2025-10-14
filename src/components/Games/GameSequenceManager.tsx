import { useState, useEffect } from 'react';
import { GameType, AssessmentPath } from '../../types';
import { assessmentPathManager } from '../../services/assessmentPathService';
import { CheckCircle2, Lock, Play, Target } from 'lucide-react';

interface GameInfo {
  type: GameType;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface GameSequenceManagerProps {
  childId: string;
  currentPath: AssessmentPath | null;
  onSelectGame: (gameType: GameType) => void;
  onBack: () => void;
  onGenerateFinalReport: () => void;
}

const games: GameInfo[] = [
  {
    type: 'memory',
    title: 'لعبة الذاكرة',
    description: 'مطابقة الأزواج',
    icon: '🧠',
    color: 'var(--primary-purple)',
    bgColor: 'var(--accent-blue-light)',
  },
  {
    type: 'attention',
    title: 'التركيز والانتباه',
    description: 'اضغط على الرمز المستهدف',
    icon: '👁️',
    color: 'var(--accent-blue)',
    bgColor: 'var(--accent-blue-light)',
  },
  {
    type: 'logic',
    title: 'المنطق',
    description: 'أكمل النمط المنطقي',
    icon: '💡',
    color: 'var(--green-success)',
    bgColor: '#E8F5E9',
  },
  {
    type: 'visual',
    title: 'التفكير البصري',
    description: 'اربط الصورة بمفهومها',
    icon: '🖼️',
    color: 'var(--yellow-light)',
    bgColor: '#FFFDE7',
  },
  {
    type: 'pattern',
    title: 'تمييز الأنماط',
    description: 'ما العنصر التالي؟',
    icon: '🔢',
    color: 'var(--red-accent)',
    bgColor: '#FFEBEE',
  },
  {
    type: 'creative',
    title: 'الرسم الإبداعي',
    description: 'ارسم ما تخيله',
    icon: '🎨',
    color: 'var(--secondary-pink)',
    bgColor: 'var(--secondary-pink-light)',
  },
];

export function GameSequenceManager({
  childId,
  currentPath,
  onSelectGame,
  onBack,
  onGenerateFinalReport,
}: GameSequenceManagerProps) {
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0, nextGame: null as GameType | null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [currentPath]);

  const loadProgress = async () => {
    if (!currentPath) {
      setLoading(false);
      return;
    }

    try {
      const pathProgress = await assessmentPathManager.getPathProgress(currentPath.id);
      setProgress(pathProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-lg" style={{ color: 'var(--primary-purple)' }}>
          جارٍ التحميل...
        </div>
      </div>
    );
  }

  if (!currentPath) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl" style={{ color: 'var(--gray-400)' }}>
            لم يتم العثور على مسار تقييم نشط
          </p>
          <button onClick={onBack} className="mt-6 btn-primary">
            العودة
          </button>
        </div>
      </div>
    );
  }

  const isSingleMode = currentPath.path_type === 'single';
  const allGamesCompleted = progress.completed === progress.total && progress.total > 0;
  const availableGames = isSingleMode ? games : games.filter(g => currentPath.target_games.includes(g.type));

  return (
    <div className="min-h-screen p-6 page-transition" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 btn-secondary"
        >
          <div className="flex items-center gap-2">
            ← العودة للرئيسية
            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center p-1">
              <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
            </div>
          </div>
        </button>

        <div className="card mb-6 text-center p-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--primary-purple)' }}>
            {isSingleMode ? 'اختر لعبة واحدة' : 'رحلة الألعاب المعرفية'}
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--gray-400)' }}>
            {isSingleMode
              ? 'اختر أي لعبة واحصل على تقرير مصغر فوري'
              : 'أكمل جميع الألعاب للحصول على تقرير شامل'}
          </p>

          {!isSingleMode && (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="text-3xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                  {progress.completed}
                </div>
                <span style={{ color: 'var(--gray-400)' }}>/</span>
                <div className="text-3xl font-bold" style={{ color: 'var(--gray-400)' }}>
                  {progress.total}
                </div>
              </div>

              <div className="max-w-md mx-auto">
                <div className="w-full h-4 rounded-full" style={{ backgroundColor: 'var(--gray-200)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${progress.percentage}%`,
                      backgroundColor: progress.percentage === 100 ? 'var(--green-success)' : 'var(--primary-purple)',
                    }}
                  >
                    {progress.percentage > 20 && (
                      <span className="text-xs font-bold text-white">
                        {progress.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {progress.nextGame && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ color: 'var(--primary-purple)' }}>
                  <Target className="w-4 h-4" />
                  <span>اللعبة التالية: {games.find(g => g.type === progress.nextGame)?.title}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {availableGames.map((game) => {
            const isCompleted = currentPath.completed_games?.includes(game.type) || false;
            const isCurrent = !isSingleMode && progress.nextGame === game.type;
            const isLocked = !isSingleMode && !isCompleted && progress.nextGame !== game.type;

            return (
              <button
                key={game.type}
                onClick={() => !isCompleted && !isLocked && onSelectGame(game.type)}
                disabled={isCompleted || isLocked}
                className={`card p-6 text-center relative transition-all duration-200 ${
                  !isCompleted && !isLocked ? 'hover:scale-105 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isCompleted ? 'var(--green-success)' : 'var(--white)',
                  border: isCurrent ? '3px solid var(--primary-purple)' : 'none',
                  boxShadow: isCurrent ? '0 4px 20px rgba(91, 75, 157, 0.3)' : undefined,
                }}
              >
                {isCompleted && (
                  <div className="absolute top-3 left-3">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                )}

                {isLocked && (
                  <div className="absolute top-3 left-3">
                    <Lock className="w-6 h-6" style={{ color: 'var(--gray-400)' }} />
                  </div>
                )}

                <div
                  className="text-6xl mb-4 mx-auto w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: isCompleted ? 'rgba(255,255,255,0.3)' : game.bgColor }}
                >
                  {game.icon}
                </div>

                <h3 className={`text-xl font-bold mb-2 ${isCompleted ? 'text-white' : ''}`}
                  style={{ color: isCompleted ? 'white' : 'var(--text-dark)' }}>
                  {game.title}
                </h3>

                <p className={`text-sm mb-4 ${isCompleted ? 'text-white/80' : ''}`}
                  style={{ color: isCompleted ? 'rgba(255,255,255,0.8)' : 'var(--gray-400)' }}>
                  {game.description}
                </p>

                {isCurrent && !isCompleted && (
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold animate-pulse"
                    style={{ color: 'var(--primary-purple)' }}>
                    <Play className="w-4 h-4" />
                    <span>العب الآن</span>
                  </div>
                )}

                {isCompleted && (
                  <div className="text-sm font-semibold text-white">
                    مكتمل ✓
                  </div>
                )}

                {isLocked && (
                  <div className="text-xs" style={{ color: 'var(--gray-400)' }}>
                    مقفل
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {allGamesCompleted && !isSingleMode && (
          <div className="card p-8 text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white animate-fadeIn">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold mb-3">
              مبروك! أكملت جميع الألعاب
            </h2>
            <p className="text-lg mb-6 opacity-90">
              حان الوقت للحصول على تقريرك الشامل
            </p>
            <button
              onClick={onGenerateFinalReport}
              className="px-8 py-4 rounded-xl font-bold text-xl bg-white hover:bg-gray-100 transition-all hover:scale-105"
              style={{ color: 'var(--primary-purple)' }}
            >
              إنشاء التقرير الشامل
            </button>
          </div>
        )}

        {currentPath.average_score && (
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-purple)' }}>
              إحصائيات المسار
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--accent-blue-light)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                  {Math.round(currentPath.average_score)}
                </div>
                <div className="text-sm" style={{ color: 'var(--gray-400)' }}>المتوسط</div>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--secondary-pink-light)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                  {Math.floor(currentPath.total_duration_seconds / 60)}
                </div>
                <div className="text-sm" style={{ color: 'var(--gray-400)' }}>دقيقة</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
