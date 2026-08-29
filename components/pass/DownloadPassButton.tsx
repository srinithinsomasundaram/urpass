"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function DownloadPassButton({
  passToken,
  fileName,
}: {
  passToken: string;
  fileName?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pass/image/${passToken}`);
      if (!res.ok) throw new Error("Failed to generate image");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ?? `urpass-${passToken.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
      ) : (
        <Download className="w-4 h-4 text-neutral-600" />
      )}
      {loading ? "Generating…" : "Download pass"}
    </button>
  );
}
