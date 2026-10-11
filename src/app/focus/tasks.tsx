"use client";

import { useState } from "react";
import { CheckIcon, CrossIcon } from "@/app/ui/icons";
import Ring from "./ring";

export type Task = {
  id: string;
  title: string;
  due: number;
  createdAt: number;
  doneAt: number | null;
};

const DAY = 86_400_000;
const card = "border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414]";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateInputValue(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDue(ms: number) {
  return new Date(ms).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// 依剩餘時間決定顏色：越接近越緊急
function statusColor(task: Task, now: number) {
  if (task.doneAt) return "#8fd0a8";
  const left = task.due - now;
  if (left <= 0) return "#c9c1b2";
  if (left < DAY) return "#e0643c";
  if (left < 3 * DAY) return "#f0c54b";
  return "#a9c8f0";
}

function splitLeft(left: number) {
  const total = Math.floor(Math.abs(left) / 1000);
  return {
    days: Math.floor(total / 86400),
    clock: `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`,
  };
}

function remainingRatio(task: Task, now: number) {
  const left = task.due - now;
  const span = task.due - task.createdAt;
  if (left <= 0) return 0;
  return span > 0 ? left / span : 1;
}

// 未完成的照截止時間排前面，已完成的放最後
export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (!!a.doneAt !== !!b.doneAt) return a.doneAt ? 1 : -1;
    return a.due - b.due;
  });
}

export function TaskFocus({ task, now }: { task: Task | undefined; now: number }) {
  if (!task) {
    return (
      <Ring progress={0} color="#a9c8f0">
        <span className="border-2 border-[#141414] bg-[#a9c8f0] px-3 py-0.5 text-sm font-black tracking-widest">
          任務倒數
        </span>
        <span className="text-xl font-black leading-snug">還沒有任務</span>
        <span className="text-sm font-bold text-[#666]">在右邊新增一個吧</span>
      </Ring>
    );
  }

  const left = task.due - now;
  const { days, clock } = splitLeft(left);
  const color = statusColor(task, now);

  return (
    <Ring progress={task.doneAt ? 1 : remainingRatio(task, now)} color={color}>
      <span
        className="max-w-full truncate border-2 border-[#141414] px-3 py-0.5 text-sm font-black tracking-wider"
        style={{ backgroundColor: color }}
      >
        {task.title}
      </span>
      {task.doneAt ? (
        <span className="flex items-center gap-1 text-[clamp(2rem,9vw,3rem)] font-black leading-none">
          已完成
          <CheckIcon className="size-[0.9em]" />
        </span>
      ) : left > 0 ? (
        <>
          <span className="font-black leading-none">
            <span className="text-[clamp(2.75rem,12vw,4.5rem)] tabular-nums">{days}</span>
            <span className="ml-1 text-2xl">天</span>
          </span>
          <span className="text-[clamp(1.25rem,5vw,1.75rem)] font-black tabular-nums">{clock}</span>
        </>
      ) : (
        <>
          <span className="text-[clamp(2rem,9vw,3rem)] font-black leading-none">已逾期</span>
          <span className="text-sm font-bold text-[#666]">
            超過 {days} 天 {clock}
          </span>
        </>
      )}
      <span className="text-xs font-bold text-[#666]">{formatDue(task.due)} 截止</span>
    </Ring>
  );
}

