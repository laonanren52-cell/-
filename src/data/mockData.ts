import { presetTasks } from "./presetTasks";
import type { Anniversary, LifeCard, UserProfile, WishlistItem } from "../types";

const today = new Date();
const daysAgo = (days: number, hour = 20) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 20, 0, 0);
  return date.toISOString();
};

export const defaultProfile: UserProfile = {
  id: "user_default",
  nickname: "小支线玩家",
  theme: "warm",
  aiMode: "mock",
};

export const mockWishlist: WishlistItem[] = [
  {
    id: "wish_1",
    taskId: "preset_成长清单_0",
    title: "学会一个新技能",
    category: "成长清单",
    difficulty: "挑战",
    description: "这个月想认真学会剪一支完整的短视频。",
    status: "进行中",
    isPinned: true,
    isImportant: true,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(2),
  },
  {
    id: "wish_2",
    taskId: "preset_关系清单_3",
    title: "给重要的人写一封信",
    category: "关系清单",
    difficulty: "中等",
    description: "把一直没说出口的感谢写下来。",
    status: "想做",
    isPinned: false,
    isImportant: true,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: "wish_3",
    taskId: "preset_独处清单_2",
    title: "一个人看日落",
    category: "独处清单",
    difficulty: "轻松",
    description: "找一个不用赶路的傍晚，看太阳慢慢落下去。",
    status: "想做",
    isPinned: false,
    isImportant: false,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
];

export const mockLifeCards: LifeCard[] = [
  {
    id: "card_1",
    taskId: "preset_独处清单_3",
    title: "第一次一个人吃火锅",
    category: "独处清单",
    moodTags: ["自由", "平静"],
    note: "一开始有点尴尬，后来发现一个人慢慢吃也很自在。",
    location: "学校附近的小火锅店",
    completedAt: daysAgo(1, 19),
    aiGeneratedText: "一个人的火锅，也可以很热闹。你把生活的声音调小了一点，却听见了自己的自在。",
    aiImagePrompt: "温暖治愈风插画，一个人坐在窗边火锅店，桌上有热气腾腾的火锅，夜晚城市灯光，情绪自由、安静、温暖。",
    isAnniversary: true,
    anniversaryDate: daysAgo(1, 19),
    createdAt: daysAgo(1, 19),
    diary: {
      id: "diary_1",
      cardId: "card_1",
      content: "多年后看到这张卡，希望我还记得今晚那种不必解释的轻松。",
      moodTags: ["自由", "平静"],
      updatedAt: daysAgo(1, 21),
    },
  },
  {
    id: "card_2",
    taskId: "preset_治愈清单_0",
    title: "拍一张今天的天空",
    category: "治愈清单",
    moodTags: ["治愈", "开心"],
    note: "下课路上抬头看见很干净的蓝色，突然觉得今天也不错。",
    location: "教学楼旁",
    completedAt: daysAgo(4, 17),
    aiGeneratedText: "你没有错过今天。那一小块蓝色，像生活偷偷递来的便签。",
    aiImagePrompt: "柔和天空蓝插画，校园傍晚，云层轻盈，画面安静明亮，适合人生纪念卡封面。",
    isAnniversary: false,
    createdAt: daysAgo(4, 17),
  },
  {
    id: "card_3",
    taskId: "preset_关系清单_0",
    title: "给父母做一顿饭",
    category: "关系清单",
    moodTags: ["感动", "成长"],
    note: "番茄炒蛋有点咸，但他们一直说很好吃。",
    location: "家里",
    completedAt: daysAgo(10, 12),
    aiGeneratedText: "有些爱不用做得完美。今天的你，把心意端上了餐桌。",
    aiImagePrompt: "温暖家庭厨房插画，一桌简单家常菜，柔和灯光，画面有烟火气和亲密感。",
    isAnniversary: true,
    anniversaryDate: daysAgo(10, 12),
    createdAt: daysAgo(10, 12),
  },
  {
    id: "card_4",
    taskId: "preset_独处清单_1",
    title: "一个人去书店",
    category: "独处清单",
    moodTags: ["平静", "治愈"],
    note: "没有买很多书，只是在书架之间慢慢走了一圈。",
    location: "城市书房",
    completedAt: daysAgo(16, 15),
    aiGeneratedText: "你给自己留了一段不被打扰的时间。书页很轻，心也跟着慢下来。",
    aiImagePrompt: "温暖书店插画，木色书架，午后自然光，一个人安静翻书，治愈感。",
    isAnniversary: false,
    createdAt: daysAgo(16, 15),
  },
  {
    id: "card_5",
    taskId: "preset_治愈清单_1",
    title: "写一句给未来自己的话",
    category: "治愈清单",
    moodTags: ["释然", "成长"],
    note: "别急，慢慢来，你已经在路上了。",
    completedAt: daysAgo(28, 22),
    aiGeneratedText: "今天的这句话像一颗小种子。它不催你长大，只提醒你别忘了继续走。",
    aiImagePrompt: "柔粉与浅紫渐变插画，纸条、星光、小植物，温柔成长主题。",
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
  if (mockWishlist.some((item) => item.taskId === task.id)) return { ...task, status: "wishlist" as const };
  return task;
});
