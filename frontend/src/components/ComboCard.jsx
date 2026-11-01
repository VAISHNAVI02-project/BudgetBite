import React from 'react';
import { Sparkles, CheckCircle2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ComboCard.css';

const ComboCard = ({ combo }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find((ci) => ci.id === combo.id && ci.type === 'combo');
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(combo, 1, 'combo');
  };

  const handleIncrement = () => {
    updateQuantity(combo.id, 'combo', quantityInCart + 1);
  };

  const handleDecrement = () => {
    updateQuantity(combo.id, 'combo', quantityInCart - 1);
  };

  return (
    <div className="card combo-card">
      <div className="combo-image-box">
        <img
          src={combo.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
          alt={combo.name}
          className="combo-img"
          loading="lazy"
        />
        {parseFloat(combo.savings) > 0 && (
          <div className="savings-badge">
            <Sparkles size={13} />
            <span>SAVE ₹{parseFloat(combo.savings).toFixed(0)}</span>
          </div>
        )}
      </div>

      <div className="combo-body">
        <h3 className="combo-title">{combo.name}</h3>
        <p className="combo-desc">{combo.description}</p>

        {combo.items && combo.items.length > 0 && (
          <div className="combo-items-list">
            <span className="items-header">Includes:</span>
            <ul>
              {combo.items.map((item, index) => (
                <li key={index}>
                  <CheckCircle2 size={14} className="check-icon" />
                  <span>
                    {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="combo-footer">
          <div className="combo-pricing">
            {parseFloat(combo.original_price) > parseFloat(combo.price) && (
              <span className="original-price">₹{parseFloat(combo.original_price).toFixed(0)}</span>
            )}
            <div className="current-price">
              <span className="currency">₹</span>
              <span className="amount">{parseFloat(combo.price).toFixed(0)}</span>
            </div>
          </div>

          <div className="combo-action">
            {quantityInCart > 0 ? (
              <div className="qty-controls">
                <button className="qty-btn" onClick={handleDecrement} aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <span className="qty-count">{quantityInCart}</span>
                <button className="qty-btn" onClick={handleIncrement} aria-label="Increase">
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm add-combo-btn" onClick={handleAdd}>
                <ShoppingBag size={15} />
                <span>Add Combo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboCard;
