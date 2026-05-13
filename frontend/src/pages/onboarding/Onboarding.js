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

  /* ======================
     ✅ CHECK TOKEN
  ====================== */
  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

  }, [navigate]);

  /* ======================
     ✅ NEXT STEP
  ====================== */
  const next = (values) => {

    setData((prev) => ({
      ...prev,
      ...values
    }));

    setStep((prev) => prev + 1);

  };

  /* ======================
     ✅ FINAL SUBMIT
  ====================== */
  const submit = async (values) => {

    try {

      const finalData = {
        ...data,
        ...values
      };

      // ✅ API CALL
      await completeOnboarding(finalData);

      // ✅ UPDATE LOCAL USER
      const oldUser = JSON.parse(
        localStorage.getItem("user")
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          isOnboardingComplete: true
        })
      );

      // ✅ GO DASHBOARD
      navigate("/dashboard");

    } catch (err) {

      console.log(err);

      alert("Onboarding failed ❌");

    }

  };

  return (
    <div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-800 h-2">

        <div
          className="bg-blue-500 h-2 transition-all"
          style={{
            width: `${(step / 5) * 100}%`
          }}
        />

      </div>

      {/* STEPS */}
      {step === 1 && (
        <Step2 next={next} />
      )}

      {step === 2 && (
        <Step3 next={next} />
      )}

      {step === 3 && (
        <Step4 next={next} />
      )}

      {step === 4 && (
        <Step5 submit={submit} />
      )}

    </div>
  );
}