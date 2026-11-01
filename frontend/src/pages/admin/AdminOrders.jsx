import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { orderAPI } from '../../services/api';

const STATUS_OPTIONS = [
  'Order Placed',
  'Preparing Food',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await orderAPI.getAllOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await orderAPI.updateOrderStatus(orderId, newStatus);
      if (res.data.success) {
        // Update locally
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manage Customer Orders</h1>
          <p className="admin-page-sub">Monitor kitchen incoming queue, assign status, and update live progress</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchOrders}>
          <RefreshCw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem' }}
          />
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.88rem' }}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card admin-table-card">
        {loading ? (
          <div className="loading-state">Loading kitchen orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No orders match the current criteria.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer Details</th>
                <th>Items & Quantities</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Current Status</th>
                <th>Update Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_number}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <strong>{order.customer_name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {order.customer_phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '220px' }}>
                      {order.items?.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.8rem', color: 'var(--color-plum)' }}>
                          • {item.quantity}× {item.item_name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--color-forest)' }}>
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{order.payment_method}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${order.order_status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.order_status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem', width: 'auto' }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedOrder(order)}
                      title="Inspect full order"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Order Details: {selectedOrder.order_number}</h3>
              <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.92rem' }}>
              <div>
                <strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email}, {selectedOrder.customer_phone})
              </div>

              <div>
                <strong>Delivery Address:</strong>
                <p style={{ backgroundColor: 'var(--bg-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', marginTop: '4px' }}>
                  {selectedOrder.delivery_address}
                </p>
                {selectedOrder.delivery_instructions && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-terracotta)', marginTop: '4px' }}>
                    Note: {selectedOrder.delivery_instructions}
                  </p>
                )}
              </div>

              <div>
                <strong>Ordered Items:</strong>
                <div style={{ border: '1px solid var(--border-light)', borderRadius: '6px', padding: '0.75rem', marginTop: '4px' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #EEE' }}>
                      <span>{item.quantity}× {item.item_name}</span>
                      <strong>₹{parseFloat(item.subtotal).toFixed(0)}</strong>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontWeight: 700 }}>
                    <span>Grand Total:</span>
                    <span style={{ color: 'var(--color-terracotta)' }}>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <strong>Change Order Status:</strong>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
