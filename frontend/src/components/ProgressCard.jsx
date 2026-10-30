
export default function ProgressCard({
  title,
  value = 0,
  target = 100,
  unit = "",
  icon,
}) {
  const safeValue = Number.isFinite(Number(value))
    ? Math.max(0, Number(value))
    : 0;

  const safeTarget = Number.isFinite(Number(target))
    ? Math.max(0, Number(target))
    : 0;

  const percent =
    safeTarget > 0
      ? Math.min((safeValue / safeTarget) * 100, 100)
      : 0;

  const remaining = Math.max(0, safeTarget - safeValue);

  let status = "In progress";
  let barColor = "bg-sky-400";
  let statusColor = "text-sky-300";

  if (safeTarget > 0 && percent >= 100) {
    status = "Goal achieved";
    barColor = "bg-emerald-400";
    statusColor = "text-emerald-300";
  } else if (percent >= 70) {
    status = "Almost there";
    barColor = "bg-amber-400";
    statusColor = "text-amber-300";
  }

  const formatNumber = (number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 1,
    }).format(number);

  return (
    <article className="card group min-w-0 space-y-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-950/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-xl">
              {icon}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {title}
            </h3>
            <p className={`mt-1 text-xs font-medium ${statusColor}`}>
              {status}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold tabular-nums text-gray-200">
          {Math.round(percent)}%
        </span>
      </div>

      {/* Values */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {formatNumber(safeValue)}
            {unit && (
              <span className="ml-1 text-sm font-medium text-gray-400">
                {unit}
              </span>
            )}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Target: {formatNumber(safeTarget)}
            {unit ? ` ${unit}` : ""}
          </p>
        </div>

        {safeTarget > 0 && percent >= 100 && (
          <span className="mb-1 text-xl" role="img" aria-label="Completed">
            🎯
          </span>
        )}
      </div>

      {/* Progress */}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-gray-800"
        role="progressbar"
        aria-label={`${title || "Goal"} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className={`h-full rounded-full ${barColor} transition-[width] duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-gray-400">
          {safeTarget > 0 && percent >= 100
            ? "You've reached your target."
            : safeTarget === 0
              ? "Set a target to track progress."
              : `${formatNumber(remaining)}${unit ? ` ${unit}` : ""} remaining`}
        </span>

        <span className="shrink-0 font-medium text-gray-300 tabular-nums">
          {formatNumber(safeTarget > 0 ? Math.min(safeValue, safeTarget) : 0)}
          {" / "}
          {formatNumber(safeTarget)}
        </span>
      </div>
    </article>
  );
}
