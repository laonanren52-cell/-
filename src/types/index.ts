export type Difficulty = "轻松" | "中等" | "挑战";
export type TaskStatus = "preset" | "wishlist" | "doing" | "completed";
export type WishlistStatus = "想做" | "进行中" | "已完成";
export type MoodTag =
  | "开心"
  | "平静"
  | "感动"
  | "勇敢"
  | "释然"
  | "紧张"
  | "孤独"
  | "自由"
  | "治愈"
  | "成长";
export type ReviewPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type UserProfile = {
  id: string;
  nickname: string;
  theme: "warm" | "dark";
  aiMode: "mock" | "api";
};

export type LifeTask = {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  suggestedDuration: string;
  status: TaskStatus;
  isCustom: boolean;
  isImportant?: boolean;
  createdAt: string;
};

export type WishlistItem = {
  id: string;
  taskId: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  status: WishlistStatus;
  isPinned: boolean;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LifeCard = {
  id: string;
  taskId: string;
  title: string;
  category: string;
  moodTags: MoodTag[];
  note: string;
  location?: string;
  completedAt: string;
  imageUrl?: string;
  aiImagePrompt: string;
  aiGeneratedText: string;
  isAnniversary: boolean;
  anniversaryDate?: string;
  createdAt: string;
  diary?: DiaryEntry;
};

export type DiaryEntry = {
  id: string;
  cardId: string;
  content: string;
  moodTags: MoodTag[];
  imageUrl?: string;
  updatedAt: string;
};

export type Anniversary = {
  id: string;
  title: string;
  date: string;
  type: "countUp" | "countDown";
  source: "manual" | "fromLifeCard";
  relatedCardId?: string;
  description: string;
  createdAt: string;
};

export type ReviewSettings = {
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  quarterly: true;
  yearly: true;
};

export type ReviewReport = {
  period: ReviewPeriod;
  title: string;
  cardCount: number;
  topMood?: MoodTag;
  topCategory?: string;
  representativeCards: LifeCard[];
  aiSummary: string;
  nextSuggestions: string[];
};

export type CheckInInput = {
  task: LifeTask;
  completedAt: string;
  location?: string;
  moodTags: MoodTag[];
  note: string;
  imageUrl?: string;
  isAnniversary: boolean;
  shouldGenerateImage: boolean;
};
