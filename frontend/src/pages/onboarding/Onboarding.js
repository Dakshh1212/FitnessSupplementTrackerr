import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { completeOnboarding } from "../../services/authService";

import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

export default function Onboarding() {

  const [step, setStep] = useState(1);
  const [data, setData] = useState({});

  const navigate = useNavigate();

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  /* ================= NEXT STEP ================= */
  const next = (values) => {
    setData(prev => ({
      ...prev,
      ...values
    }));
    setStep(prev => prev + 1);
  };

  /* ================= SUBMIT ================= */
  const submit = async (values) => {
    try {

      const finalData = {
        ...data,
        ...values
      };

      await completeOnboarding(finalData);

      const oldUser = JSON.parse(localStorage.getItem("user"));

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...finalData,
          isOnboardingComplete: true
        })
      );

      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("Onboarding failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white relative overflow-hidden px-4">

      {/* GLOW BACKGROUND */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-[300px] h-[300px] bg-purple-500 opacity-20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* CARD */}
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-6 z-10">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
            Personalize Your Fitness Journey 🚀
          </h1>

          <p className="text-gray-400 text-sm">
            Step {step} of 4 — Setup your perfect fitness profile
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
            style={{
              width: `${(step / 4) * 100}%`
            }}
          />
        </div>

        {/* STEP CONTENT CARD */}
        <div className="bg-black/20 border border-white/10 rounded-xl p-4">

          {step === 1 && <Step2 next={next} />}
          {step === 2 && <Step3 next={next} />}
          {step === 3 && <Step4 next={next} />}
          {step === 4 && <Step5 submit={submit} />}

        </div>

        {/* FOOTER TIP */}
        <p className="text-center text-xs text-gray-500">
          This helps us generate your personalized diet & workout plan
        </p>

      </div>
    </div>
  );
}