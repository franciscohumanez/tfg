import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import { Button, Modal, Form } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import Lottie from 'react-lottie-player';
import emptyState from '../../animation/emptyState.json';
import Swal from 'sweetalert2'
import axios from 'axios';


export const TasksEmployee = () => {

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [currentTaskId, setCurrentTaskId] = useState(localStorage.getItem('currentTaskId'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        const obtenerTareas = async () => {
        try {
            let data;
            
            const response = await axios.get('http://localhost:3000/api/userTasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al obtener proyectos');
            }
            data = response.data;

            setTasks(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener proyectos 2:', error);
            // Mostramos el popup informativo
            Swal.fire({
                showConfirmButton: true,
                icon: 'error',
                text: 'Error en el servidor.'
            }).then(()=>{
                // localStorage.removeItem('token');
                // window.location.reload(false)
            })
        }
        };

        obtenerTareas();
    }, [location.state]);

    const goBack = () => {
        navigate('/');
    };

    const handleStartTask = (taskId) => {
        setCurrentTaskId(taskId);
        setShowModal(true);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
            <div>
                <div className="w-100 d-flex align-items-center mb-3">
                    <Button variant="link" onClick={goBack} className="p-0 me-2 d-flex align-items-center">
                        <ArrowLeftShort size={32} style={{color: '#F8B944'}} />
                    </Button>
                    <h2 className='pages-titles'>Mis tareas</h2>
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
                    tasks.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                            <Lottie
                                loop
                                animationData={emptyState}
                                play
                                style={{ width: 300, height: 300 }}
                            />
                            <p>No hay tareas</p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <Card
                                style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer', border: 'none', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                                key={task.id}
                            >
                                <Card.Body style={{ padding: '10px' }}>
                                    <Card.Title><span className='pages-titles'>{task.name}</span></Card.Title>
                                    <hr style={{ margin: '10px 0', borderTop: '2px solid #AEAEAE' }} />
                                    <Card.Subtitle className="mb-2 mt-2 text-muted">
                                        <p className='pages-titles'>Proyecto: <span style={{fontWeight: 'normal', color: '#ECB136'}}>{task.project_id}</span></p>
                                        <p className='pages-titles'>Fecha límite: <span style={{fontWeight: 'normal'}}>{task.date_deadline}</span></p>
                                        <p className='pages-titles'>Estado: <span style={{fontWeight: 'normal'}}>{task.stage_id}</span></p>
                                    </Card.Subtitle>
                                    <Button onClick={() => handleStartTask(task.id)} className='task-button'>
                                        Comenzar
                                    </Button>
                                </Card.Body>
                            </Card>
                        ))
                    )
                    
                )}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title><span className='pages-titles'>¿Quieres comenzar la tarea?</span></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="formDescription">
                            <Form.Label><p className='pages-titles'>Describe lo que vas a hacer</p></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            className='auth-button'
                            onClick={() => setShowModal(false)}
                            style={{width: '50%', borderColor: '#ECB136'}}>
                            Cancelar
                        </Button>
                        <Button 
                            className='task-button'
                            style={{width: '50%'}}>
                            Comenzar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default TasksEmployee;