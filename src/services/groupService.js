const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('ecoSphereToken');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

class GroupService {
  // Public methods
  async getAllGroups(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const url = `${API_BASE_URL}/groups${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch groups');
    }
    
    return data;
  }
  async getGroup(groupId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch group');
    }
    
    return data;
  }

  // Authenticated methods
  async getUserGroups() {
    const response = await fetch(`${API_BASE_URL}/groups/my/groups`, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user groups');
    }
    
    return data;
  }

  async createGroup(groupData) {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create group');
    }
    
    return data;
  }

  async updateGroup(groupId, updateData) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update group');
    }
    
    return data;
  }

  async deleteGroup(groupId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete group');
    }
    
    return data;
  }

  async joinGroup(groupId, message = '') {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to join group');
    }
    
    return data;
  }

  async leaveGroup(groupId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to leave group');
    }
    
    return data;
  }

  async getGroupMembers(groupId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch group members');
    }
    
    return data;
  }

  async getGroupStats(groupId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/stats`, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch group stats');
    }
    
    return data;
  }

  async updateMemberRole(groupId, memberId, role) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update member role');
    }
    
    return data;
  }

  async removeMember(groupId, memberId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove member');
    }
    
    return data;
  }

  async approveJoinRequest(groupId, requestId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/requests/${requestId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve join request');
    }
    
    return data;
  }

  async rejectJoinRequest(groupId, requestId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/requests/${requestId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject join request');
    }
    
    return data;
  }

  // Helper methods
  getGroupTierEmoji(tier) {
    const tierEmojis = {
      'Eco Champions': '🏆',
      'Impact Leaders': '🌟',
      'Green Pioneers': '🌱',
      'Sustainability Squad': '🤝',
      'Eco Beginners': '🌿'
    };
    return tierEmojis[tier] || '🌿';
  }

  calculateGroupTier(totalImpactPoints) {
    if (totalImpactPoints >= 500000) return 'Eco Champions';
    if (totalImpactPoints >= 100000) return 'Impact Leaders';
    if (totalImpactPoints >= 25000) return 'Green Pioneers';
    if (totalImpactPoints >= 5000) return 'Sustainability Squad';
    return 'Eco Beginners';
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  }

  // Group Buying Methods
  async getGroupBuys(groupId, productId = null) {
    let url = `${API_BASE_URL}/groups/${groupId}/group-buys`;
    if (productId) {
      url += `?productId=${productId}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch group buys');
    }
    
    return data;
  }

  async startGroupBuy(groupId, groupBuyData) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/group-buys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupBuyData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to start group buy');
    }
    
    return data;
  }

  async joinGroupBuy(groupId, groupBuyId, participantData) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/group-buys/${groupBuyId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(participantData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to join group buy');
    }
    
    return data;
  }

  async leaveGroupBuy(groupId, groupBuyId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/group-buys/${groupBuyId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to leave group buy');
    }
    
    return data;
  }
}

export default new GroupService();
