import React from 'react';
import { Link } from "react-router-dom";

export default function Sidebar({ visible, setVisible, theme }) {
  const sidebarStyle = {
    position: 'fixed',
    left: 0,
    top: '60px',
    height: 'calc(100vh - 60px)',
    width: '250px',
    backgroundColor: theme === "dark" ? "#343a40" : "#fff",
    color: theme === "dark" ? "#fff" : "#000",
    transform: visible ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    zIndex: 900,
    padding: '1rem',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    overflowY: 'auto'
  };

  const overlayStyle = {
    position: 'fixed',
    top: '60px',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 899,
    display: visible ? 'block' : 'none'
  };

  const linkStyle = {
    color: theme === "dark" ? "#fff" : "#000",
    textDecoration: 'none',
    display: 'block',
    padding: '0.75rem 1rem',
    margin: '0.25rem 0',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  };

  return (
    <>
      {visible && <div style={overlayStyle} onClick={() => setVisible(false)} />}
      <div style={sidebarStyle}>
        <div style={{ 
          padding: '1rem', 
          fontWeight: 'bold', 
          fontSize: '0.9rem',
          opacity: 0.7,
          textTransform: 'uppercase',
          borderBottom: `1px solid ${theme === "dark" ? "#495057" : "#dee2e6"}`,
          marginBottom: '1rem'
        }}>
          Navigation
        </div>
        
        <nav>
          {[
            // Existing link
            { to: "/", label: "🏠 Accueil" },
            // New Dashboard link added here
            { to: "/dashboard", label: "📊 Dashboard" },
            // Existing links
            { to: "/projects", label: "📁 Projets" },
            { to: "/tasks", label: "✅ Tâches" }
          ].map((item, index) => (
            <Link
              key={index}
              to={item.to}
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => setVisible(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}