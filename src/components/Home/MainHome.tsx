import { useState } from 'react';
import { Brain, Stethoscope, BarChart3, Eye, ShoppingBag, LogOut, Heart, Sparkles } from 'lucide-react';
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

  const menuItems = [
    {
      id: 'assessment',
      title: 'ابدأ التقييم',
      subtitle: 'العب واكتشف قدراتك',
      icon: Brain,
      bgColor: '#5B4B9D',
      iconBg: '#7B68B0',
    },
    {
      id: 'reports',
      title: 'التقارير',
      subtitle: 'شاهد تقدمك',
      icon: BarChart3,
      bgColor: '#42A5F5',
      iconBg: '#64B5F6',
    },
    {
      id: 'consultation',
      title: 'استشارة طبيب',
      subtitle: 'تحدث مع متخصص',
      icon: Stethoscope,
      bgColor: '#26A69A',
      iconBg: '#4DB6AC',
    },
    {
      id: 'ai-assistant',
      title: 'المساعد الذكي',
      subtitle: 'اسأل واستكشف',
      icon: Sparkles,
      bgColor: '#7E57C2',
      iconBg: '#9575CD',
    },
    {
      id: 'behavior',
      title: 'المراقبة السلوكية',
      subtitle: 'تتبع أنشطتك',
      icon: Eye,
      bgColor: '#FF7043',
      iconBg: '#FF8A65',
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
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <Brain className="w-7 h-7" style={{ color: '#667eea' }} />
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
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-purple)' }}>
              اختر نشاطك
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
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
