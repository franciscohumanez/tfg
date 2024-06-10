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
                        <ListGroup.Item onClick={handleProjectsClick}>Proyectos</ListGroup.Item>
                        <ListGroup.Item onClick={handleMyProjectsClick}>Mis proyectos</ListGroup.Item>
                        <ListGroup.Item onClick={handleTasksClick}>Tareas</ListGroup.Item>
                        <ListGroup.Item onClick={handleMyTasksClick}>Mis tareas</ListGroup.Item>
                        <ListGroup.Item onClick={handleEmployeeClick}>Yo</ListGroup.Item>
                    </ListGroup>
                    <br/>
                    <Button variant="danger" onClick={logOut}>
                        <IoExit /> Cerrar sesión
                    </Button>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}
