export default function AppShellSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-neutral-100 h-screen px-4 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-4 h-4 rounded skeleton shrink-0" />
          <div className="h-4 w-16 rounded skeleton" />
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 flex-1">
          {(["70%", "55%", "60%", "52%"] as const).map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <div className="w-4 h-4 rounded skeleton shrink-0" />
              <div className="h-3.5 rounded skeleton" style={{ width: w }} />
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-4 h-4 rounded skeleton shrink-0" />
            <div className="h-3.5 w-16 rounded skeleton" />
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full skeleton shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="h-3 w-24 rounded skeleton" />
                <div className="h-2.5 w-32 rounded skeleton" />
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-4 h-4 rounded skeleton shrink-0" />
              <div className="h-3.5 w-16 rounded skeleton" />
            </div>
          </div>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden shrink-0 bg-white border-b border-neutral-100">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg skeleton" />
              <div className="h-4 w-16 rounded skeleton" />
            </div>
            <div className="w-8 h-8 rounded-full skeleton" />
          </div>
        </header>

        {/* Page slot */}
        <main className="flex-1 overflow-y-auto pb-28 lg:pb-0">{children}</main>

        {/* Mobile bottom tabs */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-neutral-100 z-40 pb-8 pt-3 px-6 flex items-center justify-between">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg skeleton" />
              <div className="h-2.5 w-8 rounded skeleton" />
            </div>
          ))}
          <div className="w-14 h-14 rounded-2xl skeleton" />
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg skeleton" />
              <div className="h-2.5 w-8 rounded skeleton" />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
