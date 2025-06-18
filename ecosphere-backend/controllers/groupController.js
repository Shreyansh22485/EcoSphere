const Group = require('../models/Group');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Get all groups (with filters)
 * @route   GET /api/groups
 * @access  Public
 */
const getGroups = asyncHandler(async (req, res) => {
  const { category, search, isPublic = true, page = 1, limit = 12 } = req.query;
  
  // Build query
  let query = {};
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (isPublic !== 'all') {
    query['settings.isPublic'] = isPublic === 'true';
  }
    // Execute query with pagination
  const groups = await Group.find(query)
    .populate('leader', 'name')
    .populate('members.user', 'name')
    .select('-activityLog -memberRequests') // Exclude sensitive data
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Group.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      groups,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

/**
 * @desc    Get single group details
 * @route   GET /api/groups/:id
 * @access  Public
 */
const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('leader', 'name')
    .populate('members.user', 'name')
    .populate('activityLog.user', 'name');
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
  
  // Check if user is member (if authenticated)
  let userMembership = null;
  if (req.user) {
    userMembership = group.members.find(member => 
      member.user._id.toString() === req.user.id.toString()
    );
  }
  
  res.status(200).json({
    success: true,
    data: {
      group,
      userMembership
    }
  });
});

/**
 * @desc    Create new group
 * @route   POST /api/groups
 * @access  Private
 */
const createGroup = asyncHandler(async (req, res) => {
  console.log('=== CREATE GROUP DEBUG ===');
  console.log('req.headers:', req.headers);
  console.log('req.body:', req.body);
  console.log('req.body type:', typeof req.body);
  console.log('Content-Type header:', req.get('Content-Type'));
  console.log('========================');
  
  const {
    name,
    description,
    category,
    image,
    maxMembers,
    settings
  } = req.body;
    // Check if user already leads a group (optional limit)
  const existingGroupsAsLeader = await Group.countDocuments({ leader: req.user.id });
  if (existingGroupsAsLeader >= 3) {
    return res.status(400).json({
      success: false,
      message: 'You can only lead up to 3 groups at a time'
    });
  }
    console.log('Creating group with user ID:', req.user.id);
  console.log('User object:', { 
    id: req.user.id, 
    _id: req.user._id, 
    name: req.user.name,
    'Full user object': req.user 
  });
  console.log('req.user.id type:', typeof req.user.id);
  console.log('req.user._id type:', typeof req.user._id);
  
  const group = await Group.create({
    name,
    description,
    category,
    image,
    leader: req.user.id,
    maxMembers,
    settings: {
      isPublic: settings?.isPublic !== false,
      requireApproval: settings?.requireApproval || false,
      allowInvites: settings?.allowInvites !== false,
      groupBuyingEnabled: settings?.groupBuyingEnabled !== false
    },
    members: [{
      user: req.user.id,
      role: 'leader',
      joinedAt: new Date()
    }]
  });

  console.log('Group created with ID:', group._id, 'and leader:', group.leader);
  try {
    // Update user's groups
    const user = await User.findById(req.user.id);
    console.log('Found user for update:', user ? user.name : 'User not found');
    
    if (!user) {
      throw new Error('User not found for groups update');
    }
    
    if (!user.groups) {
      user.groups = {
        memberships: [],
        totalGroupPoints: 0,
        groupsLeading: 0,
        groupAchievements: []
      };
    }
    
    user.groups.memberships.push({
      group: group._id,
      joinedAt: new Date(),
      role: 'leader',
      contributionPoints: 0,
      isActive: true
    });
    user.groups.groupsLeading += 1;
    await user.save();
    console.log('User groups updated successfully');
  } catch (userUpdateError) {
    console.log('Error updating user groups:', userUpdateError.message);
    // Continue anyway since group was created successfully
  }
  
  // Populate and return the group
  const populatedGroup = await Group.findById(group._id)
    .populate('leader', 'name')
    .populate('members.user', 'name');
    res.status(201).json({
    success: true,
    data: populatedGroup,
    message: 'Group created successfully'
  });
});

