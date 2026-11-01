import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Flame,
  Star,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { foodAPI, categoryAPI, comboAPI, reviewAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import ComboCard from '../components/ComboCard';
import './HomePage.css';

const HomePage = () => {
  const [popularFoods, setPopularFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quickBudget, setQuickBudget] = useState('200');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [foodsRes, catsRes, combosRes, reviewsRes] = await Promise.all([
          foodAPI.getFoods({ sort: 'rating' }),
          categoryAPI.getCategories(),
          comboAPI.getCombos(),
          reviewAPI.getReviews({ limit: 4 })
        ]);

        if (foodsRes.data.success) {
          setPopularFoods(foodsRes.data.foods.slice(0, 4));
        }
        if (catsRes.data.success) {
          setCategories(catsRes.data.categories);
        }
        if (combosRes.data.success) {
          setCombos(combosRes.data.combos.slice(0, 3));
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.reviews);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleQuickBudgetSubmit = (e) => {
    e.preventDefault();
    if (quickBudget && Number(quickBudget) > 0) {
      navigate(`/budget-planner?amount=${quickBudget}`);
    }
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Smart Budget-Based Food Ordering</span>
            </div>

            <h1 className="hero-title">
              Delicious Food.<br />
              <span className="hero-highlight">Smarter Budgets.</span>
            </h1>

            <p className="hero-description">
              Your cravings deserve the best. Discover mouthwatering dishes, plan meals to the exact rupee, and enjoy gourmet food that effortlessly fits your pocket.
            </p>

            {/* Quick Budget Jump */}
            <form className="hero-budget-form" onSubmit={handleQuickBudgetSubmit}>
              <div className="budget-input-wrapper">
                <span className="rupee-icon">₹</span>
                <input
                  type="number"
                  placeholder="Enter budget (e.g. 200)"
                  value={quickBudget}
                  onChange={(e) => setQuickBudget(e.target.value)}
                  min="30"
                  max="2000"
                  className="hero-budget-input"
                />
              </div>
              <button type="submit" className="btn btn-primary hero-plan-btn">
                <Wallet size={18} />
                <span>Plan My Meal</span>
              </button>
            </form>

            <div className="hero-cta-buttons">
              <Link to="/menu" className="btn btn-secondary">
                <span>Explore Full Menu</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/crave-match" className="btn btn-outline">
                <Sparkles size={16} />
                <span>Crave Match</span>
              </Link>
            </div>

            <div className="hero-metrics">
              <div className="metric-item">
                <span className="metric-val">100%</span>
                <span className="metric-label">Accurate Budgeting</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-val">30 mins</span>
                <span className="metric-label">Fast Express Delivery</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-val">4.8 ★</span>
                <span className="metric-label">Customer Satisfaction</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                alt="Delicious meal combo"
                className="hero-main-img"
              />
              {/* Floating Budget Pill */}
              <div className="floating-card floating-budget">
                <div className="floating-icon">
                  <Wallet size={20} />
                </div>
                <div>
                  <span className="float-label">Smart Balance</span>
                  <div className="float-val">
                    ₹200 Budget <span className="float-sub">→ ₹20 Left</span>
                  </div>
                </div>
              </div>

              {/* Floating Rating Pill */}
              <div className="floating-card floating-rating">
                <Star size={18} className="star-icon" fill="currentColor" />
                <div>
                  <span className="float-val">4.9 / 5.0</span>
                  <span className="float-label">1,200+ foodies served</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Smart Budget Planner Banner (USP) */}
      <section className="usp-banner-section">
        <div className="container">
          <div className="usp-banner-card">
            <div className="usp-content">
              <span className="usp-tag">MEET OUR SIGNATURE FEATURE</span>
              <h2 className="usp-title">Never Overspend on Food Again.</h2>
              <p className="usp-desc">
                Simply set how much you wish to spend. Our real-time algorithm pairs authentic, flavorful dishes and calculates your live balance down to the single rupee.
              </p>
              <div className="usp-highlights">
                <div className="usp-hl-item">
                  <CheckCircle2 size={18} className="usp-check" />
                  <span>Interactive dynamic combination calculator</span>
                </div>
                <div className="usp-hl-item">
                  <CheckCircle2 size={18} className="usp-check" />
                  <span>Real-time budget guard prevents exceeding limit</span>
                </div>
                <div className="usp-hl-item">
                  <CheckCircle2 size={18} className="usp-check" />
                  <span>Instant 1-click batch cart addition</span>
                </div>
              </div>
              <Link to="/budget-planner" className="btn btn-primary usp-btn">
                <Wallet size={18} />
                <span>Launch Smart Budget Planner</span>
              </Link>
            </div>

            <div className="usp-preview-card">
              <div className="mock-planner-header">
                <span className="mock-title">Active Budget: ₹200</span>
                <span className="mock-remaining">₹20 Remaining</span>
              </div>
              <div className="mock-items">
                <div className="mock-item">
                  <span>🍗 Chicken Fried Rice</span>
                  <span className="mock-price">₹130</span>
                </div>
                <div className="mock-item">
                  <span>🍟 French Fries</span>
                  <span className="mock-price">₹50</span>
                </div>
              </div>
              <div className="mock-recommendation">
                <span className="rec-label">💡 Fits your remaining ₹20:</span>
                <span className="rec-dish">Add Extra Dip or Save ₹20!</span>
              </div>
              <div className="mock-bar">
                <div className="mock-fill" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Food Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-subtitle">Diverse Cuisines</span>
              <h2 className="section-title">Explore by Category</h2>
            </div>
            <Link to="/menu" className="view-all-link">
              <span>View All Menu</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <Link to={`/menu?category=${cat.slug}`} key={cat.id} className="category-card">
                <div className="cat-img-wrap">
                  <img src={cat.image_url} alt={cat.name} className="cat-img" />
                </div>
                <h4 className="cat-name">{cat.name}</h4>
                <span className="cat-count">{cat.food_count || 0} items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Popular / Best-Selling Foods */}
      <section className="popular-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-subtitle">Customer Favorites</span>
              <h2 className="section-title">Top Rated Delicacies</h2>
            </div>
            <Link to="/menu" className="view-all-link">
              <span>Explore All</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid-cols-4">
            {popularFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Affordable Combos */}
      {combos.length > 0 && (
        <section className="combos-section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-subtitle">Curated Savings</span>
                <h2 className="section-title">Pocket-Friendly Combos</h2>
              </div>
              <Link to="/combos" className="view-all-link">
                <span>All Combos</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid-cols-3">
              {combos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Crave Match Interactive Teaser */}
      <section className="crave-teaser-section">
        <div className="container">
          <div className="crave-teaser-box">
            <div className="crave-text">
              <span className="crave-tag">MOOD-BASED RECOMMENDATIONS</span>
              <h2 className="crave-title">What are you craving today?</h2>
              <p className="crave-desc">
                From crispy Indo-Chinese starters to rich gooey cheese pizzas, answer our 1-click craving question and find your match instantly.
              </p>
              <div className="crave-chips">
                <Link to="/crave-match?tag=spicy" className="crave-chip">🌶️ Something Spicy</Link>
                <Link to="/crave-match?tag=cheesy" className="crave-chip">🧀 Something Cheesy</Link>
                <Link to="/crave-match?tag=crunchy" className="crave-chip">🥢 Something Crunchy</Link>
                <Link to="/crave-match?tag=light" className="crave-chip">🥗 Something Light</Link>
                <Link to="/crave-match?tag=filling" className="crave-chip">🍛 Something Filling</Link>
                <Link to="/crave-match?tag=sweet" className="crave-chip">🥤 Something Sweet</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Why Choose BudgetBite */}
      <section className="features-section">
        <div className="container">
          <div className="text-center-head">
            <span className="section-subtitle">The BudgetBite Difference</span>
            <h2 className="section-title">Why Foodies Love BudgetBite</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Wallet size={24} />
              </div>
              <h3 className="feature-title">Smart Budget Control</h3>
              <p className="feature-desc">
                Tell us your budget first. We provide mathematically balanced meal options so you never spend a single rupee extra.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Clock size={24} />
              </div>
              <h3 className="feature-title">30-Minute Live Tracking</h3>
              <p className="feature-desc">
                Follow your meal from kitchen wok to your doorstep with our seamless 4-stage live order tracking system.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Fresh, Pure Quality</h3>
              <p className="feature-desc">
                Prepared with high standard ingredients, zero hidden costs, and authentic culinary passion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      {reviews.length > 0 && (
        <section className="testimonials-section">
          <div className="container">
            <div className="text-center-head">
              <span className="section-subtitle">Real Reviews</span>
              <h2 className="section-title">What Our Diners Say</h2>
            </div>

            <div className="grid-cols-2 testimonials-grid">
              {reviews.map((rev) => (
                <div key={rev.id} className="testimonial-card">
                  <div className="test-rating">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" className="star-icon" />
                    ))}
                  </div>
                  <p className="test-comment">"{rev.comment}"</p>
                  <div className="test-footer">
                    <span className="test-name">{rev.customer_name}</span>
                    <span className="test-order">Ordered: {rev.food_name || 'Verified Meal'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
