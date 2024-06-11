const express = require('express');
const xmlrpc = require('xmlrpc');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('odoo.db');

app.use(bodyParser.json());
app.use(cors());

// Configura la conexión con el servidor xmlrpc
const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/common' });

let userId

// Función para verificar las credenciales del usuario utilizando xmlrpc
const loginWithXmlrpc = (database, email, password) => {
  return new Promise((resolve, reject) => {
    const params = [ database, email, password, { user_agent_env: 'Node.js XML-RPC Client', context: {} } ];
    
    client.methodCall('authenticate', params, (error, userId) => {
      if (error) {
        reject(error);
      } else {
        resolve(userId);
      }
    });
  });
};

// Sincronización con Odoo
const syncFromOdoo = async (token) => {
  if (!token) {
    console.error('No token provided for syncFromOdoo');
    return;
  }

  const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });
  const decodedToken = jwt.verify(token, 'secretkey');

  if (decodedToken) {
    const params = [
      decodedToken.database,
      decodedToken.userId,
      decodedToken.password,
      'account.analytic.line', 
      'search_read',
      [['user_id', '=', decodedToken.userId]],
      { fields: ['name', 'date_time', 'date_time_end', 'unit_amount', 'account_id', 'task_id', 'user_id'] }
    ];
    
    client.methodCall('execute_kw', params, (error, value) => {
      if (error) {
        console.error('Error al obtener datos de Odoo:', error);
      } else {
        saveTimeEntries2(value);
      }
    });
  }
};

