export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171819]">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-10 px-4 py-8 sm:px-8">
        <div className="space-y-4">
          <div className="h-5 w-40 animate-pulse rounded bg-black/10" />
          <div className="h-16 w-[min(760px,90%)] animate-pulse rounded bg-black/10" />
          <div className="h-5 w-[min(620px,85%)] animate-pulse rounded bg-black/10" />
          <div className="h-5 w-[min(520px,80%)] animate-pulse rounded bg-black/10" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-black/10 bg-white p-4">
              <div className="h-44 animate-pulse rounded-lg bg-black/8" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-black/10" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-black/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
