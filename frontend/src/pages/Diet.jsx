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
      try {
        const res = await API.get("/diet/foods");
        setFoods(res.data.data || []);
      } catch (err) {
        console.log(err);
        setFoods([]);
      }
    };
    fetchFoods();
  }, []);

  /* ================= ADD FOOD ================= */
  const addFood = (food) => {
    const id = food.id;

    if (selectedFoods.find(f => f.id === id)) return;

    setSelectedFoods(prev => [
      ...prev,
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
    setSelectedFoods(prev => prev.filter(f => f.id !== id));
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (id, value) => {
    setSelectedFoods(prev =>
      prev.map(f =>
        f.id === id ? { ...f, quantity: Number(value) } : f
      )
    );
  };

  /* ================= CALORIES ================= */
  useEffect(() => {
    let total = 0;

    selectedFoods.forEach(f => {
      total += (f.calories * f.quantity) / 100;
    });

    setTotalCalories(Math.round(total));
  }, [selectedFoods]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!selectedFoods.length) return alert("Add food first");

    try {
      for (const food of selectedFoods) {
        await API.post("/diet/entries", {
          food_id: food.id,
          quantity: food.quantity,
          mealType
        });
      }

      alert("Meal Saved ✅");
      setSelectedFoods([]);

    } catch (err) {
      console.log(err);
      alert("Error saving meal ❌");
    }
  };

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        {/* MAIN CONTAINER */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Diet Tracker 🍎
            </h1>
            <p className="text-gray-400 mt-1">
              Clean & Smart Nutrition Tracking
            </p>
          </div>

          {/* MEAL TYPE */}
          <div className="flex flex-wrap gap-3">

            {["breakfast", "lunch", "dinner", "snack"].map(type => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  mealType === type
                    ? "bg-green-500 text-black"
                    : "bg-white/10 hover:bg-white/20"
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
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-green-400"
          />

          {/* FOOD GRID (FIXED RESPONSIVE + SIZE CONTROL) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">

            {filteredFoods.map(food => (
              <div
                key={food.id}
                onClick={() => addFood(food)}
                className="group cursor-pointer bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition"
              >

                {/* FIXED IMAGE HEIGHT */}
                <div className="h-24 sm:h-28 w-full overflow-hidden bg-black/20">
                  <img
                    src={food.imageUrl}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                </div>

                {/* TEXT */}
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">
                    {food.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {food.calories} kcal / 100g
                  </p>

                  <p className="text-xs text-green-400 opacity-0 group-hover:opacity-100 transition">
                    Tap to add →
                  </p>
                </div>

              </div>
            ))}

          </div>

          {/* MEAL BUILDER */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

            <h2 className="text-xl font-semibold mb-4">
              Meal Builder 🍽️
            </h2>

            {selectedFoods.length === 0 ? (
              <p className="text-gray-400">No foods selected</p>
            ) : (
              selectedFoods.map(food => (
                <div
                  key={food.id}
                  className="flex justify-between items-center py-3 border-b border-white/10"
                >

                  <div>
                    <p className="font-medium">{food.name}</p>
                    <p className="text-xs text-gray-400">
                      {(food.calories * food.quantity / 100).toFixed(0)} kcal
                    </p>
                  </div>

                  <div className="flex items-center gap-3">

                    <input
                      type="number"
                      value={food.quantity}
                      onChange={(e) => updateQty(food.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-center"
                    />

                    <button
                      onClick={() => removeFood(food.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>

          {/* TOTAL */}
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Total Calories: {totalCalories} kcal 🔥
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-xl font-semibold hover:scale-[1.02] transition shadow-lg"
          >
            Save {mealType}
          </button>

        </div>

      </div>
    </div>
  );
}