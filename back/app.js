const express = require('express');
const xmlrpc = require('xmlrpc');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('odoo.db');

const dbOdoo = 'odoo'

// Crear tablas para proyectos y tareas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT,
      description TEXT,
      date_start TEXT,
      date TEXT,
      task_count INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      name TEXT,
      project_id INTEGER,
      user_ids TEXT,
      date_deadline TEXT,
      stage_id INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY,
      task_id INTEGER,
      user_id INTEGER,
      start_time TEXT,
      end_time TEXT,
      description TEXT
    )
  `);
});

app.use(bodyParser.json());
app.use(cors());

// Configura la conexión con el servidor xmlrpc
const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/common' });

let userId

// Función para verificar las credenciales del usuario utilizando xmlrpc
const loginWithXmlrpc = (database, email, password) => {
  return new Promise((resolve, reject) => {
    const params = [ database, email, password, { user_agent_env: 'Node.js XML-RPC Client', context: {} } ];
    console.log("servidor", params)
    client.methodCall('authenticate', params, (error, userId) => {
      if (error) {
        reject(error);
      } else {
        resolve(userId);
      }
    });
  });
};

// Ruta para manejar las solicitudes de inicio de sesión
app.post('/api/login', async (req, res) => {
  const { database, email, password } = req.body;

  try {
    // Verifica las credenciales utilizando xmlrpc
   const integerValue = await loginWithXmlrpc(database, email, password);

    if (integerValue > 0) {
        // Usuario correcto, genera el token JWT y responde al cliente
        const token = jwt.sign({ email, database, password, userId: integerValue }, 'secretkey', { expiresIn: '24h' });
        res.json({ token });
    } else {
        // Credenciales incorrectas, devuelve un error
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    // Error al comunicarse con el servidor xmlrpc
    console.error('Error en la comunicación xmlrpc:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Guardar datos en SQLite
const saveProjects = (projects) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO projects (id, name, description, date_start, date, task_count) VALUES (?, ?, ?, ?, ?, ?)");

  projects.forEach(project => {
    stmt.run(project.id, project.name, project.description, project.date_start, project.date, project.task_count);
  });

  stmt.finalize();
};  

const saveTasks = (tasks) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO tasks (id, name, project_id, user_ids, date_deadline, stage_id) VALUES (?, ?, ?, ?, ?, ?)");

  tasks.forEach(task => {
    stmt.run(task.id, task.name, task.project_id[0], JSON.stringify(task.user_ids), task.date_deadline, task.stage_id[0]);
  });

  stmt.finalize();
};

// Leer datos desde SQLite
const getLocalProjects = (callback) => {
  db.all("SELECT * FROM projects", (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

const getLocalTasks = (callback) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

// Ruta para obtener la información del empleado asociado al usuario autenticado
app.get('/api/getEmployee', async (req, res) => {
  try {
    // Verifica si el usuario está autenticado mediante el token JWT
    const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
    const decodedToken = jwt.verify(token, 'secretkey');

    // Si el token es válido, realiza la llamada a la API XML-RPC de Odoo para obtener la información del empleado
    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener el empleado
      const params = [
        decodedToken.database, // Nombre de la base de datos
        decodedToken.userId, // ID del usuario
        decodedToken.password, // Contraseña del usuario
        'hr.employee', // Nombre del modelo de Odoo que contiene los empleados
        'search_read', // Método de la API de Odoo para buscar y leer registros
        [['user_id', '=', userId]], // Condición para buscar el empleado por el userId
        { fields: ['name', 'id', 'job_id', 'department_id', 'work_email', 'avatar_1024'] } // Campos a devolver para cada empleado
      ];

      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        if (error) {
          console.error('Error en la llamada a execute_kw:', error);
          res.status(500).json({ error: 'Error al obtener la información del empleado en Odoo' });
        } else {
          // Devuelve la información del empleado obtenida de Odoo
          if (value.length > 0) {
            res.json(value[0]);
          } else {
            res.status(404).json({ error: 'Empleado no encontrado' });
          }
        }
      });
    } else {
      // Si el token no es válido, devuelve un error de autenticación
      res.status(401).json({ error: 'Token JWT inválido' });
    }
  } catch (error) {
    // Error al decodificar el token JWT
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});


// Ruta para obtener todos los proyectos de Odoo
app.get('/api/proyectos', async (req, res) => {
  try {
    // Verifica si el usuario está autenticado mediante el token JWT
    const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
    const decodedToken = jwt.verify(token, 'secretkey');
    
    // Si el token es válido, realiza la llamada a la API XML-RPC de Odoo para obtener los proyectos
    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener los proyectos
      const params = [
        decodedToken.database, // Reemplaza 'nombre_de_la_base_de_datos' por el nombre real de tu base de datos en Odoo
        decodedToken.userId, // ID del usuario (puede ser obtenido de la respuesta de exp_login)
        decodedToken.password, // Contraseña del usuario
        'project.project', // Nombre del modelo de Odoo que contiene los proyectos
        'search_read', // Método de la API de Odoo para buscar y leer registros
        [], // Lista de condiciones de búsqueda (vacia para obtener todos los registros)
        { fields: ['name', 'description', 'date_start', 'date', 'task_count'] } // Campos a devolver para cada proyecto
      ];

      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        
        if (error) {
          getLocalProjects((err, projects) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              res.json(projects);  // Devolver proyectos locales
            }
          })
        } else {
          // Devuelve los proyectos obtenidos de Odoo
          res.json(value);
          saveProjects(value);
        }
      });
    } else {
      // Si el token no es válido, devuelve un error de autenticación
      res.status(401).json({ error: 'Token JWT inválido' });
    }
  } catch (error) {
    // Error al decodificar el token JWT
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});

// Ruta para obtener los proyectos asignados al usuario autenticado
app.get('/api/userProjects', async (req, res) => {
  try {
    // Verifica si el usuario está autenticado mediante el token JWT
    const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
    const decodedToken = jwt.verify(token, 'secretkey');

    // Si el token es válido, realiza la llamada a la API XML-RPC de Odoo para obtener los proyectos asignados al usuario
    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener los proyectos asignados al usuario
      const params = [
        decodedToken.database, // Nombre de la base de datos
        decodedToken.userId, // ID del usuario
        decodedToken.password, // Contraseña del usuario
        'project.project', // Nombre del modelo de Odoo que contiene los proyectos
        'search_read', // Método de la API de Odoo para buscar y leer registros
        [
          [['user_id', '=', decodedToken.userId]], // Condición para buscar los proyectos por el userId
        ],
        { fields: ['name', 'description', 'date_start', 'date', 'task_count'] } // Campos a devolver para cada proyecto
      ];


      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        if (error) {
          getLocalProjects((err, projects) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              const filteredProjects = projects.filter(project => project.user_id === decodedToken.userId);
              console.log("mis proyectos locales",filteredProjects)
              res.json(projects); // Devolver proyectos locales
            }
          });
        } else {
          // Devuelve los proyectos obtenidos de Odoo
          res.json(value);
          saveProjects(value);
        }
      });
    } else {
      // Si el token no es válido, devuelve un error de autenticación
      res.status(401).json({ error: 'Token JWT inválido' });
    }
  } catch (error) {
    // Error al decodificar el token JWT
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});

// Ruta para obtener todas las tareas
app.get('/api/taskProject', async (req, res) => {
  
  try {
    // Verifica si el usuario está autenticado mediante el token JWT
    const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
    const decodedToken = jwt.verify(token, 'secretkey');

    // Si el token es válido, realiza la llamada a la API XML-RPC de Odoo para obtener las tareas de cada proyecto
    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener las tareas de cada proyecto
      const params = [
        decodedToken.database, // Nombre de la base de datos
        decodedToken.userId, // ID del usuario
        decodedToken.password, // Contraseña del usuario
        'project.task', // Nombre del modelo de Odoo que contiene las tareas
        'search_read', // Método de la API de Odoo para buscar y leer registros
        [], // Lista de condiciones de búsqueda (vacía para obtener todos los registros)
        { fields: ['name', 'project_id', 'user_ids', 'date_deadline', 'stage_id'] } // Campos a devolver para cada tarea
      ];

      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        
        if (error) {
          getLocalTasks((err, tasks) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              res.json(tasks);  // Devolver tareas locales
            }
          });
        } else {
          // Devuelve las tareas obtenidas de Odoo
          res.json(value);
          saveTasks(value);
        }
      });
    } else {
      // Si el token no es válido, devuelve un error de autenticación
      res.status(401).json({ error: 'Token JWT inválido' });
    }
  } catch (error) {
    // Error al decodificar el token JWT
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});

// Ruta para obtener las tareas asociadas al usuario
app.get('/api/userTasks', async (req, res) => {
  
  try {
    // Verifica si el usuario está autenticado mediante el token JWT
    const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
    const decodedToken = jwt.verify(token, 'secretkey');

    // Si el token es válido, realiza la llamada a la API XML-RPC de Odoo para obtener las tareas de cada proyecto
    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener las tareas de cada proyecto
      const params = [
        decodedToken.database, // Nombre de la base de datos
        decodedToken.userId, // ID del usuario
        decodedToken.password, // Contraseña del usuario
        'project.task', // Nombre del modelo de Odoo que contiene las tareas
        'search_read', // Método de la API de Odoo para buscar y leer registros
        [
          [['user_ids', '=', decodedToken.userId]]
        ], // Lista de condiciones de búsqueda (vacía para obtener todos los registros)
        { fields: ['name', 'project_id', 'user_ids', 'date_deadline', 'stage_id'] } // Campos a devolver para cada tarea
      ];

      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        
        if (error) {
          getLocalTasks((err, tasks) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              res.json(tasks);  // Devolver tareas locales
            }
          });
        } else {
          // Devuelve las tareas obtenidas de Odoo
          res.json(value);
          saveTasks(value);
        }
      });
    } else {
      // Si el token no es válido, devuelve un error de autenticación
      res.status(401).json({ error: 'Token JWT inválido' });
    }
  } catch (error) {
    // Error al decodificar el token JWT
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});

// Ruta para obtener las tareas de cada proyecto
app.get('/api/taskProject/:projectId', async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  try {
    // Verifica si el usuario está autenticado mediante el token JWT
    const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
    const decodedToken = jwt.verify(token, 'secretkey');

    // Si el token es válido, realiza la llamada a la API XML-RPC de Odoo para obtener las tareas de cada proyecto
    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener las tareas de cada proyecto
      const params = [
        decodedToken.database, // Nombre de la base de datos
        userId, // ID del usuario
        decodedToken.password, // Contraseña del usuario
        'project.task', // Nombre del modelo de Odoo que contiene las tareas
        'search_read', // Método de la API de Odoo para buscar y leer registros
        [['project_id', '=', projectId]], // Lista de condiciones de búsqueda (vacía para obtener todos los registros)
        { fields: ['name', 'project_id', 'user_ids', 'date_deadline', 'stage_id'] } // Campos a devolver para cada tarea
      ];

      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        if (error) {
          getLocalTasks((err, tasks) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              const filteredTasks = tasks.filter(task => task.project_id === projectId);
              res.json(filteredTasks);  // Devolver tareas locales
            }
          });
        } else {
          // Devuelve las tareas obtenidas de Odoo
          res.json(value);
          saveTasks(value);
        }
      });
    } else {
      // Si el token no es válido, devuelve un error de autenticación
      res.status(401).json({ error: 'Token JWT inválido' });
    }
  } catch (error) {
    // Error al decodificar el token JWT
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});

// Ruta para iniciar una tarea
app.post('/api/startTask', async (req, res) => {
  const { task_id, user_id, description } = req.body;
  const startTime = new Date().toISOString();

  // Verifica si ya hay una tarea en curso
  db.get(`SELECT * FROM time_entries WHERE user_id = ? AND end_time IS NULL`, [user_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (row) {
      // Si hay una tarea en curso, la detiene antes de iniciar una nueva
      const endTime = new Date().toISOString();
      db.run(`UPDATE time_entries SET end_time = ? WHERE id = ?`, [endTime, row.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        // Calcula el tiempo transcurrido
        const startTimePreviousTask = new Date(row.start_time);
        const endTimePreviousTask = new Date(endTime);
        const elapsedTime = endTimePreviousTask - startTimePreviousTask; // En milisegundos
        const elapsedTimeFormatted = formatElapsedTime(elapsedTime);
        console.log(`La tarea anterior ha durado: ${elapsedTimeFormatted}`);

        // Inicia la nueva tarea después de detener la anterior
        db.run(`INSERT INTO time_entries (task_id, user_id, start_time, description) VALUES (?, ?, ?, ?)`, [task_id, user_id, startTime, description], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          res.json({ id: this.lastID });
        });
      });
    }else{
      // Inicia la nueva tarea
      db.run(`INSERT INTO time_entries (task_id, user_id, start_time, description) VALUES (?, ?, ?, ?)`, [task_id, user_id, startTime, description], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ id: this.lastID });
      });
    }
  });
});

// Ruta para detener una tarea
app.post('/api/stopTask', async (req, res) => {
  const { entry_id } = req.body;
  const endTime = new Date().toISOString();

  db.get(`SELECT * FROM time_entries WHERE id = ?`, [entry_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (row) {
      db.run(`UPDATE time_entries SET end_time = ? WHERE id = ?`, [endTime, entry_id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Calcula el tiempo transcurrido
        const startTimeTask = new Date(row.start_time);
        const endTimeTask = new Date(endTime);
        const elapsedTime = endTimeTask - startTimeTask; // En milisegundos
        const elapsedTimeFormatted = formatElapsedTime(elapsedTime);
        console.log(`La tarea ha durado: ${elapsedTimeFormatted}`);

        res.json({ success: true, elapsedTime: elapsedTimeFormatted });
      });
    } else {
      res.status(400).json({ error: 'Tarea no encontrada' });
    }
  });
});

// Función para formatear el tiempo transcurrido
function formatElapsedTime(elapsedTime) {
  const milliseconds = parseInt((elapsedTime % 1000) / 100),
    seconds = Math.floor((elapsedTime / 1000) % 60),
    minutes = Math.floor((elapsedTime / (1000 * 60)) % 60),
    hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);

  return `${hours} horas, ${minutes} minutos, ${seconds}.${milliseconds} segundos`;
}

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});