import type { LifeTask } from "../types";

const recommendationKey = "lifequest.dailyRecommendations";
const dismissedKey = "lifequest.dismissedRecommendations";
const recommendationCount = 4;

type RecommendOptions = {
  count?: number;
  category?: string;
};

type StoredRecommendations = {
  date: string;
  taskIds: string[];
};

type StoredDismissed = {
  date: string;
  taskIds: string[];
};

export function getTodayRecommendedTasks(tasks: LifeTask[], options: RecommendOptions = {}) {
  const today = getTodayKey();
  const scopedTasks = applyOptions(tasks, options);
  const stored = readStored<StoredRecommendations>(getRecommendationKey(options));
  const dismissed = getTodayDismissedTaskIds();
  const count = options.count ?? recommendationCount;

  if (stored?.date === today) {
    const fromStorage = stored.taskIds
      .map((id) => scopedTasks.find((task) => task.id === id))
      .filter((task): task is LifeTask => Boolean(task && !dismissed.includes(task.id)));
    if (fromStorage.length === count) return fromStorage;
  }

  return refreshRecommendedTasks(tasks, options);
}

export function refreshRecommendedTasks(tasks: LifeTask[], options: RecommendOptions = {}) {
  const dismissed = getTodayDismissedTaskIds();
  const recommendations = pickRecommendedTasks(
    applyOptions(tasks, options).filter((task) => !dismissed.includes(task.id)),
    [],
    options.count ?? recommendationCount,
  );
  saveRecommendations(recommendations, options);
  return recommendations;
}

export function replaceRecommendedTask(tasks: LifeTask[], current: LifeTask, currentRecommendations: LifeTask[], options: RecommendOptions = {}) {
  const dismissed = getTodayDismissedTaskIds();
  const keep = currentRecommendations.filter((task) => task.id !== current.id);
  const candidates = applyOptions(tasks, options).filter((task) => {
    if (task.id === current.id) return false;
    if (dismissed.includes(task.id)) return false;
    if (keep.some((item) => item.id === task.id)) return false;
    return true;
  });
  const [replacement] = pickRecommendedTasks(candidates, keep, 1);
  const next = replacement ? keepRecommendedOrder(currentRecommendations, current.id, replacement) : keep;
  saveRecommendations(next, options);
  return next;
}

export function dismissTaskForToday(tasks: LifeTask[], current: LifeTask, currentRecommendations: LifeTask[], options: RecommendOptions = {}) {
  const dismissed = getTodayDismissedTaskIds();
  saveDismissed([...new Set([...dismissed, current.id])]);
  return replaceRecommendedTask(tasks, current, currentRecommendations, options);
}

export function getRandomTasks(tasks: LifeTask[], options: RecommendOptions = {}) {
  return refreshRecommendedTasks(tasks, options);
}

export function replaceOneRandomTask(currentTasks: LifeTask[], allTasks: LifeTask[], targetTaskId: string, options: RecommendOptions = {}) {
  const target = currentTasks.find((task) => task.id === targetTaskId);
  return target ? replaceRecommendedTask(allTasks, target, currentTasks, options) : currentTasks;
}

export function filterCompletedTasks(tasks: LifeTask[], completedCards: Array<{ taskId?: string; title?: string }>) {
  const completedIds = new Set(completedCards.map((card) => card.taskId).filter(Boolean));
  const completedTitles = new Set(completedCards.map((card) => card.title).filter(Boolean));
  return tasks.filter((task) => !completedIds.has(task.id) && !completedTitles.has(task.title));
}

export function getTodayHiddenTaskIds() {
  return getTodayDismissedTaskIds();
}

export function hideTaskForToday(taskId: string) {
  const dismissed = getTodayDismissedTaskIds();
  saveDismissed([...new Set([...dismissed, taskId])]);
}

export function resetTodayRandomTasks(options: RecommendOptions = {}) {
  localStorage.removeItem(getRecommendationKey(options));
}

function pickRecommendedTasks(tasks: LifeTask[], existing: LifeTask[] = [], count = recommendationCount) {
  const selected = [...existing];
  const available = [...tasks];
  const targetDifficulties: Array<LifeTask["difficulty"]> = ["轻松", "中等", "挑战", "轻松"];

  while (selected.length < existing.length + count && available.length) {
    const difficulty = targetDifficulties[selected.length % targetDifficulties.length];
    const lastCategory = selected[selected.length - 1]?.category;
    const pool = available
      .filter((task) => task.category !== lastCategory)
      .filter((task) => task.difficulty === difficulty);
    const relaxedPool = available.filter((task) => task.category !== lastCategory);
    const finalPool = pool.length ? pool : relaxedPool.length ? relaxedPool : available;
    const picked = weightedPick(finalPool);
    selected.push(picked);
    available.splice(available.findIndex((task) => task.id === picked.id), 1);
  }

  return selected.slice(existing.length, existing.length + count);
}

function weightedPick(tasks: LifeTask[]) {
  const weighted = tasks.flatMap((task) => {
    const weight = task.status === "completed" ? 1 : task.status === "todo" ? 2 : 4;
    return Array.from({ length: weight }, () => task);
  });
  return weighted[Math.floor(Math.random() * weighted.length)] ?? tasks[0];
}

function keepRecommendedOrder(currentRecommendations: LifeTask[], currentId: string, replacement: LifeTask) {
  return currentRecommendations.map((task) => (task.id === currentId ? replacement : task));
}

function saveRecommendations(tasks: LifeTask[], options: RecommendOptions = {}) {
  writeStored<StoredRecommendations>(getRecommendationKey(options), {
    date: getTodayKey(),
    taskIds: tasks.map((task) => task.id),
  });
}

function applyOptions(tasks: LifeTask[], options: RecommendOptions) {
  if (!options.category || options.category === "全部") return tasks;
  return tasks.filter((task) => task.category === options.category);
}

function getRecommendationKey(options: RecommendOptions) {
  return options.category && options.category !== "全部"
    ? `${recommendationKey}.${options.category}`
    : recommendationKey;
}

function getTodayDismissedTaskIds() {
  const today = getTodayKey();
  const stored = readStored<StoredDismissed>(dismissedKey);
  return stored?.date === today ? stored.taskIds : [];
}

function saveDismissed(taskIds: string[]) {
  writeStored<StoredDismissed>(dismissedKey, {
    date: getTodayKey(),
    taskIds,
  });
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readStored<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