/**
 * @desc    Update group
 * @route   PUT /api/groups/:id
 * @access  Private (Leader/Moderator only)
 */
const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });  }
  
  // Check if user is leader or moderator
  const userMembership = group.members.find(member => 
    member.user.toString() === req.user.id.toString()
  );
  
  if (!userMembership || !['leader', 'moderator'].includes(userMembership.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this group'
    });
  }
  
  const {
    name,
    description,
    image,
    maxMembers,
    settings
  } = req.body;
  
  // Update allowed fields
  if (name !== undefined) group.name = name;
  if (description !== undefined) group.description = description;
  if (image !== undefined) group.image = image;
  if (maxMembers !== undefined) group.maxMembers = maxMembers;
  if (settings !== undefined) {
    group.settings = { ...group.settings, ...settings };
  }
    await group.save();
  await group.populate('leader', 'name');
  await group.populate('members.user', 'name');
  
  res.status(200).json({
    success: true,
    data: group,
    message: 'Group updated successfully'
  });
});

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (Leader only)
 */
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is leader
  if (group.leader.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only group leaders can delete groups'
    });
  }
  
  await Group.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Group deleted successfully'
  });
});

/**
 * @desc    Join group
 * @route   POST /api/groups/:id/join
 * @access  Private
 */
const joinGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if already a member
  const existingMember = group.members.find(member => 
    member.user.toString() === req.user.id.toString()
  );
  
  if (existingMember) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member of this group'
    });
  }
  
  // Check if group is full
  if (group.memberCount >= group.maxMembers) {
    return res.status(400).json({
      success: false,
      message: 'Group is full'
    });
  }
  
  // Check if group requires approval
  if (group.settings.requireApproval) {    // Check if already requested
    const existingRequest = group.memberRequests.find(request => 
      request.user.toString() === req.user.id.toString()
    );
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Join request already pending'
      });
    }
      // Add to requests
    group.memberRequests.push({
      user: req.user.id,
      message: req.body.message || '',
      requestedAt: new Date()
    });
    
    await group.save();
    
    return res.status(200).json({
      success: true,
      message: 'Join request submitted successfully'
    });
  }
  // Join directly
  group.members.push({
    user: req.user.id,
    role: 'member',
    joinedAt: new Date()
  });
  
  group.memberCount = group.members.length;
  
  // Update user's groups
  const user = await User.findById(req.user.id);
  if (!user.groups) {
    user.groups = {
      memberships: [],
      totalGroupPoints: 0,
      groupsLeading: 0,
      groupAchievements: []
    };
  }
  
  user.groups.memberships.push({
    group: group._id,
    joinedAt: new Date(),
    role: 'member',
    contributionPoints: 0,
    isActive: true
  });
  await user.save();
  // Add activity
  group.activityLog.push({
    type: 'member_joined',
    user: req.user.id,
    description: `${req.user.name} joined the group`,
    timestamp: new Date()
  });
    await group.save();
  await group.populate('members.user', 'name');
  
  res.status(200).json({
    success: true,
    data: group,
    message: 'Successfully joined the group'
  });
});

/**
 * @desc    Leave group
 * @route   POST /api/groups/:id/leave
 * @access  Private
 */
const leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is a member
  const memberIndex = group.members.findIndex(member => 
    member.user.toString() === req.user.id.toString()
  );
  
  if (memberIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this group'
    });
  }
    // Check if user is the leader
  if (group.leader.toString() === req.user.id.toString()) {
    if (group.members.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Leaders cannot leave groups with members. Transfer leadership or delete the group.'
      });
    }  }
    
  // Store member info before removal
  const memberBeingRemoved = group.members[memberIndex];
  
  // Remove member
  group.members.splice(memberIndex, 1);
  group.memberCount = group.members.length;
    
  // Update user's groups
  const user = await User.findById(req.user.id);
  if (user.groups && user.groups.memberships) {
    user.groups.memberships = user.groups.memberships.filter(membership => 
      membership.group.toString() !== req.params.id.toString()
    );
      
    // If was leader, decrease count
    if (memberBeingRemoved && memberBeingRemoved.role === 'leader') {
      user.groups.groupsLeading = Math.max(0, user.groups.groupsLeading - 1);
    }
    await user.save();
  }
    // Add activity
  group.activityLog.push({
    type: 'member_left',
    user: req.user.id,
    description: `${req.user.name} left the group`,
    timestamp: new Date()
  });
  
  await group.save();
  
  res.status(200).json({
    success: true,
    message: 'Successfully left the group'
  });
});

/**
 * @desc    Approve/Reject join request
 * @route   POST /api/groups/:id/requests/:requestId/approve
 * @route   POST /api/groups/:id/requests/:requestId/reject
 * @access  Private (Leader/Moderator only)
 */
const handleJoinRequest = asyncHandler(async (req, res) => {
  const { id: groupId, requestId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  
  const group = await Group.findById(groupId);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is leader or moderator
  const userMembership = group.members.find(member => 
    member.user.toString() === req.user.id.toString()
  );
  
  if (!userMembership || !['leader', 'moderator'].includes(userMembership.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to handle join requests'
    });
  }
  
  // Find the request
  const requestIndex = group.memberRequests.findIndex(request => 
    request._id.toString() === requestId
  );
  
  if (requestIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Join request not found'
    });
  }
  
  const request = group.memberRequests[requestIndex];
  
  if (action === 'approve') {
    // Check if group is full
    if (group.memberCount >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group is full'
      });
    }
    
    // Add to members
    group.members.push({
      user: request.user,
      role: 'member',
      joinedAt: new Date()
    });
    
    group.memberCount = group.members.length;
      // Add activity
    group.activityLog.push({
      type: 'member_joined',
      user: request.user,
      description: `Join request approved`,
      timestamp: new Date()
    });
  }
  
  // Remove request
  group.memberRequests.splice(requestIndex, 1);
  
  await group.save();
  
  res.status(200).json({
    success: true,
    message: `Join request ${action}d successfully`
  });
});

/**
 * @desc    Get group members
 * @route   GET /api/groups/:id/members
 * @access  Private (Members only)
 */
const getGroupMembers = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members.user', 'name impactPoints')
    .select('members name');
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });  }
  
  // Check if user is a member (filter out null/deleted users)
  const isMember = group.members.some(member => 
    member.user && member.user._id && member.user._id.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Members only.'
    });
  }
  
  // Filter out members with null users before returning
  const validMembers = group.members.filter(member => member.user && member.user._id);
  
  res.status(200).json({
    success: true,
    data: validMembers
  });
});

/**
 * @desc    Update member role
 * @route   PUT /api/groups/:id/members/:memberId/role
 * @access  Private (Leader only)
 */
const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!['member', 'moderator'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }
  
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is leader
  if (group.leader.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only group leaders can update member roles'
    });
  }
  
  // Find member
  const member = group.members.find(member => 
    member._id.toString() === req.params.memberId
  );
  
  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Member not found'
    });
  }
  
  // Cannot change leader role
  if (member.role === 'leader') {
    return res.status(400).json({
      success: false,
      message: 'Cannot change leader role'
    });
  }
  
  member.role = role;
  await group.save();
  
  res.status(200).json({
    success: true,
    message: 'Member role updated successfully'
  });
});

/**
 * @desc    Remove member from group
 * @route   DELETE /api/groups/:id/members/:memberId
 * @access  Private (Leader/Moderator only)
 */
const removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is leader or moderator
  const userMembership = group.members.find(member => 
    member.user.toString() === req.user.id.toString()
  );
  
  if (!userMembership || !['leader', 'moderator'].includes(userMembership.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to remove members'
    });
  }
  
  // Find member to remove
  const memberIndex = group.members.findIndex(member => 
    member._id.toString() === req.params.memberId
  );
  
  if (memberIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Member not found'
    });
  }
  
  const memberToRemove = group.members[memberIndex];
  
  // Cannot remove leader
  if (memberToRemove.role === 'leader') {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove group leader'
    });
  }
  
  // Moderators can only remove regular members
  if (userMembership.role === 'moderator' && memberToRemove.role === 'moderator') {
    return res.status(403).json({
      success: false,
      message: 'Moderators cannot remove other moderators'
    });
  }
  
  // Remove member
  group.members.splice(memberIndex, 1);
  group.memberCount = group.members.length;
  // Add activity
  group.activityLog.push({
    type: 'member_removed',
    user: req.user.id,
    description: `Member removed from group`,
    timestamp: new Date()
  });
  
  await group.save();
  
  res.status(200).json({
    success: true,
    message: 'Member removed successfully'
  });
});

/**
 * @desc    Get user's groups
 * @route   GET /api/groups/my-groups
 * @access  Private
 */
const getUserGroups = asyncHandler(async (req, res) => {  const groups = await Group.find({
    'members.user': req.user.id
  })
  .populate('leader', 'name')
  .select('name description category image memberCount maxMembers totalImpact goals.currentChallenge createdAt members')
  .sort({ createdAt: -1 });
    // Get user's role in each group
  const groupsWithRole = groups.map(group => {
    const member = group.members.find(m => m.user.toString() === req.user.id.toString());
    return {
      ...group.toObject(),
      userRole: member?.role || 'member'
    };
  });
  
  res.status(200).json({
    success: true,
    data: groupsWithRole
  });
});

/**
 * @desc    Get group stats/analytics
 * @route   GET /api/groups/:id/stats
 * @access  Private (Members only)
 */
const getGroupStats = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members.user', 'name totalImpactPoints ecoTier');
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is a member (filter out null/deleted users)
  const isMember = group.members.some(member => 
    member.user && member.user._id && member.user._id.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Members only.'
    });
  }
  
  // Calculate member stats (filter out members with null users)
  const validMembers = group.members.filter(member => member.user && member.user._id);
  const memberStats = validMembers.map(member => ({
    user: member.user,
    contributionPoints: member.contributionPoints,
    joinedAt: member.joinedAt,
    role: member.role
  })).sort((a, b) => b.contributionPoints - a.contributionPoints);
  
  // Calculate progress statistics
  const totalMemberImpact = group.members.reduce((sum, member) => 
    sum + (member.user.totalImpactPoints || 0), 0
  );
  
  const stats = {
    groupSummary: {
      totalMembers: group.memberCount,
      totalImpactPoints: group.totalImpact.impactPoints,
      carbonSaved: group.totalImpact.carbonSaved,
      waterSaved: group.totalImpact.waterSaved,
      wastePrevented: group.totalImpact.wastePrevented,
      groupPurchases: group.totalImpact.groupPurchases,
      averageImpactPerMember: group.memberCount > 0 ? Math.round(totalMemberImpact / group.memberCount) : 0
    },
    currentChallenge: group.goals.currentChallenge.isActive ? {
      name: group.goals.currentChallenge.name,
      progress: group.goals.currentChallenge.currentProgress,
      target: group.goals.currentChallenge.targetValue,
      progressPercentage: group.goals.currentChallenge.targetValue > 0 
        ? Math.round((group.goals.currentChallenge.currentProgress / group.goals.currentChallenge.targetValue) * 100)
        : 0,
      deadline: group.goals.currentChallenge.deadline
    } : null,
    monthlyTargets: {
      impactPoints: {
        target: group.goals.monthlyTargets.impactPoints.target,
        achieved: group.goals.monthlyTargets.impactPoints.achieved,
        progress: group.goals.monthlyTargets.impactPoints.target > 0 
          ? Math.round((group.goals.monthlyTargets.impactPoints.achieved / group.goals.monthlyTargets.impactPoints.target) * 100)
          : 0
      },
      carbonSaved: {
        target: group.goals.monthlyTargets.carbonSaved.target,
        achieved: group.goals.monthlyTargets.carbonSaved.achieved,
        progress: group.goals.monthlyTargets.carbonSaved.target > 0 
          ? Math.round((group.goals.monthlyTargets.carbonSaved.achieved / group.goals.monthlyTargets.carbonSaved.target) * 100)
          : 0
      }    },
    topContributors: memberStats.slice(0, 10),
    recentActivity: group.activityLog.slice(-10).reverse()
  };
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Update group progress after a purchase
 * @route   POST /api/groups/:id/progress/purchase
 * @access  Private
 */
