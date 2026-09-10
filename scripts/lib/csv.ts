import { closeSync, fsyncSync, openSync, readFileSync, renameSync, writeSync } from "node:fs";

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.length > 0) || rows.length === 0) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function stringifyCsv(rows: string[][]): string {
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return `${rows
    .map((row) => {
      const padded = row.length >= width ? row : [...row, ...Array(width - row.length).fill("")];
      return padded.map((cell) => escapeCsvField(cell ?? "")).join(",");
    })
    .join("\n")}\n`;
}

export function readCsvFile(path: string): string[][] {
  return parseCsv(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
}

export function writeCsvFile(path: string, rows: string[][]): void {
  const contents = stringifyCsv(rows);
  const tempPath = `${path}.${process.pid}.tmp`;
  const handle = openSync(tempPath, "w");

  try {
    writeSync(handle, contents, undefined, "utf8");
    fsyncSync(handle);
  } finally {
    closeSync(handle);
  }

  renameSync(tempPath, path);
}
