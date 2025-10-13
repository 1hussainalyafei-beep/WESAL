import { useState, useRef, useEffect } from 'react';

interface CreativeGameProps {
  onComplete: (data: any) => void;
}

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

export function CreativeGame({ onComplete }: CreativeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [startTime] = useState(Date.now());
  const [strokes, setStrokes] = useState(0);
  const [colorsUsed, setColorsUsed] = useState<Set<string>>(new Set(['#000000']));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setStrokes(strokes + 1);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setColorsUsed(new Set([...colorsUsed, newColor]));
  };

  const handleComplete = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.min(100, 60 + (colorsUsed.size * 5) + Math.min(20, strokes / 5));

    onComplete({
      score: Math.floor(score),
      duration,
      rawData: {
        totalStrokes: strokes,
        colorsUsed: colorsUsed.size,
        timeSpent: duration,
        diversity: colorsUsed.size / colors.length,
      },
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6 text-center fade-in">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            لعبة الرسم الإبداعي
          </h2>
          <p style={{ color: 'var(--gray-400)' }}>
            ارسم ما تتخيله بحرية
          </p>
        </div>

        <div className="card mb-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            className="w-full border-2 rounded-xl cursor-crosshair"
            style={{ borderColor: 'var(--gray-200)' }}
          />
        </div>

        <div className="card mb-4">
          <div className="flex gap-3 justify-center flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                className="w-12 h-12 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  border: color === c ? '4px solid var(--primary-purple)' : '2px solid var(--gray-200)',
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleComplete}
          className="btn-primary w-full"
        >
          إنهاء الرسم
        </button>
      </div>
    </div>
  );
}
