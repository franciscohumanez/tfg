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
//import sqlite3 from 'sqlite3';
//const db = new sqlite3.Database('../../../back/odoo.db');


export const TasksEmployee = () => {

    const [tasks, setTasks] = useState([]);
    const [timesheet, setTimesheet] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [currentTaskId, setCurrentTaskId] = useState(localStorage.getItem('currentTaskId'));
    const [currentEntryId, setCurrentEntryId] = useState(localStorage.getItem('currentEntryId'));
    const [timeEntries, setTimeEntries] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
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

        const fetchTimeEntries = async () => {
            const token = localStorage.getItem('token');
      
            try {
              const response = await axios.get('http://localhost:3000/api/timesheets', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
      
              if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al obtener las entradas de tiempo');
              }

              setTimeEntries(response.data);
            } catch (error) {
              console.error('Error al obtener las entradas de tiempo:', error);
              Swal.fire({
                showConfirmButton: true,
                icon: 'error',
                text: 'Error en el servidor.'
              });
            }
          };

        obtenerTareas();
        fetchTimeEntries();
        
    }, [location.state]);

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        const taskName = name;

        try {
            const response = await axios.post('http://localhost:3000/api/startTask', {
                task_id: currentTaskId,
                task_name: taskName,
                user_name: userName, // Asegúrate de guardar userId en localStorage al iniciar sesión
                name
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

    

    const goBack = () => {
        navigate('/');
    };

    const handleStartTask = (taskId) => {
        setCurrentTaskId(taskId);
        setShowModal(true);
    };

    const renderButton = (task) => {
        const currentEntry = timeEntries.find(entry => entry.task_id === task.id && entry.date_time_end === null);
        if (currentEntry) {
            return (
                <Button className='task-button' style={{ backgroundColor: '#f44336', borderColor: '#f44336' }}>
                    Finalizar
                </Button>
            );
        } else {
            return (
                <Button onClick={() => handleStartTask(task.id)} className='task-button'>
                    Comenzar
                </Button>
            );
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
            <div>
                <div className="w-100 d-flex align-items-center mb-3">
                    <Button variant="link" onClick={goBack} className="p-0 me-2 d-flex align-items-center">
                        <ArrowLeftShort size={32} style={{color: '#F8B944'}} />
                    </Button>
                    <h2 className='m-0 text-center pages-titles'>Mis tareas</h2>
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
                                    {renderButton(task)}
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
                    <Modal.Footer style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                            style={{width: '45%', borderColor: '#ECB136'}}
                            className='auth-button'
                            onClick={() => setShowModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            className='task-button'
                            style={{width: '45%'}}
                            onClick={handleSubmit}
                        >
                            Comenzar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default TasksEmployee;