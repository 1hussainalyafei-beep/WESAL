import { useState, useEffect } from 'react';

interface VisualGameProps {
  onComplete: (data: any) => void;
}

const puzzles = [
  { image: '☁️', options: ['مطر', 'شمس', 'قمر'], answer: 0 },
  { image: '📚', options: ['كتاب', 'كرة', 'سيارة'], answer: 0 },
  { image: '🌙', options: ['نهار', 'ليل', 'صباح'], answer: 1 },
  { image: '🔥', options: ['بارد', 'ساخن', 'رطب'], answer: 1 },
  { image: '❄️', options: ['حار', 'دافئ', 'بارد'], answer: 2 },
  { image: '🌻', options: ['حيوان', 'نبات', 'طعام'], answer: 1 },
];

export function VisualGame({ onComplete }: VisualGameProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  useEffect(() => {
    setPuzzleStartTime(Date.now());
  }, [currentPuzzle]);

  const handleAnswer = (selectedIndex: number) => {
    const responseTime = Date.now() - puzzleStartTime;
    setResponseTimes([...responseTimes, responseTime]);

    if (selectedIndex === puzzles[currentPuzzle].answer) {
      setCorrect(correct + 1);
    }

    if (currentPuzzle < puzzles.length - 1) {
      setTimeout(() => setCurrentPuzzle(currentPuzzle + 1), 500);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const accuracy = (correct / puzzles.length) * 100;

    setTimeout(() => {
      onComplete({
        score: Math.min(100, Math.floor(accuracy)),
        duration,
        rawData: {
          correct,
          total: puzzles.length,
          accuracy,
          averagePerceptionTime: Math.floor(avgResponseTime),
        },
      });
    }, 500);
  };

  const puzzle = puzzles[currentPuzzle];

  return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-2xl w-full">
        <div className="card mb-6 text-center fade-in">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            لعبة التفكير البصري
          </h2>
          <p className="mb-4" style={{ color: 'var(--gray-400)' }}>
            اختر المفهوم المناسب للصورة
          </p>
          <div>
            <span className="font-semibold">السؤال: </span>
            <span>{currentPuzzle + 1} / {puzzles.length}</span>
          </div>
        </div>

        <div className="card mb-6 text-center text-9xl py-12">
          {puzzle.image}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {puzzle.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="card py-6 text-xl font-semibold text-center"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
