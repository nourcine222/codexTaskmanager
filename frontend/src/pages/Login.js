import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext"; // Adjust import path as needed

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use the login function from context

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide");
      setLoading(false);
      return;
    }
console.log({password, email})
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password,
      }, { headers: { "Content-Type": "application/json" } });
      
      // Store token and update auth state
      localStorage.setItem("token", res.data.token);
      login(); // Update context state
      
      setSuccess("Connexion réussie! Redirection...");
      
      // Small delay to show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Échec de la connexion";
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("demo@example.com");
    setPassword("demo123");
    setSuccess("Compte démo pré-rempli. Cliquez sur Se connecter.");
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body">
          {/* Header with icon */}
          <div className="text-center mb-4">
            <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                 style={{ width: "60px", height: "60px" }}>
              <i className="fas fa-lock text-white fs-4"></i>
            </div>
            <h2 className="fw-bold text-dark">Se connecter</h2>
            <p className="text-muted">Accédez à votre compte</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              <div>{success}</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                <i className="fas fa-envelope me-2 text-primary"></i>
                Email
              </label>
              <input
                type="email"
                className={`form-control ${error && !email.includes('@') ? 'is-invalid' : ''}`}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                disabled={loading}
              />
              <div className="form-text">
                Nous ne partagerons jamais votre email.
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <label htmlFor="password" className="form-label fw-semibold">
                  <i className="fas fa-lock me-2 text-primary"></i>
                  Mot de passe
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-decoration-none text-primary small"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Votre mot de passe"
                disabled={loading}
                minLength="6"
              />
              <div className="form-text">
                Minimum 6 caractères requis.
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 fw-semibold" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Se connecter
                </>
              )}
            </button>


          </form>

          {/* Divider */}
          <div className="position-relative my-4">
            <hr />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
              Ou
            </span>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-muted mb-2">Vous n'avez pas de compte?</p>
            <Link 
              to="/register" 
              className="btn btn-success w-100 py-2 fw-semibold"
            >
              <i className="fas fa-user-plus me-2"></i>
              Créer un compte
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}