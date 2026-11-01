import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { comboAPI, foodAPI } from '../../services/api';

const AdminCombos = () => {
  const [combos, setCombos] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState('1');
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [combosRes, foodsRes] = await Promise.all([
        comboAPI.getCombos({ all: 'true' }),
        foodAPI.getFoods()
      ]);
      if (combosRes.data.success) setCombos(combosRes.data.combos);
      if (foodsRes.data.success) setFoods(foodsRes.data.foods);
    } catch (err) {
      console.error('Failed to load combos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCombo(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setIsActive('1');
    setSelectedFoodIds([]);
    setStatusMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (combo) => {
    setEditingCombo(combo);
    setName(combo.name);
    setDescription(combo.description || '');
    setPrice(combo.price);
    setOriginalPrice(combo.original_price);
    setImageUrl(combo.image_url || '');
    setIsActive(String(combo.is_active));
    setSelectedFoodIds(combo.items ? combo.items.map((i) => i.food_id) : []);
    setStatusMsg(null);
    setModalOpen(true);
  };

  const toggleFoodSelection = (foodId) => {
    setSelectedFoodIds((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      setSubmitting(true);
      const itemsPayload = selectedFoodIds.map((id) => ({ food_id: id, quantity: 1 }));

      const payload = {
        name,
        description,
        price,
        original_price: originalPrice,
        image_url: imageUrl,
        is_active: isActive,
        items: itemsPayload
      };

      if (editingCombo) {
        await comboAPI.updateCombo(editingCombo.id, payload);
        setStatusMsg({ type: 'success', text: 'Combo updated successfully!' });
      } else {
        await comboAPI.createCombo(payload);
        setStatusMsg({ type: 'success', text: 'New combo created successfully!' });
      }

      setTimeout(() => {
        setModalOpen(false);
        loadData();
      }, 1000);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save combo.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, comboName) => {
    if (window.confirm(`Delete combo "${comboName}"?`)) {
      try {
        await comboAPI.deleteCombo(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete combo.');
      }
    }
  };

  return (
    <div className="admin-combos-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manage Budget Combos</h1>
          <p className="admin-page-sub">Bundle popular meals together with calculated discount savings</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Create Combo</span>
        </button>
      </div>

      <div className="card admin-table-card">
        {loading ? (
          <div className="loading-state">Loading combos...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Combo</th>
                <th>Included Foods</th>
                <th>Price</th>
                <th>Original</th>
                <th>Savings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((combo) => (
                <tr key={combo.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={combo.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=100&q=80'}
                        alt={combo.name}
                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong>{combo.name}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{combo.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {combo.items?.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.8rem', color: 'var(--color-plum)' }}>
                          • {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--color-forest)', fontSize: '1.05rem' }}>
                      ₹{parseFloat(combo.price).toFixed(0)}
                    </strong>
                  </td>
                  <td>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '0.88rem' }}>
                      ₹{parseFloat(combo.original_price).toFixed(0)}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-terracotta">
                      Save ₹{parseFloat(combo.savings).toFixed(0)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${combo.is_active ? 'badge-sage' : ''}`} style={{
                      backgroundColor: combo.is_active ? 'var(--color-sage-light)' : '#FDEDED',
                      color: combo.is_active ? 'var(--color-forest)' : 'var(--color-danger)'
                    }}>
                      {combo.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(combo)}
                        title="Edit combo"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-danger)', borderColor: '#F5C6CB' }}
                        onClick={() => handleDelete(combo.id, combo.name)}
                        title="Delete combo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Combo Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{editingCombo ? `Edit Combo: ${editingCombo.name}` : 'Create Budget Combo'}</h3>
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {statusMsg && (
              <div className="modal-error-box" style={{
                backgroundColor: statusMsg.type === 'success' ? '#E8F5E9' : '#FDEDED',
                color: statusMsg.type === 'success' ? '#2E7D32' : 'var(--color-danger)'
              }}>
                {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Combo Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Student Meal Combo"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Items list and portion highlights..."
                  className="form-textarea"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Offer Price in ₹ *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 99"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original Standard Price in ₹ *</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 150"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Active Status</label>
                  <select
                    value={isActive}
                    onChange={(e) => setIsActive(e.target.value)}
                    className="form-select"
                  >
                    <option value="1">Enabled / Active</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Included Food Items:</label>
                <div style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem'
                }}>
                  {foods.map((food) => {
                    const isChecked = selectedFoodIds.includes(food.id);
                    return (
                      <label key={food.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFoodSelection(food.id)}
                        />
                        <span>{food.name} (₹{parseFloat(food.price).toFixed(0)})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingCombo ? 'Update Combo' : 'Save Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCombos;
