import { useState } from "react";

import {
  loginUser,
  registerUser
} from "../services/authService";

export default function Auth() {

  const [isLogin, setIsLogin] = useState(true);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      let res;

      /* =====================
         LOGIN
      ===================== */
      if (isLogin) {

        res = await loginUser({
          email: form.email.trim(),
          password: form.password
        });

      }

      /* =====================
         REGISTER
      ===================== */
      else {

        if (
          !form.name.trim() ||
          !form.email.trim() ||
          !form.password
        ) {

          alert("Fill all fields ❌");

          return;

        }

        if (form.password.length < 6) {

          alert(
            "Password must be at least 6 characters ❌"
          );

          return;

        }

        res = await registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        });

      }

      /* =====================
         RESPONSE
      ===================== */
      const {
        token,
        user
      } = res || {};

      if (!token || !user) {

        alert("Authentication failed ❌");

        return;

      }

      /* =====================
         SAVE
      ===================== */
      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      /* =====================
         REDIRECT
      ===================== */
      if (user.isOnboardingComplete) {

        window.location.href =
          "/dashboard";

      } else {

        window.location.href =
          "/onboarding";

      }

    } catch (err) {

      console.log(
        "AUTH ERROR:",
        err.response?.data || err.message
      );

      alert(
        err?.response?.data?.message ||
        "Something went wrong ❌"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-[#1e293b] p-8 rounded-3xl shadow-2xl border border-gray-800">

        {/* TITLE */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-white">
            {isLogin
              ? "Welcome Back 👋"
              : "Create Account 🚀"}
          </h1>

          <p className="text-gray-400 mt-2 text-sm">
            Fitness Supplement Tracker
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAME */}
          {!isLogin && (

            <div>

              <label className="text-sm text-gray-300">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full mt-1 bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500"
              />

            </div>

          )}

          {/* EMAIL */}
          <div>

            <label className="text-sm text-gray-300">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full mt-1 bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500"
            />

          </div>

          {/* PASSWORD */}
          <div>

            <label className="text-sm text-gray-300">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full mt-1 bg-[#0f172a] border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500"
            />

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-xl font-semibold text-white mt-4 disabled:opacity-50"
          >

            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}

          </button>

        </form>

        {/* TOGGLE */}
        <div className="text-center mt-6">

          <p className="text-sm text-gray-400">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              onClick={() =>
                setIsLogin(!isLogin)
              }
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
            >

              {isLogin
                ? "Signup"
                : "Login"}

            </button>

          </p>

        </div>

      </div>

    </div>

  );

}