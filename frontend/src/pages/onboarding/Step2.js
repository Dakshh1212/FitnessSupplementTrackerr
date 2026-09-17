import { useState } from "react";

export default function Step2({ next }) {

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleNext = () => {
    if (!height || !weight) {
      return alert("Please fill all fields ❌");
    }

    next({ height, weight });
  };

  return (
    <div className="flex items-center justify-center">

      {/* CARD */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-5">

        {/* TITLE */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">
            Body Stats 💪
          </h2>
          <p className="text-sm text-gray-400">
            Tell us your height & weight
          </p>
        </div>

        {/* HEIGHT */}
        <div>
          <label className="text-xs text-gray-400">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 175"
            className="w-full mt-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* WEIGHT */}
        <div>
          <label className="text-xs text-gray-400">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 70"
            className="w-full mt-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* INFO BOX */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-gray-300">
          We use this to calculate your calorie goals & fitness plan 📊
        </div>

        {/* BUTTON */}
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold hover:scale-[1.02] transition"
        >
          Next →
        </button>

      </div>
    </div>
  );
}