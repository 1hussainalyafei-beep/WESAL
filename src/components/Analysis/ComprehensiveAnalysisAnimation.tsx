import { useEffect, useState } from 'react';
import { Brain, Target, Zap, Eye, Grid, Palette } from 'lucide-react';

interface ComprehensiveAnalysisAnimationProps {
  onComplete: () => void;
  gamesCompleted: number;
}

export function ComprehensiveAnalysisAnimation({
  onComplete,
  gamesCompleted,
}: ComprehensiveAnalysisAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1);
  const [pulseRings, setPulseRings] = useState(0);

  const skills = [
    { icon: Brain, name: 'الذاكرة', color: '#667eea', delay: 0 },
    { icon: Target, name: 'التركيز', color: '#f093fb', delay: 0.5 },
    { icon: Zap, name: 'المنطق', color: '#4facfe', delay: 1 },
    { icon: Eye, name: 'التفكير البصري', color: '#43e97b', delay: 1.5 },
    { icon: Grid, name: 'الأنماط', color: '#fa709a', delay: 2 },
    { icon: Palette, name: 'الإبداع', color: '#feca57', delay: 2.5 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 1500);
          return 100;
        }
        return prev + 2;
      });
    }, 200);

    const phaseInterval = setInterval(() => {
      setPhase((prev) => (prev < 4 ? prev + 1 : prev));
    }, 5000);

    const pulseInterval = setInterval(() => {
      setPulseRings((prev) => (prev < 3 ? prev + 1 : 0));
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(phaseInterval);
      clearInterval(pulseInterval);
    };
  }, [onComplete]);

  const getPhaseText = () => {
    switch (phase) {
      case 1:
        return 'جمع البيانات من جميع الألعاب...';
      case 2:
        return 'تحليل الأنماط والعلاقات...';
      case 3:
        return 'المقارنة مع المعايير العمرية...';
      case 4:
        return 'إنشاء التوصيات المخصصة...';
      default:
        return 'جارٍ التحليل...';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl w-full mx-4 relative z-10">
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="relative inline-block mb-8">
            <div className="relative w-48 h-48 mx-auto">
              {[0, 1, 2].map((ring) => (
                <div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: `rgba(102, 126, 234, ${0.3 - ring * 0.1})`,
                    transform: `scale(${1 + ring * 0.3})`,
                    opacity: pulseRings >= ring ? 1 : 0,
                    transition: 'all 0.8s ease-out',
                  }}
                />
              ))}

              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center animate-pulse">
                <Brain className="w-24 h-24 text-white" />
              </div>

              <svg
                className="absolute inset-0 w-full h-full animate-spin-slow"
                style={{ animationDuration: '20s' }}
              >
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="10 5"
                  opacity="0.5"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#f093fb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            تحليل شامل بالذكاء الاصطناعي
          </h2>

          <p className="text-xl text-blue-200 mb-2 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            {getPhaseText()}
          </p>

          <p className="text-sm text-blue-300 opacity-80 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            تم تحليل {gamesCompleted} ألعاب معرفية
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            const isActive = progress > index * 16;

            return (
              <div
                key={skill.name}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transition-all duration-500"
                style={{
                  opacity: isActive ? 1 : 0.3,
                  transform: isActive ? 'scale(1)' : 'scale(0.9)',
                  animationDelay: `${skill.delay}s`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${skill.color}, ${skill.color}dd)`
                      : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    } transition-all duration-500`}
                  />
                </div>
                <p className="text-white text-sm font-semibold text-center">{skill.name}</p>
                {isActive && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">التقدم الإجمالي</span>
            <span className="text-blue-300 text-2xl font-bold">{Math.floor(progress)}%</span>
          </div>

          <div className="relative w-full h-4 bg-black/30 rounded-full overflow-hidden">
            <div
              className="absolute h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
              }}
            />
            <div
              className="absolute h-full w-20 bg-white/30 blur-xl"
              style={{
                left: `${progress - 10}%`,
                transition: 'left 0.3s ease-out',
              }}
            />
          </div>
        </div>

        <div className="text-center space-y-2 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-blue-200 text-sm">GPT-4 يعمل الآن</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
            <span className="text-blue-300 text-xs">تحليل عميق • معايير عمرية • توصيات مخصصة</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-blue-200 text-sm">جارٍ معالجة البيانات...</span>
          </div>
        </div>
      </div>

      {progress >= 100 && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 animate-fadeInUp">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-celebration">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">اكتمل التحليل!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
