// 與整體視覺一致的圖示：粗黑描邊、平塗色塊
const INK = "#141414";

type IconProps = { className?: string };

function Svg({ className = "size-6", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={INK}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6z" fill="#f0c54b" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" />
      <rect x="4" y="10.5" width="16" height="11" fill="#e0643c" />
      <path d="M12 14.5v3" stroke="#fff" strokeWidth={2.5} />
    </Svg>
  );
}

export function DevicesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="4" width="15" height="11" fill="#a9c8f0" />
      <path d="M6 19h7M9.5 15v4" />
      <rect x="15" y="9" width="7" height="12" fill="#fffdf8" />
      <path d="M17.5 18.5h2" />
    </Svg>
  );
}

export function TomatoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="13.5" r="8" fill="#e0643c" />
      <path d="M12 5.5 9 3.5M12 5.5l3-2M12 5.5 8.5 7.5M12 5.5l3.5 2M12 5.5V2" stroke={INK} />
      <path d="M8.5 7.5 12 5.5l3.5 2-3.5 1.5z" fill="#8fd0a8" />
    </Svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.5" y="4" width="15" height="18" fill="#fffdf8" />
      <rect x="8.5" y="2" width="7" height="4" fill="#f0c54b" />
      <path d="M8 11h8M8 14.5h8M8 18h5" />
    </Svg>
  );
}

export function ToriiIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <g strokeWidth={1.25} fill="#c9442e">
        <path d="M1.5 3c4.5 1.6 16.5 1.6 21 0v3.5h-21z" />
        <rect x="3.5" y="9.5" width="17" height="2.5" />
        <rect x="10.75" y="6.5" width="2.5" height="3" />
        <rect x="5" y="6.5" width="3.5" height="15.5" />
        <rect x="15.5" y="6.5" width="3.5" height="15.5" />
      </g>
    </Svg>
  );
}

export function IncenseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 4.5c-1.2 1 1.2 2-.2 3.2M12 3c-1.2 1 1.2 2-.2 3.2M15 4.5c-1.2 1 1.2 2-.2 3.2" strokeWidth={1.5} />
      <path d="M9 9v6M12 8v7M15 9v6" />
      <path d="M4 15h16l-2 6.5H6z" fill="#9a6a3a" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth={3} />
    </Svg>
  );
}

export function CrossIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" strokeWidth={2.5} />
    </Svg>
  );
}
