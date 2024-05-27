import React, { useState } from 'react'
import { IoMenu, IoExit } from "react-icons/io5";
import { Employee } from '../dashboard/page/Employee';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';

export const OffCanvas = ({ name }) => {

    const token = localStorage.getItem('token');

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const logOut = () => {
        localStorage.removeItem('token');
        window.location.reload(false)
      };

    return (
        <>
            <Button variant="primary" onClick={handleShow} className="me-2">
                <IoMenu />
            </Button>
            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                        <div className='d-flex align-items-center'>
                            <Image src="holder.js/171x180" className="mr-4" roundedCircle />
                            
                        </div>
                    </Offcanvas.Title>   
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column">

                    <ListGroup variant="flush">
                        <ListGroup.Item>Proyectos</ListGroup.Item>
                        <ListGroup.Item>Tareas</ListGroup.Item>
                        <ListGroup.Item>Morbi leo risus</ListGroup.Item>
                        <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
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
