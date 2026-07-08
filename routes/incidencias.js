const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const GestorArchivo = require('../models/GestorArchivo');

// Instanciamos el gestor de archivos para la base de datos de incidencias
const db = new GestorArchivo('incidencias.json');

// Asegurar existencia de la carpeta 'uploads'
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Servir fotos de evidencia a través de una ruta dedicada con res.sendFile
router.get('/uploads/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const rutaFoto = path.join(uploadsDir, filename);
        if (fs.existsSync(rutaFoto)) {
            res.sendFile(rutaFoto);
        } else {
            res.status(404).send('Captura de evidencia no encontrada.');
        }
    } catch (error) {
        res.status(500).send('Error al servir el archivo de evidencia.');
    }
});

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

    // Subida obligatoria de evidencia en POST (creación)
    if (req.method === 'POST' && !req.file) {
        return res.status(400).json({ error: 'La captura o foto de evidencia es obligatoria.' });
    }

    // Si pasa las validaciones, saneamos los datos y continuamos
    req.saneado = {
        titulo: titulo.trim(),
        ubicacion: ubicacion.trim(),
        urgencia,
        descripcion: descripcion.trim(),
        // Guardamos el nombre de la foto si fue subida
        foto: req.file ? req.file.filename : undefined
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
 * Registra una nueva incidencia con soporte de subida de imagen.
 */
router.post('/', upload.single('foto'), validarIncidencia, (req, res) => {
    try {
        const nuevaInc = db.agregar(req.saneado);
        res.status(201).json(nuevaInc);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la incidencia.' });
    }
});

/**
 * PUT /api/incidencias/:id
 * Edita una incidencia existente con soporte opcional de subida de imagen.
 */
router.put('/:id', upload.single('foto'), validarIncidencia, (req, res) => {
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
 * PUT /api/incidencias/:id/estado
 * Cambia el estado de una incidencia siguiendo el flujo estricto de la máquina de estados.
 */
router.put('/:id/estado', (req, res) => {
    try {
        const { id } = req.params;
        const { estado, notasResolucion } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'El nuevo estado es obligatorio.' });
        }

        const incidenciaActualizada = db.cambiarEstado(id, estado, notasResolucion);

        if (!incidenciaActualizada) {
            return res.status(404).json({ error: 'La incidencia que intenta actualizar no existe.' });
        }

        res.json(incidenciaActualizada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * PUT /api/incidencias/:id/resolver
 * Marca una incidencia como solucionada (mantenido por compatibilidad).
 */
router.put('/:id/resolver', (req, res) => {
    try {
        const { id } = req.params;
        const { notasResolucion } = req.body;
        
        // Transición directa al estado final 'Resuelta'
        const incidenciaActualizada = db.cambiarEstado(id, 'Resuelta', notasResolucion || 'Resolución rápida');

        res.json(incidenciaActualizada);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
