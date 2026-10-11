import type { Metadata } from "next";
import ToolShell from "@/app/ui/tool-shell";
import OmikujiDraw from "./omikuji-draw";

export const metadata: Metadata = {
  title: "觀音靈籤 | Magic Tools",
  description: "淺草觀音寺一百籤線上抽籤，附籤詩白話解說",
};

export default function OmikujiPage() {
  return (
    <ToolShell
      active="/omikuji"
      kicker="MAGIC TOOLS・淺草觀音寺一百籤"
      title="觀音"
      highlight="靈籤"
      description="心中默念想問的事，搖一搖籤筒，抽出屬於你的一支籤，看看觀音給你的提示。"
      tagline="靜心・默念・搖籤"
      accent="#eab0cb"
    >
      <OmikujiDraw />
    </ToolShell>
  );
}
