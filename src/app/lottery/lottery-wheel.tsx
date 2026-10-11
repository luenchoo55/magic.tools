"use client";

import { useState } from "react";
import CoinFlip from "./coin-flip";

const INK = "#141414";
// 黃、橘、米白三色輪流，參考韓式輪盤配色
const SLICE_COLORS = ["#f7d35c", "#f0a03c", "#fff8e8"];
const SPIN_SECONDS = 5;

const SIZE = 400;
const CENTER = SIZE / 2;
const RIM_RADIUS = 196;
const RADIUS = 170;
const BULB_COUNT = 24;
// 項目超過這個數量時，改成放射狀文字並隱藏金幣
const COIN_LIMIT = 10;

const DEFAULT_NAMES = ["小明", "小華", "小美", "阿強", "小芳", "大雄"].join("\n");

// 角度以 12 點鐘方向為 0 度，順時針遞增
function pointAt(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  return [CENTER + r * Math.sin(rad), CENTER - r * Math.cos(rad)];
}

function wedgePath(start: number, end: number) {
  const [x1, y1] = pointAt(start, RADIUS);
  const [x2, y2] = pointAt(end, RADIUS);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function colorFor(index: number, count: number) {
  // 避免最後一格和第一格同色相鄰
  if (count > 1 && index === count - 1 && index % SLICE_COLORS.length === 0) {
    return SLICE_COLORS[1];
  }
  return SLICE_COLORS[index % SLICE_COLORS.length];
}

function truncate(name: string, max: number) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export default function LotteryWheel() {
  const [input, setInput] = useState(DEFAULT_NAMES);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [removeWinner, setRemoveWinner] = useState(true);

  const names = input
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
  const count = names.length;
  const segment = count > 0 ? 360 / count : 360;
  const showCoins = count <= COIN_LIMIT;
  const coinRadius = Math.min(28, ((2 * Math.PI * 105) / Math.max(count, 1)) * 0.3);
  const labelSize = showCoins
    ? Math.max(13, Math.min(20, 160 / Math.max(count, 1)))
    : Math.max(10, Math.min(16, 260 / count));
  const canSpin = !spinning && count >= 2;

  function spin() {
    if (!canSpin) return;

    const index = Math.floor(Math.random() * count);
    const center = index * segment + segment / 2;
    // 在該格內加一點隨機偏移，看起來更自然
    const jitter = (Math.random() - 0.5) * segment * 0.7;
    const current = ((rotation % 360) + 360) % 360;
    const delta = (((360 - center - jitter - current) % 360) + 360) % 360;

    setTargetIndex(index);
    setWinner(null);
    setSpinning(true);
    setRotation(rotation + 360 * 6 + delta);
  }

  function handleSpinEnd() {
    if (!spinning || targetIndex === null) return;
    const name = names[targetIndex];
    setSpinning(false);
    setWinner(name);
    setHistory((prev) => [name, ...prev]);
  }

  function closeResult() {
    if (winner && removeWinner && targetIndex !== null) {
      const next = [...names];
      next.splice(targetIndex, 1);
      setInput(next.join("\n"));
    }
    setWinner(null);
    setTargetIndex(null);
  }

  const card = "border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414]";

  return (
    <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 xl:grid-cols-[1fr_minmax(0,440px)_1fr]">
      {/* 抽取項目輸入 */}
      <section className={`${card} flex flex-col gap-4 p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">抽取項目</h2>
          <span className="border-2 border-[#141414] bg-[#a9c8f0] px-2 py-0.5 text-sm font-black">
            {count} 項
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={spinning}
          rows={11}
          placeholder={"一行一個項目\n例如：\n小明\n珍珠奶茶"}
          className="resize-none border-2 border-dashed border-[#141414] bg-[#f3efe6] p-3 font-bold outline-none focus:border-solid focus:bg-white disabled:opacity-60"
        />
        <label className="flex cursor-pointer items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={removeWinner}
            onChange={(e) => setRemoveWinner(e.target.checked)}
            className="size-4 accent-[#e0643c]"
          />
          抽中後從項目移除
        </label>
        <button
          type="button"
          onClick={() => setInput("")}
          disabled={spinning}
          className="self-start border-2 border-[#141414] bg-white px-3 py-1 text-sm font-black transition hover:bg-[#eab0cb] disabled:opacity-50"
        >
          清空項目
        </button>
      </section>

      {/* 轉盤：手機與平板放最上面，寬螢幕放中間 */}
      <section className="order-first flex flex-col items-center gap-5 md:col-span-2 xl:order-none xl:col-span-1">
        <div className="relative aspect-square w-full max-w-[440px]">
          {/* 硬陰影 */}
          <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-full bg-[#141414]" />

          {/* 外框與燈泡（不旋轉） */}
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full">
            <circle cx={CENTER} cy={CENTER} r={RIM_RADIUS} fill="#5a3415" stroke={INK} strokeWidth={4} />
            <circle cx={CENTER} cy={CENTER} r={RADIUS + 5} fill="none" stroke="#f7d35c" strokeWidth={6} />
            {Array.from({ length: BULB_COUNT }, (_, i) => {
              const [x, y] = pointAt((360 / BULB_COUNT) * i, (RIM_RADIUS + RADIUS + 8) / 2);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4.5}
                  fill="#fff4c2"
                  className={spinning ? "animate-pulse" : undefined}
                  style={spinning ? { animationDelay: i % 2 ? "0.5s" : "0s", animationDuration: "1s" } : undefined}
                />
              );
            })}
          </svg>

          {/* 轉盤本體 */}
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="absolute inset-0 size-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_SECONDS}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                : "none",
            }}
            onTransitionEnd={handleSpinEnd}
          >
            {count <= 1 ? (
              <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={count === 1 ? SLICE_COLORS[0] : "#e8e2d4"} />
            ) : (
              names.map((_, i) => (
                <path
                  key={i}
                  d={wedgePath(i * segment, (i + 1) * segment)}
                  fill={colorFor(i, count)}
                  stroke={INK}
                  strokeWidth={2}
                />
              ))
            )}

            {names.map((name, i) => {
              const mid = i * segment + segment / 2;
              if (!showCoins) {
                return (
                  <text
                    key={i}
                    x={CENTER + 112}
                    y={CENTER}
                    transform={`rotate(${mid - 90} ${CENTER} ${CENTER})`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={INK}
                    fontSize={labelSize}
                    fontWeight={900}
                  >
                    {truncate(name, 7)}
                  </text>
                );
              }
              return (
                <g key={i} transform={`rotate(${mid} ${CENTER} ${CENTER})`}>
                  {/* 項目名稱沿著外圈 */}
                  <text
                    x={CENTER}
                    y={CENTER - RADIUS + 24}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={INK}
                    fontSize={labelSize}
                    fontWeight={900}
                  >
                    {truncate(name, 6)}
                  </text>
                  {/* 金幣 */}
                  <circle cx={CENTER + 2} cy={CENTER - 103} r={coinRadius} fill="#c98a12" />
                  <circle cx={CENTER} cy={CENTER - 105} r={coinRadius} fill="#f9cf3f" stroke={INK} strokeWidth={2} />
                  <circle
                    cx={CENTER}
                    cy={CENTER - 105}
                    r={coinRadius * 0.74}
                    fill="none"
                    stroke="#d9a521"
                    strokeWidth={2.5}
                  />
                </g>
              );
            })}
          </svg>

          {/* 指針 */}
          <svg
            viewBox="0 0 40 52"
            className="absolute left-1/2 top-0 z-10 w-[12%] -translate-x-1/2 -translate-y-[35%] drop-shadow-[3px_3px_0_#141414]"
          >
            <path d="M8 2 H32 V24 H39 L20 50 L1 24 H8 Z" fill="#e0643c" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <circle cx={20} cy={11} r={3} fill="#fff4c2" />
          </svg>

          {/* 中央按鈕 */}
          <button
            type="button"
            onClick={spin}
            disabled={!canSpin}
            className="absolute left-1/2 top-1/2 z-10 flex aspect-square w-[27%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-[#141414] bg-[#e0643c] leading-tight text-white shadow-[4px_4px_0_#141414] transition hover:bg-[#ea7752] active:translate-x-[calc(-50%+3px)] active:translate-y-[calc(-50%+3px)] active:shadow-[1px_1px_0_#141414] disabled:cursor-not-allowed disabled:bg-[#b9a99a]"
          >
            <span className="text-[clamp(1rem,4.5vw,1.6rem)] font-black">
              {spinning ? "抽獎中" : "開始"}
            </span>
            <span className="text-[clamp(0.75rem,3vw,1rem)] font-black">
              {spinning ? "…" : "抽獎 »"}
            </span>
          </button>
        </div>

        {count < 2 && !spinning && (
          <p className="border-2 border-[#141414] bg-[#f0c54b] px-3 py-1 font-bold">
            至少需要 2 個項目才能抽獎
          </p>
        )}
      </section>

      {/* 右側：中獎紀錄與擲硬幣 */}
      <div className="flex flex-col gap-10">
        {/* 中獎紀錄 */}
        <section className={`${card} flex flex-col gap-4 p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">中獎紀錄</h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="border-2 border-[#141414] bg-white px-2 py-0.5 text-sm font-black hover:bg-[#eab0cb]"
              >
                清除
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="flex h-32 items-center justify-center border-2 border-dashed border-[#141414] bg-[#f3efe6] font-bold text-[#777]">
              還沒有人中獎
            </div>
          ) : (
            <ol className="flex flex-col gap-2">
              {history.map((name, i) => (
                <li
                  key={history.length - i}
                  className="flex items-center gap-3 border-2 border-[#141414] bg-white px-3 py-2"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center border-2 border-[#141414] bg-[#f0c54b] text-sm font-black">
                    {history.length - i}
                  </span>
                  <span className="truncate font-black">{name}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <CoinFlip />
      </div>

      {/* 中獎結果 */}
      {winner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/60 p-4"
          onClick={closeResult}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm border-[3px] border-[#141414] bg-[#fffdf8] p-8 text-center shadow-[10px_10px_0_#141414]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-block border-2 border-[#141414] bg-[#141414] px-3 py-1 text-sm font-black tracking-widest text-[#f0c54b]">
              恭喜中獎
            </span>
            <p className="my-6 break-words text-5xl font-black">
              <span className="bg-[#f0c54b] px-2">{winner}</span>
            </p>
            <button
              type="button"
              onClick={closeResult}
              autoFocus
              className="border-[3px] border-[#141414] bg-[#e0643c] px-8 py-2 font-black text-white shadow-[4px_4px_0_#141414] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              {removeWinner ? "確定並移除" : "確定"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
