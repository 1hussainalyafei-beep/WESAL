import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface StorePageProps {
  onBack: () => void;
}

const products = [
  {
    id: '1',
    name: 'مكعبات البناء الملونة',
    description: 'تطوير المهارات الحركية والتفكير المكاني',
    price: 120,
    image: '🧱',
    category: 'visual',
  },
  {
    id: '2',
    name: 'لعبة الأشكال المتطابقة',
    description: 'تعزيز الذاكرة البصرية والتركيز',
    price: 85,
    image: '🔷',
    category: 'memory',
  },
  {
    id: '3',
    name: 'أحجية خشبية تعليمية',
    description: 'تنمية المنطق وحل المشكلات',
    price: 95,
    image: '🧩',
    category: 'logic',
  },
  {
    id: '4',
    name: 'لوحة الرسم المغناطيسية',
    description: 'تشجيع الإبداع والتعبير الفني',
    price: 150,
    image: '🎨',
    category: 'creative',
  },
  {
    id: '5',
    name: 'لعبة الأنماط والتسلسل',
    description: 'تطوير مهارات التمييز والتصنيف',
    price: 110,
    image: '🔢',
    category: 'pattern',
  },
  {
    id: '6',
    name: 'بطاقات الذاكرة الملونة',
    description: 'تقوية الذاكرة قصيرة المدى',
    price: 65,
    image: '🃏',
    category: 'memory',
  },
];

export function StorePage({ onBack }: StorePageProps) {
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
            المتجر
          </h1>
          <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
            ألعاب تقليدية مفيدة لتطوير قدرات طفلك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="card slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-center mb-4">
                <div className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl mb-4"
                  style={{ backgroundColor: 'var(--gray-100)' }}>
                  {product.image}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                  {product.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--gray-400)' }}>
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                    {product.price} ريال
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'var(--blue-lighter)', color: 'var(--primary-purple)' }}>
                    موصى به
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                إضافة للسلة
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 card fade-in text-center" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
            توصيات خاصة لطفلك
          </h3>
          <p style={{ color: 'var(--gray-400)' }}>
            بناءً على نتائج التقييم، نوصي بالألعاب التي تدعم المجالات التي تحتاج تطوير
          </p>
        </div>
      </div>
    </div>
  );
}
