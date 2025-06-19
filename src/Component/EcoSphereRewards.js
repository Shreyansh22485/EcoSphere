import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../Css/EcoSphereRewards.css';

const EcoSphereRewards = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');

  // Define reward categories and their unlock requirements
  const rewardCategories = {
    discounts: {
      name: 'Eco Discounts',
      icon: '💰',
      description: 'Special discounts on eco-friendly products'
    },
    badges: {
      name: 'Achievement Badges',
      icon: '🏆',
      description: 'Collectible badges for your eco journey'
    },
    exclusive: {
      name: 'Exclusive Access',
      icon: '⭐',
      description: 'Early access to new products and features'
    },
    experiences: {
      name: 'Eco Experiences',
      icon: '🌿',
      description: 'Special eco-friendly experiences and events'
    }
  };

  // Define all rewards with their unlock requirements
  const rewards = [
    // Discount Rewards
    {
      id: 1,
      category: 'discounts',
      title: '5% Eco Discount',
      description: 'Get 5% off on all eco-friendly products',
      icon: '🌱',
      requirement: 100,
      tier: 'Sprout',
      type: 'discount',
      value: '5%',
      status: user?.impactPoints >= 100 ? 'unlocked' : 'locked'
    },
    {
      id: 2,
      category: 'discounts',
      title: '10% Green Discount',
      description: 'Enhanced discount for sustainable shopping',
      icon: '🌳',
      requirement: 500,
      tier: 'Tree',
      type: 'discount',
      value: '10%',
      status: user?.impactPoints >= 500 ? 'unlocked' : 'locked'
    },
    {
      id: 3,
      category: 'discounts',
      title: '15% Forest Discount',
      description: 'Premium discount for eco champions',
      icon: '🌲',
      requirement: 1500,
      tier: 'Forest',
      type: 'discount',
      value: '15%',
      status: user?.impactPoints >= 1500 ? 'unlocked' : 'locked'
    },
    {
      id: 4,
      category: 'discounts',
      title: '20% Guardian Discount',
      description: 'Maximum discount for planet guardians',
      icon: '🌍',
      requirement: 5000,
      tier: 'Planet Guardian',
      type: 'discount',
      value: '20%',
      status: user?.impactPoints >= 5000 ? 'unlocked' : 'locked'
    },

    // Badge Rewards
    {
      id: 5,
      category: 'badges',
      title: 'First Steps Badge',
      description: 'Welcome to your eco journey!',
      icon: '👣',
      requirement: 10,
      tier: 'Seedling',
      type: 'badge',
      status: user?.impactPoints >= 10 ? 'unlocked' : 'locked'
    },
    {
      id: 6,
      category: 'badges',
      title: 'Carbon Saver Badge',
      description: 'Saved 10kg of CO2 equivalent',
      icon: '🌤️',
      requirement: 200,
      tier: 'Sprout',
      type: 'badge',
      status: user?.totalCarbonSaved >= 10 ? 'unlocked' : 'locked'
    },
    {
      id: 7,
      category: 'badges',
      title: 'Water Guardian Badge',
      description: 'Saved 100 liters of water',
      icon: '💧',
      requirement: 300,
      tier: 'Tree',
      type: 'badge',
      status: user?.totalWaterSaved >= 100 ? 'unlocked' : 'locked'
    },
    {
      id: 8,
      category: 'badges',
      title: 'Waste Warrior Badge',
      description: 'Prevented 5kg of waste',
      icon: '♻️',
      requirement: 400,
      tier: 'Tree',
      type: 'badge',
      status: user?.totalWastePrevented >= 5 ? 'unlocked' : 'locked'
    },

    // Exclusive Access Rewards
    {
      id: 9,
      category: 'exclusive',
      title: 'Beta Feature Access',
      description: 'Early access to new EcoSphere features',
      icon: '🚀',
      requirement: 250,
      tier: 'Sprout',
      type: 'access',
      status: user?.impactPoints >= 250 ? 'unlocked' : 'locked'
    },
    {
      id: 10,
      category: 'exclusive',
      title: 'Premium Product Preview',
      description: '48-hour early access to new products',
      icon: '👀',
      requirement: 750,
      tier: 'Tree',
      type: 'access',
      status: user?.impactPoints >= 750 ? 'unlocked' : 'locked'
    },
    {
      id: 11,
      category: 'exclusive',
      title: 'Eco Expert Network',
      description: 'Join exclusive sustainability community',
      icon: '🤝',
      requirement: 2000,
      tier: 'Forest',
      type: 'access',
      status: user?.impactPoints >= 2000 ? 'unlocked' : 'locked'
    },

    // Experience Rewards
    {
      id: 12,
      category: 'experiences',
      title: 'Virtual Eco Tour',
      description: 'Guided tour of sustainable facilities',
      icon: '🏭',
      requirement: 500,
      tier: 'Tree',
      type: 'experience',
      status: user?.impactPoints >= 500 ? 'unlocked' : 'locked'
    },
    {
      id: 13,
      category: 'experiences',
      title: 'Eco Workshop Access',
      description: 'Monthly sustainability workshops',
      icon: '🎓',
      requirement: 1000,
      tier: 'Tree',
      type: 'experience',
      status: user?.impactPoints >= 1000 ? 'unlocked' : 'locked'
    },
    {
      id: 14,
      category: 'experiences',
      title: 'Green Conference Invite',
      description: 'Annual EcoSphere sustainability conference',
      icon: '🌏',
      requirement: 3000,
      tier: 'Forest',
      type: 'experience',
      status: user?.impactPoints >= 3000 ? 'unlocked' : 'locked'
    }
  ];

  // Filter rewards based on active category
  const filteredRewards = activeCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === activeCategory);

  // Get user's current tier
  const getUserTier = () => {
    const points = user?.impactPoints || 0;
    if (points >= 5000) return 'Planet Guardian';
    if (points >= 1500) return 'Forest';
    if (points >= 500) return 'Tree';
    if (points >= 100) return 'Sprout';
    return 'Seedling';
  };

  // Get tier progress
  const getTierProgress = () => {
    const points = user?.impactPoints || 0;
    if (points >= 5000) return { current: points, next: null, progress: 100 };
    if (points >= 1500) return { current: points, next: 5000, progress: ((points - 1500) / (5000 - 1500)) * 100 };
    if (points >= 500) return { current: points, next: 1500, progress: ((points - 500) / (1500 - 500)) * 100 };
    if (points >= 100) return { current: points, next: 500, progress: ((points - 100) / (500 - 100)) * 100 };
    return { current: points, next: 100, progress: (points / 100) * 100 };
  };

  const tierProgress = getTierProgress();
  const unlockedCount = rewards.filter(r => r.status === 'unlocked').length;
  const totalRewards = rewards.length;

  if (!user) {
    return (
      <div className="rewards-container">
        <div className="rewards-login-prompt">
          <h2>🔒 Login Required</h2>
          <p>Please log in to view your EcoSphere rewards and achievements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-container">
      {/* Header Section */}
      <div className="rewards-header">
        <div className="rewards-title-section">
          <h1 className="rewards-title">🎁 EcoSphere Rewards</h1>
          <p className="rewards-subtitle">
            Unlock amazing rewards by making positive environmental impact!
          </p>
        </div>

        {/* User Progress Summary */}
        <div className="user-progress-card">
          <div className="progress-header">
            <div className="user-tier">
              <span className="tier-badge">{getUserTier()}</span>
              <span className="tier-points">{user.impactPoints.toLocaleString()} points</span>
            </div>
            <div className="rewards-unlocked">
              <span className="unlocked-count">{unlockedCount}/{totalRewards}</span>
              <span className="unlocked-label">Rewards Unlocked</span>
            </div>
          </div>
          
          {tierProgress.next && (
            <div className="tier-progress">
              <div className="progress-info">
                <span>Next Tier: {tierProgress.next.toLocaleString()} points</span>
                <span>{(tierProgress.next - tierProgress.current).toLocaleString()} points to go</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(tierProgress.progress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        <button 
          className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          🎯 All Rewards
        </button>
        {Object.entries(rewardCategories).map(([key, category]) => (
          <button 
            key={key}
            className={`filter-btn ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Active Category Description */}
      {activeCategory !== 'all' && (
        <div className="category-description">
          <h3>{rewardCategories[activeCategory].icon} {rewardCategories[activeCategory].name}</h3>
          <p>{rewardCategories[activeCategory].description}</p>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="rewards-grid">
        {filteredRewards.map(reward => (
          <div 
            key={reward.id} 
            className={`reward-card ${reward.status}`}
          >
            <div className="reward-icon">
              {reward.icon}
              {reward.status === 'unlocked' && (
                <div className="unlock-indicator">✅</div>
              )}
            </div>
            
            <div className="reward-content">
              <h3 className="reward-title">{reward.title}</h3>
              <p className="reward-description">{reward.description}</p>
              
              <div className="reward-details">
                <div className="reward-requirement">
                  <span className="requirement-label">Unlock at:</span>
                  <span className="requirement-value">
                    {reward.requirement.toLocaleString()} points
                  </span>
                </div>
                <div className="reward-tier">
                  <span className="tier-label">Tier:</span>
                  <span className="tier-value">{reward.tier}</span>
                </div>
              </div>
              
              {reward.status === 'locked' && (
                <div className="reward-progress">
                  <div className="progress-text">
                    {Math.max(0, reward.requirement - (user?.impactPoints || 0)).toLocaleString()} points needed
                  </div>
                  <div className="mini-progress-bar">
                    <div 
                      className="mini-progress-fill"
                      style={{ 
                        width: `${Math.min(((user?.impactPoints || 0) / reward.requirement) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {reward.status === 'unlocked' && (
                <div className="reward-unlocked">
                  <span className="unlocked-text">🎉 Unlocked!</span>
                  {reward.type === 'discount' && (
                    <span className="discount-value">{reward.value} OFF</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="rewards-cta">
        <h3>Keep Making Impact!</h3>
        <p>Continue shopping eco-friendly products to unlock more amazing rewards.</p>
        <button 
          className="shop-now-btn"
          onClick={() => window.location.href = '/ecosphere'}
        >
          🛒 Shop EcoSphere Products
        </button>
      </div>
    </div>
  );
};

export default EcoSphereRewards;
