
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
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
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login", {
        state: { registeredEmail: form.email },
      });
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
          <span className="eyebrow">YOUR FOOD JOURNEY STARTS HERE</span>
          <h2>Eat well.<br />Spend smart.</h2>
          <p>
            Find tasty meals for every budget.
            Create your account and make every craving count.
          </p>
        </div>

        <p>Good food doesn't have to cost more.</p>
      </section>

      <section className="auth-main">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-description">
            Join BudgetBite and discover your next favourite meal.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              minLength={8}
              maxLength={72}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <Link className="auth-home-link" to="/">
            ← Back to home
          </Link>
        </div>
      </section>
    </div>
  );

}

export default Register;
