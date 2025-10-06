import React, { useState, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AuthContext } from "./AuthContext";
import "./Layout.css";

export default function Layout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [theme, setTheme] = useState("light");
  const { isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className={`layout-container ${theme}`}>
      <Navbar
        toggleSidebar={toggleSidebar}
        theme={theme}
        setTheme={setTheme}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />
      <div className="layout-content">
        {isAuthenticated && !isAuthPage && (
          <Sidebar visible={sidebarVisible} setVisible={setSidebarVisible} theme={theme} />
        )}
        <main className={`main-content ${isAuthenticated && !isAuthPage ? "" : "full-width"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
