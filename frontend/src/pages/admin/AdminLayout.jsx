import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Layers,
  ShoppingBag,
  Users,
  Star,
  BarChart3,
  LogOut,
  Store,
  Menu as MenuIcon,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-root">
      {/* Mobile Top Header */}
      <header className="admin-mobile-header">
        <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
        <div className="admin-mobile-brand">
          <ShieldCheck size={20} className="admin-shield" />
          <span>BudgetBite Admin</span>
        </div>
        <Link to="/" className="store-pill-btn">
          <Store size={15} />
          <span>Store</span>
        </Link>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-wrapper">
          <div className="admin-brand-icon">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <h2 className="admin-brand-title">Budget<span className="hl">Bite</span></h2>
            <span className="admin-panel-badge">Management Console</span>
          </div>
        </div>

        <nav className="admin-nav-links">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/foods"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <UtensilsCrossed size={18} />
            <span>Manage Food</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Tags size={18} />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/admin/combos"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Layers size={18} />
            <span>Manage Combos</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Users size={18} />
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Star size={18} />
            <span>Reviews</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <BarChart3 size={18} />
            <span>Reports & Analytics</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item store-link" onClick={closeSidebar}>
            <Store size={18} />
            <span>Return to Storefront</span>
          </Link>

          <div className="admin-user-info">
            <div className="admin-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-details">
              <span className="admin-name">{user?.name || 'Administrator'}</span>
              <span className="admin-role">System Admin</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="admin-main-canvas">
        <div className="admin-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
