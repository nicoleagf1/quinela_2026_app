# System Architecture & Technical Design Document
## Project: World Cup 2026 Quiniela Web Application

---

## 1. Executive Summary

The **World Cup 2026 Quiniela** is a high-performance web application tailored to enable users to submit predictions for the 104 matches of the upcoming FIFA World Cup 2026. The platform operates on a traditional Model-View-Controller (MVC) architecture, optimizing server-side execution speed, ensuring strict validation windows for score submissions, and automatically computing user leaderboards in real time.

### Core Architectural Decisions
*   **Code Standard:** Strict English conventions for variables, files, database structures, parameters, architecture routing, and source comments.
*   **User Interface:** Pure Spanish localization (`es-VE` context ready) for all structural text, inputs, date presentation formatting, validation feedback alerts, and transactional messages.
*   **Performance Profile:** Minimal runtime overhead through compiled query structures, aggressive connection pooling, and optimized view caching models to handle spikes occurring prior to kickoff intervals.

---

## 2. Technology Stack & Environment

| Layer | Technology | Selection Justification |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js LTS | Non-blocking, asynchronous execution framework optimized for handling I/O heavy transactional traffic. |
| **Web Application Framework** | Express.js | Unopinionated routing framework perfectly mapping traditional MVC architectures without internal bloat. |
| **Database Engine** | PostgreSQL 16+ | ACID-compliant relational storage engine for reliable transaction tracking inside strict lock conditions. |
| **Templating Layout Engine** | Embedded JavaScript (EJS) | High performance native rendering patterns delivering rapid HTML assembly without client-side hydration delays. |
| **Styling Architecture** | Tailwind CSS v3+ | Utility-first compilation layer to manage rapid design patterns while maintaining low payload footprints. |
| **Session Control** | Express-Session + Redis | In-memory storage abstraction allowing concurrent user session monitoring and stable state preservation. |
| **Security Layer** | Bcrypt + Passport.js | Industry standard hashing vectors combined with decoupled middleware access gates. |

---

## 3. Database Schema Blueprint (PostgreSQL DDL)

The data model uses explicit foreign key constraints to ensure absolute data integrity. User score inputs are bound through compound indices to optimize retrieval rates during high concurrent reads.

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    stage VARCHAR(30) NOT NULL, -- e.g., 'Group Stage', 'Round of 32', 'Final'
    home_team VARCHAR(50) NOT NULL,
    away_team VARCHAR(50) NOT NULL,
    home_team_flag VARCHAR(255),
    away_team_flag VARCHAR(255),
    kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
    home_score_actual INT DEFAULT NULL,
    away_score_actual INT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: predictions
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    home_score_predicted INT NOT NULL CHECK (home_score_predicted >= 0),
    away_score_predicted INT NOT NULL CHECK (away_score_predicted >= 0),
    points_awarded INT DEFAULT 0,
    is_calculated BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_match_prediction UNIQUE(user_id, match_id)
);

