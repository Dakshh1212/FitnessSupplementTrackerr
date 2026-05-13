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

  /* ================= FETCH ================= */
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
    const id = supp.id;

    const exists = selected.find(s => s.id === id);

    if (exists) {
      setSelected(selected.filter(s => s.id !== id));
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

  /* ================= COST ================= */
  const totalCost = selected.reduce(
    (acc, s) => acc + (Number(s.price) || 0),
    0
  );

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-6 bg-[#020617] text-white min-h-screen space-y-6">

          <h1 className="text-3xl font-bold text-green-400">
            Supplement Plans 💊
          </h1>

          {/* CREATE */}
          <div className="bg-[#1e293b] p-5 rounded-xl space-y-3">

            <input
              placeholder="Plan Name"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              className="w-full p-2 bg-[#020617] border border-gray-700"
            />

            <input
              placeholder="Goal"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full p-2 bg-[#020617] border border-gray-700"
            />

            <p className="text-green-400">
              ₹{totalCost}
            </p>

          </div>

          {/* GRID */}
          <div className="grid grid-cols-4 gap-4">

            {supplements.map(s => {

              const selectedItem =
                selected.find(x => x.id === s.id);

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className={`p-3 bg-[#1e293b] rounded-xl cursor-pointer ${
                    selectedItem ? "ring-2 ring-green-400" : ""
                  }`}
                >

                  <img
                    src={s.imageUrl}
                    className="h-24 w-full object-contain"
                  />

                  <p className="text-center">{s.name}</p>
                  <p className="text-center text-gray-400">
                    ₹{s.price}
                  </p>

                </div>
              );
            })}
          </div>

          {/* CONFIG */}
          <div className="bg-[#1e293b] p-5 rounded-xl">

            {selected.map((s, i) => (
              <div key={i} className="flex justify-between mb-2">

                <span>{s.name}</span>

                <input
                  type="number"
                  value={s.dosage.amount}
                  onChange={(e) => updateDosage(i, e.target.value)}
                  className="w-20 text-black"
                />

              </div>
            ))}

          </div>

          {/* SAVE */}
          <button
            onClick={handleCreate}
            className="w-full bg-green-500 py-2 rounded"
          >
            Save Plan 🚀
          </button>

          {/* HISTORY */}
          <div>
            {plans.map(p => (
              <div key={p.id} className="border-b py-2">
                <p>{p.name}</p>
                <p className="text-sm text-gray-400">{p.goal}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}