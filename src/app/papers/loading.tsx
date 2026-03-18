export default function PapersLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-7 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-72 animate-pulse" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-10 bg-gray-200 rounded-md mb-4 animate-pulse" />

      {/* Filter panel skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg mb-6 animate-pulse" />

      {/* Paper cards skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-5 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-3" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded-full w-16" />
              <div className="h-5 bg-gray-200 rounded-full w-20" />
              <div className="h-5 bg-gray-200 rounded-full w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
