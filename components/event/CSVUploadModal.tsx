"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, UploadCloud, FileSpreadsheet, Loader2, CheckCircle2,
  AlertCircle, AlertTriangle, ChevronRight,
} from "lucide-react";
import { bulkAddAttendees } from "@/app/actions/attendees";
import { PASS_TYPES, type AttendeeInput } from "@/lib/validations/attendee";

interface Props {
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ParsedRow   = AttendeeInput & { _valid: boolean; _error?: string };
type ImportResult = { added: number; skipped: number; error?: string };

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  return lines.slice(1).map((line) => {
    const cols: string[] = [];
    let inQuote = false, cur = "";
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });
    const name     = row["name"] ?? "";
    const email    = row["email"] ?? "";
    const phone    = row["phone"] ?? "";
    const passType = row["pass_type"] ?? row["pass type"] ?? "participant";
    const validPassType = PASS_TYPES.includes(passType as (typeof PASS_TYPES)[number])
      ? (passType as (typeof PASS_TYPES)[number])
      : "participant";
    const valid = name.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return {
      name, email,
      phone: phone || undefined,
      pass_type: validPassType,
      _valid: valid,
      _error: !valid ? (!name ? "Missing name" : "Invalid email") : undefined,
    };
  });
}

const PASS_COLOR: Record<string, string> = {
  participant: "bg-blue-50 text-blue-600",
  vip:         "bg-amber-50 text-amber-600",
  speaker:     "bg-purple-50 text-purple-600",
  organizer:   "bg-neutral-100 text-neutral-600",
};

export default function CSVUploadModal({ eventId, onClose, onSuccess }: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [rows, setRows]         = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function processFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setParseError("Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    setParseError("");
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setParseError("No rows found. Check your CSV has a header row and data rows.");
          setRows([]);
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError("Could not parse the file. Make sure it's a valid CSV.");
        setRows([]);
      }
    };
    reader.readAsText(file);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function clearFile() {
    setFileName(""); setRows([]); setResult(null); setParseError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImport() {
    const valid = rows.filter((r) => r._valid);
    if (valid.length === 0) return;
    setLoading(true);
    const res = await bulkAddAttendees(
      eventId,
      valid.map(({ name, email, pass_type, phone }) => ({
        name, email, pass_type, ...(phone ? { phone } : {}),
      }))
    );
    setResult(res);
    setLoading(false);
    if (!res.error && res.added > 0) onSuccess();
  }

  const validCount   = rows.filter((r) => r._valid).length;
  const invalidCount = rows.filter((r) => !r._valid).length;
  const preview      = rows.slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 leading-none">Import from CSV</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Bulk add attendees in one step</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 min-h-0">

          {/* Format hint */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">Required format</p>
            <code className="block text-[11px] bg-white border border-neutral-100 rounded-lg px-3 py-2 text-neutral-500 font-mono leading-relaxed">
              name, email, phone, pass_type
            </code>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["participant","vip","speaker","organizer"].map((t) => (
                <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PASS_COLOR[t]}`}>
                  {t}
                </span>
              ))}
              <span className="text-[10px] text-neutral-400 self-center ml-0.5">← valid pass types</span>
            </div>
          </div>

          {/* Drop zone / file selected */}
          {!fileName ? (
            <button
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all ${
                dragging
                  ? "border-violet-400 bg-violet-50"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-violet-100" : "bg-neutral-100"}`}>
                <UploadCloud className={`w-5 h-5 ${dragging ? "text-violet-500" : "text-neutral-400"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-700">
                  {dragging ? "Drop your CSV here" : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">CSV files only</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{fileName}</p>
                <p className="text-xs text-neutral-400">{rows.length} row{rows.length !== 1 ? "s" : ""} detected</p>
              </div>
              <button
                onClick={clearFile}
                className="text-xs font-medium text-neutral-400 hover:text-red-500 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />

          {/* Parse error */}
          {parseError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{parseError}</p>
            </div>
          )}

          {/* Stats bar */}
          {rows.length > 0 && !result && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">{rows.length} row{rows.length !== 1 ? "s" : ""} parsed</span>
              <ChevronRight className="w-3 h-3 text-neutral-300" />
              {validCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {validCount} ready
                </span>
              )}
              {invalidCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  {invalidCount} invalid
                </span>
              )}
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && !result && (
            <div className="rounded-xl border border-neutral-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="text-left font-semibold text-neutral-400 px-4 py-2.5 w-6">#</th>
                    <th className="text-left font-semibold text-neutral-400 px-3 py-2.5">Name</th>
                    <th className="text-left font-semibold text-neutral-400 px-3 py-2.5">Email</th>
                    <th className="text-left font-semibold text-neutral-400 px-3 py-2.5 hidden sm:table-cell">Type</th>
                    <th className="px-3 py-2.5 w-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {preview.map((row, i) => (
                    <tr key={i} className={row._valid ? "hover:bg-neutral-50/50" : "bg-red-50/40"}>
                      <td className="px-4 py-2.5 text-neutral-300 font-mono">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-neutral-800">
                        {row.name || <span className="text-neutral-300 font-normal italic">empty</span>}
                      </td>
                      <td className="px-3 py-2.5 text-neutral-500 max-w-[140px] truncate">
                        {row.email || <span className="text-neutral-300 italic">empty</span>}
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PASS_COLOR[row.pass_type] ?? "bg-neutral-100 text-neutral-500"}`}>
                          {row.pass_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {!row._valid && (
                          <span title={row._error} className="inline-flex items-center gap-1 text-[10px] text-red-500 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            {row._error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 6 && (
                <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50">
                  <p className="text-xs text-neutral-400">+{rows.length - 6} more rows not shown in preview</p>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl border p-5 flex items-start gap-3 ${
              result.error ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
            }`}>
              {result.error ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Import failed</p>
                    <p className="text-xs text-red-600 mt-0.5">{result.error}</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      {result.added} attendee{result.added !== 1 ? "s" : ""} imported successfully
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-xs text-green-700 mt-0.5">
                        {result.skipped} skipped — duplicates or invalid rows
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-neutral-100 shrink-0 flex gap-2.5">
          {result ? (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#6D28D9" }}
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0 || loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#6D28D9" }}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading
                  ? "Importing…"
                  : validCount > 0
                    ? `Import ${validCount} attendee${validCount !== 1 ? "s" : ""}`
                    : "Select a file to import"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