-- Table: leaderboards
CREATE TABLE leaderboards (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_points INT DEFAULT 0,
    exact_matches_count INT DEFAULT 0,
    outcome_matches_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Database Indices for Optimization
CREATE INDEX idx_matches_kickoff ON matches(kickoff_time);
CREATE INDEX idx_predictions_lookup ON predictions(user_id, match_id);
CREATE INDEX idx_leaderboards_ranking ON leaderboards(total_points DESC, exact_matches_count DESC);
```

---

## 4. Complete Directory Layout (MVC Architecture)

Below is the definitive repository roadmap. All functional assets conform to explicit structural domains.

```text
world-cup-quiniela/
├── config/                  # Subsystem Configurations
│   ├── db.js                # PostgreSQL connection initialization and pool management
│   └── passport.js          # Passport strategy setups for session authentication
├── controllers/             # Core Control Layer (Logic Processing)
│   ├── authController.js    # Session lifecycles: registration, login vectors, and termination
│   ├── matchController.js   # Match lists parsing, metadata sorting, and match status changes
│   ├── predictionController.js # Transactional validations for user score modifications
│   └── rankingController.js  # Global standing loops and live aggregation computations
├── models/                  # Data Layer (Database Interaction Operations)
│   ├── User.js              # User mutations and security credential validation queries
│   ├── Match.js             # Fixture operations, status mutations, and timeline scopes
│   ├── Prediction.js        # Prediction insertions, validation verification, and score updates
│   └── Ranking.js           # Score evaluation batch processing and global ranking datasets
├── public/                  # Public Injected Web Assets
│   ├── css/                 # Tailored styling builds generated via Tailwind CLI compile
│   ├── js/                  # Client-side form interceptors and reactive feedback updates
│   └── images/              # Verified structural layouts, design graphics, and nation flags
├── routes/                  # Express Routing Configurations
│   ├── authRoutes.js        # Maps access points for identity validation workflows
│   ├── matchRoutes.js       # Sets structural boundaries for match presentation contexts
│   ├── predictionRoutes.js  # Implements strict validation paths for score adjustments
│   └── rankingRoutes.js     # Exposes user performance matrix aggregations
├── views/                   # Presentation Layer (EJS Templates Localized in Spanish)
│   ├── partials/            # Component-Based Sub-layouts
│   │   ├── header.ejs       # Common application layout top bar and context indicators
│   │   └── footer.ejs       # Platform fine-print metrics and script references
│   ├── auth/                # Identity View Panels
│   │   ├── login.ejs        # Formulario de Ingreso de Usuario / Credenciales
│   │   └── register.ejs     # Formulario de Registro de Nuevo Participante
│   ├── dashboard.ejs        # Vista Principal del Usuario / Resumen de Puntos Recientes
│   ├── matches.ejs          # Cartelera de Partidos / Formulario de Pronósticos Activos
│   └── leaderboard.ejs      # Tabla General de Posiciones / Puntuación de la Comunidad
├── .env.example             # Clean environmental tracking mapping template
├── .gitignore               # System ignore controls for target environment states
├── package.json             # Manifest layout highlighting required dependencies
└── app.js                   # Operational Main Bootstrap Core Engine
```

---

## 5. System Logic Implementation Strategy

### 5.1. The Strict Time-Lock Algorithm
To protect system integrity, predictions are automatically locked when a match starts. The check is evaluated server-side at the route intercept level, overriding any browser or client-side tampering.

```javascript
// Path inside: controllers/predictionController.js
// Context language: English (System Execution Control)

const Match = require('../models/Match');
const Prediction = require('../models/Prediction');

exports.submitPrediction = async (req, res) => {
    const { matchId, homeScore, awayScore } = req.body;
    const userId = req.user.id; // Extracted via secure passport session middleware

    try {
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).render('error', { mensaje: 'El partido no existe.' });
        }

        // Evaluate Server-Side execution timestamp against official kickoff parameters
        const currentTime = new Date();
        const kickoffTime = new Date(match.kickoff_time);

        if (currentTime >= kickoffTime) {
            return res.status(400).render('matches', { 
                error: 'Error: El partido ya ha comenzado. Predicción bloqueada.',
                matches: await Match.getAllAvailableForUser(userId)
            });
        }

        // Process upsert transaction securely
        await Prediction.upsertUserPrediction(userId, matchId, homeScore, awayScore);
        
        res.redirect('/matches?status=success');
    } catch (error) {
        console.error(`Execution error inside prediction sub-routine: ${error.message}`);
        res.status(500).render('error', { mensaje: 'Error interno en el servidor.' });
    }
};
```

### 5.2. Standard Points Allocation Algorithm
When an administrator enters the final score for a match, a calculation job runs using the following rules:

1.  **Exact Guess Match (+3 Points):** Predictor correctly identified the scores of both competing entities (e.g., Prediction: `2 - 1`, Actual Score: `2 - 1`).
2.  **Outcome Direction Guess (+1 Point):** Predictor correctly identified the winner or a draw, but missed the exact score (e.g., Prediction: `1 - 0`, Actual Score: `3 - 1`).
3.  **Incorrect Guess (0 Points):** Prediction completely missed the match trajectory or result.

```javascript
// Path inside: controllers/rankingController.js
// Logic pattern: Evaluation Matrix Loop Execution

