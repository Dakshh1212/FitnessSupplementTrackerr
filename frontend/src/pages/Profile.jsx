import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Profile() {

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user || {});
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (field, value) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        name: user.name || "",
        age: user.age || null,
        height: user.height || null,
        weight: user.weight || null,
        gender: user.gender || "male",
        activityLevel: user.activityLevel || "sedentary",
        goal: user.goal || "maintenance",
        photo: user.photo || ""
      };

      await API.put("/auth/update", payload);

      alert("Profile updated ✅");
      fetchUser();

    } catch (err) {
      console.log(err);
      alert("Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Profile 👤
            </h1>
            <p className="text-gray-400">
              Manage your fitness identity
            </p>
          </div>

          {/* PROFILE CARD */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">

            {/* IMAGE SECTION */}
            <div className="flex flex-col items-center space-y-3">

              <img
                src={user.photo || "https://via.placeholder.com/120"}
                className="w-28 h-28 rounded-full object-cover border-2 border-blue-400"
              />

              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("image", file);

                  try {
                    const res = await API.post("/upload", formData, {
                      headers: {
                        "Content-Type": "multipart/form-data"
                      }
                    });

                    handleChange("photo", res.data.imageUrl);

                  } catch (err) {
                    console.log(err);
                    alert("Upload failed ❌");
                  }
                }}
              />

            </div>

            {/* INPUT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                className="input"
                placeholder="Name"
                value={user.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <input
                className="input"
                placeholder="Age"
                type="number"
                value={user.age || ""}
                onChange={(e) => handleChange("age", e.target.value)}
              />

              <input
                className="input"
                placeholder="Height (cm)"
                type="number"
                value={user.height || ""}
                onChange={(e) => handleChange("height", e.target.value)}
              />

              <input
                className="input"
                placeholder="Weight (kg)"
                type="number"
                value={user.weight || ""}
                onChange={(e) => handleChange("weight", e.target.value)}
              />

              {/* GENDER */}
              <select
                className="input"
                value={user.gender || "male"}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              {/* ACTIVITY */}
              <select
                className="input"
                value={user.activityLevel || "sedentary"}
                onChange={(e) => handleChange("activityLevel", e.target.value)}
              >
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Light</option>
                <option value="moderately_active">Moderate</option>
                <option value="very_active">Very Active</option>
              </select>

              {/* GOAL FULL WIDTH */}
              <select
                className="input md:col-span-2"
                value={user.goal || "maintenance"}
                onChange={(e) => handleChange("goal", e.target.value)}
              >
                <option value="maintenance">Maintenance</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
              </select>

            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}