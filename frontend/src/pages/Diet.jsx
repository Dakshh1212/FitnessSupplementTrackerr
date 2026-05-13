import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Diet() {

  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");

  const [mealType, setMealType] = useState("breakfast");

  const [selectedFoods, setSelectedFoods] = useState([]);

  const [totalCalories, setTotalCalories] = useState(0);

  /* ================= FETCH FOODS ================= */
  useEffect(() => {
    const fetchFoods = async () => {
      const res = await API.get("/diet/foods");
      setFoods(res.data.data || []);
    };
    fetchFoods();
  }, []);

  /* ================= ADD FOOD ================= */
  const addFood = (food) => {

    const id = food.id;

    const exists = selectedFoods.find(f => f.id === id);

    if (exists) return;

    setSelectedFoods([
      ...selectedFoods,
      {
        id,
        name: food.name,
        calories: food.calories,
        imageUrl: food.imageUrl,
        quantity: 100
      }
    ]);
  };

  /* ================= REMOVE FOOD ================= */
  const removeFood = (id) => {
    setSelectedFoods(selectedFoods.filter(f => f.id !== id));
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (id, value) => {

    const updated = selectedFoods.map(f => {

      if (f.id === id) {
        return {
          ...f,
          quantity: Number(value)
        };
      }

      return f;
    });

    setSelectedFoods(updated);
  };

  /* ================= CALCULATE CALORIES ================= */
  useEffect(() => {

    let total = 0;

    selectedFoods.forEach(f => {
      const base = f.calories || 0;
      const qty = f.quantity || 0;

      total += (base * qty) / 100;
    });

    setTotalCalories(Math.round(total));

  }, [selectedFoods]);

  /* ================= SAVE MEAL ================= */
  const handleSave = async () => {

    if (selectedFoods.length === 0) {
      return alert("Add food first");
    }

    try {

      // IMPORTANT: single clean request per food
      for (const food of selectedFoods) {

        await API.post("/diet/entries", {
          food_id: food.id,
          quantity: food.quantity,
          mealType
        });

      }

      alert("Meal Saved Successfully ✅");

      setSelectedFoods([]);

    } catch (err) {
      console.log(err);
      alert("Failed to save meal ❌");
    }
  };

  /* ================= FILTER FOODS ================= */
  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold">Diet Tracker 🍎</h1>
            <p className="text-gray-400">Track your meals like a pro</p>
          </div>

          {/* MEAL TYPE */}
          <div className="flex gap-3">

            {["breakfast", "lunch", "dinner", "snack"].map(type => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-4 py-2 rounded-xl transition ${
                  mealType === type
                    ? "bg-green-500"
                    : "bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}

          </div>

          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
          />

          {/* FOOD LIST */}
          <div className="grid md:grid-cols-4 gap-4">

            {filteredFoods.map(food => (
              <div
                key={food.id}
                onClick={() => addFood(food)}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition"
              >

                <img
                  src={food.imageUrl}
                  className="h-24 w-full object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />

                <p className="font-semibold">{food.name}</p>

                <p className="text-sm text-gray-400">
                  {food.calories} kcal / 100g
                </p>

              </div>
            ))}

          </div>

          {/* SELECTED MEALS */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">

            <h2 className="text-xl font-semibold mb-4">
              Meal Builder
            </h2>

            {selectedFoods.length === 0 ? (
              <p className="text-gray-400">No food selected</p>
            ) : (
              selectedFoods.map(food => (
                <div key={food.id} className="flex justify-between items-center mb-3">

                  <div>
                    <p>{food.name}</p>
                    <p className="text-xs text-gray-400">
                      {(food.calories * food.quantity / 100).toFixed(0)} kcal
                    </p>
                  </div>

                  <div className="flex gap-2 items-center">

                    <input
                      type="number"
                      value={food.quantity}
                      onChange={(e) => updateQty(food.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-black/30 rounded"
                    />

                    <button
                      onClick={() => removeFood(food.id)}
                      className="text-red-400"
                    >
                      ✕
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>

          {/* TOTAL */}
          <div className="text-2xl font-bold">
            Total Calories: {totalCalories} kcal 🔥
          </div>

          {/* SAVE */}
          <button
            onClick={handleSave}
            className="bg-green-500 px-6 py-3 rounded-xl font-semibold"
          >
            Save {mealType}
          </button>

        </div>

      </div>
    </div>
  );
}