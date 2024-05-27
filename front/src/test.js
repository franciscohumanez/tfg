import axios from 'axios';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const BASE_URL = 'http://localhost:3000';

// Función para crear un proyecto
async function createProject(project) {
  try {
    const response = await axios.post(`${BASE_URL}/api/projects`, project, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Respuesta al crear proyecto:', response.data);
  } catch (error) {
    console.error('Error al crear proyecto:', error.response ? error.response.data : error.message);
  }
}

// Función para iniciar sesión
async function login(database, email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, { database, email, password });
    console.log('Respuesta al iniciar sesión:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response ? error.response.data : error.message);
  }
}

// Función para obtener información del empleado
async function getEmployeeInfo(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/employee`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Información del empleado:', response.data);
  } catch (error) {
    console.error('Error al obtener información del empleado:', error.response ? error.response.data : error.message);
  }
}

// Función para verificar si los proyectos se han sincronizado
async function checkLocalProjects() {
  const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });
  const rows = await db.all("SELECT * FROM projects WHERE is_synced = 0");
  
  if (rows.length === 0) {
    console.log('Todos los proyectos están sincronizados');
  } else {
    console.log('Proyectos no sincronizados:', rows);
  }
  await db.close();
}

// Función para obtener proyectos desde el servidor
async function getProjects(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/proyectos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Proyectos obtenidos del servidor:', response.data);
  } catch (error) {
    console.error('Error al obtener proyectos:', error.response ? error.response.data : error.message);
  }
}

async function main() {
  const database = 'odoo';
  const email = 'admin';
  const password = 'admin';

  // Iniciar sesión
  const token = await login(database, email, password);

  if (token) {
    // Crear un proyecto en modo offline (simular desconexión deteniendo Odoo antes de ejecutar esto)
    await createProject({
      name: 'Proyecto Offline',
      description: 'Descripción del proyecto offline',
      date_start: '2024-05-15',
      date_end: '2024-05-20'
    });

    // Verificar que el proyecto se ha guardado localmente
    await checkLocalProjects();

    // Simular reconexión y esperar sincronización
    console.log('Esperando sincronización...');
    await new Promise(resolve => setTimeout(resolve, 70000)); // Esperar un poco más de un minuto

    // Obtener información del empleado
    await getEmployeeInfo(token);

    // Obtener proyectos desde el servidor
    await getProjects(token);
  }
}

main();
