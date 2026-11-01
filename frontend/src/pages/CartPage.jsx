import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Bike
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    grandTotal,
    totalItems
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper cart-empty-page">
        <div className="container">
          <div className="empty-cart-card card">
            <div className="empty-cart-icon-box">
              <ShoppingBag size={48} />
            </div>
            <h2>Your cart is currently empty</h2>
            <p>
              Craving something delicious? Explore our handcrafted menu or build an affordable meal with our Smart Budget Planner.
            </p>
            <div className="empty-cart-actions">
              <Link to="/menu" className="btn btn-primary">
                <span>Explore Full Menu</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/budget-planner" className="btn btn-outline">
                <span>Launch Smart Budget Planner</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="cart-title">Your Order Cart ({totalItems} items)</h1>
          <button className="clear-cart-link" onClick={clearCart}>
            <Trash2 size={15} />
            <span>Clear Entire Cart</span>
          </button>
        </div>

        <div className="cart-grid-layout">
          {/* Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-wrapper card">
              {cartItems.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div key={`${item.type}-${item.id}`} className="cart-item-row">
                    <div className="item-thumbnail">
                      <img src={item.image_url} alt={item.name} />
                      {item.type === 'combo' ? (
                        <span className="combo-type-pill">Combo</span>
                      ) : (
                        <div className={`diet-indicator ${item.is_veg ? 'veg' : 'non-veg'} thumb-diet`}>
                          <span className="dot"></span>
                        </div>
                      )}
                    </div>

                    <div className="item-main-details">
                      <h4 className="item-title">{item.name}</h4>
                      <span className="item-unit-rate">₹{item.price.toFixed(0)} each</span>
                    </div>

                    {/* Quantity modifier */}
                    <div className="cart-qty-pill">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="item-subtotal-price">
                      <span>₹{itemTotal.toFixed(0)}</span>
                    </div>

                    <button
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id, item.type)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-continue-strip">
              <Link to="/menu" className="continue-shopping-link">
                <span>← Continue Shopping & Add More Dishes</span>
              </Link>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="cart-summary-column">
            <div className="order-summary-card card">
              <h3 className="summary-heading">Bill Details</h3>

              <div className="bill-row">
                <span className="bill-label">Item Subtotal</span>
                <span className="bill-val">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="bill-row">
                <span className="bill-label">
                  Delivery Partner Fee
                  {deliveryFee === 0 && <span className="free-tag">FREE</span>}
                </span>
                <span className="bill-val">
                  {deliveryFee === 0 ? '₹0.00' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {subtotal < 500 && (
                <div className="free-delivery-tip">
                  <Bike size={16} className="tip-icon" />
                  <span>
                    Add <strong>₹{(500 - subtotal).toFixed(0)}</strong> more for <strong>FREE Delivery</strong>!
                  </span>
                </div>
              )}

              <hr className="bill-divider" />

              <div className="bill-row total-row">
                <span className="total-label">To Pay</span>
                <span className="total-val">₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-primary checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="checkout-trust-box">
                <ShieldCheck size={16} className="trust-icon" />
                <span>Verified Fresh & Safely Handled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
