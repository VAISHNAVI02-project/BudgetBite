import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  Search,
  MapPin,
  Phone,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Star
} from 'lucide-react';
import { orderAPI } from '../services/api';
import './TrackOrderPage.css';

const STATUS_STEPS = [
  { key: 'Order Placed', label: 'Order Placed', icon: Clock, desc: 'Your order has been received and verified by the kitchen.' },
  { key: 'Preparing Food', label: 'Preparing Food', icon: ChefHat, desc: 'Our chef is tossing fresh ingredients in the wok.' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Bike, desc: 'Your warm meal is with our delivery executive.' },
  { key: 'Delivered', label: 'Delivered', icon: PackageCheck, desc: 'Enjoy your meal! Please rate your experience.' }
];

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [inputOrderNumber, setInputOrderNumber] = useState(orderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOrder = async (idToFetch) => {
    if (!idToFetch) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await orderAPI.getOrderById(idToFetch);
      if (res.data.success) {
        setOrder(res.data.order);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch order tracking:', err);
      setErrorMsg(err.response?.data?.message || 'Order not found. Please verify your order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  // Periodic polling every 8 seconds while tracking page is active
  useEffect(() => {
    if (!orderId && !order) return;

    const interval = setInterval(() => {
      const activeId = orderId || order?.order_number;
      if (activeId && order?.order_status !== 'Delivered' && order?.order_status !== 'Cancelled') {
        orderAPI.getOrderById(activeId)
          .then((res) => {
            if (res.data.success) {
              setOrder(res.data.order);
              setLastUpdated(new Date());
            }
          })
          .catch((err) => console.log('Polling error:', err));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [orderId, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputOrderNumber.trim()) {
      navigate(`/track-order/${inputOrderNumber.trim()}`);
      fetchOrder(inputOrderNumber.trim());
    }
  };

  // Determine current active step index
  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.order_status === 'Cancelled') return -1;
    const index = STATUS_STEPS.findIndex((s) => s.key === order.order_status);
    return index > -1 ? index : 0;
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="page-wrapper track-order-page">
      <div className="container">
        {/* Search header for lookup */}
        <div className="track-head">
          <h1 className="track-title">Live Order Tracker</h1>
          <p className="track-sub">
            Track your freshly prepared meal from the kitchen flame straight to your doorstep in real time.
          </p>

          <form onSubmit={handleSearchSubmit} className="track-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Enter Order Number (e.g. BB-20261031-1001)"
              value={inputOrderNumber}
              onChange={(e) => setInputOrderNumber(e.target.value)}
              className="track-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Track Order
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="track-error-card card">
            <AlertCircle size={28} className="error-icon" />
            <h3>{errorMsg}</h3>
            <p>Please double-check your Order ID. You can find it in your order confirmation or under "My Orders".</p>
          </div>
        )}

        {loading && !order && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Locating order status from our database...</p>
          </div>
        )}

        {order && (
          <div className="track-details-container">
            {/* Top Order Status Banner */}
            <div className="order-status-banner card">
              <div className="banner-left">
                <span className="order-number-badge">{order.order_number}</span>
                <h2 className="current-status-text">
                  Status: <span className="status-highlight">{order.order_status}</span>
                </h2>
                <span className="order-timestamp">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="banner-right">
                <button
                  className="btn btn-outline btn-sm refresh-status-btn"
                  onClick={() => fetchOrder(order.order_number)}
                  title="Click to refresh live status"
                >
                  <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                  <span>Live Updated ({lastUpdated.toLocaleTimeString()})</span>
                </button>
              </div>
            </div>

            {/* Visual Step Tracker */}
            {order.order_status === 'Cancelled' ? (
              <div className="cancelled-banner card">
                <AlertCircle size={24} />
                <div>
                  <h4>This order was cancelled</h4>
                  <p>Please reach out to support if you have any questions.</p>
                </div>
              </div>
            ) : (
              <div className="status-progress-card card">
                <div className="progress-steps-row">
                  {STATUS_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div
                        key={step.key}
                        className={`step-column ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                      >
                        <div className="step-circle">
                          {isCompleted ? <CheckCircle2 size={20} /> : <StepIcon size={20} />}
                        </div>
                        <span className="step-name">{step.label}</span>
                        <p className="step-tooltip">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery & Order Summary 2-Col */}
            <div className="track-summary-grid">
              {/* Delivery Address & Customer */}
              <div className="card track-info-card">
                <h3 className="card-subtitle">Delivery Information</h3>
                <div className="info-item">
                  <MapPin size={18} className="info-icon" />
                  <div>
                    <span className="info-label">Delivering To:</span>
                    <p className="info-text">
                      <strong>{order.customer_name}</strong> ({order.customer_phone})<br />
                      {order.delivery_address}
                    </p>
                    {order.delivery_instructions && (
                      <p className="info-inst">
                        <strong>Instructions:</strong> {order.delivery_instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <Clock size={18} className="info-icon" />
                  <div>
                    <span className="info-label">Estimated Delivery Time:</span>
                    <p className="info-text">25 - 35 minutes</p>
                  </div>
                </div>

                {order.order_status === 'Delivered' && (
                  <div className="delivered-review-prompt">
                    <Star size={18} className="star-icon" fill="currentColor" />
                    <span>Order Delivered! Head to <Link to="/my-orders">My Orders</Link> to rate your food!</span>
                  </div>
                )}
              </div>

              {/* Ordered Items Summary */}
              <div className="card track-info-card">
                <h3 className="card-subtitle">Items in This Order</h3>
                <div className="track-items-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="track-item-line">
                      <div className="track-item-left">
                        <span className="track-item-qty">{item.quantity}×</span>
                        <span className="track-item-name">{item.item_name}</span>
                      </div>
                      <span className="track-item-price">₹{parseFloat(item.subtotal).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <hr className="divider-line" />

                <div className="bill-row">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Partner Fee</span>
                  <span>₹{parseFloat(order.delivery_fee).toFixed(2)}</span>
                </div>
                <div className="bill-row total-highlight">
                  <span>Total Paid ({order.payment_method})</span>
                  <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
