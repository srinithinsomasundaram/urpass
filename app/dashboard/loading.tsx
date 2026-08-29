import AppShellSkeleton from "@/components/layouts/AppShellSkeleton";

export default function DashboardLoading() {
  return (
    <AppShellSkeleton>
      <div className="px-4 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-16 rounded skeleton" />
              <div className="h-7 w-52 rounded-xl skeleton" />
              <div className="h-3.5 w-64 rounded skeleton" />
            </div>
            <div className="h-10 w-28 rounded-xl skeleton shrink-0" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-2xl p-5">
                <div className="w-8 h-8 rounded-xl skeleton mb-3" />
                <div className="h-8 w-10 rounded-lg skeleton mb-1.5" />
                <div className="h-3 w-20 rounded skeleton" />
              </div>
            ))}
          </div>

          {/* Section label */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-3.5 w-24 rounded skeleton" />
            <div className="h-3 w-12 rounded skeleton" />
          </div>

          {/* Event list */}
          <div className="flex flex-col gap-2">
            {[72, 58, 65, 80].map((w, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-100 rounded-2xl px-5 py-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl skeleton shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="h-3.5 rounded skeleton" style={{ width: `${w}%` }} />
                  <div className="h-3 w-36 rounded skeleton" />
                </div>
                <div className="h-6 w-14 rounded-full skeleton shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
