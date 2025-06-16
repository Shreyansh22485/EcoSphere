import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateValue } from '../StateProvider';
import '../Css/Auth.css';

function PartnerRegister() {
  const navigate = useNavigate();
  const [, dispatch] = useStateValue();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.companyName || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/partner/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();      if (data.success) {
        // Store partner data and token
        localStorage.setItem('ecoSphereToken', data.data.token);
        localStorage.setItem('ecoSphereUserType', 'partner');
        localStorage.setItem('ecoSpherePartner', JSON.stringify(data.data.partner));
        
        dispatch({
          type: 'SET_USER',
          user: data.data.partner,
          userType: 'partner'
        });        alert('Partner registration successful! Welcome to EcoSphere Partner Program!');
        // Refresh the page to update header state
        window.location.href = '/partner-hub';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Partner Registration</h2>
        <p>Join EcoSphere as a Partner and promote sustainable products!</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Business Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your business email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating Partner Account...' : 'Create Partner Account'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have a partner account? <a href="/login">Sign In</a></p>
          <p>Want to create a customer account? <a href="/register-user">Register as Customer</a></p>
        </div>
      </div>
    </div>
  );
}

export default PartnerRegister;
