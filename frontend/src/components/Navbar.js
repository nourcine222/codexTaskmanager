import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ toggleSidebar, isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const headerStyle = {
    backgroundColor: '#f8f9fa',
    color: '#000',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '60px',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    color: '#000',
    border: '1px solid #000',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    textDecoration: 'none',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
  };

  const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontSize: '1.2rem',
    cursor: 'pointer',
    marginRight: '1rem',
    padding: '0.5rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    display: isAuthenticated ? 'block' : 'none',
  };

  const authSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  const handleHome = () => navigate('/');
    
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };


  return (
    <header style={headerStyle}>
      {isAuthenticated && (
        <button
          style={toggleButtonStyle}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(0,0,0,0.05)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
        >
          ☰
        </button>
      )}

      <div
        style={{
          fontWeight: 'bold',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
        }}
        onClick={handleHome}
      >
        ⚡ Task Manager
      </div>

      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {!isAuthenticated ? (
          <div style={authSectionStyle}>
            <button
              style={buttonStyle}
              onClick={handleLogin}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(0,0,0,0.05)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              🔑 Login
            </button>
            <button
              style={primaryButtonStyle}
              onClick={handleRegister}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
            >
              📝 Register
            </button>
          </div>
        ) : (
          <div style={authSectionStyle}>
            <span>👤 Welcome, User!</span>
            <button
              style={buttonStyle}
              onClick={handleLogout}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(0,0,0,0.05)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}