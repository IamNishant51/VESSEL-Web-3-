export default function CoreLoading() {
  return (
    <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-4 text-[#171819] sm:-mx-6 sm:px-6">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-6 h-10 w-[260px] animate-pulse rounded-[4px] bg-black/10" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit border-r border-black/5 pr-0 lg:pr-6">
            <div className="h-3 w-24 animate-pulse rounded bg-black/10" />
            <div className="mt-2 h-2 w-20 animate-pulse rounded bg-black/8" />

            <div className="mt-7 border-b border-black/10 pb-5">
              <div className="h-3 w-20 animate-pulse rounded bg-black/10" />
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-6 w-14 animate-pulse rounded-[4px] bg-black/8" />
                ))}
              </div>
            </div>

            <div className="mt-5 border-b border-black/10 pb-5">
              <div className="h-3 w-20 animate-pulse rounded bg-black/10" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-black/8" />
            </div>

            <div className="mt-5">
              <div className="h-3 w-16 animate-pulse rounded bg-black/10" />
              <div className="mt-3 h-9 w-full animate-pulse rounded-[4px] bg-black/8" />
            </div>
          </aside>

          <section>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div className="w-full max-w-[760px] space-y-3">
                <div className="h-14 w-3/4 animate-pulse rounded bg-black/10" />
                <div className="h-6 w-full animate-pulse rounded bg-black/8" />
              </div>
              <div className="hidden h-3 w-40 animate-pulse rounded bg-black/8 md:block" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <article key={i} className="rounded-[6px] border border-black/10 bg-white p-3">
                  <div className="h-[220px] animate-pulse rounded-[4px] bg-black/8" />
                  <div className="mt-3 h-8 w-2/3 animate-pulse rounded bg-black/10" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-black/8" />
                  <div className="mt-3 h-12 animate-pulse rounded bg-black/8" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-8 animate-pulse rounded bg-black/8" />
                    <div className="h-8 animate-pulse rounded bg-black/8" />
                    <div className="h-8 animate-pulse rounded bg-black/8" />
                  </div>
                  <div className="mt-4 h-10 animate-pulse rounded-[3px] bg-black/10" />
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
