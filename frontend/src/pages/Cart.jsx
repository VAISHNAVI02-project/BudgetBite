
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("budgetBiteCart") || "[]"
    );
    setCart(savedCart);
  }, []);

  function updateCart(updatedCart) {
    setCart(updatedCart);
    localStorage.setItem("budgetBiteCart", JSON.stringify(updatedCart));
  }

  function changeQuantity(id, amount) {
    const updatedCart = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + amount }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updatedCart);
  }

  function removeItem(id) {
    updateCart(cart.filter((item) => item.id !== id));
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="page-container">
      <h1>Your Cart 🛒</h1>

      {cart.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/menu">
            <button>Explore Food</button>
          </Link>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <span className="cart-emoji">{item.emoji}</span>

              <div className="cart-details">
                <h3>{item.name}</h3>
                <p>₹{item.price} each</p>
              </div>

              <div className="quantity-controls">
                <button onClick={() => changeQuantity(item.id, -1)}>
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => changeQuantity(item.id, 1)}>
                  +
                </button>
              </div>

              <strong>₹{item.price * item.quantity}</strong>

              <button
                className="remove-button"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-total">
            <h2>Total: ₹{total}</h2>
            <Link to="/checkout">
              <button>Proceed to Checkout</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
