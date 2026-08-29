export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Dark hero skeleton */}
      <div className="relative overflow-hidden px-5 pt-10 pb-20">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 75% 60%, #6D28D9 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          {/* Back link */}
          <div className="h-4 w-20 rounded skeleton-dark mb-8" />
          {/* Icon badge */}
          <div className="w-12 h-12 rounded-2xl skeleton-dark mb-5" />
          {/* Eyebrow */}
          <div className="h-2.5 w-12 rounded skeleton-dark mb-2" />
          {/* Title */}
          <div className="h-8 w-52 rounded-xl skeleton-dark mb-2" />
          {/* Subtitle */}
          <div className="h-3.5 w-64 rounded skeleton-dark" />
          {/* Current plan strip */}
          <div className="mt-8 h-20 rounded-2xl skeleton-dark" />
        </div>
      </div>

      {/* White card skeleton */}
      <div className="bg-neutral-50 rounded-t-3xl -mt-8 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-5 pt-8 pb-12">
          <div className="h-3 w-32 rounded skeleton mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl skeleton mb-4" />
                  <div className="h-2.5 w-16 rounded skeleton mb-1" />
                  <div className="h-9 w-20 rounded-lg skeleton" />
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                  {[0, 1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full skeleton shrink-0" />
                      <div
                        className="h-3 rounded skeleton flex-1"
                        style={{ width: `${70 + j * 6}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="h-11 rounded-xl skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
