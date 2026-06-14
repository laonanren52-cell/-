import type { LifeCard, MoodTag } from "../types";

export type LifeCardAiInput = {
  title: string;
  category: string;
  note: string;
  moodTags: MoodTag[];
};

const categoryTone: Record<string, string> = {
  第一次清单: "今天的你，认真完成了一次新的开始。第一次不一定隆重，但它会在记忆里留下清晰的坐标。",
  勇气清单: "勇气不是没有紧张，而是在紧张里仍然往前走了一步。你把选择权重新交回了自己手里。",
  关系清单: "有些心意需要被好好说出。今天你让关系里多了一点真诚，也让自己更靠近柔软的部分。",
  独处清单: "独处不是把世界关掉，而是把注意力还给自己。你在安静里确认了自己的节奏。",
  成长清单: "你不是突然变强的，只是在某个普通的今天没有放弃。成长正在留下痕迹。",
  治愈清单: "生活有时会把光藏在很小的地方。今天你停下来，把它保存成了自己的证据。",
};

export function generateLifeCardText(input: LifeCardAiInput) {
  const moods = input.moodTags.join("、") || "平静";
  const base = categoryTone[input.category] ?? "今天这件小事值得被认真记住。";
  if (input.note.includes("自由") || input.moodTags.includes("自由")) {
    return `${base} ${input.title}让你摸到了一点自由：不必被别人定义，也可以把日子过得有声有色。`;
  }
  if (input.moodTags.includes("感动") || input.moodTags.includes("释然")) {
    return `${base} 这一次的${moods}会留得久一点，因为你把心里真正重要的东西看见了。`;
  }
  return `${base} 这张人生卡记录下${moods}的你，也记录下一个正在慢慢展开的支线。`;
}

export function generateImagePrompt(input: LifeCardAiInput) {
  const moods = input.moodTags.join("、") || "温暖";
  return `温暖治愈风插画，主题为「${input.title}」，包含${input.category}的生活场景，画面柔和、有故事感，情绪关键词：${moods}，适合人生纪念卡封面，浅色渐变、轻量装饰、年轻用户喜欢的视觉风格。`;
}

export function generateReviewSummary(cards: LifeCard[], periodLabel: string) {
  if (!cards.length) {
    return `${periodLabel}还没有新的人生卡。留白也算生活的一部分，下一张卡可以从一个很小的尝试开始。`;
  }
  const categories = [...new Set(cards.map((card) => card.category))].slice(0, 3).join("、");
  const moods = [...new Set(cards.flatMap((card) => card.moodTags))].slice(0, 4).join("、");
  return `${periodLabel}你留下了 ${cards.length} 张人生卡，主要发生在${categories || "日常"}里。那些${moods || "平静"}的瞬间正在说明：生活不是突然改变的，它是在一次次支线里变得更像你。`;
}

export function generateNextTaskSuggestions(cards: LifeCard[]) {
  const completed = new Set(cards.map((card) => card.category));
  if (!completed.has("关系清单")) return ["给很久没联系的人发一句问候", "主动表达感谢"];
  if (!completed.has("独处清单")) return ["一个人去书店", "一个人看日落"];
  if (!completed.has("成长清单")) return ["读完一本书", "完成一次运动挑战"];
  return ["写一句给未来自己的话", "拒绝一次不合理请求", "拍一张今天的天空"];
}
