import Link from "next/link";
import { BoltIcon, DevicesIcon, LockIcon } from "@/app/ui/icons";
import { notoSansTC, SiteFooter, SiteHeader } from "@/app/ui/site-chrome";

const INK = "#141414";

const TOOL_CARDS = [
  {
    no: "01",
    href: "/lottery",
    title: "抽獎轉盤",
    color: "#f0c54b",
    summary: "輸入項目、轉動轉盤抽出結果，還能擲硬幣幫你二選一。",
    features: ["一行一個項目，隨時增減", "抽中後自動移除，保留抽取紀錄", "擲硬幣看正反面，偶爾還會立起來"],
    cta: "開始抽獎",
    art: <WheelArt />,
  },
  {
    no: "02",
    href: "/focus",
    title: "專注計時",
    color: "#a9c8f0",
    summary: "番茄鐘和任務倒數，陪你把事情一件件做完。",
    features: ["番茄鐘自動切換專注與休息", "時間到響鈴提醒，分頁標題顯示剩餘時間", "任務倒數盯緊每個截止日"],
    cta: "開始專注",
    art: <TimerArt />,
  },
  {
    no: "03",
    href: "/omikuji",
    title: "觀音靈籤",
    color: "#eab0cb",
    summary: "淺草觀音寺一百籤，搖一搖籤筒，看看觀音給你的提示。",
    features: ["完整一百支籤詩原文", "附白話解說與七項運勢", "可直接查詢任一籤號"],
    cta: "搖籤去",
    art: <OmikujiArt />,
  },
] as const;

const PERKS = [
  { icon: <BoltIcon className="size-8" />, color: "#f0c54b", title: "免安裝、免登入", body: "打開網頁就能用，不用註冊帳號，也不會跳出廣告。" },
  { icon: <LockIcon className="size-8" />, color: "#eab0cb", title: "資料留在你身邊", body: "設定與紀錄只存在你自己的瀏覽器裡，不會上傳到任何地方。" },
  { icon: <DevicesIcon className="size-8" />, color: "#a9c8f0", title: "手機電腦都順手", body: "版面會依螢幕大小調整，在聚會、辦公室或通勤時都能用。" },
];

