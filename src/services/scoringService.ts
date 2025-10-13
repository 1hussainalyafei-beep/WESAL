import { GameType } from '../types';

interface RawEvent {
  timestamp: number;
  type: string;
  value: any;
}

interface GameMetrics {
  accuracy: number;
  avgLatencyMs: number;
  attempts: number;
  hesitations: number;
  extra: Record<string, any>;
}

interface SubScores {
  accuracy: number;
  latency: number;
  hesitation: number;
  stability: number;
  [key: string]: number;
}

interface MiniReport {
  game: GameType;
  score: number;
  status: string;
  subScores: SubScores;
  reasons: string[];
  tip: string;
  flags: string[];
}

const HESITATION_THRESHOLD_MS = 1500;
const SPAM_THRESHOLD_MS = 100;
const MIN_EVENTS = 5;

const AGE_NORMS: Record<string, { acc_ref: number; lat_ref: number; hes_ref: number }> = {
  '3-4': { acc_ref: 0.60, lat_ref: 2000, hes_ref: 5 },
  '5-6': { acc_ref: 0.70, lat_ref: 1500, hes_ref: 4 },
  '7-8': { acc_ref: 0.80, lat_ref: 1200, hes_ref: 3 },
  '9-10': { acc_ref: 0.85, lat_ref: 1000, hes_ref: 2 },
  '11-12': { acc_ref: 0.90, lat_ref: 900, hes_ref: 1 },
};

