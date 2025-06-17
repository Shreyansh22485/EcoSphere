import axios from 'axios';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('ecoSphereToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('ecoSphereToken');
          localStorage.removeItem('ecoSphereUserType');
          localStorage.removeItem('ecoSphereUser');
          localStorage.removeItem('ecoSpherePartner');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  get(url, config = {}) {
    return this.api.get(url, config);
  }

  post(url, data = {}, config = {}) {
    return this.api.post(url, data, config);
  }

  put(url, data = {}, config = {}) {
    return this.api.put(url, data, config);
  }

  delete(url, config = {}) {
    return this.api.delete(url, config);
  }

  // File upload with FormData
  uploadFiles(url, formData, config = {}) {
    return this.api.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Authentication methods
  async login(credentials, userType = 'user') {
    const endpoint = userType === 'partner' ? '/auth/partner/login' : '/auth/login';
    return this.post(endpoint, credentials);
  }

  async register(userData, userType = 'user') {
    const endpoint = userType === 'partner' ? '/auth/partner/register' : '/auth/register';
    return this.post(endpoint, userData);
  }

  async getUserProfile() {
    return this.get('/auth/me');
  }

  async getPartnerProfile() {
    return this.get('/auth/partner/me');
  }

  // Product methods
  async getProducts(params = {}) {
    return this.get('/products', { params });
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  // Order methods
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getUserOrders() {
    return this.get('/orders/user');
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }
}

export const apiService = new ApiService();
export default apiService;
