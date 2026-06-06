"use client";

import { useEffect, useMemo, useState } from "react";

type CsvPreviewProps = {
  path: string;
};

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

export function CsvPreview({ path }: CsvPreviewProps) {
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
