
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/orders";

const STEPS = [
  "Order Placed",
  "Preparing Food",
  "Out for Delivery",
  "Delivered",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80";

function TrackOrder() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let orderId;

    try {
      const savedOrder = JSON.parse(
        localStorage.getItem("budgetBiteOrder") || "null"
      );
      orderId = savedOrder?.orderId;
    } catch {
      orderId = null;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchOrder() {
      try {
        const response = await fetch(`${API_URL}/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load order.");
        }

        if (active) {
          setOrder(data);
          setError("");
          localStorage.setItem("budgetBiteOrder", JSON.stringify(data));
        }
      } catch (err) {
        if (active) {
          setError(
            err.message === "Failed to fetch"
              ? "Unable to connect to the server. Please check whether the backend is running."
              : err.message || "Unable to load your order."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchOrder();
    const intervalId = setInterval(fetchOrder, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const status = order?.status || "";
  const currentStep = STEPS.indexOf(status);
  const isCancelled = status.toLowerCase() === "cancelled";
  const items = Array.isArray(order?.items) ? order.items : [];

  const customerName = order?.name || order?.customer_name || "Customer";
  const orderDate = order?.date || order?.created_at;

  if (loading) {
    return (
      <main className="tracking-page">
        <div className="tracking-loading">
          <span className="tracking-eyebrow">BUDGETBITE ORDERS</span>
          <h1>Loading your order</h1>
          <p>Please wait while we retrieve your latest order details.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="tracking-page">
      <header className="tracking-heading">
        <span className="tracking-eyebrow">ORDER UPDATES</span>
        <h1>Your order, tracked.</h1>
        <p>Follow your order from preparation to delivery.</p>
      </header>

      {error ? (
        <section className="tracking-empty">
          <h2>We couldn't load your order</h2>
          <p>{error}</p>
          <button
            className="tracking-primary-button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      ) : !order ? (
        <section className="tracking-empty">
          <h2>No order to track yet</h2>
          <p>Once you place an order, its progress will appear here.</p>
          <Link className="tracking-primary-button" to="/menu">
            Explore the menu <span>→</span>
          </Link>
        </section>
      ) : (
        <>
          <section className="tracking-order-banner">
            <div>
              <span className="tracking-eyebrow">ORDER REFERENCE</span>
              <h2>Order #{order.orderId}</h2>
              <p>
                Placed{" "}
                {orderDate
                  ? new Date(orderDate).toLocaleString()
                  : "Date unavailable"}
              </p>
            </div>
            <span
              className={`tracking-status-badge ${
                isCancelled
                  ? "tracking-status-cancelled"
                  : status === "Delivered"
                    ? "tracking-status-delivered"
                    : ""
              }`}
            >
              {status || "Status unavailable"}
            </span>
          </section>

          <section className="tracking-progress-panel">
            <div className="tracking-panel-heading">
              <div>
                <span className="tracking-eyebrow">LIVE ORDER STATUS</span>
                <h2>
                  {isCancelled
                    ? "This order was cancelled"
                    : status === "Delivered"
                      ? "Your order is delivered"
                      : currentStep >= 0
                        ? STEPS[currentStep]
                        : status || "Order progress"}
                </h2>
              </div>
              <span className="tracking-refresh-label">
                Auto-refreshes every 5 seconds
              </span>
            </div>

            {isCancelled ? (
              <p className="tracking-cancelled-message">
                This order has been cancelled. Please contact the restaurant
                if you need more information.
              </p>
            ) : (
              <div className="tracking-timeline">
                {STEPS.map((step, index) => {
                  const completed = currentStep >= index;
                  const active = currentStep === index;

                  return (
                    <div
                      className={`tracking-timeline-step ${
                        completed ? "is-completed" : ""
                      } ${active ? "is-active" : ""}`}
                      key={step}
                    >
                      <div className="tracking-step-marker">
                        {completed ? "✓" : index + 1}
                      </div>
                      <p>{step}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="tracking-content-grid">
            <section className="tracking-items-panel">
              <div className="tracking-section-heading">
                <h2>Items in your order</h2>
                <span>{items.length} products</span>
              </div>

              {items.map((item, index) => (
                <article
                  className="tracking-food-item"
                  key={item.id ?? `${item.name}-${index}`}
                >
                  <img
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name || "Ordered food"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />

                  <div className="tracking-food-info">
                    <h3>{item.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                  </div>

                  <strong>
                    ₹
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toFixed(0)}
                  </strong>
                </article>
              ))}

              <div className="tracking-total-row">
                <span>Order total</span>
                <strong>₹{Number(order.total || 0).toFixed(0)}</strong>
              </div>
            </section>

            <aside className="tracking-delivery-panel">
              <span className="tracking-eyebrow">DELIVERY INFORMATION</span>
              <h2>Delivering to</h2>

              <div className="tracking-detail">
                <span>Customer</span>
                <p>{customerName}</p>
              </div>

              <div className="tracking-detail">
                <span>Address</span>
                <p>{order.address || "Address unavailable"}</p>
              </div>

              {order.phone && (
                <div className="tracking-detail">
                  <span>Phone number</span>
                  <p>{order.phone}</p>
                </div>
              )}

              <Link
                className="tracking-menu-link"
                to="/menu"
              >
                Order more food <span>→</span>
              </Link>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}

export default TrackOrder;
