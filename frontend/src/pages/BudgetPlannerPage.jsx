import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Info
} from 'lucide-react';
import { foodAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './BudgetPlannerPage.css';

const PRESET_BUDGETS = [100, 150, 200, 250, 300, 500];

const BudgetPlannerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addBatchToCart } = useCart();

  // State
  const initialBudget = parseFloat(searchParams.get('amount')) || 200;
  const [budgetInput, setBudgetInput] = useState(initialBudget);
  const [activeBudget, setActiveBudget] = useState(initialBudget);
  const [foods, setFoods] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // Array of { food, quantity }
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch actual food items from MySQL backend
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const res = await foodAPI.getFoods({ sort: 'price_asc' });
        if (res.data.success) {
          setFoods(res.data.foods);
        }
      } catch (err) {
        console.error('Error fetching foods for budget planner:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Update URL search param on budget change
  const handleApplyBudget = (amount) => {
    const validAmount = Math.max(30, parseFloat(amount) || 0);
    setBudgetInput(validAmount);
    setActiveBudget(validAmount);
    setSearchParams({ amount: validAmount });
  };

  // Immediate calculations
  const totalPlanned = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + parseFloat(item.food.price) * item.quantity, 0);
  }, [selectedItems]);

  const remainingBalance = activeBudget - totalPlanned;
  const percentageUsed = Math.min(100, (totalPlanned / (activeBudget || 1)) * 100);

  // Item additions & quantity modifiers
  const handleAddItem = (food) => {
    const price = parseFloat(food.price);

    // Safeguard: Check if adding 1 item exceeds remaining balance
    if (price > remainingBalance) {
      showNotice(`Cannot add "${food.name}". It costs ₹${price.toFixed(0)}, which exceeds your remaining budget of ₹${remainingBalance.toFixed(0)}.`);
      return;
    }

    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.food.id === food.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      } else {
        return [...prev, { food, quantity: 1 }];
      }
    });

    showNotice(`Added "${food.name}" to your meal plan!`, 'success');
  };

  const handleUpdateQuantity = (foodId, delta) => {
    const item = selectedItems.find((i) => i.food.id === foodId);
    if (!item) return;

    if (delta > 0) {
      // Check if increment fits in remaining balance
      const price = parseFloat(item.food.price);
      if (price > remainingBalance) {
        showNotice(`Increasing quantity by 1 costs ₹${price.toFixed(0)}, which exceeds your remaining ₹${remainingBalance.toFixed(0)}.`);
        return;
      }
    }

    setSelectedItems((prev) =>
      prev
        .map((i) => {
          if (i.food.id === foodId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (foodId) => {
    setSelectedItems((prev) => prev.filter((i) => i.food.id !== foodId));
  };

  const handleClearPlan = () => {
    setSelectedItems([]);
  };

  // Smart Recommendations that fit remaining balance
  const recommendedAdditions = useMemo(() => {
    if (remainingBalance < 30) return []; // lowest priced item is ₹30 (Cool Drinks)

    // Items that customer has not yet selected OR can afford more of
    return foods
      .filter((food) => {
        const price = parseFloat(food.price);
        return price <= remainingBalance;
      })
      .sort((a, b) => {
        // Variety prioritization: prioritize items from categories not yet selected
        const selectedCatIds = selectedItems.map((si) => si.food.category_id);
        const aMatches = selectedCatIds.includes(a.category_id) ? 1 : 0;
        const bMatches = selectedCatIds.includes(b.category_id) ? 1 : 0;
        if (aMatches !== bMatches) return aMatches - bMatches; // different category first
        return parseFloat(b.price) - parseFloat(a.price); // closest to remaining budget first
      })
      .slice(0, 4);
  }, [foods, remainingBalance, selectedItems]);

  const showNotice = (msg, type = 'warning') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Add the entire planned combination to the Cart
  const handleAddAllToCart = () => {
    if (selectedItems.length === 0) return;

    const itemsToCart = selectedItems.map((si) => ({
      id: si.food.id,
      name: si.food.name,
      price: si.food.price,
      image_url: si.food.image_url,
      is_veg: si.food.is_veg,
      type: 'food',
      quantity: si.quantity
    }));

    addBatchToCart(itemsToCart);
    navigate('/cart');
  };

  return (
    <div className="page-wrapper budget-planner-page">
      <div className="container">
        {/* Header */}
        <div className="planner-header">
          <div className="planner-badge">
            <Sparkles size={16} />
            <span>AI-Assisted Smart Meal Optimizer</span>
          </div>
          <h1 className="planner-title">Smart Budget Planner</h1>
          <p className="planner-desc">
            Define your budget, select dishes, view live remaining balance, and let our recommendation engine help you get the maximum deliciousness without overspending.
          </p>
        </div>

        {/* Budget Input & Preset Selector */}
        <div className="budget-setup-card card">
          <div className="setup-left">
            <label className="setup-label">Set Your Target Budget:</label>
            <div className="budget-input-group">
              <span className="currency-mark">₹</span>
              <input
                type="number"
                min="30"
                max="2500"
                step="10"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onBlur={() => handleApplyBudget(budgetInput)}
                className="budget-number-input"
              />
              <button
                className="btn btn-primary btn-sm apply-btn"
                onClick={() => handleApplyBudget(budgetInput)}
              >
                Set Budget
              </button>
            </div>
          </div>

          <div className="setup-right">
            <span className="presets-label">Popular Budgets:</span>
            <div className="presets-row">
              {PRESET_BUDGETS.map((amt) => (
                <button
                  key={amt}
                  className={`preset-pill ${activeBudget === amt ? 'active' : ''}`}
                  onClick={() => handleApplyBudget(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className={`planner-alert ${notification.type}`}>
            {notification.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Main 2-Column Planner Interface */}
        <div className="planner-layout">
          {/* Left Column: Available Food Items */}
          <div className="planner-main-column">
            <div className="column-head">
              <h2>Available Dishes within ₹{activeBudget}</h2>
              <span className="column-caption">Click "+ Add" to combine into your meal plan</span>
            </div>

            {loading ? (
              <div className="loading-state">Loading dishes from kitchen...</div>
            ) : (
              <div className="grid-cols-2 planner-foods-grid">
                {foods.map((food) => {
                  const price = parseFloat(food.price);
                  const canAfford = price <= remainingBalance;
                  const selectedEntry = selectedItems.find((si) => si.food.id === food.id);
                  const selectedQty = selectedEntry ? selectedEntry.quantity : 0;

                  return (
                    <div
                      key={food.id}
                      className={`card planner-food-item ${!canAfford && selectedQty === 0 ? 'exceeds-budget' : ''}`}
                    >
                      <div className="item-img-box">
                        <img src={food.image_url} alt={food.name} className="item-img" />
                        <div className={`diet-indicator ${food.is_veg ? 'veg' : 'non-veg'} item-diet`}>
                          <span className="dot"></span>
                        </div>
                      </div>

                      <div className="item-info">
                        <div className="item-name-row">
                          <h4 className="item-name">{food.name}</h4>
                          <span className="item-price">₹{price.toFixed(0)}</span>
                        </div>
                        <p className="item-brief">{food.description}</p>

                        <div className="item-action-row">
                          {selectedQty > 0 ? (
                            <div className="planner-qty-pill">
                              <button
                                className="qty-sub-btn"
                                onClick={() => handleUpdateQuantity(food.id, -1)}
                              >
                                <Minus size={13} />
                              </button>
                              <span className="qty-val">{selectedQty} in plan</span>
                              <button
                                className="qty-sub-btn"
                                onClick={() => handleUpdateQuantity(food.id, 1)}
                                disabled={!canAfford}
                                title={!canAfford ? 'Exceeds remaining budget' : 'Add another'}
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`btn btn-sm ${canAfford ? 'btn-outline' : 'btn-disabled'}`}
                              onClick={() => handleAddItem(food)}
                              disabled={!canAfford}
                            >
                              <Plus size={15} />
                              <span>{canAfford ? 'Add to Plan' : 'Over Remaining'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Budget Summary & Live Tracker */}
          <div className="planner-sidebar">
            <div className="budget-summary-card card">
              <div className="summary-card-header">
                <div className="wallet-icon-box">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="summary-title">Live Meal Balance</h3>
                  <span className="summary-sub">Target Budget: ₹{activeBudget}</span>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="budget-progress-section">
                <div className="progress-labels">
                  <span>Utilized: {percentageUsed.toFixed(0)}%</span>
                  <span>₹{totalPlanned.toFixed(0)} of ₹{activeBudget}</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${percentageUsed >= 95 ? 'full' : ''}`}
                    style={{ width: `${percentageUsed}%` }}
                  ></div>
                </div>
              </div>

              {/* Big Remaining Display */}
              <div className={`remaining-highlight-box ${remainingBalance === 0 ? 'exact' : remainingBalance < 0 ? 'over' : 'safe'}`}>
                <span className="remaining-text-label">Remaining Balance</span>
                <div className="remaining-amount-val">
                  ₹{remainingBalance.toFixed(0)}
                </div>
                <span className="remaining-hint">
                  {remainingBalance === 0
                    ? '🎯 Perfect! Budget fully optimized.'
                    : remainingBalance > 0
                    ? `You can still add items up to ₹${remainingBalance.toFixed(0)}`
                    : 'Budget exceeded'}
                </span>
              </div>

              {/* Selected Items List */}
              <div className="selected-items-section">
                <div className="section-title-row">
                  <h4>Selected Dishes ({selectedItems.reduce((a, b) => a + b.quantity, 0)})</h4>
                  {selectedItems.length > 0 && (
                    <button className="clear-all-link" onClick={handleClearPlan}>
                      Clear
                    </button>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="empty-plan-placeholder">
                    <Info size={24} className="placeholder-icon" />
                    <p>No dishes selected yet.</p>
                    <span>Click "+ Add to Plan" on any dish to construct your affordable meal.</span>
                  </div>
                ) : (
                  <ul className="planned-items-list">
                    {selectedItems.map((item) => (
                      <li key={item.food.id} className="planned-item-row">
                        <div className="planned-item-details">
                          <span className="planned-name">{item.food.name}</span>
                          <span className="planned-math">
                            ₹{item.food.price} × {item.quantity} = <strong>₹{(item.food.price * item.quantity).toFixed(0)}</strong>
                          </span>
                        </div>

                        <div className="planned-item-controls">
                          <button
                            className="mini-btn"
                            onClick={() => handleUpdateQuantity(item.food.id, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="mini-qty">{item.quantity}</span>
                          <button
                            className="mini-btn"
                            onClick={() => handleUpdateQuantity(item.food.id, 1)}
                            disabled={parseFloat(item.food.price) > remainingBalance}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            className="trash-btn"
                            onClick={() => handleRemoveItem(item.food.id)}
                            title="Remove dish"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recommended Additions that fit remaining balance */}
              {recommendedAdditions.length > 0 && (
                <div className="recommendations-box">
                  <div className="rec-header">
                    <Sparkles size={15} className="rec-spark" />
                    <h5>Fits Your Remaining ₹{remainingBalance.toFixed(0)}:</h5>
                  </div>
                  <div className="rec-items-stack">
                    {recommendedAdditions.map((rec) => (
                      <div key={rec.id} className="rec-item-row">
                        <div>
                          <span className="rec-food-name">{rec.name}</span>
                          <span className="rec-food-price">₹{parseFloat(rec.price).toFixed(0)}</span>
                        </div>
                        <button
                          className="btn btn-outline btn-sm rec-add-btn"
                          onClick={() => handleAddItem(rec)}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add All to Cart Button */}
              <div className="summary-actions">
                <button
                  className="btn btn-primary add-all-cart-btn"
                  disabled={selectedItems.length === 0}
                  onClick={handleAddAllToCart}
                >
                  <ShoppingBag size={18} />
                  <span>
                    Add Entire Meal to Cart (₹{totalPlanned.toFixed(0)})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlannerPage;
