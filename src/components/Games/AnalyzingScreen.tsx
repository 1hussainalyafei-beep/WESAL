import { useEffect, useState } from 'react';

interface AnalyzingScreenProps {
  gameName: string;
  onComplete: () => void;
}

export function AnalyzingScreen({ gameName, onComplete }: AnalyzingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ backgroundColor: '#A8C7E7' }}>
      <div className="max-w-md w-full mx-4 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
               style={{ backgroundColor: '#5B4B9D' }}>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-white animate-bounce"
                   style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-white animate-bounce"
                   style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-white animate-bounce"
                   style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4" style={{ color: '#5B4B9D' }}>
            جارٍ تحليل أدائك بالذكاء الاصطناعي...
          </h2>

          <p className="text-xl mb-8" style={{ color: '#5B4B9D', opacity: 0.8 }}>
            {gameName}
          </p>

          <div className="w-full h-4 rounded-full overflow-hidden"
               style={{ backgroundColor: 'rgba(91, 75, 157, 0.2)' }}>
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: '#5B4B9D',
              }}
            />
          </div>

          <p className="mt-4 text-lg font-semibold" style={{ color: '#5B4B9D' }}>
            {progress}%
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-xl"
               style={{
                 backgroundColor: 'rgba(255,255,255,0.5)',
                 opacity: progress > 30 ? 1 : 0.3,
                 transition: 'opacity 0.5s',
               }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5B4B9D' }}></div>
            <span style={{ color: '#5B4B9D' }}>تحليل الدقة والسرعة</span>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl"
               style={{
                 backgroundColor: 'rgba(255,255,255,0.5)',
                 opacity: progress > 60 ? 1 : 0.3,
                 transition: 'opacity 0.5s',
               }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5B4B9D' }}></div>
            <span style={{ color: '#5B4B9D' }}>مقارنة مع المعايير العمرية</span>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl"
               style={{
                 backgroundColor: 'rgba(255,255,255,0.5)',
                 opacity: progress > 90 ? 1 : 0.3,
                 transition: 'opacity 0.5s',
               }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5B4B9D' }}></div>
            <span style={{ color: '#5B4B9D' }}>إعداد التوصيات والنصائح</span>
          </div>
        </div>
      </div>
    </div>
  );
}
