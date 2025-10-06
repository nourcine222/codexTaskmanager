import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CForm,
    CFormLabel, CButton, CBadge, CFormSelect, CFormTextarea,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CTooltip, CInputGroup, CFormInput
} from "@coreui/react";
import axios from "axios";
import Select from 'react-select'; // Utilisé pour l'assignation utilisateur/projet

// --- OPTIONS DE CONFIGURATION ---
const STATUS_OPTIONS = [
    { value: "pending", label: "En Attente", color: "warning" },
    { value: "in progress", label: "En Cours", color: "info" },
    { value: "completed", label: "Terminée", color: "success" },
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Faible", color: "secondary" },
    { value: "medium", label: "Moyenne", color: "primary" },
    { value: "high", label: "Haute", color: "danger" },
];

// NOUVELLES OPTIONS DE GROUPEMENT
const GROUP_OPTIONS = [
    { value: "none", label: "Aucun Groupement" },
    { value: "project", label: "Par Projet" },
    { value: "status", label: "Par Statut" },
    { value: "priority", label: "Par Priorité" },
];

export default function Tasks() {
    const navigate = useNavigate();

    // Data states
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null); // Pour la section "Mes Tâches"

    // Loading/Error states
    const [fetchLoading, setFetchLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // --- FILTRAGE ET RECHERCHE STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterProject, setFilterProject] = useState(null); // Pour le filtre par projet
    const [groupBy, setGroupBy] = useState("none"); // Pour le groupement

    // Modal states
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Form states
    const [newTaskForm, setNewTaskForm] = useState({
        title: "",
        description: "",
        project: null,
        assignedTo: null,
        deadline: "",
        priority: "medium",
    });

    const [editTaskForm, setEditTaskForm] = useState(null);

    // --- Utility Functions ---

    const getToken = () => localStorage.getItem("token");
    const getStatusLabel = (status) => STATUS_OPTIONS.find(opt => opt.value === status)?.label || status;
    const getPriorityLabel = (priority) => PRIORITY_OPTIONS.find(opt => opt.value === priority)?.label || priority;

    const getStatusBadge = (status) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
        return <CBadge color={option.color}>{option.label}</CBadge>;
    };

    const getPriorityBadge = (priority) => {
        const option = PRIORITY_OPTIONS.find(opt => opt.value === priority) || PRIORITY_OPTIONS[1];
        return <CBadge color={option.color}>{option.label}</CBadge>;
    };

    const formatDateInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Utiliser toISOString().split('T')[0] pour le format YYYY-MM-DD
        return date.toISOString().split('T')[0];
    };

    // --- Fetch Data ---

    const fetchTasks = async () => {
        const token = getToken();
        // Redirection conditionnelle (redondante mais sécuritaire ici)
        if (!token) {
            navigate("/login");
            return;
        }

        setFetchLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(res.data);
            setError("");
        } catch (err) {
            console.error("Error fetching tasks:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                // Si l'API retourne une erreur d'authentification/autorisation
                setError("Session expirée ou non autorisée. Redirection vers la connexion.");
                setTimeout(() => navigate("/login"), 1500);
            } else {
                setError(err.response?.data?.message || "Échec du chargement des tâches.");
            }
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchUsers = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const formattedUsers = res.data.map(user => ({
                value: user._id,
                label: user.name || user.email,
            }));
            setUsers(formattedUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const fetchProjects = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const formattedProjects = res.data.map(project => ({
                value: project._id,
                label: project.name,
            }));
            setProjects(formattedProjects);
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    };

    // --- Redirection et Chargement Initial ---
    useEffect(() => {
        const token = getToken();

        // **POINT DE CONTRÔLE D'AUTHENTIFICATION PRINCIPAL**
        if (!token) {
            console.log("Token non trouvé, redirection vers /login.");
            // Assurez-vous d'utiliser la bonne route pour votre page d'atterrissage/connexion
            navigate("/login"); 
            return; // Stoppe l'exécution du reste du useEffect
        }

        // Si authentifié, charge l'ID utilisateur et les données
        const userId = localStorage.getItem("currentUserId");
        setCurrentUserId(userId);

        fetchTasks();
        fetchUsers();
        fetchProjects();
    }, [navigate]); // Ajout de 'navigate' dans les dépendances


    // --- CRUD Operations (inchangées) ---

    // CREATE (inchangé)
    const handleCreateTask = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token || !newTaskForm.title.trim() || !newTaskForm.project) return;

        setActionLoading(true);
        try {
            const data = {
                title: newTaskForm.title,
                description: newTaskForm.description,
                priority: newTaskForm.priority,
                deadline: newTaskForm.deadline,
                project: newTaskForm.project.value,
                assignedTo: newTaskForm.assignedTo?.value || null,
            };

            await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchTasks();

            setCreateModal(false);
            setNewTaskForm({ title: "", description: "", project: null, assignedTo: null, deadline: "", priority: "medium" });
        } catch (err) {
            console.error("Error creating task:", err);
            setError(err.response?.data?.message || "Échec de la création de la tâche.");
        } finally {
            setActionLoading(false);
        }
    };

    // UPDATE via Edit Modal (inchangé)
    const handleEditTask = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token || !editTaskForm?.title.trim() || !selectedTask) return;

        setActionLoading(true);
        try {
            const data = {
                title: editTaskForm.title,
                description: editTaskForm.description,
                status: editTaskForm.status,
                priority: editTaskForm.priority,
                deadline: editTaskForm.deadline,
                assignedTo: editTaskForm.assignedTo?.value || null,
            };

            await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${selectedTask._id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchTasks();

            setEditModal(false);
            setSelectedTask(null);
            setEditTaskForm(null);
        } catch (err) {
            console.error("Error updating task:", err);
            setError(err.response?.data?.message || "Échec de la mise à jour de la tâche.");
        } finally {
            setActionLoading(false);
        }
    };

    // Changement de statut rapide (inchangé)
    const handleStatusChange = async (taskId, newStatus) => {
        const token = getToken();
        if (!token || !taskId) return;

        // Optimistic UI update
        setTasks(prevTasks => prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        ));

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            // Revert UI change if API call fails
            fetchTasks();
            console.error("Error updating status:", err);
            setError(err.response?.data?.message || "Échec du changement de statut.");
        }
    };

    // DELETE (inchangé)
    const handleDeleteTask = async () => {
        const token = getToken();
        if (!token || !selectedTask) return;

        setActionLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${selectedTask._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTasks(tasks.filter(t => t._id !== selectedTask._id));
            setDeleteModal(false);
            setSelectedTask(null);
        } catch (err) {
            console.error("Error deleting task:", err);
            setError(err.response?.data?.message || "Échec de la suppression de la tâche.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Modal Handlers (inchangés) ---

    const openEditModal = (task) => {
        setSelectedTask(task);

        const assignedUser = users.find(u => u.value === task.assignedTo?._id) || null;

        setEditTaskForm({
            title: task.title,
            description: task.description || "",
            status: task.status,
            assignedTo: assignedUser,
            deadline: formatDateInput(task.deadline),
            priority: task.priority
        });
        setEditModal(true);
    };

    const openDeleteModal = (task) => {
        setSelectedTask(task);
        setDeleteModal(true);
    };

    // --- Filtering and Grouping Logic (inchangée) ---

    const getFilteredAndGroupedTasks = useMemo(() => {
        // 1. Filtrer les tâches non assignées à l'utilisateur actuel (elles iront dans la section principale)
        const mainTasks = tasks.filter(task => task.assignedTo?._id !== currentUserId);

        // 2. Appliquer la recherche par terme
        let filteredTasks = mainTasks.filter(task => {
            const searchLower = searchTerm.toLowerCase();
            const titleMatch = task.title.toLowerCase().includes(searchLower);
            const descriptionMatch = task.description?.toLowerCase().includes(searchLower) ?? false;
            return titleMatch || descriptionMatch;
        });

        // 3. Appliquer le filtre par projet
        if (filterProject) {
            filteredTasks = filteredTasks.filter(task => task.project?._id === filterProject.value);
        }

        // 4. Appliquer le groupement
        if (groupBy === "none") {
            return {
                myTasks: tasks.filter(task => task.assignedTo?._id === currentUserId), // Les miennes non filtrées par search/project
                groupedTasks: { "Toutes les Tâches": filteredTasks }
            };
        }

        const grouped = filteredTasks.reduce((acc, task) => {
            let key;
            switch (groupBy) {
                case "project":
                    key = task.project?.name || "Projet Inconnu";
                    break;
                case "status":
                    key = getStatusLabel(task.status);
                    break;
                case "priority":
                    key = getPriorityLabel(task.priority);
                    break;
                default:
                    key = "Toutes les Tâches";
            }

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(task);
            return acc;
        }, {});

        return {
            myTasks: tasks.filter(task => task.assignedTo?._id === currentUserId),
            groupedTasks: grouped
        };
    }, [tasks, searchTerm, filterProject, groupBy, currentUserId]);

    const { myTasks, groupedTasks } = getFilteredAndGroupedTasks;

    const renderTaskTable = (tasksList) => (
        <CTable responsive hover className="align-middle">
            <CTableHead>
                <CTableRow>
                    <CTableHeaderCell>Titre</CTableHeaderCell>
                    <CTableHeaderCell>Projet</CTableHeaderCell>
                    {/* On n'affiche pas "Assigné à" dans "Mes Tâches" car c'est implicite */}
                    {tasksList !== myTasks && <CTableHeaderCell>Assigné à</CTableHeaderCell>}
                    <CTableHeaderCell style={{ width: '15%' }}>Statut</CTableHeaderCell>
                    <CTableHeaderCell>Priorité</CTableHeaderCell>
                    <CTableHeaderCell>Échéance</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {tasksList.map((task) => (
                    <CTableRow key={task._id}>
                        <CTableDataCell>
                            <CTooltip content={task.description || "Pas de description"}>
                                <strong>{task.title}</strong>
                            </CTooltip>
                        </CTableDataCell>
                        <CTableDataCell>
                            {task.project?.name || <span className="text-danger">Inconnu</span>}
                        </CTableDataCell>
                        {tasksList !== myTasks && (
                            <CTableDataCell>
                                {task.assignedTo ? (
                                    task.assignedTo.name || task.assignedTo.email
                                ) : (
                                    <span className="text-muted">Non assigné</span>
                                )}
                            </CTableDataCell>
                        )}
                        {/* GESTION RAPIDE DU STATUT */}
                        <CTableDataCell>
                            <CFormSelect
                                value={task.status}
                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                size="sm"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </CFormSelect>
                        </CTableDataCell>
                        {/* FIN GESTION RAPIDE DU STATUT */}
                        <CTableDataCell>{getPriorityBadge(task.priority)}</CTableDataCell>
                        <CTableDataCell>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                            <div className="d-flex justify-content-center">
                                <CTooltip content="Modifier la tâche">
                                    <CButton
                                        color="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => openEditModal(task)}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </CButton>
                                </CTooltip>
                                <CTooltip content="Supprimer la tâche">
                                    <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() => openDeleteModal(task)}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </CButton>
                                </CTooltip>
                            </div>
                        </CTableDataCell>
                    </CTableRow>
                ))}
            </CTableBody>
        </CTable>
    );


    if (fetchLoading) {
        return <CContainer className="mt-5 text-center">Chargement des tâches...</CContainer>;
    }

    return (
        <CContainer className="mt-4">
            <CRow className="mb-4 d-flex justify-content-between align-items-center">
                <CCol xs={8}>
                    <h2>Gestion des Tâches</h2>
                </CCol>
                <CCol xs={4} className="text-end">
                    <CButton
                        color="primary"
                        onClick={() => setCreateModal(true)}
                    >
                        <i className="fas fa-plus me-1"></i> Nouvelle Tâche
                    </CButton>
                </CCol>
            </CRow>

            {error && (
                <div className="alert alert-danger mb-4" role="alert">{error}</div>
            )}

            {/* --- SEARCH AND FILTER BAR --- */}
            <CCard className="shadow-sm mb-4">
                <CCardBody>
                    <CRow className="g-3 align-items-end">
                        <CCol md={4}>
                            <CFormLabel>Recherche par titre/description</CFormLabel>
                            <CInputGroup>
                                <CFormInput
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <CButton color="secondary" onClick={() => setSearchTerm("")} title="Effacer la recherche">
                                    <i className="fas fa-times"></i>
                                </CButton>
                            </CInputGroup>
                        </CCol>

                        <CCol md={4}>
                            <CFormLabel>Filtrer par Projet</CFormLabel>
                            <Select
                                options={projects}
                                isClearable
                                placeholder="Tous les projets"
                                value={filterProject}
                                onChange={setFilterProject}
                            />
                        </CCol>

                        <CCol md={4}>
                            <CFormLabel>Grouper par</CFormLabel>
                            <CFormSelect
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                            >
                                {GROUP_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>
            {/* --- END SEARCH AND FILTER BAR --- */}

            {/* --- TASKS ASSIGNED TO CURRENT USER --- */}
            {currentUserId && myTasks.length > 0 && (
                <CRow className="mb-4">
                    <CCol>
                        <CCard className="shadow-lg border-primary border-3">
                            <CCardHeader className="bg-primary text-white">
                                <strong><i className="fas fa-user-check me-2"></i> Mes Tâches ({myTasks.length})</strong>
                                <small className="d-block">Tâches directement assignées à vous.</small>
                            </CCardHeader>
                            <CCardBody className="p-0">
                                {renderTaskTable(myTasks)}
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            )}
            {/* --- END MY TASKS --- */}

            {/* --- MAIN TASKS TABLE (Filtered & Grouped) --- */}
            <CRow>
                <CCol>
                    <CCard className="shadow-sm">
                        <CCardHeader>
                            <strong>Liste des Tâches</strong>
                        </CCardHeader>
                        <CCardBody className="p-0">
                            {Object.keys(groupedTasks).length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    {searchTerm || filterProject ? "Aucune tâche ne correspond à vos critères de recherche/filtre." : "Aucune tâche trouvée (en dehors de celles qui vous sont assignées)."}
                                </div>
                            ) : (
                                Object.keys(groupedTasks).map(groupKey => (
                                    <div key={groupKey} className="mb-4">
                                        {groupBy !== "none" && (
                                            <h5 className="p-3 bg-light border-bottom mb-0">
                                                {GROUP_OPTIONS.find(opt => opt.value === groupBy)?.label} : <CBadge color="dark">{groupKey}</CBadge> ({groupedTasks[groupKey].length})
                                            </h5>
                                        )}
                                        {renderTaskTable(groupedTasks[groupKey])}
                                    </div>
                                ))
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* --- CREATE MODAL --- */}
            <CModal visible={createModal} onClose={() => setCreateModal(false)}>
                <CModalHeader>
                    <CModalTitle>Créer une Nouvelle Tâche</CModalTitle>
                </CModalHeader>
                <CForm onSubmit={handleCreateTask}>
                    <CModalBody>
                        <div className="mb-3">
                            <CFormLabel>Projet *</CFormLabel>
                            <Select
                                options={projects}
                                isClearable={false}
                                placeholder="Sélectionner le projet"
                                value={newTaskForm.project}
                                onChange={(selectedOption) => setNewTaskForm({ ...newTaskForm, project: selectedOption })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Titre *</CFormLabel>
                            <input
                                type="text"
                                className="form-control"
                                value={newTaskForm.title}
                                onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Description</CFormLabel>
                            <CFormTextarea
                                value={newTaskForm.description}
                                onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <CRow className="g-3">
                            <CCol md={6} className="mb-3">
                                <CFormLabel>Assigné à</CFormLabel>
                                <Select
                                    options={users}
                                    isClearable
                                    placeholder="Sélectionner un utilisateur"
                                    value={newTaskForm.assignedTo}
                                    onChange={(selectedOption) => setNewTaskForm({ ...newTaskForm, assignedTo: selectedOption })}
                                />
                            </CCol>
                            <CCol md={6} className="mb-3">
                                <CFormLabel>Priorité</CFormLabel>
                                <CFormSelect
                                    value={newTaskForm.priority}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                                >
                                    {PRIORITY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </CFormSelect>
                            </CCol>
                            <CCol md={12} className="mb-3">
                                <CFormLabel>Échéance</CFormLabel>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={newTaskForm.deadline}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
                                />
                            </CCol>
                        </CRow>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setCreateModal(false)}>Annuler</CButton>
                        <CButton
                            color="primary"
                            type="submit"
                            disabled={actionLoading || !newTaskForm.title.trim() || !newTaskForm.project}
                        >
                            {actionLoading ? "Création..." : "Sauvegarder"}
                        </CButton>
                    </CModalFooter>
                </CForm>
            </CModal>

            {/* --- EDIT MODAL --- */}
            <CModal visible={editModal} onClose={() => setEditModal(false)}>
                <CModalHeader>
                    <CModalTitle>Modifier la Tâche: {selectedTask?.title}</CModalTitle>
                </CModalHeader>
                {editTaskForm && (
                    <CForm onSubmit={handleEditTask}>
                        <CModalBody>
                            <div className="mb-3">
                                <CFormLabel>Projet Associé</CFormLabel>
                                <input
                                    type="text"
                                    className="form-control bg-light"
                                    value={selectedTask?.project?.name || "N/A"}
                                    disabled
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Titre *</CFormLabel>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editTaskForm.title}
                                    onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Description</CFormLabel>
                                <CFormTextarea
                                    value={editTaskForm.description}
                                    onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <CRow className="g-3">
                                <CCol md={6} className="mb-3">
                                    <CFormLabel>Statut</CFormLabel>
                                    <CFormSelect
                                        value={editTaskForm.status}
                                        onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6} className="mb-3">
                                    <CFormLabel>Priorité</CFormLabel>
                                    <CFormSelect
                                        value={editTaskForm.priority}
                                        onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}
                                    >
                                        {PRIORITY_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                            <div className="mb-3">
                                <CFormLabel>Assigné à</CFormLabel>
                                <Select
                                    options={users}
                                    isClearable
                                    placeholder="Sélectionner un utilisateur"
                                    value={editTaskForm.assignedTo}
                                    onChange={(selectedOption) => setEditTaskForm({ ...editTaskForm, assignedTo: selectedOption })}
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Échéance</CFormLabel>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={editTaskForm.deadline}
                                    onChange={(e) => setEditTaskForm({ ...editTaskForm, deadline: e.target.value })}
                                />
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={() => setEditModal(false)}>Annuler</CButton>
                            <CButton
                                color="warning"
                                type="submit"
                                disabled={actionLoading || !editTaskForm.title.trim()}
                            >
                                {actionLoading ? "Mise à jour..." : "Mettre à Jour"}
                            </CButton>
                        </CModalFooter>
                    </CForm>
                )}
            </CModal>

            {/* --- DELETE MODAL --- */}
            <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
                <CModalHeader>
                    <CModalTitle>Confirmer la Suppression</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    Êtes-vous sûr de vouloir supprimer la tâche **{selectedTask?.title}** ? Cette action est irréversible.
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeleteModal(false)}>Annuler</CButton>
                    <CButton color="danger" onClick={handleDeleteTask} disabled={actionLoading}>
                        {actionLoading ? "Suppression..." : "Supprimer"}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CContainer>
    );
}