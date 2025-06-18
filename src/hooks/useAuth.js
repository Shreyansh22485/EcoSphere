import { useState, useEffect, useContext, createContext } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('ecoSphereToken');
      const storedUserType = localStorage.getItem('ecoSphereUserType');
        if (token && storedUserType) {
        setUserType(storedUserType);
        setIsAuthenticated(true);
          if (storedUserType === 'customer') {
          const userData = JSON.parse(localStorage.getItem('ecoSphereUser') || '{}');
          setUser(userData);
          console.log('🔄 FRONTEND AUTH CHECK - Customer loaded:', userData.name, 'ID:', userData._id);
        } else if (storedUserType === 'partner') {
          const partnerData = JSON.parse(localStorage.getItem('ecoSpherePartner') || '{}');
          setUser(partnerData);
          console.log('🔄 FRONTEND AUTH CHECK - Partner loaded:', partnerData.companyName, 'ID:', partnerData._id);
        }
      } else {
        console.log('🔄 FRONTEND AUTH CHECK - No authentication found');
        setIsAuthenticated(false);
        setUser(null);
        setUserType(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };  const login = async (email, password, userType) => {
    try {
      // Determine which endpoint to use based on userType
      let endpoint = '';
      if (userType === 'customer') {
        endpoint = `${process.env.REACT_APP_API_URL}/auth/login`;
      } else if (userType === 'partner') {
        endpoint = `${process.env.REACT_APP_API_URL}/auth/partner/login`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store auth data
        localStorage.setItem('ecoSphereToken', data.data.token);
        
        if (userType === 'customer') {
          localStorage.setItem('ecoSphereUserType', 'customer');
          localStorage.setItem('ecoSphereUser', JSON.stringify(data.data.user));
          setUser(data.data.user);
          setUserType('customer');
          console.log('🔐 FRONTEND LOGIN SUCCESS - Customer logged in:', data.data.user.name, 'ID:', data.data.user._id);
        } else if (userType === 'partner') {
          localStorage.setItem('ecoSphereUserType', 'partner');
          localStorage.setItem('ecoSpherePartner', JSON.stringify(data.data.partner));
          setUser(data.data.partner);
          setUserType('partner');
          console.log('🔐 FRONTEND LOGIN SUCCESS - Partner logged in:', data.data.partner.companyName, 'ID:', data.data.partner._id);
        }
        
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData, userType) => {
    try {
      // Determine which endpoint to use based on userType
      let endpoint = '';
      if (userType === 'customer') {
        endpoint = `${process.env.REACT_APP_API_URL}/auth/register`;
      } else if (userType === 'partner') {
        endpoint = `${process.env.REACT_APP_API_URL}/auth/partner/register`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store auth data
        localStorage.setItem('ecoSphereToken', data.data.token);
          if (userType === 'customer') {
          localStorage.setItem('ecoSphereUserType', 'customer');
          localStorage.setItem('ecoSphereUser', JSON.stringify(data.data.user));
          setUser(data.data.user);
          setUserType('customer');
          console.log('🔐 FRONTEND SIGNUP SUCCESS - Customer registered:', data.data.user.name, 'ID:', data.data.user._id);
        } else if (userType === 'partner') {
          localStorage.setItem('ecoSphereUserType', 'partner');
          localStorage.setItem('ecoSpherePartner', JSON.stringify(data.data.partner));
          setUser(data.data.partner);
          setUserType('partner');
          console.log('🔐 FRONTEND SIGNUP SUCCESS - Partner registered:', data.data.partner.companyName, 'ID:', data.data.partner._id);
        }
        
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };
  const logout = () => {
    console.log('🚪 FRONTEND LOGOUT - Clearing all authentication data');
    localStorage.removeItem('ecoSphereToken');
    localStorage.removeItem('ecoSphereUserType');
    localStorage.removeItem('ecoSphereUser');
    localStorage.removeItem('ecoSpherePartner');
    
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
  };
  const updateUser = (userData) => {
    setUser(userData);
    if (userType === 'customer') {
      localStorage.setItem('ecoSphereUser', JSON.stringify(userData));
    } else if (userType === 'partner') {
      localStorage.setItem('ecoSpherePartner', JSON.stringify(userData));
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ecoSphereToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const value = {
    user,
    userType,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
    getAuthHeaders,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
