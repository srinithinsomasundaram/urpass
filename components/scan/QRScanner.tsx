"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { ScanLine, Camera, CameraOff } from "lucide-react";

interface Props {
  onScan: (token: string) => void;
  active: boolean;
}

const SCANNER_ID = "urpass-qr-scanner";

export default function QRScanner({ onScan, active }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [started, setStarted] = useState(false);
  const mountedRef = useRef(true);

  async function startScanner() {
    try {
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
        scannerRef.current.clear();
      }

      const scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => { if (mountedRef.current) onScan(decodedText); },
        () => {}
      );

      if (mountedRef.current) { setCameraError(""); setStarted(true); }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (mountedRef.current) {
        setCameraError(
          msg.includes("permission")
            ? "Camera permission denied. Allow camera access and try again."
            : "Could not start camera."
        );
        setStarted(false);
      }
    }
  }

  async function stopScanner() {
    if (!scannerRef.current) return;
    try {
      if (await scannerRef.current.getState() === 2) await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch {}
    scannerRef.current = null;
    if (mountedRef.current) setStarted(false);
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!active) {
      stopScanner();
    } else {
      timer = setTimeout(() => {
        startScanner();
      }, 0);
    }
    return () => {
      clearTimeout(timer);
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Viewfinder — fills parent width, square ratio */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-900" style={{ aspectRatio: "1" }}>
        <div id={SCANNER_ID} className="w-full h-full" />

        {/* Starting placeholder */}
        {!started && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-neutral-500" />
            </div>
            <p className="text-xs text-neutral-500">Starting camera…</p>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <CameraOff className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">{cameraError}</p>
          </div>
        )}

        {/* Corner bracket overlay */}
        {started && (
          <>
            <span className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-white/50 rounded-tl-xl pointer-events-none" />
            <span className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-white/50 rounded-tr-xl pointer-events-none" />
            <span className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-white/50 rounded-bl-xl pointer-events-none" />
            <span className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-white/50 rounded-br-xl pointer-events-none" />
            {/* Scan line */}
            <span className="absolute top-1/2 -translate-y-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent opacity-70 pointer-events-none animate-[scanLine_2s_linear_infinite]" />
          </>
        )}
      </div>

      {/* Status line */}
      {started && (
        <div className="flex items-center gap-2">
          <ScanLine className="w-3.5 h-3.5 text-white/30" />
          <p className="text-xs text-white/30">Aim the QR code at the frame</p>
        </div>
      )}
    </div>
  );
}
