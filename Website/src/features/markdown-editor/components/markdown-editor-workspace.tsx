"use client";

import Image from "next/image";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import { ArrowLeft, FileImage, FileSpreadsheet, FileText } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMarkdownWorkspace } from "../hooks/use-markdown-workspace";
import type {
  MockAsset,
  SourceDoc,
  WorkspaceItem,
  WorkspaceItemId,
} from "../types";

type MarkdownEditorWorkspaceProps = {
  actions?: ReactNode;
  assets: MockAsset[];
  backHref?: string;
  backLabel?: string;
  frame?: "embedded" | "page";
  initialDocs: SourceDoc[];
  onBack?: () => void;
  showChrome?: boolean;
  storageKey?: string;
};

export function MarkdownEditorWorkspace({
  actions,
  assets,
  backHref = "/chat",
  backLabel = "Back to chat",
  frame = "page",
  initialDocs,
  onBack,
  showChrome = true,
  storageKey,
}: MarkdownEditorWorkspaceProps) {
  const {
    activeDoc,
    activeItem,
    activeItemId,
    closeWorkspaceItem,
    currentContent,
    mockAssets,
    openItems,
    selectWorkspaceItem,
    workspaceItems,
  } = useMarkdownWorkspace(initialDocs, assets, storageKey);
  const selectedMockAsset =
    activeItem.type === "asset"
      ? mockAssets.find((asset) => asset.path === activeItem.path)
      : undefined;

  const workspace = (
    <section
      className={`flex flex-1 gap-3 overflow-hidden ${
        frame === "page"
          ? "min-h-dvh lg:min-h-[calc(100dvh-2rem)]"
          : "h-full min-h-0"
      }`}
    >
      {showChrome ? (
        <TemplateSidebar
          activeItemId={activeItemId}
          backHref={backHref}
          backLabel={backLabel}
          mode={frame === "embedded" ? "artifacts" : "full"}
          onBack={onBack}
          selectWorkspaceItem={selectWorkspaceItem}
          workspaceItems={workspaceItems}
        />
      ) : null}

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_18px_70px_rgba(16,20,24,0.08)]">
        {showChrome ? (
          <EditorHeader
            activeItemId={activeItemId}
            actions={actions}
            closeWorkspaceItem={closeWorkspaceItem}
            openItems={openItems}
            selectWorkspaceItem={selectWorkspaceItem}
          />
        ) : actions ? (
          <header className="flex min-h-[42px] items-center justify-end border-b border-[#D8DEE4] bg-[#F8FAFC] px-2">
            <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
          </header>
        ) : null}

        <section className="relative min-h-0 flex-1 overflow-auto bg-white">
          {activeItem.type === "document" ? (
            <div
              aria-label={`${activeDoc} markdown preview`}
              className="min-h-full bg-white"
            >
              <MarkdownPreview assets={mockAssets} markdown={currentContent} />
            </div>
          ) : selectedMockAsset?.kind === "image" ? (
            <div className="relative min-h-full w-full bg-[#F8FAFC]">
              <Image
                alt={selectedMockAsset.name}
                className="object-contain p-8"
                fill
                sizes="calc(100vw - 260px)"
                src={`/${selectedMockAsset.path}`}
              />
            </div>
          ) : selectedMockAsset?.name.endsWith(".csv") ? (
            <CsvPreview path={selectedMockAsset.path} />
          ) : (
            <div className="flex min-h-full items-center justify-center p-5">
              <div className="text-xs font-bold text-[#687482]">
                Preview unavailable.
              </div>
            </div>
          )}
        </section>
      </section>
    </section>
  );

  if (frame === "embedded") {
    return (
      <section className="flex h-full min-h-0 overflow-hidden bg-[#E9EDF2] text-[#101418]">
        {workspace}
      </section>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#E9EDF2] text-[#101418] lg:p-4">
      {workspace}
    </main>
  );
}

