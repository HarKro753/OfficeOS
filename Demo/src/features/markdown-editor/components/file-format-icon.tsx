import { FileImage, FileSpreadsheet, FileText } from "lucide-react";
import type { WorkspaceItem } from "../types";

type FileFormat = "csv" | "md" | "png";

type FileFormatIconProps = {
  item: WorkspaceItem;
  size?: "sm" | "lg";
};

function fileFormat(item: WorkspaceItem): FileFormat {
  if (item.type === "document") return "md";
  if (item.label.toLowerCase().endsWith(".csv")) return "csv";
  return "png";
}

const formatStyles: Record<FileFormat, string> = {
  csv: "text-[#107A48]",
  md: "text-[#2457FF]",
  png: "text-[#8A5800]",
};

const formatIcons = {
  csv: FileSpreadsheet,
  md: FileText,
  png: FileImage,
};

export function FileFormatIcon({ item, size = "sm" }: FileFormatIconProps) {
  const format = fileFormat(item);
  const Icon = formatIcons[format];
  const dimensions = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <Icon
      aria-hidden="true"
      className={`shrink-0 ${dimensions} ${formatStyles[format]}`}
      strokeWidth={2.3}
    />
  );
}
