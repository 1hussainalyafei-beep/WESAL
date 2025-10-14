import { useState } from 'react';
import { ArrowRight, Send, Sparkles } from 'lucide-react';

interface AIAssistantPageProps {
  onBack: () => void;
}

export function AIAssistantPage({ onBack }: AIAssistantPageProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    { role: 'assistant', content: 'مرحباً! أنا المساعد الذكي وصال 🌟 أنا هنا لمساعدتك في أي أسئلة لديك. ماذا تريد أن تعرف؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'شكراً على سؤالك! المساعد الذكي سيكون متاحاً قريباً بميزات أكثر تطوراً. في الوقت الحالي، يمكنك استخدام خيارات التقييم والاستشارة الطبية المتاحة.'
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="text-white p-6"
           style={{
             background: 'linear-gradient(135deg, #FFB6D9 0%, #FFD4E8 100%)'
           }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-2">
              <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">المساعد الذكي</h1>
              <p className="text-white/90 text-sm">اسأل عن أي شيء يخطر ببالك</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="rounded-2xl p-6 mb-4"
             style={{
               backgroundColor: 'white',
               boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
               minHeight: '60vh',
               maxHeight: '60vh',
               overflowY: 'auto'
             }}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'rounded-tr-none'
                    : 'rounded-tl-none'
                }`}
                     style={{
                       backgroundColor: message.role === 'user' ? '#5B4B9D' : '#FFB6D9',
                       color: message.role === 'user' ? 'white' : '#5B4B9D'
                     }}>
                  <p className="text-base leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="max-w-[80%] p-4 rounded-2xl rounded-tl-none"
                     style={{ backgroundColor: '#FFB6D9', color: '#5B4B9D' }}>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 px-6 py-4 rounded-xl border-2 transition-all"
            style={{
              borderColor: '#E0E0E0',
              backgroundColor: 'white'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#FFB6D9',
              color: '#5B4B9D',
              boxShadow: '0 4px 12px rgba(255, 182, 217, 0.3)'
            }}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
