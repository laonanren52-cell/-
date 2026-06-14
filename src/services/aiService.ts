import type { AIApiConfig, AIPreferences, LifeCard, LifeTask, ReviewPeriod, ReviewStats, ReviewSuggestion } from "../types";
import { classifyMood } from "./reviewService";

export type LifeCardAiInput = {
  title: string;
  category?: string;
  note?: string;
  moodText?: string;
  locationName?: string;
  preferences: AIPreferences;
  aiMode: "mock" | "api";
};

export type ImageGenerationInput = LifeCardAiInput & {
  shouldGenerateImage: boolean;
};

const defaultRuntimeConfig: AIApiConfig = {
  textApiBase: import.meta.env.VITE_AI_TEXT_API_BASE ?? "",
  textApiKey: import.meta.env.VITE_AI_TEXT_API_KEY ?? "",
  textModel: import.meta.env.VITE_AI_TEXT_MODEL ?? "gpt-4o-mini",
  imageApiBase: import.meta.env.VITE_AI_IMAGE_API_BASE ?? "",
  imageApiKey: import.meta.env.VITE_AI_IMAGE_API_KEY ?? "",
  imageModel: import.meta.env.VITE_AI_IMAGE_MODEL ?? "gpt-image-1",
  amapApiKey: import.meta.env.VITE_AMAP_API_KEY ?? "",
};

export async function generateLifeCardText(input: LifeCardAiInput) {
  const prompt = buildLifeCardPrompt(input);
  if (canUseTextApi(input.aiMode)) {
    try {
      return await callTextApi(prompt, input.preferences);
    } catch (error) {
      console.warn("[AI Text] failed, falling back to mock.", error);
    }
  }
  return mockLifeCardText(input);
}

export async function generateCardImage(input: ImageGenerationInput) {
  if (import.meta.env.DEV) console.log("[AI Image] shouldGenerate:", input.shouldGenerateImage);
  if (!input.shouldGenerateImage) return undefined;
  if (!canUseImageApi(input.aiMode)) return undefined;
  return callImageApi(buildImagePrompt(input));
}

export async function generateReviewSummary(input: {
  cards: LifeCard[];
  periodLabel?: string;
  periodType: ReviewPeriod;
  stats?: ReviewStats;
  preferences?: AIPreferences;
  aiPreferences?: AIPreferences;
  aiMode: "mock" | "api";
}) {
  const preferences = input.preferences || input.aiPreferences || defaultPreferences;
  const periodLabel = input.periodLabel || getReadablePeriod(input.periodType);
  if (!input.cards.length) {
    return "这个周期还没有足够内容生成复盘。完成一次打卡后，我会帮你把这些生活片段整理成阶段总结。";
  }

  const prompt = buildReviewPrompt(input.cards, periodLabel, input.periodType, preferences, input.stats);
  if (canUseTextApi(input.aiMode)) {
    try {
      return await callTextApi(prompt, preferences);
    } catch (error) {
      console.warn("[AI Review] failed, falling back to mock.", error);
    }
  }
  return mockReviewSummary(input.cards, periodLabel, preferences, input.stats);
}

export async function generateNextTaskSuggestions(input: {
  cards: LifeCard[];
  tasks?: LifeTask[];
  periodType?: ReviewPeriod;
  stats?: ReviewStats;
  preferences?: AIPreferences;
  aiPreferences?: AIPreferences;
  aiMode: "mock" | "api";
}): Promise<ReviewSuggestion[]> {
  const preferences = input.preferences || input.aiPreferences || defaultPreferences;
  if (!input.cards.length) return [];

  const prompt = buildSuggestionPrompt(input.cards, input.tasks || [], preferences, input.stats, input.periodType);
  if (canUseTextApi(input.aiMode)) {
    try {
      const text = await callTextApi(prompt, preferences);
      const parsed = parseSuggestions(text);
      if (parsed.length) return parsed.slice(0, 3);
    } catch (error) {
      console.warn("[AI Suggestions] failed, falling back to mock.", error);
    }
  }
  return mockNextTaskSuggestions(input.cards, input.stats);
}

export async function testTextApiConnection() {
  const config = getRuntimeAIConfig();
  if (!config.textApiBase || !config.textApiKey || !config.textModel) {
    throw new Error("请先填写文本 API Base、Key 和 Model。");
  }
  return callTextApi("请只回复：LifeQuest 文本 API 已连接。", defaultPreferences);
}

