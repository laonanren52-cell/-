import type { ReviewPeriod } from "../types";

const dayMs = 24 * 60 * 60 * 1000;

export function formatDate(value: string | Date, withTime = false) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function toInputDateTime(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

export function daysBetween(date: string, from = new Date()) {
  const target = new Date(date);
  return Math.ceil((target.getTime() - startOfDay(from).getTime()) / dayMs);
}

export function isInPeriod(dateValue: string, period: ReviewPeriod, now = new Date()) {
  const date = new Date(dateValue);
  const start = getPeriodStart(period, now);
  return date >= start && date <= now;
}

export function getPeriodStart(period: ReviewPeriod, now = new Date()) {
  const start = startOfDay(now);
  if (period === "daily") return start;

  if (period === "weekly") {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    return start;
  }

  if (period === "monthly") {
    start.setDate(1);
    return start;
  }

  if (period === "quarterly") {
    start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
    return start;
  }

  start.setMonth(0, 1);
  return start;
}

export function groupCardsByMonth<T extends { completedAt: string }>(cards: T[]) {
  return cards.reduce<Record<string, T[]>>((groups, card) => {
    const date = new Date(card.completedAt);
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    groups[key] = groups[key] ? [...groups[key], card] : [card];
    return groups;
  }, {});
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
