import { useState, useEffect } from 'react';

interface AttentionGameProps {
  onComplete: (data: any) => void;
}

const symbols = ['⭐', '🌟', '✨', '💫', '🔆'];
const targetSymbol = '⭐';

export function AttentionGame({ onComplete }: AttentionGameProps) {
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [startTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const totalRounds = 20;

  useEffect(() => {
    if (round < totalRounds) {
      const timer = setTimeout(() => {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        setCurrentSymbol(randomSymbol);
        setRoundStartTime(Date.now());
        setRound(round + 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (round === totalRounds) {
      finishGame();
    }
  }, [round]);

  const handleClick = () => {
    const responseTime = Date.now() - roundStartTime;
    setResponseTimes([...responseTimes, responseTime]);

    if (currentSymbol === targetSymbol) {
      setCorrect(correct + 1);
      setScore(score + 10);
    } else {
      setIncorrect(incorrect + 1);
      setScore(Math.max(0, score - 5));
    }
    setCurrentSymbol('');
  };

  useEffect(() => {
    if (currentSymbol && currentSymbol !== targetSymbol) {
      const missTimer = setTimeout(() => {
        if (currentSymbol === targetSymbol) {
          setMissed(missed + 1);
        }
        setCurrentSymbol('');
      }, 1500);

      return () => clearTimeout(missTimer);
    }
  }, [currentSymbol]);

  const finishGame = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const accuracy = (correct / (correct + incorrect + missed)) * 100;
    const finalScore = Math.min(100, Math.floor(accuracy));

    onComplete({
      score: finalScore,
      duration,
      rawData: {
        correct,
        incorrect,
        missed,
        accuracy,
        averageResponseTime: Math.floor(avgResponseTime),
      },
    });
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-2xl w-full">
        <div className="card mb-6 text-center fade-in">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            لعبة التركيز والانتباه
          </h2>
          <p style={{ color: 'var(--gray-400)' }}>
            اضغط فقط عند ظهور {targetSymbol}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <div>
              <span className="font-semibold">الجولة: </span>
              <span>{round} / {totalRounds}</span>
            </div>
            <div>
              <span className="font-semibold">صحيح: </span>
              <span style={{ color: 'var(--green-success)' }}>{correct}</span>
            </div>
            <div>
              <span className="font-semibold">خطأ: </span>
              <span style={{ color: 'var(--red-accent)' }}>{incorrect}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="w-full aspect-square rounded-3xl text-9xl flex items-center justify-center card"
          style={{ backgroundColor: 'var(--white)' }}
        >
          {currentSymbol || '👀'}
        </button>
      </div>
    </div>
  );
}
