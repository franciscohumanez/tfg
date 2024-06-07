import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import Lottie from 'react-lottie-player';
import emptyState from '../../animation/emptyState.json';
import Swal from 'sweetalert2'
import axios from 'axios';


export const ProjectEmployee = () => {

    const [proyectos, setProyectos] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const obtenerProyectos = async () => {
        try {
            let data;
            
            const response = await axios.get('http://localhost:3000/api/userProjects', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al obtener proyectos');
            }
            data = response.data;
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
            <div>
                <div className="w-100 d-flex align-items-center mb-3">
                    <Button variant="link" onClick={goBack} className="p-0 me-2 d-flex align-items-center">
                        <ArrowLeftShort size={32} />
                    </Button>
                    <h2 className="m-0 text-center">Mis proyectos</h2>
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                            <Lottie
                                loop
                                animationData={emptyState}
                                play
                                style={{ width: 300, height: 300 }}
                            />
                            <p>No tienes proyectos disponibles</p>
                        </div>
                    ) : (
                        proyectos.map(proyecto => (
                            <Card
                                style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer' }}
                                key={proyecto.id}
                                onClick={() => handleCardClick(proyecto.id)}
                            >
                                <Card.Body style={{ padding: '10px' }}>
                                    <Card.Title>{proyecto.name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        <p>Descripción: {proyecto.description}</p>
                                        <p>Fecha de inicio: {proyecto.date_start}</p>
                                        <p>Fecha de finalización: {proyecto.date}</p>
                                        <p>Tareas: {proyecto.task_count}</p>
                                    </Card.Subtitle>
                                </Card.Body>
                            </Card>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default ProjectEmployee;