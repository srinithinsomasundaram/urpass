"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { bulkAddAttendees } from "@/app/actions/attendees";
import { PASS_TYPES, type AttendeeInput } from "@/lib/validations/attendee";

interface Props {
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ParsedRow = AttendeeInput & { _valid: boolean; _error?: string };
type ImportResult = { added: number; skipped: number; error?: string };

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

  return lines.slice(1).map((line) => {
    // Handle simple quoted fields
    const cols: string[] = [];
    let inQuote = false;
    let cur = "";
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });

    const name = row["name"] ?? "";
    const email = row["email"] ?? "";
    const phone = row["phone"] ?? "";
    const passType = row["pass_type"] ?? row["pass type"] ?? "participant";
    const validPassType = PASS_TYPES.includes(passType as (typeof PASS_TYPES)[number])
      ? (passType as (typeof PASS_TYPES)[number])
      : "participant";

    const valid = name.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return {
      name,
      email,
      phone: phone || undefined,
      pass_type: validPassType,
      _valid: valid,
      _error: !valid
        ? !name ? "Missing name" : "Invalid email"
        : undefined,
    };
  });
}

export default function CSVUploadModal({ eventId, onClose, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setParseError("No rows found. Check that your CSV has a header row and data rows.");
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

  async function handleImport() {
    const valid = rows.filter((r) => r._valid);
    if (valid.length === 0) return;

    setLoading(true);
    const res = await bulkAddAttendees(
      eventId,
      valid.map(({ name, email, pass_type, phone }) => ({
        name,
        email,
        pass_type,
        ...(phone ? { phone } : {}),
      }))
    );
    setResult(res);
    setLoading(false);

    if (!res.error && res.added > 0) {
      onSuccess();
    }
  }

  const validCount = rows.filter((r) => r._valid).length;
  const invalidCount = rows.filter((r) => !r._valid).length;
  const preview = rows.slice(0, 5);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-sm font-semibold">Upload CSV</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Format hint */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4">
            <p className="text-xs font-medium text-neutral-700 mb-1">Expected CSV format</p>
            <p className="text-xs text-neutral-400 font-mono">name, email, phone, pass_type</p>
            <p className="text-xs text-neutral-400 mt-1">
              pass_type: participant · vip · speaker · organizer
            </p>
          </div>

          {/* File picker */}
          {!fileName ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-neutral-200 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
            >
              <Upload className="w-6 h-6 text-neutral-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">Choose a CSV file</p>
                <p className="text-xs text-neutral-400 mt-0.5">or drag and drop</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 border border-neutral-100 rounded-xl p-3">
              <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="text-sm truncate flex-1">{fileName}</span>
              <button
                onClick={() => { setFileName(""); setRows([]); setResult(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-xs text-neutral-400 hover:text-neutral-700 shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />

          {parseError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {parseError}
            </p>
          )}

          {/* Preview */}
          {rows.length > 0 && !result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-neutral-700">
                  Preview — {rows.length} row{rows.length !== 1 ? "s" : ""} found
                </p>
                <div className="flex items-center gap-3">
                  {validCount > 0 && (
                    <span className="text-xs text-green-600">{validCount} valid</span>
                  )}
                  {invalidCount > 0 && (
                    <span className="text-xs text-red-500">{invalidCount} invalid</span>
                  )}
                </div>
              </div>
              <div className="border border-neutral-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100">
                      <th className="text-left font-medium text-neutral-400 px-3 py-2">Name</th>
                      <th className="text-left font-medium text-neutral-400 px-3 py-2">Email</th>
                      <th className="text-left font-medium text-neutral-400 px-3 py-2 hidden sm:table-cell">Type</th>
                      <th className="px-3 py-2 w-6" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {preview.map((row, i) => (
                      <tr key={i} className={row._valid ? "" : "bg-red-50/50"}>
                        <td className="px-3 py-2 font-medium">{row.name || <span className="text-neutral-300">—</span>}</td>
                        <td className="px-3 py-2 text-neutral-500 truncate max-w-[120px]">{row.email || <span className="text-neutral-300">—</span>}</td>
                        <td className="px-3 py-2 hidden sm:table-cell capitalize text-neutral-500">{row.pass_type}</td>
                        <td className="px-3 py-2">
                          {!row._valid && (
                            <span title={row._error}>
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 5 && (
                  <div className="px-3 py-2 border-t border-neutral-100 bg-neutral-50">
                    <p className="text-xs text-neutral-400">+{rows.length - 5} more rows not shown</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`border rounded-xl p-4 ${result.error ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
              {result.error ? (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {result.added} attendee{result.added !== 1 ? "s" : ""} imported
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-xs text-green-700 mt-0.5">
                        {result.skipped} skipped (duplicates or invalid)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 border-t border-neutral-100 shrink-0 flex gap-2">
          {result ? (
            <button
              onClick={onClose}
              className="flex-1 bg-neutral-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 border border-neutral-200 rounded-xl py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0 || loading}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? "Importing…" : `Import ${validCount} attendee${validCount !== 1 ? "s" : ""}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
