import { OMIKUJI } from "./data";
import { GRADE_STYLE, toKanji, type RackEntry } from "./shared";

const INK = "#141414";
const ROW_HEIGHT = 96;

type OmikujiRackProps = {
  entries: RackEntry[];
  disabled: boolean;
  onSelect: (entry: RackEntry) => void;
  onTie: (entry: RackEntry) => void;
  onClear: () => void;
};

// 依 id 給每支籤一個固定的小角度，看起來像隨風擺動
function tiltOf(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (Math.abs(h) % 13) - 6;
}

export default function OmikujiRack({ entries, disabled, onSelect, onTie, onClear }: OmikujiRackProps) {
  const tiedCount = entries.filter((e) => e.tied).length;
  const rows = Math.max(2, Math.ceil(entries.length / 9));

  return (
    <section className="border-[3px] border-[#141414] bg-[#fffdf8] shadow-[8px_8px_0_#141414]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#141414] px-5 py-4">
        <div>
          <h2 className="text-2xl font-black">籤架</h2>
          <p className="text-sm font-bold text-[#666]">
            抽過 {entries.length} 支・已綁上 {tiedCount} 支凶籤
          </p>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="border-2 border-[#141414] bg-white px-2 py-0.5 text-sm font-black hover:bg-[#eab0cb] disabled:opacity-50"
          >
            清空籤架
          </button>
        )}
      </div>

      <div className="px-4 pb-6 pt-4 sm:px-8">
        {/* 屋頂 */}
        <div className="relative mx-2 h-6 border-[3px] border-[#141414] bg-[#3a3a3a]">
          <span className="absolute -left-3 -right-3 -top-3 h-3 border-[3px] border-[#141414] bg-[#c9442e]" />
        </div>

        <div className="relative mx-4 flex">
          {/* 左柱 */}
          <span className="w-4 shrink-0 border-x-[3px] border-b-[3px] border-[#141414] bg-[#9a6a3a]" />

          {/* 掛籤的繩子 */}
          <div
            className="relative min-w-0 flex-1"
            style={{
              minHeight: rows * ROW_HEIGHT,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 18px, ${INK} 18px 21px, transparent 21px ${ROW_HEIGHT}px)`,
            }}
          >
            {entries.length === 0 ? (
              <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center font-bold text-[#777]">
                籤架還是空的，抽一支籤吧
              </p>
            ) : (
              <ul className="flex flex-wrap justify-center gap-x-1 px-2 sm:gap-x-2">
                {entries.map((entry) => (
                  <RackSlip
                    key={entry.id}
                    entry={entry}
                    disabled={disabled}
                    onSelect={() => onSelect(entry)}
                    onTie={() => onTie(entry)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* 右柱 */}
          <span className="w-4 shrink-0 border-x-[3px] border-b-[3px] border-[#141414] bg-[#9a6a3a]" />
        </div>
        {/* 底座 */}
        <div className="mx-1 h-3 border-[3px] border-[#141414] bg-[#5a3415]" />

        <p className="mt-4 text-xs font-bold text-[#777]">
          點籤可以重新查看內容。在淺草寺，抽到凶籤的人會把籤綁在籤架上，把厄運留在寺裡。
        </p>
      </div>
    </section>
  );
}

function RackSlip({
  entry,
  disabled,
  onSelect,
  onTie,
}: {
  entry: RackEntry;
  disabled: boolean;
  onSelect: () => void;
  onTie: () => void;
}) {
  const omikuji = OMIKUJI[entry.no - 1];
  const style = GRADE_STYLE[omikuji.grade];
  const tilt = tiltOf(entry.id);
  const untiedBad = omikuji.grade === "凶" && !entry.tied;
  const label = `第${toKanji(entry.no)}番 ${omikuji.grade}${entry.tied ? "（已綁上籤架）" : ""}${entry.wish ? `，所問：${entry.wish}` : ""}`;

  return (
    <li className="relative flex w-10 justify-center" style={{ height: ROW_HEIGHT }}>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-label={label}
        title={label}
        className="group absolute top-[14px] flex origin-top flex-col items-center transition hover:-translate-y-0.5 disabled:cursor-not-allowed"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        {entry.tied ? (
          <>
            {/* 綁起來的結 */}
            <span className="relative z-10 h-3 w-8 border-2 border-[#141414] bg-white" />
            <span className="-mt-0.5 h-12 w-4 border-2 border-t-0 border-[#141414] bg-white" />
            <span className="mt-0.5 border border-[#141414] bg-[#c9442e] px-0.5 text-[10px] font-black leading-tight text-white">
              結
            </span>
          </>
        ) : (
          <>
            {/* 夾子 */}
            <span className="relative z-10 h-2.5 w-3 border-2 border-[#141414] bg-[#9a6a3a]" />
            <span className="-mt-0.5 flex w-7 flex-col items-center border-2 border-[#141414] bg-[#f5e6c4] pb-1 shadow-[2px_2px_0_#141414] group-hover:bg-white">
              <span
                className={`w-full border-b-2 border-[#141414] py-0.5 text-center font-black leading-none ${
                  omikuji.grade.length > 2 ? "text-[7px]" : "text-[10px]"
                }`}
                style={{ backgroundColor: style.bg, color: style.fg }}
              >
                {omikuji.grade}
              </span>
              <span className="mt-0.5 text-[10px] font-black leading-[1.15] [writing-mode:vertical-rl]">
                {toKanji(entry.no)}
              </span>
            </span>
          </>
        )}
      </button>

      {untiedBad && (
        <button
          type="button"
          onClick={onTie}
          disabled={disabled}
          className="absolute bottom-0 whitespace-nowrap border border-[#141414] bg-white px-1 text-[10px] font-black hover:bg-[#f0c54b] disabled:opacity-50"
        >
          綁上
        </button>
      )}
    </li>
  );
}
