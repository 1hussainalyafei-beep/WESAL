import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="card max-w-md w-full mx-4 fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--primary-purple)' }}>
            {isSignUp ? (
              <UserPlus className="w-8 h-8 text-white" />
            ) : (
              <LogIn className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h2>
          <p className="mt-2" style={{ color: 'var(--gray-400)' }}>
            منصة التقييم المعرفي للأطفال
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="example@email.com"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--secondary-pink-light)', color: 'var(--red-accent)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'جارٍ التحميل...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--primary-purple)' }}
          >
            {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب'}
          </button>
        </div>
      </div>
    </div>
  );
}
