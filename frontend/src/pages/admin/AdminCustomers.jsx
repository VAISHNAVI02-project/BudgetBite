import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, Calendar } from 'lucide-react';
import { customerAPI } from '../../services/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await customerAPI.getCustomers();
        if (res.data.success) {
          setCustomers(res.data.customers);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="admin-customers-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Registered Customers</h1>
          <p className="admin-page-sub">Customer accounts, order activities, and lifetime dining spend</p>
        </div>
      </div>

      <div className="card admin-table-card">
        {loading ? (
          <div className="loading-state">Loading registered diners...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Info</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="admin-avatar" style={{ backgroundColor: 'var(--color-plum)' }}>
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{cust.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                      <span>{cust.email}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{cust.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-sage">
                      {cust.total_orders} Orders
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--color-forest)' }}>
                      ₹{parseFloat(cust.total_spent).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    {new Date(cust.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
