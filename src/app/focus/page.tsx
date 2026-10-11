import type { Metadata } from "next";
import ToolShell from "@/app/ui/tool-shell";
import FocusTimer from "./focus-timer";

export const metadata: Metadata = {
  title: "專注計時 | Magic Tools",
  description: "番茄鐘與任務倒數，幫你在工作時保持專注",
};

export default function FocusPage() {
  return (
    <ToolShell
      active="/focus"
      kicker="MAGIC TOOLS・專注小工具"
      title="專注"
      highlight="計時"
      description="用番茄鐘切分工作與休息，再用任務倒數盯緊每個截止日期。"
      tagline="專注・休息・再專注"
      accent="#a9c8f0"
    >
      <FocusTimer />
    </ToolShell>
  );
}
