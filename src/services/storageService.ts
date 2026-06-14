import { defaultProfile, mockAnniversaries, mockLifeCards, mockWishlist, seededTasks } from "../data/mockData";
import type { Anniversary, LifeCard, LifeTask, ReviewSettings, UserProfile, WishlistItem } from "../types";

const keys = {
  tasks: "lifequest.tasks",
  wishlist: "lifequest.wishlist",
  cards: "lifequest.cards",
  anniversaries: "lifequest.anniversaries",
  reviewSettings: "lifequest.reviewSettings",
  profile: "lifequest.profile",
};

const defaultReviewSettings: ReviewSettings = {
  daily: true,
  weekly: true,
  monthly: true,
  quarterly: true,
  yearly: true,
};

export function initializeStorage() {
  ensure(keys.tasks, seededTasks);
  ensure(keys.wishlist, mockWishlist);
  ensure(keys.cards, mockLifeCards);
  ensure(keys.anniversaries, mockAnniversaries);
  ensure(keys.reviewSettings, defaultReviewSettings);
  ensure(keys.profile, defaultProfile);
}

export function getTasks() {
  initializeStorage();
  return read<LifeTask[]>(keys.tasks, seededTasks);
}

export function saveTasks(value: LifeTask[]) {
  write(keys.tasks, value);
}

export function getWishlist() {
  initializeStorage();
  return read<WishlistItem[]>(keys.wishlist, mockWishlist);
}

export function saveWishlist(value: WishlistItem[]) {
  write(keys.wishlist, value);
}

export function getLifeCards() {
  initializeStorage();
  return read<LifeCard[]>(keys.cards, mockLifeCards);
}

export function saveLifeCards(value: LifeCard[]) {
  write(keys.cards, value);
}

export function getAnniversaries() {
  initializeStorage();
  return read<Anniversary[]>(keys.anniversaries, mockAnniversaries);
}

export function saveAnniversaries(value: Anniversary[]) {
  write(keys.anniversaries, value);
}

export function getReviewSettings() {
  initializeStorage();
  return read<ReviewSettings>(keys.reviewSettings, defaultReviewSettings);
}

export function saveReviewSettings(value: ReviewSettings) {
  write(keys.reviewSettings, { ...value, quarterly: true, yearly: true });
}

export function getProfile() {
  initializeStorage();
  return read<UserProfile>(keys.profile, defaultProfile);
}

export function saveProfile(value: UserProfile) {
  write(keys.profile, value);
}

export function exportAllData() {
  initializeStorage();
  return {
    profile: getProfile(),
    tasks: getTasks(),
    wishlist: getWishlist(),
    lifeCards: getLifeCards(),
    anniversaries: getAnniversaries(),
    reviewSettings: getReviewSettings(),
  };
}

export function resetStorage() {
  Object.values(keys).forEach((key) => localStorage.removeItem(key));
  initializeStorage();
}

function ensure<T>(key: string, fallback: T) {
  if (!localStorage.getItem(key)) write(key, fallback);
}

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
