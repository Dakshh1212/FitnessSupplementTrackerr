export default function Step4({ next }) {
    return (
      <div className="auth-container">
        <div className="card">
          <h2 className="title">Activity Level</h2>
  
          <button className="goal-btn"
            onClick={() => next({ activityLevel: "sedentary" })}>
            🪑 Sedentary
          </button>
  
          <button className="goal-btn"
            onClick={() => next({ activityLevel: "moderately_active" })}>
            🚶 Moderate
          </button>
  
          <button className="goal-btn"
            onClick={() => next({ activityLevel: "very_active" })}>
            🏃 Active
          </button>
        </div>
      </div>
    );
  }