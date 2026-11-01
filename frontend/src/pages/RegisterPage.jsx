import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Utensils, Lock, Mail, User, Phone, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.register({ name, email, phone, password });
      if (res.data.success) {
        register(res.data.user, res.data.token);
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen-inner">
        <aside className="auth-brand-panel">
          <div className="auth-brand-mark">
            <div className="brand-icon-wrapper">
              <Utensils size={24} />
            </div>
            <div>
              <p className="auth-brand-name">Budget<span>Bite</span></p>
              <p className="auth-brand-tag">Smarter Budgets</p>
            </div>
          </div>
          <h1 className="auth-panel-title">Join BudgetBite and dine on your terms.</h1>
          <p className="auth-panel-copy">
            Create a free customer account to save addresses, build budget meals, and track live orders.
          </p>
          <ul className="auth-panel-points">
            <li>
              <Sparkles size={16} />
              <span>Personalized meal planning</span>
            </li>
            <li>
              <ShieldCheck size={16} />
              <span>Secure account checkout</span>
            </li>
            <li>
              <Utensils size={16} />
              <span>Order history & reviews</span>
            </li>
          </ul>
        </aside>

        <div className="auth-card-wrapper card">
          <div className="auth-brand">
            <div className="brand-icon-wrapper auth-mobile-mark">
              <Utensils size={22} />
            </div>
            <h2>Create your account</h2>
            <p className="auth-sub">Register to plan smart meals and place your first order.</p>
          </div>

          {errorMsg && (
            <div className="auth-error-alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-box">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  autoComplete="name"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-box">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-icon-box">
                <Phone size={16} className="field-icon" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  autoComplete="tel"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-box">
                  <Lock size={16} className="field-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    required
                    autoComplete="new-password"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-icon-box">
                  <Lock size={16} className="field-icon" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    autoComplete="new-password"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="auth-footer-prompt">
            <span>Already have an account?</span>{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
