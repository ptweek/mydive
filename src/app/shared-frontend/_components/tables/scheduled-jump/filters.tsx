export default function ScheduledJumpsTableFilters({
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
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          Showing {numVisibleRows} scheduled jumps
          {numVisibleRows !== 1 ? "s" : ""}
        </span>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show cancelled scheduled jumps
            </span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show past scheduled jump
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
