import { useState, useEffect } from 'react';
import { GameType } from '../../types';
import { CheckCircle2, Lock, Play } from 'lucide-react';

interface GameInfo {
  type: GameType;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface GameSequenceManagerProps {
  completedGames: GameType[];
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
  completedGames,
  onSelectGame,
  onBack,
  onGenerateFinalReport,
}: GameSequenceManagerProps) {
  const allGamesCompleted = completedGames.length === games.length;
  const nextGameIndex = completedGames.length;

  return (
    <div className="min-h-screen p-6 page-transition" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 btn-secondary"
        >
          ← العودة للرئيسية
        </button>

        <div className="card mb-6 text-center p-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--primary-purple)' }}>
            رحلة الألعاب المعرفية
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--gray-400)' }}>
            أكمل جميع الألعاب للحصول على تقرير شامل
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-bold" style={{ color: 'var(--primary-purple)' }}>
              {completedGames.length}
            </div>
            <span style={{ color: 'var(--gray-400)' }}>/</span>
            <div className="text-3xl font-bold" style={{ color: 'var(--gray-400)' }}>
              {games.length}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {games.map((game, index) => {
            const isCompleted = completedGames.includes(game.type);
            const isUnlocked = index === 0 || completedGames.includes(games[index - 1].type);
            const isCurrent = index === nextGameIndex;

            return (
              <button
                key={game.type}
                onClick={() => isUnlocked && !isCompleted && onSelectGame(game.type)}
                disabled={!isUnlocked || isCompleted}
                className={`card p-6 text-center relative transition-all duration-200 ${
                  isUnlocked && !isCompleted ? 'hover:scale-105 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isCompleted ? 'var(--green-success)' : 'var(--white)',
                  border: isCurrent ? '3px solid var(--primary-purple)' : 'none',
                }}
              >
                {isCompleted && (
                  <div className="absolute top-3 left-3">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                )}

                {!isUnlocked && (
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
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold"
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
              </button>
            );
          })}
        </div>

        {allGamesCompleted && (
          <div className="card p-8 text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-3">
              مبروك! أكملت جميع الألعاب
            </h2>
            <p className="text-lg mb-6 opacity-90">
              حان الوقت للحصول على تقريرك الشامل
            </p>
            <button
              onClick={onGenerateFinalReport}
              className="px-8 py-4 rounded-xl font-bold text-xl bg-white hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--primary-purple)' }}
            >
              إنشاء التقرير الشامل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
