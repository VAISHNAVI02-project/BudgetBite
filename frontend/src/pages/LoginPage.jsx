import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Utensils, Lock, Mail, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
          <h1 className="auth-panel-title">Delicious food that fits your budget.</h1>
          <p className="auth-panel-copy">
            Sign in to plan meals to the rupee, order pocket-friendly combos, and track every delivery.
          </p>
          <ul className="auth-panel-points">
            <li>
              <Sparkles size={16} />
              <span>Smart Budget Planner</span>
            </li>
            <li>
              <ShieldCheck size={16} />
              <span>Secure JWT accounts</span>
            </li>
            <li>
              <Utensils size={16} />
              <span>Live order tracking</span>
            </li>
          </ul>
        </aside>

        <div className="auth-card-wrapper card">
          <div className="auth-brand">
            <div className="brand-icon-wrapper auth-mobile-mark">
              <Utensils size={22} />
            </div>
            <h2>Welcome back</h2>
            <p className="auth-sub">Sign in to your BudgetBite account to continue.</p>
          </div>

          {errorMsg && (
            <div className="auth-error-alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
              <label className="form-label">Password</label>
              <div className="input-icon-box">
                <Lock size={16} className="field-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to BudgetBite'}
            </button>
          </form>

          

          <div className="auth-footer-prompt">
            <span>Don't have an account yet?</span>{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
