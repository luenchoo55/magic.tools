import type { Metadata } from "next";
import ToolShell from "@/app/ui/tool-shell";
import LotteryWheel from "./lottery-wheel";

export const metadata: Metadata = {
  title: "幸運轉盤 | Magic Tools",
  description: "輸入抽取項目，轉動轉盤抽出結果",
};

export default function LotteryPage() {
  return (
    <ToolShell
      active="/lottery"
      kicker="MAGIC TOOLS・抽獎小工具"
      title="幸運"
      highlight="轉盤"
      description="在左邊輸入抽取項目，按下轉盤中間的「開始」，看看會抽到什麼。"
      tagline="輸入項目・轉動轉盤・揭曉結果"
    >
      <LotteryWheel />
    </ToolShell>
  );
}
