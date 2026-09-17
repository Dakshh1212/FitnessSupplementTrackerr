import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Signup() {

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      return alert("Fill all fields ❌");
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters ❌");
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      if (res?.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      if (!res.user?.isOnboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">

      {/* 🔥 BACKGROUND GLOWS */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-[300px] h-[300px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-5 z-10">

        {/* TITLE */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
            Create Account 🚀
          </h2>
          <p className="text-gray-400 text-sm">
            Start your fitness journey
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">

            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-400"
            />

            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-400"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-blue-400"
            />

            <button
              onClick={nextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-semibold hover:scale-[1.02] transition"
            >
              Next →
            </button>

          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5 text-center">

            <h3 className="text-lg font-semibold">
              Ready to start your journey? 💪
            </h3>

            <p className="text-sm text-gray-400">
              We will personalize your fitness experience
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-semibold hover:scale-[1.02] transition"
              >
                {loading ? "Creating..." : "Create 🚀"}
              </button>

            </div>

          </div>
        )}

        {/* LOGIN LINK */}
        <p
          onClick={() => navigate("/")}
          className="text-center text-sm text-gray-400 cursor-pointer hover:text-white"
        >
          Already have an account? Login
        </p>

      </div>
    </div>
  );
}