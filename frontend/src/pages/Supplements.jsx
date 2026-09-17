import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getSupplements,
  createPlan,
  getPlans
} from "../services/supplementService";

export default function SupplementPlan() {

  const [supplements, setSupplements] = useState([]);
  const [selected, setSelected] = useState([]);
  const [plans, setPlans] = useState([]);

  const [planName, setPlanName] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const s = await getSupplements();
      const p = await getPlans();

      setSupplements(Array.isArray(s) ? s : []);
      setPlans(Array.isArray(p) ? p : []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= SELECT ================= */
  const handleSelect = (supp) => {
    const exists = selected.find(s => s.id === supp.id);

    if (exists) {
      setSelected(selected.filter(s => s.id !== supp.id));
    } else {
      setSelected([
        ...selected,
        {
          ...supp,
          dosage: { amount: 1, unit: "scoop" },
          frequency: "daily",
          timing: ["morning"]
        }
      ]);
    }
  };

  /* ================= DOSAGE ================= */
  const updateDosage = (index, value) => {
    const updated = [...selected];
    updated[index].dosage.amount = Number(value);
    setSelected(updated);
  };

  /* ================= CREATE PLAN ================= */
  const handleCreate = async () => {
    try {
      if (!planName || selected.length === 0) {
        return alert("Fill details ❌");
      }

      await createPlan({
        name: planName,
        goal,
        supplements: selected.map(s => ({
          supplement: s.id,
          dosage: s.dosage,
          frequency: s.frequency,
          timing: s.timing
        }))
      });

      alert("Plan created ✅");

      setPlanName("");
      setGoal("");
      setSelected([]);
      fetchData();

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  const totalCost = selected.reduce(
    (acc, s) => acc + (Number(s.price) || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Supplement Plans 💊
            </h1>
            <p className="text-gray-400">
              Build your nutrition stack like a pro
            </p>
          </div>

          {/* CREATE SECTION */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">

            <input
              placeholder="Plan Name"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/30 border border-white/10"
            />

            <input
              placeholder="Goal"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/30 border border-white/10"
            />

            <p className="text-green-400 font-semibold">
              Total Cost: ₹{totalCost}
            </p>

          </div>

          {/* GRID (APPLE STYLE FIXED) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

            {supplements.map(s => {

              const selectedItem = selected.find(x => x.id === s.id);

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className={`cursor-pointer bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition ${
                    selectedItem ? "ring-2 ring-green-400" : ""
                  }`}
                >

                  {/* IMAGE FIX */}
                  <div className="aspect-square bg-black/20 overflow-hidden">
                    <img
                      src={s.imageUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3 text-center">

                    <p className="text-sm font-semibold truncate">
                      {s.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      ₹{s.price}
                    </p>

                    {/* 💥 BUY LINK BUTTON (BUS LINK FIX) */}
                    {s.buyLink && (
                      <a
                        href={s.buyLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 transition"
                      >
                        Buy Now →
                      </a>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

          {/* CONFIG */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">

            <h2 className="font-semibold text-lg">
              Selected Supplements
            </h2>

            {selected.length === 0 ? (
              <p className="text-gray-400">No supplements selected</p>
            ) : (
              selected.map((s, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/10 py-2">

                  <span>{s.name}</span>

                  <input
                    type="number"
                    value={s.dosage.amount}
                    onChange={(e) => updateDosage(i, e.target.value)}
                    className="w-20 px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-center"
                  />

                </div>
              ))
            )}

          </div>

          {/* SAVE */}
          <button
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
          >
            Save Plan 🚀
          </button>

          {/* HISTORY */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">

            <h2 className="font-semibold mb-3">
              Previous Plans
            </h2>

            {plans.map(p => (
              <div key={p.id} className="border-b border-white/10 py-2">

                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-400">{p.goal}</p>

              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}