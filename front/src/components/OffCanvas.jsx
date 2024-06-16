import React, { useState } from 'react'
import { IoMenu, IoExit } from "react-icons/io5";
import { Employee } from '../dashboard/page/Employee';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';
import axios from 'axios';
import Swal from 'sweetalert2'
import club from '../dashboard/img/Icon-Club-1.svg'
import cog from '../dashboard/img/cog.svg'
import edit from '../dashboard/img/Edit.svg'

export const OffCanvas = ({ userName }) => {

    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const logOut = () => {
        // Mostramos el popup informativo
        Swal.fire({
            title: "¿Seguro que deseas salir?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Exit"
          }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                window.location.reload(false)
            }
          });
    };

    const handleDashboard = () => {
        navigate('/');
        handleClose();
    }

    const handleProjectsClick = () => {
        navigate('/projects');
        handleClose();
    }

    const handleMyProjectsClick = async () => {
        navigate('/projectsEmployee');
        handleClose();
    };

    const handleTasksClick = () => {
        navigate('/tasks');
        handleClose();
    }

    const handleMyTasksClick = async () => {
        navigate('/tasksEmployee');
        handleClose();
    };

    const handleEmployeeClick = () => {
        navigate('/employee');
        handleClose();
    }

    return (
        <>
            <IoMenu onClick={handleShow} />
            
            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{userName}</Offcanvas.Title>   
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column">

                    <ListGroup variant="flush">
                        <ListGroup.Item style={{color: '#AEAEAE'}} className="d-flex align-items-center" onClick={handleDashboard}>
                            <img src={club} alt="Lupa" style={{ marginRight: '5px' }} />
                            Dashboard
                        </ListGroup.Item>
                        <ListGroup.Item style={{color: '#AEAEAE'}} className="d-flex align-items-center" onClick={handleProjectsClick}>
                            <img src={cog} alt="Lupa" style={{ marginRight: '5px' }} />
                            Proyectos
                        </ListGroup.Item>
                        <ListGroup.Item style={{color: '#AEAEAE'}} className="d-flex align-items-center" onClick={handleMyProjectsClick}>
                            <img src={cog} alt="Lupa" style={{ marginRight: '5px' }} />
                            Mis proyectos
                        </ListGroup.Item>
                        <ListGroup.Item style={{color: '#AEAEAE'}} className="d-flex align-items-center" onClick={handleTasksClick}>
                            <img src={edit} alt="Lupa" style={{ marginRight: '5px' }} />
                            Tareas
                        </ListGroup.Item>
                        <ListGroup.Item style={{color: '#AEAEAE'}} onClick={handleMyTasksClick}>
                            <img src={edit} alt="Lupa" style={{ marginRight: '5px' }} />
                            Mis tareas
                        </ListGroup.Item>
                        <ListGroup.Item style={{color: '#AEAEAE'}} onClick={handleEmployeeClick}>Mi perfil</ListGroup.Item>
                        
                    </ListGroup>
                    <ListGroup.Item style={{color: '#AEAEAE'}} className="d-flex align-items-center mt-auto" onClick={logOut}>
                            <IoExit style={{ color: '#ECB136', marginRight: '5px' }}  />
                            Cerrar sesión
                        </ListGroup.Item>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}
