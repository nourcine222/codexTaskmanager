import React, { useState, useEffect } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
} from "@coreui/react";
import axios from "axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProjects(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/projects`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([...projects, res.data]);
      setName("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <CContainer className="mt-4">
      <h2 className="mb-4">Mes projets</h2>
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard className="shadow-sm">
            <CCardHeader>Créer un projet</CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleCreate}>
                <CFormLabel htmlFor="name">Nom du projet</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nom du projet"
                  className="mb-3"
                />
                <CButton type="submit" color="primary" disabled={loading}>
                  {loading ? "Création..." : "Créer"}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="shadow-sm">
            <CCardHeader>Liste des projets</CCardHeader>
            <CCardBody>
              {projects.length === 0 && <p>Aucun projet disponible</p>}
              {projects.map((project) => (
                <div key={project._id} className="mb-2 d-flex justify-content-between">
                  <span>{project.name}</span>
                  <CButton color="secondary" size="sm" href={`/tasks/${project._id}`}>
                    Voir
                  </CButton>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}
