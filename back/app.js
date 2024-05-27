const express = require('express');
const xmlrpc = require('xmlrpc');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Configura la conexión con el servidor xmlrpc
const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/common' });

let integerValue;


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
    integerValue = await loginWithXmlrpc(database, email, password);

    if (integerValue > 0) {
      // Usuario correcto, genera el token JWT y responde al cliente
      const token = jwt.sign({ email, database }, 'secretkey', { expiresIn: '24h' });
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


// Ruta para obtener todos los proyectos de Odoo
app.get('/api/proyectos', async (req, res) => {
  try {
    // Verifica si el usuario está autenticado mediante el token JWT
    const token = req.headers.authorization.split(' ')[1]; // Obtén el token del encabezado Authorization
    const decodedToken = jwt.verify(token, 'secretkey');
    console.log(decodedToken)
    // Si el token es válido, realiza la llamada a la API XML-RPC de Odoo para obtener los proyectos
    if (decodedToken) {
      const client = xmlrpc.createClient({ host: 'localhost', port: 8069, path: '/xmlrpc/2/object' });

      // Parámetros para la llamada al método 'search_read' de la API de Odoo para obtener los proyectos
      const params = [
        'odoo', // Reemplaza 'nombre_de_la_base_de_datos' por el nombre real de tu base de datos en Odoo
        integerValue, // ID del usuario (puede ser obtenido de la respuesta de exp_login)
        'admin', // Contraseña del usuario
        'project.project', // Nombre del modelo de Odoo que contiene los proyectos
        'search_read', // Método de la API de Odoo para buscar y leer registros
        [], // Lista de condiciones de búsqueda (vacia para obtener todos los registros)
        { fields: ['name', 'description', 'date_start', 'date'] } // Campos a devolver para cada proyecto
      ];

      // Realiza la llamada al método XML-RPC de Odoo
      client.methodCall('execute_kw', params, (error, value) => {
        console.log(client)
        if (error) {
          console.error('Error al obtener proyectos de Odoo:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        } else {
          // Devuelve los proyectos obtenidos de Odoo
          res.json(value);
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



// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});