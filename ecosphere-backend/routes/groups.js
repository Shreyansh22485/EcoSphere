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
  createGroupChallenge
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getGroups);
router.get('/:id', getGroup);

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
router.get('/:id/members', getGroupMembers);
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
router.get('/:id/stats', getGroupStats);

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

// Group buying (placeholder endpoints)
router.post('/:id/group-buy', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Group buying endpoint - Coming Soon',
    data: req.body
  });
});

router.get('/:id/group-buy/active', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get active group buys endpoint - Coming Soon',
    data: []
  });
});

// Group achievements (placeholder endpoints)
router.get('/:id/achievements', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Group achievements endpoint - Coming Soon',
    data: []
  });
});

module.exports = router;
