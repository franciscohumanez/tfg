import React, { useState, useEffect } from 'react';
import { addEmployee, getEmployees,  } from '../../indexedDB';
import axios from 'axios';
import Toolbar from './Toolbar';
import { OffCanvas } from '../../components/OffCanvas';

export const Employee = () => {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const fetchEmployeeName = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await axios.get('http://localhost:3000/api/getEmployee', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          const data = response.data;
          setUserName(data.name); // Ajusta esto según la estructura de tu respuesta
          setUserPhoto(data.avatar_1024)
        } else {
          console.error('Error al obtener la información del empleado:', response.data.error);
        }
      } catch (error) {
        console.error('Error al obtener la información del empleado:', error);
      }
    };

    fetchEmployeeName();
  }, []);

  return (
    <div>
      {/* <Toolbar userName={userName} />
      <OffCanvas userPhoto={userPhoto} /> */}
      {/* Otros componentes de tu aplicación */}
    </div>
  );
};

export default Employee;
