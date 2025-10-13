import { useState, useEffect } from 'react';

interface MemoryGameProps {
  onComplete: (data: GameData) => void;
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

const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export function MemoryGame({ onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lastFlipTime, setLastFlipTime] = useState<number>(0);

  useEffect(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const score = Math.max(0, 100 - (attempts * 5) - Math.floor(duration / 2));

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
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 card fade-in">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            لعبة الذاكرة
          </h2>
          <p style={{ color: 'var(--gray-400)' }}>
            ابحث عن الأزواج المتطابقة
          </p>
          <div className="mt-4 flex gap-4">
            <div>
              <span className="font-semibold">المحاولات: </span>
              <span>{attempts}</span>
            </div>
            <div>
              <span className="font-semibold">الأزواج: </span>
              <span>{matched.length / 2} / {cards.length / 2}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className="aspect-square rounded-2xl text-4xl font-bold transition-all duration-300 card"
              style={{
                backgroundColor: flipped.includes(index) || matched.includes(index)
                  ? 'var(--white)'
                  : 'var(--primary-purple)',
              }}
            >
              {(flipped.includes(index) || matched.includes(index)) ? card : '?'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
