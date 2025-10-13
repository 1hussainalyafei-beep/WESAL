import { useState, useEffect } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';

interface ImprovedMemoryGameProps {
  onComplete: (data: GameData) => void;
  onBack: () => void;
  onSkip: () => void;
}

interface GameData {
  score: number;
  duration: number;
  rawData: {
    correctPairs: number;
    totalAttempts: number;
    averageResponseTime: number;
    mistakes: number;
  };
}

const emojis = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻'];

export function ImprovedMemoryGame({ onComplete, onBack, onSkip }: ImprovedMemoryGameProps) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lastFlipTime, setLastFlipTime] = useState<number>(0);

  useEffect(() => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const score = Math.max(0, 100 - (attempts * 5) - Math.floor(duration / 2));

      setTimeout(() => {
        onComplete({
          score: Math.min(100, score),
          duration,
          rawData: {
            correctPairs: matched.length / 2,
            totalAttempts: attempts,
            averageResponseTime: Math.floor(avgResponseTime),
            mistakes: attempts - (matched.length / 2),
          },
        });
      }, 1000);
    }
  }, [matched, cards.length]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const now = Date.now();
    if (lastFlipTime > 0) {
      setResponseTimes([...responseTimes, now - lastFlipTime]);
    }
    setLastFlipTime(now);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(attempts + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 page-transition" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="btn-secondary flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            رجوع
          </button>
          <button onClick={onSkip} className="btn-secondary flex items-center gap-2">
            تخطي
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="card mb-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🧠</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                لعبة الذاكرة
              </h2>
              <p style={{ color: 'var(--gray-400)' }}>
                ابحث عن الأزواج المتطابقة
              </p>
            </div>
          </div>

          <div className="flex justify-around text-center">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-blue-light)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                {attempts}
              </div>
              <div className="text-sm" style={{ color: 'var(--gray-400)' }}>المحاولات</div>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--secondary-pink-light)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                {matched.length / 2} / {cards.length / 2}
              </div>
              <div className="text-sm" style={{ color: 'var(--gray-400)' }}>الأزواج</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);

            return (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className="aspect-square rounded-3xl text-6xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: isMatched
                    ? '#66BB6A'
                    : isFlipped
                    ? '#FFFFFF'
                    : '#667eea',
                  color: isFlipped ? 'inherit' : '#FFFFFF',
                  border: isFlipped ? '4px solid #667eea' : 'none',
                }}
              >
                {isFlipped ? card : '❓'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
