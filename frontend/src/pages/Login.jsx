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

      // ✅ SAVE TOKEN
      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      // ✅ SAVE USER
      if (res.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(res.user)
        );
      }

      // ✅ REDIRECT
      if (!res.user?.isOnboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {

      console.log(err);

      alert(
        err?.response?.data?.message ||
        "Invalid credentials ❌"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="auth-container">

      {/* BG GLOW */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-3xl rounded-full top-10 left-10"></div>

      <div className="absolute w-[300px] h-[300px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* CARD */}
      <div className="auth-card glass relative z-10 space-y-4">

        <h2 className="title">
          Welcome Back 👋
        </h2>

        <p className="text-center text-sm text-muted">
          Login to continue your fitness journey
        </p>

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="input"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="input"
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading
            ? "Please wait..."
            : "Login 🚀"}
        </button>

        {/* SWITCH */}
        <p className="text-center text-sm text-muted">

          Don’t have an account?{" "}

          <span
            onClick={() => navigate("/")}
            className="text-blue-400 cursor-pointer"
          >
            Signup
          </span>

        </p>

      </div>

    </div>

  );

}