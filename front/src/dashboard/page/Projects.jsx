import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import Swal from 'sweetalert2'
import Modal from 'react-bootstrap/Modal';

export const Projects = () => {

    const [proyectos, setProyectos] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const obtenerProyectos = async () => {
        
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get('http://localhost:3000/api/proyectos', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
                });
                // console.log("token: ", token)
                // console.log("Respuesta: ",response)
                if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al obtener proyectos 1');
                }
                const data = response.data.slice(1);
                
                setProyectos(data);
            } catch (error) {
                console.error('Error al obtener proyectos 2:', error);
                // Mostramos el popup informativo
                Swal.fire({
                  showConfirmButton: true,
                  icon: 'error',
                  text: 'Error en el servidor.'
              }).then(()=>{
                  // localStorage.removeItem('token');
                  window.location.reload(false)
              })
            }
        };

        obtenerProyectos();
    }, []);

    const handleCardClick = (project) => {
      setSelectedProject(project);
      setShowModal(true);
    };

    const closeModal = () => {
      setSelectedProject(null);
      setShowModal(false);
    };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
      <div>
        <h1>Proyectos</h1>
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

        {/* <Card style={{ width: '18rem' }}>
          <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
              <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>
          </Card.Body>
        </Card> */}
      </div>
    </div>
  )
}

export default Projects;
