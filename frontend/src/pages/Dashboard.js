import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
} from "@coreui/react";
import Projects from "./Projects";
import axios from "axios";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <CContainer className="mt-4">
      <h2 className="mb-4">Dashboard</h2>

      <CRow className="mb-4">
        <CCol>
          <Projects />
        </CCol>
      </CRow>

      <CRow className="g-3">
        {projects.map((project) => (
          <CCol md={4} key={project._id}>
            <CCard className="shadow-sm">
              <CCardHeader>{project.name}</CCardHeader>
              <CCardBody>
                <CButton
                  color="primary"
                  className="w-100"
                  onClick={() => navigate(`/tasks/${project._id}`)}
                >
                  Voir les tâches
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <Outlet />
    </CContainer>
  );
}
