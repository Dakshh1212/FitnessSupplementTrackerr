export default function Step3({ next }) {

  const goals = [
    {
      key: "fat_loss",
      title: "Fat Loss",
      icon: "🔥",
      desc: "Burn calories & reduce body fat",
      color: "from-red-500 to-orange-500"
    },
    {
      key: "muscle_gain",
      title: "Muscle Gain",
      icon: "💪",
      desc: "Build strength & muscle mass",
      color: "from-blue-500 to-cyan-500"
    },
    {
      key: "maintenance",
      title: "Maintain",
      icon: "⚖️",
      desc: "Stay fit & balanced lifestyle",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="flex items-center justify-center">

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-5">

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Your Goal 🎯
          </h2>
          <p className="text-sm text-gray-400">
            Select what you want to achieve
          </p>
        </div>

        {/* CARDS */}
        <div className="space-y-3">

          {goals.map((g) => (
            <button
              key={g.key}
              onClick={() => next({ goal: g.key })}
              className="w-full text-left group"
            >

              <div className={`p-4 rounded-2xl border border-white/10 bg-gradient-to-r ${g.color} bg-opacity-10 hover:scale-[1.02] transition`}>

                <div className="flex items-center gap-3">

                  <div className="text-2xl">
                    {g.icon}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {g.title}
                    </p>

                    <p className="text-xs text-gray-300">
                      {g.desc}
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