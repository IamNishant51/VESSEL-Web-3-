function LegalLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5f6]">
      <div className="mx-auto w-full max-w-[980px] px-4 py-10 sm:px-8">
        <div className="h-10 w-56 animate-pulse rounded bg-black/10" />
        <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-black/8" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border border-black/10 bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LegalLoading;
