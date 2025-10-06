import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CProgress,
  CAlert,
} from "@coreui/react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    let newValue = value;
    if (field === "phone") {
      newValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({ ...prev, [field]: newValue }));

    if (field === "password") {
      calculatePasswordStrength(value);
    }
  };

  // Tunisian phone format: XX XXX XXX
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`;
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 8; // Tunisian local numbers have 8 digits
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
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

    if (!name || !email || !phone || !password || !confirmPassword)
      return "Veuillez remplir tous les champs obligatoires";

    if (name.length < 2) return "Le nom doit contenir au moins 2 caractères";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Veuillez entrer une adresse email valide";

    if (!validatePhoneNumber(phone))
      return "Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)";

    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";

    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";

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
      const cleanedPhone = formData.phone.replace(/\D/g, "");
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: cleanedPhone,
        password: formData.password,
      });

      navigate("/login"); // redirect to login after registration
    } catch (err) {
      let errorMessage = "Erreur lors de la création du compte.";
      if (err.response?.data?.message) errorMessage = err.response.data.message;
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
    <CContainer className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <CRow className="w-100 justify-content-center">
        <CCol md={6} lg={5}>
          <CCard className="shadow-sm">
            <CCardHeader className="bg-success text-white text-center py-4">
              <h2 className="mb-1">Créer un compte</h2>
              <p className="mb-0 opacity-75">Rejoignez-nous en quelques secondes</p>
            </CCardHeader>
            <CCardBody className="p-4">
              {error && <CAlert color="danger">{error}</CAlert>}

              <CForm onSubmit={handleRegister}>
                <div className="mb-3">
                  <CFormLabel>Nom complet *</CFormLabel>
                  <CFormInput
                    placeholder="Ex: Ahmed Ben Ali"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={loading}
                    className={isNameValid && formData.name ? "is-valid" : !isNameValid && formData.name ? "is-invalid" : ""}
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Email *</CFormLabel>
                  <CFormInput
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={loading}
                    className={isEmailValid && formData.email ? "is-valid" : !isEmailValid && formData.email ? "is-invalid" : ""}
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Téléphone *</CFormLabel>
                  <CFormInput
                    type="tel"
                    placeholder="Ex: 20 123 456"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={loading}
                    className={isPhoneValid && formData.phone ? "is-valid" : !isPhoneValid && formData.phone ? "is-invalid" : ""}
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Mot de passe *</CFormLabel>
                  <CFormInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Créez un mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={loading}
                    className={isPasswordValid && formData.password ? "is-valid" : !isPasswordValid && formData.password ? "is-invalid" : ""}
                  />
                  {formData.password && (
                    <CProgress className="mt-2" color={getPasswordStrengthColor()} value={passwordStrength} />
                  )}
                  <small className="text-muted">{getPasswordStrengthText()}</small>
                </div>

                <div className="mb-4">
                  <CFormLabel>Confirmer le mot de passe *</CFormLabel>
                  <CFormInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={loading}
                    className={doPasswordsMatch && formData.confirmPassword ? "is-valid" : !doPasswordsMatch && formData.confirmPassword ? "is-invalid" : ""}
                  />
                </div>

                <CButton type="submit" color="success" className="w-100" disabled={loading}>
                  {loading ? "Création..." : "Créer mon compte"}
                </CButton>
              </CForm>

              <div className="text-center mt-4">
                <p className="mb-2">Déjà un compte ?</p>
                <CButton color="primary" className="w-100" onClick={() => navigate("/login")}>
                  Se connecter
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}
