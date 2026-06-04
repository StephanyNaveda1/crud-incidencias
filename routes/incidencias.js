const express = require('express');
const router = express.Router();
const GestorArchivo = require('../models/GestorArchivo');

// Instanciamos el gestor de archivos para la base de datos de incidencias
const db = new GestorArchivo('incidencias.json');

// Función de validación compartida para creación y edición
function validarIncidencia(req, res, next) {
    const { titulo, ubicacion, urgencia, descripcion } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
        return res.status(400).json({ error: 'El título del problema es obligatorio.' });
    }

    if (!ubicacion || typeof ubicacion !== 'string' || ubicacion.trim() === '') {
        return res.status(400).json({ error: 'La ubicación es obligatoria.' });
    }

    const nivelesValidos = ['Baja', 'Media', 'Alta'];
    if (!urgencia || !nivelesValidos.includes(urgencia)) {
        return res.status(400).json({ error: 'El nivel de urgencia debe ser Baja, Media o Alta.' });
    }

    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 15) {
        return res.status(400).json({ error: 'La descripción detallada debe tener un mínimo de 15 caracteres.' });
    }

    // Si pasa las validaciones, saneamos los datos y continuamos
    req.saneado = {
        titulo: titulo.trim(),
        ubicacion: ubicacion.trim(),
        urgencia,
        descripcion: descripcion.trim()
    };

    next();
}

/**
 * GET /api/incidencias
 * Obtiene todas las incidencias registradas.
 */
router.get('/', (req, res) => {
    try {
        const incidencias = db.obtenerTodas();
        res.json(incidencias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las incidencias.' });
    }
});

/**
 * GET /api/incidencias/:id
 * Obtiene una incidencia específica por su ID.
 */
router.get('/:id', (req, res) => {
    try {
        const incidencia = db.obtenerPorId(req.params.id);
        if (!incidencia) {
            return res.status(404).json({ error: 'Incidencia no encontrada.' });
        }
        res.json(incidencia);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la incidencia.' });
    }
});

/**
 * POST /api/incidencias
 * Registra una nueva incidencia.
 */
router.post('/', validarIncidencia, (req, res) => {
    try {
        const nuevaInc = db.agregar(req.saneado);
        res.status(201).json(nuevaInc);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la incidencia.' });
    }
});

/**
 * PUT /api/incidencias/:id
 * Edita una incidencia existente.
 */
router.put('/:id', validarIncidencia, (req, res) => {
    try {
        const { id } = req.params;
        const incidenciaActualizada = db.actualizar(id, req.saneado);

        if (!incidenciaActualizada) {
            return res.status(404).json({ error: 'La incidencia que intenta editar no existe.' });
        }

        res.json(incidenciaActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la incidencia.' });
    }
});

/**
 * DELETE /api/incidencias/:id
 * Elimina una incidencia.
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = db.eliminar(id);

        if (!eliminado) {
            return res.status(404).json({ error: 'La incidencia que intenta eliminar no existe.' });
        }

        res.json({ mensaje: 'Incidencia eliminada con éxito.', id });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la incidencia.' });
    }
});

module.exports = router;
