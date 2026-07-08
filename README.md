# 🛡️ Sistema de Reporte e Incidencias - Evaluación 3

Este proyecto consiste en un sistema web asíncrono tipo CRUD diseñado para gestionar los fallos de infraestructura y equipos en la Universidad Politécnica Territorial de Trujillo (UPTT). Está estructurado bajo un enfoque de **Arquitectura de 3 Capas**, **Programación Orientada a Objetos (POO)** y **Modularización**.

---

## 👥 Integrantes del Equipo 4

* `Maria Rodriguez` - C.I: `V-28696819`
* `Ruthmar Verbel` - C.I: `V-32346703`
* `Stephany Naveda` - C.I: `V-31140974`

---

## 🎯 Objetivo y Funcionalidades

El objetivo principal es permitir el registro, visualización, edición y eliminación de fallos técnicos de infraestructura en tiempo real sin recargar la página.

### Características Principales:
1.  **Formulario Validado (Frontend/Backend):** Validación estricta para evitar registros incompletos o descripciones muy cortas (mínimo 15 caracteres).
2.  **Arquitectura Limpia (3 Capas):**
    *   **Frontend (Capa de Presentación/UI):** Código modular basado en clases ES6 (`Incidencia.js`, `UI.js`, `app.js`) y diseño CSS premium con tema oscuro y animaciones.
    *   **Controladores/Rutas (Capa de Negocio):** Rutas modularizadas con Express Router.
    *   **Persistencia (Capa de Datos):** Base de datos basada en archivos (`incidencias.json`), gestionada a través de la clase `GestorArchivo` usando el módulo nativo `fs`.
3.  **Búsqueda Reactiva:** Filtrado de registros en tiempo real según la ubicación o nivel de urgencia sin llamadas adicionales al servidor.
4.  **Estadísticas Dinámicas:** Panel superior que muestra la cantidad total de incidencias y el conteo de aquellas con urgencia alta, actualizándose al instante ante cualquier cambio (crear, editar, eliminar).

---

## 🛠️ Tecnologías Utilizadas

*   **Servidor:** Node.js (v18+)
*   **Framework Backend:** Express
*   **Frontend:** Vanilla HTML5, CSS3 Moderno, JavaScript ES6 Modules
*   **Base de Datos:** Persistencia local en archivo JSON (`incidencias.json`)
*   **Control de Versiones:** Git

---

## 🚀 Instalación y Ejecución

Siga los siguientes pasos para clonar, instalar y ejecutar el proyecto localmente:

### 1. Requisitos Previos
Asegúrese de tener instalado **Node.js** en su sistema. Puede verificarlo ejecutando:
```bash
node -v
```

### 2. Instalación de Dependencias
Navegue al directorio raíz del proyecto (`sistema-incidencias`) e instale las dependencias especificadas en el `package.json`:
```bash
npm install
```

### 3. Ejecución del Servidor

*   **Modo Producción:** Levanta el servidor normalmente.
    ```bash
    npm start
    ```
*   **Modo Desarrollo (Recomendado):** Levanta el servidor con reinicio automático al detectar cambios (Node.js 18+ watch mode).
    ```bash
    npm run dev
    ```

El servidor estará disponible en la dirección local: **[http://localhost:3000](http://localhost:3000)**.

### 4. Usuario y Contraseña
Al ingresar en la app deberás colocar el usuario (`admin`) con la contraseña (`1234`) para poder ingresar.

---

## 📈 Nuevas Características de la Evaluación 4 (Full-Stack Avanzado)

Se ha ampliado el sistema original incorporando las siguientes capacidades avanzadas:

### 1. Gestión de Archivos Multimedia (Evidencia Fotográfica)
* **Subida Obligatoria:** El formulario de creación ahora requiere adjuntar una imagen/captura de evidencia física (`<input type="file" accept="image/*">`).
* **Migración a FormData:** El envío de datos desde el frontend se ha migrado a un formato `multipart/form-data` manejado con `FormData`.
* **Persistencia Física:** El backend utiliza el middleware `multer` para almacenar físicamente las imágenes en el directorio local `/uploads`.
* **Ruta Dedicada de Visualización:** Se implementó una ruta dedicada (`/api/incidencias/uploads/:filename`) que sirve de forma segura las imágenes mediante `res.sendFile` de Express. En el panel, cada incidencia cuenta con su respectiva miniatura interactiva.

### 2. Reporte Imprimible ("Atención Inmediata")
* **Vista Exclusiva:** Se construyó la vista `/atencion-inmediata` (`public/atencion-inmediata.html`).
* **Filtro del Servidor:** El servidor procesa la lista total y envía a esta vista **únicamente** aquellos reportes con Nivel de Urgencia **"Alta"**.
* **Optimización de Impresión:** La vista está estilizada con reglas CSS `@media print` para ocultar botones o elementos de navegación al imprimirse física o digitalmente. Cuenta con un botón que acciona de forma nativa la función `window.print()`.

### 3. Lógica de Negocio Avanzada (Máquina de Estados y SLA)
* **Máquina de Estados con Flujo Estricto:** Los tickets sólo pueden transicionar siguiendo la ruta lineal:
  $$\text{Pendiente} \longrightarrow \text{Asignado a Técnico} \longrightarrow \text{En Proceso} \longrightarrow \text{Resuelta}$$
  No está permitido saltar estados ni retroceder en el flujo.
* **Notas de Resolución Obligatorias:** Al cambiar el estado de una incidencia a **"Resuelta"**, el técnico está obligado a rellenar el formulario de historial de resolución en un modal interactivo; de lo contrario, el sistema impedirá la transición.
* **Trazabilidad Dinámica de SLA (Días Transcurridos):** Al guardarse la incidencia, el servidor registra su marca de tiempo exacta. Cada vez que el cliente consulta las incidencias, el backend calcula en tiempo real cuántos días han transcurrido a través de diferencias con objetos `Date`.
* **Alerta Visual de SLA Crítico:** En la tabla de incidencias, los reportes no resueltos con **más de 3 días de antigüedad** se marcan con un fondo rojo de alerta crítica (`.sla-critical-row`).
