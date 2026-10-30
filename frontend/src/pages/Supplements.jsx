
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import {
  getSupplements,
  createPlan,
  getPlans,
  deletePlan,
  logSupplementIntake,
} from "../services/supplementService";

const formatPrice = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN")}`;

const formatNumber = (value) =>
  Number.isFinite(Number(value))
    ? Math.round(Number(value)).toLocaleString("en-IN")
    : "—";

const getImage = (item) =>
  item.imageUrl || item.image_url || item.image || "";

function getGuidance(assessment) {
  if (!assessment?.profileComplete) {
    return {
      title: "Complete your fitness profile",
      description:
        "Add your age, height, weight, activity level and goal to calculate personalized targets.",
      items: [
        "Your profile is used to estimate calorie and protein needs.",
        "BMI alone cannot determine which supplements you need.",
      ],
    };
  }

  const gap = Math.max(
    0,
    Number(assessment.proteinGoal || 0) -
      Number(assessment.proteinConsumed || 0)
  );
  const goal = String(assessment.goal || "").toLowerCase();
  const items = [];

  if (gap > 20) {
    items.push(
      `Your logged protein is about ${Math.round(gap)} g below your estimated target. Log all meals first, then consider protein-rich foods.`
    );
    items.push(
      "Protein powder may be convenient if food alone does not meet your needs; it is not compulsory."
    );
  } else if (gap > 0) {
    items.push(
      `Your logged protein is about ${Math.round(gap)} g below your estimated daily target.`
    );
  } else {
    items.push(
      "Your logged protein has reached the estimated daily target. A protein supplement may not be necessary today."
    );
  }

  if (goal === "muscle_gain") {
    items.push(
      "Prioritize progressive strength training, adequate food, protein and recovery."
    );
  } else if (goal === "fat_loss") {
    items.push(
      "For fat loss, prioritize a sustainable calorie intake and protein-rich meals. Supplements do not directly cause fat loss."
    );
  } else {
    items.push(
      "For maintenance, aim for consistent nutrition, activity and recovery."
    );
  }

  items.push(
    "Check supplement suitability, medical conditions and medicine interactions with a qualified professional."
  );

  return {
    title: "Your personalized guidance",
    description:
      "These suggestions use your profile and today's logged nutrition. Targets are estimates, not medical prescriptions.",
    items,
  };
}

