export default function Step3({ next }) {
    return (
      <div className="auth-container">
        <div className="card">
          <h2 className="title">Your Goal</h2>
  
          <button className="goal-btn"
            onClick={() => next({ goal: "fat_loss" })}>
            🔥 Fat Loss
          </button>
  
          <button className="goal-btn"
            onClick={() => next({ goal: "muscle_gain" })}>
            💪 Muscle Gain
          </button>
  
          <button className="goal-btn"
            onClick={() => next({ goal: "maintenance" })}>
            ⚖️ Maintain
          </button>
        </div>
      </div>
    );
  }