import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, profileAPI } from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, subtotal, deliveryFee, grandTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    delivery_address: '',
    delivery_instructions: '',
    payment_method: 'Cash on Delivery'
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If user is logged in, autofill their saved profile/addresses
  useEffect(() => {
    if (isAuthenticated) {
      profileAPI.getProfile()
        .then((res) => {
          if (res.data.success) {
            const userData = res.data.user;
            const addrs = res.data.addresses;
            setSavedAddresses(addrs || []);

            const defaultAddr = addrs?.find((a) => a.is_default) || addrs?.[0];
            const formattedAddr = defaultAddr
              ? `${defaultAddr.address_line}${defaultAddr.landmark ? ', near ' + defaultAddr.landmark : ''}, ${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.postal_code}`
              : '';

            setFormData((prev) => ({
              ...prev,
              customer_name: userData.name || prev.customer_name,
              customer_email: userData.email || prev.customer_email,
              customer_phone: userData.phone || prev.customer_phone,
              delivery_address: formattedAddr || prev.delivery_address
            }));
          }
        })
        .catch((err) => {
          console.error('Failed to load profile for checkout:', err);
        });
    }
  }, [isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectSavedAddress = (addr) => {
    const formatted = `${addr.address_line}${addr.landmark ? ', near ' + addr.landmark : ''}, ${addr.city}, ${addr.state} - ${addr.postal_code}`;
    setFormData((prev) => ({ ...prev, delivery_address: formatted }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend validation
    if (!formData.customer_name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.customer_phone.trim() || formData.customer_phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!formData.customer_email.trim()) {
      setErrorMsg('Please enter your email address for order notifications.');
      return;
    }
    if (!formData.delivery_address.trim()) {
      setErrorMsg('Please specify your complete delivery address.');
      return;
    }

    try {
      setLoading(true);

      // Prepare order payload
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        delivery_instructions: formData.delivery_instructions,
        payment_method: formData.payment_method,
        items: cartItems.map((ci) => ({
          id: ci.id,
          type: ci.type || 'food',
          quantity: ci.quantity
        }))
      };

      const res = await orderAPI.createOrder(orderPayload);

      if (res.data.success) {
        const orderNumber = res.data.order.order_number;
        // Clear cart only after confirmed backend transaction
        clearCart();
        // Redirect to live order tracking page
        navigate(`/track-order/${orderNumber}`);
      }
    } catch (err) {
      console.error('Order submission error:', err);
      const serverMsg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setErrorMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper checkout-page">
      <div className="container">
        <div className="checkout-head">
          <h1 className="checkout-title">Checkout & Confirm Order</h1>
          <p className="checkout-sub">
            Review your delivery details and choose your preferred payment method.
          </p>
        </div>

        {errorMsg && (
          <div className="checkout-error-banner">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="checkout-grid-layout">
          {/* Left Column: Delivery & Payment Details */}
          <div className="checkout-form-column">
            {/* Customer Details */}
            <div className="card checkout-card">
              <h3 className="section-title">1. Contact Information</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div className="input-icon-box">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <div className="input-icon-box">
                    <Phone size={16} className="field-icon" />
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="input-icon-box">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    placeholder="e.g. rahul@example.com"
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card checkout-card">
              <h3 className="section-title">2. Delivery Address</h3>

              {savedAddresses.length > 0 && (
                <div className="saved-addresses-selector">
                  <span className="saved-label">Quick select from saved addresses:</span>
                  <div className="saved-addr-chips">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        className="saved-addr-chip"
                        onClick={() => handleSelectSavedAddress(addr)}
                      >
                        <MapPin size={13} />
                        <span>{addr.address_line.slice(0, 32)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Complete Street Address *</label>
                <textarea
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  placeholder="Flat/House No, Building Name, Street, Landmark, City & Pincode"
                  required
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  name="delivery_instructions"
                  value={formData.delivery_instructions}
                  onChange={handleChange}
                  placeholder="e.g. Please ring doorbell and leave with security guard"
                  className="form-input"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card checkout-card">
              <h3 className="section-title">3. Payment Method</h3>

              <div className="payment-options-grid">
                <label className={`payment-option-label ${formData.payment_method === 'Cash on Delivery' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="Cash on Delivery"
                    checked={formData.payment_method === 'Cash on Delivery'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <Banknote size={24} className="pay-icon" />
                    <div>
                      <span className="pay-title">Cash on Delivery</span>
                      <span className="pay-desc">Pay cash or UPI to the delivery rider at your doorstep</span>
                    </div>
                  </div>
                </label>

                <label className={`payment-option-label ${formData.payment_method === 'Online Payment' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="Online Payment"
                    checked={formData.payment_method === 'Online Payment'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <CreditCard size={24} className="pay-icon" />
                    <div>
                      <span className="pay-title">Online Payment (UPI / Card / NetBanking)</span>
                      <span className="pay-desc">Simulated sandbox transaction with instant confirmation</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review */}
          <div className="checkout-summary-column">
            <div className="card checkout-summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="items-mini-list">
                {cartItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="mini-item-row">
                    <span className="mini-item-name">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="mini-item-val">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="summary-hr" />

              <div className="bill-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div className="bill-row grand-total-row">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary place-order-btn"
                disabled={loading}
              >
                {loading ? 'Validating & Processing...' : `Confirm & Place Order (₹${grandTotal.toFixed(0)})`}
              </button>

              <div className="security-guarantee">
                <ShieldCheck size={16} />
                <span>Protected by 256-bit encryption & strict price validation</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
