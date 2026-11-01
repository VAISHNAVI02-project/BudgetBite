import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, PieChart, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getReports();
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading && !reports) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Generating culinary sales analytics...</p>
      </div>
    );
  }

  const { daily_sales, popular_foods, status_distribution, summary } = reports;

  return (
    <div className="admin-reports-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Executive Reports & Sales Analytics</h1>
          <p className="admin-page-sub">Historical revenue trends, item velocity, and sales distributions</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchReports}>
          <RefreshCw size={14} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {/* Summary KPI Top Cards */}
      <div className="stat-cards-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper revenue">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-val">₹{summary?.total_revenue?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Total Realized Revenue</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper orders">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-val">{summary?.total_orders || 0}</div>
            <div className="stat-label">Valid Completed Orders</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper customers">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-val">₹{summary?.avg_order_value || '0.00'}</div>
            <div className="stat-label">Average Order Basket Value</div>
          </div>
        </div>
      </div>

      {/* 2-Column Analytics: Popular Items & Status Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Top 6 Popular Food Items */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Award size={22} style={{ color: 'var(--color-terracotta)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Top Best-Selling Food Items</h3>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {popular_foods?.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>#{idx + 1} {item.item_name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-sage">{item.total_sold} units</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--color-forest)' }}>
                      ₹{parseFloat(item.total_revenue).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Distribution */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <PieChart size={22} style={{ color: 'var(--color-forest)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Order Status Breakdown</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {status_distribution?.map((st, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px'
              }}>
                <span className={`status-pill ${st.order_status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {st.order_status}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{st.count} orders</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ₹{parseFloat(st.revenue || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Sales Table */}
      <div className="card admin-table-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <BarChart3 size={22} style={{ color: 'var(--color-gold)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Daily Sales Activity (Past 7 Days)</h3>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders Handled</th>
              <th>Total Revenue Collected</th>
              <th>Average per Order</th>
            </tr>
          </thead>
          <tbody>
            {daily_sales?.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No orders in this period.</td>
              </tr>
            ) : (
              daily_sales?.map((day, idx) => {
                const avg = day.orders_count > 0 ? (day.revenue / day.orders_count).toFixed(2) : '0.00';
                return (
                  <tr key={idx}>
                    <td>
                      <strong>
                        {new Date(day.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-terracotta">{day.orders_count} Orders</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-forest)', fontSize: '1.05rem' }}>
                        ₹{parseFloat(day.revenue).toFixed(2)}
                      </strong>
                    </td>
                    <td>₹{avg}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
