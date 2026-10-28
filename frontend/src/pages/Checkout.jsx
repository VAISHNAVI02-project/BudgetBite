
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem("budgetBiteCart") || "[]");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  async function placeOrder(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
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
          customer_name: name,
          phone,
          address,
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to place order.");
      }

      const order = {
        orderId: data.orderId,
        name,
        phone,
        address,
        items: cart,
        total: data.total,
        status: data.status,
        date: new Date().toLocaleString(),
      };

      localStorage.setItem("budgetBiteOrder", JSON.stringify(order));
      localStorage.removeItem("budgetBiteCart");

      alert("Order placed successfully!");
      navigate("/track-order");
    } catch (error) {
      alert(error.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <h1>Checkout 🧾</h1>
      <p>Enter your delivery details to place your order.</p>

      {cart.length === 0 ? (
        <div>
          <p>Your cart is empty. Add food before checkout.</p>
          <button onClick={() => navigate("/menu")}>
            Explore Food
          </button>
        </div>
      ) : (
        <form className="checkout-form" onSubmit={placeOrder}>
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <p key={item.id}>
              {item.emoji} {item.name} × {item.quantity} — ₹
              {Number(item.price) * item.quantity}
            </p>
          ))}

          <h2>Total: ₹{total}</h2>

          <label htmlFor="customer-name">Full Name</label>
          <input
            id="customer-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="customer-phone">Phone Number</label>
          <input
            id="customer-phone"
            type="tel"
            placeholder="Enter 10-digit phone number"
            pattern="[0-9]{10}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label htmlFor="delivery-address">Delivery Address</label>
          <textarea
            id="delivery-address"
            placeholder="Enter your full delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="4"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      )}
    </div>
  );
}

export default Checkout;
