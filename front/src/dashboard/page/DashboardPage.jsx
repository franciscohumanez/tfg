import React, { useEffect, useState } from 'react';
import { Toolbar } from './Toolbar';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Projects from './Projects';
import Swal from 'sweetalert2'
import Accordion from 'react-bootstrap/Accordion';
import ProjectEmployee from './ProjectsEmployee';
import { jwtDecode } from 'jwt-decode';
import Employee from './Employee';

export const DashboardPage = () => {

  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      
      try {
        const decodedToken = jwtDecode(token);
        setUserName(decodedToken.email); // O cualquier otro campo que quieras mostrar en Toolbar
        setEmployeeId(decodedToken.employeeId); // Establece el employeeId desde el token decodificado
      } catch (error) {
        console.error('Error al decodificar el token JWT:', error);
        navigate('/login', { replace: true });
      }
      
      axios.interceptors.response.use(response => response, error => {
        console.log( error.response)
        if (error.response && error.response.status === 401) {
            // Eliminar el token del almacenamiento local
          //   localStorage.removeItem('token');
            
          //   // Mostramos el popup informativo
          //   Swal.fire({
          //     showConfirmButton: true,
          //     icon: 'error',
          //     text: 'Usuario expirado'
          // }).then(()=>{
          //     window.location.reload(false)
          // })
        }
        return Promise.reject(error);
      });

      

    }
}, [navigate]);

  return (
    <div className='container' style={{ width: '100%', display: 'flex', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: '100%' }}>
        <Toolbar userName={userName} />

        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Proyectos</Accordion.Header>
            <Accordion.Body>
              <Projects />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Mis proyectos</Accordion.Header>
            <Accordion.Body>
              {/* {employeeId && <ProjectEmployee employeeId={employeeId} />} */}
              {/* <Employee /> */}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

      </div>
    </div>
  );
};

export default DashboardPage;
