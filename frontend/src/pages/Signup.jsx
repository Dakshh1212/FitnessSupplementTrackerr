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

  // ✅ NEXT STEP
  const nextStep = () => {

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!name || !email || !password) {
      return alert("Fill all fields ❌");
    }

    if (password.length < 6) {
      return alert(
        "Password must be at least 6 characters ❌"
      );
    }

    setStep(2);

  };

  // ✅ SUBMIT
  const handleSubmit = async () => {

    try {

      setLoading(true);

      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });

      // ✅ SAVE TOKEN
      if (res?.token) {

        localStorage.setItem(
          "token",
          res.token
        );

      }

      // ✅ SAVE USER
      if (res?.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(res.user)
        );

      }

      // ✅ SMART REDIRECT
      if (!res.user?.isOnboardingComplete) {

        navigate("/onboarding");

      } else {

        navigate("/dashboard");

      }

    } catch (err) {

      console.log(err);

      alert(
        err?.response?.data?.message ||
        "Signup failed ❌"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="auth-container">

      {/* 🔥 GLOW */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-3xl rounded-full top-10 left-10"></div>

      <div className="absolute w-[300px] h-[300px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* 🔥 CARD */}
      <div className="auth-card glass relative z-10 space-y-5">

        <h2 className="title">
          Create Account 🚀
        </h2>

        {/* 🔥 PROGRESS */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{
              width: `${(step / 2) * 100}%`
            }}
          />

        </div>

        {/* STEP 1 */}
        {step === 1 && (

          <div className="space-y-3">

            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="input"
            />

            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="input"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input"
            />

            <button
              onClick={nextStep}
              className="btn-primary w-full"
            >
              Next →
            </button>

          </div>

        )}

        {/* STEP 2 */}
        {step === 2 && (

          <div className="space-y-4 text-center">

            <h3 className="text-lg font-semibold">
              Ready to start your journey? 💪
            </h3>

            <p className="text-sm text-gray-400">
              We’ll personalize everything next
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setStep(1)}
                className="btn-secondary w-full"
              >
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full"
              >

                {loading
                  ? "Creating..."
                  : "Create 🚀"}

              </button>

            </div>

          </div>

        )}

        {/* LOGIN */}
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