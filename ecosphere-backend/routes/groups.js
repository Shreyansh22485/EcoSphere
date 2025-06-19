const express = require('express');
const router = express.Router();
const {
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
  createGroupChallenge,
  getGroupBuys,
  startGroupBuy,
  joinGroupBuy,
  leaveGroupBuy
} = require('../controllers/groupController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', getGroups); 
router.get('/:id', optionalAuth, getGroup);  // Use optional auth to get user membership

// Public group information routes (no auth required)
router.get('/:id/members', getGroupMembers);
router.get('/:id/stats', getGroupStats);
router.get('/:id/group-buys', getGroupBuys);

// Protected routes - require authentication
router.use(protect);

// User's groups
router.get('/my/groups', getUserGroups);

// Group CRUD operations
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Group membership
router.post('/:id/join', joinGroup);
router.post('/:id/leave', leaveGroup);

// Member management
router.put('/:id/members/:memberId/role', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

// Join requests
router.post('/:id/requests/:requestId/approve', (req, res, next) => {
  req.body.action = 'approve';
  handleJoinRequest(req, res, next);
});

router.post('/:id/requests/:requestId/reject', (req, res, next) => {
  req.body.action = 'reject';
  handleJoinRequest(req, res, next);
});

// Group analytics
// (moved to public section above)

// Group challenges and goals
router.post('/:id/challenges', createGroupChallenge);

router.put('/:id/challenges/:challengeId', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Update group challenge endpoint - Coming Soon',
    data: req.body
  });
});

// Group progress tracking
router.post('/:id/progress/purchase', updateGroupProgress);

// Group buying
router.post('/:id/group-buy', startGroupBuy);
router.get('/:id/group-buy/active', getGroupBuys);
router.post('/:id/group-buy/join', joinGroupBuy);
router.post('/:id/group-buy/leave', leaveGroupBuy);

// Group Buying routes
router.post('/:id/group-buys', startGroupBuy);
router.post('/:id/group-buys/:groupBuyId/join', joinGroupBuy);
router.post('/:id/group-buys/:groupBuyId/leave', leaveGroupBuy);

// Group achievements (placeholder endpoints)
router.get('/:id/achievements', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Group achievements endpoint - Coming Soon',
    data: []
  });
});

module.exports = router;
