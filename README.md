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
Al ingresar en la app deberas colocar el usuario (`admin`) con la contraseña (`1234`) para poder ingresar, de lo contrario no entraras.
