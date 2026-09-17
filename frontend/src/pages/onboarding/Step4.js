export default function Step4({ next }) {

  const levels = [
    {
      key: "sedentary",
      icon: "🪑",
      title: "Sedentary",
      desc: "Little or no exercise",
      color: "from-gray-500 to-gray-700"
    },
    {
      key: "moderately_active",
      icon: "🚶",
      title: "Moderate",
      desc: "Exercise 3-5 days/week",
      color: "from-blue-500 to-cyan-500"
    },
    {
      key: "very_active",
      icon: "🏃",
      title: "Active",
      desc: "Hard exercise daily",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="flex items-center justify-center">

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-5">

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Activity Level ⚡
          </h2>
          <p className="text-sm text-gray-400">
            How active are you daily?
          </p>
        </div>

        {/* OPTIONS */}
        <div className="space-y-3">

          {levels.map((l) => (
            <button
              key={l.key}
              onClick={() => next({ activityLevel: l.key })}
              className="w-full text-left group"
            >

              <div className={`p-4 rounded-2xl border border-white/10 bg-gradient-to-r ${l.color} bg-opacity-10 hover:scale-[1.02] transition`}>

                <div className="flex items-center gap-3">

                  <div className="text-2xl">
                    {l.icon}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {l.title}
                    </p>

                    <p className="text-xs text-gray-300">
                      {l.desc}
                    </p>
                  </div>

                </div>

              </div>

            </button>
          ))}

        </div>

      </div>

    </div>
  );
}