const saveTimeEntries2 = (entries) => {
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO time_entries (task_id, user_id, start_time, end_time, description) VALUES (?, ?, ?, ?, ?)`
  );

  entries.forEach(entry => {
    stmt.run(entry.task_id[0], entry.user_id[0], entry.date_time, entry.date_time_end, entry.name);
  });

  stmt.finalize();
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
        syncFromOdoo(token);
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
  const stmt = db.prepare("INSERT OR REPLACE INTO projects (id, name, description, date_start, date, task_count, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)");

  projects.forEach(project => {
    stmt.run(project.id, project.name, project.description, project.date_start, project.date, project.task_count);
  });

  stmt.finalize();
};  

const saveEmployeeProjects = (projects) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO employeeProjects (id, name, description, date_start, date, task_count) VALUES (?, ?, ?, ?, ?, ?)");

  projects.forEach(project => {
    stmt.run(project.id, project.name, project.description, project.date_start, project.date, project.task_count);
  });

  stmt.finalize();
};  

const saveTasks = (tasks) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO tasks (id, name, project_id, user_ids, date_deadline, stage_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)");

  tasks.forEach(task => {
    stmt.run(task.id, task.name, task.project_id[0], JSON.stringify(task.user_ids), task.date_deadline, task.stage_id[0]);
  });

  stmt.finalize();
};

const saveEmployeeTasks = (tasks) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO employeeTasks (id, name, project_id, user_ids, date_deadline, stage_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)");

  tasks.forEach(task => {
    stmt.run(task.id, task.name, task.project_id[0], JSON.stringify(task.user_ids), task.date_deadline, task.stage_id[0]);
  });

  stmt.finalize();
};

const saveEmployee = (employee) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO employee (name, id, job_id, department_id, work_email, avatar_1024) VALUES (?, ?, ?, ?, ?, ?)");

  employee.forEach(employee => {
    stmt.run(employee.name, employee.id, employee.job_id[1], employee.department_id[1], employee.work_email, employee.avatar_1024);
  });

  stmt.finalize();
};

const saveTimeEntries = (timeEntries) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO time_entries (id, task_id, user_id, date_time, date_time_end, name) VALUES (?, ?, ?, ?, ?, ?)");

  timeEntries.forEach(timeEntries => {
    stmt.run(timeEntries.id, timeEntries.task_id, timeEntries.user_id[0], timeEntries.date_time, timeEntries.date_time_end, timeEntries.name);
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

const getLocalEmployeeProjects = (callback) => {
  db.all("SELECT * FROM employeeProjects", (err, rows) => {
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

const getEmployeeTasks = (callback) => {
  db.all("SELECT * FROM employeeTasks", (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

const getEmployee = (callback) => {
  db.all("SELECT * FROM employee", (err, rows) => {
    if (err) {
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

const getTimeEntries = (callback) => {
  // Verifica si el usuario está autenticado mediante el token JWT
  // const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
  // const decodedToken = jwt.verify(token, 'secretkey');

  db.all("SELECT * FROM time_entries", (err, rows) => {
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
        [
          [['user_id', '=', decodedToken.userId]]
        ], // Condición para buscar el empleado por el userId
        { fields: ['name', 'id', 'job_id', 'department_id', 'work_email', 'avatar_1024'] } // Campos a devolver para cada empleado
      ];
      
      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => { 
        
        if (error) {
          getEmployee((err, employee) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              res.json(employee);  // Devolver proyectos locales
            }
          })
        } else {
          // Devuelve los proyectos obtenidos de Odoo
          res.json(value);
          saveEmployee(value);
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
        { fields: ['name', 'description', 'date_start', 'date', 'task_count', 'user_id'] } // Campos a devolver para cada proyecto
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
          getLocalEmployeeProjects((err, projects) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              res.json(projects); // Devolver proyectos locales
            }
          });
        } else {
          // Devuelve los proyectos obtenidos de Odoo
          res.json(value);
          saveEmployeeProjects(value);
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
          getEmployeeTasks((err, tasks) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              res.json(tasks);  // Devolver tareas locales
            }
          });
        } else {
          // Devuelve las tareas obtenidas de Odoo
          res.json(value);
          saveEmployeeTasks(value);
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

// Ruta para obtener las hojas de tiempo (timesheets) del usuario autenticado
app.get('/api/timesheets', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'secretkey');

    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener los timesheets
      const params = [
        decodedToken.database,
        decodedToken.userId,
        decodedToken.password,
        'account.analytic.line', // Modelo para los timesheets en Odoo
        'search_read',
        [
          [['user_id', '=', decodedToken.userId]] // Condición para buscar los timesheets por el userId
        ],
        { fields: ['name', 'date_time', 'date_time_end', 'unit_amount', 'account_id', 'task_id', 'user_id'] } // Campos a devolver para cada timesheet
      ];
      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        if (error) {
          getTimeEntries((err, timesheet) => {
            if (err) {
              res.status(500).json({ error: 'Error interno del servidor' });
            } else {
              res.json(timesheet);  // Devolver tareas locales
            }
          });
        } else {
          // Devuelve las tareas obtenidas de Odoo
          
          res.json(value);
          saveTimeEntries(value);
        }
      });
    } else {
      res.status(401).json({ error: 'Token JWT inválido' });
    }
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    res.status(401).json({ error: 'Token JWT inválido' });
  }
});

// Ruta para iniciar una tarea
app.post('/api/startTask', async (req, res) => {
  const { task_id, name, task_name, user_name } = req.body;
  const date_time = new Date().toISOString();

  const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
  const decodedToken = jwt.verify(token, 'secretkey');

  // Verifica si ya hay una tarea en curso
  db.get(`SELECT * FROM time_entries WHERE user_id = ? AND date_time_end IS NULL`, [decodedToken.userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const handleStartNewTask = () => {
      db.run(`INSERT INTO time_entries (task_id, task_name, user_id, user_name, date_time, name) VALUES (?, ?, ?, ?, ?, ?)`, 
        [task_id, task_name, decodedToken.userId, user_name, date_time, name], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ id: this.lastID });
        //console.log("START",res.json({ id: this.lastID }))
      });
    };

    if (row) {
      // Si hay una tarea en curso, la detiene antes de iniciar una nueva
      const endTime = new Date().toISOString();
      db.run(`UPDATE time_entries SET date_time_end = ? WHERE id = ?`, [endTime, row.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        handleStartNewTask();
      });
    } else {
      handleStartNewTask();
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
      db.run(`UPDATE time_entries SET date_time_end = ? WHERE id = ?`, [endTime, entry_id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Calcula el tiempo transcurrido
        const startTimeTask = new Date(row.date_time);
        const endTimeTask = new Date(endTime);
        const elapsedTime = endTimeTask - startTimeTask; // En milisegundos
        const elapsedTimeFormatted = formatElapsedTime(elapsedTime);

        res.json({ success: true, elapsedTime: elapsedTimeFormatted });
        //console.log("STOP",res.json({ success: true, elapsedTime: elapsedTimeFormatted }))
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



syncFromOdoo();

const syncToOdoo = () => {
  db.all(`SELECT * FROM time_entries WHERE date_time_end IS NOT NULL`, [], (err, rows) => {
    if (err) {
      return console.error('Error al obtener datos de la base de datos local:', err);
    }

    const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'secretkey');

    rows.forEach(row => {
      const params = [
        decodedToken.database,
        decodedToken.userId,
        decodedToken.password,
        'account.analytic.line', 
        'create',
        {
          name: row.name,
          date_time: row.date_time,
          date_time_end: row.date_time_end,
          unit_amount: (new Date(row.date_time_end) - new Date(row.date_time)) / 3600000, // convertir ms a horas
          account_id: row.account_id,
          task_id: row.task_id,
          user_id: row.user_id
        }
      ];

      client.methodCall('execute_kw', params, (error, value) => {
        if (error) {
          console.error('Error al subir datos a Odoo:', error);
        } else {
          db.run(`DELETE FROM time_entries WHERE id = ?`, [row.id], (err) => {
            if (err) {
              console.error('Error al eliminar datos locales:', err);
            }
          });
        }
      });
    });
  });
};

// Escuchar el evento de cierre de la aplicación
process.on('exit', syncToOdoo);
process.on('SIGINT', () => {
  syncToOdoo();
  process.exit();
});


// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
