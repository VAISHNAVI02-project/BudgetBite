
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  function findFood() {
    if (!budget || Number(budget) <= 0) {
      alert("Please enter a valid budget!");
      return;
    }

    navigate("/menu?budget=" + encodeURIComponent(budget));
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-label">SMART EATING STARTS HERE</span>

          <h1>
            Crave More.
            <br />
            <span>Spend Smarter.</span>
          </h1>

          <p>
            Your cravings, your budget, your choice.
            Discover delicious meals without overspending.
          </p>

          <div className="hero-highlights">
            <span>✓ Meals for every budget</span>
            <span>✓ Easy ordering</span>
          </div>

          <button
            className="hero-menu-button"
            onClick={() => navigate("/menu")}
          >
            Explore Menu <span>→</span>
          </button>
        </div>

        <div className="hero-image-area">
          <img
            className="hero-food-image"
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1100&q=85"
            alt="A delicious spread of freshly prepared food"
          />

          <div className="food-image-badge">
            <span>🍽️</span>
            <div>
              <strong>Your budget, your way</strong>
              <p>Good food made affordable</p>
            </div>
          </div>
        </div>
      </section>

      <section className="budget-section">
        <div className="budget-heading">
          <span className="section-eyebrow">LET'S FIND YOUR MEAL</span>
          <h2>What's your budget today?</h2>
          <p>Set your spending limit. We'll help you discover what you can enjoy.</p>
        </div>

        <form
          className="budget-form"
          onSubmit={(e) => {
            e.preventDefault();
            findFood();
          }}
        >
          <span className="rupee-symbol">₹</span>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Enter your budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            aria-label="Your food budget in rupees"
          />
          <button type="submit">Find Food →</button>
        </form>

        <p className="budget-hint">
          💡 We'll show you meals priced within your budget.
        </p>
      </section>

      <section className="home-features">
        <div className="section-heading">
          <span className="section-eyebrow">THE BUDGETBITE DIFFERENCE</span>
          <h2>Good food. No budget stress.</h2>
          <p>Everything you need for a smarter food-ordering experience.</p>
        </div>

        <div className="feature-list">
          <article className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Budget Friendly</h3>
            <p>Discover meals that fit your spending limit.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🍕</div>
            <h3>Something Delicious</h3>
            <p>Explore food options for different cravings.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Track Your Order</h3>
            <p>Check your order status after placing an order.</p>
          </article>
        </div>
      </section>

      <section className="home-bottom-banner">
        <div>
          <span>YOUR NEXT MEAL IS WAITING</span>
          <h2>Big cravings. Smart spending.</h2>
        </div>
        <button onClick={() => navigate("/menu")}>
          Browse Food →
        </button>
      </section>
    </div>
  );
}

export default Home;
