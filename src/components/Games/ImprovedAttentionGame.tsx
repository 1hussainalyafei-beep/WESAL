import { useState, useEffect } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';

interface ImprovedAttentionGameProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  onSkip: () => void;
}

const symbols = ['⭐', '🌙', '☀️'];
const targetSymbol = '⭐';

export function ImprovedAttentionGame({ onComplete, onBack, onSkip }: ImprovedAttentionGameProps) {
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [hesitations, setHesitations] = useState(0);
  const [falsePositives, setFalsePositives] = useState(0);
  const totalRounds = 12;
  const [events, setEvents] = useState<Array<{timestamp: number; type: string; value: any}>>([]);

  useEffect(() => {
    // تسجيل بداية اللعبة
    setEvents([{
      timestamp: Date.now(),
      type: 'game_start',
      value: { targetSymbol, totalRounds }
    }]);
  }, []);

  useEffect(() => {
    if (round < totalRounds) {
      const timer = setTimeout(() => {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        setCurrentSymbol(randomSymbol);
        const now = Date.now();
        setRoundStartTime(now);
        setRound(round + 1);
        
        // تسجيل ظهور الرمز
        setEvents(prev => [...prev, {
          timestamp: now,
          type: 'symbol_shown',
          value: { 
            symbol: randomSymbol, 
            isTarget: randomSymbol === targetSymbol,
            roundNumber: round + 1
          }
        }]);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (round === totalRounds) {
      finishGame();
    }
  }, [round]);

  const handleClick = () => {
    const now = Date.now();
    const responseTime = now - roundStartTime;
    setResponseTimes([...responseTimes, responseTime]);

    // حساب التردد (إذا كان وقت الاستجابة أكثر من ثانيتين)
    if (responseTime > 2000) {
      setHesitations(prev => prev + 1);
    }

    const isCorrect = currentSymbol === targetSymbol;
    const isTarget = currentSymbol === targetSymbol;
    
    if (isCorrect) {
      setCorrect(correct + 1);
    } else {
      setIncorrect(incorrect + 1);
      // إذا ضغط على رمز غير مستهدف
      if (!isTarget) {
        setFalsePositives(prev => prev + 1);
      }
    }

    // تسجيل النقرة
    setEvents(prev => [...prev, {
      timestamp: now,
      type: 'click',
      value: { 
        correct: isCorrect, 
        isTarget,
        symbol: currentSymbol,
        responseTime,
        roundNumber: round,
        hesitation: responseTime > 2000
      }
    }]);

    setCurrentSymbol('');
  };

  // تسجيل الرموز المفقودة
  useEffect(() => {
    if (currentSymbol && currentSymbol === targetSymbol) {
      const timer = setTimeout(() => {
        if (currentSymbol === targetSymbol) {
          setMissed(missed + 1);
          setEvents(prev => [...prev, {
            timestamp: Date.now(),
            type: 'missed_target',
            value: { 
              symbol: currentSymbol,
              roundNumber: round
            }
          }]);
        }
        setCurrentSymbol('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentSymbol, round, missed]);

  const finishGame = () => {
    const gameEndTime = Date.now();
    const duration = Math.floor((gameEndTime - gameStartTime) / 1000);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const totalResponses = correct + incorrect + missed;
    const accuracy = totalResponses > 0 ? (correct / totalResponses) * 100 : 0;
    const finalScore = Math.min(100, Math.floor(accuracy));
    
    // تسجيل نهاية اللعبة
    const finalEvents = [...events, {
      timestamp: gameEndTime,
      type: 'game_complete',
      value: {
        finalScore,
        totalDuration: duration,
        correct,
        incorrect,
        missed,
        accuracy,
        avgResponseTime
      }
    }];

    setTimeout(() => {
      onComplete({
        score: finalScore,
        duration,
        accuracyPercentage: Math.round(accuracy),
        averageResponseTime: Math.round(avgResponseTime || 0),
        totalMoves: correct + incorrect,
        hesitationCount: hesitations,
        pauseCount: 0,
        rawData: {
          correct,
          incorrect,
          missed,
          accuracy,
          averageResponseTime: Math.floor(avgResponseTime),
          falsePositives,
          events: finalEvents,
          gameStartTime,
          gameEndTime,
        },
      });
    }, 500);
  };

  return (
    <div className="min-h-screen p-4 page-transition" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="max-w-3xl mx-auto">
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
            <div className="text-5xl">👁️</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                التركيز والانتباه
              </h2>
              <p style={{ color: 'var(--gray-400)' }}>
                اضغط فقط عند ظهور {targetSymbol}
              </p>
            </div>
          </div>

          <div className="flex justify-around text-center">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-blue-light)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                {round} / {totalRounds}
              </div>
              <div className="text-sm" style={{ color: 'var(--gray-400)' }}>الجولة</div>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E8F5E9' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--green-success)' }}>
                {correct}
              </div>
              <div className="text-sm" style={{ color: 'var(--gray-400)' }}>صحيح</div>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#FFEBEE' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--red-accent)' }}>
                {incorrect}
              </div>
              <div className="text-sm" style={{ color: 'var(--gray-400)' }}>خطأ</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="w-full aspect-square max-w-sm mx-auto rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: '#667eea',
            fontSize: '10rem',
            border: '8px solid #FFFFFF'
          }}
        >
          {currentSymbol || '👀'}
        </button>
      </div>
    </div>
  );
}
