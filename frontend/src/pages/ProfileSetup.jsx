import { useState } from "react";
import API from "../services/api";

export default function ProfileSetup({ onComplete }) {

  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activityLevel: "moderately_active",
    goal: "fat_loss"
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const handleSubmit = async () => {

    try {

      setLoading(true);

      const res = await API.put(
        "/users/profile",
        form
      );

      // ✅ UPDATE LOCAL USER
      if (res.data.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );

      }

      alert("Profile completed ✅");

      if (onComplete) {
        onComplete();
      }

    } catch (err) {

      console.log(err);

      alert(
        err?.response?.data?.message ||
        "Something went wrong ❌"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">

      <div className="bg-[#1e293b] p-6 rounded-2xl w-[350px] space-y-4 shadow-xl">

        <div>

          <h2 className="text-2xl font-bold">
            Complete Profile 👤
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Setup your fitness profile
          </p>

        </div>

        {/* AGE */}
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) =>
            handleChange(
              "age",
              e.target.value
            )
          }
          className="input"
        />

        {/* WEIGHT */}
        <input
          type="number"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={(e) =>
            handleChange(
              "weight",
              e.target.value
            )
          }
          className="input"
        />

        {/* HEIGHT */}
        <input
          type="number"
          placeholder="Height (cm)"
          value={form.height}
          onChange={(e) =>
            handleChange(
              "height",
              e.target.value
            )
          }
          className="input"
        />

        {/* GENDER */}
        <select
          value={form.gender}
          onChange={(e) =>
            handleChange(
              "gender",
              e.target.value
            )
          }
          className="input"
        >

          <option value="male">
            Male
          </option>

          <option value="female">
            Female
          </option>

        </select>

        {/* ACTIVITY */}
        <select
          value={form.activityLevel}
          onChange={(e) =>
            handleChange(
              "activityLevel",
              e.target.value
            )
          }
          className="input"
        >

          <option value="sedentary">
            Sedentary
          </option>

          <option value="lightly_active">
            Lightly Active
          </option>

          <option value="moderately_active">
            Moderately Active
          </option>

          <option value="very_active">
            Very Active
          </option>

        </select>

        {/* GOAL */}
        <select
          value={form.goal}
          onChange={(e) =>
            handleChange(
              "goal",
              e.target.value
            )
          }
          className="input"
        >

          <option value="fat_loss">
            Fat Loss
          </option>

          <option value="maintenance">
            Maintenance
          </option>

          <option value="muscle_gain">
            Muscle Gain
          </option>

        </select>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full"
        >

          {loading
            ? "Saving..."
            : "Continue 🚀"}

        </button>

      </div>

    </div>

  );

}