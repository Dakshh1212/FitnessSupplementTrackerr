import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getExercises,
  createSession,
  getSessions,
  deleteSession
} from "../services/workoutService";

interface WorkoutSet {
  reps: number;
  weight: number;
  duration: number;
}

interface Exercise {
  id: number;
  name: string;
  imageUrl: string;
  met?: number;
  sets: WorkoutSet[];
}

interface Session {
  id: number;
  date: string;
  totalCaloriesBurned: number;
}

export default function Workout() {

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalCalories, setTotalCalories] = useState<number>(0);

  const userWeight: number = 70;

  useEffect(() => {

    fetchExercises();
    fetchSessions();

  }, []);

  const fetchExercises = async (): Promise<void> => {

    try {

      const data = await getExercises();

      setExercises(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.log(err);

      setExercises([]);

    }

  };

  const fetchSessions = async (): Promise<void> => {

    try {

      const data = await getSessions();

      setSessions(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.log(err);

      setSessions([]);

    }

  };

  // ✅ SELECT
  const handleSelect = (
    ex: Exercise
  ): void => {

    const exists =
      selectedExercises.find(
        (e) => e.id === ex.id
      );

    if (exists) {

      setSelectedExercises(
        selectedExercises.filter(
          (e) => e.id !== ex.id
        )
      );

    } else {

      setSelectedExercises([
        ...selectedExercises,
        {
          ...ex,
          sets: [
            {
              reps: 10,
              weight: 0,
              duration: 1
            }
          ]
        }
      ]);

    }

  };

  // ✅ UPDATE SET
  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: string
  ): void => {

    const data = [
      ...selectedExercises
    ];

    data[exIndex]
      .sets[setIndex][field] =
      Number(value);

    setSelectedExercises(data);

  };

  // ✅ ADD SET
  const addSet = (
    exIndex: number
  ): void => {

    const data = [
      ...selectedExercises
    ];

    data[exIndex].sets.push({
      reps: 10,
      weight: 0,
      duration: 1
    });

    setSelectedExercises(data);

  };

  // ✅ REMOVE
  const removeExercise = (
    index: number
  ): void => {

    setSelectedExercises(
      selectedExercises.filter(
        (_, i) => i !== index
      )
    );

  };

  // 🔥 CALORIES
  useEffect(() => {

    let total = 0;

    selectedExercises.forEach(
      (ex) => {

        ex.sets.forEach((set) => {

          const duration =
            set.duration || 0;

          const met =
            ex.met || 5;

          total +=
            met *
            userWeight *
            (duration / 60);

        });

      }
    );

    setTotalCalories(
      Math.round(total)
    );

  }, [selectedExercises]);

  // ✅ SAVE
  const handleSave =
    async (): Promise<void> => {

      if (
        !selectedExercises.length
      ) {

        alert(
          "Select exercise ❌"
        );

        return;

      }

      try {

        await createSession({
          exercises:
            selectedExercises.map(
              (ex) => ({
                exerciseId: ex.id,
                sets: ex.sets
              })
            ),
          date: new Date()
        });

        alert(
          "Workout saved ✅"
        );

        setSelectedExercises([]);

        fetchSessions();

      } catch (err) {

        console.log(err);

        alert("Error ❌");

      }

    };

  // ✅ DELETE
  const handleDelete =
    async (
      id: number
    ): Promise<void> => {

      try {

        await deleteSession(id);

        fetchSessions();

      } catch (err) {

        console.log(err);

      }

    };

  return (

    <div className="flex">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-6 bg-[#020617] text-white min-h-screen space-y-6">

          {/* HEADER */}
          <div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Workout Builder 💪
            </h1>

            <p className="text-gray-400 text-sm">
              Build your perfect training session
            </p>

          </div>

          {/* EXERCISES */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

            {exercises.map((ex) => {

              const selected =
                selectedExercises.find(
                  (x) =>
                    x.id === ex.id
                );

              return (

                <div
                  key={ex.id}
                  onClick={() =>
                    handleSelect(ex)
                  }
                  className={`group relative bg-[#1e293b]/80 backdrop-blur-md rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]
                  ${
                    selected
                      ? "ring-2 ring-blue-400"
                      : "border border-white/5"
                  }`}
                >

                  {/* IMAGE */}
                  <div className="h-40 w-full overflow-hidden">

                    <img
                      src={ex.imageUrl}
                      alt={ex.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  </div>

                  {/* BADGE */}
                  {selected && (

                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow">
                      ✓
                    </div>

                  )}

                  {/* CONTENT */}
                  <div className="p-3 text-center">

                    <p className="text-sm font-semibold">
                      {ex.name}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      🔥 MET:
                      {ex.met || 5}
                    </p>

                  </div>

                </div>

              );

            })}

          </div>

          {/* SELECTED */}
          <div className="bg-[#1e293b] p-5 rounded-2xl space-y-4 shadow-lg">

            <h2 className="font-semibold text-lg">
              Selected Exercises
            </h2>

            {selectedExercises.length === 0 && (

              <p className="text-gray-400 text-sm">
                Select exercises
              </p>

            )}

            {selectedExercises.map(
              (ex, exIndex) => (

                <div
                  key={ex.id}
                  className="border-b border-gray-700 pb-4 space-y-3"
                >

                  <div className="flex justify-between items-center">

                    <h3 className="text-blue-400 font-semibold">
                      {ex.name}
                    </h3>

                    <button
                      onClick={() =>
                        removeExercise(
                          exIndex
                        )
                      }
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>

                  </div>

                  {ex.sets.map(
                    (
                      set,
                      setIndex
                    ) => (

                      <div
                        key={setIndex}
                        className="grid grid-cols-3 gap-2"
                      >

                        <input
                          type="number"
                          placeholder="Reps"
                          value={
                            set.reps
                          }
                          onChange={(
                            e
                          ) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              "reps",
                              e.target
                                .value
                            )
                          }
                          className="px-2 py-2 bg-[#020617] border border-gray-700 rounded-lg"
                        />

                        <input
                          type="number"
                          placeholder="Weight"
                          value={
                            set.weight
                          }
                          onChange={(
                            e
                          ) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              "weight",
                              e.target
                                .value
                            )
                          }
                          className="px-2 py-2 bg-[#020617] border border-gray-700 rounded-lg"
                        />

                        <input
                          type="number"
                          placeholder="Minutes"
                          value={
                            set.duration
                          }
                          onChange={(
                            e
                          ) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              "duration",
                              e.target
                                .value
                            )
                          }
                          className="px-2 py-2 bg-[#020617] border border-gray-700 rounded-lg"
                        />

                      </div>

                    )
                  )}

                  <button
                    onClick={() =>
                      addSet(exIndex)
                    }
                    className="text-sm text-cyan-400"
                  >
                    + Add Set
                  </button>

                </div>

              )
            )}

          </div>

          {/* CALORIES */}
          <div className="bg-[#1e293b] p-5 rounded-2xl flex justify-between items-center shadow-lg">

            <h2 className="text-lg font-semibold">
              Total Calories
            </h2>

            <span className="text-2xl text-blue-400 font-bold">
              {totalCalories} kcal 🔥
            </span>

          </div>

          {/* SAVE */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition"
          >
            Save Workout 🚀
          </button>

          {/* HISTORY */}
          <div className="bg-[#1e293b] p-5 rounded-2xl space-y-3 shadow-lg">

            <h2 className="font-semibold text-lg">
              Workout History 📊
            </h2>

            {sessions.length === 0 ? (

              <p className="text-gray-400 text-sm">
                No workouts yet
              </p>

            ) : (

              sessions.map(
                (s) => (

                  <div
                    key={s.id}
                    className="flex justify-between items-center border-b border-gray-700 pb-2"
                  >

                    <div>

                      <p>
                        {new Date(
                          s.date
                        ).toDateString()}
                      </p>

                      <p className="text-sm text-blue-400">
                        {s.totalCaloriesBurned}
                        kcal
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        handleDelete(
                          s.id
                        )
                      }
                      className="text-red-400 text-sm"
                    >
                      Delete
                    </button>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </div>

  );

}