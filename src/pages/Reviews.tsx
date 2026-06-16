import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import { LifeCardPreview } from "../components/LifeCard/LifeCardPreview";
import { ReviewCategoryChart } from "../components/Review/ReviewCategoryChart";
import { ReviewEmptyState } from "../components/Review/ReviewEmptyState";
import { ReviewMoodChart } from "../components/Review/ReviewMoodChart";
import { ReviewStatCards } from "../components/Review/ReviewStatCards";
import { ReviewSuggestionCard } from "../components/Review/ReviewSuggestionCard";
import { ReviewTrendChart } from "../components/Review/ReviewTrendChart";
import { TimelineList } from "../components/Timeline/TimelineList";
import { DotPattern } from "../components/ui/DotPattern";
import { useAppData } from "../services/AppDataContext";
import { generateNextTaskSuggestions, generateReviewSummary } from "../services/aiService";
import { buildReviewStats, getCardsByPeriod, getPeriodLabel, getPreviousPeriodCards } from "../services/reviewService";
import type { ReviewPeriod, ReviewSuggestion } from "../types";

const periodOptions: Array<{ key: ReviewPeriod; label: string; settingKey?: "daily" | "weekly" | "monthly"; note: string }> = [
  { key: "daily", label: "日映照", settingKey: "daily", note: "设置可关闭" },
  { key: "weekly", label: "周映照", settingKey: "weekly", note: "设置可关闭" },
  { key: "monthly", label: "月映照", settingKey: "monthly", note: "设置可关闭" },
  { key: "quarterly", label: "季映照", note: "系统保留" },
  { key: "yearly", label: "年映照", note: "系统保留" },
];

const validPeriods = new Set<ReviewPeriod>(["daily", "weekly", "monthly", "quarterly", "yearly"]);

