import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await loginUser(form);

      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      if (!res.user?.isOnboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Invalid credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

      {/* GLOW EFFECTS */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-[300px] h-[300px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-5 z-10">

        {/* TITLE */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
            Welcome Back 👋
          </h2>
          <p className="text-gray-400 text-sm">
            Login to continue your fitness journey
          </p>
        </div>

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-400"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-400"
        />

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-semibold hover:scale-[1.02] transition"
        >
          {loading ? "Please wait..." : "Login 🚀"}
        </button>

        {/* SWITCH */}
        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-400 cursor-pointer hover:text-blue-300"
          >
            Signup
          </span>
        </p>

      </div>

    </div>
  );
}