import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, AlertCircle, Utensils } from 'lucide-react';
import { foodAPI, categoryAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import './MenuPage.css';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [dietFilter, setDietFilter] = useState(searchParams.get('is_veg') || 'all'); // 'all', '1' (veg), '0' (non-veg)
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState('200');

  // Load Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Foods on filter changes
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const params = {};

        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (dietFilter !== 'all') params.is_veg = dietFilter;
        if (sortBy !== 'default') params.sort = sortBy;
        if (maxPrice) params.max_price = maxPrice;

        const res = await foodAPI.getFoods(params);
        if (res.data.success) {
          setFoods(res.data.foods);
        }
      } catch (err) {
        console.error('Error fetching food items:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchFoods();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, dietFilter, sortBy, maxPrice]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setDietFilter('all');
    setSortBy('default');
    setMaxPrice('200');
    setSearchParams({});
  };

  return (
    <div className="page-wrapper menu-page">
      <div className="container">
        {/* Menu Header */}
        <div className="menu-header">
          <span className="badge badge-terracotta">FRESH & AROMATIC</span>
          <h1 className="menu-title">Our Handcrafted Menu</h1>
          <p className="menu-subtitle">
            Explore 100% authentic wok-tossed fried rice, noodles, sizzling starters, and gourmet pizzas.
          </p>
        </div>

        {/* Search & Main Filter Controls */}
        <div className="menu-controls-card">
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by food name, ingredients, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="filter-dropdowns">
            {/* Diet Filter */}
            <div className="diet-pill-group">
              <button
                className={`diet-pill ${dietFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDietFilter('all')}
              >
                All Diets
              </button>
              <button
                className={`diet-pill veg-pill ${dietFilter === '1' ? 'active' : ''}`}
                onClick={() => setDietFilter('1')}
              >
                <span className="dot"></span>
                <span>Veg Only</span>
              </button>
              <button
                className={`diet-pill nonveg-pill ${dietFilter === '0' ? 'active' : ''}`}
                onClick={() => setDietFilter('0')}
              >
                <span className="dot"></span>
                <span>Non-Veg</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Sort by: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs-bar">
          <button
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Price Slider Bar */}
        <div className="price-slider-strip">
          <span className="price-slider-label">
            Max Price: <strong>₹{maxPrice}</strong>
          </span>
          <input
            type="range"
            min="30"
            max="200"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="price-range-slider"
          />
          <button className="reset-btn" onClick={handleResetFilters}>
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Results Counter */}
        <div className="results-count-bar">
          <span>Showing <strong>{foods.length}</strong> delicious items</span>
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cooking up fresh menu items...</p>
          </div>
        ) : foods.length > 0 ? (
          <div className="grid-cols-4 menu-grid">
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        ) : (
          <div className="empty-results-box">
            <AlertCircle size={48} className="empty-icon" />
            <h3>No food items match your criteria</h3>
            <p>Try adjusting your category, diet, or maximum price filter.</p>
            <button className="btn btn-outline" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
