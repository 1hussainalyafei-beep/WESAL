import { useEffect, useState } from 'react';
import { GameReport as GameReportType } from '../../types';
import { Loader2, Home, Play, Stethoscope } from 'lucide-react';

interface GameReportProps {
  report: GameReportType | null;
  loading: boolean;
  onNextGame: () => void;
  onHome: () => void;
  onConsult: () => void;
}

export function GameReport({ report, loading, onNextGame, onHome, onConsult }: GameReportProps) {
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (report && !loading) {
      setTimeout(() => setShowReport(true), 500);
    }
  }, [report, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="card text-center fade-in max-w-md">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--primary-purple)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-purple)' }}>
            جارٍ تحليل أدائك...
          </h2>
          <p style={{ color: 'var(--gray-400)' }}>
            الذكاء الاصطناعي يقوم بتقييم نتائجك
          </p>
        </div>
      </div>
    );
  }

  if (!report || !showReport) {
    return null;
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'above_normal':
        return 'var(--green-success)';
      case 'normal':
        return 'var(--blue-light)';
      case 'below_normal':
        return 'var(--yellow-light)';
      default:
        return 'var(--gray-400)';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'above_normal':
        return 'ممتاز';
      case 'normal':
        return 'جيد';
      case 'below_normal':
        return 'يحتاج دعم';
      default:
        return 'طبيعي';
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="card fade-in mb-6">
          <div className="text-center mb-6">
            <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: `conic-gradient(var(--primary-purple) ${report.performance_score * 3.6}deg, var(--gray-200) 0deg)`,
              }}>
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                  {report.performance_score}
                </span>
              </div>
            </div>
            <div className="inline-block px-4 py-2 rounded-full text-white font-semibold mb-4"
              style={{ backgroundColor: getLevelColor(report.level) }}>
              {getLevelText(report.level)}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
              التحليل
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--gray-400)' }}>
              {report.analysis}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
              نقاط القوة
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span style={{ color: 'var(--green-success)' }}>✓</span>
                  <span style={{ color: 'var(--gray-400)' }}>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
              التوصيات
            </h3>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span style={{ color: 'var(--primary-purple)' }}>→</span>
                  <span style={{ color: 'var(--gray-400)' }}>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={onNextGame} className="btn-primary flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            اللعبة التالية
          </button>
          <button onClick={onHome} className="btn-secondary flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            الرئيسية
          </button>
          <button onClick={onConsult} className="btn-secondary flex items-center justify-center gap-2">
            <Stethoscope className="w-5 h-5" />
            استشارة مختص
          </button>
        </div>
      </div>
    </div>
  );
}
