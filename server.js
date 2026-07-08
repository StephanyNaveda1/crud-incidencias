const express = require('express');
const path = require('path');
const incidenciasRouter = require('./routes/incidencias');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Registrar las rutas del API de incidencias
app.use('/api/incidencias', incidenciasRouter);

// Importar fs y GestorArchivo para el reporte
const fs = require('fs');
const GestorArchivo = require('./models/GestorArchivo');
const db = new GestorArchivo('incidencias.json');

// Ruta para el reporte imprimible de Atención Inmediata
app.get('/atencion-inmediata', (req, res) => {
    try {
        const incidencias = db.obtenerTodas();
        // Filtrar únicamente los reportes de Urgencia "Alta"
        const incidenciasAlta = incidencias.filter(inc => inc.urgencia === 'Alta');

        const htmlPath = path.join(__dirname, 'public', 'atencion-inmediata.html');
        if (fs.existsSync(htmlPath)) {
            let htmlContent = fs.readFileSync(htmlPath, 'utf8');
            // Inyectar datos en el script del HTML
            htmlContent = htmlContent.replace(
                '/* INCIDENCIAS_ALTA_PLACEHOLDER */',
                `const incidenciasAlta = ${JSON.stringify(incidenciasAlta)};`
            );
            res.send(htmlContent);
        } else {
            res.status(404).send('La vista atencion-inmediata.html no existe en la carpeta public.');
        }
    } catch (error) {
        console.error('Error al renderizar reporte:', error);
        res.status(500).send('Error al procesar el reporte de atención inmediata.');
    }
});

// Ruta por defecto para enviar index.html en cualquier otra petición GET
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar el servidor
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Servidor de Incidencias iniciado correctamente`);
    console.log(`💻 Acceso local: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
