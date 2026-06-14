import type { LifeTask } from "../types";

const now = new Date().toISOString();

const descriptions: Record<string, string> = {
  第一次清单: "给生活按下一个新的开始键，认真收集属于你的第一次。",
  勇气清单: "为那个想做但总被搁置的决定，留一个可执行的入口。",
  关系清单: "把想念、感谢、告别和靠近，都变成更具体的一步。",
  独处清单: "练习和自己待在一起，听见生活里更安静的声音。",
  成长清单: "用一个小挑战，给未来的自己留下证据。",
  治愈清单: "在普通日子里，保存一点柔软和亮光。",
};

const taskRows: Array<[string, string[], LifeTask["difficulty"], string]> = [
  [
    "第一次清单",
    [
      "第一次一个人吃饭",
      "第一次一个人看电影",
      "第一次一个人旅行",
      "第一次认真喜欢一个人",
      "第一次公开表达自己的想法",
      "第一次独自解决一个困难",
    ],
    "中等",
    "半天内",
  ],
  [
    "勇气清单",
    ["向一个人认真道歉", "主动表达感谢", "拒绝一次不合理请求", "完成一次公开发言", "主动认识一个新朋友"],
    "挑战",
    "30 分钟",
  ],
  [
    "关系清单",
    ["给父母做一顿饭", "和朋友认真聊一次近况", "给很久没联系的人发一句问候", "给重要的人写一封信", "认真告别一段关系"],
    "中等",
    "1 小时",
  ],
  [
    "独处清单",
    ["一个人散步 30 分钟", "一个人去书店", "一个人看日落", "一个人吃火锅", "一个人去一个陌生地方"],
    "轻松",
    "30-90 分钟",
  ],
  [
    "成长清单",
    ["学会一个新技能", "读完一本书", "连续早睡 7 天", "完成一次运动挑战", "整理一次自己的房间"],
    "挑战",
    "1-7 天",
  ],
  [
    "治愈清单",
    ["拍一张今天的天空", "写一句给未来自己的话", "整理旧照片", "给自己买一束花", "记录一次让自己开心的小事"],
    "轻松",
    "15 分钟",
  ],
];

export const presetTasks: LifeTask[] = taskRows.flatMap(([category, titles, difficulty, duration]) =>
  titles.map((title, index) => ({
    id: `preset_${category}_${index}`.replace(/\s+/g, "_"),
    title,
    category,
    difficulty,
    description: `${descriptions[category]}这次任务是「${title}」，完成后可以把当下的感受沉淀成一张人生卡。`,
    suggestedDuration: duration,
    status: "preset",
    isCustom: false,
    isImportant: difficulty === "挑战",
    createdAt: now,
  })),
);

export const taskCategories = taskRows.map(([category]) => category);
