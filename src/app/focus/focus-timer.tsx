"use client";

import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { ClipboardIcon, TomatoIcon } from "@/app/ui/icons";
import Ring from "./ring";
import { sortTasks, TaskBoard, TaskFocus, TaskPanel, type Task } from "./tasks";

type Mode = "pomodoro" | "tasks";
type Phase = "focus" | "short" | "long";

const PHASES: Record<Phase, { label: string; color: string }> = {
  focus: { label: "專注", color: "#e0643c" },
  short: { label: "短休息", color: "#a9c8f0" },
  long: { label: "長休息", color: "#8fd0a8" },
};
const PHASE_ORDER: Phase[] = ["focus", "short", "long"];
// 每完成幾顆番茄進入長休息
const LONG_BREAK_EVERY = 4;

function formatTime(ms: number) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

const STORAGE_KEY = "magic-tools:focus";

type Saved = {
  date: string;
  completed: number;
  focusedMinutes: number;
  minutes: Record<Phase, number>;
  autoStart: boolean;
  soundOn: boolean;
  task: string;
  tasks: Task[];
  selectedTaskId: string | null;
};

// 以本地時間的日期當作「今日成果」的分界
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const DEFAULTS: Saved = {
  date: "",
  completed: 0,
  focusedMinutes: 0,
  minutes: { focus: 25, short: 5, long: 15 },
  autoStart: false,
  soundOn: true,
  task: "",
  tasks: [],
  selectedTaskId: null,
};

function isTask(value: unknown): value is Task {
  const t = value as Task;
  return (
    typeof t === "object" &&
    t !== null &&
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    Number.isFinite(t.due) &&
    Number.isFinite(t.createdAt) &&
    (t.doneAt === null || Number.isFinite(t.doneAt))
  );
}

// 讀回上次的設定與今日成果；資料有問題就用預設值
function loadSaved(): Saved {
  let saved: Partial<Saved> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw) as Partial<Saved>;
  } catch {
    // 無痕模式或資料損毀時就用預設值
  }
  const today = todayKey();
  const sameDay = saved.date === today;
  const m = saved.minutes ?? DEFAULTS.minutes;
  return {
    date: today,
    completed: sameDay ? clamp(Number(saved.completed), 0, 9999) : 0,
    focusedMinutes: sameDay ? clamp(Number(saved.focusedMinutes), 0, 999_999) : 0,
    minutes: { focus: clamp(m.focus, 1, 180), short: clamp(m.short, 1, 180), long: clamp(m.long, 1, 180) },
    autoStart: typeof saved.autoStart === "boolean" ? saved.autoStart : DEFAULTS.autoStart,
    soundOn: typeof saved.soundOn === "boolean" ? saved.soundOn : DEFAULTS.soundOn,
    task: typeof saved.task === "string" ? saved.task : DEFAULTS.task,
    tasks: Array.isArray(saved.tasks) ? saved.tasks.filter(isTask) : [],
    selectedTaskId: typeof saved.selectedTaskId === "string" ? saved.selectedTaskId : null,
  };
}

const subscribeNothing = () => () => {};

const card = "border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414]";
const pressable =
  "border-[3px] border-[#141414] font-black shadow-[4px_4px_0_#141414] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_#141414]";

export default function FocusTimer() {
  // 伺服器渲染時沒有 localStorage，先用預設值；到瀏覽器後再用存檔重新掛載
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return isClient ? <Timer key="client" initial={loadSaved()} persist /> : <Timer key="server" initial={DEFAULTS} />;
}

