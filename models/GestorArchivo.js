const fs = require('fs');
const path = require('path');

class GestorArchivo {
    constructor(nombreArchivo = 'incidencias.json') {
        // Guardamos la ruta absoluta del archivo
        this.rutaArchivo = path.isAbsolute(nombreArchivo) 
            ? nombreArchivo 
            : path.join(__dirname, '..', nombreArchivo);
    }

    /**
     * Lee las incidencias del archivo JSON.
     * Si no existe o está dañado, inicializa con un arreglo vacío.
     */
    leer() {
        try {
            if (!fs.existsSync(this.rutaArchivo)) {
                // Crear archivo vacío con un array si no existe
                this.guardar([]);
                return [];
            }
            const contenido = fs.readFileSync(this.rutaArchivo, 'utf8');
            return JSON.parse(contenido || '[]');
        } catch (error) {
            console.error('Error leyendo el archivo JSON, reestableciendo base de datos:', error.message);
            // En caso de corrupción, retornamos vacío para no romper la app
            return [];
        }
    }

    /**
     * Guarda la lista de incidencias en el archivo JSON.
     */
    guardar(datos) {
        try {
            const contenido = JSON.stringify(datos, null, 2);
            fs.writeFileSync(this.rutaArchivo, contenido, 'utf8');
            return true;
        } catch (error) {
            console.error('Error escribiendo en el archivo JSON:', error.message);
            return false;
        }
    }

    /**
     * Obtiene todas las incidencias.
     */
    obtenerTodas() {
        return this.leer();
    }

    /**
     * Obtiene una incidencia por su ID.
     */
    obtenerPorId(id) {
        const incidencias = this.leer();
        return incidencias.find(inc => inc.id === id) || null;
    }

    /**
     * Agrega una nueva incidencia y le genera un ID único, estado inicial y fecha.
     */
    agregar(nuevaIncidencia) {
        const incidencias = this.leer();
        
        // Generamos un ID basado en timestamp y una cadena aleatoria corta
        const id = 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const fecha = new Date().toISOString();
        
        const registro = {
            id,
            fecha,
            estado: 'Pendiente', // Por defecto todas nacen pendientes
            titulo: nuevaIncidencia.titulo,
            ubicacion: nuevaIncidencia.ubicacion,
            urgencia: nuevaIncidencia.urgencia,
            descripcion: nuevaIncidencia.descripcion
        };

        incidencias.push(registro);
        this.guardar(incidencias);
        return registro;
    }

    /**
     * Actualiza una incidencia existente por su ID.
     */
    actualizar(id, datosActualizados) {
        const incidencias = this.leer();
        const index = incidencias.findIndex(inc => inc.id === id);

        if (index === -1) {
            return null;
        }

        // Actualizamos los campos permitidos y mantenemos id, fecha y estado original
        incidencias[index] = {
            ...incidencias[index],
            titulo: datosActualizados.titulo,
            ubicacion: datosActualizados.ubicacion,
            urgencia: datosActualizados.urgencia,
            descripcion: datosActualizados.descripcion,
            fechaActualizacion: new Date().toISOString()
        };

        this.guardar(incidencias);
        return incidencias[index];
    }

    /**
     * Marca una incidencia como solucionada.
     */
    resolver(id) {
        const incidencias = this.leer();
        const index = incidencias.findIndex(inc => inc.id === id);

        if (index === -1) {
            return null;
        }

        incidencias[index] = {
            ...incidencias[index],
            estado: 'Solucionado',
            fechaResolucion: new Date().toISOString()
        };

        this.guardar(incidencias);
        return incidencias[index];
    }

    /**
     * Elimina una incidencia por su ID.
     */
    eliminar(id) {
        const incidencias = this.leer();
        const index = incidencias.findIndex(inc => inc.id === id);

        if (index === -1) {
            return false;
        }

        incidencias.splice(index, 1);
        this.guardar(incidencias);
        return true;
    }
}

module.exports = GestorArchivo;