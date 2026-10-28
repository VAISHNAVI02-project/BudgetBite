
import { useState } from "react";

function Home() {
  const [budget, setBudget] = useState("");

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to BudgetBite 🍔</h1>
        <p>Delicious food that fits your budget!</p>

        <div className="budget-box">
          <h2>What's your budget today?</h2>

          <input
            type="number"
            placeholder="Enter your budget (₹)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <button
            onClick={() => {
              if (Number(budget) > 0) {
                window.location.href =
                  "/menu?budget=" + encodeURIComponent(budget);
              } else {
                alert("Please enter a valid budget!");
              }
            }}
          >
            Find Food
          </button>
        </div>
      </section>

      <section className="features">
        <h2>Why BudgetBite?</h2>

        <div className="feature-list">
          <div className="feature-card">
            <h3>💰 Budget Friendly</h3>
            <p>Discover food within your spending limit.</p>
          </div>

          <div className="feature-card">
            <h3>🍕 Delicious Choices</h3>
            <p>Explore tasty meals and snacks.</p>
          </div>

          <div className="feature-card">
            <h3>📦 Order Tracking</h3>
            <p>Follow your order status easily.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
