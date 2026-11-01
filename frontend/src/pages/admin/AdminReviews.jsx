import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { reviewAPI } from '../../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await reviewAPI.getReviews();
        if (res.data.success) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="admin-reviews-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Customer Feedback & Reviews</h1>
          <p className="admin-page-sub">Verified customer ratings on delivered meals</p>
        </div>
      </div>

      <div className="card admin-table-card">
        {loading ? (
          <div className="loading-state">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No customer reviews submitted yet.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order #</th>
                <th>Dish</th>
                <th>Rating</th>
                <th>Feedback / Review</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.id}>
                  <td>
                    <strong>{rev.customer_name}</strong>
                  </td>
                  <td>
                    <code>{rev.order_number}</code>
                  </td>
                  <td>
                    <span className="badge badge-sage">{rev.food_name || 'Delivered Meal'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '350px' }}>
                    <p style={{ fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--color-plum)' }}>
                      "{rev.comment}"
                    </p>
                  </td>
                  <td>
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
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

export default AdminReviews;
