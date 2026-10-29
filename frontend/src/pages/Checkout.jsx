
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80";

function Checkout() {
  const navigate = useNavigate();

  const [cart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("budgetBiteCart") || "[]");
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  async function placeOrder(e) {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      navigate("/menu");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: cart.map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to place order.");
      }

      const order = {
        orderId: data.orderId,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cart,
        total: data.total,
        status: data.status,
        date: new Date().toLocaleString(),
      };

      localStorage.setItem("budgetBiteOrder", JSON.stringify(order));
      localStorage.removeItem("budgetBiteCart");

      navigate("/track-order");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check whether the backend is running."
          : err.message || "Could not place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-page">
      <header className="checkout-heading">
        <span className="checkout-eyebrow">ALMOST THERE</span>
        <h1>Complete your order.</h1>
        <p>Confirm your details and get your favourites delivered.</p>
      </header>

      {cart.length === 0 ? (
        <section className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add some items to the menu before checking out.</p>
          <Link className="checkout-primary-button" to="/menu">
            Explore the menu <span>→</span>
          </Link>
        </section>
      ) : (
        <div className="checkout-layout">
          <form className="checkout-details" onSubmit={placeOrder}>
            <section className="checkout-form-section">
              <span className="checkout-step">01</span>
              <div className="checkout-section-heading">
                <h2>Delivery details</h2>
                <p>Where should we deliver your order?</p>
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-name">Full name</label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-phone">Phone number</label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  title="Enter a 10-digit phone number"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="delivery-address">Delivery address</label>
                <textarea
                  id="delivery-address"
                  placeholder="House number, street, area and landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  maxLength={500}
                  rows={4}
                  required
                />
              </div>
            </section>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="checkout-place-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Placing your order..." : "Place order"}
              {!loading && <span>→</span>}
            </button>

            <p className="checkout-disclaimer">
              Please check your delivery details before confirming.
            </p>
          </form>

          <aside className="checkout-summary">
            <span className="checkout-eyebrow">YOUR SELECTION</span>
            <h2>Order summary</h2>
            <p className="checkout-item-count">
              {itemCount} items in your cart
            </p>

            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div className="checkout-summary-item" key={item.id}>
                  <img
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />

                  <div className="checkout-summary-info">
                    <h3>{item.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                  </div>

                  <strong>
                    ₹
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toFixed(0)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-total-row">
              <span>Subtotal</span>
              <strong>₹{total.toFixed(0)}</strong>
            </div>

            <p className="checkout-summary-note">
              Any additional charges will be shown if applicable.
            </p>

            <Link className="checkout-back-link" to="/cart">
              ← Back to cart
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Checkout;
