import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  LogOut
} from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, isAuthenticated, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [addresses, setAddresses] = useState([]);

  // Edit Profile Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);

  // Add Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560001');
  const [isDefault, setIsDefault] = useState(false);
  const [addressMsg, setAddressMsg] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await profileAPI.getProfile();
        if (res.data.success) {
          setProfileData(res.data.user);
          setAddresses(res.data.addresses);
          setName(res.data.user.name);
          setPhone(res.data.user.phone);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);

    try {
      const payload = { name, phone };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await profileAPI.updateProfile(payload);
      if (res.data.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        updateUserProfile({ name, phone });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressMsg(null);

    try {
      const res = await profileAPI.addAddress({
        address_line: addressLine,
        landmark,
        city,
        state,
        postal_code: postalCode,
        is_default: isDefault
      });

      if (res.data.success) {
        setAddressMsg({ type: 'success', text: 'New address added!' });
        setAddresses((prev) => [res.data.address, ...prev]);
        setAddressLine('');
        setLandmark('');
        setShowAddressForm(false);
      }
    } catch (err) {
      setAddressMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save address.'
      });
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await profileAPI.deleteAddress(id);
      if (res.data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="page-wrapper profile-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your profile details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper profile-page">
      <div className="container">
        <div className="profile-top-banner card">
          <div className="user-avatar-huge">
            {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-profile-meta">
            <h2>{profileData?.name}</h2>
            <p className="meta-email">{profileData?.email}</p>
            <div className="user-meta-tags">
              <span className="badge badge-sage">Member since {new Date(profileData?.created_at).getFullYear()}</span>
              <span className="badge badge-terracotta">{profileData?.total_orders || 0} Total Orders</span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm logout-profile-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="profile-grid">
          {/* Left Column: Edit Profile & Password */}
          <div className="profile-col">
            <div className="card profile-card">
              <h3 className="section-title">Personal Details</h3>

              {profileMsg && (
                <div className={`status-msg-box ${profileMsg.type}`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={profileData?.email || ''}
                    disabled
                    className="form-input disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <hr className="form-divider" />
                <h4 className="sub-title">Change Password (Optional)</h4>

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn btn-primary save-btn">
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Saved Delivery Addresses */}
          <div className="profile-col">
            <div className="card profile-card">
              <div className="addr-card-head">
                <h3 className="section-title">Saved Addresses</h3>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <Plus size={14} />
                  <span>{showAddressForm ? 'Cancel' : 'Add New'}</span>
                </button>
              </div>

              {addressMsg && (
                <div className={`status-msg-box ${addressMsg.type}`}>
                  {addressMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{addressMsg.text}</span>
                </div>
              )}

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="add-address-form">
                  <div className="form-group">
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. Flat 302, Green Glen Apartments"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near EcoSpace Tech Park"
                      className="form-input"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <span>Set as default delivery address</span>
                  </label>

                  <button type="submit" className="btn btn-secondary btn-sm submit-addr-btn">
                    Save Address
                  </button>
                </form>
              )}

              <div className="addresses-list">
                {addresses.length === 0 ? (
                  <p className="no-address-text">No saved delivery addresses found.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="address-item-card">
                      <div className="address-info-row">
                        <MapPin size={18} className="map-icon" />
                        <div>
                          <p className="addr-line">{addr.address_line}</p>
                          {addr.landmark && <p className="addr-lm">Landmark: {addr.landmark}</p>}
                          <p className="addr-city">{addr.city}, {addr.state} - {addr.postal_code}</p>
                          {addr.is_default === 1 && (
                            <span className="default-pill">Default Address</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="trash-addr-btn"
                        onClick={() => handleDeleteAddress(addr.id)}
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
