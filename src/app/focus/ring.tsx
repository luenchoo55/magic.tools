const INK = "#141414";
const SIZE = 400;
const CENTER = SIZE / 2;
const RING_RADIUS = 170;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type RingProps = {
  /** 剩餘比例，1 為滿圈、0 為空 */
  progress: number;
  color: string;
  animate?: boolean;
  children: React.ReactNode;
};

export default function Ring({ progress, color, animate = false, children }: RingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <div className="relative aspect-square w-full max-w-[380px]">
      <div className="absolute inset-[3%] translate-x-2.5 translate-y-2.5 rounded-full bg-[#141414]" />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full">
        <circle cx={CENTER} cy={CENTER} r={188} fill="#fffdf8" stroke={INK} strokeWidth={4} />
        <circle cx={CENTER} cy={CENTER} r={RING_RADIUS} fill="none" stroke="#ece6d8" strokeWidth={26} />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={26}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          style={{ transition: animate ? "stroke-dashoffset 0.2s linear" : "none" }}
        />
        <circle cx={CENTER} cy={CENTER} r={RING_RADIUS + 13} fill="none" stroke={INK} strokeWidth={3} />
        <circle cx={CENTER} cy={CENTER} r={RING_RADIUS - 13} fill="none" stroke={INK} strokeWidth={3} />
        {/* 刻度 */}
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER - RING_RADIUS + 20}
              x2={CENTER}
              y2={CENTER - RING_RADIUS + (major ? 34 : 26)}
              stroke={INK}
              strokeWidth={major ? 3 : 1.5}
              transform={`rotate(${i * 6} ${CENTER} ${CENTER})`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-[18%] flex flex-col items-center justify-center gap-2 text-center">
        {children}
      </div>
    </div>
  );
}
