import React, { useState, useEffect } from 'react';
import {
    CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, 
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, 
    CTableDataCell, CButton, CBadge, CSpinner
} from '@coreui/react';
import axios from 'axios';

const getToken = () => localStorage.getItem("token");

const API_BASE_URL = process.env.REACT_APP_API_URL ; 

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null); 

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        const token = getToken();

        if (!token) {
            setError("Authentification requise. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/users`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des utilisateurs:", err);
            const errMsg = err.response?.status === 403 ? "Accès refusé. Vous n'êtes pas administrateur." : "Échec du chargement des utilisateurs.";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleActive = async (userId, shouldBeActive) => {
        setActionLoading(userId); 
        const token = getToken();
        
        const endpoint = shouldBeActive ? `/activate/${userId}` : `/block/${userId}`;
        const actionName = shouldBeActive ? 'activation' : 'blocage';

        try {
            await axios.put(`${API_BASE_URL}/users${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user._id === userId ? { ...user, isActive: shouldBeActive } : user
                )
            );
            
        } catch (err) {
            console.error(`Erreur lors de l'action ${actionName}:`, err);
            alert(`Échec de l'action : ${err.response?.data?.message || 'Erreur inconnue'}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
            return;
        }

        setActionLoading(userId);
        const token = getToken();

        try {
            const endpoint = `/delete/${userId}`;
            
            await axios.delete(`${API_BASE_URL}/users${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        } catch (err) {
            console.error("Erreur lors de la suppression de l'utilisateur:", err);
            alert(`Échec de la suppression : ${err.response?.data?.message || 'Erreur inconnue'}`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (isActive) => {
        const color = isActive ? 'success' : 'danger';
        const text = isActive ? 'Actif' : 'Bloqué';
        return <CBadge color={color} shape="rounded-pill">{text}</CBadge>;
    };

    if (loading) {
        return <CContainer className="mt-5 text-center"><CSpinner color="primary" /> Chargement du Panneau d'Administration...</CContainer>;
    }

    return (
        <CContainer className="mt-4">
            <CRow>
                <CCol>
                    <CCard className="shadow-sm">
                        <CCardHeader>
                            <h2 className="mb-0"><i className="fas fa-users-cog me-2"></i> Gestion des Utilisateurs</h2>
                            <p className="text-muted mb-0">Liste complète des utilisateurs du système.</p>
                        </CCardHeader>
                        <CCardBody>
                            {error && (
                                <div className="alert alert-danger" role="alert">{error}</div>
                            )}

                            <CTable hover responsive striped align="middle" className="mb-0">
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Nom</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Téléphone</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Statut</CTableHeaderCell>
                                        <CTableHeaderCell scope="col" className="text-center">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {users.length === 0 ? (
                                        <CTableRow>
                                            <CTableDataCell colSpan={5} className="text-center text-muted">
                                                Aucun utilisateur trouvé.
                                            </CTableDataCell>
                                        </CTableRow>
                                    ) : (
                                        users.map(user => (
                                            <CTableRow key={user._id}>
                                                <CTableDataCell>
                                                    <strong className="d-block">{user.name}</strong>
                                                    <small className="text-muted">{user.role || 'Utilisateur'}</small>
                                                </CTableDataCell>
                                                <CTableDataCell>{user.email}</CTableDataCell>
                                                <CTableDataCell>{user.phone || 'N/A'}</CTableDataCell>
                                                <CTableDataCell>
                                                    {getStatusBadge(user.isActive)}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {user.isActive ? (
                                                            <CButton 
                                                                color="warning" 
                                                                size="sm" 
                                                                onClick={() => handleToggleActive(user._id, false)}
                                                                disabled={actionLoading === user._id}
                                                                title="Bloquer l'utilisateur"
                                                            >
                                                                {actionLoading === user._id ? <CSpinner size="sm" /> : <i className="fas fa-ban"></i>} Bloquer
                                                            </CButton>
                                                        ) : (
                                                            <CButton 
                                                                color="success" 
                                                                size="sm" 
                                                                onClick={() => handleToggleActive(user._id, true)}
                                                                disabled={actionLoading === user._id}
                                                                title="Activer le compte"
                                                            >
                                                                {actionLoading === user._id ? <CSpinner size="sm" /> : <i className="fas fa-check-circle"></i>} Activer
                                                            </CButton>
                                                        )}
                                                        <CButton 
                                                            color="danger" 
                                                            size="sm" 
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            disabled={actionLoading === user._id}
                                                            title="Supprimer l'utilisateur"
                                                        >
                                                            {actionLoading === user._id ? <CSpinner size="sm" /> : <i className="fas fa-trash"></i>} Supprimer
                                                        </CButton>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    )}
                                </CTableBody>
                            </CTable>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
}