const updateGroupProgress = asyncHandler(async (req, res) => {
  const { orderData } = req.body;  // Contains order details
  
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is a member
  const isMember = group.members.some(member => 
    member.user.toString() === req.user.id.toString()
  );
  
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'You must be a group member to contribute progress'
    });
  }
  
  // Calculate contribution points
  const contributionPoints = Math.floor((orderData.totalImpact?.impactPoints || 0) * 0.1);
  
  // Update member's contribution  const member = group.members.find(m => m.user.toString() === req.user.id.toString());
  if (member) {
    member.contributionPoints += contributionPoints;
  }
  
  // Update group totals
  group.totalImpact.impactPoints += orderData.totalImpact?.impactPoints || 0;
  group.totalImpact.carbonSaved += orderData.totalImpact?.carbonSaved || 0;
  group.totalImpact.waterSaved += orderData.totalImpact?.waterSaved || 0;
  group.totalImpact.wastePrevented += orderData.totalImpact?.wastePrevented || 0;
  group.totalImpact.totalOrders += 1;
  group.totalImpact.totalSpent += orderData.totalAmount || 0;
  
  // Update monthly targets
  group.goals.monthlyTargets.impactPoints.achieved += orderData.totalImpact?.impactPoints || 0;
  group.goals.monthlyTargets.carbonSaved.achieved += orderData.totalImpact?.carbonSaved || 0;
  
  // Check if current challenge progress should be updated
  if (group.goals.currentChallenge.isActive) {
    const challenge = group.goals.currentChallenge;
    
    switch (challenge.target) {
      case 'impact_points':
        challenge.currentProgress += orderData.totalImpact?.impactPoints || 0;
        break;
      case 'carbon_reduction':
        challenge.currentProgress += orderData.totalImpact?.carbonSaved || 0;
        break;
      case 'group_purchases':
        challenge.currentProgress += 1;
        break;
    }
    
    // Check if challenge is completed
    if (challenge.currentProgress >= challenge.targetValue) {
      // Award challenge completion rewards
      const rewardPointsPerMember = challenge.rewardValue || 50;
      
      // Award points to all active members
      for (const member of group.members.filter(m => m.isActive)) {
        member.contributionPoints += rewardPointsPerMember;
      }
      
      // Mark challenge as completed
      challenge.isActive = false;
      
      // Add achievement
      group.achievements.push({
        badgeName: `Challenge Completed: ${challenge.name}`,
        description: `Successfully completed the group challenge`,
        category: 'collaboration',
        pointsAwarded: rewardPointsPerMember,
        earnedAt: new Date()
      });
      
      // Add activity log
      group.activityLog.push({
        type: 'challenge_completed',
        description: `Challenge "${challenge.name}" completed! All members earned ${rewardPointsPerMember} bonus points`,
        metadata: {
          challengeName: challenge.name,
          pointsAwarded: rewardPointsPerMember,
          participantCount: group.members.filter(m => m.isActive).length
        },
        timestamp: new Date()
      });
    }
  }
    // Add activity log
  group.activityLog.push({
    type: 'purchase_made',
    user: req.user.id,
    description: `Made a sustainable purchase contributing ${contributionPoints} points`,
    metadata: {
      orderValue: orderData.totalAmount,
      impactPoints: orderData.totalImpact?.impactPoints || 0,
      isGroupBuy: orderData.groupBuying?.hasGroupItems || false
    },
    timestamp: new Date()
  });
  
  // Update activity timestamp
  group.activity.lastActivity = new Date();
  
  await group.save();
  
  res.status(200).json({
    success: true,
    data: {
      contributionPoints,
      groupTotalImpact: group.totalImpact,
      challengeProgress: group.goals.currentChallenge.isActive ? {
        progress: group.goals.currentChallenge.currentProgress,
        target: group.goals.currentChallenge.targetValue,
        progressPercentage: Math.round((group.goals.currentChallenge.currentProgress / group.goals.currentChallenge.targetValue) * 100)
      } : null
    },
    message: 'Group progress updated successfully'
  });
});

