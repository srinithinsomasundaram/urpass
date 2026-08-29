"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function AutoDownload({
  passToken,
  fileName,
}: {
  passToken: string;
  fileName?: string;
}) {
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (searchParams.get("save") !== "1" || fired.current) return;
    fired.current = true;

    async function download() {
      const res = await fetch(`/api/pass/image/${passToken}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ?? `urpass-${passToken.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }

    download();
  }, [searchParams, passToken, fileName]);

  return null;
}
