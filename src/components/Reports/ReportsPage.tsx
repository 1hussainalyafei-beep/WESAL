import { useState, useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { MiniReportService } from '../../services/miniReportService';
import { FinalReportService } from '../../services/finalReportService';
import type { MiniReport, FinalReport } from '../../services/storageService';

interface ReportsPageProps {
  onBack: () => void;
}

export function ReportsPage({ onBack }: ReportsPageProps) {
  const [miniReports, setMiniReports] = useState<MiniReport[]>([]);
  const [finalReports, setFinalReports] = useState<FinalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MiniReport | FinalReport | null>(null);
  const [reportType, setReportType] = useState<'mini' | 'final'>('mini');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const mini = MiniReportService.getAllMiniReports();
    const final = FinalReportService.getAllFinalReports();

    setMiniReports(mini.reverse());
    setFinalReports(final.reverse());
  };

  const isMiniReport = (report: MiniReport | FinalReport): report is MiniReport => {
    return 'gameType' in report;
  };

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
                {isMiniReport(selectedReport) ? `تقرير لعبة ${selectedReport.gameType}` : 'التقرير الشامل'}
              </h2>
              <p className="text-gray-600">
                {new Date(selectedReport.timestamp).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {isMiniReport(selectedReport) && (
                <div className="mt-4 inline-block px-4 py-2 rounded-xl" style={{ backgroundColor: '#E3F2FD' }}>
                  <span className="text-2xl font-bold" style={{ color: '#5B4B9D' }}>
                    النتيجة: {selectedReport.score}/100
                  </span>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none" style={{ direction: 'rtl', textAlign: 'right' }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: '1.8',
                color: '#424242'
              }}>
                {selectedReport.analysis}
              </pre>
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
            عرض جميع تقارير التقييم المعرفي المحفوظة محلياً
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
                <p className="text-sm text-gray-500 mt-2">
                  العب الألعاب للحصول على تقارير تفصيلية
                </p>
              </div>
            ) : (
              miniReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="rounded-2xl p-6 shadow-lg cursor-pointer transition-all hover:scale-105"
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-6 h-6" style={{ color: '#5B4B9D' }} />
                        <h3 className="text-xl font-bold" style={{ color: '#5B4B9D' }}>
                          لعبة {report.gameType}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {report.analysis.substring(0, 150)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.timestamp).toLocaleDateString('ar-SA')}
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
                  onClick={() => setSelectedReport(report)}
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
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {report.analysis.substring(0, 150)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.timestamp).toLocaleDateString('ar-SA')} • {report.miniReportsIds.length} ألعاب
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
