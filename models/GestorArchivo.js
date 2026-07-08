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
     * Calcula cuántos días han transcurrido desde la fecha de reporte inicial.
     */
    calcularDiasTranscurridos(inc) {
        const fechaReporte = new Date(inc.fecha);
        const hoy = new Date();
        const diffMs = hoy - fechaReporte;
        // Retornamos el número entero de días transcurridos
        return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    /**
     * Obtiene todas las incidencias.
     */
    obtenerTodas() {
        const incidencias = this.leer();
        return incidencias.map(inc => ({
            ...inc,
            diasTranscurridos: this.calcularDiasTranscurridos(inc)
        }));
    }

    /**
     * Obtiene una incidencia por su ID.
     */
    obtenerPorId(id) {
        const incidencias = this.leer();
        const inc = incidencias.find(inc => inc.id === id);
        if (!inc) return null;
        return {
            ...inc,
            diasTranscurridos: this.calcularDiasTranscurridos(inc)
        };
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
            descripcion: nuevaIncidencia.descripcion,
            foto: nuevaIncidencia.foto || null,
            notasResolucion: null
        };

        incidencias.push(registro);
        this.guardar(incidencias);
        return {
            ...registro,
            diasTranscurridos: 0
        };
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

        // Si se especificó una nueva foto la guardamos, si no, conservamos la actual
        const foto = datosActualizados.foto !== undefined ? datosActualizados.foto : incidencias[index].foto;

        // Actualizamos los campos permitidos y mantenemos id, fecha y estado original
        incidencias[index] = {
            ...incidencias[index],
            titulo: datosActualizados.titulo,
            ubicacion: datosActualizados.ubicacion,
            urgencia: datosActualizados.urgencia,
            descripcion: datosActualizados.descripcion,
            foto,
            fechaActualizacion: new Date().toISOString()
        };

        this.guardar(incidencias);
        return {
            ...incidencias[index],
            diasTranscurridos: this.calcularDiasTranscurridos(incidencias[index])
        };
    }

    /**
     * Realiza un cambio de estado con validación estricta y notas de resolución obligatorias.
     */
    cambiarEstado(id, nuevoEstado, notasResolucion = '') {
        const incidencias = this.leer();
        const index = incidencias.findIndex(inc => inc.id === id);

        if (index === -1) {
            return null;
        }

        const inc = incidencias[index];
        const estadoActual = inc.estado || 'Pendiente';

        const ESTADOS_SECUENCIA = ['Pendiente', 'Asignado a Técnico', 'En Proceso', 'Resuelta'];
        const idxActual = ESTADOS_SECUENCIA.indexOf(estadoActual);
        const idxNuevo = ESTADOS_SECUENCIA.indexOf(nuevoEstado);

        if (idxNuevo === -1) {
            throw new Error(`Estado desconocido: ${nuevoEstado}`);
        }

        if (idxNuevo !== idxActual + 1) {
            throw new Error(`Tránsito de estado inválido. No se puede pasar de "${estadoActual}" a "${nuevoEstado}". El flujo estricto es: Pendiente -> Asignado a Técnico -> En Proceso -> Resuelta.`);
        }

        if (nuevoEstado === 'Resuelta') {
            if (!notasResolucion || typeof notasResolucion !== 'string' || notasResolucion.trim() === '') {
                throw new Error('El Historial de Notas de Resolución es obligatorio para poder resolver la incidencia.');
            }
            inc.notasResolucion = notasResolucion.trim();
            inc.fechaResolucion = new Date().toISOString();
        }

        inc.estado = nuevoEstado;
        inc.fechaActualizacion = new Date().toISOString();

        this.guardar(incidencias);
        return {
            ...inc,
            diasTranscurridos: this.calcularDiasTranscurridos(inc)
        };
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

        // Si tiene foto física, podríamos borrarla, pero por simplicidad solo removemos el registro
        incidencias.splice(index, 1);
        this.guardar(incidencias);
        return true;
    }
}

module.exports = GestorArchivo;
