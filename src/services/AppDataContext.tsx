import { createContext, useContext, useMemo, useState } from "react";
import { generateImagePrompt, generateLifeCardText } from "./aiService";
import {
  getAnniversaries,
  getLifeCards,
  getProfile,
  getReviewSettings,
  getTasks,
  getWishlist,
  resetStorage,
  saveAnniversaries,
  saveLifeCards,
  saveProfile,
  saveReviewSettings,
  saveTasks,
  saveWishlist,
} from "./storageService";
import type {
  Anniversary,
  CheckInInput,
  DiaryEntry,
  LifeCard,
  LifeTask,
  ReviewSettings,
  UserProfile,
  WishlistItem,
  WishlistStatus,
} from "../types";
import { createId } from "../utils/id";

type AppDataContextValue = {
  profile: UserProfile;
  tasks: LifeTask[];
  wishlist: WishlistItem[];
  lifeCards: LifeCard[];
  anniversaries: Anniversary[];
  reviewSettings: ReviewSettings;
  updateProfile: (profile: UserProfile) => void;
  updateReviewSettings: (settings: ReviewSettings) => void;
  createCustomTask: (task: Omit<LifeTask, "id" | "status" | "isCustom" | "createdAt">) => LifeTask;
  addTaskToWishlist: (task: LifeTask) => void;
  updateWishlistStatus: (id: string, status: WishlistStatus) => void;
  updateWishlistItem: (item: WishlistItem) => void;
  removeWishlistItem: (id: string) => void;
  toggleWishlistPin: (id: string) => void;
  createLifeCard: (input: CheckInInput) => LifeCard;
  updateDiary: (cardId: string, diary: DiaryEntry) => void;
  addAnniversary: (anniversary: Omit<Anniversary, "id" | "createdAt">) => void;
  resetAllData: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState(getProfile);
  const [tasks, setTasks] = useState(getTasks);
  const [wishlist, setWishlist] = useState(getWishlist);
  const [lifeCards, setLifeCards] = useState(getLifeCards);
  const [anniversaries, setAnniversaries] = useState(getAnniversaries);
  const [reviewSettings, setReviewSettings] = useState(getReviewSettings);

  const value = useMemo<AppDataContextValue>(
    () => ({
      profile,
      tasks,
      wishlist,
      lifeCards,
      anniversaries,
      reviewSettings,
      updateProfile(nextProfile) {
        setProfile(nextProfile);
        saveProfile(nextProfile);
      },
      updateReviewSettings(nextSettings) {
        const normalized = { ...nextSettings, quarterly: true as const, yearly: true as const };
        setReviewSettings(normalized);
        saveReviewSettings(normalized);
      },
      createCustomTask(taskInput) {
        const task: LifeTask = {
          ...taskInput,
          id: createId("task"),
          status: "preset",
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        const nextTasks = [task, ...tasks];
        setTasks(nextTasks);
        saveTasks(nextTasks);
        return task;
      },
      addTaskToWishlist(task) {
        if (wishlist.some((item) => item.taskId === task.id && item.status !== "已完成")) return;
        const now = new Date().toISOString();
        const item: WishlistItem = {
          id: createId("wish"),
          taskId: task.id,
          title: task.title,
          category: task.category,
          difficulty: task.difficulty,
          description: task.description,
          status: "想做",
          isPinned: false,
          isImportant: Boolean(task.isImportant),
          createdAt: now,
          updatedAt: now,
        };
        const nextWishlist = [item, ...wishlist];
        const nextTasks = tasks.map((current) => (current.id === task.id ? { ...current, status: "wishlist" as const } : current));
        setWishlist(nextWishlist);
        setTasks(nextTasks);
        saveWishlist(nextWishlist);
        saveTasks(nextTasks);
      },
      updateWishlistStatus(id, status) {
        const nextWishlist = wishlist.map((item) =>
          item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
        );
        setWishlist(nextWishlist);
        saveWishlist(nextWishlist);
      },
      updateWishlistItem(item) {
        const nextWishlist = wishlist.map((current) =>
          current.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : current,
        );
        setWishlist(nextWishlist);
        saveWishlist(nextWishlist);
      },
      removeWishlistItem(id) {
        const item = wishlist.find((current) => current.id === id);
        const nextWishlist = wishlist.filter((current) => current.id !== id);
        const nextTasks = item
          ? tasks.map((task) => (task.id === item.taskId && task.status === "wishlist" ? { ...task, status: "preset" as const } : task))
          : tasks;
        setWishlist(nextWishlist);
        setTasks(nextTasks);
        saveWishlist(nextWishlist);
        saveTasks(nextTasks);
      },
      toggleWishlistPin(id) {
        const nextWishlist = wishlist.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item));
        setWishlist(nextWishlist);
        saveWishlist(nextWishlist);
      },
      createLifeCard(input) {
        const aiInput = {
          title: input.task.title,
          category: input.task.category,
          note: input.note,
          moodTags: input.moodTags,
        };
        const now = new Date().toISOString();
        const card: LifeCard = {
          id: createId("card"),
          taskId: input.task.id,
          title: input.task.title,
          category: input.task.category,
          moodTags: input.moodTags,
          note: input.note,
          location: input.location,
          completedAt: new Date(input.completedAt).toISOString(),
          imageUrl: input.imageUrl,
          aiGeneratedText: generateLifeCardText(aiInput),
          aiImagePrompt: input.shouldGenerateImage ? generateImagePrompt(aiInput) : "本次未开启 AI 纪念图生成。",
          isAnniversary: input.isAnniversary,
          anniversaryDate: input.isAnniversary ? new Date(input.completedAt).toISOString() : undefined,
          createdAt: now,
          diary: {
            id: createId("diary"),
            cardId: "",
            content: input.note,
            moodTags: input.moodTags,
            imageUrl: input.imageUrl,
            updatedAt: now,
          },
        };
        card.diary = { ...card.diary!, cardId: card.id };

        const nextCards = [card, ...lifeCards];
        const nextTasks = tasks.map((task) => (task.id === input.task.id ? { ...task, status: "completed" as const } : task));
        const nextWishlist = wishlist.map((item) =>
          item.taskId === input.task.id ? { ...item, status: "已完成" as const, updatedAt: now } : item,
        );
        const nextAnniversaries = input.isAnniversary
          ? [
              {
                id: createId("ann"),
                title: card.title,
                date: card.completedAt,
                type: "countUp" as const,
                source: "fromLifeCard" as const,
                relatedCardId: card.id,
                description: card.aiGeneratedText,
                createdAt: now,
              },
              ...anniversaries,
            ]
          : anniversaries;

        setLifeCards(nextCards);
        setTasks(nextTasks);
        setWishlist(nextWishlist);
        setAnniversaries(nextAnniversaries);
        saveLifeCards(nextCards);
        saveTasks(nextTasks);
        saveWishlist(nextWishlist);
        saveAnniversaries(nextAnniversaries);
        return card;
      },
      updateDiary(cardId, diary) {
        const nextCards = lifeCards.map((card) => (card.id === cardId ? { ...card, diary } : card));
        setLifeCards(nextCards);
        saveLifeCards(nextCards);
      },
      addAnniversary(input) {
        const anniversary: Anniversary = {
          ...input,
          id: createId("ann"),
          createdAt: new Date().toISOString(),
        };
        const nextAnniversaries = [anniversary, ...anniversaries];
        setAnniversaries(nextAnniversaries);
        saveAnniversaries(nextAnniversaries);
      },
      resetAllData() {
        resetStorage();
        setProfile(getProfile());
        setTasks(getTasks());
        setWishlist(getWishlist());
        setLifeCards(getLifeCards());
        setAnniversaries(getAnniversaries());
        setReviewSettings(getReviewSettings());
      },
    }),
    [anniversaries, lifeCards, profile, reviewSettings, tasks, wishlist],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside AppDataProvider");
  return context;
}
