export default function DocsLoading() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)_200px] lg:gap-8">
      <aside className="rounded-xl border border-black/10 bg-white p-4 md:sticky md:top-24 md:h-fit">
        <div className="h-3 w-16 animate-pulse rounded bg-black/10" />
        <div className="mt-2 h-2 w-20 animate-pulse rounded bg-black/8" />
        <div className="mt-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-black/8" />
          ))}
        </div>
      </aside>

      <main className="rounded-xl border border-black/10 bg-white p-5 sm:p-8 lg:p-10">
        <div className="h-3 w-44 animate-pulse rounded bg-black/10" />
        <div className="mt-5 h-14 w-4/5 animate-pulse rounded bg-black/10" />
        <div className="mt-3 h-7 w-3/4 animate-pulse rounded bg-black/8" />
        <div className="mt-3 h-5 w-full animate-pulse rounded bg-black/8" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-black/8" />
          ))}
        </div>
      </main>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="h-3 w-28 animate-pulse rounded bg-black/10" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-black/8" />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
