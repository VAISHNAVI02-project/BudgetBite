import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Utensils, Flame, Cookie, Heart, Smile } from 'lucide-react';
import { foodAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import './CraveMatchPage.css';

const CRAVINGS = [
  {
    id: 'spicy',
    emoji: '🌶️',
    title: 'Something Spicy',
    desc: 'Zesty chili garlic noodles, fiery Manchurian, and sizzling hot wok flavors.',
    tag: 'spicy',
    color: '#E87945'
  },
  {
    id: 'cheesy',
    emoji: '🧀',
    title: 'Something Cheesy',
    desc: 'Melted double mozzarella, gooey herb crusts, and comforting fast food.',
    tag: 'cheesy',
    color: '#D6AE62'
  },
  {
    id: 'crunchy',
    emoji: '🥢',
    title: 'Something Crunchy',
    desc: 'Golden crisp fries, sizzling Indo-Chinese starters, and crunchy grilled sandwiches.',
    tag: 'crunchy',
    color: '#78966B'
  },
  {
    id: 'light',
    emoji: '🥗',
    title: 'Something Light',
    desc: 'Refreshing beverages, wholesome sandwiches, and delicately seasoned sides.',
    tag: 'light',
    color: '#315541'
  },
  {
    id: 'filling',
    emoji: '🍛',
    title: 'Something Filling',
    desc: 'Loaded fragrant basmati fried rice, heavy hakka noodles, and gourmet pizzas.',
    tag: 'filling',
    color: '#332940'
  },
  {
    id: 'sweet',
    emoji: '🥤',
    title: 'Something Sweet',
    desc: 'Pure freshly squeezed seasonal juices and chilled fruit refreshments.',
    tag: 'sweet',
    color: '#D56734'
  }
];

const CraveMatchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag') || 'spicy';
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCraveFoods = async () => {
      try {
        setLoading(true);
        const res = await foodAPI.getFoods({ tag: selectedTag });
        if (res.data.success) {
          setFoods(res.data.foods);
        }
      } catch (err) {
        console.error('Error fetching crave foods:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCraveFoods();
  }, [selectedTag]);

  const handleSelectCraving = (tag) => {
    setSelectedTag(tag);
    setSearchParams({ tag });
  };

  const activeCraving = CRAVINGS.find((c) => c.tag === selectedTag) || CRAVINGS[0];

  return (
    <div className="page-wrapper crave-match-page">
      <div className="container">
        {/* Header */}
        <div className="crave-header">
          <div className="badge badge-terracotta">
            <Sparkles size={14} />
            <span>MOOD-BASED FOOD DISCOVERY</span>
          </div>
          <h1 className="crave-page-title">What are you craving today?</h1>
          <p className="crave-page-sub">
            Pick your current vibe. We filter our real database records to bring dishes matching your culinary mood.
          </p>
        </div>

        {/* Craving Cards Grid */}
        <div className="crave-cards-grid">
          {CRAVINGS.map((craving) => {
            const isSelected = selectedTag === craving.tag;
            return (
              <button
                key={craving.id}
                className={`card craving-option-card ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectCraving(craving.tag)}
              >
                <span className="craving-emoji">{craving.emoji}</span>
                <h3 className="craving-name">{craving.title}</h3>
                <p className="craving-short">{craving.desc}</p>
                {isSelected && <div className="selected-indicator">Matched</div>}
              </button>
            );
          })}
        </div>

        {/* Matched Dishes Section */}
        <div className="crave-results-section">
          <div className="results-banner">
            <div className="results-badge">
              <span className="banner-emoji">{activeCraving.emoji}</span>
              <h2>{activeCraving.title} Picks</h2>
            </div>
            <p className="results-subtitle">
              Authentic chef creations tagged with <strong>#{selectedTag}</strong>
            </p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Finding perfect dishes for your craving...</p>
            </div>
          ) : foods.length > 0 ? (
            <div className="grid-cols-4 crave-grid">
              {foods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <p>No dishes currently found for this craving tag.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CraveMatchPage;
