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

  // ✅ FETCH USER
  const fetchUser = async () => {

    try {

      const res = await API.get("/auth/me");

      setUser(res.data.user || {});

    } catch (err) {

      console.log("Fetch Error:", err);

    }

  };

  // ✅ HANDLE CHANGE
  const handleChange = (field, value) => {

    setUser((prev) => ({
      ...prev,
      [field]: value
    }));

  };

  // ✅ SAVE PROFILE
  const handleSave = async () => {

    try {

      setLoading(true);

      const payload = {

        name: user.name || "",
        age: user.age || null,
        height: user.height || null,
        weight: user.weight || null,
        gender: user.gender || "male",
        activityLevel:
          user.activityLevel || "sedentary",
        goal:
          user.goal || "maintenance",
        photo: user.photo || ""

      };

      const res = await API.put(
        "/auth/update",
        payload
      );

      // ✅ UPDATE LOCAL USER
      if (res.data.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );

      }

      await fetchUser();

      alert("Profile updated ✅");

    } catch (err) {

      console.log("Save Error:", err);

      alert(
        err?.response?.data?.message ||
        "Error updating profile ❌"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="flex">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-6 bg-[#020617] text-white min-h-screen space-y-6">

          <h1 className="text-3xl font-bold">
            Profile 👤
          </h1>

          {/* CARD */}
          <div className="bg-[#1e293b] p-6 rounded-xl space-y-4">

            {/* PHOTO */}
            <div className="flex flex-col items-center">

              <img
                src={
                  user.photo ||
                  "https://via.placeholder.com/100"
                }
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              />

              <input
                type="file"
                accept="image/*"
                className="mt-3"
                onChange={async (e) => {

                  const file =
                    e.target.files[0];

                  if (!file) return;

                  const formData =
                    new FormData();

                  formData.append(
                    "image",
                    file
                  );

                  try {

                    const res =
                      await API.post(
                        "/upload",
                        formData,
                        {
                          headers: {
                            "Content-Type":
                              "multipart/form-data"
                          }
                        }
                      );

                    handleChange(
                      "photo",
                      res.data.url
                    );

                  } catch (err) {

                    console.log(err);

                    alert(
                      "Upload failed ❌"
                    );

                  }

                }}
              />

            </div>

            {/* NAME */}
            <input
              className="input"
              placeholder="Name"
              value={user.name || ""}
              onChange={(e) =>
                handleChange(
                  "name",
                  e.target.value
                )
              }
            />

            {/* AGE */}
            <input
              type="number"
              className="input"
              placeholder="Age"
              value={user.age || ""}
              onChange={(e) =>
                handleChange(
                  "age",
                  e.target.value
                )
              }
            />

            {/* HEIGHT */}
            <input
              type="number"
              className="input"
              placeholder="Height (cm)"
              value={user.height || ""}
              onChange={(e) =>
                handleChange(
                  "height",
                  e.target.value
                )
              }
            />

            {/* WEIGHT */}
            <input
              type="number"
              className="input"
              placeholder="Weight (kg)"
              value={user.weight || ""}
              onChange={(e) =>
                handleChange(
                  "weight",
                  e.target.value
                )
              }
            />

            {/* GENDER */}
            <select
              className="input"
              value={user.gender || "male"}
              onChange={(e) =>
                handleChange(
                  "gender",
                  e.target.value
                )
              }
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
              className="input"
              value={
                user.activityLevel ||
                "sedentary"
              }
              onChange={(e) =>
                handleChange(
                  "activityLevel",
                  e.target.value
                )
              }
            >

              <option value="sedentary">
                Sedentary
              </option>

              <option value="lightly_active">
                Light
              </option>

              <option value="moderately_active">
                Moderate
              </option>

              <option value="very_active">
                Very Active
              </option>

            </select>

            {/* GOAL */}
            <select
              className="input"
              value={
                user.goal ||
                "maintenance"
              }
              onChange={(e) =>
                handleChange(
                  "goal",
                  e.target.value
                )
              }
            >

              <option value="maintenance">
                Maintenance
              </option>

              <option value="fat_loss">
                Fat Loss
              </option>

              <option value="muscle_gain">
                Muscle Gain
              </option>

            </select>

            {/* SAVE */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary w-full"
            >

              {loading
                ? "Saving..."
                : "Save Profile"}

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}