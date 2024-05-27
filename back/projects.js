// src/routes/projects.js
const express = require('express');
const router = express.Router();
const db = require('./db');

// Middleware para verificar la conectividad
const checkConnectivity = async (req, res, next) => {
  try {
    // Intentar una petición sencilla a Odoo para verificar la conexión
    await client.methodCall('common.version', []);
    req.isOnline = true;
  } catch (error) {
    req.isOnline = false;
  }
  next();
};

router.use(checkConnectivity);

// Ruta para crear un nuevo proyecto
router.post('/', async (req, res) => {
  const project = req.body;

  if (req.isOnline) {
    // Guardar directamente en Odoo
    // ... lógica para guardar en Odoo ...
  } else {
    // Guardar en la base de datos local
    db.run("INSERT INTO projects (name, description, date_start, date_end) VALUES (?, ?, ?, ?)",
      [project.name, project.description, project.date_start, project.date_end], (err) => {
      if (err) {
        res.status(500).json({ error: 'Error al guardar el proyecto en local' });
      } else {
        res.status(200).json({ message: 'Proyecto guardado localmente' });
      }
    });
  }
});

module.exports = router;
