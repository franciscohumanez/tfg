import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Placeholder } from 'react-bootstrap';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import Accordion from 'react-bootstrap/Accordion';
import Swal from 'sweetalert2';
import Lottie from 'react-lottie-player';
import emptyState from '../../animation/emptyState.json';
import lupa from '../img/lupa.svg';

export const Tasks = () => {

    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const obtenerTareas = async () => {
        
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(`http://localhost:3000/api/taskProject`, {
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
                // Mostramos el popup informativo
                Swal.fire({
                    showConfirmButton: true,
                    icon: 'error',
                    text: 'Error en el servidor.'
                }).then(() => {
                    localStorage.removeItem('token');
                    window.location.reload(false);
                });
            }
        };

        obtenerTareas();
    }, []);

    const goBack = () => {
        navigate('/');
    };

    const handleStartWork = async (taskId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(`http://localhost:3000/api/startTask/${taskId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al comenzar la tarea');
            }
            const updatedTask = response.data;
            setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
        } catch (error) {
            console.error('Error al comenzar la tarea:', error);
            Swal.fire({
                showConfirmButton: true,
                icon: 'error',
                text: 'Error al comenzar la tarea.'
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
            <div style={{ maxWidth: '1200px', width: '90%', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                <div className="w-100 d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                    <   Button variant="link" onClick={goBack} className="p-0 me-2 d-flex align-items-center">
                            <ArrowLeftShort size={32} style={{color: '#F8B944'}} />
                        </Button>
                        <h2 className="m-0 text-center pages-titles">Tareas</h2>
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
                            // tasks.map(task => (
                            //     <Card
                            //         style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer' }}
                            //         className={getColorClass(task.stage_id)}
                            //         key={task.id}
                            //     >
                            //         <Card.Body style={{ padding: '10px' }}>
                            //             <Card.Title>{task.name}</Card.Title>
                            //             <Card.Subtitle className="mb-2 text-muted">
                            //                 <p>Proyecto: {task.project_id}</p>
                            //                 <p>Asignado a: {task.user_ids}</p>
                            //                 <p>Fecha límite: {task.date_deadline}</p>
                            //                 <p>Estado: {task.stage_id}</p>
                            //             </Card.Subtitle>
                            //             {/* <Button onClick={() => handleStartWork(task.id)} variant="primary">
                            //                 Comenzar Trabajo
                            //             </Button> */}
                            //         </Card.Body>
                            //     </Card>
                            //))

                            <Accordion
                            defaultActiveKey="0"
                            style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer' }}
                            
                        >
                            {tasks.map(task => (
                                <Accordion.Item key={task.id} eventKey={task.id} style={{ marginBottom: '10px', border: 'none', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                    <Accordion.Header>
                                        <span className='pages-titles'>{task.name}</span>
                                    </Accordion.Header>
                                    <Accordion.Body style={{ padding: '10px' }}>
                                        <p className='pages-titles'>Proyecto: <span style={{fontWeight: 'normal', color: '#ECB136'}}>{task.project_id}</span></p>
                                        <p className='pages-titles'>Asignado a: <span style={{fontWeight: 'normal'}}>{task.user_ids}</span></p>
                                        <p className='pages-titles'>Fecha de finalización: <span style={{fontWeight: 'normal'}}>{task.date_deadline}</span></p>
                                        <p className='pages-titles'>Estado: <span style={{fontWeight: 'normal'}}></span></p>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                        )
                    )}
            </div>
        </div>
    );
};

export default Tasks;
