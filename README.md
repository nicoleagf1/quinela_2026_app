# Quiniela del Mundial de Fútbol 2026 🏆

Aplicación web interactiva basada en una arquitectura tradicional **Modelo-Vista-Controlador (MVC)** con Node.js, Express, PostgreSQL, Redis y Tailwind CSS, diseñada para gestionar pronósticos deportivos y calcular posiciones en tiempo real durante la Copa Mundial de la FIFA 2026.

---

## 🚀 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu sistema:
- **Node.js** (LTS o superior)
- **NPM** (incluido con Node.js)
- **Docker & Docker Compose** (Recomendado para aprovisionar PostgreSQL y Redis instantáneamente)

---

## 🛠️ Guía de Instalación y Levantamiento

Sigue estos pasos detallados para configurar y ejecutar la aplicación localmente:

### 1. Clonar el Repositorio e Instalar Dependencias
Instala los paquetes de Node.js necesarios ejecutando en tu terminal:
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo de plantilla `.env.example` para crear tu archivo `.env` de configuración:
```bash
cp .env.example .env
```
*(En Windows PowerShell: `Copy-Item .env.example .env`)*

El archivo `.env` configurado por defecto contiene los parámetros para conectarse a los contenedores locales:
```ini
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=quiniela_db
SESSION_SECRET=supersecret
REDIS_URL=redis://localhost:6379
```

### 3. Levantar los Servicios en Contenedores (PostgreSQL y Redis)
Si tienes Docker instalado, puedes iniciar los servidores de PostgreSQL y Redis en segundo plano con una sola instrucción:
```bash
docker compose up -d
```
Esto creará y arrancará:
- Un contenedor PostgreSQL expuesto en el puerto `5432` con la base de datos `quiniela_db`.
- Un contenedor Redis expuesto en el puerto `6379` para gestionar las sesiones de usuario.

### 4. Inicializar y Sembrar la Base de Datos
Una vez que los contenedores estén activos, ejecuta el script de inicialización de esquemas:
```bash
node init_db.js
```
Este script aplicará las directivas DDL de `database_schema.sql` y creará las tablas necesarias (`users`, `matches`, `predictions`, `leaderboards`).

Luego, carga los datos semilla de los partidos de la Fase de Grupos y los perfiles de prueba:
```bash
node seed_worldcup.js
```
Este proceso generará de manera aleatoria los emparejamientos y creará las siguientes credenciales para pruebas:

*   **Administrador:**
    *   **Usuario:** `admin@quiniela2026.com`
    *   **Contraseña:** `adminpassword`
*   **Usuarios Estándar (Participantes):**
    *   **Usuario 1:** `user1@quiniela2026.com` / Contraseña: `userpassword`
    *   **Usuario 2:** `user2@quiniela2026.com` / Contraseña: `userpassword`

### 5. Compilar los Estilos de Tailwind CSS
Compila los estilos en un paquete optimizado mediante el compilador Tailwind:
```bash
npm run build:css
```

### 6. Arrancar la Aplicación en Desarrollo
Inicia el servidor web utilizando Nodemon para habilitar recarga en caliente:
```bash
npm run dev
```

La aplicación estará disponible en tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Características de la Aplicación

1.  **Panel de Administración Premium:**
    - Ingresa con la cuenta de Administrador.
    - Monitorea métricas en tiempo real (usuarios registrados, pronósticos guardados, partidos finalizados).
    - Accede al **Centro de Marcadores** para reportar resultados de partidos en vivo o programados. Al reportar un marcador, el sistema ejecutará automáticamente el algoritmo de puntos e incrementará la tabla de posiciones en tiempo real.
2.  **Pronósticos Con Bloqueo de Tiempo (Time-Lock):**
    - Los participantes pueden ingresar marcadores para partidos abiertos.
    - Si el partido ya ha comenzado, el sistema bloquea automáticamente el envío o edición tanto a nivel cliente como servidor.
3.  **Cálculo Automatizado de Tabla de Posiciones:**
    - **Resultado Exacto (+3 Puntos):** Acierto preciso del marcador de ambos equipos.
    - **Acierto de Dirección (+1 Punto):** Ganador o empate correcto pero fallando el marcador preciso.
    - **Fallo (0 Puntos):** Sin puntos.
