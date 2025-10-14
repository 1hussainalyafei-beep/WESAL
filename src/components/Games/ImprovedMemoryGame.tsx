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
  accuracyPercentage: number;
  averageResponseTime: number;
  totalMoves: number;
  hesitationCount: number;
  pauseCount: number;
  rawData: {
    correctPairs: number;
    totalAttempts: number;
    averageResponseTime: number;
    mistakes: number;
    events: Array<{timestamp: number; type: string; value: any}>;
    cardFlips: number;
    matchingAccuracy: number;
    gameStartTime: number;
    gameEndTime: number;
  };
}

const emojis = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻'];

export function ImprovedMemoryGame({ onComplete, onBack, onSkip }: ImprovedMemoryGameProps) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lastFlipTime, setLastFlipTime] = useState<number>(0);
  const [events, setEvents] = useState<Array<{timestamp: number; type: string; value: any}>>([]);
  const [cardFlips, setCardFlips] = useState(0);
  const [hesitations, setHesitations] = useState(0);
  const [pauses, setPauses] = useState(0);

  useEffect(() => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    
    // تسجيل بداية اللعبة
    setEvents([{
      timestamp: Date.now(),
      type: 'game_start',
      value: { totalCards: shuffled.length }
    }]);
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const gameEndTime = Date.now();
      const duration = Math.floor((gameEndTime - gameStartTime) / 1000);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const matchingAccuracy = (matched.length / 2) / attempts;
      const score = Math.max(0, Math.min(100, Math.floor(matchingAccuracy * 100) - Math.floor(duration / 10)));
      
      // تسجيل نهاية اللعبة
      const finalEvents = [...events, {
        timestamp: gameEndTime,
        type: 'game_complete',
        value: { 
          finalScore: score,
          totalDuration: duration,
          totalAttempts: attempts,
          correctPairs: matched.length / 2
        }
      }];

      setTimeout(() => {
        onComplete({
          score: Math.min(100, score),
          duration,
          accuracyPercentage: Math.round(matchingAccuracy * 100),
          averageResponseTime: Math.round(avgResponseTime || 0),
          totalMoves: cardFlips,
          hesitationCount: hesitations,
          pauseCount: pauses,
          rawData: {
            correctPairs: matched.length / 2,
            totalAttempts: attempts,
            averageResponseTime: Math.floor(avgResponseTime),
            mistakes: attempts - (matched.length / 2),
            events: finalEvents,
            cardFlips,
            matchingAccuracy: Math.round(matchingAccuracy * 100),
            gameStartTime,
            gameEndTime,
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
    setCardFlips(prev => prev + 1);
    
    // حساب التردد
    if (lastFlipTime > 0) {
      const responseTime = now - lastFlipTime;
      setResponseTimes([...responseTimes, responseTime]);
      
      // إذا كان وقت الاستجابة أكثر من 3 ثواني، يعتبر تردد
      if (responseTime > 3000) {
        setHesitations(prev => prev + 1);
      }
    }
    setLastFlipTime(now);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    // تسجيل النقرة
    setEvents(prev => [...prev, {
      timestamp: now,
      type: 'card_flip',
      value: { 
        cardIndex: index, 
        cardValue: cards[index],
        responseTime: lastFlipTime > 0 ? now - lastFlipTime : 0,
        flippedCount: newFlipped.length
      }
    }]);

    if (newFlipped.length === 2) {
      setAttempts(attempts + 1);
      const isMatch = cards[newFlipped[0]] === cards[newFlipped[1]];
      
      // تسجيل محاولة المطابقة
      setEvents(prev => [...prev, {
        timestamp: now,
        type: 'match',
        value: { 
          correct: isMatch, 
          card1: cards[newFlipped[0]],
          card2: cards[newFlipped[1]],
          attemptNumber: attempts + 1,
          responseTime: now - lastFlipTime
        }
      }]);

      if (isMatch) {
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