exports.processMatchScoresAndRankings = async (matchId, actualHomeScore, actualAwayScore) => {
    try {
        const allPredictions = await Prediction.findByMatchId(matchId);

        for (let prediction of allPredictions) {
            let allocatedPoints = 0;
            let type = 'miss';

            const isExactMatch = (prediction.home_score_predicted === actualHomeScore) && 
                                 (prediction.away_score_predicted === actualAwayScore);

            if (isExactMatch) {
                allocatedPoints = 3;
                type = 'exact';
            } else {
                const predictedSign = Math.sign(prediction.home_score_predicted - prediction.away_score_predicted);
                const actualSign = Math.sign(actualHomeScore - actualAwayScore);
                
                if (predictedSign === actualSign) {
                    allocatedPoints = 1;
                    type = 'outcome';
                }
            }

            // Write point tracking states to persistent data records
            await Prediction.updatePointsAwarded(prediction.id, allocatedPoints);
            await Ranking.aggregateUserStandings(prediction.user_id, allocatedPoints, type);
        }
        
        await Match.updateStatus(matchId, 'finished');
    } catch (error) {
        console.error(`Failed execution sequence inside calculation matrix: ${error.message}`);
        throw error;
    }
};
```

---

## 6. Bilingual Separation Matrix & Visual UI Strategy

### 6.1. Translation Protocol Configuration
All functional systems adhere to a strict separation of language layers. This isolates interface presentation code from processing workflows, eliminating localization bugs.

```text
[ Data / DB Layer ]       --> English Fields Only (e.g., home_score_predicted)
       │
[ Controller Layer ]      --> Parses datasets, manages logical business rules
       │
[ View Pipeline ]         --> Transforms attributes into localized interface nodes
       │
[ Client Browser UI ]     --> 100% Spanish Display ("Tabla de Posiciones", "Modificar")
```

### 6.2. UI Design Blueprint Example (EJS Template Structure)
The following template shows how clean English data objects safely render localized Spanish interfaces.

```html
<!-- Path inside: views/leaderboard.ejs -->
<!-- Layout Definition: Spanish Localization Framework for User Views -->

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabla de Clasificación General | Quiniela Mundial 2026</title>
    <link rel="stylesheet" href="/css/tailwind.css">
</head>
<body class="bg-gray-50 text-gray-900 font-sans">

    <!-- Global Application Navigation Bar Inclusion -->
    <%- include('partials/header') %>

    <main class="max-w-6xl mx-auto px-4 py-8">
        <header class="mb-8 border-b border-gray-200 pb-4">
            <h1 class="text-3xl font-extrabold text-blue-900 tracking-tight">Posiciones de la Quiniela</h1>
            <p class="text-sm text-gray-600 mt-1">Resultados actualizados en tiempo real según el puntaje de la FIFA.</p>
        </header>

        <!-- Dynamic Data Presentation Section -->
        <div class="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <table class="min-w-full divide-y divide-gray-200 text-left">
                <thead class="bg-blue-900 text-white text-xs uppercase font-semibold tracking-wider">
                    <tr>
                        <th scope="col" class="px-6 py-4 text-center">Puesto</th>
                        <th scope="col" class="px-6 py-4">Participante</th>
                        <th scope="col" class="px-6 py-4 text-center">Resultados Exactos (3 pts)</th>
                        <th scope="col" class="px-6 py-4 text-center">Aciertos Simples (1 pt)</th>
                        <th scope="col" class="px-6 py-4 class text-center">Puntos Totales</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm font-medium">
                    <% if (rankings && rankings.length > 0) { %>
                        <% rankings.forEach((row, index) => { %>
                            <tr class="hover:bg-gray-50 transition-colors duration-150">
                                <td class="px-6 py-4 whitespace-nowrap text-center font-bold text-gray-700">
                                    #<%= index + 1 %>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                                    <%= row.first_name %> <%= row.last_name %>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-emerald-600 font-semibold">
                                    <%= row.exact_matches_count %>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-amber-600 font-semibold">
                                    <%= row.outcome_matches_count %>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-base font-bold text-blue-900 bg-blue-50/50">
                                    <%= row.total_points %> pts
                                </td>
                            </tr>
                        <% }) %>
                    <% } else { %>
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-gray-500 font-normal">
                                No se registran puntuaciones en la base de datos actualmente. ¡Crea tus pronósticos!
                            </td>
                        </tr>
                    <% } %>
                </tbody>
            </table>
        </div>
    </main>

    <%- include('partials/footer') %>