/**
 * @desc    Create group challenge
 * @route   POST /api/groups/:id/challenges
 * @access  Private (Leader/Moderator only)
 */
const createGroupChallenge = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    target,
    targetValue,
    deadline,
    reward,
    rewardValue
  } = req.body;
  
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
    // Check if user is leader or moderator
  const userMembership = group.members.find(member => 
    member.user.toString() === req.user.id.toString()
  );
  
  if (!userMembership || !['leader', 'moderator'].includes(userMembership.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create challenges'
    });
  }
  
  // Check if there's already an active challenge
  if (group.goals.currentChallenge.isActive) {
    return res.status(400).json({
      success: false,
      message: 'A challenge is already active. Complete the current challenge first.'
    });
  }
  
  // Create new challenge
  group.goals.currentChallenge = {
    name,
    description,
    target,
    targetValue,
    currentProgress: 0,
    deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    reward: reward || 'bonus_points',
    rewardValue: rewardValue || 50,
    isActive: true
  };
    // Add activity log
  group.activityLog.push({
    type: 'challenge_created',
    user: req.user.id,
    description: `Created new challenge: ${name}`,
    metadata: {
      challengeName: name,
      target: target,
      targetValue: targetValue,
      deadline: group.goals.currentChallenge.deadline
    },
    timestamp: new Date()
  });
  
  await group.save();
  
  res.status(201).json({
    success: true,
    data: group.goals.currentChallenge,
    message: 'Challenge created successfully'
  });
});

// Helper function to complete group challenge
async function _completeGroupChallenge(group, challenge) {
  challenge.isActive = false;
  
  // Award rewards to all active members
  const rewardPointsPerMember = challenge.rewardValue || 0;
  
  group.members.forEach(member => {
    if (member.isActive) {
      member.contributionPoints += rewardPointsPerMember;
    }
  });
  
  // Add to achievements
  group.achievements.challenges.push({
    name: challenge.name,
    completedAt: new Date(),
    participantCount: group.members.filter(m => m.isActive).length,
    pointsAwarded: rewardPointsPerMember * group.members.filter(m => m.isActive).length  });
  
  // Add activity log
  group.activityLog.push({
    type: 'challenge_completed',
    description: `Challenge "${challenge.name}" completed! All members earned ${rewardPointsPerMember} bonus points`,
    metadata: {
      challengeName: challenge.name,
      pointsAwarded: rewardPointsPerMember,
      participantCount: group.members.filter(m => m.isActive).length
    },
    timestamp: new Date()
  });
  
  return group;
}

module.exports = {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  handleJoinRequest,
  getGroupMembers,
  updateMemberRole,
  removeMember,
  getUserGroups,
  getGroupStats,
  updateGroupProgress,
  createGroupChallenge
};
