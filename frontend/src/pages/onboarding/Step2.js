import { useState } from "react";

export default function Step2({ next }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  return (
    <div className="auth-container">
      <div className="card">
        <h2 className="title">Body Stats</h2>

        <input className="input" placeholder="Height (cm)"
          onChange={(e) => setHeight(e.target.value)} />

        <input className="input mt-3" placeholder="Weight (kg)"
          onChange={(e) => setWeight(e.target.value)} />

        <button className="btn-primary mt-4 w-full"
          onClick={() => next({ height, weight })}>
          Next →
        </button>
      </div>
    </div>
  );
}