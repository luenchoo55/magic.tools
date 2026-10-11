"use client";

import { useState } from "react";

type Face = "正" | "反" | "立";

const FLIP_MS = 1400;
const RECENT_LIMIT = 10;
// 硬幣立起來的機率：1/12
const EDGE_CHANCE = 12;
// 停下時的角度：正面朝上 0°、反面朝上 180°、立起來 90°
const FACE_ANGLE: Record<Face, number> = { 正: 0, 反: 180, 立: 90 };
const FACE_COLOR: Record<Face, string> = {
  正: "#f9cf3f",
  反: "#fffdf8",
  立: "#eab0cb",
};

const card =
  "border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414]";

function randomFace(): Face {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  if (buf[0] % EDGE_CHANCE === 0) return "立";
  return Math.floor(buf[0] / EDGE_CHANCE) % 2 === 0 ? "正" : "反";
}

function CoinFace({
  face,
  back = false,
}: {
  face: "正" | "反";
  back?: boolean;
}) {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center rounded-full border-[3px] border-[#141414]"
      style={{
        backfaceVisibility: "hidden",
        transform: back ? "rotateX(180deg)" : undefined,
        background: face === "正" ? "#f9cf3f" : "#e8b53a",
      }}
    >
      <span className="flex size-[76%] items-center justify-center rounded-full border-[3px] border-dashed border-[#a8740f] text-4xl font-black text-[#5a3415]">
        {face}
      </span>
    </span>
  );
}

// 硬幣的側邊（有刻紋），立起來時看到的就是這一面
function CoinRim() {
  return (
    <span
      className="absolute inset-x-0 top-1/2 -mt-[7px] h-[14px] rounded-sm border-[3px] border-[#141414]"
      style={{
        transform: "rotateX(90deg)",
        backgroundColor: "#c9971f",
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0 5px, #a8740f 5px 7px)",
      }}
    />
  );
}

export default function CoinFlip() {
  const [rotation, setRotation] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<Face | null>(null);
  const [pending, setPending] = useState<Face | null>(null);
  const [recent, setRecent] = useState<Face[]>([]);
  const [question, setQuestion] = useState("");

  const count = (face: Face) => recent.filter((f) => f === face).length;

  function flip() {
    if (flipping) return;
    const face = randomFace();
    // 轉 5 圈以上，最後停在對應的角度
    const base = rotation - (rotation % 360) + 360 * 5;
    setPending(face);
    setResult(null);
    setFlipping(true);
    setRotation(base + FACE_ANGLE[face]);
  }

  function handleEnd() {
    if (!flipping || !pending) return;
    setFlipping(false);
    setResult(pending);
    setRecent((prev) => [pending, ...prev].slice(0, RECENT_LIMIT));
    setPending(null);
  }

  return (
    <section className={`${card} flex flex-col items-center gap-5 p-5`}>
      <div className="flex w-full items-center justify-between">
        <h2 className="text-2xl font-black">擲硬幣</h2>
        <span className="text-sm font-bold text-[#666]">二選一就交給它</span>
      </div>

      {/* 硬幣 */}
      <div className="relative flex h-40 w-full items-end justify-center">
        <span
          aria-hidden
          className={`absolute bottom-0 h-3 rounded-[50%] bg-[#141414]/20 transition-all duration-700 ${
            flipping ? "w-12" : result === "立" ? "w-16" : "w-24"
          }`}
        />
        <div
          className={`mb-3 size-28 ${flipping ? "animate-toss motion-reduce:animate-none" : ""}`}
          style={{ perspective: 600 }}
        >
          {/* 立起來時把硬幣轉成直立，站在地上 */}
          <div
            className="size-full transition-transform duration-300"
            style={{
              transform:
                result === "立" ? "rotate(90deg)" : undefined,
            }}
          >
            <div
              className="relative size-full"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${rotation}deg)`,
                transition: flipping
                  ? `transform ${FLIP_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1)`
                  : "none",
              }}
              onTransitionEnd={handleEnd}
            >
              <CoinFace face="正" />
              <CoinFace face="反" back />
              <CoinRim />
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex min-h-8 flex-col items-center gap-1 text-center"
        aria-live="polite"
      >
        {flipping ? (
          <p className="text-2xl font-black">翻轉中…</p>
        ) : result ? (
          <>
            {question.trim() && (
              <p className="font-bold text-[#555]">「{question.trim()}」</p>
            )}
            {result === "立" ? (
              <>
                <p className="text-2xl font-black">
                  <span className="bg-[#eab0cb] px-1.5">立起來了！</span>
                </p>
                <p className="font-bold text-[#555]">
                  這個問題老天也不知道，交給你決定。
                </p>
              </>
            ) : (
              <p className="text-2xl font-black">
                <span className="bg-[#f0c54b] px-1.5">{result}面</span>
              </p>
            )}
          </>
        ) : (
          <p className="font-bold text-[#777]">正面、反面，還是……立起來？</p>
        )}
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="想決定的事（可不填）"
        disabled={flipping}
        className="w-full border-2 border-dashed border-[#141414] bg-[#f3efe6] px-3 py-2 font-bold outline-none focus:border-solid focus:bg-white disabled:opacity-60"
      />

      <button
        type="button"
        onClick={flip}
        disabled={flipping}
        className="w-full border-[3px] border-[#141414] bg-[#f0c54b] py-3 text-xl font-black shadow-[4px_4px_0_#141414] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {flipping ? "擲出去了…" : "擲硬幣"}
      </button>

      {recent.length > 0 && (
        <div className="w-full">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>
              最近 {recent.length} 次：正 {count("正")}・反 {count("反")}
              {count("立") > 0 ? `・立 ${count("立")}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setRecent([])}
              disabled={flipping}
              className="border-2 border-[#141414] bg-white px-2 text-xs font-black hover:bg-[#eab0cb] disabled:opacity-50"
            >
              清除
            </button>
          </div>
          <ol
            className="flex flex-wrap gap-1.5"
            aria-label="最近的結果，最新的在最前面"
          >
            {recent.map((face, i) => (
              <li
                key={recent.length - i}
                className="flex size-7 items-center justify-center rounded-full border-2 border-[#141414] text-xs font-black"
                style={{ backgroundColor: FACE_COLOR[face] }}
              >
                {face}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
