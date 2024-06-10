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
    <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
      <div>
        <div className="w-100 d-flex align-items-center mb-3">
            <Button variant="link" onClick={goBack} className="p-0 me-2 d-flex align-items-center">
                <ArrowLeftShort size={32} style={{color: '#F8B944'}} />
            </Button>
            <h2 className="m-0 text-center">Información del empleado</h2>
        </div>
        {isLoading ? (
          <Card style={{ width: '18rem', marginBottom: '20px' }}>
            <Card.Body>
              <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                <Placeholder xs={6} /> <Placeholder xs={8} />
              </Placeholder>
            </Card.Body>
          </Card>
        ) : (
            employees.map(employee => (
              <Card 
                style={{ width: '18rem', marginBottom: '20px', cursor: 'pointer',  }}
                key={employee.id}  
              >
                <Card.Body style={{ padding: '10px' }}>
                  {employee.avatar_1024 && <Card.Img variant="top" src={`data:image/jpeg;base64,${employee.avatar_1024}`} alt="Foto del empleado" />}
                  <Card.Title>{employee.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    <p>Departamento: {employee.department_id}</p>
                    <p>Puesto: {employee.job_id}</p>
                    <p>Email: {employee.work_email}</p>
                  </Card.Subtitle>
                </Card.Body>
              </Card>
            ))
          )}
          <h3 className="mt-4">Entradas de Tiempo</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Descripción</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.map(entry => (
              <tr key={entry.id} onClick={() => handleRowClick(entry)} style={{ cursor: 'pointer' }}>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{entry.task_id}</td>
                <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{entry.description}</td>
                <td>{formatElapsedTime(new Date(entry.end_time) - new Date(entry.start_time))}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {selectedEntry && (
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Detalles</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>Tarea:</strong> {selectedEntry.task_id}</p>
              <p><strong>Descripción:</strong> {selectedEntry.description}</p>
              <p><strong>Tiempo Transcurrido:</strong> {formatElapsedTime(new Date(selectedEntry.end_time) - new Date(selectedEntry.start_time))}</p>
              <p><strong>Hora de Inicio:</strong> {new Date(selectedEntry.start_time).toLocaleString()}</p>
              <p><strong>Hora de Fin:</strong> {new Date(selectedEntry.end_time).toLocaleString()}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
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