function getAgeGroup(age: number): string {
  if (age <= 4) return '3-4';
  if (age <= 6) return '5-6';
  if (age <= 8) return '7-8';
  if (age <= 10) return '9-10';
  return '11-12';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function calculateMetrics(rawEvents: RawEvent[], gameType: GameType): GameMetrics {
  if (rawEvents.length < MIN_EVENTS) {
    throw new Error('بيانات غير كافية، يرجى إعادة اللعب');
  }

  const validEvents = rawEvents.filter((event, i) => {
    if (i === 0) return true;
    const timeDiff = event.timestamp - rawEvents[i - 1].timestamp;
    return timeDiff > SPAM_THRESHOLD_MS;
  });

  let correct = 0;
  let total = 0;
  const latencies: number[] = [];
  let hesitations = 0;
  const extra: Record<string, any> = {};

  let lastTimestamp = validEvents[0]?.timestamp || 0;

  validEvents.forEach((event) => {
    if (event.type === 'click' || event.type === 'select' || event.type === 'match') {
      total++;
      if (event.value?.correct) correct++;

      const latency = event.timestamp - lastTimestamp;
      if (latency > 0 && latency < 10000) {
        latencies.push(latency);
      }

      if (latency > HESITATION_THRESHOLD_MS) {
        hesitations++;
      }
    }
    lastTimestamp = event.timestamp;
  });

  const accuracy = total > 0 ? correct / total : 0;
  const avgLatencyMs = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 1000;

  if (gameType === 'attention') {
    const falsePositives = validEvents.filter(e =>
      e.type === 'click' && !e.value?.isTarget
    ).length;
    extra.falsePositives = falsePositives;
    extra.falsePositiveRate = total > 0 ? falsePositives / total : 0;
  }

  if (gameType === 'logic') {
    extra.levelReached = validEvents
      .filter(e => e.type === 'level_complete')
      .length;
  }

  return {
    accuracy,
    avgLatencyMs,
    attempts: total,
    hesitations,
    extra,
  };
}

function calculateSubScores(
  metrics: GameMetrics,
  gameType: GameType,
  age: number
): SubScores {
  const ageGroup = getAgeGroup(age);
  const norms = AGE_NORMS[ageGroup];

  const accScore = clamp(metrics.accuracy * 100, 0, 100);

  const latScore = clamp((norms.lat_ref / metrics.avgLatencyMs) * 100, 0, 100);

  const hesScore = clamp(
    (norms.hes_ref / (metrics.hesitations + 1)) * 100,
    0,
    100
  );

  const latencyVariance = 20;
  const stabilityScore = clamp(100 - latencyVariance, 0, 100);

  const subScores: SubScores = {
    accuracy: Math.round(accScore),
    latency: Math.round(latScore),
    hesitation: Math.round(hesScore),
    stability: Math.round(stabilityScore),
  };

  if (gameType === 'attention' && metrics.extra.falsePositiveRate !== undefined) {
    const fpPenalty = Math.min(30, metrics.extra.falsePositiveRate * 100);
    subScores.impulsivity = Math.round(100 - fpPenalty);
  }

  return subScores;
}

function calculateGameScore(
  subScores: SubScores,
  gameType: GameType
): number {
  let score = 0;

  switch (gameType) {
    case 'attention':
      score =
        0.45 * subScores.accuracy +
        0.35 * subScores.latency +
        0.15 * (subScores.impulsivity || 100) +
        0.05 * subScores.stability;
      break;

    case 'memory':
      score =
        0.50 * subScores.accuracy +
        0.30 * subScores.latency +
        0.20 * subScores.hesitation;
      break;

    case 'logic':
      score =
        0.40 * subScores.accuracy +
        0.35 * subScores.latency +
        0.25 * subScores.stability;
      break;

    case 'visual':
      score =
        0.45 * subScores.accuracy +
        0.35 * subScores.latency +
        0.20 * subScores.stability;
      break;

    case 'pattern':
      score =
        0.50 * subScores.accuracy +
        0.30 * subScores.latency +
        0.20 * subScores.hesitation;
      break;

    case 'creative':
      score =
        0.60 * subScores.accuracy +
        0.20 * subScores.latency +
        0.20 * subScores.stability;
      break;

    default:
      score =
        0.40 * subScores.accuracy +
        0.35 * subScores.latency +
        0.25 * subScores.stability;
  }

  return Math.round(clamp(score, 0, 100));
}

function getStatus(score: number): string {
  if (score >= 85) return 'ممتاز';
  if (score >= 70) return 'جيد';
  if (score >= 50) return 'مقبول يحتاج دعم';
  return 'يحتاج دعم واضح';
}

function generateReasons(
  score: number,
  subScores: SubScores,
  metrics: GameMetrics,
  gameType: GameType
): string[] {
  const reasons: string[] = [];

  if (subScores.accuracy >= 80 && subScores.latency >= 70) {
    reasons.push('دقة عالية وسرعة جيدة');
  } else if (subScores.accuracy >= 70 && subScores.latency < 60) {
    reasons.push('يفكر بتأنٍ؛ نحتاج تمارين سرعة لطيفة');
  }

  if (metrics.avgLatencyMs > 1500) {
    reasons.push('زمن الاستجابة أعلى من المرجع العمري');
  }

  if (metrics.hesitations > 5) {
    reasons.push('تردد ملحوظ قبل الاختيار');
  }

  if (gameType === 'attention' && metrics.extra.falsePositiveRate > 0.2) {
    reasons.push('أخطاء اندفاعية (ضغط عند غير الهدف)');
  }

  if (subScores.accuracy < 60) {
    reasons.push('يحتاج المزيد من التركيز والتدريب');
  }

  if (reasons.length === 0) {
    reasons.push('أداء متوازن بشكل عام');
  }

  return reasons.slice(0, 2);
}

function generateTip(score: number, gameType: GameType, subScores: SubScores): string {
  if (score >= 85) {
    return 'استمر في التدريب اليومي للحفاظ على هذا المستوى الرائع!';
  }

  const tips: Record<GameType, string[]> = {
    memory: [
      'تمرين "ابحث عن الشيء" 10 دقائق، 3 مرات أسبوعيًا',
      'لعبة تذكر الصور يوميًا لمدة 5 دقائق',
    ],
    attention: [
      'لعبة اضغط عند النجمة لمدة 3 دقائق يوميًا',
      'تمرين العد التنازلي مع التركيز على رقم معين',
    ],
    logic: [
      'حل ألغاز بسيطة مناسبة للعمر يوميًا',
      'لعبة ترتيب الأشكال حسب القواعد المنطقية',
    ],
    visual: [
      'تمارين البحث عن الاختلافات في الصور',
      'لعبة تكوين الأشكال من القطع',
    ],
    pattern: [
      'تمرين إكمال الأنماط الملونة يوميًا',
      'لعبة توقع الشكل التالي في السلسلة',
    ],
    creative: [
      'رسم حر لمدة 10 دقائق يوميًا',
      'تمرين تخيل القصص والرسم عنها',
    ],
  };

  const gameTips = tips[gameType] || ['استمر في التدريب والتحسن!'];
  return subScores.latency < 50
    ? gameTips[1] || gameTips[0]
    : gameTips[0];
}

function generateFlags(
  metrics: GameMetrics,
  subScores: SubScores,
  gameType: GameType
): string[] {
  const flags: string[] = [];

  if (metrics.attempts < MIN_EVENTS) {
    flags.push('AVOIDED_GAME');
  }

  if (metrics.hesitations > 10) {
    flags.push('HIGH_HESITATION');
  }

  if (gameType === 'attention' && metrics.extra.falsePositiveRate > 0.3) {
    flags.push('IMPULSIVE_ERRORS');
  }

  if (subScores.accuracy < 40) {
    flags.push('LOW_ACCURACY');
  }

  return flags;
}

export function generateMiniReport(
  rawEvents: RawEvent[],
  gameType: GameType,
  age: number
): MiniReport {
  const metrics = calculateMetrics(rawEvents, gameType);
  const subScores = calculateSubScores(metrics, gameType, age);
  const score = calculateGameScore(subScores, gameType);
  const status = getStatus(score);
  const reasons = generateReasons(score, subScores, metrics, gameType);
  const tip = generateTip(score, gameType, subScores);
  const flags = generateFlags(metrics, subScores, gameType);

  return {
    game: gameType,
    score,
    status,
    subScores,
    reasons,
    tip,
    flags,
  };
}

export function calculateDomainScores(gameReports: Array<{ game: GameType; score: number }>) {
  const domainMapping: Record<string, { primary: GameType[]; secondary: GameType[] }> = {
    memory: { primary: ['memory'], secondary: ['attention'] },
    attention: { primary: ['attention'], secondary: [] },
    reasoning: { primary: ['logic'], secondary: ['pattern', 'visual'] },
    visual: { primary: ['visual'], secondary: ['pattern'] },
    pattern: { primary: ['pattern'], secondary: ['logic'] },
    creativity: { primary: ['creative'], secondary: [] },
  };

  const domainScores: Record<string, number> = {};

  Object.entries(domainMapping).forEach(([domain, games]) => {
    const primaryScores = gameReports
      .filter(r => games.primary.includes(r.game))
      .map(r => r.score);

    const secondaryScores = gameReports
      .filter(r => games.secondary.includes(r.game))
      .map(r => r.score);

    if (primaryScores.length > 0) {
      const primaryAvg = primaryScores.reduce((a, b) => a + b, 0) / primaryScores.length;
      const secondaryAvg = secondaryScores.length > 0
        ? secondaryScores.reduce((a, b) => a + b, 0) / secondaryScores.length
        : primaryAvg;

      domainScores[domain] = Math.round(0.7 * primaryAvg + 0.3 * secondaryAvg);
    }
  });

  return domainScores;
}

export function getDomainLevel(score: number): string {
  if (score < 40) return 'أقل من الطبيعي';
  if (score < 60) return 'قريب من الطبيعي';
  if (score < 80) return 'طبيعي';
  return 'أعلى من الطبيعي';
}
