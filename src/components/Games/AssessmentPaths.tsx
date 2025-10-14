import { ArrowRight, Brain, List, PlayCircle } from 'lucide-react';

interface AssessmentPathsProps {
  onSelectPath: (path: 'single' | 'all' | 'view-reports') => void;
  onBack: () => void;
}

export function AssessmentPaths({ onSelectPath, onBack }: AssessmentPathsProps) {
  const paths = [
    {
      id: 'single' as const,
      title: 'اختبار لعبة واحدة',
      description: 'جرّب لعبة محددة واحصل على تقريرها',
      duration: '2-3 دقائق',
      icon: PlayCircle,
      color: '#7E57C2',
      iconBg: '#9575CD',
    },
    {
      id: 'all' as const,
      title: 'اختبار جميع الألعاب',
      description: 'شغّل جميع الألعاب بالتتابع واحصل على تقرير شامل',
      duration: '12-15 دقيقة',
      icon: Brain,
      color: '#5B4B9D',
      iconBg: '#7B68B0',
    },
    {
      id: 'view-reports' as const,
      title: 'تقرير كامل من الجولة الأخيرة',
      description: 'اعرض آخر التقارير الشاملة والجزئية بالتواريخ',
      duration: '',
      icon: List,
      color: '#42A5F5',
      iconBg: '#64B5F6',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <header className="p-6 rounded-b-3xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              ابدأ التقييم
            </h1>
            <p className="text-base text-white" style={{ opacity: 0.9 }}>
              اختر المسار المناسب لك
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {paths.map((path) => (
            <button
              key={path.id}
              onClick={() => onSelectPath(path.id)}
              className="w-full rounded-2xl p-6 text-right transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{
                backgroundColor: path.color,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-white" />
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center p-1">
                  <img src="/w.png" alt="وصال" className="w-full h-full object-contain opacity-80" />
                </div>
              </div>
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: path.iconBg }}
                >
                  <path.icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {path.title}
                  </h3>
                  <p className="text-white/90 text-base leading-relaxed mb-2">
                    {path.description}
                  </p>
                  {path.duration && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg"
                         style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <span className="text-white text-sm font-semibold">
                        ⏱️ {path.duration}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <ArrowRight className="w-8 h-8 text-white" style={{ transform: 'rotate(180deg)' }} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl p-6"
             style={{ backgroundColor: '#E3F2FD' }}>
          <p className="text-center font-semibold" style={{ color: '#1976D2' }}>
            💡 نصيحة: للحصول على تقييم شامل ودقيق، ننصح بإكمال جميع الألعاب
          </p>
        </div>
      </main>
    </div>
  );
}
