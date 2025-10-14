import { useEffect, useState } from 'react';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';

interface FinalReportAnimationProps {
  gamesCompleted: number;
}

export function FinalReportAnimation({ gamesCompleted }: FinalReportAnimationProps) {
  const [dots, setDots] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
         style={{
           background: 'linear-gradient(135deg, rgba(91, 75, 157, 0.95) 0%, rgba(123, 104, 176, 0.95) 50%, rgba(168, 199, 231, 0.95) 100%)'
         }}>
      <div className="absolute inset-0 overflow-hidden">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: 0.4,
              animation: `pulse 3s ease-in-out ${particle.delay}s infinite`
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-white/10 animate-pulse"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="502"
                strokeDashoffset="502"
                strokeLinecap="round"
                style={{
                  animation: 'drawCircle 2s ease-out forwards',
                  transformOrigin: 'center',
                  transform: 'rotate(-90deg)'
                }}
              />

              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <g key={i}>
                  <line
                    x1="100"
                    y1="100"
                    x2={100 + Math.cos((angle * Math.PI) / 180) * 70}
                    y2={100 + Math.sin((angle * Math.PI) / 180) * 70}
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="1"
                  />
                  <circle
                    cx={100 + Math.cos((angle * Math.PI) / 180) * 70}
                    cy={100 + Math.sin((angle * Math.PI) / 180) * 70}
                    r="8"
                    fill="white"
                    opacity="0"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${i * 0.3}s forwards`
                    }}
                  />
                </g>
              ))}
            </svg>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Brain className="w-20 h-20 text-white animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <TrendingUp className="w-7 h-7 text-white animate-pulse" />
            <h2 className="text-3xl font-bold text-white">
              جاري تحليل التقرير الشامل{dots}
            </h2>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
            <p className="text-xl text-white/90 mb-3">
              تحليل النتائج من {gamesCompleted} ألعاب
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 bg-white/30 rounded-full flex-1 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: '100%',
                    animation: 'slideIn 2s ease-out'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"
                 style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"
                 style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"
                 style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
