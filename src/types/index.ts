export type Difficulty = "轻松" | "中等" | "挑战";
export type TaskStatus = "preset" | "todo" | "doing" | "completed";
export type TodoStatus = "todo" | "completed";
export type ReviewPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type ImageSource = "uploaded" | "ai" | "default";

export type AIPreferences = {
  empathy: number;
  humor: number;
  objectivity: number;
};

export type AIApiConfig = {
  textApiBase: string;
  textApiKey: string;
  textModel: string;
  imageApiBase: string;
  imageApiKey: string;
  imageModel: string;
  amapApiKey: string;
};

export type UserProfile = {
  id: string;
  nickname: string;
  theme: "warm" | "dark";
  aiMode: "mock" | "api";
  aiPreferences: AIPreferences;
  aiApiConfig: AIApiConfig;
};

export type LifeTask = {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  suggestedDuration: string;
  icon?: string;
  achievementName?: string;
  unlockText?: string;
  tags?: string[];
  isPreset?: true;
  status: TaskStatus;
  isCustom: boolean;
  isImportant?: boolean;
  createdAt: string;
};

export type TodoItem = {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: TodoStatus;
  sourceTaskId?: string;
  category?: string;
  priority?: "low" | "normal" | "high";
  pinned?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type LifeCard = {
  id: string;
  taskId?: string;
  title: string;
  category?: string;
  note?: string;
  moodText?: string;
  location?: string;
  locationName?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  completedAt: string;
  imageUrl?: string;
  imageSource?: ImageSource;
  aiGeneratedText?: string;
  aiImageError?: string;
  isAnniversary?: boolean;
  anniversaryDate?: string;
  createdAt: string;
  diary?: DiaryEntry;
};

export type DiaryEntry = {
  id: string;
  cardId: string;
  content: string;
  moodText: string;
  imageUrl?: string;
  updatedAt: string;
};

export type DiaryNote = {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
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

export type ReviewSummaryInput = {
  tasks: LifeTask[];
  cards: LifeCard[];
  aiPreferences: AIPreferences;
  periodType: ReviewPeriod;
};

export type ReviewReport = {
  period: ReviewPeriod;
  title: string;
  cardCount: number;
  topMood?: string;
  topCategory?: string;
  representativeCards: LifeCard[];
  aiSummary: string;
  nextSuggestions: string[];
};

export type CheckInInput = {
  task: LifeTask;
  completedAt: string;
  location?: string;
  locationName?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  moodText: string;
  note: string;
  uploadedImageUrl?: string;
  isAnniversary: boolean;
  shouldGenerateImage: boolean;
};
