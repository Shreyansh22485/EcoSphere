import apiService from './apiService';

const dashboardService = {
  // Get user dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await apiService.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

export default dashboardService;
