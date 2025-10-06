import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'password') {
      calculatePasswordStrength(value);
    }

    // Auto-format phone number
    if (field === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        phone: formattedPhone
      }));
    }
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10; // Fixed validation to require at least 10 digits
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "danger";
    if (passwordStrength < 75) return "warning";
    return "success";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return "Faible";
    if (passwordStrength < 75) return "Moyen";
    return "Fort";
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      return "Veuillez remplir tous les champs obligatoires";
    }
    
    if (name.length < 2) {
      return "Le nom doit contenir au moins 2 caractères";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Veuillez entrer une adresse email valide";
    }
    
    if (!validatePhoneNumber(phone)) {
      return "Veuillez entrer un numéro de téléphone valide (au moins 10 chiffres)";
    }
    
    if (password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    if (password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas";
    }
    
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: cleanedPhone,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      login(res.data.user);
      
      // Immediate redirect to dashboard without showing success message
      navigate("/dashboard");

    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "Erreur lors de la création du compte. Veuillez réessayer.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        if (err.response.data.message.includes("email") || err.response.data.message.includes("Email")) {
          errorMessage = "Cette adresse email est déjà utilisée";
        } else if (err.response.data.message.includes("phone") || err.response.data.message.includes("Phone")) {
          errorMessage = "Ce numéro de téléphone est déjà utilisé";
        }
      } else if (err.code === "NETWORK_ERROR") {
        errorMessage = "Problème de connexion. Vérifiez votre internet.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = formData.password.length >= 6;
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPhoneValid = validatePhoneNumber(formData.phone);
  const isNameValid = formData.name.length >= 2;

  return (
    <div className="container-fluid bg-gradient-primary min-vh-100 d-flex align-items-center py-0"> {/* Removed gap with py-0 */}
      <div className="row w-100 justify-content-center mx-0"> {/* Removed horizontal margin */}
        <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 px-0"> {/* Removed horizontal padding */}
          <div className="card shadow-lg border-0 rounded-0 overflow-hidden"> {/* Changed to rounded-0 for full edge */}
            {/* Header Section with Gradient - Removed bottom margin/padding */}
            <div className="bg-gradient-success text-white py-4 px-4 text-center">
              <div className="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-20 rounded-circle mb-3" 
                   style={{ width: "80px", height: "80px" }}>
                <i className="fas fa-user-plus fa-2x text-white"></i>
              </div>
              <h2 className="fw-bold mb-1">Rejoignez-nous</h2>
              <p className="mb-0 opacity-75">Créez votre compte en 30 secondes</p>
            </div>

            <div className="card-body p-5">
              {/* Error Alert Only - Success removed since we redirect immediately */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center border-0 rounded-3 mb-4">
                  <i className="fas fa-exclamation-triangle me-3 fs-5"></i>
                  <div className="flex-grow-1">
                    <strong>Attention</strong>
                    <div className="small">{error}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegister} className="mt-0"> {/* Removed top margin */}
                {/* Name Field */}
                <div className="mb-4">
                  <label htmlFor="name" className="form-label fw-semibold text-dark mb-2">
                    <i className="fas fa-user me-2 text-primary"></i>
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    className={`form-control py-2 px-3 rounded-2 border-1 ${
                      isNameValid && formData.name ? 'is-valid' : 
                      !isNameValid && formData.name ? 'is-invalid' : ''
                    }`}
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Entrez votre nom complet"
                    disabled={loading}
                  />
                  {!isNameValid && formData.name && (
                    <div className="invalid-feedback">
                      Le nom doit contenir au moins 2 caractères.
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold text-dark mb-2">
                    <i className="fas fa-envelope me-2 text-primary"></i>
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    className={`form-control py-2 px-3 rounded-2 border-1 ${
                      isEmailValid && formData.email ? 'is-valid' : 
                      !isEmailValid && formData.email ? 'is-invalid' : ''
                    }`}
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="votre@email.com"
                    disabled={loading}
                  />
                  {!isEmailValid && formData.email && (
                    <div className="invalid-feedback">
                      Veuillez fournir une adresse email valide.
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="mb-4">
                  <label htmlFor="phone" className="form-label fw-semibold text-dark mb-2">
                    <i className="fas fa-phone me-2 text-primary"></i>
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    className={`form-control py-2 px-3 rounded-2 border-1 ${
                      isPhoneValid && formData.phone ? 'is-valid' : 
                      !isPhoneValid && formData.phone ? 'is-invalid' : ''
                    }`}
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    disabled={loading}
                  />
                  {!isPhoneValid && formData.phone && (
                    <div className="invalid-feedback">
                      Veuillez fournir un numéro de téléphone valide (au moins 10 chiffres).
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label htmlFor="password" className="form-label fw-semibold text-dark mb-0">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Mot de passe *
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                    </button>
                  </div>
                  
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control py-2 px-3 rounded-2 border-1 ${
                      isPasswordValid && formData.password ? 'is-valid' : 
                      !isPasswordValid && formData.password ? 'is-invalid' : ''
                    }`}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    placeholder="Créez un mot de passe sécurisé"
                    disabled={loading}
                  />
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Force du mot de passe:</small>
                        <small className={`fw-semibold text-${getPasswordStrengthColor()}`}>
                          {getPasswordStrengthText()}
                        </small>
                      </div>
                      <div className={`progress mb-2`} style={{ height: "6px" }}>
                        <div 
                          className={`progress-bar bg-${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="form-text">
                    <small>
                      <i className="fas fa-info-circle me-1"></i>
                      Minimum 6 caractères. Inclure majuscules, chiffres et caractères spéciaux pour plus de sécurité.
                    </small>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark mb-2">
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control py-2 px-3 rounded-2 border-1 ${
                      doPasswordsMatch && formData.confirmPassword ? 'is-valid' : 
                      !doPasswordsMatch && formData.confirmPassword ? 'is-invalid' : ''
                    }`}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    placeholder="Confirmez votre mot de passe"
                    disabled={loading}
                  />
                  {!doPasswordsMatch && formData.confirmPassword && (
                    <div className="invalid-feedback">
                      ✗ Les mots de passe ne correspondent pas
                    </div>
                  )}
                  {doPasswordsMatch && formData.confirmPassword && (
                    <div className="valid-feedback">
                      ✓ Les mots de passe correspondent
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <button 
                  type="submit" 
                  className="btn btn-success w-100 py-3 fw-bold fs-5 rounded-2 shadow-sm mt-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket me-2"></i>
                      Créer mon compte
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="position-relative my-4">
                <hr className="text-muted" />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                  Déjà inscrit ?
                </span>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-muted mb-3">Vous avez déjà un compte ?</p>
                <Link to="/login" className="text-decoration-none">
                  <button type="button" className="btn btn-outline-primary w-100 py-2 fw-semibold rounded-2">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Se connecter
                  </button>
                </Link>
              </div>

              {/* Terms & Privacy */}
              <div className="text-center mt-4 pt-3 border-top">
                <p className="small text-muted mb-0">
                  En créant un compte, vous acceptez nos{' '}
                  <a href="/terms" className="text-decoration-none">Conditions d'utilisation</a>{' '}
                  et notre{' '}
                  <a href="/privacy" className="text-decoration-none">Politique de confidentialité</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}