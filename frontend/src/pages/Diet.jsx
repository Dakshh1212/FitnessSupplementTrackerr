
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const FALLBACK_IMAGE =
  "https://placehold.co/600x400/111827/9ca3af?text=Food";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export default function Diet() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    const fetchFoods = async () => {
      try {
        setLoadingFoods(true);
        setError("");

        const response = await API.get("/diet/foods");
        const result = response?.data?.data;

        if (!Array.isArray(result)) {
          throw new Error("The server returned an invalid food list.");
        }

        if (active) {
          setFoods(result);
        }
      } catch (err) {
        if (active) {
          setFoods([]);
          setError(
            err?.response?.data?.message ||
              "Could not load foods. Please try again."
          );
        }
      } finally {
        if (active) setLoadingFoods(false);
      }
    };

    fetchFoods();

    return () => {
      active = false;
    };
  }, []);

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    return foods.filter((food) =>
      String(food.name || "").toLowerCase().includes(query)
    );
  }, [foods, search]);

  const nutritionTotals = useMemo(() => {
    return selectedFoods.reduce(
      (totals, food) => {
        const multiplier = food.quantity / 100;

        totals.calories += toNumber(food.calories) * multiplier;
        totals.protein += toNumber(food.protein) * multiplier;
        totals.carbs += toNumber(food.carbs) * multiplier;
        totals.fats += toNumber(food.fats) * multiplier;

        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [selectedFoods]);

  const addFood = (food) => {
    const id = food.id ?? food.food_id;

    if (id == null) {
      setNotice("This food has no valid ID and cannot be added.");
      return;
    }

    setNotice("");
    setError("");

    setSelectedFoods((previous) => {
      if (previous.some((item) => String(item.id) === String(id))) {
        setNotice(`${food.name} is already in your meal.`);
        return previous;
      }

      return [
        ...previous,
        {
          id,
          name: food.name,
          calories: toNumber(food.calories),
          protein: toNumber(food.protein),
          carbs: toNumber(food.carbs),
          fats: toNumber(food.fats),
          imageUrl: food.imageUrl || food.image_url || "",
          quantity: 100,
        },
      ];
    });
  };

  const removeFood = (id) => {
    setSelectedFoods((previous) =>
      previous.filter((food) => String(food.id) !== String(id))
    );
  };

  const updateQty = (id, value) => {
    // Keep the input editable while typing; validate on save.
    setSelectedFoods((previous) =>
      previous.map((food) =>
        String(food.id) === String(id)
          ? { ...food, quantity: value === "" ? "" : value }
          : food
      )
    );
  };

  const handleSave = async () => {
    if (saving) return;

    if (selectedFoods.length === 0) {
      setError("Add at least one food before saving.");
      setNotice("");
      return;
    }

    const invalidFood = selectedFoods.find((food) => {
      const quantity = Number(food.quantity);
      return (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > 10000
      );
    });

    if (invalidFood) {
      setError(
        `Enter a quantity between 1 and 10,000 grams for ${invalidFood.name}.`
      );
      setNotice("");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    let savedCount = 0;

    try {
      for (const food of selectedFoods) {
        await API.post("/diet/entries", {
          food_id: food.id,
          quantity: Number(food.quantity),
          mealType,
        });

        savedCount += 1;
      }

      setNotice(
        `Successfully saved ${savedCount} food item${
          savedCount === 1 ? "" : "s"
        } for ${mealType}.`
      );
      setSelectedFoods([]);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";

      if (savedCount > 0) {
        setError(
          `${savedCount} item(s) were saved, but the next item failed. ` +
            `Please check your diet entries before retrying. Details: ${message}`
        );

        // Remove successfully saved items so they aren't accidentally
        // submitted again when the user retries.
        setSelectedFoods((previous) =>
          previous.filter(
            (food) =>
              !selectedFoods
                .slice(0, savedCount)
                .some((saved) => String(saved.id) === String(food.id))
          )
        );
      } else {
        setError(`Could not save your meal. ${message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      <Sidebar />

      <div className="min-h-screen lg:ml-64">
        <Navbar />

        <main className="mx-auto max-w-7xl space-y-7 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <header>
            <p className="text-sm font-medium text-emerald-400">
              NUTRITION TRACKER
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Diet Tracker <span aria-hidden="true">🥗</span>
            </h1>

            <p className="mt-2 text-sm text-gray-400 sm:text-base">
              Build your meal, adjust portions, and track your nutrition.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
            >
              {notice}
            </div>
          )}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Choose your meal</h2>
              <p className="mt-1 text-sm text-gray-400">
                Select the meal category for the foods you add.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  aria-pressed={mealType === type}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition ${
                    mealType === type
                      ? "bg-emerald-400 text-gray-950"
                      : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Available foods</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {filteredFoods.length} food item(s) found
                </p>
              </div>

              <label className="block w-full sm:max-w-sm">
                <span className="sr-only">Search foods</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search foods..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-emerald-400/60"
                />
              </label>
            </div>

            {loadingFoods ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
                Loading foods...
              </div>
            ) : error && foods.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-gray-300">Your food list is unavailable.</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 rounded-lg bg-emerald-400 px-4 py-2 font-medium text-gray-950"
                >
                  Retry
                </button>
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-gray-400">
                No matching foods found. Try another search.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
                {filteredFoods.map((food) => {
                  const id = food.id ?? food.food_id;
                  const isSelected = selectedFoods.some(
                    (item) => String(item.id) === String(id)
                  );

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => addFood(food)}
                      aria-pressed={isSelected}
                      className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-emerald-400/60 bg-emerald-400/10"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="h-28 overflow-hidden bg-black/20 sm:h-36">
                        <img
                          src={food.imageUrl || food.image_url || FALLBACK_IMAGE}
                          alt={food.name || "Food"}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-3 sm:p-4">
                        <p className="truncate text-sm font-semibold">
                          {food.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {toNumber(food.calories)} kcal / 100 g
                        </p>
                        <p className="mt-3 text-xs font-medium text-emerald-400">
                          {isSelected ? "Added ✓" : "+ Add food"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Meal builder</h2>
                <p className="mt-1 text-sm capitalize text-gray-400">
                  {mealType} · {selectedFoods.length} item(s)
                </p>
              </div>

              {selectedFoods.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFoods([])}
                  disabled={saving}
                  className="text-sm text-red-300 transition hover:text-red-200 disabled:opacity-50"
                >
                  Clear meal
                </button>
              )}
            </div>

            {selectedFoods.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                <p className="text-3xl" aria-hidden="true">🍽️</p>
                <p className="mt-3 font-medium text-gray-300">
                  Your meal is empty
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Choose foods above to start building your meal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedFoods.map((food) => {
                  const calories =
                    (toNumber(food.calories) * toNumber(food.quantity)) / 100;

                  return (
                    <div
                      key={food.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/10 p-3 sm:p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{food.name}</p>
                        <p className="mt-1 text-sm text-emerald-400">
                          {Math.round(calories)} kcal
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Grams</span>
                          <input
                            type="number"
                            min="1"
                            max="10000"
                            step="1"
                            value={food.quantity}
                            onChange={(event) =>
                              updateQty(food.id, event.target.value)
                            }
                            disabled={saving}
                            aria-label={`${food.name} quantity in grams`}
                            className="w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center text-sm text-white outline-none focus:border-emerald-400/60 disabled:opacity-50"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => removeFood(food.id)}
                          disabled={saving}
                          aria-label={`Remove ${food.name}`}
                          className="rounded-lg px-3 py-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">Total meal calories</p>
                <p className="mt-1 text-3xl font-bold text-emerald-300">
                  {Math.round(nutritionTotals.calories).toLocaleString()}{" "}
                  <span className="text-base font-medium text-gray-400">
                    kcal
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center sm:gap-6">
                {[
                  ["Protein", nutritionTotals.protein],
                  ["Carbs", nutritionTotals.carbs],
                  ["Fats", nutritionTotals.fats],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-200">
                      {Math.round(value)} g
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Macro totals depend on the nutrition data returned for each food.
            </p>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || selectedFoods.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-semibold text-gray-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving meal..." : `Save ${mealType}`}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
