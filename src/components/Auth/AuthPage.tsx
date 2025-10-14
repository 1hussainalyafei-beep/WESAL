import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Calendar, Phone, Baby } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthPageProps {
  onVisitorMode?: () => void;
}

export function AuthPage({ onVisitorMode }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');
  const [childGender, setChildGender] = useState<'male' | 'female' | 'other'>('male');
  const [parentPhone, setParentPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!parentName || !childName || !childBirthDate) {
          setError('يرجى إدخال جميع البيانات المطلوبة');
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await signUp(email, password);

        if (authError || !authData?.user) {
          throw authError || new Error('فشل إنشاء الحساب');
        }

        const { error: profileError } = await supabase
          .from('children_profiles')
          .insert({
            user_id: authData.user.id,
            child_name: childName,
            birth_date: childBirthDate,
            gender: childGender,
            parent_name: parentName,
            parent_email: email,
            parent_phone: parentPhone
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('تم إنشاء الحساب ولكن فشل حفظ البيانات');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{
           background: 'linear-gradient(135deg, #5B4B9D 0%, #7B68B0 50%, #A8C7E7 100%)'
         }}>
      <div className="absolute inset-0 opacity-10"
           style={{
             backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
             backgroundSize: '50px 50px'
           }}></div>

      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="rounded-2xl p-8 page-transition backdrop-blur-sm"
             style={{
               backgroundColor: 'rgba(255, 255, 255, 0.95)',
               boxShadow: '0 8px 32px rgba(91, 75, 157, 0.2)'
             }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-4 bg-white p-3"
              style={{ border: '3px solid #5B4B9D' }}>
              <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#5B4B9D' }}>
              {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </h2>
            <p className="text-base" style={{ color: '#7B68B0' }}>
              منصة وصال للتقييم المعرفي
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#212121' }}>
                    اسم ولي الأمر
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="input-field pr-10"
                      placeholder="أدخل اسم ولي الأمر"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#212121' }}>
                    اسم الطفل
                  </label>
                  <div className="relative">
                    <Baby className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="input-field pr-10"
                      placeholder="أدخل اسم الطفل"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#212121' }}>
                    تاريخ ميلاد الطفل
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={childBirthDate}
                      onChange={(e) => setChildBirthDate(e.target.value)}
                      className="input-field pr-10"
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#212121' }}>
                    جنس الطفل
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setChildGender('male')}
                      className={`py-2 px-4 rounded-xl font-semibold transition-all ${
                        childGender === 'male'
                          ? 'bg-[#5B4B9D] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      ذكر
                    </button>
                    <button
                      type="button"
                      onClick={() => setChildGender('female')}
                      className={`py-2 px-4 rounded-xl font-semibold transition-all ${
                        childGender === 'female'
                          ? 'bg-[#5B4B9D] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      أنثى
                    </button>
                    <button
                      type="button"
                      onClick={() => setChildGender('other')}
                      className={`py-2 px-4 rounded-xl font-semibold transition-all ${
                        childGender === 'other'
                          ? 'bg-[#5B4B9D] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      آخر
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#212121' }}>
                    رقم الهاتف (اختياري)
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="input-field pr-10"
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#212121' }}>
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pr-10"
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#212121' }}>
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm text-center bg-red-50 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? 'جارٍ التحميل...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="w-full text-center font-semibold"
              style={{ color: '#5B4B9D' }}
            >
              {isSignUp ? 'لديك حساب؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب'}
            </button>

            {onVisitorMode && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2" style={{ borderColor: '#E0E0E0' }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-base font-semibold"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#7B68B0' }}>
                      أو
                    </span>
                  </div>
                </div>

                <button
                  onClick={onVisitorMode}
                  className="w-full px-12 py-4 rounded-xl text-lg font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: '#FFB6D9',
                    color: '#5B4B9D',
                    boxShadow: '0 4px 12px rgba(255, 182, 217, 0.3)'
                  }}
                >
                  الدخول كزائر
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
