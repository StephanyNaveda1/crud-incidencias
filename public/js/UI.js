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
        this.contadorSolucionadas = document.getElementById('stat-solucionadas');
        this.contadorAlta = document.getElementById('stat-alta');
        
        // Elemento de alertas
        this.alertContainer = document.getElementById('alert-container');

        // Elementos de Login
        this.loginOverlay = document.getElementById('login-overlay');
        this.loginForm = document.getElementById('login-form');
        this.loginUsername = document.getElementById('login-username');
        this.loginPassword = document.getElementById('login-password');
        this.btnLogout = document.getElementById('btn-logout');

        // Elementos de Pestañas
        this.tabPendientes = document.getElementById('tab-pendientes');
        this.tabSolucionadas = document.getElementById('tab-solucionadas');
        this.countPendientes = document.getElementById('count-pendientes');
        this.countSolucionadas = document.getElementById('count-solucionadas');
        
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

        // Obtener la foto
        const fotoInput = document.getElementById('foto');
        const fotoFile = fotoInput && fotoInput.files ? fotoInput.files[0] : null;

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

        // Si es creación nueva (no es edición), la foto es obligatoria
        if (!this.idEdicion && !fotoFile) {
            if (fotoInput) fotoInput.focus();
            throw new Error('La captura o foto de evidencia es obligatoria para reportar una incidencia.');
        }

        // Retornamos un objeto de la clase Incidencia con la foto
        return new Incidencia(titulo, ubicacion, urgencia, descripcion, this.idEdicion, fotoFile);
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

        // Para edición, la foto no es estrictamente obligatoria (se puede mantener la anterior)
        const fotoInput = document.getElementById('foto');
        if (fotoInput) {
            fotoInput.required = false;
        }

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
        
        // Reestablecer la foto como obligatoria para nuevos registros
        const fotoInput = document.getElementById('foto');
        if (fotoInput) {
            fotoInput.required = true;
        }
        
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
            
            // Si no está resuelta y tiene más de 3 días, aplicar la alerta visual roja
            const esResuelta = inc.estado === 'Resuelta';
            if (!esResuelta && inc.diasTranscurridos > 3) {
                tr.classList.add('sla-critical-row');
            }
            
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

            // Generar miniatura/botón para ver la evidencia
            let evidenciaHTML = '';
            if (inc.foto) {
                evidenciaHTML = `
                    <div class="evidence-thumb-container">
                        <img src="/api/incidencias/uploads/${inc.foto}" class="evidence-thumb" alt="Evidencia" title="Ver imagen en tamaño completo" onclick="window.open('/api/incidencias/uploads/${inc.foto}', '_blank')">
                        <a href="/api/incidencias/uploads/${inc.foto}" target="_blank" class="btn-evidence-text">🖼️ Evidencia</a>
                    </div>
                `;
            }

            // Formatear detalle de fechas
            let fechaDetalleHTML = `
                <div class="inc-title">${this.escaparHTML(inc.titulo)}</div>
                <div class="inc-date" title="Fecha de reporte">📅 ${fechaFormateada}</div>
            `;
            let notasResolucionHTML = '';

            if (esResuelta) {
                const fechaResObj = new Date(inc.fechaResolucion || inc.fecha);
                const fechaResFormateada = fechaResObj.toLocaleString('es-VE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                fechaDetalleHTML += `
                    <div class="inc-date" style="color: #059669; font-weight: 700;" title="Fecha de solución">✓ Resuelta: ${fechaResFormateada}</div>
                `;
                if (inc.notes || inc.notasResolucion) {
                    notasResolucionHTML = `
                        <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(16, 185, 129, 0.08); border-left: 3px solid #059669; border-radius: 4px; font-size: 0.8rem; color: #064e3b; word-break: break-word;">
                            <strong>Resolución:</strong> ${this.escaparHTML(inc.notasResolucion || inc.notes)}
                        </div>
                    `;
                }
            } else {
                // Trazabilidad de SLA: Días transcurridos
                const colorSla = inc.diasTranscurridos > 3 ? 'var(--urgencia-alta)' : 'var(--text-muted)';
                const pesoSla = inc.diasTranscurridos > 3 ? '700' : '500';
                fechaDetalleHTML += `
                    <div class="inc-date" style="color: ${colorSla}; font-weight: ${pesoSla};" title="Días desde el reporte">⏱ Transcurrido: ${inc.diasTranscurridos} día(s)</div>
                `;
            }

            // Configurar badges de estado y botones permitidos en el flujo
            const estadoActual = inc.estado || 'Pendiente';
            let badgeEstadoClass = 'badge-estado-pendiente';
            if (estadoActual === 'Asignado a Técnico') badgeEstadoClass = 'badge-estado-asignado';
            else if (estadoActual === 'En Proceso') badgeEstadoClass = 'badge-estado-proceso';
            else if (estadoActual === 'Resuelta') badgeEstadoClass = 'badge-estado-resuelta';

            let accionesHTML = '';
            if (esResuelta) {
                // Solo se permite eliminar del historial una vez resuelto
                accionesHTML = `
                    <button class="btn-action btn-delete" title="Eliminar del historial">
                        ❌
                    </button>
                `;
            } else {
                let btnSiguienteEstado = '';
                if (estadoActual === 'Pendiente') {
                    btnSiguienteEstado = `
                        <button class="btn-action btn-next-state" data-next="Asignado a Técnico" title="Asignar a Técnico">
                            👤
                        </button>
                    `;
                } else if (estadoActual === 'Asignado a Técnico') {
                    btnSiguienteEstado = `
                        <button class="btn-action btn-next-state" data-next="En Proceso" title="Iniciar Trabajo (En Proceso)">
                            ⚙️
                        </button>
                    `;
                } else if (estadoActual === 'En Proceso') {
                    btnSiguienteEstado = `
                        <button class="btn-action btn-next-state btn-resolve" data-next="Resuelta" title="Resolver (Notas obligatorias)">
                            ✅
                        </button>
                    `;
                }

                accionesHTML = `
                    ${btnSiguienteEstado}
                    <button class="btn-action btn-edit" title="Editar detalles">
                        ✏️
                    </button>
                    <button class="btn-action btn-delete" title="Eliminar incidencia">
                        ❌
                    </button>
                `;
            }

            tr.innerHTML = `
                <td>
                    ${fechaDetalleHTML}
                </td>
                <td>
                    <span class="location-badge">📍 ${this.escaparHTML(inc.ubicacion)}</span>
                </td>
                <td>
                    <span class="badge-urgencia ${urgenciaClass}">${inc.urgencia}</span>
                </td>
                <td class="desc-cell">
                    <span class="badge-urgencia ${badgeEstadoClass}" style="margin-bottom: 0.4rem; display: inline-block;">${estadoActual}</span>
                    <p class="desc-text" title="${this.escaparHTML(inc.descripcion)}">
                        ${this.escaparHTML(inc.descripcion)}
                    </p>
                    ${evidenciaHTML}
                    ${notasResolucionHTML}
                </td>
                <td class="actions-cell">
                    ${accionesHTML}
                </td>
            `;
            this.tablaCuerpo.appendChild(tr);
        });
    }

    /**
     * Actualiza el panel de estadísticas en tiempo real.
     */
    actualizarEstadisticas(incidencias) {
        const pendientes = incidencias.filter(inc => inc.estado !== 'Resuelta');
        const solucionadas = incidencias.filter(inc => inc.estado === 'Resuelta');
        
        const totalPendientes = pendientes.length;
        const totalSolucionadas = solucionadas.length;
        const alta = pendientes.filter(inc => inc.urgencia === 'Alta').length;

        // Animación suave de cambio de número
        this.animarNumero(this.contadorTotal, totalPendientes);
        this.animarNumero(this.contadorSolucionadas, totalSolucionadas);
        this.animarNumero(this.contadorAlta, alta);

        // Actualizar badges de las pestañas
        if (this.countPendientes) this.countPendientes.textContent = totalPendientes;
        if (this.countSolucionadas) this.countSolucionadas.textContent = totalSolucionadas;
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
