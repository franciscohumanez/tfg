import React, { useEffect, useState } from 'react';
import { Toolbar } from './Toolbar';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2'
import jwtDecode from 'jwt-decode';
import '../../styles.css'

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
        if (error.response && error.response.status === 401) {
            // Eliminar el token del almacenamiento local
            localStorage.removeItem('token');
            
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
    <div style={{ width: '100%', height: 'auto' }}>
      <div style={{ width: '100%' }}>
        <Toolbar userName={userName} />
        <br/>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPage;
