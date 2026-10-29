
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("budgetBiteCart") || "[]"
      );
      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setCart([]);
    }
  }, []);

  function updateCart(updatedCart) {
    setCart(updatedCart);
    localStorage.setItem("budgetBiteCart", JSON.stringify(updatedCart));
  }

  function changeQuantity(id, amount) {
    const updatedCart = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Number(item.quantity) + amount }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updatedCart);
  }

  function removeItem(id) {
    updateCart(cart.filter((item) => item.id !== id));
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  return (
    <div className="cart-page">
      <header className="cart-heading">
        <span className="cart-eyebrow">YOUR SELECTION</span>
        <h1>Your shopping cart</h1>
        <p>Review your items before moving to checkout.</p>
      </header>

      {cart.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-line" />
          <h2>Your cart is waiting for something delicious.</h2>
          <p>Explore the menu and add your favourite meals.</p>
          <Link className="cart-primary-link" to="/menu">
            Explore the menu <span>→</span>
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-section">
            <div className="cart-items-heading">
              <h2>Order items</h2>
              <span>{itemCount} items</span>
            </div>

            {cart.map((item) => (
              <article className="cart-product" key={item.id}>
                <img
                  className="cart-product-image"
                  src={item.imageUrl || FALLBACK_IMAGE}
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                <div className="cart-product-info">
                  <span className="cart-product-category">
                    {item.category || "Menu item"}
                  </span>
                  <h3>{item.name}</h3>
                  <p>₹{Number(item.price).toFixed(0)} per item</p>

                  <button
                    className="cart-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove item
                  </button>
                </div>

                <div className="cart-product-actions">
                  <div className="cart-quantity">
                    <button
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => changeQuantity(item.id, -1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => changeQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <strong className="cart-line-total">
                    ₹
                    {(Number(item.price) * Number(item.quantity)).toFixed(0)}
                  </strong>
                </div>
              </article>
            ))}

            <Link className="cart-continue-link" to="/menu">
              ← Continue shopping
            </Link>
          </section>

          <aside className="cart-summary">
            <span className="cart-eyebrow">ORDER SUMMARY</span>
            <h2>Order total</h2>

            <div className="cart-summary-row">
              <span>Items ({itemCount})</span>
              <span>₹{total.toFixed(0)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="cart-summary-total">
              <span>Subtotal</span>
              <strong>₹{total.toFixed(0)}</strong>
            </div>

            <p className="cart-summary-note">
              Final charges, if any, will be shown before you place your order.
            </p>

            <Link className="cart-checkout-button" to="/checkout">
              Proceed to checkout <span>→</span>
            </Link>

            <p className="cart-secure-note">
              Review your order details before confirming.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