export default function SupplementPlan() {
  const [supplements, setSupplements] = useState([]);
  const [selected, setSelected] = useState([]);
  const [plans, setPlans] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [assessmentError, setAssessmentError] = useState("");
  const [planName, setPlanName] = useState("");
  const [goal, setGoal] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [intakeSupplementId, setIntakeSupplementId] = useState("");
  const [intakeServings, setIntakeServings] = useState("1");
  const [intakeTiming, setIntakeTiming] = useState("morning");
  const [loggingIntake, setLoggingIntake] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setAssessmentError("");

    const results = await Promise.allSettled([
      getSupplements(),
      getPlans(),
      API.get("/goals/daily"),
    ]);

    if (results[0].status === "fulfilled") {
      const value = results[0].value;
      setSupplements(Array.isArray(value) ? value : []);
    } else {
      setError(
        results[0].reason?.response?.data?.message ||
          "Unable to load supplements."
      );
    }

    if (results[1].status === "fulfilled") {
      const value = results[1].value;
      setPlans(Array.isArray(value) ? value : []);
    } else {
      setError(
        (previous) =>
          previous ||
          results[1].reason?.response?.data?.message ||
          "Unable to load saved plans."
      );
    }

    if (results[2].status === "fulfilled") {
      setAssessment(results[2].value?.data?.data || null);
    } else {
      setAssessment(null);
      setAssessmentError(
        results[2].reason?.response?.data?.message ||
          "Personalized guidance is temporarily unavailable."
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(supplements.map((item) => item.category).filter(Boolean)),
    ],
    [supplements]
  );

  const filteredSupplements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return supplements.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.name || "").toLowerCase().includes(query) ||
        String(item.category || "").toLowerCase().includes(query);

      return (
        matchesSearch &&
        (category === "All" || item.category === category)
      );
    });
  }, [supplements, search, category]);

  const totalCost = selected.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );

  const guidance = getGuidance(assessment);

  const toggleSupplement = (supplement) => {
    setNotice("");

    setSelected((current) => {
      if (current.some((item) => String(item.id) === String(supplement.id))) {
        return current.filter(
          (item) => String(item.id) !== String(supplement.id)
        );
      }

      return [
        ...current,
        {
          ...supplement,
          dosage: { amount: 1, unit: "scoop" },
          frequency: "daily",
          timing: ["morning"],
        },
      ];
    });
  };

  const updateSelected = (id, field, value) => {
    setSelected((current) =>
      current.map((item) => {
        if (String(item.id) !== String(id)) return item;

        if (field === "amount" || field === "unit") {
          return {
            ...item,
            dosage: { ...item.dosage, [field]: value },
          };
        }

        if (field === "frequency") {
          return { ...item, frequency: value };
        }

        if (field === "timing") {
          return { ...item, timing: [value] };
        }

        return item;
      })
    );
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setNotice("");
    setError("");

    if (!planName.trim()) {
      setError("Enter a name for your plan.");
      return;
    }

    if (selected.length === 0) {
      setError("Select at least one supplement.");
      return;
    }

    if (
      selected.some(
        (item) =>
          !Number.isFinite(Number(item.dosage.amount)) ||
          Number(item.dosage.amount) <= 0
      )
    ) {
      setError("Every dosage must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      await createPlan({
        name: planName.trim(),
        goal: goal.trim(),
        supplements: selected.map((item) => ({
          supplement: item.id,
          dosage: {
            amount: Number(item.dosage.amount),
            unit: item.dosage.unit,
          },
          frequency: item.frequency,
          timing: Array.isArray(item.timing)
            ? item.timing[0]
            : item.timing || "morning",
        })),
      });

      setPlanName("");
      setGoal("");
      setSelected([]);
      setNotice("Your supplement plan was saved successfully.");

      const updatedPlans = await getPlans();
      setPlans(Array.isArray(updatedPlans) ? updatedPlans : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to save the plan. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogIntake = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const supplementId = Number(intakeSupplementId);
    const servings = Number(intakeServings);

    if (
      !supplementId ||
      !supplements.some((item) => Number(item.id) === supplementId)
    ) {
      setError("Please select a valid supplement.");
      return;
    }

    if (!Number.isFinite(servings) || servings <= 0) {
      setError("Servings must be greater than zero.");
      return;
    }

    setLoggingIntake(true);

    try {
      await logSupplementIntake({
        supplementId,
        servings,
        timing: intakeTiming,
      });

      const response = await API.get("/goals/daily");
      setAssessment(response?.data?.data || null);
      setIntakeServings("1");
      setNotice(
        "Supplement intake logged! Your nutrition totals have been refreshed."
      );

      window.dispatchEvent(new Event("dataUpdated"));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to log supplement intake. Please try again."
      );
    } finally {
      setLoggingIntake(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    const confirmed = window.confirm(
      `Delete the supplement plan "${plan.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingPlanId(plan.id);

    try {
      await deletePlan(plan.id);

      setPlans((current) =>
        current.filter((item) => Number(item.id) !== Number(plan.id))
      );

      setNotice(`"${plan.name}" was deleted successfully.`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete the supplement plan. Please try again."
      );
    } finally {
      setDeletingPlanId(null);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-3 text-sm text-white outline-none focus:border-emerald-400/60";

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100">
      <Sidebar />

      <div className="min-h-screen min-w-0 lg:ml-64">
        <Navbar />

        <main className="min-w-0">
          <div className="mx-auto max-w-[1500px] space-y-8 p-4 sm:p-6 lg:p-9">
            <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  PERSONALIZED NUTRITION TOOLKIT
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Supplement <span className="text-emerald-400">planner.</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Understand your nutrition needs before choosing supplements.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
                <p className="text-xs text-slate-400">Your stack</p>
                <p className="text-xl font-bold">{selected.length} selected</p>
              </div>
            </header>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-400/20 bg-rose-400/[0.08] p-4 text-sm text-rose-300"
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4 text-sm text-emerald-300"
              >
                {notice}
              </div>
            )}

            {/* Log actual supplement intake */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#111a28] p-5 sm:p-7">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Daily nutrition tracker
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Log supplement intake
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Record supplements you actually consumed. Your logged protein
                  and calories will be included in your daily nutrition totals.
                </p>
              </div>

              <form
                onSubmit={handleLogIntake}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label className="text-sm text-slate-300">
                  Supplement
                  <select
                    required
                    value={intakeSupplementId}
                    onChange={(event) =>
                      setIntakeSupplementId(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select a supplement</option>
                    {supplements.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-slate-300">
                  Servings consumed
                  <input
                    required
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={intakeServings}
                    onChange={(event) =>
                      setIntakeServings(event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label className="text-sm text-slate-300">
                  When did you take it?
                  <select
                    value={intakeTiming}
                    onChange={(event) => setIntakeTiming(event.target.value)}
                    className={inputClass}
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                    <option value="pre_workout">Pre-workout</option>
                    <option value="post_workout">Post-workout</option>
                    <option value="with_meal">With meal</option>
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={
                      loggingIntake || loading || supplements.length === 0
                    }
                    className="w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-[#07130e] hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {loggingIntake ? "Logging intake..." : "Log intake →"}
                  </button>
                </div>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Calories consumed"
                  value={`${formatNumber(assessment?.consumed)} kcal`}
                  detail={`${formatNumber(assessment?.caloriesRemaining)} kcal remaining`}
                />
                <Metric
                  label="Protein consumed"
                  value={`${formatNumber(assessment?.proteinConsumed)} g`}
                  detail={`${formatNumber(assessment?.proteinRemaining)} g remaining`}
                />
                <Metric
                  label="Supplement calories"
                  value={`${formatNumber(assessment?.supplementCalories)} kcal`}
                  detail={`${formatNumber(assessment?.supplementProtein)} g protein from supplements`}
                />
              </div>
            </section>

            {/* Personalized assessment */}
            <section className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.09] to-[#111a28]">
              <div className="p-5 sm:p-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Your profile analysis
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {guidance.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                      {guidance.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchData}
                    disabled={loading}
                    className="shrink-0 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Refresh assessment"}
                  </button>
                </div>

                {assessmentError && (
                  <p role="alert" className="mt-4 text-sm text-amber-300">
                    {assessmentError}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    label="BMI"
                    value={assessment?.bmi ?? "—"}
                    detail={assessment?.bmiCategory || "Height and weight needed"}
                  />
                  <Metric
                    label="Daily calorie estimate"
                    value={
                      assessment?.profileComplete
                        ? `${formatNumber(assessment.intakeGoal)} kcal`
                        : "—"
                    }
                    detail="Estimated target, not a medical prescription"
                  />
                  <Metric
                    label="Protein target"
                    value={
                      assessment?.profileComplete
                        ? `${formatNumber(assessment.proteinGoal)} g`
                        : "—"
                    }
                    detail="Estimated daily target"
                  />
                  <Metric
                    label="Protein logged today"
                    value={`${formatNumber(assessment?.proteinConsumed)} g`}
                    detail={
                      assessment?.profileComplete
                        ? `${formatNumber(assessment.proteinRemaining)} g remaining`
                        : "Log meals to track intake"
                    }
                  />
                </div>

                <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#080d16]/60 p-4">
                  <h3 className="font-semibold">Your next steps</h3>
                  <ul className="mt-3 space-y-2">
                    {guidance.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm leading-6 text-slate-300"
                      >
                        <span className="mt-0.5 text-emerald-300">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    BMI is a screening measure, not a body-fat measurement or
                    supplement selector. Recommendations are educational.
                    Consult a qualified professional about medical conditions,
                    medication interactions, or uncertainty about supplement
                    safety.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric
                label="Selected supplements"
                value={selected.length}
                detail="Items in this plan"
              />
              <Metric
                label="Combined listed price"
                value={formatPrice(totalCost)}
                detail="Listed prices, not daily cost"
              />
              <Metric
                label="Saved plans"
                value={plans.length}
                detail="Your existing routines"
              />
            </section>

            {/* Supplement library */}
            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-xl font-bold">Explore supplements</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Learn about products and select items for your own tracker.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="search"
                    aria-label="Search supplements"
                    placeholder="Search supplements..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#111a28] px-4 py-3 text-sm outline-none focus:border-emerald-400/60 sm:w-56"
                  />
                  <select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="rounded-xl border border-white/10 bg-[#111a28] px-4 py-3 text-sm outline-none focus:border-emerald-400/60"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading && supplements.length === 0 ? (
                <p className="rounded-2xl border border-white/[0.08] bg-[#111a28] p-10 text-center text-slate-400">
                  Loading supplements...
                </p>
              ) : filteredSupplements.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">
                  No supplements found. Try another search.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredSupplements.map((item) => {
                    const isSelected = selected.some(
                      (chosen) => String(chosen.id) === String(item.id)
                    );
                    const imageSrc = getImage(item);

                    return (
                      <article
                        key={item.id}
                        className={`overflow-hidden rounded-2xl border bg-[#111a28] transition hover:border-emerald-400/30 ${
                          isSelected
                            ? "border-emerald-400/60"
                            : "border-white/[0.08]"
                        }`}
                      >
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleSupplement(item)}
                          className="block w-full text-left"
                        >
                          <div className="relative flex h-36 items-center justify-center overflow-hidden bg-white p-3 sm:h-40">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={item.name || "Supplement"}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="text-5xl text-slate-400">
                                ◈
                              </span>
                            )}
                            <span
                              className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isSelected
                                  ? "bg-emerald-400 text-[#07130e]"
                                  : "bg-black/70 text-white"
                              }`}
                            >
                              {isSelected ? "✓ Added" : "+ Add to plan"}
                            </span>
                          </div>

                          <div className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                              {item.category || "Supplement"}
                            </p>
                            <h3 className="mt-2 truncate font-semibold">
                              {item.name}
                            </h3>
                            <p className="mt-2 text-lg font-bold">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </button>

                        {(item.buyLink || item.buy_link) && (
                          <div className="px-4 pb-4">
                            <a
                              href={item.buyLink || item.buy_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                            >
                              View product ↗
                            </a>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Plan builder and saved plans */}
            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <form
                onSubmit={handleCreate}
                className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#111a28] p-5 sm:p-7"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Custom routine
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">Build your plan</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Configure the items you selected above.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-slate-300">
                    Plan name *
                    <input
                      required
                      maxLength={100}
                      value={planName}
                      onChange={(event) => setPlanName(event.target.value)}
                      placeholder="e.g. Daily essentials"
                      className={inputClass}
                    />
                  </label>

                  <label className="block text-sm text-slate-300">
                    Primary goal
                    <input
                      maxLength={150}
                      value={goal}
                      onChange={(event) => setGoal(event.target.value)}
                      placeholder="e.g. Recovery and strength"
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">
                    Your stack ({selected.length})
                  </h3>

                  {selected.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
                      Select a supplement from the library to configure it here.
                    </div>
                  ) : (
                    selected.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/[0.08] bg-[#080d16]/70 p-4"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatPrice(item.price)} listed price
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSupplement(item)}
                            className="text-xs text-rose-300 hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <label className="text-xs text-slate-400">
                            Amount
                            <input
                              type="number"
                              min="0.1"
                              max="100"
                              step="0.1"
                              value={item.dosage.amount}
                              onChange={(event) =>
                                updateSelected(
                                  item.id,
                                  "amount",
                                  event.target.value
                                )
                              }
                              className={inputClass}
                            />
                          </label>

                          <label className="text-xs text-slate-400">
                            Unit
                            <select
                              value={item.dosage.unit}
                              onChange={(event) =>
                                updateSelected(
                                  item.id,
                                  "unit",
                                  event.target.value
                                )
                              }
                              className={inputClass}
                            >
                              {[
                                "scoop",
                                "g",
                                "mg",
                                "capsule",
                                "tablet",
                                "serving",
                              ].map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="text-xs text-slate-400">
                            Frequency
                            <select
                              value={item.frequency}
                              onChange={(event) =>
                                updateSelected(
                                  item.id,
                                  "frequency",
                                  event.target.value
                                )
                              }
                              className={inputClass}
                            >
                              <option value="daily">Daily</option>
                              <option value="twice_daily">Twice daily</option>
                              <option value="as_needed">As needed</option>
                              <option value="training_days">
                                Training days
                              </option>
                            </select>
                          </label>

                          <label className="text-xs text-slate-400">
                            Timing
                            <select
                              value={item.timing[0] || "morning"}
                              onChange={(event) =>
                                updateSelected(
                                  item.id,
                                  "timing",
                                  event.target.value
                                )
                              }
                              className={inputClass}
                            >
                              <option value="morning">Morning</option>
                              <option value="pre_workout">Pre-workout</option>
                              <option value="post_workout">Post-workout</option>
                              <option value="evening">Evening</option>
                              <option value="with_meal">With meal</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-slate-400">
                      Combined listed price
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-300">
                      {formatPrice(totalCost)}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-[#07130e] transition hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {saving ? "Saving plan..." : "Save supplement plan →"}
                  </button>
                </div>
              </form>

              <aside className="h-fit rounded-2xl border border-white/[0.08] bg-[#111a28] p-5 sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Saved plans</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Your existing routines
                    </p>
                  </div>
                  <span className="rounded-xl bg-white/[0.06] px-3 py-2 text-sm font-semibold">
                    {plans.length}
                  </span>
                </div>

                {loading ? (
                  <p className="text-sm text-slate-400">
                    Loading saved plans...
                  </p>
                ) : plans.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
                    <p className="font-medium">No saved plans yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Create your first routine using the builder.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <article
                        key={plan.id}
                        className="rounded-xl border border-white/[0.08] bg-[#080d16]/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold">
                              {plan.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {plan.goal || "Personal routine"}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              {Array.isArray(plan.supplements)
                                ? `${plan.supplements.length} supplement item(s)`
                                : "Saved supplement routine"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeletePlan(plan)}
                            disabled={deletingPlanId !== null}
                            aria-label={`Delete ${plan.name}`}
                            className="shrink-0 rounded-lg border border-rose-400/20 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {Number(deletingPlanId) === Number(plan.id)
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={fetchData}
                  disabled={loading}
                  className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:border-emerald-400/30 hover:text-emerald-300 disabled:opacity-50"
                >
                  Refresh data
                </button>
              </aside>
            </section>

            <p className="pb-4 text-center text-xs leading-5 text-slate-500">
              Guidance is educational, not medical advice. Supplement
              suitability depends on individual health, medicines and dietary
              needs.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080d16]/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}
