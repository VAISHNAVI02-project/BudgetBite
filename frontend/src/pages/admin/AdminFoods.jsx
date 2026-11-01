import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Upload
} from 'lucide-react';
import { foodAPI, categoryAPI } from '../../services/api';

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    is_veg: '1',
    is_available: '1',
    image_url: '',
    tags: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchFoodsAndCats = async () => {
    try {
      setLoading(true);
      const [foodsRes, catsRes] = await Promise.all([
        foodAPI.getFoods({ all: 'true' }),
        categoryAPI.getCategories()
      ]);
      if (foodsRes.data.success) setFoods(foodsRes.data.foods);
      if (catsRes.data.success) {
        setCategories(catsRes.data.categories);
        if (!formData.category_id && catsRes.data.categories.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: catsRes.data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodsAndCats();
  }, []);

  const openAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      description: '',
      is_veg: '1',
      is_available: '1',
      image_url: '',
      tags: ''
    });
    setImageFile(null);
    setStatusMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      category_id: food.category_id,
      price: food.price,
      description: food.description || '',
      is_veg: String(food.is_veg),
      is_available: String(food.is_available),
      image_url: food.image_url || '',
      tags: food.tags || ''
    });
    setImageFile(null);
    setStatusMsg(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFood(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('category_id', formData.category_id);
      payload.append('price', formData.price);
      payload.append('description', formData.description);
      payload.append('is_veg', formData.is_veg);
      payload.append('is_available', formData.is_available);
      payload.append('tags', formData.tags);

      if (imageFile) {
        payload.append('image', imageFile);
      } else if (formData.image_url) {
        payload.append('image_url', formData.image_url);
      }

      if (editingFood) {
        await foodAPI.updateFood(editingFood.id, payload);
        setStatusMsg({ type: 'success', text: 'Food item updated successfully!' });
      } else {
        await foodAPI.createFood(payload);
        setStatusMsg({ type: 'success', text: 'New food item created successfully!' });
      }

      setTimeout(() => {
        closeModal();
        fetchFoodsAndCats();
      }, 1000);
    } catch (err) {
      console.error('Failed to save food:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save food item.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      try {
        await foodAPI.deleteFood(id);
        fetchFoodsAndCats();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete food item.');
      }
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      const newAvail = food.is_available === 1 ? '0' : '1';
      const formPayload = new FormData();
      formPayload.append('is_available', newAvail);
      await foodAPI.updateFood(food.id, formPayload);
      fetchFoodsAndCats();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-foods-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manage Food Dishes</h1>
          <p className="admin-page-sub">Add, edit, adjust prices, tags, and toggle kitchen availability</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <Search size={18} style={{ color: 'var(--text-light)', alignSelf: 'center' }} />
        <input
          type="text"
          placeholder="Search by dish name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
        />
      </div>

      {/* Foods Table */}
      <div className="card admin-table-card">
        {loading ? (
          <div className="loading-state">Loading dishes...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Category</th>
                <th>Price</th>
                <th>Diet</th>
                <th>Availability</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map((food) => (
                <tr key={food.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}
                        alt={food.name}
                        style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong>{food.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Rating: {food.rating} ★ ({food.rating_count})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-sage">{food.category_name}</span>
                  </td>
                  <td>
                    <strong>₹{parseFloat(food.price).toFixed(0)}</strong>
                  </td>
                  <td>
                    <div className={`diet-indicator ${food.is_veg ? 'veg' : 'non-veg'}`}>
                      <span className="dot"></span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.78rem',
                        backgroundColor: food.is_available ? 'var(--color-sage-light)' : '#FDEDED',
                        color: food.is_available ? 'var(--color-forest)' : 'var(--color-danger)',
                        borderRadius: '9999px',
                        fontWeight: 700
                      }}
                      onClick={() => handleToggleAvailability(food)}
                      title="Click to toggle in/out of stock"
                    >
                      {food.is_available ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {food.tags ? food.tags.split(',').map((t, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', background: '#F1EFE8', padding: '1px 6px', borderRadius: '4px' }}>
                          #{t.trim()}
                        </span>
                      )) : '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(food)}
                        title="Edit dish"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-danger)', borderColor: '#F5C6CB' }}
                        onClick={() => handleDelete(food.id, food.name)}
                        title="Delete dish"
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

      {/* Add / Edit Food Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>{editingFood ? `Edit Dish: ${editingFood.name}` : 'Add New Food Item'}</h3>
              <button className="close-modal-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {statusMsg && (
              <div className={`modal-error-box`} style={{
                backgroundColor: statusMsg.type === 'success' ? '#E8F5E9' : '#FDEDED',
                color: statusMsg.type === 'success' ? '#2E7D32' : 'var(--color-danger)'
              }}>
                {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Dish Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Chicken Fried Rice"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Price in ₹ *</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="e.g. 130"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Diet Classification</label>
                  <select
                    value={formData.is_veg}
                    onChange={(e) => setFormData({ ...formData, is_veg: e.target.value })}
                    className="form-select"
                  >
                    <option value="1">Vegetarian (Veg)</option>
                    <option value="0">Non-Vegetarian (Non-Veg)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, preparation style, and portion details..."
                  className="form-textarea"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Or Upload File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Recommendation Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="spicy, filling, crunchy, cheesy, light, sweet"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Status</label>
                  <select
                    value={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.value })}
                    className="form-select"
                  >
                    <option value="1">Available (In Stock)</option>
                    <option value="0">Sold Out (Unavailable)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingFood ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
