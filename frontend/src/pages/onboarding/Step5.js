export default function Step5({ submit }) {
    return (
      <div className="auth-container">
        <div className="card">
          <h2 className="title">Food Preference</h2>
  
          <button className="goal-btn"
            onClick={() => submit({ foodPreference: "veg" })}>
            🥦 Veg
          </button>
  
          <button className="goal-btn"
            onClick={() => submit({ foodPreference: "non-veg" })}>
            🍗 Non-Veg
          </button>
  
          <button className="goal-btn"
            onClick={() => submit({ foodPreference: "vegan" })}>
            🌱 Vegan
          </button>
        </div>
      </div>
    );
  }