import { useState, useEffect } from 'react';

interface LogicGameProps {
  onComplete: (data: any) => void;
}

const puzzles = [
  { items: ['🍎', '🍊', '🍌', '🚗'], answer: 3, question: 'أي عنصر لا ينتمي للمجموعة؟' },
  { items: ['🐶', '🐱', '🐭', '🌳'], answer: 3, question: 'أي عنصر لا ينتمي للمجموعة؟' },
  { items: ['⚽', '🏀', '🎾', '📚'], answer: 3, question: 'أي عنصر لا ينتمي للمجموعة؟' },
  { items: ['🟥', '🟧', '🟨', '⭐'], answer: 3, question: 'أي شكل مختلف؟' },
  { items: ['1️⃣', '2️⃣', '3️⃣', '🅰️'], answer: 3, question: 'أي عنصر مختلف؟' },
  { items: ['☀️', '🌙', '⭐', '🍕'], answer: 3, question: 'أي عنصر لا ينتمي؟' },
];

export function LogicGame({ onComplete }: LogicGameProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now());
  const [thinkingTimes, setThinkingTimes] = useState<number[]>([]);

  useEffect(() => {
    setPuzzleStartTime(Date.now());
  }, [currentPuzzle]);

  const handleAnswer = (selectedIndex: number) => {
    const thinkingTime = Date.now() - puzzleStartTime;
    setThinkingTimes([...thinkingTimes, thinkingTime]);
    setAttempts(attempts + 1);

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
    const avgThinkingTime = thinkingTimes.reduce((a, b) => a + b, 0) / thinkingTimes.length;
    const accuracy = (correct / puzzles.length) * 100;
    const score = Math.min(100, Math.floor(accuracy));

    setTimeout(() => {
      onComplete({
        score,
        duration,
        rawData: {
          correct,
          total: puzzles.length,
          accuracy,
          averageThinkingTime: Math.floor(avgThinkingTime),
          levelReached: correct,
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
            لعبة المنطق
          </h2>
          <p className="mb-4" style={{ color: 'var(--gray-400)' }}>
            {puzzle.question}
          </p>
          <div className="flex justify-center gap-4">
            <div>
              <span className="font-semibold">السؤال: </span>
              <span>{currentPuzzle + 1} / {puzzles.length}</span>
            </div>
            <div>
              <span className="font-semibold">صحيح: </span>
              <span style={{ color: 'var(--green-success)' }}>{correct}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {puzzle.items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="aspect-square rounded-2xl text-6xl flex items-center justify-center card transition-all"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
