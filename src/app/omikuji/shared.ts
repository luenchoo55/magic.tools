import type { Grade } from "./data";

export const GRADE_STYLE: Record<Grade, { bg: string; fg: string }> = {
  大吉: { bg: "#e0643c", fg: "#fff" },
  吉: { bg: "#f0c54b", fg: "#141414" },
  半吉: { bg: "#8fd0a8", fg: "#141414" },
  小吉: { bg: "#a9c8f0", fg: "#141414" },
  末小吉: { bg: "#c9b8e8", fg: "#141414" },
  末吉: { bg: "#eab0cb", fg: "#141414" },
  凶: { bg: "#3a3a3a", fg: "#fff" },
};

const DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function toKanji(n: number) {
  if (n === 100) return "百";
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${tens > 1 ? DIGITS[tens] : ""}${tens > 0 ? "十" : ""}${DIGITS[ones]}`;
}

/** 籤架上的一支籤 */
export type RackEntry = {
  id: string;
  no: number;
  wish: string;
  /** 是否已綁在籤架上（凶籤留下厄運） */
  tied: boolean;
};
