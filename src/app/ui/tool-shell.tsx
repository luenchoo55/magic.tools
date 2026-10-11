import { notoSansTC, SiteFooter, SiteHeader, type ToolHref } from "./site-chrome";

type ToolShellProps = {
  active: ToolHref;
  kicker: string;
  title: string;
  highlight: string;
  description: string;
  tagline: string;
  accent?: string;
  children: React.ReactNode;
};

export default function ToolShell({
  active,
  kicker,
  title,
  highlight,
  description,
  tagline,
  accent = "#e0643c",
  children,
}: ToolShellProps) {
  return (
    <div className={`${notoSansTC.className} flex-1 bg-[#f3efe6] text-[#141414]`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SiteHeader active={active} />

        {/* 標題區 */}
        <section className="relative py-10">
          <p className="mb-3 font-bold tracking-wider">{kicker}</p>
          <h1 className="text-6xl font-black leading-none sm:text-7xl">
            {title}
            <span className="bg-[#f0c54b] px-1">{highlight}</span>
          </h1>
          <p className="mt-4 text-lg text-[#555]">{description}</p>
          <div className="mt-6 flex items-center gap-4">
            <span
              aria-hidden
              className="h-8 w-16 shrink-0 border-2 border-[#141414]"
              style={{
                backgroundImage: "repeating-conic-gradient(#141414 0 25%, #fff 0 50%)",
                backgroundSize: "10px 10px",
              }}
            />
            <span className="border-[3px] border-[#141414] bg-[#f0c54b] px-4 py-1.5 font-black tracking-widest">
              {tagline}
            </span>
          </div>

          {/* 裝飾 */}
          <div aria-hidden className="absolute right-0 top-10 hidden items-start gap-10 md:flex">
            <div
              className="size-32"
              style={{
                backgroundImage: "radial-gradient(#141414 2.5px, transparent 3px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="size-32 border-[3px] border-[#141414]" style={{ backgroundColor: accent }} />
          </div>
        </section>

        {children}

        <SiteFooter />
      </div>
    </div>
  );
}
