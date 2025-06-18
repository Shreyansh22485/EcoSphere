import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaLeaf, FaSearch, FaPlus, FaFire, FaTrophy, FaStar } from 'react-icons/fa';
import { MdGroups, MdEco } from 'react-icons/md';
import { BiCategory } from 'react-icons/bi';
import '../Css/EcoSphereGroups.css';
import groupService from '../services/groupService';
import { useAuth } from '../hooks/useAuth';

const EcoSphereGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    page: 1
  });

  const categories = [
    'all',
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

  useEffect(() => {
    fetchGroups();
    if (user) {
      fetchUserGroups();
    }
  }, [filters, user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getAllGroups(filters);
      setGroups(response.data.groups);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await groupService.getUserGroups();
      setUserGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch user groups:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      category,
      page: 1
    }));
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      alert('Please log in to join groups');
      return;
    }

    try {
      await groupService.joinGroup(groupId);
      fetchGroups();
      fetchUserGroups();
      alert('Successfully joined the group!');
    } catch (err) {
      alert(err.message);
    }
  };

  const isUserMember = (groupId) => {
    return userGroups.some(group => group._id === groupId);
  };

  const getGroupTier = (totalImpactPoints) => {
    return groupService.calculateGroupTier(totalImpactPoints);
  };

  const getGroupTierEmoji = (tier) => {
    return groupService.getGroupTierEmoji(tier);
  };

  return (
    <div className="ecosphere-groups">
      {/* Hero Section */}
      <div className="groups-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              <MdGroups className="hero-icon" />
              EcoSphere Groups
            </h1>
            <p>Join like-minded individuals on a mission to create a sustainable future. 
               Collaborate, compete, and make a real environmental impact together.</p>
            <div className="hero-stats">
              <div className="stat">
                <FaUsers className="stat-icon" />
                <span>1,200+ Members</span>
              </div>
              <div className="stat">
                <MdEco className="stat-icon" />
                <span>250+ Groups</span>
              </div>
              <div className="stat">
                <FaLeaf className="stat-icon" />
                <span>50K+ Impact Points</span>
              </div>
            </div>
          </div>
          <div className="hero-actions">
            {user && (
              <Link to="/groups/create" className="btn btn-primary">
                <FaPlus /> Create Group
              </Link>
            )}
            <Link to="#discover" className="btn btn-secondary">
              Discover Groups
            </Link>
          </div>
        </div>
      </div>

      {/* User's Groups Section */}
      {user && userGroups.length > 0 && (
        <div className="user-groups-section">
          <h2><FaStar className="section-icon" /> Your Groups</h2>
          <div className="groups-grid">
            {userGroups.slice(0, 3).map(group => (
              <div key={group._id} className="group-card user-group">
                <div className="group-header">
                  <img 
                    src={group.image || '../images/default-group.jpg'} 
                    alt={group.name}
                    className="group-image"
                  />
                  <div className="group-tier">
                    {getGroupTierEmoji(getGroupTier(group.totalImpact?.impactPoints || 0))}
                  </div>
                </div>
                <div className="group-content">
                  <h3>{group.name}</h3>
                  <p className="group-category">{group.category}</p>
                  <div className="group-stats">
                    <span><FaUsers /> {group.memberCount}</span>
                    <span><FaLeaf /> {groupService.formatNumber(group.totalImpact?.impactPoints || 0)}</span>
                    <span className="user-role">{group.userRole}</span>
                  </div>                  <Link to={`/groups/${group._id}`} className="btn btn-dashboard">
                    View Dashboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {userGroups.length > 3 && (
            <Link to="/groups/my-groups" className="view-all-link">
              View All My Groups ({userGroups.length})
            </Link>
          )}
        </div>
      )}

      {/* Discover Groups Section */}
      <div className="discover-section" id="discover">
        <h2><BiCategory className="section-icon" /> Discover Groups</h2>
        
        {/* Search and Filters */}
        <div className="search-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search groups by name or description..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
          
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${filters.category === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading groups...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchGroups} className="retry-btn">Try Again</button>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.length === 0 ? (
              <div className="no-groups">
                <MdGroups className="no-groups-icon" />
                <h3>No groups found</h3>
                <p>Try adjusting your search criteria or create a new group!</p>
                {user && (
                  <Link to="/groups/create" className="btn btn-primary">
                    <FaPlus /> Create First Group
                  </Link>
                )}
              </div>
            ) : (
              groups.map(group => (
                <div key={group._id} className="group-card">
                  <div className="group-header">
                    <img 
                      src={group.image || '../images/default-group.jpg'} 
                      alt={group.name}
                      className="group-image"
                    />
                    <div className="group-tier">
                      {getGroupTierEmoji(getGroupTier(group.totalImpact?.impactPoints || 0))}
                    </div>
                  </div>
                  <div className="group-content">
                    <h3>{group.name}</h3>
                    <p className="group-description">{group.description}</p>
                    <p className="group-category">{group.category}</p>
                    
                    <div className="group-stats">
                      <div className="stat">
                        <FaUsers className="stat-icon" />
                        <span>{group.memberCount}/{group.maxMembers}</span>
                      </div>
                      <div className="stat">
                        <FaLeaf className="stat-icon" />
                        <span>{groupService.formatNumber(group.totalImpact?.impactPoints || 0)}</span>
                      </div>
                      <div className="stat">
                        <FaTrophy className="stat-icon" />
                        <span>{getGroupTier(group.totalImpact?.impactPoints || 0)}</span>
                      </div>
                    </div>

                    <div className="group-leader">
                      <small>Led by {group.leader?.name}</small>
                    </div>

                    <div className="group-actions">
                      <Link to={`/groups/${group._id}`} className="btn btn-outline">
                        View Details
                      </Link>
                      {user && !isUserMember(group._id) && (
                        <button 
                          onClick={() => handleJoinGroup(group._id)}
                          className="btn btn-primary"
                          disabled={group.memberCount >= group.maxMembers}
                        >
                          {group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                        </button>
                      )}
                      {isUserMember(group._id) && (
                        <span className="member-badge">
                          <FaStar /> Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Make an Impact?</h2>
          <p>Join a group today and start your journey towards a more sustainable future.</p>
          <div className="cta-actions">
            {user ? (
              <Link to="/groups/create" className="btn btn-primary btn-large">
                <FaPlus /> Create Your Group
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-large">
                Sign Up to Join Groups
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoSphereGroups;
