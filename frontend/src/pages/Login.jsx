
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
console.log("Login user from backend:", data.user);
      localStorage.setItem("budgetbite_token", data.token);
      localStorage.setItem("budgetbite_user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Please check whether the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

    
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-brand">🍽️ BudgetBite</div>

        <div className="auth-visual-content">
          <span className="eyebrow">GOOD FOOD, SMART CHOICES</span>
          <h2>Big cravings.<br />Small budgets.</h2>
          <p>
            Discover delicious meals that fit your budget.
            Your next favourite meal is just a few clicks away.
          </p>
        </div>

        <p>Made for your cravings. Designed for your budget.</p>
      </section>

      <section className="auth-main">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-description">
            Sign in to your account and let's find something delicious.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to BudgetBite →"}
            </button>
          </form>

          <p className="auth-switch">
            New to BudgetBite? <Link to="/register">Create an account</Link>
          </p>

          <Link className="auth-home-link" to="/">
            ← Back to home
          </Link>
        </div>
      </section>
    </div>
  );

}

export default Login;
