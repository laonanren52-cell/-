import type { LifeCard, ReviewPeriod, ReviewReport, ReviewStats } from "../types";
import { getDisplayLocation } from "./reverseGeocodeService";

type PeriodRange = {
  start: Date;
  end: Date;
};

const periodTitle: Record<ReviewPeriod, string> = {
  daily: "日复盘",
  weekly: "周复盘",
  monthly: "月复盘",
  quarterly: "季复盘",
  yearly: "年复盘",
};

const moodRules: Array<{ mood: string; words: string[] }> = [
  { mood: "开心", words: ["开心", "快乐", "高兴", "兴奋", "愉快", "惊喜", "好玩"] },
  { mood: "平静", words: ["平静", "安静", "放松", "轻松", "安稳", "舒服", "踏实"] },
  { mood: "难过", words: ["难过", "伤心", "低落", "委屈", "沮丧", "失落", "哭"] },
  { mood: "孤独", words: ["孤独", "孤单", "一个人", "独处", "寂寞"] },
  { mood: "紧张", words: ["紧张", "害怕", "不安", "焦虑", "担心", "压力"] },
  { mood: "疲惫", words: ["累", "疲惫", "困", "没力", "疲劳", "耗尽"] },
  { mood: "成就感", words: ["成就", "完成", "满足", "做到了", "达成", "解锁"] },
  { mood: "自由", words: ["自由", "自在", "舒展", "无拘束", "随心"] },
];

export function getPeriodRange(periodType: ReviewPeriod, date = new Date()): PeriodRange {
  const cursor = new Date(date);
  const start = startOfDay(cursor);

  if (periodType === "daily") {
    return { start, end: addDays(start, 1) };
  }

  if (periodType === "weekly") {
    const day = start.getDay() || 7;
    const weekStart = addDays(start, -day + 1);
    return { start: weekStart, end: addDays(weekStart, 7) };
  }

  if (periodType === "monthly") {
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
    return { start: monthStart, end: new Date(start.getFullYear(), start.getMonth() + 1, 1) };
  }

  if (periodType === "quarterly") {
    const quarterMonth = Math.floor(start.getMonth() / 3) * 3;
    const quarterStart = new Date(start.getFullYear(), quarterMonth, 1);
    return { start: quarterStart, end: new Date(start.getFullYear(), quarterMonth + 3, 1) };
  }

  const yearStart = new Date(start.getFullYear(), 0, 1);
  return { start: yearStart, end: new Date(start.getFullYear() + 1, 0, 1) };
}

export function getCardsByPeriod(cards: LifeCard[], periodType: ReviewPeriod, date = new Date()) {
  const range = getPeriodRange(periodType, date);
  return cards
    .filter((card) => {
      const cardDate = getCardDate(card);
      return cardDate >= range.start && cardDate < range.end;
    })
    .sort(sortCardsByDateDesc);
}

export function getPreviousPeriodCards(cards: LifeCard[], periodType: ReviewPeriod, date = new Date()) {
  const previousDate = getPreviousPeriodAnchor(periodType, date);
  return getCardsByPeriod(cards, periodType, previousDate);
}

export function classifyMood(moodText?: string) {
  const text = (moodText || "").trim();
  if (!text) return "其他";
  const normalized = text.toLowerCase();
  const matched = moodRules.find((rule) => rule.words.some((word) => normalized.includes(word.toLowerCase())));
  return matched?.mood || "其他";
}

export function buildCategoryDistribution(cards: LifeCard[]) {
  return toDistribution(cards, (card) => card.category || "未分类").map(([category, count]) => ({ category, count }));
}

export function buildMoodDistribution(cards: LifeCard[]) {
  return toDistribution(cards, (card) => classifyMood(card.moodText)).map(([mood, count]) => ({ mood, count }));
}

export function buildTrendData(cards: LifeCard[], periodType: ReviewPeriod, date = new Date()) {
  const range = getPeriodRange(periodType, date);

  if (periodType === "daily") {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      date: `${String(hour).padStart(2, "0")}时`,
      count: 0,
    }));
    cards.forEach((card) => {
      const hour = getCardDate(card).getHours();
      buckets[hour].count += 1;
    });
    return buckets;
  }

  if (periodType === "weekly") {
    const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const buckets = labels.map((date) => ({ date, count: 0 }));
    cards.forEach((card) => {
      const day = getCardDate(card).getDay() || 7;
      buckets[day - 1].count += 1;
    });
    return buckets;
  }

  if (periodType === "monthly") {
    const days = Math.round((range.end.getTime() - range.start.getTime()) / dayMs);
    const buckets = Array.from({ length: days }, (_, index) => {
      const itemDate = addDays(range.start, index);
      return { date: `${itemDate.getMonth() + 1}/${itemDate.getDate()}`, count: 0 };
    });
    cards.forEach((card) => {
      const diff = Math.floor((startOfDay(getCardDate(card)).getTime() - range.start.getTime()) / dayMs);
      if (buckets[diff]) buckets[diff].count += 1;
    });
    return buckets;
  }

  if (periodType === "quarterly") {
    const weeks = Math.ceil((range.end.getTime() - range.start.getTime()) / (7 * dayMs));
    const buckets = Array.from({ length: weeks }, (_, index) => ({ date: `第${index + 1}周`, count: 0 }));
    cards.forEach((card) => {
      const diff = Math.floor((startOfDay(getCardDate(card)).getTime() - range.start.getTime()) / (7 * dayMs));
      if (buckets[diff]) buckets[diff].count += 1;
    });
    return buckets;
  }

  const buckets = Array.from({ length: 12 }, (_, index) => ({ date: `${index + 1}月`, count: 0 }));
  cards.forEach((card) => {
    const month = getCardDate(card).getMonth();
    buckets[month].count += 1;
  });
  return buckets;
}

