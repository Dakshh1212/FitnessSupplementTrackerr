
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  getExercises,
  createSession,
  getSessions,
  deleteSession,
} from "../services/workoutService";

type Exercise = {
  id: number | string;
  name: string;
  met?: number;
  imageUrl?: string;
  image_url?: string;
};

type ExerciseSet = {
  reps: number;
  weight: number;
  duration: number;
};

type SelectedExercise = Exercise & {
  sets: ExerciseSet[];
};

type WorkoutSession = {
  id: number | string;
  date?: string;
  created_at?: string;
  totalCaloriesBurned?: number;
  totalDuration?: number;
};

const FALLBACK_IMAGE =
  "https://placehold.co/500x500/111827/9ca3af?text=Exercise";

const createDefaultSet = (): ExerciseSet => ({
  reps: 10,
  weight: 0,
  duration: 1,
});

const toNumber = (value: unknown, fallback = 0): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export default function Workout() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExercise[]
  >([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [userWeight, setUserWeight] = useState(70);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchExercises = useCallback(async () => {
    const data = await getExercises();
    setExercises(Array.isArray(data) ? data : []);
  }, []);

  const fetchSessions = useCallback(async () => {
    const data = await getSessions();
    setSessions(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      setLoading(true);
      setError("");

      try {
        const [exerciseResult, sessionResult] = await Promise.allSettled([
          getExercises(),
          getSessions(),
        ]);

        if (!active) return;

        if (exerciseResult.status === "fulfilled") {
          setExercises(
            Array.isArray(exerciseResult.value) ? exerciseResult.value : []
          );
        } else {
          setExercises([]);
          setError("Could not load exercises. Please retry.");
        }

        if (sessionResult.status === "fulfilled") {
          setSessions(
            Array.isArray(sessionResult.value) ? sessionResult.value : []
          );
        } else {
          setSessions([]);
          setError((previous) =>
            previous
              ? `${previous} Workout history could not be loaded.`
              : "Could not load workout history."
          );
        }

        // Use the cached profile weight if available.
        try {
          const cachedUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          );
          const weight = Number(cachedUser.weight);

          if (Number.isFinite(weight) && weight >= 20 && weight <= 400) {
            setUserWeight(weight);
          }
        } catch {
          // The default weight remains in use if no valid cached profile exists.
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, []);

  const handleSelect = (exercise: Exercise) => {
    setError("");
    setNotice("");

    setSelectedExercises((previous) => {
      const exists = previous.some(
        (item) => String(item.id) === String(exercise.id)
      );

      if (exists) {
        return previous.filter(
          (item) => String(item.id) !== String(exercise.id)
        );
      }

      return [
        ...previous,
        {
          ...exercise,
          sets: [createDefaultSet()],
        },
      ];
    });
  };

  const updateSet = (
    exerciseId: Exercise["id"],
    setIndex: number,
    field: keyof ExerciseSet,
    value: string
  ) => {
    const parsedValue = value === "" ? 0 : Number(value);

    setSelectedExercises((previous) =>
      previous.map((exercise) => {
        if (String(exercise.id) !== String(exerciseId)) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map((set, index) =>
            index === setIndex
              ? { ...set, [field]: parsedValue }
              : set
          ),
        };
      })
    );

    setError("");
    setNotice("");
  };

  const addSet = (exerciseId: Exercise["id"]) => {
    setSelectedExercises((previous) =>
      previous.map((exercise) =>
        String(exercise.id) === String(exerciseId)
          ? { ...exercise, sets: [...exercise.sets, createDefaultSet()] }
          : exercise
      )
    );
  };

  const removeSet = (
    exerciseId: Exercise["id"],
    setIndex: number
  ) => {
    setSelectedExercises((previous) =>
      previous.map((exercise) =>
        String(exercise.id) === String(exerciseId)
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, index) => index !== setIndex),
            }
          : exercise
      )
    );
  };

  const removeExercise = (exerciseId: Exercise["id"]) => {
    setSelectedExercises((previous) =>
      previous.filter(
        (exercise) => String(exercise.id) !== String(exerciseId)
      )
    );
  };

  // UI durations are minutes. Convert them to seconds for the backend.
  const estimatedCalories = useMemo(() => {
    return selectedExercises.reduce((total, exercise) => {
      const met = Math.max(0, toNumber(exercise.met, 5));

      return (
        total +
        exercise.sets.reduce((exerciseTotal, set) => {
          const minutes = Math.max(0, toNumber(set.duration));
          return exerciseTotal + (met * userWeight * minutes) / 60;
        }, 0)
      );
    }, 0);
  }, [selectedExercises, userWeight]);

  const totalDurationMinutes = useMemo(
    () =>
      selectedExercises.reduce(
        (total, exercise) =>
          total +
          exercise.sets.reduce(
            (sum, set) => sum + Math.max(0, toNumber(set.duration)),
            0
          ),
        0
      ),
    [selectedExercises]
  );

  const handleSave = async () => {
    if (saving) return;

    if (selectedExercises.length === 0) {
      setError("Select at least one exercise first.");
      setNotice("");
      return;
    }

    for (const exercise of selectedExercises) {
      if (!exercise.sets.length) {
        setError(`Add at least one set for ${exercise.name}.`);
        setNotice("");
        return;
      }

      for (const set of exercise.sets) {
        if (
          !Number.isFinite(set.reps) ||
          set.reps < 1 ||
          set.reps > 1000 ||
          !Number.isFinite(set.weight) ||
          set.weight < 0 ||
          set.weight > 1000 ||
          !Number.isFinite(set.duration) ||
          set.duration <= 0 ||
          set.duration > 1440
        ) {
          setError(
            `Check the reps, weight, and duration entered for ${exercise.name}.`
          );
          setNotice("");
          return;
        }
      }
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createSession({
        exercises: selectedExercises.map((exercise) => ({
          exerciseId: exercise.id,
          sets: exercise.sets.map((set) => ({
            ...set,
            // The UI accepts minutes; backend duration is in seconds.
            duration: Math.round(set.duration * 60),
          })),
        })),
        date: new Date().toISOString(),
      });

      setNotice("Workout saved successfully!");
      setSelectedExercises([]);
      await fetchSessions();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Could not save your workout. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: WorkoutSession["id"]) => {
    if (deletingId !== null) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      await deleteSession(id);
      await fetchSessions();
      setNotice("Workout deleted successfully.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Could not delete this workout. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "min-w-0 w-full rounded-lg border border-white/10 bg-black/20 px-2 py-2.5 text-sm text-white outline-none focus:border-blue-400/60";

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      <Sidebar />

      <div className="min-h-screen lg:ml-64">
        <Navbar />

        <main className="mx-auto max-w-7xl space-y-7 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <header>
            <p className="text-sm font-medium text-blue-400">
              TRAINING TRACKER
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Workout Builder 💪
            </h1>
            <p className="mt-2 text-sm text-gray-400 sm:text-base">
              Build your session, record your sets, and review your training.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Calorie estimates use your saved body weight ({userWeight} kg)
              and each exercise&apos;s MET value. Actual expenditure varies.
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

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Available exercises</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Choose the exercises you performed.
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {exercises.length} available
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-gray-400">
                Loading workouts...
              </div>
            ) : exercises.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-gray-300">No exercises are available.</p>
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      await fetchExercises();
                    } catch {
                      setError("Could not load exercises. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="mt-3 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
                {exercises.map((exercise) => {
                  const selected = selectedExercises.some(
                    (item) => String(item.id) === String(exercise.id)
                  );

                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => handleSelect(exercise)}
                      aria-pressed={selected}
                      className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 ${
                        selected
                          ? "border-blue-400/70 bg-blue-400/10 ring-1 ring-blue-400/40"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="aspect-square overflow-hidden bg-black/20">
                        <img
                          src={exercise.imageUrl || exercise.image_url || FALLBACK_IMAGE}
                          alt={exercise.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-semibold">
                          {exercise.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          MET: {toNumber(exercise.met, 5)}
                        </p>
                        <p className="mt-3 text-xs font-medium text-blue-400">
                          {selected ? "Selected ✓" : "+ Add exercise"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold">Your training session</h2>
              <p className="mt-1 text-sm text-gray-400">
                Duration is entered in minutes per set. Weight is in kilograms.
              </p>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-gray-400">
                Choose an exercise above to add sets.
              </div>
            ) : (
              selectedExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="space-y-4 rounded-xl border border-white/10 bg-black/10 p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-blue-300">
                      {exercise.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="shrink-0 text-sm text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                    >
                      <label className="text-xs text-gray-400">
                        Reps
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          step="1"
                          value={set.reps}
                          onChange={(event) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              "reps",
                              event.target.value
                            )
                          }
                          className={inputClass + " mt-1"}
                        />
                      </label>

                      <label className="text-xs text-gray-400">
                        Weight (kg)
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          step="0.5"
                          value={set.weight}
                          onChange={(event) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              "weight",
                              event.target.value
                            )
                          }
                          className={inputClass + " mt-1"}
                        />
                      </label>

                      <label className="text-xs text-gray-400">
                        Minutes
                        <input
                          type="number"
                          min="0.1"
                          max="1440"
                          step="0.5"
                          value={set.duration}
                          onChange={(event) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              "duration",
                              event.target.value
                            )
                          }
                          className={inputClass + " mt-1"}
                        />
                      </label>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeSet(exercise.id, setIndex)}
                          disabled={exercise.sets.length === 1}
                          className="w-full rounded-lg border border-white/10 px-2 py-2.5 text-xs text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Remove set
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSet(exercise.id)}
                    className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    + Add set
                  </button>
                </div>
              ))
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">Estimated calories</p>
              <p className="mt-2 text-2xl font-bold text-blue-300">
                {Math.round(estimatedCalories)} kcal
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">Total exercises</p>
              <p className="mt-2 text-2xl font-bold">
                {selectedExercises.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">Combined set duration</p>
              <p className="mt-2 text-2xl font-bold">
                {Math.round(totalDurationMinutes * 10) / 10} min
              </p>
            </div>
          </section>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || selectedExercises.length === 0}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3.5 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving workout..." : "Save workout 🚀"}
          </button>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Workout history 📊</h2>
              <p className="mt-1 text-sm text-gray-400">
                Your previously saved sessions.
              </p>
            </div>

            {sessions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-gray-400">
                No workouts recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const sessionDate =
                    session.date || session.created_at;

                  const parsedDate = sessionDate
                    ? new Date(sessionDate)
                    : null;

                  const dateLabel =
                    parsedDate && !Number.isNaN(parsedDate.getTime())
                      ? parsedDate.toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date unavailable";

                  return (
                    <div
                      key={session.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 p-4"
                    >
                      <div>
                        <p className="font-medium">{dateLabel}</p>
                        <p className="mt-1 text-sm text-blue-300">
                          {Math.round(
                            toNumber(session.totalCaloriesBurned)
                          )}{" "}
                          kcal burned
                        </p>
                        {session.totalDuration != null && (
                          <p className="mt-1 text-xs text-gray-500">
                            {session.totalDuration} seconds recorded
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(session.id)}
                        disabled={deletingId !== null}
                        className="rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === session.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
