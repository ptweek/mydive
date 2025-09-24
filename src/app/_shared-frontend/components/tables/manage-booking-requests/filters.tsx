export default function BookingRequestsTableFilters({
  numVisibleRows,
  showCancelled,
  setShowCancelled,
  showPast,
  setShowPast,
}: {
  numVisibleRows: number;
  showCancelled: boolean;
  setShowCancelled: (input: boolean) => void;
  showPast: boolean;
  setShowPast: (input: boolean) => void;
}) {
  return (
    <div className="border-b border-gray-200 bg-gray-50 px-3 py-3 sm:px-6 sm:py-4">
      {/* Mobile Layout */}
      <div className="block space-y-3 sm:hidden">
        {/* Results Count */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">
            Showing {numVisibleRows} booking{numVisibleRows !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Show cancelled
            </span>
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Show past bookings
            </span>
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden sm:block md:hidden">
        <div className="flex flex-col gap-3">
          {/* Results Count */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">
              Showing {numVisibleRows} booking{numVisibleRows !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show cancelled
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showPast}
                onChange={(e) => setShowPast(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show past bookings
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden items-center justify-between md:flex">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            Showing {numVisibleRows} booking{numVisibleRows !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show cancelled booking windows
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show past bookings windows
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
