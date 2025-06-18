import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaLeaf, FaArrowLeft, FaEdit, FaTrash, FaCrown, FaUserPlus, FaUserMinus, FaTrophy, FaFire, FaCalendar, FaBullseye } from 'react-icons/fa';
import { MdGroups, MdEco } from 'react-icons/md';
import '../Css/GroupDetail.css';
import groupService from '../services/groupService';
import { useAuth } from '../hooks/useAuth';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [userMembership, setUserMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId, user]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const [groupResponse, membersResponse, statsResponse] = await Promise.all([
        groupService.getGroup(groupId),
        user ? groupService.getGroupMembers(groupId).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        user ? groupService.getGroupStats(groupId).catch(() => ({ data: null })) : Promise.resolve({ data: null })
      ]);

      setGroup(groupResponse.data.group);
      setUserMembership(groupResponse.data.userMembership);
      setMembers(membersResponse.data);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch group details:', err);
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      alert('Please log in to join groups');
      return;
    }

    try {
      await groupService.joinGroup(groupId);
      fetchGroupDetails();
      alert('Successfully joined the group!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !userMembership) return;

    if (userMembership.role === 'leader' && group.memberCount > 1) {
      alert('You cannot leave a group with members as a leader. Please transfer leadership first.');
      return;
    }

    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await groupService.leaveGroup(groupId);
        navigate('/groups');
        alert('Successfully left the group');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const canManageGroup = () => {
    return userMembership && ['leader', 'moderator'].includes(userMembership.role);
  };

  const isLeader = () => {
    return userMembership && userMembership.role === 'leader';
  };

  const getGroupTier = () => {
    return groupService.calculateGroupTier(group?.totalImpact?.impactPoints || 0);
  };

  const getGroupTierEmoji = () => {
    return groupService.getGroupTierEmoji(getGroupTier());
  };

  const getProgressPercentage = (current, target) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  if (loading) {
    return (
      <div className="group-detail-loading">
        <div className="spinner"></div>
        <p>Loading group details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-detail-error">
        <p>{error}</p>
        <button onClick={fetchGroupDetails} className="retry-btn">Try Again</button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-detail-error">
        <p>Group not found</p>
        <Link to="/groups" className="back-btn">Back to Groups</Link>
      </div>
    );
  }

  return (
    <div className="group-detail">
      {/* Header */}
      <div className="group-header">
        <div className="header-background">
          <img 
            src={group.image || '../images/default-group.jpg'} 
            alt={group.name}
            className="header-image"
          />
          <div className="header-overlay"></div>
        </div>
        
        <div className="header-content">
          <Link to="/groups" className="back-link">
            <FaArrowLeft /> Back to Groups
          </Link>
          
          <div className="group-info">
            <div className="group-title">
              <h1>{group.name}</h1>
              <div className="group-tier-badge">
                {getGroupTierEmoji()} {getGroupTier()}
              </div>
            </div>
            
            <p className="group-description">{group.description}</p>
            <p className="group-category">{group.category}</p>
            
            <div className="group-stats">
              <div className="stat">
                <FaUsers className="stat-icon" />
                <span>{group.memberCount}/{group.maxMembers} Members</span>
              </div>
              <div className="stat">
                <FaLeaf className="stat-icon" />
                <span>{groupService.formatNumber(group.totalImpact?.impactPoints || 0)} Impact Points</span>
              </div>
              <div className="stat">
                <FaCalendar className="stat-icon" />
                <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="group-leader">
              <FaCrown className="crown-icon" />
              <span>Led by {group.leader?.name}</span>
            </div>
          </div>
          
          <div className="header-actions">            {user && !userMembership && (
              <button 
                onClick={handleJoinGroup}
                className="btn btn-join"
                disabled={group.memberCount >= group.maxMembers}
              >
                <FaUserPlus /> {group.memberCount >= group.maxMembers ? 'Group Full' : 'Join Group'}
              </button>
            )}
            
            {userMembership && (
              <div className="member-actions">
                <div className="member-info">
                  <span className="member-badge">
                    {userMembership.role === 'leader' && <FaCrown />}
                    {userMembership.role.charAt(0).toUpperCase() + userMembership.role.slice(1)}
                  </span>
                </div>
                
                <button 
                  onClick={handleLeaveGroup}
                  className="btn btn-outline"
                >
                  <FaUserMinus /> Leave Group
                </button>
                
                {canManageGroup() && (
                  <Link to={`/groups/${groupId}/manage`} className="btn btn-secondary">
                    <FaEdit /> Manage Group
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <MdGroups /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <FaUsers /> Members
        </button>
        <button 
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <FaBullseye /> Progress
        </button>
        <button 
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <FaTrophy /> Achievements
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Group Info */}
              <div className="info-card">
                <h3><MdEco className="card-icon" /> Group Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="label">Category:</span>
                    <span className="value">{group.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Type:</span>
                    <span className="value">{group.settings?.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Group Buying:</span>
                    <span className="value">{group.settings?.groupBuyingEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="info-card">
                <h3><FaLeaf className="card-icon" /> Environmental Impact</h3>
                <div className="impact-grid">
                  <div className="impact-item">
                    <div className="impact-value">{groupService.formatNumber(group.totalImpact?.impactPoints || 0)}</div>
                    <div className="impact-label">Impact Points</div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-value">{group.totalImpact?.carbonSaved || 0} kg</div>
                    <div className="impact-label">Carbon Saved</div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-value">{group.totalImpact?.waterSaved || 0} L</div>
                    <div className="impact-label">Water Saved</div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-value">{group.totalImpact?.wastePrevented || 0} kg</div>
                    <div className="impact-label">Waste Prevented</div>
                  </div>
                </div>
              </div>

              {/* Current Challenge */}
              {group.goals?.currentChallenge?.isActive && (
                <div className="info-card challenge-card">
                  <h3><FaFire className="card-icon" /> Current Challenge</h3>
                  <div className="challenge-info">
                    <h4>{group.goals.currentChallenge.name}</h4>
                    <p>{group.goals.currentChallenge.description}</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${getProgressPercentage(
                            group.goals.currentChallenge.currentProgress,
                            group.goals.currentChallenge.targetValue
                          )}%` 
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {group.goals.currentChallenge.currentProgress} / {group.goals.currentChallenge.targetValue}
                    </div>
                    {group.goals.currentChallenge.deadline && (
                      <div className="challenge-deadline">
                        Deadline: {new Date(group.goals.currentChallenge.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-tab">
            <div className="members-header">
              <h3><FaUsers className="card-icon" /> Group Members ({members.length})</h3>
            </div>
            <div className="members-grid">
              {members.map(member => (
                <div key={member._id} className="member-card">
                  <div className="member-avatar">
                    <img 
                      src={member.user.avatar || '../images/default-avatar.jpg'} 
                      alt={member.user.name}
                    />
                    {member.role === 'leader' && <FaCrown className="role-icon leader" />}
                    {member.role === 'moderator' && <FaCrown className="role-icon moderator" />}
                  </div>
                  <div className="member-info">
                    <h4>{member.user.name}</h4>
                    <p className="member-role">{member.role}</p>
                    <div className="member-stats">
                      <span><FaLeaf /> {member.contributionPoints} points</span>
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && stats && (
          <div className="progress-tab">
            <div className="progress-grid">
              {/* Monthly Targets */}
              <div className="progress-card">
                <h3><FaBullseye className="card-icon" /> Monthly Targets</h3>
                <div className="target-list">
                  <div className="target-item">
                    <div className="target-header">
                      <span>Impact Points</span>
                      <span>{stats.monthlyTargets.impactPoints.achieved} / {stats.monthlyTargets.impactPoints.target}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${stats.monthlyTargets.impactPoints.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="target-item">
                    <div className="target-header">
                      <span>Carbon Saved</span>
                      <span>{stats.monthlyTargets.carbonSaved.achieved} / {stats.monthlyTargets.carbonSaved.target} kg</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${stats.monthlyTargets.carbonSaved.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Contributors */}
              <div className="progress-card">
                <h3><FaTrophy className="card-icon" /> Top Contributors</h3>
                <div className="contributors-list">
                  {stats.topContributors.slice(0, 5).map((contributor, index) => (
                    <div key={contributor.user._id} className="contributor-item">
                      <div className="contributor-rank">#{index + 1}</div>
                      <div className="contributor-info">
                        <span className="contributor-name">{contributor.user.name}</span>
                        <span className="contributor-points">{contributor.contributionPoints} points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <div className="achievements-grid">
              <div className="achievement-card">
                <FaTrophy className="achievement-icon" />
                <h3>Group Achievements</h3>
                <p>Coming soon! Track your group's milestones and rewards.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
