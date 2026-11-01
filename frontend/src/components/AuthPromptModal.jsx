import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, X, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import './AuthPromptModal.css';

const AuthPromptModal = ({ isOpen, onClose, itemName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const currentPath = encodeURIComponent(location.pathname + location.search);

  const handleLogin = () => {
    onClose();
    navigate(`/login?redirect=${currentPath}`);
  };

  const handleRegister = () => {
    onClose();
    navigate(`/register?redirect=${currentPath}`);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-content card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="auth-modal-icon-badge">
          <Lock size={26} />
        </div>

        <h3 className="auth-modal-title">Please Sign In to Order</h3>

        <p className="auth-modal-desc">
          {itemName ? (
            <>
              To add <strong>"{itemName}"</strong> to your cart and place your order, please log in or create an account.
            </>
          ) : (
            'To add delicious dishes to your cart, track live orders, and customize meals, please sign in to your BudgetBite account.'
          )}
        </p>

        <div className="auth-modal-actions">
          <button className="btn btn-primary auth-modal-btn" onClick={handleLogin}>
            <LogIn size={16} />
            <span>Sign In to Continue</span>
          </button>

          <button className="btn btn-outline auth-modal-btn" onClick={handleRegister}>
            <UserPlus size={16} />
            <span>Create New Account</span>
          </button>
        </div>

        <div className="auth-modal-footer">
          <button className="browse-guest-link" onClick={onClose}>
            Continue browsing menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
