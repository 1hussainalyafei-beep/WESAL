import { useEffect, useState } from 'react';
import { DNALoader } from '../Common/DNALoader';

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
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="max-w-md w-full mx-4 text-center">
        <div className="mb-8">
          <div className="mb-8">
            <DNALoader message={gameName} />
          </div>

          <h2 className="text-3xl font-bold mb-4 text-white">
            الذكاء الاصطناعي يحلل أدائك الآن...
          </h2>

          <p className="text-xl mb-8 text-white" style={{ opacity: 0.9 }}>
            {gameName}
          </p>

          <div className="w-full h-6 rounded-full overflow-hidden"
               style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FFD700, #FFA500)',
              }}
            />
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {progress}%
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-xl"
               style={{
                 backgroundColor: 'rgba(255,255,255,0.2)',
                 opacity: progress > 25 ? 1 : 0.3,
                 transition: 'opacity 0.5s',
               }}>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white font-semibold">تحليل الدقة والسرعة</span>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl"
               style={{
                 backgroundColor: 'rgba(255,255,255,0.2)',
                 opacity: progress > 50 ? 1 : 0.3,
                 transition: 'opacity 0.5s',
               }}>
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-white font-semibold">مقارنة مع المعايير العمرية</span>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl"
               style={{
                 backgroundColor: 'rgba(255,255,255,0.2)',
                 opacity: progress > 75 ? 1 : 0.3,
                 transition: 'opacity 0.5s',
               }}>
            <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
            <span className="text-white font-semibold">إعداد التوصيات  </span>
          </div>
        </div>
      </div>
    </div>
  );
}