type TaskBoardProps = {
  tasks: Task[];
  selectedId: string | null;
  now: number;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TaskBoard({ tasks, selectedId, now, onSelect, onToggle, onRemove }: TaskBoardProps) {
  if (tasks.length === 0) return null;

  return (
    <ul className="flex w-full flex-col gap-3">
      {sortTasks(tasks).map((task) => {
        const left = task.due - now;
        const { days, clock } = splitLeft(left);
        const color = statusColor(task, now);
        const selected = task.id === selectedId;
        return (
          <li
            key={task.id}
            className={`flex items-stretch border-[3px] border-[#141414] bg-white transition ${
              selected ? "shadow-[5px_5px_0_#141414]" : ""
            } ${task.doneAt ? "opacity-70" : ""}`}
          >
            {/* 完成勾選 */}
            <button
              type="button"
              onClick={() => onToggle(task.id)}
              aria-label={task.doneAt ? `把「${task.title}」標回未完成` : `完成「${task.title}」`}
              className="flex w-12 shrink-0 items-center justify-center border-r-[3px] border-[#141414] hover:bg-[#f3efe6]"
            >
              <span
                className="flex size-6 items-center justify-center border-2 border-[#141414] font-black"
                style={{ backgroundColor: task.doneAt ? "#8fd0a8" : "#fff" }}
              >
                {task.doneAt && <CheckIcon className="size-4" />}
              </span>
            </button>

            {/* 任務內容 */}
            <button
              type="button"
              onClick={() => onSelect(task.id)}
              aria-pressed={selected}
              className={`flex min-w-0 flex-1 flex-col gap-2 px-4 py-3 text-left ${
                selected ? "bg-[#fdf3d0]" : "hover:bg-[#faf7ef]"
              }`}
            >
              <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className={`min-w-0 max-w-full truncate text-lg font-black ${task.doneAt ? "line-through" : ""}`}>
                  {task.title}
                </span>
                <span
                  className="shrink-0 border-2 border-[#141414] px-2 text-sm font-black tabular-nums"
                  style={{ backgroundColor: color }}
                >
                  {task.doneAt ? "已完成" : left > 0 ? `${days} 天 ${clock}` : "已逾期"}
                </span>
              </span>
              <span className="h-2.5 w-full border-2 border-[#141414] bg-[#ece6d8]">
                <span
                  className="block h-full"
                  style={{
                    width: `${(task.doneAt ? 1 : remainingRatio(task, now)) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </span>
              <span className="text-xs font-bold text-[#666]">{formatDue(task.due)} 截止</span>
            </button>

            <button
              type="button"
              onClick={() => onRemove(task.id)}
              aria-label={`刪除「${task.title}」`}
              className="flex items-center border-l-[3px] border-[#141414] px-3 hover:bg-[#eab0cb]"
            >
              <CrossIcon className="size-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type TaskPanelProps = {
  tasks: Task[];
  now: number;
  onAdd: (task: Task) => void;
  onClearDone: () => void;
};

export function TaskPanel({ tasks, now, onAdd, onClearDone }: TaskPanelProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59");
  const [error, setError] = useState<string | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const due = new Date(`${date}T${time || "23:59"}`).getTime();
    if (!title.trim()) return setError("請輸入任務名稱");
    if (!date || Number.isNaN(due)) return setError("請選擇截止日期");
    const current = Date.now();
    if (due <= current) return setError("截止時間要在未來喔");
    onAdd({ id: crypto.randomUUID(), title: title.trim(), due, createdAt: current, doneAt: null });
    setTitle("");
    setDate("");
    setTime("23:59");
    setError(null);
  }

  const open = tasks.filter((t) => !t.doneAt);
  const urgent = open.filter((t) => t.due > now && t.due - now < 3 * DAY).length;
  const overdue = open.filter((t) => t.due <= now).length;
  const done = tasks.length - open.length;

  return (
    <>
      <section className={`${card} flex flex-col gap-4 p-5`}>
        <h2 className="text-2xl font-black">新增任務</h2>
        <form onSubmit={add} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="任務名稱，例如：期末報告"
            className="border-2 border-[#141414] bg-white px-3 py-2 font-bold outline-none"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              min={now ? dateInputValue(now) : undefined}
              onChange={(e) => setDate(e.target.value)}
              aria-label="截止日期"
              className="min-w-0 flex-1 border-2 border-[#141414] bg-white px-2 py-2 font-bold outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="截止時間"
              className="w-28 border-2 border-[#141414] bg-white px-2 py-2 font-bold outline-none"
            />
          </div>
          {error && <p className="text-sm font-bold text-[#c0392b]">{error}</p>}
          <button
            type="submit"
            className="border-[3px] border-[#141414] bg-[#e0643c] py-2 font-black text-white shadow-[4px_4px_0_#141414] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            ＋ 加入任務
          </button>
        </form>
      </section>

      <section className={`${card} flex flex-col gap-4 p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">任務概況</h2>
          {done > 0 && (
            <button
              type="button"
              onClick={onClearDone}
              className="border-2 border-[#141414] bg-white px-2 py-0.5 text-sm font-black hover:bg-[#eab0cb]"
            >
              清除已完成
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["進行中", open.length, "#a9c8f0"],
              ["3 天內到期", urgent, "#f0c54b"],
              ["已逾期", overdue, "#c9c1b2"],
              ["已完成", done, "#8fd0a8"],
            ] as const
          ).map(([label, value, bg]) => (
            <div key={label} className="border-2 border-[#141414] p-3" style={{ backgroundColor: bg }}>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-3xl font-black tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
