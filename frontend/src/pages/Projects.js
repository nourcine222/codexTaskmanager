import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // IMPORTED Link AND useNavigate
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CForm,
  CFormLabel, CFormTextarea, CButton, CBadge, CFormSelect,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CInputGroup,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CAvatar, CTooltip, CSpinner, CAlert
} from "@coreui/react";
import axios from "axios";
// Importing the Font Awesome CSS (assuming you have it set up globally or import it here)
// import '@fortawesome/fontawesome-free/css/all.min.css'; 

// Helper to get initials for the avatar (optional, but good practice)
const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
};

export default function Projects() {
  const navigate = useNavigate(); // Initialize navigate hook

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For success feedback

  // Modal states
  const [deleteModal, setDeleteModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: "active"
  });

  // --- Utility Functions ---

  const getAuthInfo = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    let currentUser = null;

    if (userData) {
      try {
        currentUser = JSON.parse(userData);
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
      }
    }
    return { token, currentUser };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <CBadge color="success" className="p-2">Actif</CBadge>;
      case "inactive":
        return <CBadge color="warning" className="p-2">Inactif</CBadge>;
      case "archived":
        return <CBadge color="secondary" className="p-2">Archivé</CBadge>;
      default:
        return <CBadge color="primary" className="p-2">{status}</CBadge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'short', // Changed to short for less table width
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Lifecycle & Data Fetching ---

  useEffect(() => {
    const { token, currentUser } = getAuthInfo();

    // 1. Authentication Check & Redirection
    if (!token || !currentUser) {
      console.log("No token or user found. Redirecting to landing page.");
      // Assuming your landing/login page is at the root or '/login'
      navigate('/login'); // Use the appropriate path for your login/landing page
      return; // Stop execution if not authenticated
    }
    
    setUser(currentUser);
    fetchProjects(token);
  }, [navigate]); // Added navigate to dependencies

  // Fetch projects
  const fetchProjects = async (tokenOverride) => {
    setFetchLoading(true);
    const { token } = getAuthInfo();
    const authToken = tokenOverride || token;

    if (!authToken) {
      // This is handled in useEffect, but good to have a fallback
      setError("Session expirée. Veuillez vous reconnecter.");
      setFetchLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProjects(res.data);
      setFilteredProjects(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching projects:", err);
      // More specific error message for UX
      setError("Échec du chargement des projets. Veuillez vérifier votre connexion.");
    } finally {
      setFetchLoading(false);
    }
  };

  // Search/Filter logic
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(term) ||
        (project.description && project.description.toLowerCase().includes(term))
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchTerm, projects]);

  // --- CRUD Operations ---

  // CREATE - Create new project
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    const { token, currentUser } = getAuthInfo();

    if (!token || !currentUser || !currentUser._id) {
        setError("Session invalide. Veuillez vous reconnecter.");
        setLoading(false);
        navigate('/login');
        return; 
    }

    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        status: status,
        owner: currentUser._id, 
        members: [currentUser._id] // Assuming the creator is a member
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/projects`,
        projectData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new project to the top and ensure it has the owner's details for display (if possible from the API response)
      setProjects([res.data, ...projects]); 
      setName("");
      setDescription("");
      setStatus("active");
      setSuccessMessage(`Le projet "${res.data.name}" a été créé avec succès!`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.response?.data?.message || "Échec de la création du projet. Vérifiez les données.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 5000); // Clear success message after 5 seconds
    }
  };

  // UPDATE - Edit project
  const handleEdit = async () => {
    if (!editForm.name.trim() || !selectedProject) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");
    const { token } = getAuthInfo();

    try {
      if (!token) {
        setError("Non authentifié pour modifier un projet.");
        setLoading(false);
        navigate('/login');
        return;
      }

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/projects/${selectedProject._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the projects array with the modified item
      setProjects(projects.map(p => p._id === selectedProject._id ? res.data : p));
      setEditModal(false);
      setSelectedProject(null);
      setSuccessMessage(`Le projet "${res.data.name}" a été mis à jour.`);
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err.response?.data?.message || "Échec de la mise à jour du projet.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 5000); // Clear success message after 5 seconds
    }
  };

  // DELETE - Delete project
  const handleDelete = async () => {
    if (!selectedProject) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");
    const { token } = getAuthInfo();

    try {
      if (!token) {
        setError("Non authentifié pour supprimer un projet.");
        setLoading(false);
        navigate('/login');
        return;
      }

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/projects/${selectedProject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects(projects.filter(p => p._id !== selectedProject._id));
      setDeleteModal(false);
      setSelectedProject(null);
      setSuccessMessage(`Le projet "${selectedProject.name}" a été supprimé.`);
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err.response?.data?.message || "Échec de la suppression du projet.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 5000); // Clear success message after 5 seconds
    }
  };

  // --- Modal Handlers ---

  const showProjectDetails = (project) => {
    setSelectedProject(project);
    setViewModal(true);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setEditForm({
      name: project.name,
      description: project.description || "",
      status: project.status
    });
    setEditModal(true);
  };

  const openDeleteModal = (project) => {
    setSelectedProject(project);
    setDeleteModal(true);
  };
  
  // Render nothing if not authenticated yet, to prevent flickering before redirect
  if (fetchLoading && !user) {
    return (
      <CContainer className="mt-5 text-center">
        <CSpinner color="primary" />
        <p className="mt-3">Vérification de la session...</p>
      </CContainer>
    );
  }

  return (
    <CContainer className="mt-4 mb-5">
      <h1 className="mb-4 text-primary">Tableau de Bord des Projets</h1>
      
      {/* Notifications */}
      {error && (
        <CAlert color="danger" className="mb-4" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-triangle me-2"></i> {error}
        </CAlert>
      )}
      {successMessage && (
        <CAlert color="success" className="mb-4" dismissible onClose={() => setSuccessMessage("")}>
          <i className="fas fa-check-circle me-2"></i> {successMessage}
        </CAlert>
      )}

      {/* CREATE FORM */}
      {user && (
        <CRow className="mb-4">
          <CCol>
            <CCard className="shadow-lg border-0">
              <CCardHeader className="bg-light text-dark border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-plus-circle me-2"></i> Créer un Nouveau Projet
                </h5>
              </CCardHeader>
              <CCardBody>
                <CForm onSubmit={handleCreate}>
                  <CRow className="g-3 align-items-end">
                    <CCol md={4}>
                      <CFormLabel htmlFor="projectName">Nom du projet <span className="text-danger">*</span></CFormLabel>
                      <input 
                        id="projectName"
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Ex: Refonte du site web"
                        disabled={loading}
                      />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel htmlFor="projectStatus">Statut</CFormLabel>
                      <CFormSelect
                        id="projectStatus"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="archived">Archivé</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={5}>
                      <CFormLabel htmlFor="projectDescription">Description (courte)</CFormLabel>
                      <input 
                        id="projectDescription"
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brève description du projet"
                        disabled={loading}
                      />
                    </CCol>
                    <CCol xs={12} className="text-end">
                      <CButton 
                        type="submit" 
                        color="primary" 
                        disabled={loading || !name.trim()}
                      >
                        {loading ? (
                           <><CSpinner size="sm" component="span" aria-hidden="true" className="me-2" /> Création...</>
                        ) : <><i className="fas fa-save me-2"></i> Créer le Projet</>}
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      ---

      {/* SEARCH BAR & PROJECTS TABLE */}
      <CRow>
        <CCol>
          <CCard className="shadow-lg border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-clipboard-list me-2"></i> Liste des Projets
              </h5>
              <CBadge color="light" className="text-primary fs-6">{projects.length} Total</CBadge>
            </CCardHeader>
            <CCardBody>
              {/* Search Bar */}
              <CInputGroup className="mb-3">
                <input
                  className="form-control"
                  placeholder="Rechercher un projet par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CButton color="secondary" variant="outline">
                  <i className="fas fa-search"></i>
                </CButton>
              </CInputGroup>

              {/* Table */}
              {fetchLoading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-3">Chargement des projets...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-5 text-muted bg-light border rounded">
                  <i className="fas fa-box-open fa-2x mb-3"></i>
                  <p className="mb-0">
                    {searchTerm ? `Aucun projet ne correspond à "${searchTerm}".` : "Aucun projet n'est disponible. Créez-en un ci-dessus!"}
                  </p>
                </div>
              ) : (
                <CTable responsive hover striped>
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell className="text-nowrap">Nom du Projet</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Statut</CTableHeaderCell>
                      <CTableHeaderCell className="text-nowrap">Créé le</CTableHeaderCell>
                      <CTableHeaderCell className="text-center text-nowrap">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredProjects.map((project) => (
                      <CTableRow key={project._id} onClick={() => showProjectDetails(project)} style={{ cursor: 'pointer' }}>
                        <CTableDataCell>
                          <strong className="text-primary">{project.name}</strong>
                        </CTableDataCell>
                        <CTableDataCell className="text-truncate" style={{ maxWidth: '250px' }}>
                          {project.description || (
                            <em className="text-muted small">Aucune description</em>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {getStatusBadge(project.status)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <small>{formatDate(project.createdAt)}</small>
                        </CTableDataCell>
                        <CTableDataCell className="text-center text-nowrap">
                          <div className="d-flex gap-2 justify-content-center">

                            {/* View Button */}
                            <CTooltip content="Voir les détails">
                              <CButton color="info" size="sm" onClick={(e) => { e.stopPropagation(); showProjectDetails(project); }}>
                                <i className="fas fa-eye"></i>
                              </CButton>
                            </CTooltip>

                            {/* Edit Button */}
                            <CTooltip content="Modifier">
                              <CButton color="warning" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(project); }}>
                                <i className="fas fa-edit"></i>
                              </CButton>
                            </CTooltip>

                            {/* Delete Button */}
                            <CTooltip content="Supprimer">
                              <CButton color="danger" size="sm" onClick={(e) => { e.stopPropagation(); openDeleteModal(project); }}>
                                <i className="fas fa-trash-alt"></i>
                              </CButton>
                            </CTooltip>

                            {/* Tasks Link */}
                            <CTooltip content="Gérer les tâches">
                              <Link 
                                to={`/tasks/${project._id}`}
                                className="btn btn-sm btn-primary d-flex align-items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="fas fa-tasks me-1"></i> Tâches
                              </Link>
                            </CTooltip>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* VIEW MODAL (Improved) */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>Détails du Projet: <span className="text-primary">{selectedProject?.name}</span></CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedProject && (
            <div>
              <dl className="row">
                <dt className="col-sm-3">Statut:</dt>
                <dd className="col-sm-9">{getStatusBadge(selectedProject.status)}</dd>

                <dt className="col-sm-3">Propriétaire:</dt>
                <dd className="col-sm-9">
                  <div className="d-flex align-items-center">
                    <CAvatar color="primary" textColor="white" size="sm" className="me-2">
                      {getInitials(user?.name)}
                    </CAvatar>
                    <span>{user?.name || user?.email || "Inconnu"}</span>
                  </div>
                </dd>

                <dt className="col-sm-3">Créé le:</dt>
                <dd className="col-sm-9">{formatDate(selectedProject.createdAt)}</dd>

                <dt className="col-sm-3">Modifié le:</dt>
                <dd className="col-sm-9">{formatDate(selectedProject.updatedAt)}</dd>
                
                <hr className="my-3"/>
                
                <dt className="col-sm-12 mb-2">Description Complète:</dt>
                <dd className="col-sm-12 text-muted">
                  <p className="border p-3 rounded bg-light">{selectedProject.description || "Aucune description détaillée fournie."}</p>
                </dd>
              </dl>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModal(false)}>
            Fermer
          </CButton>
          <CButton color="warning" onClick={() => { setViewModal(false); openEditModal(selectedProject); }} className="me-2">
            <i className="fas fa-edit me-1"></i> Modifier
          </CButton>
          <Link 
            to={`/tasks/${selectedProject?._id}`} 
            className="btn btn-primary"
            onClick={() => setViewModal(false)}
          >
            <i className="fas fa-tasks me-1"></i> Voir les Tâches
          </Link>
        </CModalFooter>
      </CModal>

      {/* EDIT MODAL (Slightly improved) */}
      <CModal visible={editModal} onClose={() => setEditModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Modifier le Projet: <span className="text-warning">{selectedProject?.name}</span></CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel>Nom du projet <span className="text-danger">*</span></CFormLabel>
              <input
                type="text"
                className="form-control"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Description</CFormLabel>
              <CFormTextarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows="3"
                placeholder="Description détaillée du projet"
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Statut</CFormLabel>
              <CFormSelect
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="archived">Archivé</option>
              </CFormSelect>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)} disabled={loading}>
            Annuler
          </CButton>
          <CButton 
            color="warning" 
            onClick={handleEdit}
            disabled={loading || !editForm.name.trim()}
          >
            {loading ? <><CSpinner size="sm" component="span" aria-hidden="true" className="me-2" /> Mise à jour...</> : <><i className="fas fa-sync-alt me-1"></i> Sauvegarder</>}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* DELETE CONFIRMATION MODAL (Slightly improved) */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle className="text-danger">
            <i className="fas fa-exclamation-triangle me-2"></i> Confirmer la Suppression
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Êtes-vous sûr de vouloir supprimer le projet <strong className="text-danger">{selectedProject?.name}</strong> ?
            <br />
            <small className="text-muted">Cette action est irréversible et supprimera toutes les données associées.</small>
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)} disabled={loading}>
            Annuler
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <><CSpinner size="sm" component="span" aria-hidden="true" className="me-2" /> Suppression...</> : <><i className="fas fa-trash-alt me-1"></i> Supprimer Définitivement</>}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
}