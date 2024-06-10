import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Placeholder, Modal, Form, Alert } from 'react-bootstrap';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import Lottie from 'react-lottie-player';
import emptyState from '../../animation/emptyState.json';

export const TaskProject = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [currentTaskId, setCurrentTaskId] = useState(localStorage.getItem('currentTaskId'));
    const [currentEntryId, setCurrentEntryId] = useState(localStorage.getItem('currentEntryId'));
    const [elapsedTime, setElapsedTime] = useState(null);

    useEffect(() => {
        const obtenerTareas = async () => {
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(`http://localhost:3000/api/taskProject/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status < 200 || response.status >= 300) {
                    throw new Error('Error al obtener tareas');
                }

                const data = response.data;
                setTasks(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error al obtener tareas:', error);
                Swal.fire({
                    showConfirmButton: true,
                    icon: 'error',
                    text: 'Error en el servidor.'
                }).then(() => {
                    // localStorage.removeItem('token');
                    // window.location.reload(false);
                });
            }
        };

        obtenerTareas();
    }, [projectId]);

    const goBack = () => {
        navigate(-1);
    };

    const handleStartTask = (taskId) => {
        setCurrentTaskId(taskId);
        setShowModal(true);
    };

    const handleStopTask = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:3000/api/stopTask', {
                entry_id: currentEntryId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al detener tarea');
            }

            const { elapsedTime } = response.data;
            console.log(elapsedTime);

            Swal.fire({
                showConfirmButton: true,
                icon: 'info',
                text: `La tarea ha durado: ${elapsedTime}`
            });

            setCurrentTaskId(null);
            setCurrentEntryId(null);
            localStorage.removeItem('currentTaskId');
            localStorage.removeItem('currentEntryId');
        } catch (error) {
            console.error('Error al detener tarea:', error);
            Swal.fire({
                showConfirmButton: true,
                icon: 'error',
                text: 'Error en el servidor.'
            });
        }
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:3000/api/startTask', {
                task_id: currentTaskId,
                user_id: localStorage.getItem('userId'), // Asegúrate de guardar userId en localStorage al iniciar sesión
                description
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al iniciar tarea');
            }

            setCurrentEntryId(response.data.id);
            localStorage.setItem('currentTaskId', currentTaskId);
            localStorage.setItem('currentEntryId', response.data.id);
            setShowModal(false);
        } catch (error) {
            console.error('Error al iniciar tarea:', error);
            Swal.fire({
                showConfirmButton: true,
                icon: 'error',
                text: 'Error en el servidor.'
            });
        }
    };

    const getColorClass = (stage_id) => {
        switch (stage_id) {
            case 'Pendiente':
                return 'bg-warning';
            case 'En Proceso':
                return 'bg-info';
            case 'Completada':
                return 'bg-success';
            default:
                return '';
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
            <div>
                <div className="w-100 d-flex align-items-center mb3">
                    <Button variant="link" onClick={goBack} className="p0 me2 d-flex align-items-center">
                        <ArrowLeftShort size={32} style={{color: '#F8B944'}} />
                    </Button>
                    <h2 className="m0 text-center">Tareas</h2>
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
                                style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer' }}
                                className={getColorClass(task.stage_id)}
                                key={task.id}
                            >
                                <Card.Body>
                                    <Card.Title className={getColorClass(task.stage_id)}>
                                        {task.name}
                                    </Card.Title>
                                    <Card.Text>
                                        {task.date_deadline}
                                    </Card.Text>
                                    {currentTaskId === task.id ? (
                                        <Button variant="danger" onClick={handleStopTask}>
                                            Detener Tarea
                                        </Button>
                                    ) : (
                                        <Button style={{backgroundColor: '#F8B944', borderColor: '#F8B944'}} onClick={() => handleStartTask(task.id)}>
                                            Comenzar Tarea
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        ))
                    )
                )}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Comenzar Tarea</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Descripción"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Comenzar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default TaskProject;
