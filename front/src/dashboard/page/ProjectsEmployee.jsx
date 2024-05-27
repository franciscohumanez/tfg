import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import Swal from 'sweetalert2'
import Modal from 'react-bootstrap/Modal';

export const ProjectEmployee = ({ employeeId }) => {

    const [proyectos, setProyectos] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const obtenerProyectosEmpleado = async () => {
            
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/api/employee/${employeeId}/projects`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.status < 200 || response.status >= 300) {
                    throw new Error('Error al obtener proyectos del empleado');
                }
                
                setProyectos(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    Swal.fire({
                      showConfirmButton: true,
                      icon: 'error',
                      text: 'Usuario expirado'
                    }).then(() => {
                      window.location.reload();
                    });
                  } else {
                    console.error('Error al obtener proyectos del empleado:', error);
                  }
            }
        };

        obtenerProyectosEmpleado();
    }, [employeeId]);

    const handleCardClick = (project) => {
        setSelectedProject(project);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedProject(null);
        setShowModal(false);
    };

    return (
        <div>
            <div>
                {proyectos.map(proyecto => (
                    <Card style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer' }}
                        key={proyecto.id}
                        onClick={() => handleCardClick(proyecto)}
                    >
                        <Card.Body>
                            <Card.Title>{proyecto.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{proyecto.description}</Card.Subtitle>
                        </Card.Body>
                    </Card>
                ))}

                <Modal show={showModal} onHide={closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedProject && selectedProject.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedProject && (
                            <div>
                                <p>Descripción: {selectedProject.description}</p>
                                <p>Fecha de inicio: {selectedProject.date_start}</p>
                                <p>Fecha de finalización: {selectedProject.date}</p>
                                {/* Agrega más información aquí según sea necesario */}
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default ProjectEmployee;