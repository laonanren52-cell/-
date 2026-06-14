import { presetTasks } from "./presetTasks";
import type { Anniversary, LifeCard, TodoItem, UserProfile } from "../types";

const today = new Date();
const daysAgo = (days: number, hour = 20) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 20, 0, 0);
  return date.toISOString();
};

const todayDate = today.toISOString().slice(0, 10);

export const defaultAIPreferences = {
  empathy: 72,
  humor: 24,
  objectivity: 48,
};

export const defaultAIApiConfig = {
  textApiBase: "",
  textApiKey: "",
  textModel: "gpt-4o-mini",
  imageApiBase: "",
  imageApiKey: "",
  imageModel: "gpt-image-1",
  amapApiKey: "",
};

export const defaultProfile: UserProfile = {
  id: "user_default",
  nickname: "小支线玩家",
  theme: "warm",
  aiMode: "mock",
  aiPreferences: defaultAIPreferences,
  aiApiConfig: defaultAIApiConfig,
};

export const mockTodos: TodoItem[] = [
  {
    id: "todo_1",
    title: "拍一张今天的天空",
    description: "下课或下班路上，抬头找一小块让你停下来的天空。",
    date: todayDate,
    status: "todo",
    sourceTaskId: "preset_治愈清单_0",
    category: "治愈清单",
    isPinned: true,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "todo_2",
    title: "一个人散步 30 分钟",
    description: "不用赶路，只是把今天的脑子慢慢放松下来。",
    date: todayDate,
    status: "todo",
    sourceTaskId: "preset_独处清单_0",
    category: "独处清单",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "todo_3",
    title: "给很久没联系的人发一句问候",
    description: "不用很长，一句“最近怎么样”就很好。",
    date: todayDate,
    status: "completed",
    sourceTaskId: "preset_关系清单_2",
    category: "关系清单",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(0, 10),
  },
];

export const mockLifeCards: LifeCard[] = [
  {
    id: "card_1",
    taskId: "preset_独处清单_3",
    title: "第一次一个人吃火锅",
    category: "独处清单",
    moodText: "有点紧张但后来很自由",
    note: "一开始有点尴尬，后来发现一个人慢慢吃也很自在。",
    location: "学校附近的小火锅店",
    completedAt: daysAgo(1, 19),
    imageSource: "default",
    aiGeneratedText: "第一次一个人坐下来吃火锅，最开始那点不自然没有被你躲开。你还是慢慢吃完了这一餐，也把“一个人”从尴尬里吃成了自由。",
    isAnniversary: true,
    anniversaryDate: daysAgo(1, 19),
    createdAt: daysAgo(1, 19),
    diary: {
      id: "diary_1",
      cardId: "card_1",
      content: "多年后看到这张卡，希望我还记得今晚那种不必解释的轻松。",
      moodText: "自由、平静",
      updatedAt: daysAgo(1, 21),
    },
  },
  {
    id: "card_2",
    taskId: "preset_治愈清单_0",
    title: "拍一张今天的天空",
    category: "治愈清单",
    moodText: "被蓝色治愈了一下",
    note: "下课路上抬头看见很干净的蓝色，突然觉得今天也不错。",
    location: "教学楼旁",
    completedAt: daysAgo(4, 17),
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    imageSource: "uploaded",
    aiGeneratedText: "你没有错过今天的天空。那一小块干净的蓝色，像生活偷偷递来的便签，提醒你普通日子里也会有很轻的光。",
    isAnniversary: false,
    createdAt: daysAgo(4, 17),
  },
  {
    id: "card_3",
    taskId: "preset_关系清单_0",
    title: "给父母做一顿饭",
    category: "关系清单",
    moodText: "感动，也有点不好意思",
    note: "番茄炒蛋有点咸，但他们一直说很好吃。",
    location: "家里",
    completedAt: daysAgo(10, 12),
    imageSource: "default",
    aiGeneratedText: "这顿饭不需要完美才值得被记住。番茄炒蛋有点咸，但你把心意端上桌的那一刻，家里的灯光就已经很暖了。",
    isAnniversary: true,
    anniversaryDate: daysAgo(10, 12),
    createdAt: daysAgo(10, 12),
  },
  {
    id: "card_4",
    taskId: "preset_独处清单_1",
    title: "一个人去书店",
    category: "独处清单",
    moodText: "安静、慢下来",
    note: "没有买很多书，只是在书架之间慢慢走了一圈。",
    location: "城市书房",
    completedAt: daysAgo(16, 15),
    imageSource: "default",
    aiGeneratedText: "你给自己留了一段不被打扰的时间。一个人走在书架之间，像把今天的音量调低了一格，心也跟着慢下来。",
    isAnniversary: false,
    createdAt: daysAgo(16, 15),
  },
  {
    id: "card_5",
    taskId: "preset_治愈清单_1",
    title: "写一句给未来自己的话",
    category: "治愈清单",
    moodText: "释然，想继续往前",
    note: "别急，慢慢来，你已经在路上了。",
    completedAt: daysAgo(28, 22),
    imageSource: "default",
    aiGeneratedText: "这句话像一颗小种子。它不催你马上变好，只是温柔地提醒：你已经在路上了，可以慢慢来。",
    isAnniversary: false,
    createdAt: daysAgo(28, 22),
  },
];

export const mockAnniversaries: Anniversary[] = [
  {
    id: "ann_1",
    title: "第一次一个人吃火锅",
    date: mockLifeCards[0].completedAt,
    type: "countUp",
    source: "fromLifeCard",
    relatedCardId: "card_1",
    description: "那天你发现独处也可以热气腾腾。",
    createdAt: mockLifeCards[0].createdAt,
  },
  {
    id: "ann_2",
    title: "距离毕业旅行计划",
    date: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate()).toISOString(),
    type: "countDown",
    source: "manual",
    description: "给毕业前的自己留一段出发的时间。",
    createdAt: daysAgo(6),
  },
];

export const seededTasks = presetTasks.map((task) => {
  if (mockLifeCards.some((card) => card.taskId === task.id)) return { ...task, status: "completed" as const };
  if (mockTodos.some((item) => item.sourceTaskId === task.id && item.status !== "completed")) return { ...task, status: "todo" as const };
  return task;
});
