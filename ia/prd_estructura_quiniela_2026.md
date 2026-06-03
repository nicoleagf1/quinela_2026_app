# Product Requirements Document (PRD) - Estructura del Proyecto

## 1. Resumen del Proyecto
**Quiniela VE PAGOS Mundial 2026** es una aplicación web interactiva que permite a los usuarios participar en una quiniela del Mundial de Fútbol 2026. Los usuarios pueden registrarse, realizar pronósticos para los partidos, visualizar su puntuación en una tabla de clasificación (Leaderboard) y consultar un registro de auditoría de los movimientos. Adicionalmente, cuenta con un robusto panel de administración para gestionar usuarios, partidos y configuraciones globales.

## 2. Arquitectura General
La aplicación está construida bajo el patrón arquitectónico **MVC (Modelo-Vista-Controlador)** utilizando Node.js y Express para el backend, y EJS (Embedded JavaScript) junto con Tailwind CSS para el frontend. La autenticación se maneja a través de Passport.js utilizando estrategias locales basadas en sesiones.

## 3. Estructura de Directorios

La estructura organizativa del proyecto se divide de la siguiente manera:

```text
quiniela_2026_app/
├── app.js                 # Punto de entrada principal de la aplicación Express
├── package.json           # Dependencias y scripts del proyecto
├── tailwind.config.js     # Configuración de estilos y tipografía de Tailwind CSS
├── config/                # Configuraciones del sistema
│   └── passport.js        # Configuración de autenticación (estrategia local)
├── controllers/           # Lógica de negocio y controladores de rutas
│   ├── adminController.js
│   ├── auditController.js
│   ├── authController.js
│   ├── dashboardController.js
│   ├── matchController.js
│   ├── predictionController.js
│   └── rankingController.js
├── models/                # Capa de acceso a datos (Lógica de Modelos)
│   ├── Audit.js
│   ├── Match.js
│   ├── Prediction.js
│   ├── Ranking.js
│   └── User.js
├── routes/                # Definición de endpoints y enrutamiento
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── matchRoutes.js
│   ├── predictionRoutes.js
│   └── rankingRoutes.js
├── utils/                 # Herramientas de soporte
│   └── teamData.js        # Diccionario estático de banderas e ISOs de equipos
├── views/                 # Plantillas de interfaz de usuario (EJS)
│   ├── auth/              # Vistas de autenticación (Login, Registro)
│   ├── admin/             # Vistas del panel de control de administradores
│   ├── partials/          # Componentes reutilizables (Headers, Sidebars, Footers)
│   └── [raíz]             # Vistas principales del usuario (Dashboard, Partidos, Posiciones)
├── public/                # Archivos estáticos
│   ├── css/               # Hojas de estilo compiladas y base
│   ├── images/            # Recursos gráficos (fondos, logos)
│   └── js/                # Scripts del cliente (si aplica)
└── ia/                    # Documentación técnica y guías de diseño
```

## 4. Módulos y Componentes del Sistema

### 4.1 Módulo de Autenticación
- **Controlador (`authController.js`) / Rutas (`authRoutes.js`)**: Gestiona el registro de usuarios, el inicio de sesión y el cierre de sesión. Implementa la normalización de correos (minúsculas) y la validación de contraseñas mediante encriptación (Bcrypt).
- **Vistas**: `login.ejs` y `register.ejs` con diseño premium *Glassmorphism*.

### 4.2 Panel de Usuario (User Dashboard)
- **Controlador (`dashboardController.js`)**: Calcula y recopila los KPIs personales del usuario (Total de pronósticos, puntos totales, posición actual en el ranking global).
- **Vista**: `dashboard.ejs`. Actúa como la página de inicio post-login.

### 4.3 Módulo de Partidos y Pronósticos
- **Controlador (`matchController.js`, `predictionController.js`)**: Encargado de renderizar los partidos agrupados por fecha y procesar el envío de pronósticos por parte del usuario.
- **Vista**: `matches.ejs`. Contiene un diseño inmersivo y responsivo para el ingreso de marcadores con los escudos de los equipos.

### 4.4 Tabla de Posiciones (Leaderboard)
- **Controlador (`rankingController.js`)**: Calcula los puntos de cada participante comparando sus pronósticos con los resultados oficiales. Otorga 3 puntos por marcador exacto y 1 punto por acierto simple (ganador o empate).
- **Vista**: `leaderboard.ejs`. Visualización jerárquica destacando el Top 3.

### 4.5 Módulo de Auditoría
- **Controlador (`auditController.js`)**: Genera el historial de las acciones realizadas. 
- **Vista**: `auditoria.ejs`. Muestra la fecha, hora, usuario y predicción realizada con un formato amigable.

### 4.6 Panel de Administración (Admin Panel)
- **Controlador (`adminController.js`)**: Permite operaciones privilegiadas como edición de roles de usuarios, actualización de marcadores reales de partidos y cierre/apertura de partidos.
- **Vistas**: 
  - `dashboard.ejs` (Resumen general y gráficos).
  - `matches_center.ejs` y `matches.ejs` (Gestión de partidos).
  - `users.ejs` y `edit_user.ejs` (Gestión de participantes).

## 5. Diseño y UI/UX
Toda la plataforma adopta un enfoque visual premium:
- **Responsive Design**: Optimización móvil a través del sistema de grillas de Tailwind.
- **Identidad Visual**: Uso intensivo de fondos cinematográficos oscuros con superposiciones translúcidas (*backdrop-blur*) y gradientes.
- **Tipografía**: Implementación global de la fuente "Source Sans 3".

## 6. Stack Tecnológico (Sin Base de Datos)
- **Backend Framework**: Node.js v18+ con Express.js.
- **Motor de Plantillas**: EJS (Embedded JavaScript).
- **Framework CSS**: Tailwind CSS (v3+).
- **Gestión de Sesiones**: Express-Session y Passport.js.
- **Iconografía**: FontAwesome 6.
- **Visualización de Datos**: Chart.js (Panel Admin).
