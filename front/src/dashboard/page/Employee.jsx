import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Card, Placeholder, Table, Modal } from 'react-bootstrap';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeName = async () => {
      const token = localStorage.getItem('token');

      try {
        let data;

        const response = await axios.get('http://localhost:3000/api/getEmployee', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
          });

          if (response.status < 200 || response.status >= 300) {
            throw new Error('Error al obtener la información del empleado');
          }

          data = response.data;
          setEmployees(data);
          setUserName(data.name);
          setIsLoading(false);
        } catch (error) {
          console.error('Error al obtener la información del empleado:', error);
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

    const fetchTimeEntries = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await axios.get('http://localhost:3000/api/timesheets', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status < 200 || response.status >= 300) {
          throw new Error('Error al obtener las entradas de tiempo');
        }
        
        setTimeEntries(response.data);
      } catch (error) {
        console.error('Error al obtener las entradas de tiempo:', error);
        Swal.fire({
          showConfirmButton: true,
          icon: 'error',
          text: 'Error en el servidor.'
        });
      }
    };

    fetchEmployeeName();
    fetchTimeEntries();
  }, []);

  const goBack = () => {
    navigate('/');
  };

  const formatElapsedTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleRowClick = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEntry(null);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', height: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', width: '100%', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="w-100 d-flex align-items-center mb-3">
            <Button variant="link" onClick={goBack} className="p-0 me-2 d-flex align-items-center">
                <ArrowLeftShort size={32} style={{color: '#F8B944'}} />
            </Button>
            <h2 className="m-0 text-center pages-titles">Mi Perfil</h2>
        </div>
          <h3 className="pages-titles">Entradas de Tiempo</h3>
        <div style={{ overflow: 'auto'}}>
          <Table >
            <thead>
              <tr>
                <th className='pages-titles' style={{ width: '20%' }}>Tarea</th>
                <th className='pages-titles' style={{ width: '50%' }}>Descripción</th>
                <th className='pages-titles' style={{ width: '30%' }}>Duración</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.map(entry => (
                <tr key={entry.id} onClick={() => handleRowClick(entry)} style={{ cursor: 'pointer' }}>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px', color: '#ECB136' }}>{entry.task_id}</td>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{entry.name}</td>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{entry.date_time_end ? formatElapsedTime(new Date(entry.date_time_end) - new Date(entry.date_time)) : 'Sin finalizar'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        
        {selectedEntry && (
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Detalles</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>Proyecto:</strong> {selectedEntry.account_id}</p>
              <p><strong>Tarea:</strong> {selectedEntry.task_id}</p>
              <p><strong>Descripción:</strong> {selectedEntry.name}</p>
              <p><strong>Hora de Inicio:</strong> {selectedEntry.date_time}</p>
              <p><strong>Hora de Fin:</strong> {selectedEntry.date_time_end}</p>
              <p><strong>Usuario:</strong> {selectedEntry.user_id}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button className='task-button' onClick={handleCloseModal}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Employee;
