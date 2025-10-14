import { useState, useEffect } from 'react';
import { Download, Share2, FileText, ArrowLeft, Eye, Calendar } from 'lucide-react';
import { ComprehensiveReport } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';

interface ReportsPageProps {
  childId: string;
  onBack: () => void;
}

interface FinalReport {
  id: string;
  assessment_path_id: string;
  child_id: string;
  markdown_content: string;
  skill_summary: {
    memory: 'normal' | 'above' | 'below';
    attention: 'normal' | 'above' | 'below';
    logic: 'normal' | 'above' | 'below';
    visual: 'normal' | 'above' | 'below';
    pattern: 'normal' | 'above' | 'below';
    creative: 'normal' | 'above' | 'below';
  };
  overall_trend: 'improving' | 'stable' | 'needs_support';
  ai_insights: string;
  recommendations: string[];
  created_at: string;
}

interface AssessmentPathData {
  id: string;
  completed_games_count: number;
  total_games: number;
  average_score: number;
  started_at: string;
  completed_at: string;
}

export function ReportsPage({ childId, onBack }: ReportsPageProps) {
  const { user } = useAuth();
  const [reports, setReports] = useState<ComprehensiveReport[]>([]);
  const [finalReports, setFinalReports] = useState<FinalReport[]>([]);
  const [pathsData, setPathsData] = useState<Record<string, AssessmentPathData>>({});
  const [selectedReport, setSelectedReport] = useState<ComprehensiveReport | null>(null);
  const [selectedFinalReport, setSelectedFinalReport] = useState<FinalReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [childId]);

  const loadReports = async () => {
    console.log('📖 Loading reports for child:', childId);
    
    try {
      // Load old comprehensive reports
      const { data: oldReports, error: oldError } = await supabase
        .from('comprehensive_reports')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (oldError) throw oldError;
      setReports(oldReports || []);
      console.log('📊 Old comprehensive reports loaded:', oldReports?.length || 0);

      const { data: newReports, error: newError } = await supabase
        .from('final_reports')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (newError) throw newError;
      setFinalReports(newReports || []);
      console.log('📋 Final reports loaded:', newReports?.length || 0);

      // Load mini reports for debugging
      const { data: miniReports, error: miniError } = await supabase
        .from('mini_reports')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (!miniError) {
        console.log('🎮 Mini reports found:', miniReports?.length || 0);
        console.log('Mini reports data:', miniReports);
      } else {
        console.error('❌ Error loading mini reports:', miniError);
      }

      // Load assessment paths data for each final report
      if (newReports && newReports.length > 0) {
        const pathIds = newReports.map(r => r.assessment_path_id);
        const { data: paths, error: pathsError } = await supabase
          .from('assessment_paths')
          .select('*')
          .in('id', pathIds);

        if (!pathsError && paths) {
          const pathsMap: Record<string, AssessmentPathData> = {};
          paths.forEach(path => {
            pathsMap[path.id] = {
              id: path.id,
              completed_games_count: path.completed_games_count,
              total_games: path.total_games,
              average_score: path.average_score,
              started_at: path.started_at,
              completed_at: path.completed_at
            };
          });
          setPathsData(pathsMap);
          console.log('🛤️ Assessment paths loaded:', paths.length);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      console.error('❌ Full error details:', error);
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

  if (selectedFinalReport) {
    const pathData = pathsData[selectedFinalReport.assessment_path_id];
    const overallScore = pathData?.average_score || 0;

    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedFinalReport(null)} className="mb-6 btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            العودة للقائمة
          </button>

          <div className="card fade-in mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                التقرير الشامل الجديد
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
                  background: `conic-gradient(var(--primary-purple) ${overallScore * 3.6}deg, var(--gray-200) 0deg)`,
                }}>
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                    {Math.round(overallScore)}
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--gray-400)' }}>
                {new Date(selectedFinalReport.created_at).toLocaleDateString('ar')}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--gray-400)' }}>
                {pathData?.completed_games_count || 0} من {pathData?.total_games || 6} ألعاب
              </p>
            </div>

            <div className="mb-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--gray-50)' }}>
              <MarkdownRenderer content={selectedFinalReport.markdown_content} />
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
                خريطة المهارات
              </h3>
              <div className="space-y-4">
                {Object.entries(selectedFinalReport.skill_summary).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{getSkillNameArabic(key)}</span>
                      <span style={{ color: getSkillLevelColor(value) }}>{getSkillLevelArabic(value)}</span>
                    </div>
                    <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'var(--gray-200)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: getSkillLevelWidth(value),
                          backgroundColor: getSkillLevelColor(value),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: getTrendColor(selectedFinalReport.overall_trend) }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                📈 الاتجاه العام: {getTrendArabic(selectedFinalReport.overall_trend)}
              </h3>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                💡 رؤى الذكاء الاصطناعي
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--gray-400)' }}>
                {selectedFinalReport.ai_insights}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                🌟 التوصيات الشخصية
              </h3>
              <ul className="space-y-2">
                {selectedFinalReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span style={{ color: 'var(--primary-purple)' }}>→</span>
                    <span style={{ color: 'var(--gray-400)' }}>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
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
          <ArrowLeft className="w-4 h-4" />
          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center p-1">
            <img src="/w.png" alt="وصال" className="w-full h-full object-contain" />
          </div>
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

        {finalReports.length === 0 && reports.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--gray-400)' }} />
            <p className="text-lg" style={{ color: 'var(--gray-400)' }}>
              لا توجد تقارير بعد
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {finalReports.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-purple)' }}>
                  📊 التقارير الشاملة الجديدة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {finalReports.map((report, index) => {
                    const pathData = pathsData[report.assessment_path_id];
                    return (
                      <button
                        key={report.id}
                        onClick={() => setSelectedFinalReport(report)}
                        className="card text-right slide-up hover:scale-105 transition-transform"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-3xl font-bold" style={{ color: 'var(--primary-purple)' }}>
                              {Math.round(pathData?.average_score || 0)}
                            </div>
                            <div className="text-xs mt-1" style={{ color: 'var(--gray-400)' }}>
                              {pathData?.completed_games_count || 0}/{pathData?.total_games || 6} ألعاب
                            </div>
                          </div>
                          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-blue-light)' }}>
                            <FileText className="w-8 h-8" style={{ color: 'var(--primary-purple)' }} />
                          </div>
                        </div>
                        <p className="text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--gray-400)' }}>
                          <Calendar className="w-4 h-4" />
                          {new Date(report.created_at).toLocaleDateString('ar', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--primary-purple)' }}>
                          <Eye className="w-4 h-4" />
                          <span>عرض التقرير الكامل</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {reports.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--gray-400)' }}>
                  📁 التقارير القديمة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reports.map((report, index) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="card text-right slide-up opacity-75 hover:opacity-100 transition-opacity"
                      style={{ animationDelay: `${(finalReports.length + index) * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-bold" style={{ color: 'var(--gray-400)' }}>
                          {report.overall_score}
                        </div>
                        <FileText className="w-8 h-8" style={{ color: 'var(--gray-400)' }} />
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
              </div>
            )}
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

function getSkillNameArabic(key: string): string {
  const names: Record<string, string> = {
    memory: 'الذاكرة',
    attention: 'التركيز',
    logic: 'المنطق',
    visual: 'الإدراك البصري',
    pattern: 'تمييز الأنماط',
    creative: 'الإبداع',
  };
  return names[key] || key;
}

function getSkillLevelArabic(level: string): string {
  const levels: Record<string, string> = {
    above: 'فوق المتوسط',
    normal: 'طبيعي',
    below: 'تحت المتوسط',
  };
  return levels[level] || level;
}

function getSkillLevelColor(level: string): string {
  const colors: Record<string, string> = {
    above: '#4CAF50',
    normal: '#2196F3',
    below: '#FF9800',
  };
  return colors[level] || '#2196F3';
}

function getSkillLevelWidth(level: string): string {
  const widths: Record<string, string> = {
    above: '90%',
    normal: '70%',
    below: '40%',
  };
  return widths[level] || '70%';
}

function getTrendArabic(trend: string): string {
  const trends: Record<string, string> = {
    improving: 'يتحسن',
    stable: 'مستقر',
    needs_support: 'يحتاج دعم',
  };
  return trends[trend] || trend;
}

function getTrendColor(trend: string): string {
  const colors: Record<string, string> = {
    improving: '#E8F5E9',
    stable: '#E3F2FD',
    needs_support: '#FFF3E0',
  };
  return colors[trend] || '#E3F2FD';
}
