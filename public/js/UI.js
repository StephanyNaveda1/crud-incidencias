import Incidencia from './Incidencia.js';

/**
 * Clase que gestiona la Interfaz de Usuario (DOM) del sistema de incidencias.
 */
export default class UI {
    constructor() {
        // Elementos del Formulario
        this.formulario = document.getElementById('incidencia-form');
        this.inputTitulo = document.getElementById('titulo');
        this.selectUbicacion = document.getElementById('ubicacion');
        this.selectUrgencia = document.getElementById('urgencia');
        this.textareaDescripcion = document.getElementById('descripcion');
        this.btnSubmit = document.getElementById('btn-submit');
        this.formTitle = document.getElementById('form-title');
        this.btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
        
        // Elementos de la lista y estadísticas
        this.tablaCuerpo = document.getElementById('tabla-incidencias-body');
        this.contadorTotal = document.getElementById('stat-total');
        this.contadorAlta = document.getElementById('stat-alta');
        
        // Elemento de alertas
        this.alertContainer = document.getElementById('alert-container');
        
        // Estado local de edición
        this.idEdicion = null;
    }

    /**
     * Captura los datos del formulario y realiza validaciones en el frontend.
     * Retorna una instancia de Incidencia si es válida, de lo contrario lanza un Error.
     */
    capturarFormulario() {
        const titulo = this.inputTitulo.value.trim();
        const ubicacion = this.selectUbicacion.value;
        const urgencia = this.selectUrgencia.value;
        const descripcion = this.textareaDescripcion.value.trim();

        // Validaciones estrictas según los requerimientos
        if (!titulo) {
            this.inputTitulo.focus();
            throw new Error('El título del problema es obligatorio.');
        }

        if (!ubicacion) {
            this.selectUbicacion.focus();
            throw new Error('La ubicación es obligatoria.');
        }

        if (!urgencia) {
            this.selectUrgencia.focus();
            throw new Error('El nivel de urgencia debe tener un valor válido seleccionado.');
        }

        if (!descripcion || descripcion.length < 15) {
            this.textareaDescripcion.focus();
            throw new Error('La descripción detallada debe tener un mínimo de 15 caracteres.');
        }

        // Retornamos un objeto de la clase Incidencia
        return new Incidencia(titulo, ubicacion, urgencia, descripcion, this.idEdicion);
    }

    /**
     * Carga los datos de una incidencia en el formulario para editar.
     */
    prepararFormularioEdicion(incidencia) {
        this.idEdicion = incidencia.id;
        
        // Asignar valores a los controles del formulario
        this.inputTitulo.value = incidencia.titulo;
        this.selectUbicacion.value = incidencia.ubicacion;
        this.selectUrgencia.value = incidencia.urgencia;
        this.textareaDescripcion.value = incidencia.descripcion;

        // Modificar aspecto visual del formulario a modo edición
        this.formTitle.innerHTML = '✏️ Editar Incidencia';
        this.btnSubmit.innerHTML = '<span>Guardar Cambios</span>';
        this.btnSubmit.classList.add('btn-editing');
        this.btnCancelarEdicion.style.display = 'inline-flex';
        
        // Hacer scroll suave al formulario
        this.formulario.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Limpia el formulario y reestablece el estado de creación.
     */
    limpiarFormulario() {
        this.idEdicion = null;
        this.formulario.reset();
        
        // Volver a modo creación
        this.formTitle.innerHTML = '➕ Reportar Incidencia';
        this.btnSubmit.innerHTML = '<span>Registrar Incidencia</span>';
        this.btnSubmit.classList.remove('btn-editing');
        this.btnCancelarEdicion.style.display = 'none';
    }

    /**
     * Renderiza la lista de incidencias en la tabla.
     */
    renderizarLista(incidencias) {
        this.tablaCuerpo.innerHTML = '';

        if (incidencias.length === 0) {
            this.tablaCuerpo.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div class="empty-state-content">
                            <span class="empty-icon">🔍</span>
                            <p>No se encontraron incidencias.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        incidencias.forEach((inc, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', inc.id);
            
            // Clase de urgencia para el badge
            const urgenciaClass = `badge-urgencia-${inc.urgencia.toLowerCase()}`;
            
            // Formatear la fecha
            const fechaObj = new Date(inc.fecha);
            const fechaFormateada = fechaObj.toLocaleString('es-VE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            tr.innerHTML = `
                <td>
                    <div class="inc-title">${this.escaparHTML(inc.titulo)}</div>
                    <div class="inc-date">${fechaFormateada}</div>
                </td>
                <td>
                    <span class="location-badge">📍 ${this.escaparHTML(inc.ubicacion)}</span>
                </td>
                <td>
                    <span class="badge-urgencia ${urgenciaClass}">${inc.urgencia}</span>
                </td>
                <td class="desc-cell">
                    <p class="desc-text" title="${this.escaparHTML(inc.descripcion)}">
                        ${this.escaparHTML(inc.descripcion)}
                    </p>
                </td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" title="Editar incidencia">
                        ✏️
                    </button>
                    <button class="btn-action btn-delete" title="Eliminar incidencia">
                        ❌
                    </button>
                </td>
            `;
            this.tablaCuerpo.appendChild(tr);
        });
    }

    /**
     * Actualiza el panel de estadísticas en tiempo real.
     */
    actualizarEstadisticas(incidencias) {
        const total = incidencias.length;
        const alta = incidencias.filter(inc => inc.urgencia === 'Alta').length;

        // Animación suave de cambio de número
        this.animarNumero(this.contadorTotal, total);
        this.animarNumero(this.contadorAlta, alta);
    }

    /**
     * Anima un contador numérico en el DOM.
     */
    animarNumero(elemento, valorFinal) {
        const valorInicial = parseInt(elemento.textContent) || 0;
        if (valorInicial === valorFinal) return;

        let inicio = null;
        const duracion = 300; // ms

        const paso = (timestamp) => {
            if (!inicio) inicio = timestamp;
            const progreso = Math.min((timestamp - inicio) / duracion, 1);
            const valorActual = Math.floor(progreso * (valorFinal - valorInicial) + valorInicial);
            elemento.textContent = valorActual;
            if (progreso < 1) {
                window.requestAnimationFrame(paso);
            } else {
                elemento.textContent = valorFinal;
            }
        };
        window.requestAnimationFrame(paso);
    }

    /**
     * Muestra una notificación emergente (Toast) en la esquina superior derecha.
     */
    mostrarMensaje(mensaje, tipo = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        
        let icon = '🔔';
        if (tipo === 'success') icon = '✅';
        if (tipo === 'error') icon = '⚠️';
        if (tipo === 'info') icon = 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${this.escaparHTML(mensaje)}</span>
            <span class="toast-close">&times;</span>
        `;

        this.alertContainer.appendChild(toast);

        // Evento para cerrar la alerta al hacer click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('toast-leaving');
            setTimeout(() => toast.remove(), 300);
        });

        // Autocerrado después de 4 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-leaving');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    /**
     * Utilidad para escapar HTML y prevenir XSS.
     */
    escaparHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
