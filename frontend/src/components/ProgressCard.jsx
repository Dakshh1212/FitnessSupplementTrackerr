export default function ProgressCard({
    title,
    value = 0,
    target = 100,
    unit = "",
    icon
  }) {
    const safeTarget = target || 1;
    const percent = Math.min((value / safeTarget) * 100, 100);
  
    // 🔥 color logic (nice UX touch)
    let barColor = "from-blue-500 to-indigo-500";
    if (percent >= 100) barColor = "from-green-500 to-emerald-500";
    else if (percent > 70) barColor = "from-yellow-500 to-orange-500";
  
    return (
      <div className="card space-y-4 hover:scale-[1.02] transition">
  
        {/* 🔥 HEADER */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
          </h3>
  
          <span className="text-xs text-muted">
            {Math.round(percent)}%
          </span>
        </div>
  
        {/* 🔥 VALUES */}
        <div className="flex justify-between items-end">
          <span className="text-xl font-bold">
            {value}{unit}
          </span>
  
          <span className="text-xs text-muted">
            / {target}{unit}
          </span>
        </div>
  
        {/* 🔥 PROGRESS BAR */}
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${barColor} transition-all duration-700`}
            style={{ width: `${percent}%` }}
          />
        </div>
  
        {/* 🔥 STATUS TEXT */}
        <p className="text-xs text-right text-muted">
          {percent >= 100
            ? "Goal achieved 🎯"
            : `${Math.round(target - value)}${unit} remaining`}
        </p>
  
      </div>
    );
  }