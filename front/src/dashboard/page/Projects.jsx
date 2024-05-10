import axios from 'axios';
import React, { useEffect, useState } from 'react'

export const Projects = () => {

    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        const obtenerProyectos = async () => {
        
            const token = localStorage.getItem('token');

            try {
                console.log("entra")
                const response = await axios.get('http://localhost:3000/api/proyectos', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
                });
                console.log("token: ", token)
                console.log("Respuesta: ",response)
                if (response.status < 200 || response.status >= 300) {
                throw new Error('Error al obtener proyectos 1');
                }
                const data = await response.json();
                console.log(data)
                setProyectos(data);
            } catch (error) {
                console.error('Error al obtener proyectos 2:', error);
            }
        };

        obtenerProyectos();
    }, []);

  return (
    <div>
      <h1>Proyectos</h1>
      <ul>
        {proyectos.map(proyecto => (
          <li key={proyecto.id}>
            <h2>{proyecto.name}</h2>
            <p>{proyecto.description}</p>
            <p>Fecha de inicio: {proyecto.start_date}</p>
            <p>Fecha de finalización: {proyecto.end_date}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Projects;
