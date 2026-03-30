export function SkeletonCard() {
  return (
    <div className="bg-white/80 border border-gray-100 rounded-2xl p-5">
      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-11 h-11 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded-lg w-3/4" />
          <div className="h-5 skeleton rounded-full w-20" />
        </div>
      </div>
      <div className="space-y-2 pl-[3.25rem] mb-4">
        <div className="h-3.5 skeleton rounded w-1/2" />
        <div className="h-3.5 skeleton rounded w-2/3" />
      </div>
      <div className="h-10 skeleton rounded-xl w-full" />
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
