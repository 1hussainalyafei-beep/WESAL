import { Home, Play, ArrowLeft } from 'lucide-react';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';

interface MiniReportScreenProps {
  score: number;
  status: string;
  reasons: string[];
  tip: string;
  gameName: string;
  onNext?: () => void;
  onHome: () => void;
  onReplay: () => void;
  showNext: boolean;
  markdownContent?: string;
  gptAnalysis?: {
    analysis: string;
    strengths: string[];
    recommendations: string[];
  };
}

export function MiniReportScreen({
  score,
  status,
  reasons,
  tip,
  gameName,
  onNext,
  onHome,
  onReplay,
  showNext,
  markdownContent,
  gptAnalysis,
}: MiniReportScreenProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#A8C7E7';
    if (score >= 50) return '#FFB6D9';
    return '#FF6B6B';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return '⭐⭐⭐';
    if (score >= 70) return '⭐⭐';
    if (score >= 50) return '⭐';
    return '💪';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <header className="p-6 rounded-b-3xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center text-white">
            تقرير {gameName}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 animate-fadeInUp">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 animate-celebration"
            style={{
              backgroundColor: getScoreColor(score),
              boxShadow: `0 8px 24px ${getScoreColor(score)}40`,
            }}
          >
            <div className="text-white">
              <div className="text-5xl font-bold">{score}</div>
              <div className="text-sm">من 100</div>
            </div>
          </div>

          <div className="text-4xl mb-2 animate-bounce">{getScoreBadge(score)}</div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: '#5B4B9D' }}>
            {status}
          </h2>
        </div>

        <div className="space-y-6">
          {markdownContent && (
            <div className="rounded-2xl p-6"
                 style={{ backgroundColor: '#F8F9FA', border: '2px solid #5B4B9D' }}>
              <MarkdownRenderer content={markdownContent} />
            </div>
          )}

          {gptAnalysis && (
            <div className="rounded-2xl p-6"
                 style={{ backgroundColor: '#E3F2FD', border: '2px solid #42A5F5' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🤖</div>
                <h3 className="text-xl font-bold" style={{ color: '#1976D2' }}>
                  تحليل الذكاء الاصطناعي
                </h3>
              </div>
              <p className="text-lg leading-relaxed mb-4" style={{ color: '#212121' }}>
                {gptAnalysis.analysis}
              </p>

              {gptAnalysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold mb-2 text-lg" style={{ color: '#1976D2' }}>
                    ✨ نقاط القوة:
                  </h4>
                  <ul className="space-y-2">
                    {gptAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="leading-relaxed" style={{ color: '#212121' }}>
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {gptAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-bold mb-2 text-lg" style={{ color: '#1976D2' }}>
                    💡 توصيات للتحسين:
                  </h4>
                  <ul className="space-y-2">
                    {gptAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        <span className="leading-relaxed" style={{ color: '#212121' }}>
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl p-6"
               style={{ backgroundColor: '#F5F5F5' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#5B4B9D' }}>
              📊 ملاحظات الأداء
            </h3>
            <ul className="space-y-3">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                       style={{ backgroundColor: '#5B4B9D' }}></div>
                  <span className="text-lg leading-relaxed" style={{ color: '#212121' }}>
                    {reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-6"
               style={{ backgroundColor: '#E8F5E9' }}>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#26A69A' }}>
              💡 نصيحة سريعة
            </h3>
            <p className="text-lg leading-relaxed" style={{ color: '#212121' }}>
              {tip}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {showNext && onNext && (
            <button
              onClick={onNext}
              className="w-full px-8 py-4 rounded-xl text-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-3"
              style={{
                backgroundColor: '#5B4B9D',
                color: 'white',
                boxShadow: '0 4px 12px rgba(91, 75, 157, 0.3)',
              }}
            >
              <span>اللعبة التالية</span>
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          <div className="flex gap-4">
            <button
              onClick={onHome}
              className="flex-1 px-6 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FFB6D9',
                color: '#5B4B9D',
                boxShadow: '0 4px 12px rgba(255, 182, 217, 0.3)',
              }}
            >
              <Home className="w-5 h-5" />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={onReplay}
              className="flex-1 px-6 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#A8C7E7',
                color: '#5B4B9D',
                boxShadow: '0 4px 12px rgba(168, 199, 231, 0.3)',
              }}
            >
              <Play className="w-5 h-5" />
              <span>إعادة اللعب</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