export async function testImageApiConnection() {
  const config = getRuntimeAIConfig();
  if (!config.imageApiBase || !config.imageApiKey || !config.imageModel) {
    throw new Error("请先填写生图 API Base、Key 和 Model。");
  }
  return callImageApi("A tiny warm minimal illustration of a glowing life task card, no text, no watermark, soft light.");
}

export function buildLifeCardPrompt(input: LifeCardAiInput) {
  return [
    "你是 LifeQuest 的人生卡文案助手。请基于用户真实完成的事件写一段自然、具体、不空泛的纪念文案。",
    `任务标题：${input.title}`,
    `任务分类：${input.category || "未分类"}`,
    `用户感受：${input.note || "未填写"}`,
    `今日情绪：${input.moodText || "未填写"}`,
    `地点：${input.locationName || "未记录"}`,
    `AI偏好：共情 ${input.preferences.empathy}/100，幽默 ${input.preferences.humor}/100，客观 ${input.preferences.objectivity}/100。`,
    "要求：必须具体提到任务标题里的关键事件；写 80-140 字；像一个认真倾听的人；不要使用空泛鼓励。",
  ].join("\n");
}

export function buildImagePrompt(input: LifeCardAiInput) {
  const eventScene = inferImageScene(input.title);
  const emotion = input.moodText || "安静、温暖";
  const place = input.locationName ? `地点氛围参考：${input.locationName}。` : "";
  return [
    "温暖治愈风插画，生活感，柔和光线，细腻安静，适合作为人生纪念卡封面。",
    `具体事件：${input.title}。`,
    `画面主体：${eventScene}。`,
    `用户真实感受：${input.note || "没有额外描述"}。`,
    `情绪表达：${emotion}。`,
    place,
    "不要文字，不要水印，不要乱码文字，不要 logo，构图清爽，画面有真实生活气息。",
  ]
    .filter(Boolean)
    .join(" ");
}

export function normalizeApiBase(base: string, endpoint: "/chat/completions" | "/images/generations") {
  let normalized = base.trim().replace(/\/+$/, "");
  const duplicateEndpoints = ["/images/generations", "/chat/completions"];
  for (const path of duplicateEndpoints) {
    while (normalized.endsWith(path)) {
      normalized = normalized.slice(0, -path.length).replace(/\/+$/, "");
    }
  }
  return `${normalized}${endpoint}`;
}

export function getAIErrorMessage(status: number, fallback?: string) {
  if (fallback) return fallback;
  if (status === 401) return "API Key 错误或无权限，请检查生图 API Key。";
  if (status === 403) return "账号权限、实名认证或额度不足，请检查平台账户状态。";
  if (status === 404) return "接口地址或模型名错误。请检查 API Base 是否只填写到 /v1，以及模型名是否正确。";
  if (status === 429) return "调用过于频繁，请稍后再试。";
  if (status >= 500) return "AI 服务暂时异常，请稍后重试。";
  return "AI 服务暂时异常，请稍后重试。";
}

function buildReviewPrompt(
  cards: LifeCard[],
  periodLabel: string,
  periodType: ReviewPeriod,
  preferences: AIPreferences,
  stats?: ReviewStats,
) {
  const events = cards
    .map((card) => {
      const date = new Date(card.completedAt || card.createdAt).toLocaleDateString("zh-CN");
      return `- ${date}｜${card.title}｜分类：${card.category || "未分类"}｜地点：${card.locationName || card.locationAddress || card.location || "未记录"}｜情绪：${card.moodText || "未填写"}｜感受：${card.note || "未填写"}`;
    })
    .join("\n");

  return [
    `请为 LifeQuest 用户生成${periodLabel}。周期类型：${periodType}。`,
    `统计：本周期 ${stats?.totalCards ?? cards.length} 张卡；较上一周期 ${formatChange(stats?.growthRate ?? 0)}；高频分类 ${stats?.topCategory || "暂无"}；常见情绪 ${stats?.topMood || "暂无"}；活跃时段 ${stats?.mostActiveDay || "暂无"}。`,
    `分类分布：${stats?.categoryDistribution.map((item) => `${item.category}${item.count}`).join("、") || "暂无"}。`,
    `情绪分布：${stats?.moodDistribution.map((item) => `${item.mood}${item.count}`).join("、") || "暂无"}。`,
    `AI偏好：共情 ${preferences.empathy}/100，幽默 ${preferences.humor}/100，客观 ${preferences.objectivity}/100。`,
    "必须基于下面真实完成的卡片，不要泛泛地说成长、加油或变优秀。",
    events,
    "要求：提到 2-4 个具体任务；如果出现难过、孤独、疲惫、焦虑等情绪，先承认感受，再温和反馈，不要说教；100-180 字。",
  ].join("\n");
}

