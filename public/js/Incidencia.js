/**
 * Clase que representa el modelo de una Incidencia en el frontend.
 */
export default class Incidencia {
    constructor(titulo, ubicacion, urgencia, descripcion, id = null) {
        this.id = id;
        this.titulo = titulo;
        this.ubicacion = ubicacion;
        this.urgencia = urgencia; // 'Baja', 'Media', 'Alta'
        this.descripcion = descripcion;
    }
}
