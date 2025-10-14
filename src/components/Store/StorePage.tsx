import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface StorePageProps {
  onBack: () => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="mb-6 btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          العودة
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="fade-in">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
              المتجر
            </h1>
            <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
              ألعاب تقليدية مفيدة لتطوير قدرات طفلك
            </p>
          </div>
          
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8D6E63 0%, #A1887F 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(141, 110, 99, 0.3)'
            }}
          >
            <ShoppingCart className="w-5 h-5 inline ml-2" />
            السلة ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            {cart.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            )}
          </button>
        </div>

        {showCart && (
          <div className="card mb-6 p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-purple)' }}>
              🛒 سلة التسوق
            </h3>
            {cart.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--gray-400)' }}>
                السلة فارغة
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--gray-100)' }}>
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-sm" style={{ color: 'var(--gray-400)' }}>الكمية: {item.quantity}</p>
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--primary-purple)' }}>
                      {item.price * item.quantity} ريال
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">المجموع:</span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                      {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ريال
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #6D4C41 0%, #8D6E63 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(109, 76, 65, 0.3)'
                    }}
                  >
                    إتمام الشراء
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showCheckout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4 p-8 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-purple)' }}>
                قريباً جداً!
              </h3>
              <p className="text-lg mb-6" style={{ color: 'var(--gray-400)' }}>
                خدمة الدفع والشحن ستكون متوفرة قريباً. نعمل على توفير أفضل تجربة تسوق لك!
              </p>
              <button
                onClick={() => setShowCheckout(false)}
                className="px-6 py-3 rounded-xl font-bold"
                style={{
                  backgroundColor: 'var(--primary-purple)',
                  color: 'white'
                }}
              >
                حسناً
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="card slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-center mb-4">
                <div className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl mb-4"
                  style={{ background: 'linear-gradient(135deg, #E8E5F2 0%, #F8BBD0 100%)' }}>
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
                    style={{ background: 'linear-gradient(135deg, #A8C7E7 0%, #E8E5F2 100%)', color: 'var(--primary-purple)' }}>
                    موصى به
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  const existingItem = cart.find(item => item.id === product.id);
                  if (existingItem) {
                    setCart(cart.map(item => 
                      item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                    ));
                  } else {
                    setCart([...cart, { 
                      id: product.id, 
                      name: product.name, 
                      price: product.price, 
                      quantity: 1 
                    }]);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #8D6E63 0%, #A1887F 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(141, 110, 99, 0.3)'
                }}
              >
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