function buildSuggestionPrompt(
  cards: LifeCard[],
  tasks: LifeTask[],
  preferences: AIPreferences,
  stats?: ReviewStats,
  periodType?: ReviewPeriod,
) {
  const events = cards
    .slice(0, 10)
    .map((card) => `- ${card.title}｜${card.category || "未分类"}｜${classifyMood(card.moodText)}｜${card.locationName || card.location || "未记录"}`)
    .join("\n");
  const taskTitles = tasks.slice(0, 45).map((task) => task.title).join("、");

  return [
    "请根据用户已完成的人生任务，给出 3 条下一步建议。",
    `周期：${periodType || "未指定"}；高频分类：${stats?.topCategory || "暂无"}；常见情绪：${stats?.topMood || "暂无"}。`,
    `AI偏好：共情 ${preferences.empathy}/100，幽默 ${preferences.humor}/100，客观 ${preferences.objectivity}/100。`,
    "已完成事件：",
    events,
    `可参考任务池：${taskTitles || "暂无"}`,
    "规则：建议必须具体可执行；如果独处多，可以推荐轻社交或继续温和独处；如果成长多，推荐恢复或复盘；如果负面情绪多，推荐低强度治愈任务；不要每次都推荐读书或运动。",
    "输出格式必须每行一条：建议标题｜为什么推荐｜可执行步骤。",
  ].join("\n");
}

function canUseTextApi(mode: "mock" | "api") {
  const config = getRuntimeAIConfig();
  return mode === "api" && Boolean(config.textApiBase && config.textApiKey && config.textModel);
}

function canUseImageApi(mode: "mock" | "api") {
  const config = getRuntimeAIConfig();
  return mode === "api" && Boolean(config.imageApiBase && config.imageApiKey && config.imageModel);
}

function getRuntimeAIConfig(): AIApiConfig {
  const fromProfile = readStoredAIConfig();
  return {
    textApiBase: fromProfile.textApiBase || defaultRuntimeConfig.textApiBase,
    textApiKey: fromProfile.textApiKey || defaultRuntimeConfig.textApiKey,
    textModel: fromProfile.textModel || defaultRuntimeConfig.textModel,
    imageApiBase: fromProfile.imageApiBase || defaultRuntimeConfig.imageApiBase,
    imageApiKey: fromProfile.imageApiKey || defaultRuntimeConfig.imageApiKey,
    imageModel: fromProfile.imageModel || defaultRuntimeConfig.imageModel,
    amapApiKey: fromProfile.amapApiKey || defaultRuntimeConfig.amapApiKey,
  };
}

function readStoredAIConfig(): AIApiConfig {
  if (typeof localStorage === "undefined") return defaultRuntimeConfig;
  try {
    const raw = localStorage.getItem("lifequest.profile");
    const profile = raw ? JSON.parse(raw) : {};
    return {
      ...defaultRuntimeConfig,
      ...(profile.aiApiConfig ?? {}),
    };
  } catch {
    return defaultRuntimeConfig;
  }
}

