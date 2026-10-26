import { useEffect, useRef, useState, type ReactNode } from "react";

function cell(value: unknown): string {
  if (value == null || value === "") return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function fileName(file: string): string {
  const base = file.trim().replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "export";
  return base.toLowerCase().endsWith(".csv") ? base : `${base}.csv`;
}

function csvText(columns: string[], rows: unknown[][]): string {
  return [columns, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}

function framed(): boolean {
  try {
    return window.parent !== window;
  } catch {
    return true;
  }
}

function saveInDocument(doc: Document, csv: string, name: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = doc.createElement("a");
  link.href = url;
  link.download = name;
  (doc.body ?? doc.documentElement).appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * The live preview is a sandboxed frame. Chrome drops `<a download>` there
 * unless the frame has `allow-downloads`, so the click looks dead. A blank
 * popup is a top-level document and the save is allowed from it.
 */
function saveViaPopup(csv: string, name: string): boolean {
  const popup = window.open("", "_blank");
  if (!popup) return false;
  try {
    if (!popup.document.body) {
      popup.document.open();
      popup.document.write("<!doctype html><title></title><body></body>");
      popup.document.close();
    }
    popup.document.title = name;
    const note = popup.document.createElement("p");
    note.textContent = `Saving ${name}…`;
    popup.document.body.appendChild(note);
    saveInDocument(popup.document, csv, name);
    window.setTimeout(() => {
      try {
        popup.close();
      } catch {
        /* the browser already closed it */
      }
    }, 1200);
    return true;
  } catch {
    try {
      popup.close();
    } catch {
      /* ignore */
    }
    return false;
  }
}

const CSV_EVENT = "fathom-csv";

export function downloadCsv(file: string, columns: string[], rows: unknown[][]) {
  const name = fileName(file);
  const csv = csvText(columns, rows);
  if (!framed()) {
    saveInDocument(document, csv, name);
    return;
  }
  if (saveViaPopup(csv, name)) return;
  window.dispatchEvent(new CustomEvent(CSV_EVENT, { detail: { name, csv } }));
}

export function CsvFallback() {
  const [file, setFile] = useState<{ name: string; csv: string } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onFile = (event: Event) => {
      const detail = (event as CustomEvent<{ name: string; csv: string }>).detail;
      if (!detail?.csv) return;
      setCopied(false);
      setFile(detail);
    };
    window.addEventListener(CSV_EVENT, onFile);
    return () => window.removeEventListener(CSV_EVENT, onFile);
  }, []);
  if (!file) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg-elev p-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[28rem] sm:rounded-md sm:border">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-fg">{file.name}</h2>
        <button type="button" className="min-h-11 text-xs text-muted" onClick={() => setFile(null)}>
          Close
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">This view blocked the file save. Copy the CSV instead.</p>
      <textarea readOnly value={file.csv} className="mt-3 h-36 w-full rounded-md border border-line bg-surface p-2 font-mono text-xs text-fg" />
      <button
        type="button"
        className={`${csvButtonClass} mt-3`}
        onClick={() => {
          const done = () => {
            setCopied(true);
          };
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(file.csv).then(done).catch(done);
            return;
          }
          done();
        }}
      >
        {copied ? "Copied" : "Copy CSV"}
      </button>
    </div>
  );
}

export const csvButtonClass = "min-h-11 rounded-md border border-line px-3 text-xs text-muted";

export function CsvButton({ file, columns, rows }: { file: string; columns: string[]; rows: unknown[][] }) {
  if (!rows.length) return null;
  return (
    <button type="button" className={csvButtonClass} onClick={() => downloadCsv(file, columns, rows)}>
      Download CSV
    </button>
  );
}

export function CsvRecords({
  file,
  rows,
  columns,
}: {
  file: string;
  rows: readonly object[];
  columns?: string[];
}) {
  if (!rows.length) return null;
  const cols = columns ?? Object.keys(rows[0] as Record<string, unknown>);
  return (
    <div className="mt-2 flex justify-end">
      <CsvButton file={file} columns={cols} rows={rows.map((row) => cols.map((column) => (row as Record<string, unknown>)[column] ?? ""))} />
    </div>
  );
}

export function TableExport({ file, children }: { file: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}>
      {children}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className={csvButtonClass}
          onClick={() => {
            const table = ref.current?.querySelector("table");
            if (!table) return;
            const columns = [...table.querySelectorAll("thead th")].map((node) => (node.textContent ?? "").replace(/\s+/g, " ").trim());
            const rows = [...table.querySelectorAll("tbody tr")].map((tr) =>
              [...tr.querySelectorAll("th,td")].map((node) => ((node as HTMLElement).innerText ?? "").replace(/\s+/g, " ").trim()),
            );
            downloadCsv(file, columns, rows);
          }}
        >
          Download CSV
        </button>
      </div>
    </div>
  );
}
