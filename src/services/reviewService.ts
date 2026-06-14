import { generateNextTaskSuggestions, generateReviewSummary } from "./aiService";
import type { LifeCard, MoodTag, ReviewPeriod, ReviewReport } from "../types";
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
    representativeCards: periodCards.slice(0, period === "monthly" ? 3 : 1),
    aiSummary: generateReviewSummary(periodCards, periodTitle[period]),
    nextSuggestions: generateNextTaskSuggestions(cards),
  };
}

export function countByCategory(cards: LifeCard[]) {
  return countBy(cards, (card) => card.category);
}

export function countByMood(cards: LifeCard[]) {
  return cards.reduce<Record<string, number>>((acc, card) => {
    card.moodTags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {});
}

function getTopMood(cards: LifeCard[]): MoodTag | undefined {
  const entries = Object.entries(countByMood(cards)).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] as MoodTag | undefined;
}

function getTopCategory(cards: LifeCard[]) {
  const entries = Object.entries(countByCategory(cards)).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0];
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