async function callTextApi(prompt: string, preferences: AIPreferences) {
  const config = getRuntimeAIConfig();
  const url = normalizeApiBase(config.textApiBase, "/chat/completions");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.textApiKey}`,
    },
    body: JSON.stringify({
      model: config.textModel,
      messages: [
        {
          role: "system",
          content: `你温柔、具体、不空泛。风格参数：共情=${preferences.empathy}，幽默=${preferences.humor}，客观=${preferences.objectivity}。`,
        },
        { role: "user", content: prompt },
      ],
      temperature: preferences.humor > 60 ? 0.9 : 0.65,
    }),
  });

  const result = await safeJson(response);
  if (!response.ok) throw new Error(extractApiMessage(result) || `文本 API 请求失败：${response.status}`);
  return result.choices?.[0]?.message?.content?.trim() || "这次记录已经被认真保存下来。";
}

async function callImageApi(prompt: string) {
  const config = getRuntimeAIConfig();
  const url = normalizeApiBase(config.imageApiBase, "/images/generations");
  if (import.meta.env.DEV) {
    console.log("[AI Image] request url:", url);
    console.log("[AI Image] model:", config.imageModel);
    console.log("[AI Image] prompt:", prompt);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.imageApiKey}`,
      },
      body: JSON.stringify({
        model: config.imageModel,
        prompt,
        image_size: "1024x1024",
        batch_size: 1,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        size: "1024x1024",
        n: 1,
      }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("浏览器前端直连被拦截，建议改为后端代理。");
    }
    throw error;
  }

  const result = await safeJson(response);
  if (import.meta.env.DEV) console.log("[AI Image] response:", result);
  if (!response.ok) {
    throw new Error(getAIErrorMessage(response.status, extractApiMessage(result)));
  }

  const imageUrl = extractImageUrl(result);
  if (import.meta.env.DEV) console.log("[AI Image] final imageUrl:", imageUrl);
  if (!imageUrl) throw new Error("接口成功但没有解析到图片 URL，请检查返回值格式。");
  return imageUrl;
}

function extractImageUrl(result: any) {
  const item = result?.data?.[0] ?? result?.images?.[0];
  if (item?.url) return item.url as string;
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (result?.url) return result.url as string;
  return undefined;
}

