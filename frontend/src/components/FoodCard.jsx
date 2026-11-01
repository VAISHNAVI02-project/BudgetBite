import React from 'react';
import { Plus, Minus, Star, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find((ci) => ci.id === food.id && ci.type === 'food');
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!food.is_available) return;
    addToCart(food, 1, 'food');
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(food.id, 'food', quantityInCart + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(food.id, 'food', quantityInCart - 1);
  };

  return (
    <div className={`card food-card ${!food.is_available ? 'unavailable' : ''}`}>
      {/* Image & Indicators */}
      <div className="food-image-wrapper">
        <img
          src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
          alt={food.name}
          className="food-image"
          loading="lazy"
        />

        {/* Veg / Non-veg indicator */}
        <div className="food-diet-badge">
          <div className={`diet-indicator ${food.is_veg ? 'veg' : 'non-veg'}`}>
            <span className="dot"></span>
          </div>
        </div>

        {/* Category Pill */}
        {food.category_name && (
          <span className="food-category-pill">
            {food.category_name}
          </span>
        )}

        {!food.is_available && (
          <div className="out-of-stock-overlay">
            <span>Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="food-content">
        <div className="food-header">
          <h3 className="food-title">{food.name}</h3>
          <div className="food-rating">
            <Star size={13} className="star-icon" fill="currentColor" />
            <span className="rating-val">{parseFloat(food.rating || 4.5).toFixed(1)}</span>
            <span className="rating-count">({food.rating_count || 12})</span>
          </div>
        </div>

        <p className="food-desc">{food.description}</p>

        {/* Crave tags */}
        {food.tags && (
          <div className="food-tags">
            {food.tags.split(',').map((tag, i) => (
              <span key={i} className="food-tag">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="food-footer">
          <div className="price-box">
            <span className="currency-symbol">₹</span>
            <span className="price-amount">{parseFloat(food.price).toFixed(0)}</span>
          </div>

          <div className="food-action">
            {!food.is_available ? (
              <span className="sold-out-btn">Unavailable</span>
            ) : quantityInCart > 0 ? (
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-count">{quantityInCart}</span>
                <button
                  className="qty-btn"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline btn-sm add-cart-btn"
                onClick={handleAdd}
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