</body>
</html>
```

---

## 7. Strategic Implementation Roadmap

```text
[ Phase 1: Database Setup ] ──> [ Phase 2: Core Auth ] ──> [ Phase 3: Time-Lock Logic ] ──> [ Phase 4: UI Engine ]
```

### Phase 1: Storage Infrastructure Setup (Weeks 1)
*   Deploy target PostgreSQL instances with specified tracking matrices.
*   Populate initial database tables with official fixture lists, timelines, and flag vectors.

### Phase 2: Authentication Framework Implementation (Week 2)
*   Integrate secure hashing filters to process entry workflows safely.
*   Enforce request context restrictions via secure router checkpoints.

### Phase 3: Business Logic Rules Deployment (Week 2-3)
*   Deploy time-lock filters to isolate operational inputs against late submissions.
*   Verify point allocation scripts across various match outcome scenarios.

### Phase 4: UI Component Delivery (Week 3)
*   Compile Tailwind stylesheet rules directly into clean, optimized production bundles.
*   Wire data layout contexts across all localization panels to complete user-facing views.

---

## 8. Panel de Administración - Quiniela Mundial 2026

### 8.1. Ficha de Diseño Visual
* **Distribución Espacial:** Basado en la estructura clásica de paneles de control (Barra lateral izquierda fija para navegación, sección superior de indicadores clave y cuadrícula inferior para listados de datos).
* **Fondo de Pantalla:** Basado en la imagen de un estadio con balón de fútbol (`stadium_bg.jpeg`). Cuenta con una capa de superposición (*overlay*) oscura de opacidad controlada (`bg-slate-950/80`) y desenfoque suave (`backdrop-blur-sm`) para garantizar legibilidad de textos y contraste de elementos.
* **Estética de Indicadores:** Tarjetas con un gradiente metalizado premium tipo oro pulido (`from-amber-300 via-yellow-500 to-amber-600`) emulando cartas de EA Sports FC, con texturas sutiles en los bordes y sombras densas.
* **Código e Idioma:** Lógica del controlador e identificadores en estricto inglés; textos de cara al administrador completamente localizados en español.

### 8.2. Código de la Vista (\`views/admin/dashboard.ejs\`)

\`\`\`html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración | Quiniela Mundial 2026</title>
    <link rel="stylesheet" href="/css/tailwind.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-cover bg-center bg-no-repeat bg-fixed font-sans min-h-screen relative" style="background-image: url('/images/stadium_bg.jpeg');">
    
    <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0"></div>

    <div class="flex h-screen relative z-10 overflow-hidden">

        <aside class="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between text-slate-300">
            <div>
                <div class="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/50">
                    <i class="fa-solid fa-trophy text-amber-500 text-xl"></i>
                    <span class="font-black tracking-wider text-white text-lg">Quiniela Admin</span>
                </div>

                <div class="p-5 flex items-center space-x-3 border-b border-slate-800/50">
                    <div class="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
                        AD
                    </div>
                    <div>
                        <p class="text-xs text-slate-400">Bienvenido,</p>
                        <p class="text-sm font-bold text-white">Administrador</p>
                    </div>
                </div>

                <nav class="p-4 space-y-2">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">General</p>
                    <a href="/admin/dashboard" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-md transition-all">
                        <i class="fa-solid fa-chart-pie w-5"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/admin/users" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all">
                        <i class="fa-solid fa-users w-5"></i>
                        <span>Usuarios</span>
                    </a>
                    <a href="/admin/matches" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all">
                        <i class="fa-solid fa-calendar-days w-5"></i>
                        <span>Partidos</span>
                    </a>
                    <a href="/admin/metrics" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all">
                        <i class="fa-solid fa-database w-5"></i>
                        <span>Métricas FIFA</span>
                    </a>
                </nav>
            </div>

            <div class="p-4 border-t border-slate-800 bg-slate-950/40">
                <a href="/logout" class="flex items-center space-x-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-semibold">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Cerrar Sesión</span>
                </a>
            </div>
        </aside>

        <main class="flex-1 flex flex-col overflow-y-auto">
            
            <header class="bg-slate-900/60 border-b border-slate-800 px-8 py-4 flex justify-between items-center backdrop-blur-md">
                <h1 class="text-xl font-extrabold text-white">Panel de Control General</h1>
                <div class="text-sm text-slate-400 font-medium">Mundial de Fútbol 2026</div>
            </header>

            <div class="p-8 space-y-8">
                
                <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div class="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-6 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between h-44">
                        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <p class="text-xs font-black uppercase tracking-wider text-amber-950/70">Usuarios Activos</p>
                                <h3 class="text-4xl font-black text-slate-950 mt-1"><%= metrics.totalUsers %></h3>
                            </div>
                            <div class="bg-slate-950/10 p-2.5 rounded-xl">
                                <i class="fa-solid fa-user-check text-amber-950 text-xl"></i>
                            </div>
                        </div>
                        <div class="text-xs font-bold text-amber-950/80 border-t border-amber-600/30 pt-3 relative z-10 flex items-center space-x-1">
                            <i class="fa-solid fa-arrow-trend-up"></i>
                            <span>+4% desde la última semana</span>
                        </div>
                    </div>

                    <div class="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-6 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between h-44">
                        <div class="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-transparent via-white to-transparent"></div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <p class="text-xs font-black uppercase tracking-wider text-amber-950/70">Predicciones Hechas</p>
                                <h3 class="text-4xl font-black text-slate-950 mt-1"><%= metrics.totalPredictions %></h3>
                            </div>
                            <div class="bg-slate-950/10 p-2.5 rounded-xl">
                                <i class="fa-solid fa-clipboard-list text-amber-950 text-xl"></i>
                            </div>
                        </div>
                        <div class="text-xs font-bold text-amber-950/80 border-t border-amber-600/30 pt-3 relative z-10 flex items-center space-x-1">
                            <i class="fa-solid fa-bolt"></i>
                            <span>92% de participación por partido</span>
                        </div>
                    </div>

                    <div class="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-6 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between h-44">
                        <div class="absolute inset-0 opacity-10">
                            <div class="w-full h-full" style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 10px 10px;"></div>
                        </div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <p class="text-xs font-black uppercase tracking-wider text-amber-950/70">Partidos Finalizados</p>
                                <h3 class="text-4xl font-black text-slate-950 mt-1"><%= metrics.finishedMatches %> / 104</h3>
                            </div>
                            <div class="bg-slate-950/10 p-2.5 rounded-xl">
                                <i class="fa-solid fa-stopwatch text-amber-950 text-xl"></i>
                            </div>
                        </div>
                        <div class="text-xs font-bold text-amber-950/80 border-t border-amber-600/30 pt-3 relative z-10 flex items-center space-x-1">
                            <i class="fa-solid fa-circle text-red-600 animate-pulse text-[8px] mr-1"></i>
                            <span>Puntajes calculados de forma automática</span>
                        </div>
                    </div>

                </section>

                <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div class="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-base font-bold text-white flex items-center space-x-2">
                                <i class="fa-solid fa-ranking-star text-amber-500"></i>
                                <span>Control de Puntuaciones de Usuarios</span>
                            </h3>
                            <span class="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 font-semibold">Top Activos</span>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm text-slate-300">
                                <thead class="text-xs uppercase text-slate-400 bg-slate-950/50 rounded-lg">
                                    <tr>
                                        <th scope="col" class="px-4 py-3 rounded-l-lg">Usuario</th>
                                        <th scope="col" class="px-4 py-3 text-center">Exactas (3pts)</th>
                                        <th scope="col" class="px-4 py-3 text-center">Simples (1pt)</th>
                                        <th scope="col" class="px-4 py-3 text-center">Puntos</th>
                                        <th scope="col" class="px-4 py-3 text-right rounded-r-lg">Acción</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 font-medium">
                                    <% usersList.forEach(user => { %>
                                        <tr class="hover:bg-slate-800/40 transition-colors">
                                            <td class="px-4 py-3.5 font-bold text-white"><%= user.first_name %> <%= user.last_name %></td>
                                            <td class="px-4 py-3.5 text-center text-emerald-400"><%= user.exact_matches_count %></td>
                                            <td class="px-4 py-3.5 text-center text-amber-400"><%= user.outcome_matches_count %></td>
                                            <td class="px-4 py-3.5 text-center font-black text-blue-400 text-base bg-blue-500/5"><%= user.total_points %> pts</td>
                                            <td class="px-4 py-3.5 text-right">
                                                <a href="/admin/users/edit/<%= user.user_id %>" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all">
                                                    Gestionar
                                                </a>
                                            </td>
                                        </tr>
                                    <% }) %>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-base font-bold text-white flex items-center space-x-2">
                                    <i class="fa-solid fa-circle-play text-emerald-500"></i>
                                    <span>Monitoreo de Partidos</span>
                                </h3>
                            </div>
                            <div class="space-y-4">
                                <% criticalMatches.forEach(match => { %>
                                    <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                                        <div class="space-y-1">
                                            <p class="text-xs font-bold text-slate-400"><%= match.stage %></p>
                                            <p class="text-sm font-black text-white"><%= match.home_team %> vs <%= match.away_team %></p>
                                        </div>
                                        <div class="text-right">
                                            <% if (match.status === 'live') { %>
                                                <span class="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-black animate-pulse uppercase">En Vivo</span>
                                            <% } else { %>
                                                <span class="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">Listo</span>
                                            <% } %>
                                            <p class="text-[10px] text-slate-500 mt-1">📅 <%= new Date(match.kickoff_time).toLocaleDateString('es-VE', {day:'2-digit', month:'short'}) %></p>
                                        </div>
                                    </div>
                                <% }) %>
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-slate-800">
                            <a href="/admin/matches/center" class="block text-center text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-md transition-all">
                                Ingresar Resultados Oficiales
                            </a>
                        </div>
                    </div>

                </section>

            </div>
        </main>
    </div>
</body>
</html>

---

## 9. Interfaz de Usuario - Cartelera de Partidos (Estilo Oscuro Premium)

### 9.1. Concepto y Ficha de Diseño Visual
* **Inspiración Estética:** Basado en un concepto minimalista de alta gama tomado de tarjetas de presentación oscuras de alta fidelidad (`image_d443c4.png`). Utiliza un contraste marcado entre un fondo oscuro profundo y elementos estructurales limpios en color blanco y gris tiza.
* **Geometría de Tarjetas:** En lugar de curvas pronunciadas, se implementan esquinas levemente redondeadas utilizando la clase `rounded-md` (radio de curvatura de $4\text{px}$) para mantener una línea gráfica sobria, técnica y corporativa.
* **Efecto de Fondo Dinámico (Fondo en Bucle):** Utiliza la imagen oficial del estadio (`stadium_bg.jpeg`) con una opacidad reducida (`opacity-25`) y una máscara de gradiente oscuro. Se aplica el efecto *Ken Burns* mediante CSS puro para animar un paneo y zoom suave en bucle infinito, logrando dinamismo sin consumir recursos excesivos del navegador.
* **Separación de Idiomas:** Toda la estructura lógica, variables del bucle EJS y clases están escritas estrictamente en inglés (buenas prácticas), mientras que las etiquetas, fechas localizadas y mensajes informativos se muestran 100% en español.
