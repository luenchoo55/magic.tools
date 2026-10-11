"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { IncenseIcon, ToriiIcon } from "@/app/ui/icons";
import { ITEM_LABELS, OMIKUJI, type Grade, type Omikuji } from "./data";
import OmikujiRack from "./omikuji-rack";
import { GRADE_STYLE, toKanji, type RackEntry } from "./shared";

const SHAKE_MS = 1600;

// 淺草寺一百籤中各等級的支數
const GRADE_COUNTS: [Grade, number][] = [
  ["大吉", 17],
  ["吉", 35],
  ["半吉", 5],
  ["小吉", 4],
  ["末小吉", 3],
  ["末吉", 6],
  ["凶", 30],
];

function randomIndex(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

const card = "border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414]";
const pressable =
  "border-[3px] border-[#141414] font-black shadow-[4px_4px_0_#141414] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

const STORAGE_KEY = "magic-tools:omikuji";
// 籤架最多保留的支數
const RACK_LIMIT = 36;

function isRackEntry(value: unknown): value is RackEntry {
  const e = value as RackEntry;
  return (
    typeof e === "object" &&
    e !== null &&
    typeof e.id === "string" &&
    Number.isInteger(e.no) &&
    e.no >= 1 &&
    e.no <= 100 &&
    typeof e.wish === "string" &&
    typeof e.tied === "boolean"
  );
}

function loadRack(): RackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isRackEntry).slice(0, RACK_LIMIT) : [];
  } catch {
    return [];
  }
}

const subscribeNothing = () => () => {};

export default function OmikujiDraw() {
  // 伺服器渲染時沒有 localStorage，到瀏覽器後再用存檔重新掛載
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return isClient ? <Draw key="client" initialRack={loadRack()} persist /> : <Draw key="server" initialRack={[]} />;
}

