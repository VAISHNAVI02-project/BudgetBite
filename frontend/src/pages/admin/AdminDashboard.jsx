import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  ArrowRight,
  TrendingUp,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboard();
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recent_orders);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !stats) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Calculating live kitchen statistics...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Executive Dashboard</h1>
          <p className="admin-page-sub">Live metrics, kitchen performance, and sales breakdown</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadDashboard}>
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. Metric Stat Cards */}
      <div className="stat-cards-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper revenue">
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-val">₹{stats?.total_revenue?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Total Realized Revenue</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper orders">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.total_orders || 0}</div>
            <div className="stat-label">Total Orders Placed</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper customers">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.total_customers || 0}</div>
            <div className="stat-label">Registered Customers</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper foods">
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.total_foods || 0}</div>
            <div className="stat-label">
              Active Dishes ({stats?.available_foods || 0} Available)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Order Status Breakdown Cards */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 800 }}>
        Live Kitchen Status Pipeline
      </h3>
      <div className="status-cards-row">
        <div className="card status-metric-card placed">
          <div>
            <span className="status-metric-title">Orders Placed</span>
            <div className="status-metric-count">
              {stats?.orders_by_status?.['Order Placed'] || 0}
            </div>
          </div>
          <Clock size={24} style={{ color: 'var(--color-gold)' }} />
        </div>

        <div className="card status-metric-card preparing">
          <div>
            <span className="status-metric-title">In Wok / Preparing</span>
            <div className="status-metric-count">
              {stats?.orders_by_status?.['Preparing Food'] || 0}
            </div>
          </div>
          <ChefHat size={24} style={{ color: 'var(--color-terracotta)' }} />
        </div>

        <div className="card status-metric-card out">
          <div>
            <span className="status-metric-title">Out for Delivery</span>
            <div className="status-metric-count">
              {stats?.orders_by_status?.['Out for Delivery'] || 0}
            </div>
          </div>
          <Bike size={24} style={{ color: '#1976D2' }} />
        </div>

        <div className="card status-metric-card delivered">
          <div>
            <span className="status-metric-title">Delivered Today</span>
            <div className="status-metric-count">
              {stats?.orders_by_status?.['Delivered'] || 0}
            </div>
          </div>
          <PackageCheck size={24} style={{ color: 'var(--color-forest)' }} />
        </div>
      </div>

      {/* 3. Recent Orders Table */}
      <div className="card admin-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Customer Orders</h3>
          <Link to="/admin/orders" className="view-all-link">
            <span>Manage All Orders</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Placed Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((ord) => (
              <tr key={ord.id}>
                <td>
                  <strong>{ord.order_number}</strong>
                </td>
                <td>{ord.customer_name}</td>
                <td>{ord.customer_phone}</td>
                <td>
                  <strong>₹{parseFloat(ord.total_amount).toFixed(2)}</strong>
                </td>
                <td>
                  <span className={`status-pill ${ord.order_status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {ord.order_status}
                  </span>
                </td>
                <td>
                  {new Date(ord.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td>
                  <Link to="/admin/orders" className="btn btn-outline btn-sm">
                    Update Status
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
