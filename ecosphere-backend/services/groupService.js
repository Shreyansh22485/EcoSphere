const Group = require('../models/Group');
const User = require('../models/User');

/**
 * Group service for handling business logic
 */
class GroupService {
  /**
   * Calculate group tier based on total impact
   */
  static calculateGroupTier(totalImpactPoints) {
    if (totalImpactPoints >= 500000) return 'Eco Champions';
    if (totalImpactPoints >= 100000) return 'Impact Leaders';
    if (totalImpactPoints >= 25000) return 'Green Pioneers';
    if (totalImpactPoints >= 5000) return 'Sustainability Squad';
    return 'Eco Beginners';
  }

  /**
   * Get group tier emoji
   */
  static getGroupTierEmoji(tier) {
    const tierEmojis = {
      'Eco Champions': '🏆',
      'Impact Leaders': '🌟',
      'Green Pioneers': '🌱',
      'Sustainability Squad': '🤝',
      'Eco Beginners': '🌿'
    };
    return tierEmojis[tier] || '🌿';
  }

  /**
   * Check if user can join group
   */
  static async canUserJoinGroup(userId, groupId) {
    const group = await Group.findById(groupId);
    const user = await User.findById(userId);
    
    if (!group || !user) return { canJoin: false, reason: 'Group or user not found' };
    
    // Check if already a member
    const isMember = group.members.some(member => 
      member.user.toString() === userId.toString()
    );
    if (isMember) return { canJoin: false, reason: 'Already a member' };
    
    // Check if group is full
    if (group.memberCount >= group.maxMembers) {
      return { canJoin: false, reason: 'Group is full' };
    }
    
    // Check if group is public or user has permission
    if (!group.settings.isPublic && group.settings.requireApproval) {
      return { canJoin: false, reason: 'Requires approval' };
    }
    
    // Check user's current group count (optional limit)
    const userGroupCount = user.groups?.memberships?.length || 0;
    if (userGroupCount >= 10) {
      return { canJoin: false, reason: 'Maximum groups reached' };
    }
    
    return { canJoin: true };
  }

  /**
   * Update user's group memberships when they join/leave
   */
  static async updateUserGroupMembership(userId, groupId, action, role = 'member') {
    const user = await User.findById(userId);
    if (!user) return false;
    
    if (!user.groups) {
      user.groups = {
        memberships: [],
        totalGroupPoints: 0,
        groupsLeading: 0,
        groupAchievements: []
      };
    }
    
    if (action === 'join') {
      // Add group membership
      user.groups.memberships.push({
        group: groupId,
        joinedAt: new Date(),
        role: role,
        contributionPoints: 0,
        isActive: true
      });
      
      if (role === 'leader') {
        user.groups.groupsLeading += 1;
      }
    } else if (action === 'leave') {
      // Remove group membership
      user.groups.memberships = user.groups.memberships.filter(membership => 
        membership.group.toString() !== groupId.toString()
      );
      
      if (role === 'leader') {
        user.groups.groupsLeading = Math.max(0, user.groups.groupsLeading - 1);
      }
    }
    
    await user.save();
    return true;
  }

  /**
   * Calculate member contribution rank within group
   */
  static getMemberRank(group, userId) {
    const members = group.members
      .filter(member => member.isActive)
      .sort((a, b) => b.contributionPoints - a.contributionPoints);
    
    const rank = members.findIndex(member => 
      member.user.toString() === userId.toString()
    ) + 1;
    
    return {
      rank,
      totalMembers: members.length,
      isTop10: rank <= 10,
      isTop5: rank <= 5,
      isTop3: rank <= 3
    };
  }

  /**
   * Get group recommendations for user
   */
  static async getGroupRecommendations(userId, limit = 5) {
    const user = await User.findById(userId);
    if (!user) return [];
    
    // Get user's current groups
    const userGroupIds = user.groups?.memberships?.map(m => m.group) || [];
    
    // Find groups with similar members or interests
    const recommendations = await Group.find({
      _id: { $nin: userGroupIds },
      'settings.isPublic': true,
      memberCount: { $lt: 100 }, // Not full
      $or: [
        { 'totalImpact.impactPoints': { $gte: user.impactPoints * 0.5, $lte: user.impactPoints * 2 } },
        { category: { $in: this._getUserInterestCategories(user) } }
      ]
    })
    .populate('leader', 'name avatar')
    .select('name description category image memberCount maxMembers totalImpact')
    .sort({ memberCount: -1, 'totalImpact.impactPoints': -1 })
    .limit(limit);
    
    return recommendations;
  }

  /**
   * Get user's interest categories based on purchase history
   */
  static _getUserInterestCategories(user) {
    // This could be enhanced with actual purchase data analysis
    const defaultCategories = ['Sustainable Living', 'Zero Waste', 'General Sustainability'];
    
    // Based on user's eco tier, suggest relevant categories
    if (user.impactPoints > 10000) {
      return ['Climate Action', 'Renewable Energy', 'Conservation', ...defaultCategories];
    } else if (user.impactPoints > 2000) {
      return ['Eco Fashion', 'Organic Food', 'Clean Tech', ...defaultCategories];
    }
    
    return defaultCategories;
  }

  /**
   * Process group rewards after order completion
   */
  static async processGroupRewards(orderId, userId) {
    const user = await User.findById(userId).populate('groups.memberships.group');
    if (!user || !user.groups?.memberships?.length) return;
    
    // For each active group membership
    for (const membership of user.groups.memberships) {
      if (!membership.isActive || !membership.group) continue;
      
      const group = membership.group;
      
      // Calculate contribution points (10% of impact points)
      const contributionPoints = Math.floor((user.impactPoints || 0) * 0.1);
      
      // Update member's contribution in the group
      const groupDoc = await Group.findById(group._id);
      const member = groupDoc.members.find(m => 
        m.user.toString() === userId.toString()
      );
      
      if (member) {
        member.contributionPoints += contributionPoints;
        user.groups.totalGroupPoints += contributionPoints;
        
        await groupDoc.save();
      }
    }
    
    await user.save();
  }
}

module.exports = GroupService;
