"use client";

import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import type { MockAsset } from "../types";

type MarkdownPreviewProps = {
  assets: MockAsset[];
  markdown: string;
};

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
    summary.fields.length > 0 || summary.groups.some((group) => group.fields.length > 0);

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

export function MarkdownPreview({ assets, markdown }: MarkdownPreviewProps) {
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
            className="h-auto w-full object-contain"
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
