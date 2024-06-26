import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import Swal from 'sweetalert2'
import Lottie from 'react-lottie-player';
import emptyState from '../../animation/emptyState.json';
import lupa from '../img/lupa.svg';

export const Projects = () => {

    const [proyectos, setProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeItem, setActiveItem] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const obtenerProyectos = async () => {
            try {
                let data;
                if (location.state && location.state.projects) {
                    data = location.state.projects;
                } else {
                    const response = await axios.get('http://localhost:3000/api/proyectos', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                    });
                    
                    if (response.status < 200 || response.status >= 300) {
                    throw new Error('Error al obtener proyectos 1');
                    }
                data = response.data;
                
                }
                setProyectos(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error al obtener proyectos 2:', error);
                // Mostramos el popup informativo
                Swal.fire({
                    showConfirmButton: true,
                    icon: 'error',
                    text: 'Error en el servidor.'
              }).then(()=>{
                    localStorage.removeItem('token');
                    window.location.reload(false)
              })
            }
        };

        obtenerProyectos();
    }, [location.state]);

    const handleCardClick = (projectId) => {
        navigate(`/tasks/${projectId}`);
    };

    const goBack = () => {
        navigate('/');
    };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
        <div style={{ maxWidth: '1200px', width: '90%', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <div className="w-100 d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                    <Button variant="link" onClick={goBack} className="p-0 me-2 d-flex align-items-center">
                        <ArrowLeftShort size={32} style={{color: '#ECB136'}} />
                    </Button>
                    <h2 className="pages-titles">Proyectos</h2>
                </div>
                <img src={lupa} alt="Lupa" style={{ width: '30px', height: '30px' }} />
            </div>
            {isLoading ? (
                <Card style={{ width: '18rem', marginBottom: '20px' }}>
                    <Card.Body>
                        <Placeholder as={Card.Title} animation="glow">
                            <Placeholder xs={6} />
                        </Placeholder>
                        <Placeholder as={Card.Text} animation="glow">
                            <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                            <Placeholder xs={6} /> <Placeholder xs={8} />
                        </Placeholder>
                    </Card.Body>
                </Card>
            ) : (
                proyectos.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Lottie
                                loop
                                animationData={emptyState}
                                play
                                style={{ width: 300, height: 300 }}
                            />
                        <p>No tienes proyectos disponibles</p>
                    </div>
                ) :  (
                        <Accordion
                            defaultActiveKey="0"
                            style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer' }}
                            
                        >
                            {proyectos.map(proyecto => (
                                <Accordion.Item 
                                    key={proyecto.id} 
                                    eventKey={proyecto.id}
                                    style={{ marginBottom: '10px', border: 'none', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                                    >
                                    
                                    <Accordion.Header
                                        style={{
                                            borderBottom: 'none',
                                            background: 'none',
                                        }}    
                                    >
                                        <span className='pages-titles'>{proyecto.name}</span>
                                    </Accordion.Header>
                                    
                                    <Accordion.Body style={{ padding: '10px' }}>
                                        <p className='pages-titles'>Tareas asignadas: <span style={{fontWeight: 'normal', color: '#ECB136'}}>{proyecto.task_count}</span></p>
                                        <p className='pages-titles'>Fecha de inicio: <span style={{fontWeight: 'normal'}}>{proyecto.date_start}</span></p>
                                        <p className='pages-titles'>Fecha de finalización: <span style={{fontWeight: 'normal'}}>{proyecto.date}</span></p>
                                        <p className='pages-titles'>Descripción: <span style={{fontWeight: 'normal'}}>{proyecto.description}</span></p>
                                    
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                )
            )}
        </div>
    </div>
  )
}

export default Projects;