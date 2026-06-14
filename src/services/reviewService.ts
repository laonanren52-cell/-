import type { LifeCard, ReviewPeriod, ReviewReport } from "../types";
import { isInPeriod } from "../utils/date";

const periodTitle: Record<ReviewPeriod, string> = {
  daily: "日复盘",
  weekly: "周复盘",
  monthly: "月复盘",
  quarterly: "季复盘",
  yearly: "年复盘",
};

export function buildReviewReport(cards: LifeCard[], period: ReviewPeriod): ReviewReport {
  const periodCards = cards
    .filter((card) => isInPeriod(card.completedAt, period))
    .sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));

  return {
    period,
    title: periodTitle[period],
    cardCount: periodCards.length,
    topMood: getTopMood(periodCards),
    topCategory: getTopCategory(periodCards),
    representativeCards: periodCards.slice(0, period === "monthly" ? 3 : 2),
    aiSummary: "",
    nextSuggestions: [],
  };
}

export function getPeriodCards(cards: LifeCard[], period: ReviewPeriod) {
  return cards
    .filter((card) => isInPeriod(card.completedAt, period))
    .sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
}

export function countByCategory(cards: LifeCard[]) {
  return countBy(cards, (card) => card.category || "未分类");
}

export function countByMood(cards: LifeCard[]) {
  return cards.reduce<Record<string, number>>((acc, card) => {
    const mood = normalizeMood(card.moodText);
    if (mood) acc[mood] = (acc[mood] ?? 0) + 1;
    return acc;
  }, {});
}

function getTopMood(cards: LifeCard[]) {
  const entries = Object.entries(countByMood(cards)).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0];
}

function getTopCategory(cards: LifeCard[]) {
  const entries = Object.entries(countByCategory(cards)).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0];
}

function normalizeMood(value?: string) {
  if (!value) return "";
  return value
    .split(/[，,、\s]/)
    .map((item) => item.trim())
    .filter(Boolean)[0] ?? value;
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
