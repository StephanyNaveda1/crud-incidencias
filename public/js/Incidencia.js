export default class Incidencia {
    constructor(titulo, ubicacion, urgencia, descripcion, id = null, foto = null) {
        this.id = id;
        this.titulo = titulo;
        this.ubicacion = ubicacion;
        this.urgencia = urgencia; // 'Baja', 'Media', 'Alta'
        this.descripcion = descripcion;
        this.foto = foto; // Archivo físico en creación, o nombre del archivo en la UI
    }
}
