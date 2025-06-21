import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import groupService from '../services/groupService';
import '../Css/GroupBuyModal.css';

const GroupBuyModal = ({ product, isOpen, onClose, onJoinGroupBuy }) => {
  const { user, isAuthenticated } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const [activeGroupBuys, setActiveGroupBuys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchUserGroupsAndGroupBuys();
    }
  }, [isOpen, isAuthenticated]);

  const fetchUserGroupsAndGroupBuys = async () => {
    try {
      setLoading(true);
      // Get user's groups
      const groupsResponse = await groupService.getUserGroups();
      setUserGroups(groupsResponse.data || []);

      // Get active group buys for this product across user's groups
      const groupBuysPromises = groupsResponse.data.map(async (group) => {
        try {
          const groupBuys = await groupService.getGroupBuys(group._id, product._id);
          return { groupId: group._id, groupName: group.name, groupBuys: groupBuys.data || [] };
        } catch (error) {
          return { groupId: group._id, groupName: group.name, groupBuys: [] };
        }
      });

      const groupBuysData = await Promise.all(groupBuysPromises);
      setActiveGroupBuys(groupBuysData);
    } catch (error) {
      console.error('Error fetching group buys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroupBuy = async (groupId, groupBuyId) => {
    try {
      await groupService.joinGroupBuy(groupId, groupBuyId, {
        quantity,
        productId: product._id
      });
      
      onJoinGroupBuy({
        groupId,
        groupBuyId,
        quantity,
        product
      });
      
      onClose();
    } catch (error) {
      console.error('Error joining group buy:', error);
      alert('Failed to join group buy. Please try again.');
    }
  };

  const handleStartGroupBuy = async (groupId) => {
    try {
      const groupBuyData = {
        productId: product._id,
        targetQuantity: product.groupBuying?.minQuantity || 10,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        discountPercent: product.groupBuying?.discountPercent || 10
      };

      const response = await groupService.startGroupBuy(groupId, groupBuyData);
      
      // Join the newly created group buy
      await handleJoinGroupBuy(groupId, response.data._id);
    } catch (error) {
      console.error('Error starting group buy:', error);
      alert('Failed to start group buy. Please try again.');
    }
  };

  if (!isOpen) return null;
  if (!isAuthenticated) {
    return (
      <div className="gbm-group-buy-modal-overlay" onClick={onClose}>
        <div className="gbm-group-buy-modal" onClick={(e) => e.stopPropagation()}>
          <div className="gbm-modal-header">
            <h3>🔒 Login Required</h3>
            <button className="gbm-close-btn" onClick={onClose}>×</button>
          </div>
          <div className="gbm-modal-content">
            <p>Please log in to participate in group buying.</p>
            <button className="gbm-login-btn" onClick={() => window.location.href = '/login'}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="gbm-group-buy-modal-overlay" onClick={onClose}>
      <div className="gbm-group-buy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gbm-modal-header">
          <h3>🛒 Join Group Buy - {product.name}</h3>
          <button className="gbm-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="gbm-modal-content">
          {loading ? (
            <div className="gbm-loading">Loading your groups...</div>
          ) : userGroups.length === 0 ? (
            <div className="gbm-no-groups">
              <p>🏘️ You need to join a group first to participate in group buying!</p>
              <button 
                className="gbm-join-group-btn" 
                onClick={() => window.location.href = '/groups'}
              >
                Browse Groups
              </button>
            </div>
          ) : (
            <div className="gbm-group-buys-container">
              <div className="gbm-quantity-selector">
                <label>Quantity:</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>

              <h4>Your Groups:</h4>
              {activeGroupBuys.map(({ groupId, groupName, groupBuys }) => (
                <div key={groupId} className="gbm-group-section">
                  <h5>🏘️ {groupName}</h5>
                  
                  {groupBuys.length > 0 ? (
                    groupBuys.map((groupBuy) => (
                      <div key={groupBuy._id} className="gbm-group-buy-item">
                        <div className="gbm-group-buy-info">
                          <p>Progress: {groupBuy.currentQuantity}/{groupBuy.targetQuantity}</p>
                          <p>Discount: {groupBuy.discountPercent}%</p>
                          <p>Deadline: {new Date(groupBuy.deadline).toLocaleDateString()}</p>
                        </div>
                        <button 
                          className="gbm-join-btn"
                          onClick={() => handleJoinGroupBuy(groupId, groupBuy._id)}
                        >
                          Join Group Buy
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="gbm-no-active-buys">
                      <p>No active group buys for this product</p>
                      <button 
                        className="gbm-start-btn"
                        onClick={() => handleStartGroupBuy(groupId)}
                      >
                        Start Group Buy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupBuyModal;
