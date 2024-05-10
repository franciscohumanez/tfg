import React, { useEffect } from 'react';
import axios from "axios";
import Projects from './Projects';
import { Toolbar } from './Toolbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'

export const DashboardPage = () => {

  const navigate = useNavigate();

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
    <div className='container'>
        <Toolbar />
        <Projects />
    </div> 
  );
};

export default DashboardPage;