function extractApiMessage(result: any) {
  return result?.error?.message || result?.message || result?.detail || result?.error || undefined;
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function mockLifeCardText(input: LifeCardAiInput) {
  const objective = input.preferences.objectivity >= 70;
  const humorous = input.preferences.humor >= 60;
  const opening = objective
    ? `这次记录的核心，是你完成了「${input.title}」。`
    : `关于「${input.title}」这件事，你没有只是匆匆做完，而是真的把当时的自己留下来了。`;
  const place = input.locationName ? `地点也很具体：${input.locationName}。` : "";
  const detail = `从你的感受里能看见：${input.note || "这件事对你有一点特别"}。情绪是：${input.moodText || "平静"}。`;
  const tail = humorous ? "如果生活有存档点，这一刻大概会闪一下小光标。" : "这不是泛泛的“完成”，而是你和这一天认真打过一次照面。";
  return `${opening}${place}${detail}${tail}`;
}

function mockReviewSummary(cards: LifeCard[], periodLabel: string, preferences: AIPreferences, stats?: ReviewStats) {
  if (!cards.length) return `${periodLabel}暂时没有新的记录。空白不是失败，它只是提醒你：下一条支线可以从一件很小、很容易开始的事出发。`;

  const titles = cards.map((card) => `「${card.title}」`).slice(0, 4).join("、");
  const places = cards.map((card) => card.locationName || card.locationAddress || card.location).filter(Boolean).slice(0, 3).join("、");
  const moodText = cards.map((card) => card.moodText).filter(Boolean).join(" ");
  const noteText = cards.map((card) => card.note).filter(Boolean).join(" ");
  const hasHeavyMood = /难过|孤独|紧张|焦虑|低落|委屈|疲惫|累/.test(`${moodText} ${noteText}`);
  const category = stats?.topCategory && stats.topCategory !== "暂无" ? `高频分类集中在「${stats.topCategory}」。` : "";
  const change = stats ? `这一周期你留下了 ${stats.totalCards} 张人生卡，较上一周期${formatChange(stats.growthRate)}。` : "";
  const placeText = places ? `地点也更清楚了：${places}。` : "";
  const empathyLine = preferences.empathy > 60
    ? hasHeavyMood
      ? "里面有些情绪并不轻，但你还是把它记录了下来，这本身就是一种照顾自己的方式。"
      : "这些小事不喧哗，却很像你在认真生活的证据。"
    : "从事件分布看，你这段时间主要在推进可执行的小目标。";

  return `${change}你具体完成了 ${titles}。${placeText}${category}${empathyLine}下一步不用突然改变很多，顺着已经发生的事情，再多走半步就好。`;
}

function mockNextTaskSuggestions(cards: LifeCard[], stats?: ReviewStats): ReviewSuggestion[] {
  const text = `${cards.map((card) => `${card.title} ${card.category || ""} ${card.moodText || ""} ${card.note || ""}`).join(" ")} ${stats?.topCategory || ""} ${stats?.topMood || ""}`;
  const suggestions: ReviewSuggestion[] = [];

  if (/孤独|难过|疲惫|焦虑|紧张|低落|累/.test(text)) {
    suggestions.push({
      title: "做一次低强度恢复支线",
      reason: "这段记录里出现了比较消耗的情绪，下一步先降低难度更合适。",
      action: "今天只做 10 分钟整理桌面、热饮或短散步，完成后写一句真实感受。",
    });
  }

  if (/独处|一个人|书店|散步|吃饭|独处清单/.test(text)) {
    suggestions.push({
      title: "发起一次轻社交连接",
      reason: "你已经有不少和自己相处的记录，可以温和地把连接感补回来一点。",
      action: "给一个熟悉的人发一句近况问候，不需要展开长聊。",
    });
  }

  if (/天空|照片|观察|日落|风景|城市|生活观察/.test(text)) {
    suggestions.push({
      title: "连续记录一个生活角落",
      reason: "你对生活细节的观察已经出现了，连续记录会让轨迹更清楚。",
      action: "选同一个窗边、路口或天空，连续两天各拍一张并写一句变化。",
    });
  }

  if (/成长|学习|完成|成就|做到/.test(text)) {
    suggestions.push({
      title: "给成长任务配一次复原",
      reason: "推进之后也需要收束，否则成就感容易被疲惫盖住。",
      action: "安排 20 分钟无目标休息，结束后写下今天最值得保留的一件事。",
    });
  }

  suggestions.push(
    {
      title: "补一张今天的生活切片",
      reason: "复盘会因为具体记录变得更像你，而不是模板总结。",
      action: "在今天结束前拍一张眼前的小物或路上的画面，配一句当下心情。",
    },
    {
      title: "解锁一个很小的新地点",
      reason: "换一个安全、熟悉附近的小场景，能给生活轨迹增加一点新鲜感。",
      action: "白天去附近一家便利店、咖啡店或公园入口停留 10 分钟。",
    },
  );

  return dedupeSuggestions(suggestions).slice(0, 3);
}

function parseSuggestions(text: string): ReviewSuggestion[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.、\s]+/, "").trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const parts = line.split(/[｜|]/).map((part) => part.trim()).filter(Boolean);
      if (parts.length >= 3) {
        return { title: parts[0], reason: parts[1], action: parts.slice(2).join("，") };
      }
      return {
        title: parts[0] || line.slice(0, 24),
        reason: "这条建议来自你最近完成的人生卡片。",
        action: line,
      };
    })
    .filter((item) => item.title && item.action);
}

function dedupeSuggestions(suggestions: ReviewSuggestion[]) {
  const seen = new Set<string>();
  return suggestions.filter((item) => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });
}

function inferImageScene(title: string) {
  if (/吃饭|火锅|餐|咖啡|奶茶/.test(title)) return "一个年轻人坐在小餐馆靠窗的位置吃饭，桌上有简单热气的食物，窗外是柔和的城市街景";
  if (/天空|晚霞|风景|照片|拍/.test(title)) return "一张被认真看见的天空或晚霞，前景有一点生活场景，像随手记录但很珍贵";
  if (/书店|读书/.test(title)) return "一个人在温暖书店的书架之间慢慢翻书，午后光线落在书页上";
  if (/父母|朋友|问候|信|感谢|关系/.test(title)) return "温暖的人际连接场景，桌面有信纸或手机消息，光线柔和";
  return `围绕「${title}」的真实生活瞬间`;
}

function getReadablePeriod(period: ReviewPeriod) {
  const labels: Record<ReviewPeriod, string> = {
    daily: "日复盘",
    weekly: "周复盘",
    monthly: "月复盘",
    quarterly: "季复盘",
    yearly: "年复盘",
  };
  return labels[period];
}

function formatChange(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

const defaultPreferences: AIPreferences = {
  empathy: 50,
  humor: 10,
  objectivity: 80,
};