type FileFormat = "csv" | "md" | "png";

function fileFormat(item: WorkspaceItem): FileFormat {
  if (item.type === "document") return "md";
  if (item.label.toLowerCase().endsWith(".csv")) return "csv";
  return "png";
}

const formatStyles: Record<FileFormat, string> = {
  csv: "text-[#107A48]",
  md: "text-[#46515D]",
  png: "text-[#8A5800]",
};

const formatIcons = {
  csv: FileSpreadsheet,
  md: FileText,
  png: FileImage,
};

function FileFormatIcon({
  item,
  size = "sm",
}: {
  item: WorkspaceItem;
  size?: "sm" | "lg";
}) {
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

function TemplateSidebar({
  activeItemId,
  backHref,
  backLabel,
  mode = "full",
  onBack,
  selectWorkspaceItem,
  workspaceItems,
}: {
  activeItemId: WorkspaceItemId;
  backHref: string;
  backLabel: string;
  mode?: "artifacts" | "full";
  onBack?: () => void;
  selectWorkspaceItem: (itemId: WorkspaceItemId) => void;
  workspaceItems: WorkspaceItem[];
}) {
  const fullMode = mode === "full";

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-[#F8FAFC] shadow-[0_18px_70px_rgba(16,20,24,0.08)] lg:sticky lg:top-3 lg:max-h-[calc(100dvh-1.5rem)]">
      {fullMode ? (
        <header className="px-3 py-3">
          {onBack ? (
            <button
              className="mb-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-2 text-[11px] font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </button>
          ) : (
            <Link
              href={backHref}
              className="mb-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-2 text-[11px] font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Image
              alt="OfficeOS"
              className="h-9 w-9 shrink-0"
              height={36}
              src="/logo.svg"
              width={36}
            />
            <div className="min-w-0">
              <div className="text-lg font-black leading-none">OfficeOS</div>
              <div className="mono mt-1 text-[9px] font-black uppercase text-[#46515D]">
                Source package
              </div>
            </div>
          </div>
        </header>
      ) : (
        <header className="border-b border-[#D8DEE4] px-3 py-3">
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Source artifacts
          </div>
          <div className="mt-1 text-sm font-black leading-tight">
            Review package
          </div>
        </header>
      )}

      <div
        className={`min-h-0 flex-1 px-3 ${
          fullMode ? "mt-3 overflow-auto" : "py-3"
        }`}
      >
        {fullMode ? (
          <div className="mono px-1 pb-2 text-[11px] font-black uppercase text-[#101418]">
            Source artifacts
          </div>
        ) : null}
        <div className="space-y-1">
          {workspaceItems.map((item) => {
            const selected = activeItemId === item.id;

            return (
              <button
                key={item.id}
                className={`group flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1 ${
                  selected
                    ? "bg-[#E5EAF0] text-[#101418]"
                    : "text-[#46515D] hover:bg-white"
                }`}
                onClick={() => selectWorkspaceItem(item.id)}
                type="button"
              >
                <FileFormatIcon item={item} />
                <span className="mono truncate text-xs font-black">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function EditorHeader({
  actions,
  activeItemId,
  closeWorkspaceItem,
  openItems,
  selectWorkspaceItem,
}: {
  activeItemId: WorkspaceItemId;
  actions?: ReactNode;
  closeWorkspaceItem: (itemId: WorkspaceItemId) => void;
  openItems: WorkspaceItem[];
  selectWorkspaceItem: (itemId: WorkspaceItemId) => void;
}) {
  return (
    <header className="flex min-h-[42px] items-center justify-between border-b border-[#D8DEE4] bg-[#F8FAFC]">
      <div className="flex min-w-0 items-stretch self-stretch overflow-hidden">
        {openItems.map((item) => {
          const active = activeItemId === item.id;

          return (
            <div
              key={item.id}
              className={`group flex min-w-[132px] max-w-[204px] items-center border-r border-[#D8DEE4] transition ${
                active
                  ? "bg-white text-[#101418]"
                  : "bg-[#EEF2F5] text-[#46515D] hover:bg-white"
              }`}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-2 self-stretch px-3 text-left focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-inset"
                onClick={() => selectWorkspaceItem(item.id)}
                type="button"
              >
                <FileFormatIcon item={item} />
                <span className="mono min-w-0 flex-1 truncate text-xs font-black">
                  {item.label}
                </span>
              </button>
              <button
                aria-label={`Close ${item.label}`}
                className="mr-1 grid h-5 w-5 shrink-0 place-items-center rounded text-[#8A94A0] transition hover:bg-[#E5EAF0] hover:text-[#101418] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                onClick={() => closeWorkspaceItem(item.id)}
                type="button"
              >
                x
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 px-2">{actions}</div>
    </header>
  );
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === "\"" && quoted && nextCharacter === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (character === "\"") {
      quoted = !quoted;
      continue;
    }

    if (character === "," && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

function parseCsv(csv: string) {
  return csv
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map(parseCsvLine);
}

function CsvPreview({ path }: { path: string }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`/${path}`)
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch(() => {
        if (!cancelled) setContent("");
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  const rows = useMemo(() => parseCsv(content), [content]);
  const [headers = [], ...bodyRows] = rows;

  if (!rows.length) {
    return (
      <div className="flex min-h-full items-center justify-center text-xs font-bold text-[#687482]">
        CSV preview unavailable.
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-auto bg-white">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-[#EEF2F5]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-r border-[#D8DEE4] px-4 py-3 font-black text-[#101418] last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={`${path}-${rowIndex}`} className="odd:bg-[#F8FAFC]">
              {headers.map((header, cellIndex) => (
                <td
                  key={`${header}-${rowIndex}`}
                  className="border-b border-r border-[#D8DEE4] px-4 py-3 font-bold text-[#46515D] last:border-r-0"
                >
                  {row[cellIndex] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type FrontmatterField = {
  key: string;
  values: string[];
};

type FrontmatterGroup = {
  title: string;
  fields: FrontmatterField[];
};

type MarkdownSection = {
  content: string;
  title: string;
};

function stripQuery(path: string) {
  return path.split(/[?#]/)[0] ?? path;
}

function safeDecodePath(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function normalizePath(path: string) {
  return safeDecodePath(stripQuery(path))
    .replace(/^\/+/, "")
    .replace(/^public\//, "")
    .toLowerCase();
}

function fileStem(path: string) {
  const fileName = path.split("/").pop() ?? path;
  return fileName.replace(/\.[^.]+$/, "");
}

function searchableTokens(path: string) {
  return fileStem(path)
    .replace(/screen|sections|section|open|overview|home/g, "")
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 2);
}

function matchingAssetScore(src: string, assetPath: string) {
  const srcTokens = searchableTokens(src);
  const assetTokens = searchableTokens(assetPath);

  if (srcTokens.length === 0 || assetTokens.length === 0) return 0;

  const matches = srcTokens.filter((token) =>
    assetTokens.some(
      (assetToken) => assetToken.includes(token) || token.includes(assetToken),
    ),
  );

  return matches.length / Math.max(srcTokens.length, assetTokens.length);
}

function resolveImageAsset(src: string | undefined, assets: MockAsset[]) {
  if (!src) return undefined;

  const imageAssets = assets.filter((asset) => asset.kind === "image");
  const normalizedSrc = normalizePath(src);
  const directMatch = imageAssets.find((asset) => {
    const assetPath = normalizePath(asset.path);

    return (
      normalizedSrc === assetPath ||
      normalizedSrc === normalizePath(asset.name) ||
      normalizedSrc.endsWith(`/${assetPath}`) ||
      normalizedSrc.endsWith(`/${normalizePath(asset.name)}`)
    );
  });

  if (directMatch) return directMatch;

  const rankedMatch = imageAssets
    .map((asset) => ({
      asset,
      score: matchingAssetScore(normalizedSrc, normalizePath(asset.path)),
    }))
    .sort((left, right) => right.score - left.score)[0];

  return rankedMatch && rankedMatch.score >= 0.35
    ? rankedMatch.asset
    : undefined;
}

function imageDimensions(path: string) {
  if (path.includes("/brand/")) {
    return {
      height: 288,
      width: 866,
    };
  }

  return {
    height: 2622,
    width: 1206,
  };
}

function splitFrontmatter(markdown: string) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    return {
      body: markdown,
      frontmatter: [] as string[],
    };
  }

  return {
    body: markdown.slice(match[0].length),
    frontmatter: match[1].split(/\r?\n/),
  };
}

function placeholderForKey(key: string) {
  const normalizedKey = key.toLowerCase();

  if (normalizedKey === "name") return "Name this document";
  if (normalizedKey === "app.name") return "Add app name";
  if (normalizedKey === "request.title") return "Add request title";
  if (normalizedKey.includes("name")) return "Add name";
  if (normalizedKey.includes("title")) return "Add title";
  if (normalizedKey.includes("requestedby")) return "Add requester";
  if (normalizedKey.includes("date")) return "Add date";
  if (normalizedKey.includes("priority")) return "Set priority";
  if (normalizedKey.includes("changetype")) return "Set change type";
  if (normalizedKey.includes("description")) return "Add description";
  if (normalizedKey.includes("category")) return "Add category";
  if (normalizedKey.includes("primary")) return "Define primary audience";
  if (normalizedKey.includes("secondary")) return "Define secondary audience";
  if (normalizedKey.includes("notfor")) return "Define non-audience";
  if (normalizedKey.includes("appicon")) return "Reference app icon";
  if (normalizedKey.includes("applogo")) return "Reference app logo";
  if (normalizedKey.includes("privacypolicy")) return "Add privacy URL";
  if (normalizedKey.includes("terms")) return "Add terms URL";
  if (normalizedKey.includes("support")) return "Add support URL";
  if (normalizedKey.includes("fontfamily")) return "Choose font family";
  if (normalizedKey.includes("fontsize")) return "Set font size";
  if (normalizedKey.includes("fontweight")) return "Set font weight";
  if (normalizedKey.includes("lineheight")) return "Set line height";
  if (normalizedKey.includes("backgroundcolor")) return "Set background color";
  if (normalizedKey.includes("textcolor")) return "Set text color";
  if (normalizedKey.includes("rounded")) return "Set radius";
  if (normalizedKey.includes("padding")) return "Set padding";
  if (normalizedKey.includes("color")) return "Set color";
  if (normalizedKey.includes("spacing")) return "Set spacing";
  if (normalizedKey.includes("keywords")) return "Add keyword";

  return "Add value";
}

function requiredValue(value: string, key: string) {
  return value || placeholderForKey(key);
}

function nextFrontmatterLine(frontmatter: string[], index: number) {
  for (let nextIndex = index + 1; nextIndex < frontmatter.length; nextIndex += 1) {
    if (frontmatter[nextIndex].trim()) return frontmatter[nextIndex];
  }

  return undefined;
}

function frontmatterIndent(line: string) {
  return line.match(/^\s*/)?.[0].length ?? 0;
}

function parseFrontmatter(frontmatter: string[]) {
  const summary = {
    fields: [] as FrontmatterField[],
    groups: [] as FrontmatterGroup[],
  };
  let currentGroup: FrontmatterGroup | undefined;
  let currentField: FrontmatterField | undefined;
  const pathByLevel: string[] = [];

  frontmatter.forEach((line, index) => {
    if (!line.trim()) return;

    const indent = frontmatterIndent(line);
    const level = Math.floor(indent / 2);
    const trimmedLine = line.trim();

    if (trimmedLine === "-" || trimmedLine.startsWith("- ")) {
      const value = currentField
        ? requiredValue(trimmedLine.replace(/^-\s*/, "").trim(), currentField.key)
        : "Add list item";

      if (currentField) {
        currentField.values.push(value);
      }
      return;
    }

    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex === -1) {
      summary.fields.push({
        key: trimmedLine,
        values: [placeholderForKey(trimmedLine)],
      });
      currentGroup = undefined;
      currentField = undefined;
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex);
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    const nextLine = nextFrontmatterLine(frontmatter, index);
    const nextIndent = nextLine ? frontmatterIndent(nextLine) : 0;
    const nextTrimmedLine = nextLine?.trim() ?? "";
    const hasChildren = Boolean(nextLine && nextIndent > indent);
    const hasListChildren =
      hasChildren &&
      (nextTrimmedLine === "-" || nextTrimmedLine.startsWith("- "));

    pathByLevel[level] = key;
    pathByLevel.length = level + 1;

    if (indent === 0 && !value) {
      currentGroup = {
        title: key,
        fields: [],
      };
      currentField = undefined;
      summary.groups.push(currentGroup);
      return;
    }

    if (!value && hasChildren && !hasListChildren) {
      currentField = undefined;
      return;
    }

    const keyPath = pathByLevel.slice(1, level + 1).join(".");
    const displayKey = keyPath || key;
    const placeholderKey = currentGroup
      ? `${currentGroup.title}.${displayKey}`
      : displayKey;
    const field = {
      key: displayKey,
      values:
        value || hasListChildren
          ? value
            ? [value]
            : []
          : [placeholderForKey(placeholderKey)],
    };

    if (indent > 0 && currentGroup) {
      currentGroup.fields.push(field);
      currentField = field;
      return;
    }

    summary.fields.push({
      key,
      values: [requiredValue(value, key)],
    });
    currentGroup = undefined;
    currentField = undefined;
  });

  return summary;
}

function FrontmatterValue({ values }: { values: string[] }) {
  const missing = values.every((value) =>
    [
      "add ",
      "choose ",
      "define ",
      "reference ",
      "select ",
      "set ",
    ].some((prefix) => value.toLowerCase().startsWith(prefix)),
  );

  if (values.length === 0) {
    return (
      <span className="rounded bg-[#FFF4E5] px-1.5 py-0.5 font-black text-[#B25A00]">
        Add value
      </span>
    );
  }

  if (values.length === 1) {
    return (
      <span
        className={
          missing
            ? "rounded bg-[#FFF4E5] px-1.5 py-0.5 font-black text-[#B25A00]"
            : undefined
        }
      >
        {values[0]}
      </span>
    );
  }

  return (
    <span className="flex flex-wrap gap-1">
      {values.map((value, index) => (
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
            value.toLowerCase().startsWith("add ")
              ? "bg-[#FFF4E5] text-[#B25A00]"
              : "bg-white text-[#46515D]"
          }`}
          key={`${value}-${index}`}
        >
          {value}
        </span>
      ))}
    </span>
  );
}

function FrontmatterPreview({ frontmatter }: { frontmatter: string[] }) {
  const summary = parseFrontmatter(frontmatter);
  const hasHeader =
    summary.fields.length > 0 ||
    summary.groups.some((group) => group.fields.length > 0);

  if (!hasHeader) return null;

  return (
    <section className="mb-6 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
      <div className="mono mb-3 text-[10px] font-black uppercase text-[#46515D]">
        Document header
      </div>
      {summary.fields.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {summary.fields.map((field) => (
            <div
              className="rounded-md border border-[#D8DEE4] bg-white px-2 py-1"
              key={field.key}
            >
              <span className="mono mr-1 text-[9px] font-black uppercase text-[#687482]">
                {field.key}
              </span>
              <span className="text-[11px] font-black text-[#101418]">
                <FrontmatterValue values={field.values} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {summary.groups.map((group) => (
          <div
            className="rounded-md border border-[#D8DEE4] bg-white p-3"
            key={group.title}
          >
            <div className="mono mb-2 text-[10px] font-black uppercase text-[#0A84FF]">
              {group.title}
            </div>
            <div className="space-y-2">
              {group.fields.map((field) => (
                <div
                  className="grid grid-cols-[minmax(136px,0.58fr)_minmax(0,1fr)] gap-3 text-[11px] leading-snug"
                  key={field.key}
                >
                  <div className="mono min-w-0 break-words font-black text-[#687482] [overflow-wrap:anywhere]">
                    {field.key}
                  </div>
                  <div className="min-w-0 break-words font-semibold text-[#26313D]">
                    <FrontmatterValue values={field.values} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function splitMarkdownSections(markdown: string) {
  const lines = markdown.trimStart().split(/\r?\n/);
  const intro: string[] = [];
  const sections: MarkdownSection[] = [];
  let currentSection: MarkdownSection | undefined;

  lines.forEach((line) => {
    const sectionMatch = line.match(/^##\s+(.+)$/);

    if (sectionMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        content: "",
        title: sectionMatch[1],
      };
      return;
    }

    if (currentSection) {
      currentSection.content = `${currentSection.content}${line}\n`;
      return;
    }

    intro.push(line);
  });

  if (currentSection) sections.push(currentSection);

  return {
    intro: intro.join("\n").trim(),
    sections: sections.map((section) => ({
      ...section,
      content: section.content.trim(),
    })),
  };
}

function placeholderForSection(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("overview")) {
    return "Describe the product, problem, audience, and intended outcome.";
  }
  if (normalizedTitle.includes("request")) {
    return "Describe the requested change in plain language.";
  }
  if (normalizedTitle.includes("current behavior")) {
    return "Describe how the app works today before this change.";
  }
  if (normalizedTitle.includes("why")) {
    return "Explain why this section matters for users or the business.";
  }
  if (normalizedTitle.includes("desired behavior")) {
    return "Describe what should happen after the change is implemented.";
  }
  if (normalizedTitle.includes("affected app areas")) {
    return "List the screens, flows, data, and design areas this change touches.";
  }
  if (normalizedTitle.includes("navigation")) {
    return "Describe section hierarchy, entry points, and back behavior.";
  }
  if (normalizedTitle.includes("screens")) {
    return "Add each screen name, reference asset, and screen description.";
  }
  if (normalizedTitle.includes("data") || normalizedTitle.includes("content")) {
    return "Describe new data, copy, labels, sorting, filtering, and empty states.";
  }
  if (normalizedTitle.includes("acceptance")) {
    return "Add clear Given/When/Then criteria or completion checklist items.";
  }
  if (normalizedTitle.includes("non-goals")) {
    return "List work that should stay out of scope.";
  }
  if (normalizedTitle.includes("assets")) {
    return "List required screenshots, icons, images, fonts, or media references.";
  }
  if (normalizedTitle.includes("goals")) {
    return "List the user and operational outcomes this app should achieve.";
  }
  if (normalizedTitle.includes("scope")) {
    return "Define what is in scope and out of scope.";
  }
  if (normalizedTitle.includes("colors")) {
    return "Define the color palette and when each color should be used.";
  }
  if (normalizedTitle.includes("typography")) {
    return "Define font families, sizes, weights, and hierarchy.";
  }
  if (normalizedTitle.includes("layout")) {
    return "Describe spacing, density, alignment, and screen structure.";
  }
  if (normalizedTitle.includes("components")) {
    return "Describe recurring buttons, inputs, cards, navigation, and controls.";
  }
  if (normalizedTitle.includes("risks")) {
    return "List assumptions, unknowns, dependencies, and implementation risks.";
  }

  return `Add ${title.toLowerCase()} details.`;
}

function MarkdownPreview({
  assets,
  markdown,
}: {
  assets: MockAsset[];
  markdown: string;
}) {
  const { body, frontmatter } = splitFrontmatter(markdown);
  const { intro, sections } = splitMarkdownSections(body);
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mb-5 border-l-4 border-[#0A84FF] pl-3 text-xl font-black leading-tight text-[#101418]">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-8 flex items-center gap-2 text-base font-black leading-snug text-[#101418]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 border-t border-[#E5EAF0] pt-4 text-sm font-black leading-snug text-[#0A84FF]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-1.5 mt-4 text-[11px] font-black uppercase leading-snug text-[#46515D]">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="mb-2 text-[11px] leading-[1.55] text-[#26313D]">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mb-3 list-disc space-y-1 pl-5 text-[11px] leading-[1.45] text-[#26313D]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 list-decimal space-y-1 pl-5 text-[11px] leading-[1.45] text-[#26313D]">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-black text-[#101418]">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-3 border-l-4 border-[#34C759] bg-[#F4FBF6] px-3 py-2 text-[11px] leading-[1.45] text-[#26313D]">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="mono rounded bg-[#E5EAF0] px-1 py-0.5 text-[10px] font-black text-[#101418]">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="mono mb-3 overflow-auto rounded-md bg-[#101418] p-3 text-[10px] leading-[1.5] text-white">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-4 border-[#D8DEE4]" />,
    a: ({ children, href }) => (
      <a
        className="font-black text-[#0A84FF] underline decoration-[#0A84FF]/30 underline-offset-2"
        href={href}
      >
        {children}
      </a>
    ),
    img: ({ alt, src }) => {
      const markdownSrc = typeof src === "string" ? src : undefined;
      const asset = resolveImageAsset(markdownSrc, assets);

      if (!asset) {
        return (
          <span className="mono my-2 block rounded-md border border-dashed border-[#C8D0D8] bg-[#F8FAFC] px-3 py-2 text-[10px] font-black text-[#687482]">
            Missing declared asset: {markdownSrc ?? "unknown source"}
          </span>
        );
      }

      return (
        <span className="my-3 block overflow-hidden rounded-md border border-[#D8DEE4] bg-[#F8FAFC]">
          <Image
            alt={alt || asset.description}
            className="mx-auto max-h-[360px] w-auto max-w-full object-contain"
            height={imageDimensions(asset.path).height}
            src={`/${asset.path}`}
            width={imageDimensions(asset.path).width}
          />
          <span className="mono block border-t border-[#D8DEE4] px-2 py-1 text-[9px] font-black uppercase text-[#687482]">
            {asset.name}
          </span>
        </span>
      );
    },
  };

  return (
    <article className="min-h-full bg-white px-5 py-5">
      <FrontmatterPreview frontmatter={frontmatter} />
      {intro ? <ReactMarkdown components={components}>{intro}</ReactMarkdown> : null}
      <div className="space-y-4">
        {sections.map((section) => (
          <details
            className="group overflow-hidden rounded-md border border-[#D8DEE4] bg-white"
            key={section.title}
            open
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 bg-[#F8FAFC] px-4 py-3 text-sm font-black text-[#101418] transition hover:bg-[#EEF2F5] [&::-webkit-details-marker]:hidden">
              <span className="mono grid h-5 w-5 shrink-0 place-items-center rounded border border-[#C8D0D8] bg-white text-[12px] leading-none text-[#46515D] group-open:hidden">
                +
              </span>
              <span className="mono hidden h-5 w-5 shrink-0 place-items-center rounded border border-[#C8D0D8] bg-white text-[12px] leading-none text-[#46515D] group-open:grid">
                -
              </span>
              <span>{section.title}</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              {section.content ? (
                <ReactMarkdown components={components}>
                  {section.content}
                </ReactMarkdown>
              ) : (
                <p className="mono py-3 text-[10px] font-black uppercase text-[#8A94A0]">
                  {placeholderForSection(section.title)}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </article>
  );
}
