import AppShellSkeleton from "@/components/layouts/AppShellSkeleton";

export default function CreateEventLoading() {
  return (
    <AppShellSkeleton>
      <div className="min-h-screen bg-neutral-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <div className="h-3.5 w-16 rounded skeleton mb-8" />

          {/* Page title */}
          <div className="h-7 w-36 rounded-xl skeleton mb-1.5" />
          <div className="h-3.5 w-56 rounded skeleton mb-8" />

          {/* Card 1 — Event details */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-5 mb-4">
            <div className="h-4 w-24 rounded skeleton mb-5" />
            <div className="flex flex-col gap-4">
              {[0, 1].map((i) => (
                <div key={i}>
                  <div className="h-3 w-20 rounded skeleton mb-2" />
                  <div className="h-10 w-full rounded-xl skeleton" />
                </div>
              ))}
              <div>
                <div className="h-3 w-24 rounded skeleton mb-2" />
                <div className="h-24 w-full rounded-xl skeleton" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-16 rounded skeleton mb-2" />
                    <div className="h-10 rounded-xl skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — Date & time */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-5 mb-4">
            <div className="h-4 w-20 rounded skeleton mb-5" />
            <div className="flex flex-col gap-4">
              <div>
                <div className="h-3 w-16 rounded skeleton mb-2" />
                <div className="h-10 w-full rounded-xl skeleton" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-16 rounded skeleton mb-2" />
                    <div className="h-10 rounded-xl skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 — Capacity & settings */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-5 mb-6">
            <div className="h-4 w-36 rounded skeleton mb-5" />
            <div className="flex flex-col gap-4">
              <div>
                <div className="h-3 w-28 rounded skeleton mb-2" />
                <div className="h-10 w-full rounded-xl skeleton" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col gap-1.5">
                  <div className="h-3.5 w-36 rounded skeleton" />
                  <div className="h-3 w-52 rounded skeleton" />
                </div>
                <div className="w-10 h-6 rounded-full skeleton shrink-0" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="h-11 w-full rounded-xl skeleton" />
        </div>
      </div>
    </AppShellSkeleton>
  );
}
