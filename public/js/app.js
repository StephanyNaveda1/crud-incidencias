import UI from './UI.js';
import Incidencia from './Incidencia.js';

// Instanciamos el controlador de interfaz
const ui = new UI();

// Estado local de la aplicación
let todasLasIncidencias = [];

/**
 * Carga inicial de incidencias desde el servidor.
 */
async function cargarIncidencias() {
    try {
        const respuesta = await fetch('/api/incidencias');
        if (!respuesta.ok) {
            throw new Error('No se pudo establecer conexión con el servidor.');
        }
        todasLasIncidencias = await respuesta.json();
        
        // Renderizar la lista inicial y actualizar estadísticas
        ui.renderizarLista(todasLasIncidencias);
        ui.actualizarEstadisticas(todasLasIncidencias);
    } catch (error) {
        console.error('Error cargando incidencias:', error);
        ui.mostrarMensaje('Error al conectar con el servidor. Cargando base de datos vacía.', 'error');
        ui.renderizarLista([]);
        ui.actualizarEstadisticas([]);
    }
}

/**
 * Guarda o actualiza una incidencia en el servidor.
 */
async function guardarIncidencia(e) {
    e.preventDefault();

    try {
        // Capturar y validar desde la UI
        const incidenciaData = ui.capturarFormulario();
        
        const esEdicion = incidenciaData.id !== null;
        const url = esEdicion 
            ? `/api/incidencias/${incidenciaData.id}` 
            : '/api/incidencias';
        const metodo = esEdicion ? 'PUT' : 'POST';

        // Deshabilitar botón durante el envío para evitar doble clic
        ui.btnSubmit.disabled = true;
        
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titulo: incidenciaData.titulo,
                ubicacion: incidenciaData.ubicacion,
                urgencia: incidenciaData.urgencia,
                descripcion: incidenciaData.descripcion
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || 'Ocurrió un error al procesar la solicitud.');
        }

        if (esEdicion) {
            // Actualizar en el estado local
            todasLasIncidencias = todasLasIncidencias.map(inc => 
                inc.id === resultado.id ? resultado : inc
            );
            ui.mostrarMensaje('Incidencia actualizada con éxito.');
        } else {
            // Agregar al estado local
            todasLasIncidencias.push(resultado);
            ui.mostrarMensaje('Incidencia reportada con éxito.');
        }

        // Limpiar el formulario e interfaz de edición
        ui.limpiarFormulario();
        
        // Re-filtrar si hay un término de búsqueda activo, o renderizar todo
        filtrarIncidencias();
        
        // Actualizar estadísticas basadas en todos los datos históricos
        ui.actualizarEstadisticas(todasLasIncidencias);

    } catch (error) {
        console.error('Error al guardar incidencia:', error);
        ui.mostrarMensaje(error.message, 'error');
    } finally {
        ui.btnSubmit.disabled = false;
    }
}

/**
 * Elimina una incidencia del servidor.
 */
async function eliminarIncidencia(id) {
    const incidencia = todasLasIncidencias.find(inc => inc.id === id);
    if (!incidencia) return;

    const confirmacion = confirm(`¿Está seguro de que desea eliminar la incidencia: "${incidencia.titulo}"?`);
    if (!confirmacion) return;

    try {
        const respuesta = await fetch(`/api/incidencias/${id}`, {
            method: 'DELETE'
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || 'No se pudo eliminar la incidencia.');
        }

        // Remover del estado local
        todasLasIncidencias = todasLasIncidencias.filter(inc => inc.id !== id);
        
        // Mensaje de éxito
        ui.mostrarMensaje('Incidencia eliminada correctamente.');

        // Si la incidencia eliminada era la que se estaba editando, limpiar el formulario
        if (ui.idEdicion === id) {
            ui.limpiarFormulario();
        }

        // Actualizar tabla y estadísticas
        filtrarIncidencias();
        ui.actualizarEstadisticas(todasLasIncidencias);

    } catch (error) {
        console.error('Error al eliminar:', error);
        ui.mostrarMensaje(error.message, 'error');
    }
}

/**
 * Prepara el formulario para editar la incidencia seleccionada.
 */
function iniciarEdicionIncidencia(id) {
    const incidencia = todasLasIncidencias.find(inc => inc.id === id);
    if (incidencia) {
        ui.prepararFormularioEdicion(incidencia);
    }
}

/**
 * Filtra las incidencias reactivamente en tiempo real por Ubicación o Urgencia.
 */
function filtrarIncidencias() {
    const buscador = document.getElementById('search-input');
    const filtroUrgencia = document.getElementById('filter-urgency');
    
    const textoBusqueda = buscador.value.toLowerCase().trim();
    const urgenciaSeleccionada = filtroUrgencia.value;

    const incidenciasFiltradas = todasLasIncidencias.filter(inc => {
        // Filtro por término de búsqueda (Ubicación o Título)
        const coincideTermino = textoBusqueda === '' || 
            inc.ubicacion.toLowerCase().includes(textoBusqueda) || 
            inc.titulo.toLowerCase().includes(textoBusqueda) ||
            inc.descripcion.toLowerCase().includes(textoBusqueda);
            
        // Filtro por urgencia
        const coincideUrgencia = urgenciaSeleccionada === '' || 
            inc.urgencia === urgenciaSeleccionada;

        return coincideTermino && coincideUrgencia;
    });

    // Renderiza la lista filtrada, pero las estadísticas de cabecera se mantienen sobre la base total
    ui.renderizarLista(incidenciasFiltradas);
}

// === REGISTRO DE EVENTOS ===

// Cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarIncidencias();

    // Guardar (Submit del formulario)
    ui.formulario.addEventListener('submit', guardarIncidencia);

    // Cancelar edición
    ui.btnCancelarEdicion.addEventListener('click', (e) => {
        e.preventDefault();
        ui.limpiarFormulario();
    });

    // Búsqueda y filtrado reactivo (tiempo real)
    document.getElementById('search-input').addEventListener('input', filtrarIncidencias);
    document.getElementById('filter-urgency').addEventListener('change', filtrarIncidencias);

    // Delegación de eventos en la tabla para botones de Acción (Editar/Eliminar)
    ui.tablaCuerpo.addEventListener('click', (e) => {
        const boton = e.target.closest('.btn-action');
        if (!boton) return;

        const fila = boton.closest('tr');
        const id = fila.getAttribute('data-id');

        if (boton.classList.contains('btn-delete')) {
            eliminarIncidencia(id);
        } else if (boton.classList.contains('btn-edit')) {
            iniciarEdicionIncidencia(id);
        }
    });
});
