import {
  CButton,
  CCard,
  CCardBody,
  CContainer,
  CRow,
  CCol,
} from "@coreui/react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f6f9fc, #eef2f7)",
        minHeight: "calc(100vh - 56px)", 
        paddingTop: "2rem"
      }}
    >
      <CContainer className="text-center py-5">
        {/* Hero Section */}
        <div className="mb-5">
          <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeInDown">
            Bienvenue dans <span style={{ color: "#4e73df" }}>Task Manager</span> 🚀
          </h1>
          <p className="lead text-muted animate__animated animate__fadeInUp">
            Une application moderne pour gérer vos projets et collaborer avec votre équipe.
          </p>
          <Link to="/login">
            <CButton
              color="primary"
              size="lg"
              className="mt-4 shadow"
              style={{ borderRadius: "30px", padding: "0.8rem 2rem" }}
            >
              Commencer
            </CButton>
          </Link>
        </div>

        {/* Features Section */}
        <CRow className="justify-content-center g-4">
          <CCol md={4}>
            <CCard
              className="h-100 shadow-lg border-0"
              style={{ borderRadius: "20px", transition: "transform 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <CCardBody>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📁</div>
                <h4 className="fw-bold">Gérez vos projets</h4>
                <p className="text-muted">
                  Créez, modifiez et suivez vos projets en toute simplicité.
                </p>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol md={4}>
            <CCard
              className="h-100 shadow-lg border-0"
              style={{ borderRadius: "20px", transition: "transform 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <CCardBody>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🤝</div>
                <h4 className="fw-bold">Travaillez en équipe</h4>
                <p className="text-muted">
                  Attribuez des tâches aux membres et suivez la progression en temps réel.
                </p>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol md={4}>
            <CCard
              className="h-100 shadow-lg border-0"
              style={{ borderRadius: "20px", transition: "transform 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <CCardBody>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡</div>
                <h4 className="fw-bold">Boostez votre productivité</h4>
                <p className="text-muted">
                  Centralisez vos projets et gagnez du temps chaque jour.
                </p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}
