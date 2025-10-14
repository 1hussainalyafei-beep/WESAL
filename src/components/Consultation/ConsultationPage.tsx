import { ArrowLeft, Calendar, MessageCircle, User } from 'lucide-react';

interface ConsultationPageProps {
  onBack: () => void;
}

const specialists = [
  {
    id: '1',
    name: 'د. أحمد الشمري',
    specialty: 'أخصائي نفسي للأطفال',
    bio: 'خبرة 15 سنة في تقييم القدرات المعرفية',
    image: '👨‍⚕️',
  },
  {
    id: '2',
    name: 'د. فاطمة العمري',
    specialty: 'أخصائية تربوية',
    bio: 'متخصصة في تطوير المهارات التعليمية',
    image: '👩‍⚕️',
  },
  {
    id: '3',
    name: 'د. خالد المطيري',
    specialty: 'أخصائي نطق وتخاطب',
    bio: 'خبرة في تطوير المهارات اللغوية والمعرفية',
    image: '👨‍⚕️',
  },
];

export function ConsultationPage({ onBack }: ConsultationPageProps) {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="mb-6 btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center p-1">
            <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
          </div>
          العودة
        </button>

        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            استشارة مختص
          </h1>
          <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
            تواصل مع أفضل المتخصصين في التقييم المعرفي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialists.map((specialist, index) => (
            <div key={specialist.id} className="card slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-4"
                  style={{ backgroundColor: 'var(--blue-lighter)' }}>
                  {specialist.image}
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-dark)' }}>
                  {specialist.name}
                </h3>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--primary-purple)' }}>
                  {specialist.specialty}
                </p>
                <p className="text-sm" style={{ color: 'var(--gray-400)' }}>
                  {specialist.bio}
                </p>
              </div>

              <div className="space-y-2">
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  حجز موعد
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  محادثة
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 card fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
            طلبات الاستشارة السابقة
          </h3>
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-400)' }} />
            <p style={{ color: 'var(--gray-400)' }}>لا توجد طلبات سابقة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