export function Reviews() {
  const { lifeCards, tasks, profile, reviewSettings, createTodo } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPeriod = normalizePeriod(searchParams.get("period"));
  const fallbackPeriod = periodOptions.find((item) => isEnabled(item.key, reviewSettings))?.key || "quarterly";
  const period = isEnabled(requestedPeriod, reviewSettings) ? requestedPeriod : fallbackPeriod;
  const periodLabel = getPeriodLabel(period);

  const periodCards = useMemo(() => getCardsByPeriod(lifeCards, period), [lifeCards, period]);
  const previousCards = useMemo(() => getPreviousPeriodCards(lifeCards, period), [lifeCards, period]);
  const stats = useMemo(() => buildReviewStats(periodCards, previousCards, period), [period, periodCards, previousCards]);
  const [aiSummary, setAiSummary] = useState("");
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [addedTitles, setAddedTitles] = useState<string[]>([]);

  useEffect(() => {
    if (period !== requestedPeriod) {
      setSearchParams({ period }, { replace: true });
    }
  }, [period, requestedPeriod, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setAddedTitles([]);

    if (!periodCards.length) {
      setAiSummary("");
      setSuggestions([]);
      setIsAiLoading(false);
      return;
    }

    async function buildAiReview() {
      setIsAiLoading(true);
      const [summary, nextSuggestions] = await Promise.all([
        generateReviewSummary({
          cards: periodCards,
          periodLabel,
          periodType: period,
          stats,
          preferences: profile.aiPreferences,
          aiMode: profile.aiMode,
        }),
        generateNextTaskSuggestions({
          cards: periodCards,
          tasks,
          periodType: period,
          stats,
          preferences: profile.aiPreferences,
          aiMode: profile.aiMode,
        }),
      ]);
      if (!cancelled) {
        setAiSummary(summary);
        setSuggestions(nextSuggestions.slice(0, 3));
        setIsAiLoading(false);
      }
    }

    buildAiReview().catch((error) => {
      console.warn("[Review] failed to build AI review", error);
      if (!cancelled) {
        setAiSummary("这段映照暂时没有生成成功，但你的真实人生卡已经保存好了。稍后切换周期或重试时，会继续基于这些记录生成总结。");
        setSuggestions([]);
        setIsAiLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [period, periodCards, periodLabel, profile.aiMode, profile.aiPreferences, stats, tasks]);

  function selectPeriod(nextPeriod: ReviewPeriod) {
    if (!isEnabled(nextPeriod, reviewSettings)) return;
    setSearchParams({ period: nextPeriod });
  }

  function addSuggestionToTodo(suggestion: ReviewSuggestion) {
    const today = new Date().toISOString().slice(0, 10);
    createTodo({
      title: suggestion.title,
      description: `${suggestion.reason}\n${suggestion.action}`,
      date: today,
    });
    setAddedTitles((current) => [...current, suggestion.title]);
  }

  return (
    <div className="page-shell space-y-7">
      <section className="relative overflow-hidden rounded-[40px] bg-[#FBFAF7] p-6 shadow-[0_16px_48px_rgba(30,30,30,0.06)] md:p-8 animate-fade-up">
        <DotPattern opacity={0.22} />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-[#A8B8AE]">时光映照</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#1f1f1f] md:text-5xl">回看那些被你认真保存下来的生活片段</h1>
            <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-[#626262]">
              读取当前周期内的 LifeCard，整理分类、情绪、趋势、代表卡和下一步建议。
            </p>
          </div>
          <Link to="/settings" className="secondary-button self-start lg:self-auto">映照设置</Link>
        </div>

        <div className="relative z-10 mt-7 flex flex-wrap gap-2">
          {periodOptions.map((item) => {
            const enabled = isEnabled(item.key, reviewSettings);
            const selected = period === item.key;
            return (
              <button
                key={item.key}
                type="button"
                disabled={!enabled}
                onClick={() => selectPeriod(item.key)}
                className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                  selected
                    ? "bg-[#1f1f1f] text-white shadow-sm"
                    : enabled
                      ? "bg-white text-[#626262] hover:text-[#1f1f1f]"
                      : "cursor-not-allowed bg-[#EEEAE2] text-[#9a948c]"
                }`}
                title={enabled ? item.note : "已在设置中关闭"}
              >
                {item.label}
                <span className="ml-2 text-xs opacity-70">{enabled ? item.note : "已关闭"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <ReviewStatCards stats={stats} periodLabel={periodLabel} />
      {!periodCards.length ? <ReviewEmptyState periodLabel={periodLabel} /> : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <div className="animate-fade-up"><ReviewCategoryChart data={stats.categoryDistribution} /></div>
          <div className="animate-fade-up"><ReviewMoodChart data={stats.moodDistribution} /></div>
          <div className="animate-fade-up"><ReviewTrendChart data={stats.dailyTrend} /></div>

          {periodCards.length ? (
            <section className="paper-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-[#1f1f1f]">生活切片</h2>
                  <p className="mt-1 text-sm font-medium text-[#626262]">最近的人生卡会在这里按时间收拢。</p>
                </div>
                <CheckCircle2 className="text-[#A8B8AE]" size={22} />
              </div>
              <TimelineList cards={periodCards} />
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="paper-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#1f1f1f]">代表性人生卡</h2>
                <p className="mt-1 text-sm font-medium text-[#626262]">优先展示有图、有文案、记录更完整的卡片。</p>
              </div>
              <Sparkles className="text-[#A8B8AE]" size={22} />
            </div>
            <div className="space-y-4">
              {stats.representativeCards.length ? (
                stats.representativeCards.map((card) => <div key={card.id} className="animate-soft-scale"><LifeCardPreview card={card} compact /></div>)
              ) : (
                <p className="rounded-[24px] bg-[#F8F6F2] p-4 text-sm font-medium leading-7 text-[#626262]">
                  这里会展示本周期最有代表性的 1-3 张人生卡。
                </p>
              )}
            </div>
          </section>

          <section className="paper-card p-5 animate-fade-up">
            <h2 className="text-lg font-black text-[#1f1f1f]">AI 阶段映照</h2>
            <div className="mt-4 rounded-[24px] bg-[#F8F6F2] p-4 text-sm font-medium leading-7 text-[#1f1f1f]">
              {periodCards.length
                ? isAiLoading
                  ? "正在根据当前周期内的真实人生卡生成阶段映照..."
                  : aiSummary
                : "这个周期还没有足够内容生成映照。完成一次打卡后，我会帮你把这些生活片段整理成阶段总结。"}
            </div>
          </section>

          <section className="space-y-4">
            <div className="paper-card p-5">
              <h2 className="text-lg font-black text-[#1f1f1f]">下一步建议</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-[#626262]">每条建议都可以一键加入今日待办。</p>
            </div>
            {periodCards.length ? (
              isAiLoading && !suggestions.length ? (
                <p className="paper-card p-5 text-sm font-medium leading-7 text-[#626262]">正在从你的真实记录里挑下一条小支线...</p>
              ) : suggestions.length ? (
                suggestions.map((suggestion) => (
                  <ReviewSuggestionCard
                    key={suggestion.title}
                    suggestion={suggestion}
                    added={addedTitles.includes(suggestion.title)}
                    onAdd={() => addSuggestionToTodo(suggestion)}
                  />
                ))
              ) : (
                <p className="paper-card p-5 text-sm font-medium leading-7 text-[#626262]">暂时没有生成建议，可以先从任务库里挑一条轻松支线。</p>
              )
            ) : (
              <p className="paper-card p-5 text-sm font-medium leading-7 text-[#626262]">有了第一张人生卡后，这里会根据你的分类和情绪生成下一步建议。</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function normalizePeriod(value: string | null): ReviewPeriod {
  return validPeriods.has(value as ReviewPeriod) ? (value as ReviewPeriod) : "weekly";
}

function isEnabled(period: ReviewPeriod, settings: { daily: boolean; weekly: boolean; monthly: boolean }) {
  if (period === "daily" || period === "weekly" || period === "monthly") return settings[period];
  return true;
}
