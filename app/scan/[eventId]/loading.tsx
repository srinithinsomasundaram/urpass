export default function ScanEventLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Top bar */}
      <div className="shrink-0 h-14 flex items-center px-4 relative border-b border-white/[0.06]">
        <div className="h-4 w-4 rounded skeleton-dark" />
        <div
          className="absolute left-1/2 -translate-x-1/2 h-4 w-32 rounded skeleton-dark"
        />
      </div>

      {/* Center — scanner viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-full max-w-xs sm:max-w-sm">
          <div
            className="w-full rounded-3xl skeleton-dark"
            style={{ aspectRatio: "1" }}
          />
        </div>
        {/* Hint */}
        <div className="h-3.5 w-48 rounded skeleton-dark" />
      </div>

      {/* Bottom safe area */}
      <div className="shrink-0 h-16" />
    </div>
  );
}
