import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { BehaviorLog } from '../../types';
import { supabase } from '../../lib/supabase';

interface BehaviorPageProps {
  childId: string;
  onBack: () => void;
}

export function BehaviorPage({ childId, onBack }: BehaviorPageProps) {
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBehaviorLogs();
  }, [childId]);

  const loadBehaviorLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('behavior_logs')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading behavior logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'game_quit':
        return <AlertTriangle className="w-5 h-5" style={{ color: '#FF6B6B' }} />;
      case 'game_complete':
        return <TrendingUp className="w-5 h-5" style={{ color: '#4CAF50' }} />;
      default:
        return <Activity className="w-5 h-5" style={{ color: '#FFB6D9' }} />;
    }
  };

  const getEventText = (eventType: string) => {
    const events: Record<string, string> = {
      game_start: 'بدء لعبة',
      game_complete: 'إكمال لعبة',
      game_quit: 'ترك اللعبة',
      long_pause: 'توقف طويل',
      repeated_game: 'تكرار لعبة',
    };
    return events[eventType] || eventType;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
            جارٍ التحميل...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <header className="p-6 rounded-b-3xl shadow-lg"
              style={{ backgroundColor: '#FFB6D9' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" style={{ color: '#5B4B9D' }} />
                <div className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center p-1">
                  <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
                </div>
              </div>
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#5B4B9D' }}>
              أداة المراقبة السلوكية
            </h1>
            <p className="text-base" style={{ color: '#5B4B9D', opacity: 0.8 }}>
              تتبّع أنماط اللعب والتفاعل
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card text-center">
            <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: '#5B4B9D' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#5B4B9D' }}>
              ألعاب مكتملة
            </h3>
            <div className="text-4xl font-bold" style={{ color: '#5B4B9D' }}>
              {logs.filter(l => l.event_type === 'game_complete').length}
            </div>
            <p className="text-sm mt-2" style={{ color: '#9E9E9E' }}>
              في آخر 7 أيام
            </p>
          </div>

          <div className="card text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: '#5B4B9D' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#5B4B9D' }}>
              معدل الإكمال
            </h3>
            <div className="text-4xl font-bold" style={{ color: '#5B4B9D' }}>
              {Math.round(logs.filter(l => l.event_type === 'game_complete').length / Math.max(logs.filter(l => l.event_type === 'game_start').length, 1) * 100)}%
            </div>
            <p className="text-sm mt-2" style={{ color: '#9E9E9E' }}>
              نسبة الإكمال من البدء
            </p>
          </div>

          <div className="card text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3" style={{ color: '#FFB6D9' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#5B4B9D' }}>
              ترك مبكر
            </h3>
            <div className="text-4xl font-bold" style={{ color: '#5B4B9D' }}>
              {logs.filter(l => l.event_type === 'game_quit').length}
            </div>
            <p className="text-sm mt-2" style={{ color: '#9E9E9E' }}>
              مرات ترك الألعاب
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#5B4B9D' }}>
            سجل الأنشطة
          </h3>

          {logs.length === 0 ? (
            <div className="text-center py-12 rounded-xl"
                 style={{ backgroundColor: '#A8C7E7' }}>
              <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: '#5B4B9D' }} />
              <p className="text-lg font-semibold" style={{ color: '#5B4B9D' }}>
                لا توجد بيانات سلوكية بعد
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 20).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: '#A8C7E7' }}
                >
                  <div className="flex items-center gap-4">
                    {getEventIcon(log.event_type)}
                    <div>
                      <div className="font-bold text-lg" style={{ color: '#5B4B9D' }}>
                        {getEventText(log.event_type)}
                      </div>
                      {log.game_type && (
                        <div className="text-sm" style={{ color: '#5B4B9D', opacity: 0.7 }}>
                          {log.game_type}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: '#5B4B9D' }}>
                      {new Date(log.created_at).toLocaleDateString('ar')}
                    </div>
                    <div className="text-xs" style={{ color: '#5B4B9D', opacity: 0.7 }}>
                      {new Date(log.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