export function pickRepresentativeCards(cards: LifeCard[]) {
  return cards.slice().sort((a, b) => {
    const imageScore = Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl));
    if (imageScore) return imageScore;

    const aiScore = Number(Boolean(b.aiGeneratedText)) - Number(Boolean(a.aiGeneratedText));
    if (aiScore) return aiScore;

    const noteScore = (b.note?.length || 0) - (a.note?.length || 0);
    if (noteScore) return noteScore;

    return getCardDate(b).getTime() - getCardDate(a).getTime();
  });
}

export function buildReviewStats(cards: LifeCard[], previousCards: LifeCard[], periodType: ReviewPeriod, date = new Date()): ReviewStats {
  const categoryDistribution = buildCategoryDistribution(cards);
  const moodDistribution = buildMoodDistribution(cards);
  const dailyTrend = buildTrendData(cards, periodType, date);
  const locationDistribution = toDistribution(cards, (card) => getDisplayLocation(card) || "未记录地点")
    .map(([location, count]) => ({ location, count }))
    .filter((item) => item.location !== "未记录地点" || item.count > 0);

  const mostActive = dailyTrend.reduce((best, item) => (item.count > best.count ? item : best), { date: "暂无", count: 0 });

  return {
    totalCards: cards.length,
    previousTotalCards: previousCards.length,
    growthRate: cards.length - previousCards.length,
    topCategory: categoryDistribution[0]?.category || "暂无",
    topMood: moodDistribution[0]?.mood || "暂无",
    mostActiveDay: mostActive.count > 0 ? mostActive.date : "暂无",
    categoryDistribution,
    moodDistribution,
    dailyTrend,
    locationDistribution,
    representativeCards: pickRepresentativeCards(cards).slice(0, 3),
  };
}

export function buildReviewReport(cards: LifeCard[], period: ReviewPeriod): ReviewReport {
  const periodCards = getCardsByPeriod(cards, period);
  const previousCards = getPreviousPeriodCards(cards, period);
  const stats = buildReviewStats(periodCards, previousCards, period);

  return {
    period,
    title: periodTitle[period],
    cardCount: periodCards.length,
    topMood: stats.topMood,
    topCategory: stats.topCategory,
    representativeCards: stats.representativeCards,
    aiSummary: "",
    nextSuggestions: [],
    stats,
  };
}

export function getPeriodCards(cards: LifeCard[], period: ReviewPeriod) {
  return getCardsByPeriod(cards, period);
}

export function countByCategory(cards: LifeCard[]) {
  return Object.fromEntries(buildCategoryDistribution(cards).map((item) => [item.category, item.count]));
}

export function countByMood(cards: LifeCard[]) {
  return Object.fromEntries(buildMoodDistribution(cards).map((item) => [item.mood, item.count]));
}

export function getPeriodLabel(period: ReviewPeriod) {
  return periodTitle[period];
}

function getCardDate(card: LifeCard) {
  const value = card.completedAt || card.createdAt;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(card.createdAt || Date.now()) : date;
}

function getPreviousPeriodAnchor(periodType: ReviewPeriod, date: Date) {
  const range = getPeriodRange(periodType, date);
  if (periodType === "daily") return addDays(range.start, -1);
  if (periodType === "weekly") return addDays(range.start, -7);
  if (periodType === "monthly") return new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
  if (periodType === "quarterly") return new Date(range.start.getFullYear(), range.start.getMonth() - 3, 1);
  return new Date(range.start.getFullYear() - 1, 0, 1);
}

function toDistribution<T>(items: T[], getKey: (item: T) => string) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item).trim() || "其他";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function sortCardsByDateDesc(a: LifeCard, b: LifeCard) {
  return getCardDate(b).getTime() - getCardDate(a).getTime();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const dayMs = 24 * 60 * 60 * 1000;
