// src/routes/employees.js
const express = require('express');
const router = express.Router();
const db = require('./db');

// Ruta para obtener la información del empleado
router.get('/:employeeId', (req, res) => {
  const { employeeId } = req.params;

  db.get("SELECT * FROM employees WHERE id = ?", [employeeId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener los datos del empleado' });
    } else {
      res.json(row);
    }
  });
});

module.exports = router;
