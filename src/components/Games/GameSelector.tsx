import { Brain, Eye, Lightbulb, Image, Grid3x3, Palette } from 'lucide-react';
import { GameType } from '../../types';

interface GameSelectorProps {
  onSelectGame: (gameType: GameType) => void;
  onBack: () => void;
}

const games = [
  {
    type: 'memory' as GameType,
    title: 'لعبة الذاكرة',
    description: 'مطابقة الأزواج',
    icon: Brain,
    color: 'var(--primary-purple)',
    bgColor: 'var(--primary-purple-lighter)',
  },
  {
    type: 'attention' as GameType,
    title: 'التركيز والانتباه',
    description: 'اضغط على الرمز المستهدف',
    icon: Eye,
    color: 'var(--blue-light)',
    bgColor: 'var(--blue-lighter)',
  },
  {
    type: 'logic' as GameType,
    title: 'المنطق',
    description: 'أكمل النمط المنطقي',
    icon: Lightbulb,
    color: 'var(--green-success)',
    bgColor: '#E8F5E9',
  },
  {
    type: 'visual' as GameType,
    title: 'التفكير البصري',
    description: 'اربط الصورة بمفهومها',
    icon: Image,
    color: 'var(--yellow-light)',
    bgColor: '#FFFDE7',
  },
  {
    type: 'pattern' as GameType,
    title: 'تمييز الأنماط',
    description: 'ما العنصر التالي؟',
    icon: Grid3x3,
    color: 'var(--red-accent)',
    bgColor: '#FFEBEE',
  },
  {
    type: 'creative' as GameType,
    title: 'الرسم الإبداعي',
    description: 'ارسم ما تخيله',
    icon: Palette,
    color: 'var(--secondary-pink)',
    bgColor: 'var(--secondary-pink-light)',
  },
];

export function GameSelector({ onSelectGame, onBack }: GameSelectorProps) {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 btn-secondary"
        >
          العودة للرئيسية
        </button>

        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            اختر اللعبة
          </h1>
          <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
            اختر اللعبة التي تريد تجربتها اليوم
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <button
              key={game.type}
              onClick={() => onSelectGame(game.type)}
              className="card text-right p-6 cursor-pointer slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: game.bgColor }}
              >
                <game.icon className="w-8 h-8" style={{ color: game.color }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                {game.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--gray-400)' }}>
                {game.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
