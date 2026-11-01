import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Wallet,
  ShoppingBag,
  User,
  Menu as MenuIcon,
  X,
  Sparkles,
  Layers,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          <div className="brand-icon-wrapper">
            <Utensils className="brand-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Budget<span className="highlight">Bite</span></span>
            <span className="brand-tagline">Smarter Budgets</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Menu
          </NavLink>
          <NavLink to="/budget-planner" className={({ isActive }) => `nav-link budget-link ${isActive ? 'active' : ''}`}>
            <Wallet size={16} />
            <span>Smart Budget</span>
            <span className="badge-pulse">USP</span>
          </NavLink>
          <NavLink to="/combos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Combos
          </NavLink>
          <NavLink to="/crave-match" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={16} />
            <span>Crave Match</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Orders
            </NavLink>
          )}
        </nav>

        {/* Right Action Icons: Cart & Auth */}
        <div className="nav-actions">
          {/* Cart Icon with Counter */}
          <Link to="/cart" className="cart-btn" aria-label="View Shopping Cart">
            <ShoppingBag size={22} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <div className="user-dropdown-container">
              <button
                className="user-profile-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <div className="avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={15} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu" onClick={() => setUserDropdownOpen(false)}>
                  <div className="dropdown-header">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                    <span className={`role-badge ${isAdmin ? 'admin' : 'customer'}`}>
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </div>

                  <hr className="dropdown-divider" />

                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item admin-item">
                      <ShieldCheck size={16} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>

                  <Link to="/my-orders" className="dropdown-item">
                    <Package size={16} />
                    <span>Order History</span>
                  </Link>

                  <hr className="dropdown-divider" />

                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm register-btn">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <NavLink to="/" className="mobile-link" onClick={closeMobile} end>
            Home
          </NavLink>
          <NavLink to="/menu" className="mobile-link" onClick={closeMobile}>
            Menu
          </NavLink>
          <NavLink to="/budget-planner" className="mobile-link budget-highlight" onClick={closeMobile}>
            <Wallet size={18} />
            <span>Smart Budget Planner</span>
          </NavLink>
          <NavLink to="/combos" className="mobile-link" onClick={closeMobile}>
            Combos
          </NavLink>
          <NavLink to="/crave-match" className="mobile-link" onClick={closeMobile}>
            <Sparkles size={18} />
            <span>Crave Match</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-orders" className="mobile-link" onClick={closeMobile}>
              My Orders
            </NavLink>
          )}

          <div className="mobile-auth-footer">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="mobile-link" onClick={closeMobile}>
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="mobile-link admin-highlight" onClick={closeMobile}>
                    <ShieldCheck size={18} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button className="btn btn-outline mobile-logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="btn btn-outline" onClick={closeMobile}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={closeMobile}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
