const express = require('express');
const xmlrpc = require('xmlrpc');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(cors());

const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/common' });

const db = new sqlite3.Database(':memory:'); 
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, is_synced INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, name TEXT, description TEXT, date_start TEXT, date_end TEXT, task INTEGER, is_synced INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS employeeProjects (id INTEGER PRIMARY KEY, name TEXT, description TEXT, date_start TEXT, date_end TEXT, task INTEGER, is_synced INTEGER)");
});

let userId;
let userEmail = '';
let userPassword = '';

// Función para verificar las credenciales del usuario utilizando xmlrpc
const loginWithXmlrpc = (database, email, password) => {
  return new Promise((resolve, reject) => {
    const params = [database, email, password, { user_agent_env: { 'HTTP_USER_AGENT': 'Node.js XML-RPC Client' } }];
    
    client.methodCall('authenticate', params, (error, userId) => {
      if (error) {
        reject(error);
      } else {
        resolve(userId);
      }
    });
  });
};

app.post('/api/login', async (req, res) => {
  const { database, email, password } = req.body;

  try {
    userId = await loginWithXmlrpc(database, email, password);

    if (userId > 0) {
      userEmail = email;
      userPassword = password;

      // Ahora, obtenemos el empleado asociado al usuario logueado
      const employeeId = await getEmployeeId(database, userId)

      const token = jwt.sign({ email, database, employeeId }, 'secretkey', { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error en la comunicación xmlrpc:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const getEmployeeId = (database, userId) => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

    const params = [
      database,
      userId,
      userPassword,
      'res.users',
      'read',
      [userId],
      { fields: ['employee_id'] }
    ];

    client.methodCall('execute_kw', params, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value[0].employee_id[0]);
      }
    });
  });
};

app.get('/api/proyectos', async (req, res) => {
  try {
    // const { database, userId } = req.user;

    // if (isNaN(userId)) {
    //   return res.status(400).json({ error: 'ID de usuario no válido' });
    // }

    const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

    const params = [
      'odoo',
      userId,
      userPassword,
      'project.project',
      'search_read',
      [],
      { fields: ['name', 'description', 'date_start', 'date', 'task_count'] }
    ];

    console.log(params)

    client.methodCall('execute_kw', params, (error, value) => {
      if (error) {
        console.error('Error al obtener proyectos de Odoo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      } else {
        res.json(value);
      }
    });
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});

// app.get('/api/employee', async (req, res) => {
//   try {
//     const userId = req.userId;
//     console.log(userId)
//     if (!userId) {
//       return res.status(401).json({ error: 'Token JWT inválido' });
//     }
//     console.log(req.userId)
//     const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });
//     const params = [
//       'odoo',  // Nombre de la base de datos
//       userId,
//       userPassword,  // Contraseña del usuario, deberías manejar esto de manera segura
//       'hr.employee',
//       'search_read',
//       [['user_id', '=', userId]],  // Filtro para buscar al empleado por user_id
//       { fields: ['name', 'image_1920'] }  // Campos a devolver
//     ];
//     console.log(params)
//     client.methodCall('execute_kw', params, (error, value) => {
//       if (error) {
//         console.error('Error al obtener la información del empleado:', error);
//         res.status(500).json({ error: 'Error interno del servidor' });
//       } else {
//         res.json(value);
//         console.log(value)
//       }
//     });
//   } catch (error) {
//     console.error('Error al procesar la solicitud:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
