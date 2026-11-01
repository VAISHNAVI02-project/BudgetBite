import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  ExternalLink,
  Repeat,
  Star,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { orderAPI, reviewAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addBatchToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getMyOrders();
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
    if (!isAuthenticated) {
      navigate('/login?redirect=/my-orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;

    const itemsToAdd = order.items.map((oi) => ({
      id: oi.food_id || oi.combo_id,
      name: oi.item_name,
      price: parseFloat(oi.unit_price),
      type: oi.item_type || 'food',
      quantity: oi.quantity
    }));

    addBatchToCart(itemsToAdd);
    navigate('/cart');
  };

  const openReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setReviewRating(5);
    setReviewComment('');
    setReviewErrorMsg('');
    setReviewSuccessMsg('');
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedOrderForReview(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewErrorMsg('Please write a brief comment sharing your dining experience.');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewErrorMsg('');

      // Find primary food item in order if available
      const primaryFoodItem = selectedOrderForReview.items?.find((i) => i.food_id);

      const res = await reviewAPI.createReview({
        order_id: selectedOrderForReview.id,
        food_id: primaryFoodItem?.food_id || null,
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      if (res.data.success) {
        setReviewSuccessMsg('Thank you! Your verified review has been submitted.');
        setTimeout(() => {
          closeReviewModal();
          fetchOrders(); // refresh order reviews
        }, 1500);
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper orders-page">
      <div className="container">
        <div className="orders-header">
          <h1 className="orders-title">Your Order History</h1>
          <p className="orders-subtitle">
            View status, track live deliveries, reorder your favorite meals, and submit chef reviews.
          </p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching your past orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-card card">
            <Package size={52} className="empty-pkg-icon" />
            <h2>No orders placed yet</h2>
            <p>You haven't placed any food orders with BudgetBite yet. Satisfy your hunger today!</p>
            <Link to="/menu" className="btn btn-primary">
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isDelivered = order.order_status === 'Delivered';

              return (
                <div key={order.id} className="card order-card">
                  <div className="order-card-header">
                    <div className="order-main-meta">
                      <span className="order-id-tag">{order.order_number}</span>
                      <span className="order-date">
                        <Calendar size={14} />
                        <span>
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </span>
                    </div>

                    <div className="order-status-pill-wrap">
                      <span className={`status-pill ${order.order_status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="order-items-grid">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="ordered-item-chip">
                        <span className="chip-qty">{item.quantity}×</span>
                        <span className="chip-name">{item.item_name}</span>
                        <span className="chip-price">₹{parseFloat(item.subtotal).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total-block">
                      <span className="total-title">Total Amount:</span>
                      <span className="total-val">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      <span className="payment-tag">({order.payment_method})</span>
                    </div>

                    <div className="order-card-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleReorder(order)}
                        title="Add these items to your cart"
                      >
                        <Repeat size={14} />
                        <span>Reorder</span>
                      </button>

                      <Link
                        to={`/track-order/${order.order_number}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={14} />
                        <span>Track Order</span>
                      </Link>

                      {isDelivered && (
                        order.has_reviewed ? (
                          <div className="reviewed-badge">
                            <Star size={14} fill="currentColor" />
                            <span>Rated {order.review?.rating}★</span>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm review-order-btn"
                            onClick={() => openReviewModal(order)}
                          >
                            <Star size={14} />
                            <span>Rate & Review</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rating and Review Modal */}
        {reviewModalOpen && selectedOrderForReview && (
          <div className="modal-overlay" onClick={closeReviewModal}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Rate Order #{selectedOrderForReview.order_number}</h3>
                <button className="close-modal-btn" onClick={closeReviewModal}>
                  <X size={20} />
                </button>
              </div>

              {reviewSuccessMsg ? (
                <div className="modal-success-box">
                  <CheckCircle2 size={36} className="modal-check" />
                  <h4>{reviewSuccessMsg}</h4>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="review-form">
                  {reviewErrorMsg && (
                    <div className="modal-error-box">
                      <AlertCircle size={16} />
                      <span>{reviewErrorMsg}</span>
                    </div>
                  )}

                  <div className="star-rating-selector">
                    <label className="form-label">Your Overall Rating:</label>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          className={`star-pick-btn ${starVal <= reviewRating ? 'selected' : ''}`}
                          onClick={() => setReviewRating(starVal)}
                        >
                          <Star size={28} fill="currentColor" />
                        </button>
                      ))}
                    </div>
                    <span className="star-rating-label">
                      {reviewRating === 5 && 'Outstanding 🌟'}
                      {reviewRating === 4 && 'Very Good 👍'}
                      {reviewRating === 3 && 'Average 🙂'}
                      {reviewRating === 2 && 'Below Expectation 😕'}
                      {reviewRating === 1 && 'Poor 👎'}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Feedback / Review *</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How was the taste, portion size, and temperature of the food?"
                      required
                      className="form-textarea"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={closeReviewModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
