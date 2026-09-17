import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getExercises,
  createSession,
  getSessions,
  deleteSession
} from "../services/workoutService";

export default function Workout() {

  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);

  const userWeight = 70;

  useEffect(() => {
    fetchExercises();
    fetchSessions();
  }, []);

  const fetchExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setExercises([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setSessions([]);
    }
  };

  /* ================= SELECT ================= */
  const handleSelect = (ex) => {
    const exists = selectedExercises.find(e => e.id === ex.id);

    if (exists) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== ex.id));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        {
          ...ex,
          sets: [{ reps: 10, weight: 0, duration: 1 }]
        }
      ]);
    }
  };

  /* ================= UPDATE SET ================= */
  const updateSet = (exIndex, setIndex, field, value) => {
    const data = [...selectedExercises];
    data[exIndex].sets[setIndex][field] = Number(value);
    setSelectedExercises(data);
  };

  /* ================= ADD SET ================= */
  const addSet = (exIndex) => {
    const data = [...selectedExercises];
    data[exIndex].sets.push({
      reps: 10,
      weight: 0,
      duration: 1
    });
    setSelectedExercises(data);
  };

  /* ================= REMOVE ================= */
  const removeExercise = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  /* ================= CALORIES ================= */
  useEffect(() => {
    let total = 0;

    selectedExercises.forEach(ex => {
      ex.sets.forEach(set => {
        const duration = set.duration || 0;
        const met = ex.met || 5;

        total += met * userWeight * (duration / 60);
      });
    });

    setTotalCalories(Math.round(total));
  }, [selectedExercises]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!selectedExercises.length) {
      alert("Select exercise ❌");
      return;
    }

    try {
      await createSession({
        exercises: selectedExercises.map(ex => ({
          exerciseId: ex.id,
          sets: ex.sets
        })),
        date: new Date()
      });

      alert("Workout saved ✅");
      setSelectedExercises([]);
      fetchSessions();

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSession(id);
      fetchSessions();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Workout Builder 💪
            </h1>
            <p className="text-gray-400">
              Build your perfect training session
            </p>
          </div>

          {/* EXERCISES GRID (APPLE FIXED UI) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

            {exercises.map(ex => {

              const selected = selectedExercises.find(e => e.id === ex.id);

              return (
                <div
                  key={ex.id}
                  onClick={() => handleSelect(ex)}
                  className={`group cursor-pointer bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition hover:bg-white/10 ${
                    selected ? "ring-2 ring-blue-400" : ""
                  }`}
                >

                  {/* IMAGE FIX */}
                  <div className="aspect-square bg-black/20 overflow-hidden">
                    <img
                      src={ex.imageUrl}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>

                  <div className="p-3 text-center">

                    <p className="text-sm font-semibold truncate">
                      {ex.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      MET: {ex.met || 5}
                    </p>

                    {selected && (
                      <p className="text-xs text-blue-400 mt-1">
                        Selected ✓
                      </p>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

          {/* SELECTED SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">

            <h2 className="text-xl font-semibold">
              Selected Exercises
            </h2>

            {selectedExercises.length === 0 ? (
              <p className="text-gray-400">Select exercises</p>
            ) : (
              selectedExercises.map((ex, exIndex) => (
                <div key={ex.id} className="border-b border-white/10 pb-4">

                  <div className="flex justify-between mb-2">
                    <p className="text-blue-400 font-semibold">{ex.name}</p>

                    <button
                      onClick={() => removeExercise(exIndex)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  {ex.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-3 gap-2 mb-2">

                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(exIndex, setIndex, "reps", e.target.value)
                        }
                        className="px-2 py-2 bg-black/30 border border-white/10 rounded-lg"
                      />

                      <input
                        type="number"
                        placeholder="Weight"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(exIndex, setIndex, "weight", e.target.value)
                        }
                        className="px-2 py-2 bg-black/30 border border-white/10 rounded-lg"
                      />

                      <input
                        type="number"
                        placeholder="Min"
                        value={set.duration}
                        onChange={(e) =>
                          updateSet(exIndex, setIndex, "duration", e.target.value)
                        }
                        className="px-2 py-2 bg-black/30 border border-white/10 rounded-lg"
                      />

                    </div>
                  ))}

                  <button
                    onClick={() => addSet(exIndex)}
                    className="text-cyan-400 text-sm"
                  >
                    + Add Set
                  </button>

                </div>
              ))
            )}

          </div>

          {/* CALORIES */}
          <div className="flex justify-between bg-white/5 border border-white/10 rounded-2xl p-5">

            <h2 className="text-lg font-semibold">Total Calories</h2>

            <span className="text-2xl text-blue-400 font-bold">
              {totalCalories} kcal 🔥
            </span>

          </div>

          {/* SAVE */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold hover:scale-[1.02] transition"
          >
            Save Workout 🚀
          </button>

          {/* HISTORY */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

            <h2 className="text-lg font-semibold mb-3">
              Workout History 📊
            </h2>

            {sessions.length === 0 ? (
              <p className="text-gray-400">No workouts yet</p>
            ) : (
              sessions.map(s => (
                <div key={s.id} className="flex justify-between border-b border-white/10 py-2">

                  <div>
                    <p>{new Date(s.date).toDateString()}</p>
                    <p className="text-blue-400 text-sm">
                      {s.totalCaloriesBurned} kcal
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-400 text-sm"
                  >
                    Delete
                  </button>

                </div>
              ))
            )}

          </div>

        </div>
      </div>
    </div>
  );
}