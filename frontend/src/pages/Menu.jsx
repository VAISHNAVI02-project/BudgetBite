
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api/foods";

function getFoodImage(name, category) {
  const foodName = (name || "").toLowerCase();

  const images = [
    {
      keywords: ["pizza"],
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["burger"],
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["sandwich"],
      url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["fries"],
      url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["noodles"],
      url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["fried rice", "rice"],
      url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["gobi manchurian", "manchurian"],
      url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["chicken"],
      url: "https://images.unsplash.com/photo-160 chicken?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["juice", "drink", "shake"],
      url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=85",
    },
    {
      keywords: ["egg"],
      url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=85",
    },
  ];

  const match = images.find((item) =>
    item.keywords.some((keyword) => foodName.includes(keyword))
  );

  if (match && !match.url.includes("160 chicken")) {
    return match.url;
  }

  if ((category || "").toLowerCase().includes("veg")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=85";
  }

  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=85";
}

function Menu() {
  const [searchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [budget, setBudget] = useState(searchParams.get("budget") || "");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedFood, setAddedFood] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load food items.");
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
    const fitsBudget = budget === "" || Number(food.price) <= Number(budget);
    const fitsCategory =
      category === "All" || food.category === category;

    return fitsBudget && fitsCategory;
  });

  function addToCart(food) {
    const cart = JSON.parse(
      localStorage.getItem("budgetBiteCart") || "[]"
    );

    const existing = cart.find((item) => item.id === food.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        ...food,
        price: Number(food.price),
        imageUrl: getFoodImage(food.name, food.category),
        quantity: 1,
      });
    }

    localStorage.setItem("budgetBiteCart", JSON.stringify(cart));
    setAddedFood(food.name);
    window.setTimeout(() => setAddedFood(""), 2200);
  }

  return (
    <div className="menu-page">
      <section className="menu-heading">
        <span className="menu-eyebrow">THE BUDGETBITE MENU</span>
        <h1>Good food, your way.</h1>
        <p>Discover your favourites without going over budget.</p>
      </section>

      <section className="menu-controls">
        <div className="menu-budget-field">
          <label htmlFor="menu-budget">Your budget</label>
          <div className="menu-input-wrap">
            <span>₹</span>
            <input
              id="menu-budget"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <div className="menu-category-field">
          <label htmlFor="menu-category">Food category</label>
          <select
            id="menu-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All categories" : item}
              </option>
            ))}
          </select>
        </div>

        <p className="menu-result-count">
          {loading ? "Loading menu..." : `${filteredFoods.length} items found`}
        </p>
      </section>

      {addedFood && (
        <p className="menu-success" role="status">
          {addedFood} added to your cart.
        </p>
      )}

      {loading ? (
        <p className="menu-message">Loading our menu...</p>
      ) : error ? (
        <p className="menu-error">{error}</p>
      ) : filteredFoods.length > 0 ? (
        <section className="menu-grid">
          {filteredFoods.map((food) => (
            <article className="menu-card" key={food.id}>
              <div className="menu-image-wrap">
                <img
                  className="menu-food-image"
                  src={getFoodImage(food.name, food.category)}
                  alt={food.name}
                  loading="lazy"
                />
                <span className="menu-category-tag">{food.category}</span>
              </div>

              <div className="menu-card-content">
                <h2>{food.name}</h2>
                <p className="menu-food-description">
                  {food.description || "Freshly prepared and ready to enjoy."}
                </p>

                <div className="menu-card-bottom">
                  <span className="menu-food-price">
                    ₹{Number(food.price).toFixed(0)}
                  </span>
                  <button
                    className="menu-add-button"
                    onClick={() => addToCart(food)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="menu-empty">
          <h2>No matching food found</h2>
          <p>Try increasing your budget or choosing another category.</p>
          <button
            className="menu-reset-button"
            onClick={() => {
              setBudget("");
              setCategory("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Menu;
