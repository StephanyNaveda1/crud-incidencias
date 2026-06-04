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
