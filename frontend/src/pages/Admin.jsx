
import { useEffect, useState } from "react";

const statuses = [
  "Order Placed",
  "Preparing Food",
  "Out for Delivery",
  "Delivered",
];

function Admin() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function fetchOrders() {
    try {
      const response = await fetch("http://localhost:5000/api/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load orders.");
      }

      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/summary"
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load summary.");
      }

      setSummary(data);
    } catch (err) {
      setError(err.message || "Unable to load dashboard summary.");
    }
  }

  async function refreshDashboard() {
    await Promise.all([fetchOrders(), fetchSummary()]);
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  async function updateStatus(orderId, newStatus) {
    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update status.");
      }

      setOrders((previous) =>
        previous.map((order) =>
          String(order.orderId) === String(orderId)
            ? { ...order, status: data.status }
            : order
        )
      );

      const savedOrder = JSON.parse(
        localStorage.getItem("budgetBiteOrder") || "null"
      );

      if (savedOrder && String(savedOrder.orderId) === String(orderId)) {
        localStorage.setItem(
          "budgetBiteOrder",
          JSON.stringify({ ...savedOrder, status: data.status })
        );
      }

      await fetchSummary();
    } catch (err) {
      setError(err.message || "Could not update order status.");
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  }

  const summaryCards = summary
    ? [
        { title: "Total Orders", value: summary.totalOrders },
        {
          title: "Total Revenue",
          value: `₹${Number(summary.totalRevenue || 0).toLocaleString("en-IN")}`,
        },
        { title: "Order Placed", value: summary.placedOrders },
        { title: "Preparing Food", value: summary.preparingOrders },
        { title: "Out for Delivery", value: summary.deliveryOrders },
        { title: "Delivered", value: summary.deliveredOrders },
      ]
    : [];

  return (
    <main className="admin-page">
      <section className="admin-heading">
        <span className="admin-eyebrow">BUDGETBITE MANAGEMENT</span>
        <div className="admin-heading-row">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage orders, monitor revenue and update delivery progress.</p>
          </div>

          <button
            className="admin-refresh-button"
            onClick={refreshDashboard}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Dashboard"}
          </button>
        </div>
      </section>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-overview">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">AT A GLANCE</span>
            <h2>Dashboard Overview</h2>
          </div>
        </div>

        {summary ? (
          <div className="admin-summary-grid">
            {summaryCards.map((card, index) => (
              <article className="admin-summary-card" key={card.title}>
                <span className="admin-card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{card.title}</p>
                <h3>{card.value ?? 0}</h3>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-muted">
            Dashboard summary is unavailable. Try refreshing.
          </p>
        )}
      </section>

      <section className="admin-orders-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">ORDER MANAGEMENT</span>
            <h2>Customer Orders</h2>
          </div>
          <span className="admin-order-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            <p>Loading customer orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No orders yet</h3>
            <p>Customer orders will appear here after checkout.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <article className="admin-order-card" key={order.orderId}>
                <div className="admin-order-top">
                  <div>
                    <span className="admin-eyebrow">ORDER REFERENCE</span>
                    <h3>#{order.orderId}</h3>
                  </div>
                  <span className="admin-status-label">{order.status}</span>
                </div>

                <div className="admin-order-details">
                  <div>
                    <span>Customer</span>
                    <p>{order.name || "Not provided"}</p>
                  </div>
                  <div>
                    <span>Phone</span>
                    <p>{order.phone || "Not provided"}</p>
                  </div>
                  <div className="admin-address">
                    <span>Delivery Address</span>
                    <p>{order.address || "Not provided"}</p>
                  </div>
                  <div>
                    <span>Order Total</span>
                    <p className="admin-order-total">
                      ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="admin-items-section">
                  <h4>Items Ordered</h4>
                  {(order.items || []).map((item, index) => (
                    <div
                      className="admin-item-row"
                      key={item.id ?? `${item.name}-${index}`}
                    >
                      <span>{item.name} × {item.quantity}</span>
                      <strong>
                        ₹{(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="admin-status-control">
                  <label htmlFor={`status-${order.orderId}`}>
                    Update Order Status
                  </label>
                  <select
                    id={`status-${order.orderId}`}
                    value={order.status}
                    disabled={updatingId === order.orderId}
                    onChange={(event) =>
                      updateStatus(order.orderId, event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {updatingId === order.orderId && (
                    <span className="admin-updating">Saving status...</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;
