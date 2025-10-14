import { useState } from 'react';
import { Brain, Stethoscope, BarChart3, Eye, ShoppingBag, LogOut, Sparkles } from 'lucide-react';
import { DailyTasks } from './DailyTasks';
import { useAuth } from '../../contexts/AuthContext';

interface MainHomeProps {
  childName: string;
  onNavigate: (section: string) => void;
}

export function MainHome({ childName, onNavigate }: MainHomeProps) {
  const { signOut } = useAuth();
  const [tasks, setTasks] = useState([
    { id: '1', title: 'لعب لعبة الذاكرة', completed: false, icon: '🧠' },
    { id: '2', title: 'قراءة قصة قصيرة', completed: false, icon: '📚' },
    { id: '3', title: 'شرب 4 أكواب ماء', completed: false, icon: '💧' },
    { id: '4', title: 'ممارسة الرياضة', completed: false, icon: '⚽' },
  ]);

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const remainingMenuItems = [
    {
      id: 'consultation',
      title: 'استشارة طبيب',
      subtitle: 'تحدث مع متخصص',
      icon: Stethoscope,
      bgColor: '#26A69A',
      iconBg: '#4DB6AC',
    },
    {
      id: 'store',
      title: 'المتجر',
      subtitle: 'ألعاب وأدوات تعليمية',
      icon: ShoppingBag,
      bgColor: '#FFA726',
      iconBg: '#FFB74D',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <header className="p-6 rounded-b-3xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center p-3"
                 style={{ background: 'linear-gradient(135deg, #5B4B9D 0%, #7B68B0 50%, #9575CD 100%)' }}>
              <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                مرحبًا {childName}! 👋
              </h1>
              <p className="text-base text-white" style={{ opacity: 0.9 }}>
                مستعد لمغامرة تعليمية ممتعة اليوم؟
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-3 rounded-xl transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            {/* الزر الرئيسي الكبير */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--primary-purple)' }}>
                ابدأ رحلتك التعليمية
              </h2>
              <button
                onClick={() => window.open('https://appwisal.bolt.host/', '_blank')}
                className="relative group w-full max-w-2xl mx-auto p-8 rounded-3xl text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
                style={{
                  background: 'linear-gradient(135deg, #5B4B9D 0%, #7B68B0 50%, #9575CD 100%)',
                  boxShadow: '0 8px 32px rgba(91, 75, 157, 0.4)',
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center p-4"
                       style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
                  </div>
                  
                  <h3 className="text-4xl font-bold text-white mb-4">
                    🎮 ابدأ الألعاب التفاعلية
                  </h3>
                  
                  <p className="text-xl text-white/90 mb-6 leading-relaxed">
                    اكتشف قدراتك المعرفية من خلال ألعاب ممتعة وتفاعلية
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 text-lg font-semibold text-white">
                    <span>انطلق الآن</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                      <span className="text-2xl">🚀</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* الأزرار المتبقية */}
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-purple)' }}>
                خدمات إضافية
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {remainingMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="rounded-2xl p-6 text-right hover:scale-105 transition-all duration-200 hover:shadow-xl"
                    style={{
                      backgroundColor: item.bgColor,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                           style={{ backgroundColor: item.iconBg }}>
                        <item.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {item.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <DailyTasks tasks={tasks} onToggleTask={handleToggleTask} />

            <div className="card mt-6 text-center p-6">
              <div className="text-6xl mb-3">⭐</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
                نقاطك اليوم
              </h3>
              <div className="text-4xl font-bold" style={{ color: 'var(--secondary-pink)' }}>
                {tasks.filter(t => t.completed).length * 25}
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--gray-400)' }}>
                أكمل المزيد من المهام لتكسب نقاط أكثر!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
