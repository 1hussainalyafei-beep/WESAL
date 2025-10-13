import { Brain, Stethoscope, BarChart3, Eye, ShoppingBag } from 'lucide-react';

interface HomeScreenProps {
  childName: string;
  onNavigate: (section: string) => void;
}

const menuItems = [
  {
    id: 'assessment',
    title: 'ابدأ التقييم',
    icon: Brain,
    color: 'var(--primary-purple)',
    bgColor: 'var(--primary-purple-lighter)',
  },
  {
    id: 'consultation',
    title: 'استشارة طبيب',
    icon: Stethoscope,
    color: 'var(--blue-light)',
    bgColor: 'var(--blue-lighter)',
  },
  {
    id: 'reports',
    title: 'التقارير والتحاليل',
    icon: BarChart3,
    color: 'var(--green-success)',
    bgColor: '#E8F5E9',
  },
  {
    id: 'behavior',
    title: 'أداة المراقبة السلوكية',
    icon: Eye,
    color: 'var(--red-accent)',
    bgColor: '#FFEBEE',
  },
  {
    id: 'store',
    title: 'المتجر',
    icon: ShoppingBag,
    color: 'var(--secondary-pink)',
    bgColor: 'var(--secondary-pink-light)',
  },
];

export function HomeScreen({ childName, onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            مرحباً {childName}!
          </h1>
          <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
            استعد لاستكشاف قدراتك المذهلة اليوم
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="card text-right p-8 cursor-pointer slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: item.bgColor }}
              >
                <item.icon className="w-8 h-8" style={{ color: item.color }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                {item.title}
              </h3>
            </button>
          ))}
        </div>

        <div className="mt-8 card fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>
                نجم اليوم
              </h3>
              <p style={{ color: 'var(--gray-400)' }}>
                لقد أكملت 3 ألعاب هذا الأسبوع
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>
    </div>
  );
}
