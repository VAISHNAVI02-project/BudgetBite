import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, ShieldCheck, Tag } from 'lucide-react';
import { comboAPI } from '../services/api';
import ComboCard from '../components/ComboCard';
import './CombosPage.css';

const CombosPage = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        const res = await comboAPI.getCombos();
        if (res.data.success) {
          setCombos(res.data.combos);
        }
      } catch (err) {
        console.error('Error fetching combos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  return (
    <div className="page-wrapper combos-page">
      <div className="container">
        {/* Header */}
        <div className="combos-header">
          <div className="badge badge-gold">
            <Sparkles size={14} />
            <span>UNBEATABLE VALUE PACKS</span>
          </div>
          <h1 className="combos-title">Curated Budget Combos</h1>
          <p className="combos-subtitle">
            Specially bundled full-course meals designed to give you our most popular entrees, sides, and chilled beverages with maximum instant savings.
          </p>
        </div>

        {/* Combos Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading chef's value combos...</p>
          </div>
        ) : (
          <div className="grid-cols-3 combos-grid">
            {combos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        )}

        {/* Value Proposition Box */}
        <div className="combos-info-banner">
          <div className="info-col">
            <Tag size={24} className="banner-icon" />
            <div>
              <h4>Guaranteed Savings</h4>
              <p>Save between ₹30 and ₹75 on every curated combo bundle compared to individual a la carte prices.</p>
            </div>
          </div>
          <div className="info-col">
            <Layers size={24} className="banner-icon" />
            <div>
              <h4>Complete Balanced Meals</h4>
              <p>Each combo includes a filling main course, crunchy appetizers, and a chilled beverage.</p>
            </div>
          </div>
          <div className="info-col">
            <ShieldCheck size={24} className="banner-icon" />
            <div>
              <h4>Freshly Made to Order</h4>
              <p>Every element in your combo is prepared sizzling hot upon your order placement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombosPage;
