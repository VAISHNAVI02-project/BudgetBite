import React, { useState, useEffect } from 'react';
import { Plus, Tags, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { categoryAPI } from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryAPI.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      setSubmitting(true);
      const res = await categoryAPI.createCategory({
        name,
        description,
        image_url: imageUrl,
        display_order: parseInt(displayOrder, 10) || 0
      });

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'Category created successfully!' });
        setTimeout(() => {
          setModalOpen(false);
          setName('');
          setDescription('');
          setImageUrl('');
          fetchCategories();
        }, 1000);
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create category.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manage Categories</h1>
          <p className="admin-page-sub">Organize your menu sections and display priorities</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="card admin-table-card">
        {loading ? (
          <div className="loading-state">Loading categories...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Active Foods</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={cat.image_url || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=100&q=80'}
                        alt={cat.name}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <strong>{cat.name}</strong>
                    </div>
                  </td>
                  <td><code>{cat.slug}</code></td>
                  <td>{cat.description || '-'}</td>
                  <td>
                    <span className="badge badge-sage">{cat.food_count || 0} items</span>
                  </td>
                  <td>{cat.display_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Category</h3>
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

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Desserts"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of foods in this category..."
                  className="form-textarea"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