function Draw({ initialRack, persist = false }: { initialRack: RackEntry[]; persist?: boolean }) {
  const [wish, setWish] = useState("");
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState<Omikuji | null>(null);
  const [resultWish, setResultWish] = useState("");
  const [history, setHistory] = useState<RackEntry[]>(initialRack);
  const [tiePrompt, setTiePrompt] = useState<RackEntry | null>(null);
  const [justTied, setJustTied] = useState<string | null>(null);
  const [lookup, setLookup] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 籤架有變動就存回瀏覽器
  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // 無痕模式或儲存空間被封鎖時就不保存
    }
  }, [persist, history]);

  function draw() {
    if (shaking) return;
    const picked = OMIKUJI[randomIndex(OMIKUJI.length)];
    const currentWish = wish.trim();
    setShaking(true);
    setResult(null);
    setJustTied(null);
    timerRef.current = setTimeout(() => {
      const entry: RackEntry = { id: crypto.randomUUID(), no: picked.no, wish: currentWish, tied: false };
      setShaking(false);
      setResult(picked);
      setResultWish(currentWish);
      setHistory((prev) => [entry, ...prev].slice(0, RACK_LIMIT));
      // 抽到凶籤，詢問要不要綁在籤架上
      if (picked.grade === "凶") setTiePrompt(entry);
    }, SHAKE_MS);
  }

  function tie(entry: RackEntry) {
    setHistory((prev) => prev.map((e) => (e.id === entry.id ? { ...e, tied: true } : e)));
    setJustTied(entry.id);
    setTiePrompt(null);
  }

  function show(no: number, fromWish = "") {
    const found = OMIKUJI.find((o) => o.no === no);
    if (!found) return;
    setResult(found);
    setResultWish(fromWish);
  }

  const lookupNo = Number(lookup);
  const lookupValid = Number.isInteger(lookupNo) && lookupNo >= 1 && lookupNo <= 100;

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* 左側：籤筒與操作 */}
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:grid-cols-1">
        <section className={`${card} flex flex-col items-center gap-5 p-5`}>
          <h2 className="self-start text-2xl font-black">搖籤</h2>

          {/* 籤筒 */}
          <div className="relative h-80 w-40">
            {/* 抽出的籤條 */}
            {result && !shaking && (
              <div
                key={result.no}
                className="absolute bottom-[216px] left-1/2 z-10 w-7 -translate-x-1/2 animate-rise border-2 border-[#141414] bg-[#f5e6c4] px-0.5 py-1.5 text-center text-sm font-black leading-tight shadow-[3px_3px_0_#141414] [writing-mode:vertical-rl] motion-reduce:animate-none"
                aria-hidden
              >
                第{toKanji(result.no)}番
              </div>
            )}
            <svg
              viewBox="0 0 160 240"
              className={`absolute bottom-0 left-0 h-60 w-40 origin-bottom ${shaking ? "animate-shake" : ""}`}
              aria-label="籤筒"
              role="img"
            >
              <rect x="22" y="24" width="116" height="206" fill="#c9442e" stroke="#141414" strokeWidth="4" />
              <rect x="22" y="24" width="116" height="22" fill="#141414" />
              <rect x="68" y="8" width="24" height="20" fill="#3a3a3a" stroke="#141414" strokeWidth="4" />
              {[48, 80, 112].map((x) => (
                <line key={x} x1={x} y1="46" x2={x} y2="230" stroke="#9e3422" strokeWidth="3" />
              ))}
              <rect x="52" y="78" width="56" height="116" fill="#fffdf8" stroke="#141414" strokeWidth="4" />
              <text x="80" y="120" textAnchor="middle" fontSize="30" fontWeight="900" fill="#141414">
                御
              </text>
              <text x="80" y="164" textAnchor="middle" fontSize="30" fontWeight="900" fill="#141414">
                籤
              </text>
              <rect x="22" y="214" width="116" height="16" fill="#141414" />
            </svg>
          </div>

          <label className="flex w-full flex-col gap-2">
            <span className="font-black">心中想問的事（可不填）</span>
            <input
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="例如：這次轉職順利嗎？"
              disabled={shaking}
              className="border-2 border-dashed border-[#141414] bg-[#f3efe6] px-3 py-2 font-bold outline-none focus:border-solid focus:bg-white disabled:opacity-60"
            />
          </label>

          <button
            type="button"
            onClick={draw}
            disabled={shaking}
            className={`${pressable} w-full bg-[#e0643c] py-3 text-xl text-white`}
          >
            {shaking ? "搖籤中…" : result ? "再抽一支" : "搖籤筒"}
          </button>
        </section>

        <section className={`${card} flex flex-col gap-4 p-5`}>
          <h2 className="text-2xl font-black">查詢籤號</h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (lookupValid) show(lookupNo);
            }}
          >
            <input
              type="number"
              min={1}
              max={100}
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="1–100"
              aria-label="籤號"
              className="min-w-0 flex-1 border-2 border-[#141414] bg-white px-3 py-2 font-black outline-none"
            />
            <button
              type="submit"
              disabled={!lookupValid || shaking}
              className="border-2 border-[#141414] bg-[#f0c54b] px-4 font-black disabled:opacity-50"
            >
              查看
            </button>
          </form>

          <div>
            <p className="mb-2 text-sm font-bold">一百籤的吉凶分布</p>
            <div className="flex h-6 w-full border-2 border-[#141414]">
              {GRADE_COUNTS.map(([grade, count]) => (
                <span
                  key={grade}
                  title={`${grade} ${count} 支`}
                  style={{ width: `${count}%`, backgroundColor: GRADE_STYLE[grade].bg }}
                  className="border-r border-[#141414] last:border-r-0"
                />
              ))}
            </div>
            <ul className="mt-2 grid grid-cols-4 gap-x-2 gap-y-1 text-xs font-bold">
              {GRADE_COUNTS.map(([grade, count]) => (
                <li key={grade} className="flex items-center gap-1">
                  <span className="size-2.5 border border-[#141414]" style={{ backgroundColor: GRADE_STYLE[grade].bg }} />
                  {grade} {count}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* 右側：籤詩與解說 */}
      <div className="flex min-w-0 flex-col gap-10">
        {result && !shaking ? (
          <SlipCard
            key={`${result.no}-${history.length}`}
            omikuji={result}
            wish={resultWish}
            tied={justTied !== null && history.find((e) => e.id === justTied)?.no === result.no}
          />
        ) : (
          <section
            className={`${card} flex min-h-96 flex-col items-center justify-center gap-4 p-8 text-center`}
            aria-live="polite"
          >
            <span className="flex size-20 items-center justify-center border-[3px] border-[#141414] bg-[#f5e6c4] shadow-[5px_5px_0_#141414]">
              {shaking ? <IncenseIcon className="size-12" /> : <ToriiIcon className="size-12" />}
            </span>
            <p className="text-2xl font-black">{shaking ? "誠心默念中…" : "靜下心，按下「搖籤筒」"}</p>
            <p className="max-w-md font-bold text-[#666]">
              淺草寺的觀音籤共一百支，源自元三大師百籤。每支籤都有一首五言籤詩，以及願望、疾病、待人等各項提示。
            </p>
          </section>
        )}

        <OmikujiRack
          entries={history}
          disabled={shaking}
          onSelect={(entry) => show(entry.no, entry.wish)}
          onTie={(entry) => setTiePrompt(entry)}
          onClear={() => setHistory([])}
        />
      </div>

      {/* 凶籤：詢問是否綁上籤架 */}
      {tiePrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/60 p-4"
          onClick={() => setTiePrompt(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tie-title"
            className="w-full max-w-sm animate-unfold border-[3px] border-[#141414] bg-[#fffdf8] p-7 text-center shadow-[10px_10px_0_#141414] motion-reduce:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-block border-2 border-[#141414] bg-[#3a3a3a] px-3 py-1 text-sm font-black tracking-widest text-white">
              第{toKanji(tiePrompt.no)}番・凶
            </span>
            <h3 id="tie-title" className="mt-5 text-2xl font-black leading-snug">
              要把這支凶籤
              <br />
              綁在籤架上嗎？
            </h3>
            <p className="mt-3 font-bold leading-relaxed text-[#555]">
              在淺草寺，抽到凶籤的人會把籤綁在籤架上，把厄運留在寺裡，讓觀音替你化解。
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => tie(tiePrompt)}
                autoFocus
                className={`${pressable} bg-[#c9442e] py-2.5 text-white`}
              >
                綁上籤架，留下厄運
              </button>
              <button
                type="button"
                onClick={() => setTiePrompt(null)}
                className="border-2 border-[#141414] bg-white py-2 font-black hover:bg-[#f3efe6]"
              >
                先帶著，當作提醒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlipCard({ omikuji, wish, tied }: { omikuji: Omikuji; wish: string; tied: boolean }) {
  const style = GRADE_STYLE[omikuji.grade];
  const isBad = omikuji.grade === "凶";

  return (
    <article className={`${card} animate-unfold motion-reduce:animate-none`} aria-live="polite">
      {/* 籤頭 */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#141414] px-5 py-4">
        <div>
          <p className="text-sm font-bold tracking-widest text-[#666]">淺草觀音寺・觀音百籤</p>
          <h3 className="text-3xl font-black">第{toKanji(omikuji.no)}番</h3>
        </div>
        <span
          className="border-[3px] border-[#141414] px-5 py-1 text-3xl font-black shadow-[4px_4px_0_#141414]"
          style={{ backgroundColor: style.bg, color: style.fg }}
        >
          {omikuji.grade}
        </span>
      </header>

      <div className="grid gap-6 p-5 md:grid-cols-[auto_minmax(0,1fr)]">
        {/* 籤詩（直書） */}
        <div className="flex justify-center">
          <div
            className="h-64 border-[3px] border-[#141414] bg-[#f5e6c4] px-4 py-5 text-[1.7rem] font-black leading-[2.4] tracking-[0.3em] [writing-mode:vertical-rl]"
            lang="zh-Hant"
          >
            {omikuji.poem.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {wish && (
            <p className="border-2 border-dashed border-[#141414] bg-[#f3efe6] px-3 py-2 font-bold">
              所問之事：{wish}
            </p>
          )}
          <section>
            <h4 className="mb-1 inline-block bg-[#141414] px-2 py-0.5 text-sm font-black tracking-widest text-[#f0c54b]">
              籤詩白話
            </h4>
            <p className="font-bold leading-relaxed">{omikuji.meaning}</p>
          </section>
          <section>
            <h4 className="mb-1 inline-block bg-[#141414] px-2 py-0.5 text-sm font-black tracking-widest text-[#f0c54b]">
              觀音的提醒
            </h4>
            <p className="font-bold leading-relaxed">{omikuji.advice}</p>
          </section>
        </div>
      </div>

      {/* 各項運勢 */}
      <dl className="grid grid-cols-1 border-t-[3px] border-[#141414] sm:grid-cols-2">
        {ITEM_LABELS.map((label, i) => (
          <div
            key={label}
            className={`flex gap-3 border-b-2 border-[#141414] px-5 py-3 last:border-b-0 sm:odd:border-r-2 ${
              i === ITEM_LABELS.length - 1 ? "sm:col-span-2 sm:border-r-0" : ""
            }`}
          >
            <dt className="w-10 shrink-0 font-black">{label}</dt>
            <dd className="font-bold text-[#333]">{omikuji.items[i]}</dd>
          </div>
        ))}
      </dl>

      {isBad && (
        <p className="border-t-[3px] border-[#141414] bg-[#3a3a3a] px-5 py-3 font-bold text-white">
          {tied
            ? "這支凶籤已經綁在籤架上，厄運就留在這裡了。凶籤是提醒你謹慎行事，好好調整就能轉運。"
            : "抽到凶籤別擔心：可以把它綁在下方的籤架上，把厄運留在寺裡。凶籤是提醒你謹慎行事，好好調整就能轉運。"}
        </p>
      )}
      <p className="border-t-2 border-[#141414] px-5 py-2 text-xs font-bold text-[#777]">
        籤詩原文依淺草寺觀音百籤；白話解說為參考整理，僅供娛樂與自我提醒。
      </p>
    </article>
  );
}