function Timer({ initial, persist = false }: { initial: Saved; persist?: boolean }) {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [phase, setPhase] = useState<Phase>("focus");
  const [minutes, setMinutes] = useState(initial.minutes);
  const [totalMs, setTotalMs] = useState(initial.minutes.focus * 60_000);
  const [remainingMs, setRemainingMs] = useState(initial.minutes.focus * 60_000);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(initial.completed);
  const [focusedMinutes, setFocusedMinutes] = useState(initial.focusedMinutes);
  const [autoStart, setAutoStart] = useState(initial.autoStart);
  const [soundOn, setSoundOn] = useState(initial.soundOn);
  const [task, setTask] = useState(initial.task);
  const [notice, setNotice] = useState<string | null>(null);
  const [statsDate, setStatsDate] = useState(initial.date);
  const [tasks, setTasks] = useState(initial.tasks);
  const [selectedTaskId, setSelectedTaskId] = useState(initial.selectedTaskId);
  // 只有在瀏覽器裡才取現在時間，伺服器渲染時用 0
  const [now, setNow] = useState(() => (persist ? Date.now() : 0));

  const endAtRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const focusTask = tasks.find((t) => t.id === selectedTaskId) ?? sortTasks(tasks)[0];
  const color = PHASES[phase].color;
  const label = PHASES[phase].label;
  const progress = totalMs > 0 ? remainingMs / totalMs : 0;
  const started = running || remainingMs < totalMs;

  function setTimer(ms: number) {
    setRunning(false);
    setTotalMs(ms);
    setRemainingMs(ms);
  }

  function goToPhase(next: Phase, startNow = false) {
    const ms = minutes[next] * 60_000;
    setPhase(next);
    setTotalMs(ms);
    setRemainingMs(ms);
    if (startNow) {
      endAtRef.current = Date.now() + ms;
    }
    setRunning(startNow);
  }

  function playChime() {
    const ctx = audioRef.current;
    if (!soundOn || !ctx) return;
    [0, 0.3, 0.6].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + offset;
      osc.type = "sine";
      osc.frequency.value = [880, 660, 990][i];
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  const handleFinish = useEffectEvent(() => {
    playChime();
    if (phase === "focus") {
      // 跨日後從 0 開始累計
      const today = todayKey();
      const sameDay = statsDate === today;
      const count = (sameDay ? completed : 0) + 1;
      setStatsDate(today);
      setCompleted(count);
      setFocusedMinutes((sameDay ? focusedMinutes : 0) + minutes.focus);
      setNotice(
        count % LONG_BREAK_EVERY === 0
          ? `完成第 ${count} 顆番茄，好好休息久一點吧！`
          : `完成第 ${count} 顆番茄，休息一下吧！`,
      );
      goToPhase(count % LONG_BREAK_EVERY === 0 ? "long" : "short", autoStart);
    } else {
      setNotice("休息結束，回來專注吧！");
      goToPhase("focus", autoStart);
    }
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = endAtRef.current - Date.now();
      if (left <= 0) {
        clearInterval(id);
        setRemainingMs(0);
        setRunning(false);
        handleFinish();
      } else {
        setRemainingMs(left);
      }
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  // 任務倒數每秒更新一次
  useEffect(() => {
    if (mode !== "tasks") return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [mode]);

  // 設定和今日成果有變動就存回瀏覽器
  useEffect(() => {
    if (!persist) return;
    const data: Saved = {
      date: statsDate,
      completed,
      focusedMinutes,
      minutes,
      autoStart,
      soundOn,
      task,
      tasks,
      selectedTaskId,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 無痕模式或儲存空間被封鎖時就不保存
    }
  }, [persist, statsDate, completed, focusedMinutes, minutes, autoStart, soundOn, task, tasks, selectedTaskId]);

  // 在瀏覽器分頁標題顯示剩餘時間
  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);
  useEffect(() => {
    if (started && mode !== "tasks") {
      document.title = `${formatTime(remainingMs)} ${label}${running ? "" : "（暫停）"}`;
    } else {
      document.title = "專注計時 | Magic Tools";
    }
  }, [started, running, remainingMs, label, mode]);

  function start() {
    if (remainingMs <= 0) return;
    // 在使用者點擊時建立音效，避免瀏覽器擋掉自動播放
    if (!audioRef.current) {
      audioRef.current = new AudioContext();
    }
    void audioRef.current.resume();
    endAtRef.current = Date.now() + remainingMs;
    setRunning(true);
  }

  function pause() {
    setRunning(false);
    setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    if (next === "pomodoro") {
      goToPhase(phase);
    } else {
      setTimer(totalMs);
    }
  }

  function updateMinutes(key: Phase, value: number) {
    const next = { ...minutes, [key]: clamp(value, 1, 180) };
    setMinutes(next);
    if (mode === "pomodoro" && key === phase) {
      setTimer(next[key] * 60_000);
    }
  }

  function skip() {
    goToPhase(phase === "focus" ? "short" : "focus");
  }

  const cycleDone = completed % LONG_BREAK_EVERY;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* 主計時區 */}
      <section className={`${card} flex flex-col items-center gap-6 p-5 sm:p-8`}>
        {/* 模式切換 */}
        <div className="flex w-full max-w-md border-[3px] border-[#141414]">
          {(["pomodoro", "tasks"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex flex-1 items-center justify-center gap-2 px-1 py-2 text-sm font-black transition sm:text-base ${
                mode === m ? "bg-[#141414] text-[#f0c54b]" : "bg-white hover:bg-[#f0c54b]"
              }`}
            >
              <span className="flex size-7 items-center justify-center border-2 border-[#141414] bg-[#fffdf8]">
                {m === "pomodoro" ? <TomatoIcon className="size-5" /> : <ClipboardIcon className="size-5" />}
              </span>
              {m === "pomodoro" ? "番茄鐘" : "任務倒數"}
            </button>
          ))}
        </div>

        {mode === "tasks" ? (
          <>
            <TaskFocus task={focusTask} now={now} />
            <TaskBoard
              tasks={tasks}
              selectedId={focusTask?.id ?? null}
              now={now}
              onSelect={setSelectedTaskId}
              onToggle={(id) =>
                setTasks((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, doneAt: t.doneAt ? null : Date.now() } : t)),
                )
              }
              onRemove={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
            />
          </>
        ) : (
          <>
            {/* 番茄鐘階段 */}
            {mode === "pomodoro" && (
              <div className="flex flex-wrap justify-center gap-3">
                {PHASE_ORDER.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPhase(p)}
                    className="border-2 border-[#141414] px-3 py-1 text-sm font-black transition"
                    style={{ backgroundColor: phase === p ? PHASES[p].color : "#fff" }}
                  >
                    {PHASES[p].label} {minutes[p]} 分
                  </button>
                ))}
              </div>
            )}

            {/* 計時圓環 */}
            <Ring progress={progress} color={color} animate={running}>
                <span
                  className="border-2 border-[#141414] px-3 py-0.5 text-sm font-black tracking-widest"
                  style={{ backgroundColor: color }}
                >
                  {label}
                  {!running && started && remainingMs > 0 ? "・暫停" : ""}
                </span>
                <span
                  className={`font-black leading-none tabular-nums ${
                    remainingMs >= 3_600_000 ? "text-[clamp(2.25rem,10vw,3.75rem)]" : "text-[clamp(2.75rem,13vw,5rem)]"
                  }`}
                >
                  {formatTime(remainingMs)}
                </span>
                {mode === "pomodoro" && (
                  <span className="text-sm font-bold text-[#666]">第 {completed + 1} 顆番茄</span>
                )}
            </Ring>

            {/* 控制按鈕 */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={running ? pause : start}
                disabled={!running && remainingMs <= 0}
                className={`${pressable} min-w-36 bg-[#e0643c] px-8 py-3 text-xl text-white`}
              >
                {running ? "暫停" : started && remainingMs > 0 ? "繼續" : "開始"}
              </button>
              <button
                type="button"
                onClick={() => setTimer(totalMs)}
                disabled={!started}
                className={`${pressable} bg-white px-6 py-3 text-lg`}
              >
                重設
              </button>
              {mode === "pomodoro" && (
                <button type="button" onClick={skip} className={`${pressable} bg-white px-6 py-3 text-lg`}>
                  跳過 »
                </button>
              )}
            </div>

            {/* 專注目標 */}
            <label className="flex w-full max-w-md flex-col gap-2">
              <span className="font-black">現在要專注的事</span>
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="例如：寫完企劃書第一段"
                className="border-2 border-dashed border-[#141414] bg-[#f3efe6] px-3 py-2 font-bold outline-none focus:border-solid focus:bg-white"
              />
            </label>
          </>
        )}
      </section>

      {/* 側邊設定 */}
      <div className="flex flex-col gap-10">
        {mode === "tasks" ? (
          <TaskPanel
            tasks={tasks}
            now={now}
            onAdd={(t) => {
              setTasks((prev) => [...prev, t]);
              setSelectedTaskId(t.id);
            }}
            onClearDone={() => setTasks((prev) => prev.filter((t) => !t.doneAt))}
          />
        ) : (
          <>
            <section className={`${card} flex flex-col gap-4 p-5`}>
              <h2 className="text-2xl font-black">番茄鐘設定</h2>
              {PHASE_ORDER.map((p) => (
                <label key={p} className="flex items-center justify-between gap-3 font-bold">
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-[#141414]" style={{ backgroundColor: PHASES[p].color }} />
                    {PHASES[p].label}
                  </span>
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={minutes[p]}
                      disabled={running}
                      onChange={(e) => updateMinutes(p, e.target.valueAsNumber)}
                      className="w-20 border-2 border-[#141414] bg-white px-2 py-1 text-right font-black outline-none disabled:opacity-50"
                    />
                    分
                  </span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="size-4 accent-[#e0643c]"
                />
                時間到自動開始下一段
              </label>
            </section>


            <section className={`${card} flex flex-col gap-4 p-5`}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">今日成果</h2>
                {completed > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatsDate(todayKey());
                      setCompleted(0);
                      setFocusedMinutes(0);
                    }}
                    className="border-2 border-[#141414] bg-white px-2 py-0.5 text-sm font-black hover:bg-[#eab0cb]"
                  >
                    歸零
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-[#141414] bg-[#f0c54b] p-3">
                  <p className="text-sm font-bold">完成番茄</p>
                  <p className="text-3xl font-black tabular-nums">{completed}</p>
                </div>
                <div className="border-2 border-[#141414] bg-[#a9c8f0] p-3">
                  <p className="text-sm font-bold">專注分鐘</p>
                  <p className="text-3xl font-black tabular-nums">{focusedMinutes}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold">
                  這一輪 {cycleDone} / {LONG_BREAK_EVERY}（滿 {LONG_BREAK_EVERY} 顆進入長休息）
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: LONG_BREAK_EVERY }, (_, i) => (
                    <span
                      key={i}
                      className="flex size-10 items-center justify-center border-2 border-[#141414]"
                      style={{ backgroundColor: i < cycleDone ? "#f0c54b" : "#f3efe6" }}
                    >
                      {i < cycleDone && <TomatoIcon className="size-7" />}
                    </span>
                  ))}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={soundOn}
                  onChange={(e) => setSoundOn(e.target.checked)}
                  className="size-4 accent-[#e0643c]"
                />
                時間到播放提示音
              </label>
            </section>
          </>
        )}
      </div>

      {/* 時間到提示 */}
      {notice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/60 p-4"
          onClick={() => setNotice(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm border-[3px] border-[#141414] bg-[#fffdf8] p-8 text-center shadow-[10px_10px_0_#141414]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-block border-2 border-[#141414] bg-[#141414] px-3 py-1 text-sm font-black tracking-widest text-[#f0c54b]">
              時間到
            </span>
            <p className="my-6 text-2xl font-black leading-snug">{notice}</p>
            {task && <p className="-mt-3 mb-6 font-bold text-[#666]">專注項目：{task}</p>}
            <button
              type="button"
              onClick={() => setNotice(null)}
              autoFocus
              className={`${pressable} bg-[#e0643c] px-8 py-2 text-white`}
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
