import React, { useEffect, useState } from 'react';
import axios from "axios";
import Projects from './Projects';
import { Toolbar } from './Toolbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'

export const DashboardPage = () => {

  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        axios.interceptors.response.use(response => response, error => {
            if (error.response && error.response.status === 401) {
                // Eliminar el token del almacenamiento local
                localStorage.removeItem('token');
                // Redirigir al usuario a la página de inicio de sesión
                navigate('/login', { replace: true });

                // Mostramos el popup informativo
                Swal.fire({
                  showConfirmButton: true,
                  icon: 'error',
                  text: 'Usuario expirado'
              }).then(()=>{
                  window.location.reload(false)
              })
            }
            return Promise.reject(error);
        });

      

    }
}, [navigate]);

  return (
    <div className='container' style={{ width: '100%', display: 'flex', justifyContent: 'center', height: '100vh' }}>
        <div style={{ width: '100%' }}>
          <Toolbar userName={userName} />
          <Projects />
        </div>
    </div> 
  );
};

export default DashboardPage;
