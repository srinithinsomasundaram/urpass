export default function ScanLoading() {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Dark hero */}
      <div className="relative overflow-hidden px-5 pt-10 pb-20">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #6D28D9 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-xl mx-auto">
          {/* Back */}
          <div className="h-4 w-24 rounded skeleton-dark mb-8" />
          {/* Icon badge */}
          <div className="w-12 h-12 rounded-2xl skeleton-dark mb-5" />
          {/* Eyebrow */}
          <div className="h-2.5 w-16 rounded skeleton-dark mb-2" />
          {/* Title */}
          <div className="h-8 w-40 rounded-xl skeleton-dark mb-2" />
          {/* Subtitle */}
          <div className="h-3.5 w-52 rounded skeleton-dark" />
        </div>
      </div>

      {/* White card */}
      <div className="bg-neutral-50 rounded-t-3xl -mt-8 min-h-[60vh]">
        <div className="max-w-xl mx-auto px-5 pt-6 pb-12">
          <div className="h-3 w-28 rounded skeleton mb-4" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white border border-neutral-100 rounded-2xl px-4 py-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="h-3.5 w-36 rounded skeleton" />
                  <div className="flex gap-2">
                    <div className="h-3 w-20 rounded skeleton" />
                    <div className="h-3 w-16 rounded skeleton" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded skeleton shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
