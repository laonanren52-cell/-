import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, Info, PenLine, Save, Trash2, X } from "lucide-react";
import { useAppData } from "../services/AppDataContext";
import type { DiaryNote } from "../types";

export function Diary() {
  const { diaries, createDiary, updateDiaryNote, removeDiaryNote } = useAppData();
  const [searchParams] = useSearchParams();
  const autoFocus = searchParams.get("autoFocus") === "1";
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 10));
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const sortedDiaries = useMemo(
    () => [...diaries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [diaries],
  );

  useEffect(() => {
    if (!autoFocus) return;
    setShowEditor(true);
    window.setTimeout(() => titleRef.current?.focus(), 120);
  }, [autoFocus]);

  function resetEditor() {
    setEditingId(null);
    setEditDate(new Date().toISOString().slice(0, 10));
    setEditTitle("");
    setEditContent("");
  }

  function openNew() {
    resetEditor();
    setShowEditor(true);
    window.setTimeout(() => titleRef.current?.focus(), 120);
  }

  function openEdit(note: DiaryNote) {
    setEditingId(note.id);
    setEditDate(note.date);
    setEditTitle(note.title);
    setEditContent(note.content);
    setShowEditor(true);
    window.setTimeout(() => contentRef.current?.focus(), 120);
  }

  function closeEditor() {
    resetEditor();
    setShowEditor(false);
  }

  function saveNote() {
    if (!editTitle.trim() || !editContent.trim()) return;
    const payload = {
      date: editDate || new Date().toISOString().slice(0, 10),
      title: editTitle.trim(),
      content: editContent.trim(),
    };
    if (editingId) {
      const existing = diaries.find((note) => note.id === editingId);
      if (existing) updateDiaryNote({ ...existing, ...payload });
    } else {
      createDiary(payload);
    }
    closeEditor();
  }

  function deleteNote() {
    if (!deleteTarget) return;
    removeDiaryNote(deleteTarget);
    if (editingId === deleteTarget) closeEditor();
    setDeleteTarget(null);
  }

  return (
    <div className="page-shell space-y-6">
      {deleteTarget ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-glow">
            <div className="mb-5 flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Info size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">确认删除这条日记？</p>
                <p className="mt-1 text-sm leading-6 text-gray-500">删除后无法恢复，但你的其他人生卡不会受影响。</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="secondary-button" type="button" onClick={() => setDeleteTarget(null)}>
                取消
              </button>
              <button className="primary-button bg-rose-600 hover:bg-rose-700" type="button" onClick={deleteNote}>
                <Trash2 size={16} />
                删除
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-coral">小日记</p>
            <h1 className="section-title mt-2">写写今天的念头</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">
              这里适合记录不一定对应某张人生卡的小想法。几句话也可以，留住一点今天的纹理。
            </p>
          </div>
          {!showEditor ? (
            <button className="primary-button" type="button" onClick={openNew}>
              <PenLine size={18} />
              写日记
            </button>
          ) : null}
        </div>

        {showEditor ? (
          <div className="mt-6 space-y-4 rounded-3xl border border-orange-100 bg-white/80 p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <CalendarDays size={16} />
              <input
                className="rounded-2xl border border-orange-100 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-coral"
                type="date"
                value={editDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setEditDate(event.target.value)}
              />
            </label>
            <input
              ref={titleRef}
              className="soft-input"
              placeholder="给今天的日记起个标题"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
            />
            <textarea
              ref={contentRef}
              className="soft-input min-h-40"
              placeholder="今天发生了什么，或者你正在想什么？"
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <button className="secondary-button" type="button" onClick={closeEditor}>
                <X size={18} />
                取消
              </button>
              <button className="primary-button" type="button" onClick={saveNote}>
                <Save size={18} />
                保存日记
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900">历史日记</h2>
        {sortedDiaries.length ? (
          <div className="grid gap-4">
            {sortedDiaries.map((note) => (
              <article key={note.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <button className="min-w-0 flex-1 text-left" type="button" onClick={() => openEdit(note)}>
                    <p className="text-xs font-semibold text-gray-500">{note.date}</p>
                    <h3 className="mt-1 line-clamp-1 text-base font-bold text-gray-900">{note.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{note.content}</p>
                  </button>
                  <button className="icon-button shrink-0 text-rose-600" type="button" title="删除日记" onClick={() => setDeleteTarget(note.id)}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-card p-10 text-center">
            <PenLine size={34} className="mx-auto mb-3 text-zinc-300" />
            <p className="text-sm font-bold text-gray-500">还没有写过日记</p>
            <p className="mt-2 text-sm text-gray-500">从一两句话开始，把今天的想法存一下。</p>
            <button className="primary-button mt-5" type="button" onClick={openNew}>
              <PenLine size={18} />
              写第一篇日记
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
