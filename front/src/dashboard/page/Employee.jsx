import React, { useState, useEffect } from 'react';
import { addEmployee, getEmployees,  } from '../../indexedDB';
import axios from 'axios';

export const Employee = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/employee', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setEmployee(response.data);
        console.log("Data: ",response.data)
        response.data.forEach(async (employee) => {
          await addEmployee(employee);
        });

        setLoading(false);
      } catch (error) {
        const localEmployees = await getEmployees();
        setEmployee(localEmployees);
        setLoading(false);
        console.log(error)
      }
    };

    fetchEmployee();
  }, []);

  if (loading) {
    return <div>Cargando empleados...</div>;
  }

  if (!employee || employee.length === 0) {
    return <div>No se encontró información de empleados</div>;
  }

  return (
    <span>{employee[0].name}</span>
  );
};

export default Employee;
