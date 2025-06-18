import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaUsers, FaLock, FaGlobe } from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';
import '../Css/CreateGroup.css';
import groupService from '../services/groupService';
import { useAuth } from '../hooks/useAuth';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General Sustainability',
    image: '',
    maxMembers: 50,
    settings: {
      isPublic: true,
      requireApproval: false,
      allowInvites: true,
      groupBuyingEnabled: true
    }
  });

  const categories = [
    'Zero Waste',
    'Sustainable Living',
    'Renewable Energy',
    'Eco Fashion',
    'Green Transportation',
    'Organic Food',
    'Conservation',
    'Climate Action',
    'Circular Economy',
    'Clean Tech',
    'General Sustainability'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create a group');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a group description');
      return;
    }

    if (formData.name.length < 3) {
      alert('Group name must be at least 3 characters long');
      return;
    }

    if (formData.description.length < 10) {
      alert('Group description must be at least 10 characters long');
      return;
    }

    if (formData.maxMembers < 5 || formData.maxMembers > 1000) {
      alert('Maximum members must be between 5 and 1000');
      return;
    }

    try {
      setLoading(true);
      const response = await groupService.createGroup(formData);
      navigate(`/groups/${response.data._id}`);
      alert('Group created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="create-group-auth">
        <div className="auth-message">
          <MdGroups className="auth-icon" />
          <h2>Login Required</h2>
          <p>Please log in to create a group</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-group">
      <div className="create-header">
        <button onClick={() => navigate('/groups')} className="back-btn">
          <FaArrowLeft /> Back to Groups
        </button>
        <h1><FaPlus /> Create New Group</h1>
        <p>Start your own sustainability community and make an impact together</p>
      </div>

      <div className="create-content">
        <form onSubmit={handleSubmit} className="create-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Group Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter a unique and descriptive group name"
                maxLength={100}
                required
              />
              <small>{formData.name.length}/100 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your group's mission, goals, and what members can expect"
                maxLength={500}
                rows={4}
                required
              />
              <small>{formData.description.length}/500 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="image">Group Image URL (Optional)</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/group-image.jpg"
              />
              <small>Provide a URL to an image that represents your group</small>
            </div>
          </div>

          {/* Group Settings */}
          <div className="form-section">
            <h2>Group Settings</h2>
            
            <div className="form-group">
              <label htmlFor="maxMembers">Maximum Members</label>
              <input
                type="number"
                id="maxMembers"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleInputChange}
                min={5}
                max={1000}
                required
              />
              <small>Choose between 5 and 1000 members</small>
            </div>

            <div className="settings-grid">
              <div className="setting-item">
                <div className="setting-header">
                  <FaGlobe className={`setting-icon ${formData.settings.isPublic ? 'active' : ''}`} />
                  <div>
                    <h3>Public Group</h3>
                    <p>Anyone can find and view your group</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="settings.isPublic"
                    checked={formData.settings.isPublic}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-header">
                  <FaLock className={`setting-icon ${formData.settings.requireApproval ? 'active' : ''}`} />
                  <div>
                    <h3>Require Approval</h3>
                    <p>New members need approval to join</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="settings.requireApproval"
                    checked={formData.settings.requireApproval}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-header">
                  <FaUsers className={`setting-icon ${formData.settings.allowInvites ? 'active' : ''}`} />
                  <div>
                    <h3>Allow Invites</h3>
                    <p>Members can invite their friends</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="settings.allowInvites"
                    checked={formData.settings.allowInvites}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-header">
                  <MdGroups className={`setting-icon ${formData.settings.groupBuyingEnabled ? 'active' : ''}`} />
                  <div>
                    <h3>Group Buying</h3>
                    <p>Enable group buying features</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="settings.groupBuyingEnabled"
                    checked={formData.settings.groupBuyingEnabled}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="group-preview">
          <h2>Preview</h2>
          <div className="preview-card">
            <div className="preview-header">
              <img 
                src={formData.image || '../images/default-group.jpg'} 
                alt="Group preview"
                className="preview-image"
              />
              <div className="preview-tier">🌿</div>
            </div>
            <div className="preview-content">
              <h3>{formData.name || 'Your Group Name'}</h3>
              <p className="preview-description">
                {formData.description || 'Your group description will appear here...'}
              </p>
              <p className="preview-category">{formData.category}</p>
              
              <div className="preview-stats">
                <div className="stat">
                  <FaUsers className="stat-icon" />
                  <span>1/{formData.maxMembers}</span>
                </div>
                <div className="stat">
                  <span className="visibility-badge">
                    {formData.settings.isPublic ? <FaGlobe /> : <FaLock />}
                    {formData.settings.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              <div className="preview-leader">
                <small>Led by {user?.name}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
