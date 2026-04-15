import React, { useState } from 'react';
import { AuthAPI } from '../utils/authApi';
import { showToast } from '../utils/helpers';
import '../styles/auth.css';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Check backend health on mount
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const isHealthy = await AuthAPI.checkBackendHealth();
        if (!isHealthy) {
          // Don't show error, just log it
          console.warn(`Backend health check failed at ${API_BASE_URL}`);
        }
      } catch (error) {
        console.warn('Backend health check error:', error);
      }
    };
    checkBackend();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AuthAPI.login(formData.username, formData.password);
      showToast('Login successful!', 'success');
      onAuthSuccess();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      await AuthAPI.register(
        formData.username,
        formData.email,
        formData.password,
        isEmployer
      );
      showToast('Registration successful!', 'success');
      onAuthSuccess();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>HireConnect</h1>
          <p>{isLogin ? 'Welcome Back' : 'Join Us Today'}</p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group checkbox">
                <label htmlFor="isEmployer">
                  <input
                    id="isEmployer"
                    type="checkbox"
                    checked={isEmployer}
                    onChange={(e) => setIsEmployer(e.target.checked)}
                    disabled={loading}
                  />
                  <span>I'm an employer</span>
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={handleToggleMode}
              className="toggle-btn"
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>

        <div className="auth-debug">
          <small>API: {API_BASE_URL}</small>
        </div>
      </div>
    </div>
  );
};
