import { useEffect, useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface MiniReportAnimationProps {
  gameName: string;
}

export function MiniReportAnimation({ gameName }: MiniReportAnimationProps) {
  const [dots, setDots] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);
  
  const steps = [
    'جمع البيانات من اللعبة...',
    'تحليل الأداء والدقة...',
    'مقارنة مع المعايير العمرية...',
    'إنشاء التوصيات الشخصية...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    
    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => (prev + 1) % steps.length);
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
         style={{
           background: 'linear-gradient(135deg, rgba(91, 75, 157, 0.95) 0%, rgba(123, 104, 176, 0.95) 50%, rgba(168, 199, 231, 0.95) 100%)'
         }}>
      <div className="text-center relative">
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-white/30 animate-spin"
                 style={{ animationDuration: '3s' }}></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-white/20"
                 style={{
                   borderTopColor: 'rgba(255, 255, 255, 0.8)',
                   animation: 'spin 2s linear infinite'
                 }}></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-white rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-60px)`,
                  opacity: 0.6,
                  animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-16 h-16 text-white animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
            <h2 className="text-2xl font-bold text-white">
              جاري تحليل الأداء{dots}
            </h2>
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>

          <p className="text-lg text-white/90">
            {gameName}
          </p>
          
          <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-white font-semibold">
              {steps[analysisStep]}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"
                 style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"
                 style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"
                 style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
