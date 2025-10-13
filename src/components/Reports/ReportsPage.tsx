import { useState, useEffect } from 'react';
import { Download, Share2, FileText, ArrowLeft } from 'lucide-react';
import { ComprehensiveReport } from '../../types';
import { supabase } from '../../lib/supabase';

interface ReportsPageProps {
  childId: string;
  onBack: () => void;
}

export function ReportsPage({ childId, onBack }: ReportsPageProps) {
  const [reports, setReports] = useState<ComprehensiveReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ComprehensiveReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [childId]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('comprehensive_reports')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
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

  if (selectedReport) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedReport(null)} className="mb-6 btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            العودة للقائمة
          </button>

          <div className="card fade-in mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                تقرير شامل
              </h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg" style={{ backgroundColor: 'var(--gray-100)' }}>
                  <Download className="w-5 h-5" style={{ color: 'var(--primary-purple)' }} />
                </button>
                <button className="p-2 rounded-lg" style={{ backgroundColor: 'var(--gray-100)' }}>
                  <Share2 className="w-5 h-5" style={{ color: 'var(--primary-purple)' }} />
                </button>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="inline-block w-32 h-32 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: `conic-gradient(var(--primary-purple) ${selectedReport.overall_score * 3.6}deg, var(--gray-200) 0deg)`,
                }}>
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                    {selectedReport.overall_score}
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--gray-400)' }}>
                {new Date(selectedReport.assessment_date).toLocaleDateString('ar')}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
                خريطة القدرات المعرفية
              </h3>
              <div className="space-y-4">
                {Object.entries(selectedReport.cognitive_map).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{getCognitiveName(key)}</span>
                      <span style={{ color: 'var(--primary-purple)' }}>{value}</span>
                    </div>
                    <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'var(--gray-200)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${value}%`,
                          backgroundColor: value >= 70 ? 'var(--green-success)' : value >= 50 ? 'var(--blue-light)' : 'var(--yellow-light)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                التحليل التفصيلي
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--gray-400)' }}>
                {selectedReport.detailed_analysis}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                التوصيات
              </h3>
              <ul className="space-y-2">
                {selectedReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span style={{ color: 'var(--primary-purple)' }}>→</span>
                    <span style={{ color: 'var(--gray-400)' }}>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedReport.specialist_alert && (
              <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--secondary-pink-light)' }}>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--red-accent)' }}>
                  تنبيه
                </h3>
                <p style={{ color: 'var(--text-dark)' }}>{selectedReport.specialist_alert}</p>
              </div>
            )}

            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--blue-lighter)' }}>
              <p className="text-lg font-semibold" style={{ color: 'var(--primary-purple)' }}>
                {selectedReport.encouragement}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="mb-6 btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          العودة
        </button>

        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            التقارير والتحاليل
          </h1>
          <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
            مراجعة جميع التقييمات السابقة
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--gray-400)' }} />
            <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
              لا توجد تقارير بعد
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="card text-right slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                    {report.overall_score}
                  </div>
                  <FileText className="w-8 h-8" style={{ color: 'var(--primary-purple)' }} />
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--gray-400)' }}>
                  {new Date(report.assessment_date).toLocaleDateString('ar', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <div className="text-sm" style={{ color: 'var(--text-dark)' }}>
                  اضغط لعرض التفاصيل
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCognitiveName(key: string): string {
  const names: Record<string, string> = {
    memory: 'الذاكرة',
    attention: 'التركيز',
    logic: 'المنطق',
    visual: 'التفكير البصري',
    pattern: 'تمييز الأنماط',
    creative: 'الإبداع',
  };
  return names[key] || key;
}
