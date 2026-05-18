export default function Loading() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="skeleton h-9 w-44 rounded-md" />
        <div className="skeleton h-4 w-36 rounded" />
      </header>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
        <div className="skeleton h-2 w-full rounded-full" />
      </div>

      <div className="card p-4 flex flex-wrap gap-2.5">
        <div className="skeleton h-9 w-52 rounded" />
        <div className="skeleton h-8 w-12 rounded ml-auto" />
        <div className="skeleton h-8 w-16 rounded" />
        <div className="skeleton h-8 w-14 rounded" />
      </div>

      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="skeleton h-7 w-28 rounded-md" />
              <div className="skeleton h-4 w-10 rounded" />
            </div>
            <ul className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="card p-4">
                  <div className="flex gap-3">
                    <div className="skeleton h-5 w-5 rounded-md shrink-0 mt-0.5" />
                    <div className="skeleton h-14 w-14 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="skeleton h-4 w-2/3 rounded" />
                      <div className="skeleton h-3 w-full rounded" />
                      <div className="skeleton h-3 w-3/4 rounded" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
