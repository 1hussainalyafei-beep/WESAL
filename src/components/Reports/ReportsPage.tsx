import { useState, useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';
import { MiniReportService } from '../../services/miniReportService';
import { FinalReportService } from '../../services/finalReportService';

interface ReportsPageProps {
  childId: string;
  onBack: () => void;
}

export function ReportsPage({ childId, onBack }: ReportsPageProps) {
  const [miniReports, setMiniReports] = useState<any[]>([]);
  const [finalReports, setFinalReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportType, setReportType] = useState<'mini' | 'final'>('mini');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [childId]);

  const loadReports = async () => {
    try {
      const { data: childProfile } = await supabase
        .from('children_profiles')
        .select('id')
        .eq('child_id', childId)
        .maybeSingle();

      if (childProfile) {
        const mini = await MiniReportService.getMiniReportsByChildId(childProfile.id);
        const final = await FinalReportService.getFinalReportsByChildId(childProfile.id);

        setMiniReports(mini);
        setFinalReports(final);
      }
    } catch (error) {
      console.error('خطأ في تحميل التقارير:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#5B4B9D' }}>
            جارٍ التحميل...
          </div>
        </div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedReport(null)}
            className="mb-6 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105"
            style={{ backgroundColor: '#FFB6D9', color: '#5B4B9D' }}
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للقائمة
          </button>

          <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'white' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#5B4B9D' }}>
                {reportType === 'mini' ? `تقرير لعبة ${selectedReport.game_type}` : 'التقرير الشامل'}
              </h2>
              <p className="text-gray-600">
                {new Date(selectedReport.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <MarkdownRenderer content={selectedReport.markdown_content || 'لا يوجد محتوى متاح'} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105"
          style={{ backgroundColor: '#FFB6D9', color: '#5B4B9D' }}
        >
          <ArrowLeft className="w-5 h-5" />
          العودة
        </button>

        <div className="rounded-2xl p-8 shadow-lg mb-6" style={{ backgroundColor: 'white' }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#5B4B9D' }}>
            📊 التقارير
          </h1>
          <p className="text-gray-600">
            عرض جميع تقارير التقييم المعرفي
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setReportType('mini')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              reportType === 'mini'
                ? 'bg-[#5B4B9D] text-white scale-105'
                : 'bg-white text-[#5B4B9D]'
            }`}
          >
            تقارير الألعاب ({miniReports.length})
          </button>
          <button
            onClick={() => setReportType('final')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              reportType === 'final'
                ? 'bg-[#5B4B9D] text-white scale-105'
                : 'bg-white text-[#5B4B9D]'
            }`}
          >
            التقارير الشاملة ({finalReports.length})
          </button>
        </div>

        {reportType === 'mini' && (
          <div className="space-y-4">
            {miniReports.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'white' }}>
                <p className="text-gray-600">لا توجد تقارير ألعاب حتى الآن</p>
              </div>
            ) : (
              miniReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    setReportType('mini');
                  }}
                  className="rounded-2xl p-6 shadow-lg cursor-pointer transition-all hover:scale-105"
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-6 h-6" style={{ color: '#5B4B9D' }} />
                        <h3 className="text-xl font-bold" style={{ color: '#5B4B9D' }}>
                          لعبة {report.game_type}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-2">{report.feedback}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#E3F2FD' }}
                    >
                      <span className="text-2xl font-bold" style={{ color: '#5B4B9D' }}>
                        {report.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {reportType === 'final' && (
          <div className="space-y-4">
            {finalReports.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'white' }}>
                <p className="text-gray-600">لا توجد تقارير شاملة حتى الآن</p>
                <p className="text-sm text-gray-500 mt-2">
                  أكمل جميع الألعاب للحصول على تقرير شامل
                </p>
              </div>
            ) : (
              finalReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    setReportType('final');
                  }}
                  className="rounded-2xl p-6 shadow-lg cursor-pointer transition-all hover:scale-105"
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-6 h-6" style={{ color: '#5B4B9D' }} />
                        <h3 className="text-xl font-bold" style={{ color: '#5B4B9D' }}>
                          تقرير شامل
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-2">{report.ai_insights}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
