# Vulnerable Web - Entorno de Pruebas de Seguridad

Esta es una aplicacion web intencionalmente vulnerable diseñada para demostrar y practicar tecnicas de pentesting como SQL Injection y XSS.

## Instrucciones de Uso

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Iniciar el servidor:**
    ```bash
    node server.js
    ```

3.  **Configurar la Base de Datos:**
    Abre tu navegador y visita: `http://localhost:3000/setup`
    Esto creara las tablas necesarias y el usuario de prueba.

4.  **Acceder a la aplicacion:**
    Visita: `http://localhost:3000/`

## Credenciales de Prueba

*   **Usuario:** Shiroh
*   **Contraseña:** nosexde

## Vulnerabilidades Implementadas

*   **SQL Injection (Login):** Permite bypass de autenticacion y extraccion de datos.
*   **Reflected XSS (Dashboard):** Permite ejecucion de scripts en el navegador a traves de la busqueda.
*   **Information Disclosure:** Mensajes de error de base de datos detallados.
