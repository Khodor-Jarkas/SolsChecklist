export default function Loading() {
  return (
    <section className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="skeleton h-9 w-28 rounded-md" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>
      </header>

      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} className="space-y-3">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-5 w-32 rounded" />
                  <div className="skeleton h-5 w-16 rounded-full ml-auto" />
                </div>
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="skeleton h-5 w-20 rounded" />
                  <div className="skeleton h-5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
