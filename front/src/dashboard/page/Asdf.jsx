import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Lottie from 'react-lottie-player';
import emptyState from '../../animation/emptyState.json';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import '../../styles.css'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(ArcElement, Tooltip, Legend);

export const Asdf = () => {

  const [tasks, setTasks] = useState([]);
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const obtenerTareas = async () => {
    try {
        let data;
        
        const response = await axios.get('http://localhost:3000/api/userTasks', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Error('Error al obtener proyectos');
        }
        data = response.data;

        setTasks(data);
    } catch (error) {
        console.error('Error al obtener proyectos 2:', error);
        // Mostramos el popup informativo
        Swal.fire({
            showConfirmButton: true,
            icon: 'error',
            text: 'Error en el servidor.'
        }).then(()=>{
            // localStorage.removeItem('token');
            // window.location.reload(false)
        })
    }
    };

    obtenerTareas();
}, [location.state]);

  // Obtener solo las primeras 5 tareas
  const newTasks = tasks.slice(0, 5);

  const data = {
    labels: ['Completadas', 'Pendientes'],
    datasets: [
      {
        data: [300, 50],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const options = {
    cutout: '70%',  // Ajusta el porcentaje de corte para hacer las barras más finas
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          // Cambia el estilo de la leyenda para usar puntos
          pointStyle: 'circle',
        },
      },
    },
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div>
        <div>
            <div className="pages-tiles">
                
                <h2 className="pages-titles">Dashboard</h2>
            </div>
            <div style={{ paddingTop: '40px', display: 'block', justifyContent: 'center'}}>
              <h3 className='pages-titles' style={{paddingLeft: '10px'}}>Tareas</h3>
              <Doughnut data={data} options={options} />
            </div>
            <div style={{ marginTop: '50px'}}>
              <h3 className='pages-titles'>Nuevas Tareas Asignadas</h3>
              {tasks.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                            <Lottie
                                loop
                                animationData={emptyState}
                                play
                                style={{ width: 300, height: 300 }}
                            />
                            <p>No hay tareas</p>
                        </div>
                    ) : (
                        newTasks.map(task => (
                            <Card
                                style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer', border: 'none', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                                key={task.id}
                            >
                                <Card.Body className='pages-titles' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {task.name} <FontAwesomeIcon icon={faAngleRight} size="xl" style={{color: '#ECB136', marginLeft: '10px'}} />
                                </Card.Body>
                            </Card>
                        ))
                    )}
            </div>
        </div>
      </div>
    </div>
  )
}
