export default function Loading() {
  return (
    <section className="space-y-8">
      {/* Header / hero */}
      <header className="card p-6 md:p-8 flex items-center gap-6 flex-wrap">
        <div className="skeleton h-20 w-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-7 w-36 rounded-md" />
          <div className="skeleton h-4 w-24 rounded" />
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-7 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Rarity breakdown */}
      <div className="card p-5 space-y-3">
        <div className="skeleton h-5 w-36 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-2 flex-1 rounded-full" />
            <div className="skeleton h-3 w-10 rounded" />
          </div>
        ))}
      </div>

      {/* Aura grid */}
      <div className="space-y-3">
        <div className="skeleton h-5 w-28 rounded" />
        <ul className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <li key={i} className="space-y-1">
              <div className="skeleton aspect-square w-full rounded-lg" />
              <div className="skeleton h-2.5 w-full rounded" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
