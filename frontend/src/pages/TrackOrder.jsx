
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
        const response = await fetch(
          `http://localhost:5000/api/orders/${orderId}`
        );
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
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    const intervalId = setInterval(fetchOrder, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const steps = [
    "Order Placed",
    "Preparing Food",
    "Out for Delivery",
    "Delivered",
  ];

  const currentStep = order ? steps.indexOf(order.status) : -1;

  if (loading) {
    return (
      <div className="page-container">
        <h1>Track Your Order 📦</h1>
        <p>Loading your order details...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Track Your Order 📦</h1>
      <p>Check the latest status of your BudgetBite order.</p>

      {error && (
        <div className="empty-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {!error && !order ? (
        <div className="empty-state">
          <h2>No order found</h2>
          <p>Place an order first to see its details here.</p>
          <Link to="/menu">
            <button>Explore Food</button>
          </Link>
        </div>
      ) : !error && order ? (
        <div className="tracking-card">
          <h2>Order #{order.orderId}</h2>

          <p>
            <strong>Customer:</strong> {order.name}
          </p>
          <p>
            <strong>Delivery Address:</strong> {order.address}
          </p>
          <p>
            <strong>Order Date:</strong>{" "}
            {order.date ? new Date(order.date).toLocaleString() : "N/A"}
          </p>

          <div className="tracking-status">
            <h3>Order Progress</h3>

            {steps.map((step, index) => (
              <div
                className={`tracking-step ${
                  index <= currentStep ? "completed" : ""
                }`}
                key={step}
              >
                <span>{index < currentStep ? "✓" : index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          <h3>Items Ordered</h3>

          {order.items.map((item) => (
            <p key={item.id}>
              {item.emoji} {item.name} × {item.quantity} — ₹
              {Number(item.price) * item.quantity}
            </p>
          ))}

          <h2>Total: ₹{order.total}</h2>

          <p>
            <strong>Current Status:</strong> {order.status}
          </p>

          <p><small>Order status refreshes automatically every 5 seconds.</small></p>

          <Link to="/menu">
            <button>Order More Food</button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default TrackOrder;
