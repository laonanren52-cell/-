import type { LifeTask } from "../types";

const recommendationKey = "lifequest.dailyRecommendations";
const dismissedKey = "lifequest.dismissedRecommendations";
const recommendationCount = 4;

type StoredRecommendations = {
  date: string;
  taskIds: string[];
};

type StoredDismissed = {
  date: string;
  taskIds: string[];
};

export function getTodayRecommendedTasks(tasks: LifeTask[]) {
  const today = getTodayKey();
  const stored = readStored<StoredRecommendations>(recommendationKey);
  const dismissed = getTodayDismissedTaskIds();

  if (stored?.date === today) {
    const fromStorage = stored.taskIds
      .map((id) => tasks.find((task) => task.id === id))
      .filter((task): task is LifeTask => Boolean(task && !dismissed.includes(task.id)));
    if (fromStorage.length === recommendationCount) return fromStorage;
  }

  return refreshRecommendedTasks(tasks);
}

export function refreshRecommendedTasks(tasks: LifeTask[]) {
  const dismissed = getTodayDismissedTaskIds();
  const recommendations = pickRecommendedTasks(tasks.filter((task) => !dismissed.includes(task.id)));
  saveRecommendations(recommendations);
  return recommendations;
}

export function replaceRecommendedTask(tasks: LifeTask[], current: LifeTask, currentRecommendations: LifeTask[]) {
  const dismissed = getTodayDismissedTaskIds();
  const keep = currentRecommendations.filter((task) => task.id !== current.id);
  const candidates = tasks.filter((task) => {
    if (task.id === current.id) return false;
    if (dismissed.includes(task.id)) return false;
    if (keep.some((item) => item.id === task.id)) return false;
    return true;
  });
  const [replacement] = pickRecommendedTasks(candidates, keep, 1);
  const next = replacement ? keepRecommendedOrder(currentRecommendations, current.id, replacement) : keep;
  saveRecommendations(next);
  return next;
}

export function dismissTaskForToday(tasks: LifeTask[], current: LifeTask, currentRecommendations: LifeTask[]) {
  const dismissed = getTodayDismissedTaskIds();
  saveDismissed([...new Set([...dismissed, current.id])]);
  return replaceRecommendedTask(tasks, current, currentRecommendations);
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

function saveRecommendations(tasks: LifeTask[]) {
  writeStored<StoredRecommendations>(recommendationKey, {
    date: getTodayKey(),
    taskIds: tasks.map((task) => task.id),
  });
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
