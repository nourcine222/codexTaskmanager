import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CCardTitle,
  CCardText, CButton, CSpinner, CBadge
} from "@coreui/react";
import axios from "axios";
import AdminPanel from "./AdminPanel"; // import the admin dashboard

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente", color: "warning" },
  { value: "in progress", label: "En cours", color: "info" },
  { value: "completed", label: "Terminé", color: "success" },
];

const PROJECT_STATUS_OPTIONS = [
  { value: "in_progress", label: "En cours", color: "indigo" },
  { value: "pending", label: "Planifié", color: "slate" },
  { value: "completed", label: "Terminé", color: "green" },
];

const getToken = () => localStorage.getItem("token");
const getUserFromLocalStorage = () => {
  const userData = localStorage.getItem("user");
  try {
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getUserFromLocalStorage();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Erreur de chargement. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <CContainer className="mt-5 text-center">
        <CSpinner color="primary" /> Chargement du tableau de bord...
      </CContainer>
    );
  }

  if (!currentUser) {
    navigate("/");
    return null;
  }
  console.log(currentUser)
  // --- ADMIN CHECK ---
  if (currentUser.role === "admin") {
    console.log(currentUser)
    return <AdminPanel />;
  }

  // --- REGULAR DASHBOARD ---

  const projectSummary = projects.reduce((acc, p) => {
    const s = p.status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const taskSummary = tasks.reduce((acc, t) => {
    const s = t.status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const criticalTasks = tasks.filter(
    (t) => t.priority === "high" && t.status !== "completed"
  ).length;

  const statusColorMap = {
    indigo: "#5c6ac4",
    slate: "#6b7280",
    green: "#10b981",
    warning: "#f59e0b",
    info: "#0ea5e9",
    success: "#22c55e",
  };

  return (
    <CContainer className="mt-4">
      <h2 className="mb-4 fw-semibold">Tableau de Bord</h2>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">{error}</div>
      )}

      <CRow className="mb-4">
        <CCol md={7}>
          <CCard className="shadow-sm h-100 border-0" style={{ backgroundColor: "#3b82f6", color: "white" }}>
            <CCardBody>
              <CCardTitle className="h4 mb-3">
                Bonjour {currentUser?.name || "Utilisateur"} !
              </CCardTitle>
              <CCardText>
                Bienvenue sur votre espace de gestion. Vous avez actuellement{" "}
                <strong>{tasks.length}</strong> tâches et{" "}
                <strong>{projects.length}</strong> projets.
              </CCardText>
              <CCardText className="mt-3">
                {criticalTasks > 0 ? (
                  <CBadge style={{ backgroundColor: "#ef4444" }} className="p-2">
                    {criticalTasks} tâche(s) à haute priorité !
                  </CBadge>
                ) : (
                  <CBadge style={{ backgroundColor: "#d1d5db", color: "#111827" }} className="p-2">
                    Tout est sous contrôle !
                  </CBadge>
                )}
              </CCardText>
              <div className="mt-4">
                <CButton color="light" className="text-blue-600 me-2" onClick={() => navigate("/tasks")}>
                  Voir les Tâches
                </CButton>
                <CButton color="light" className="text-blue-600" onClick={() => navigate("/projects")}>
                  Voir les Projets
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={5}>
          <CCard className="shadow-sm h-100 border-0">
            <CCardHeader className="bg-white fw-semibold">Aujourd'hui</CCardHeader>
            <CCardBody className="text-center">
              <h1 className="display-4 text-indigo-600 mb-0">{new Date().getDate()}</h1>
              <p className="text-muted">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", month: "long", year: "numeric" })}
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-white fw-semibold">
              Synthèse des Projets ({projects.length})
            </CCardHeader>
            <CCardBody>
              <CRow xs={{ gutter: 3 }}>
                {PROJECT_STATUS_OPTIONS.map((opt) => (
                  <CCol key={opt.value} md={4}>
                    <CCard
                      className="h-100"
                      style={{ backgroundColor: "#f9fafb", borderLeft: `5px solid ${statusColorMap[opt.color]}` }}
                    >
                      <CCardBody>
                        <CCardText className="text-muted mb-1">{opt.label}</CCardText>
                        <CCardTitle className="h4">{projectSummary[opt.value] || 0}</CCardTitle>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-white fw-semibold">
              Synthèse des Tâches ({tasks.length})
            </CCardHeader>
            <CCardBody>
              <CRow xs={{ gutter: 3 }}>
                {STATUS_OPTIONS.map((opt) => (
                  <CCol key={opt.value} md={4}>
                    <CCard
                      className="h-100"
                      style={{ backgroundColor: "#f9fafb", borderLeft: `5px solid ${statusColorMap[opt.color]}` }}
                    >
                      <CCardBody>
                        <CCardText className="text-muted mb-1">{opt.label}</CCardText>
                        <CCardTitle className="h4">{taskSummary[opt.value] || 0}</CCardTitle>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}
