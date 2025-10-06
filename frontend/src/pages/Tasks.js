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
  CFormSelect,
  CButton,
} from "@coreui/react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function Tasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("en attente");
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/tasks`,
        { title, projectId, assignedTo, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, res.data]);
      setTitle("");
      setAssignedTo("");
      setStatus("en attente");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [projectId]);

  return (
    <CContainer className="mt-4">
      <h2 className="mb-4">Tâches du projet</h2>
      <CRow>
        <CCol md={6}>
          <CCard className="shadow-sm mb-4">
            <CCardHeader>Créer une tâche</CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleCreateTask}>
                <CFormLabel htmlFor="title">Titre</CFormLabel>
                <CFormInput
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Nom de la tâche"
                  className="mb-3"
                />
                <CFormLabel htmlFor="assignedTo">Assigner à</CFormLabel>
                <CFormSelect
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                  className="mb-3"
                >
                  <option value="">Choisir un utilisateur</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </CFormSelect>
                <CFormLabel htmlFor="status">Statut</CFormLabel>
                <CFormSelect
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mb-3"
                >
                  <option value="en attente">En attente</option>
                  <option value="en cours">En cours</option>
                  <option value="terminé">Terminé</option>
                </CFormSelect>
                <CButton type="submit" color="primary" className="w-100" disabled={loading}>
                  {loading ? "Création..." : "Ajouter la tâche"}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="shadow-sm">
            <CCardHeader>Liste des tâches</CCardHeader>
            <CCardBody>
              {tasks.length === 0 && <p>Aucune tâche disponible</p>}
              {tasks.map((task) => (
                <div key={task._id} className="mb-2 d-flex justify-content-between">
                  <span>{task.title} - {task.status}</span>
                  <span>{task.assignedTo?.name || "Non assigné"}</span>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}
