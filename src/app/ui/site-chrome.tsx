import Link from "next/link";
import { Noto_Sans_TC } from "next/font/google";

export const notoSansTC = Noto_Sans_TC({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  preload: false,
});

export const TOOLS = [
  { href: "/lottery", label: "抽獎轉盤" },
  { href: "/focus", label: "專注計時" },
  { href: "/omikuji", label: "觀音靈籤" },
] as const;

export type ToolHref = (typeof TOOLS)[number]["href"];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="魔法工具箱首頁">
      <span className="size-8 border-[3px] border-[#141414] bg-[#f0c54b] shadow-[3px_3px_0_#141414]" />
      <span className="text-2xl font-black tracking-wide">魔法工具箱</span>
    </Link>
  );
}

export function SiteHeader({ active }: { active?: ToolHref }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#141414] py-4">
      <Logo />
      <nav className="flex border-[3px] border-[#141414]" aria-label="工具">
        {TOOLS.map((tool) => {
          const isActive = tool.href === active;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "bg-[#141414] px-3 py-1.5 font-black text-[#f0c54b] sm:px-4"
                  : "bg-white px-3 py-1.5 font-black transition hover:bg-[#f0c54b] sm:px-4"
              }
            >
              {tool.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-[3px] border-[#141414] py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm font-bold text-[#666]">
            抽獎、專注、求籤，一個工具箱搞定。免安裝、免登入，打開瀏覽器就能用。
          </p>
        </div>
        <nav className="flex flex-col gap-2 font-bold" aria-label="頁尾連結">
          <span className="text-sm font-black tracking-widest text-[#666]">工具</span>
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="underline-offset-4 hover:underline">
              {tool.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-8 border-t-2 border-dashed border-[#141414] pt-4 text-xs font-bold text-[#777]">
        © 2026 Magic Tools 魔法工具箱・資料只存在你的瀏覽器・觀音靈籤僅供娛樂參考
      </p>
    </footer>
  );
}
