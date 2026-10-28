
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

      setOrders(data);
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

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
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
      alert("Order status updated successfully!");
    } catch (err) {
      setError(err.message || "Could not update order status.");
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  }

  const summaryCards = summary
    ? [
        {
          title: "Total Orders",
          value: summary.totalOrders,
          color: "#e8f0ff",
        },
        {
          title: "Total Revenue",
          value: `₹${Number(summary.totalRevenue).toLocaleString("en-IN")}`,
          color: "#e5f8eb",
        },
        {
          title: "Order Placed",
          value: summary.placedOrders,
          color: "#fff3d6",
        },
        {
          title: "Preparing Food",
          value: summary.preparingOrders,
          color: "#f0e8ff",
        },
        {
          title: "Out for Delivery",
          value: summary.deliveryOrders,
          color: "#ffe9df",
        },
        {
          title: "Delivered",
          value: summary.deliveredOrders,
          color: "#ddf7f4",
        },
      ]
    : [];

  return (
    <div className="page-container">
      <h1>Admin Dashboard ⚙️</h1>
      <p>Manage customer orders, revenue, and delivery status.</p>

      <button onClick={refreshDashboard} disabled={loading}>
        Refresh Dashboard
      </button>

      {error && <p role="alert">{error}</p>}

      <h2>Dashboard Overview 📊</h2>

      {summary ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "16px",
            margin: "20px 0 30px",
          }}
        >
          {summaryCards.map((card) => (
            <div
              key={card.title}
              style={{
                background: card.color,
                color: "#222",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <p style={{ margin: "0 0 10px" }}>{card.title}</p>
              <h2 style={{ margin: 0 }}>{card.value}</h2>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading dashboard summary...</p>
      )}

      <h2>Customer Orders 🧾</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders available</h2>
          <p>Customer orders will appear here after checkout.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className="admin-order-card" key={order.orderId}>
            <h2>Order #{order.orderId}</h2>
            <p><strong>Customer:</strong> {order.name}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>

            <h3>Items</h3>
            {order.items.map((item) => (
              <p key={item.id}>
                {item.emoji} {item.name} × {item.quantity} — ₹
                {item.price * item.quantity}
              </p>
            ))}

            <label htmlFor={`status-${order.orderId}`}>
              Update Order Status
            </label>

            <select
              id={`status-${order.orderId}`}
              value={order.status}
              disabled={updatingId === order.orderId}
              onChange={(e) =>
                updateStatus(order.orderId, e.target.value)
              }
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <p><strong>Current Status:</strong> {order.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;
