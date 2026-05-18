export default function Loading() {
  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="skeleton h-9 w-24 rounded-md" />
          <div className="skeleton h-4 w-52 rounded" />
        </div>
      </header>

      <div className="card p-1 inline-flex gap-1">
        <div className="skeleton h-8 w-28 rounded" />
        <div className="skeleton h-8 w-28 rounded" />
      </div>

      <div className="card p-4 flex flex-wrap gap-2.5">
        <div className="skeleton h-9 w-40 rounded" />
        <div className="skeleton h-9 w-36 rounded" />
        <div className="skeleton h-9 w-36 rounded" />
        <div className="skeleton h-9 w-36 rounded" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="skeleton h-1.5 w-8 rounded-full" />
          <div className="skeleton h-6 w-20 rounded" />
          <div className="skeleton h-4 w-10 rounded" />
        </div>
        <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <li key={i} className="card p-4">
              <div className="flex gap-3">
                <div className="skeleton h-5 w-5 rounded-md shrink-0 mt-0.5" />
                <div className="skeleton h-20 w-20 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