export default function Home() {
  return (
    <div className={`${notoSansTC.className} flex-1 bg-[#f3efe6] text-[#141414]`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SiteHeader />

        {/* 主視覺 */}
        <section className="grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            <p className="mb-4 font-bold tracking-wider">MAGIC TOOLS・三合一生活小工具</p>
            <h1 className="text-5xl font-black leading-tight sm:text-7xl">
              生活裡的
              <br />
              <span className="mt-1 inline-block bg-[#f0c54b] px-1 leading-none">小魔法</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg font-bold leading-relaxed text-[#555]">
              聚會要抽獎、工作要專注、心裡有疑問想求個籤——三個用得到的小工具，打開瀏覽器就能用。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#tools"
                className="border-[3px] border-[#141414] bg-[#e0643c] px-7 py-3 text-lg font-black text-white shadow-[5px_5px_0_#141414] transition hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                看看有哪些工具 ↓
              </a>
              <span className="flex items-center gap-3 font-black">
                <span
                  aria-hidden
                  className="h-8 w-16 shrink-0 border-2 border-[#141414]"
                  style={{
                    backgroundImage: "repeating-conic-gradient(#141414 0 25%, #fff 0 50%)",
                    backgroundSize: "10px 10px",
                  }}
                />
                免費・免登入
              </span>
            </div>
          </div>

          {/* 拼貼插圖 */}
          <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div
              className="absolute left-0 top-0 size-40"
              style={{
                backgroundImage: "radial-gradient(#141414 2.5px, transparent 3px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute right-2 top-4 size-28 border-[3px] border-[#141414] bg-[#e0643c]" />
            <div className="absolute left-[8%] top-[14%] w-[58%] rotate-[-6deg] border-[3px] border-[#141414] bg-[#fffdf8] p-3 shadow-[8px_8px_0_#141414]">
              <WheelArt />
            </div>
            <div className="absolute bottom-[6%] right-[4%] w-[44%] rotate-[5deg] border-[3px] border-[#141414] bg-[#fffdf8] p-3 shadow-[8px_8px_0_#141414]">
              <TimerArt />
            </div>
            <div className="absolute bottom-[2%] left-[14%] w-[26%] rotate-[-3deg] border-[3px] border-[#141414] bg-[#eab0cb] p-2 shadow-[6px_6px_0_#141414]">
              <OmikujiArt />
            </div>
          </div>
        </section>

        {/* 跑馬燈色帶 */}
        <div className="-mx-4 overflow-hidden border-y-[3px] border-[#141414] bg-[#141414] py-3 sm:-mx-6">
          <p className="whitespace-nowrap text-center text-lg font-black tracking-[0.3em] text-[#f0c54b]">
            抽獎 ✦ 專注 ✦ 求籤 ✦ 免安裝 ✦ 免登入 ✦ 抽獎 ✦ 專注 ✦ 求籤
          </p>
        </div>

        {/* 工具介紹 */}
        <section id="tools" className="scroll-mt-6 py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-black sm:text-5xl">
              三個<span className="bg-[#f0c54b] px-1">工具</span>
            </h2>
            <p className="font-bold text-[#666]">點任一張卡片，直接開始使用</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {TOOL_CARDS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414] transition hover:-translate-y-1 hover:shadow-[12px_12px_0_#141414]"
              >
                <div
                  className="relative flex items-center justify-center border-b-[3px] border-[#141414] p-8"
                  style={{ backgroundColor: tool.color }}
                >
                  <span className="absolute left-3 top-3 border-2 border-[#141414] bg-[#fffdf8] px-2 text-sm font-black">
                    {tool.no}
                  </span>
                  <div className="w-36">{tool.art}</div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <h3 className="text-2xl font-black">{tool.title}</h3>
                  <p className="font-bold leading-relaxed text-[#555]">{tool.summary}</p>
                  <ul className="flex flex-col gap-2">
                    {tool.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm font-bold">
                        <span
                          className="mt-1 size-3 shrink-0 border-2 border-[#141414]"
                          style={{ backgroundColor: tool.color }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto flex items-center justify-between border-[3px] border-[#141414] bg-[#141414] px-4 py-2 font-black text-[#f0c54b] transition group-hover:bg-[#e0643c] group-hover:text-white">
                    {tool.cta}
                    <span className="transition group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 特色 */}
        <section className="border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414]">
          <h2 className="border-b-[3px] border-[#141414] px-6 py-4 text-2xl font-black">為什麼用魔法工具箱？</h2>
          <div className="grid md:grid-cols-3">
            {PERKS.map((perk, i) => (
              <div
                key={perk.title}
                className={`flex flex-col gap-3 p-6 ${
                  i < PERKS.length - 1 ? "border-b-[3px] border-[#141414] md:border-b-0 md:border-r-[3px]" : ""
                }`}
              >
                <span
                  className="flex size-14 items-center justify-center border-[3px] border-[#141414] shadow-[4px_4px_0_#141414]"
                  style={{ backgroundColor: perk.color }}
                >
                  {perk.icon}
                </span>
                <h3 className="text-xl font-black">{perk.title}</h3>
                <p className="font-bold leading-relaxed text-[#555]">{perk.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 行動呼籲 */}
        <section className="mt-16 flex flex-col items-center gap-6 border-[3px] border-[#141414] bg-[#f0c54b] px-6 py-12 text-center shadow-[8px_8px_0_#141414]">
          <h2 className="text-3xl font-black sm:text-4xl">今天想用哪一個魔法？</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {TOOL_CARDS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="border-[3px] border-[#141414] bg-[#fffdf8] px-5 py-2 font-black shadow-[4px_4px_0_#141414] transition hover:bg-[#141414] hover:text-[#f0c54b] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                {tool.title} →
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}

/* ---------- 插圖 ---------- */

function WheelArt() {
  const colors = ["#f7d35c", "#f0a03c", "#fff8e8", "#f7d35c", "#f0a03c", "#fff8e8"];
  const wedge = (i: number) => {
    const a1 = ((i * 60 - 90) * Math.PI) / 180;
    const a2 = (((i + 1) * 60 - 90) * Math.PI) / 180;
    return `M50 50 L${50 + 40 * Math.cos(a1)} ${50 + 40 * Math.sin(a1)} A40 40 0 0 1 ${50 + 40 * Math.cos(a2)} ${50 + 40 * Math.sin(a2)} Z`;
  };
  return (
    <svg viewBox="0 0 100 100" className="w-full">
      <circle cx="50" cy="52" r="47" fill={INK} />
      <circle cx="50" cy="50" r="47" fill="#5a3415" stroke={INK} strokeWidth="2" />
      {colors.map((c, i) => (
        <path key={i} d={wedge(i)} fill={c} stroke={INK} strokeWidth="1.5" />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <circle key={i} cx={50 + 43.5 * Math.cos(a)} cy={50 + 43.5 * Math.sin(a)} r="1.6" fill="#fff4c2" />;
      })}
      <circle cx="50" cy="50" r="11" fill="#e0643c" stroke={INK} strokeWidth="2.5" />
      <path d="M44 0 H56 V8 L50 16 L44 8 Z" fill="#e0643c" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function TimerArt() {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="w-full">
      <circle cx="50" cy="50" r="47" fill="#fffdf8" stroke={INK} strokeWidth="2.5" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ece6d8" strokeWidth="8" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#e0643c"
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={c * 0.35}
        transform="rotate(-90 50 50)"
      />
      <circle cx="50" cy="50" r={r + 4.5} fill="none" stroke={INK} strokeWidth="1.5" />
      <circle cx="50" cy="50" r={r - 4.5} fill="none" stroke={INK} strokeWidth="1.5" />
      <text x="50" y="57" textAnchor="middle" fontSize="20" fontWeight="900" fill={INK}>
        25:00
      </text>
    </svg>
  );
}

function OmikujiArt() {
  return (
    <svg viewBox="0 0 80 120" className="w-full">
      <rect x="31" y="0" width="14" height="30" fill="#f5e6c4" stroke={INK} strokeWidth="2.5" />
      <rect x="10" y="20" width="60" height="96" fill="#c9442e" stroke={INK} strokeWidth="3" />
      <rect x="10" y="20" width="60" height="10" fill={INK} />
      <rect x="25" y="40" width="30" height="58" fill="#fffdf8" stroke={INK} strokeWidth="2.5" />
      <text x="40" y="64" textAnchor="middle" fontSize="16" fontWeight="900" fill={INK}>
        御
      </text>
      <text x="40" y="88" textAnchor="middle" fontSize="16" fontWeight="900" fill={INK}>
        籤
      </text>
      <rect x="10" y="106" width="60" height="10" fill={INK} />
    </svg>
  );
}
