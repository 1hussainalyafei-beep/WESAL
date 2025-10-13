import { useState, useEffect } from 'react';

interface PatternGameProps {
  onComplete: (data: any) => void;
}

const patterns = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], options: ['🔴', '🟢', '🔵'], answer: 0 },
  { sequence: ['⭐', '⭐', '🌙', '⭐', '⭐'], options: ['⭐', '🌙', '☀️'], answer: 1 },
  { sequence: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], options: ['5️⃣', '1️⃣', '3️⃣'], answer: 0 },
  { sequence: ['🟥', '🟧', '🟨', '🟩'], options: ['🟦', '🟥', '⬛'], answer: 0 },
  { sequence: ['🍎', '🍎', '🍌', '🍎', '🍎'], options: ['🍎', '🍌', '🍊'], answer: 1 },
  { sequence: ['⬆️', '➡️', '⬇️', '⬅️'], options: ['⬆️', '➡️', '⬇️'], answer: 0 },
];

export function PatternGame({ onComplete }: PatternGameProps) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [patternStartTime, setPatternStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  useEffect(() => {
    setPatternStartTime(Date.now());
  }, [currentPattern]);

  const handleAnswer = (selectedIndex: number) => {
    const responseTime = Date.now() - patternStartTime;
    setResponseTimes([...responseTimes, responseTime]);

    if (selectedIndex === patterns[currentPattern].answer) {
      setCorrect(correct + 1);
    }

    if (currentPattern < patterns.length - 1) {
      setTimeout(() => setCurrentPattern(currentPattern + 1), 500);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const accuracy = (correct / patterns.length) * 100;

    setTimeout(() => {
      onComplete({
        score: Math.min(100, Math.floor(accuracy)),
        duration,
        rawData: {
          correct,
          total: patterns.length,
          accuracy,
          averageResponseTime: Math.floor(avgResponseTime),
        },
      });
    }, 500);
  };

  const pattern = patterns[currentPattern];

  return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-2xl w-full">
        <div className="card mb-6 text-center fade-in">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            لعبة تمييز الأنماط
          </h2>
          <p className="mb-4" style={{ color: 'var(--gray-400)' }}>
            ما هو العنصر التالي في التسلسل؟
          </p>
          <div>
            <span className="font-semibold">السؤال: </span>
            <span>{currentPattern + 1} / {patterns.length}</span>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex justify-center items-center gap-4 text-5xl">
            {pattern.sequence.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
            <span className="text-3xl">→</span>
            <span className="text-4xl">❓</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {pattern.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="aspect-square rounded-2xl text-5xl flex items-center justify-center card"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
