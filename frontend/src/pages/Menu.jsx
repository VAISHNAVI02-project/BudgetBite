
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api/foods";


function getEmoji(category, name) {
  const foodName = name.toLowerCase();

  if (foodName.includes("pizza")) {
    if (foodName.includes("paneer")) return "🧀🍕";
    if (foodName.includes("cheese")) return "🧀🍕";
    return "🍕";
  }

  if (foodName.includes("burger")) return "🍔";
  if (foodName.includes("sandwich")) return "🥪";
  if (foodName.includes("fries")) return "🍟";
  if (foodName.includes("fried rice")) return "🍚";
  if (foodName.includes("noodles")) return "🍜";

  if (foodName.includes("gobi manchurian")) return "🥦";
  if (foodName.includes("chicken manchurian")) return "🍗";

  if (foodName.includes("juice")) return "🧃";
  if (foodName.includes("cool drink")) return "🥤";

  if (foodName.includes("chicken")) return "🍗";
  if (foodName.includes("egg")) return "🍳";

  if (category === "Veg") return "🥗";

  return "🍽️";
}


function Menu() {
  const [searchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [budget, setBudget] = useState(
    searchParams.get("budget") || ""
  );
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load food items.");
        }
        return response.json();
      })
      .then((data) => {
        setFoods(data);
        setError("");
      })
      .catch(() => {
        setError(
          "Unable to load food items. Please check whether the backend server is running."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All",
    ...new Set(foods.map((food) => food.category).filter(Boolean)),
  ];

  const filteredFoods = foods.filter((food) => {
    const price = Number(food.price);
    const fitsBudget = budget === "" || price <= Number(budget);
    const fitsCategory =
      category === "All" || food.category === category;

    return fitsBudget && fitsCategory;
  });

  function addToCart(food) {
    const cart = JSON.parse(
      localStorage.getItem("budgetBiteCart") || "[]"
    );

    const cartFood = {
      ...food,
      price: Number(food.price),
      emoji: getEmoji(food.category, food.name),
    };

    const existing = cart.find((item) => item.id === food.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...cartFood, quantity: 1 });
    }

    localStorage.setItem("budgetBiteCart", JSON.stringify(cart));
    alert(`${food.name} added to cart!`);
  }

  return (
    <div className="page-container">
      <h1>Explore Food 🍽️</h1>
      <p>Choose delicious food that fits your budget.</p>

      <div className="filter-bar">
        <input
          type="number"
          min="1"
          placeholder="Your budget (₹)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading delicious food...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="food-grid">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <div className="food-card" key={food.id}>
                <div className="food-emoji">
                  {getEmoji(food.category, food.name)}
                </div>

                <h3>{food.name}</h3>
                <p>{food.category}</p>
                <p>{food.description}</p>
                <h2>₹{Number(food.price).toFixed(0)}</h2>

                <button onClick={() => addToCart(food)}>
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <p>No food found within this budget. Try a higher amount.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Menu;
