export default function Step5({ submit }) {

  const options = [
    {
      key: "veg",
      icon: "🥦",
      title: "Vegetarian",
      desc: "Plant-based diet"
    },
    {
      key: "non-veg",
      icon: "🍗",
      title: "Non-Vegetarian",
      desc: "Balanced protein diet"
    },
    {
      key: "vegan",
      icon: "🌱",
      title: "Vegan",
      desc: "Fully plant-based lifestyle"
    }
  ];

  return (
    <div className="flex items-center justify-center">

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold">
            Food Preference 🍽️
          </h2>

          <p className="text-sm text-gray-400">
            Choose your diet style
          </p>
        </div>

        {/* INFO BOX */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-gray-300">
          This helps us generate your personalized meal recommendations ⚡
        </div>

        {/* OPTIONS */}
        <div className="space-y-3">

          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => submit({ foodPreference: o.key })}
              className="w-full text-left group"
            >

              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition">

                <div className="flex items-center gap-3">

                  {/* ICON */}
                  <div className="text-2xl">
                    {o.icon}
                  </div>

                  {/* TEXT */}
                  <div>
                    <p className="font-semibold">
                      {o.title}
                    </p>

                    <p className="text-xs text-gray-400">
                      {o.desc}
                    </p>
                  </div>

                </div>

              </div>

            </button>
          ))}

        </div>

        {/* FOOT NOTE */}
        <p className="text-center text-xs text-gray-500">
          You can change this later in settings
        </p>

      </div>

    </div>
  );
}