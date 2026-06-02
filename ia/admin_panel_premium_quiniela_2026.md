# Panel Administrativo Premium - Quiniela Mundial 2026

## Objetivo

Rediseñar completamente el panel administrativo para alinearlo con la identidad visual premium del proyecto Quiniela Mundial 2026.

Inspiración visual:

- FIFA World Cup
- EA Sports FC
- UEFA Champions League
- SofaScore Admin
- Dashboards deportivos modernos

---

# Concepto General

El panel debe transmitir:

- Control total del torneo
- Tecnología
- Profesionalismo
- Competencia deportiva
- Experiencia premium

---

# Paleta de Colores

| Elemento | Color |
|-----------|---------|
| Fondo Principal | #020617 |
| Fondo Secundario | #0F172A |
| Azul FIFA | #2563EB |
| Azul Oscuro | #1E3A8A |
| Dorado Mundial | #F59E0B |
| Verde Éxito | #10B981 |
| Rojo Alertas | #EF4444 |
| Blanco | #FFFFFF |
| Gris Texto | #CBD5E1 |

---

# Layout General

```text
┌─────────────────────────────────────┐
│ Sidebar Premium                     │
├─────────────────────────────────────┤
│ Header Administrativo               │
├─────────────────────────────────────┤
│ KPIs                                │
├─────────────────────────────────────┤
│ Actividad Reciente                  │
│ Próximos Partidos                   │
├─────────────────────────────────────┤
│ Gestión de Usuarios                 │
├─────────────────────────────────────┤
│ Centro de Marcadores                │
└─────────────────────────────────────┘
```

---

# Sidebar Premium

## Características

- Fondo azul oscuro degradado.
- Logo de la Quiniela.
- Avatar administrador.
- Menú flotante con iconos.
- Animaciones hover.

## Módulos

- Dashboard
- Usuarios
- Partidos
- Posiciones
- Marcadores
- Configuración
- Cerrar Sesión

---

# Hero Administrativo

## Información

Mostrar:

- Mundial de Fútbol 2026
- Fecha actual
- Estado del torneo
- Total de participantes

## Fondo

Estadio desenfocado con overlay oscuro.

---

# KPIs Principales

## Usuarios Registrados

```text
1
```

## Pronósticos Realizados

```text
2
```

## Partidos Finalizados

```text
0 / 104
```

## Exactos Acumulados

```text
0
```

## Participación General

```text
92%
```

Cada tarjeta debe incluir:

- Icono
- Indicador visual
- Tendencia
- Glow azul o dorado

---

# Centro de Monitoreo

## Próximos Partidos

Mostrar:

- Equipos
- Grupo
- Fecha
- Estado

Acciones:

- Editar
- Ingresar Resultado

---

# Gestión de Usuarios

## Tabla Premium

Columnas:

- Nombre
- Correo
- Rol
- Fecha Registro
- Estado
- Acción

## Acciones

- Editar
- Bloquear
- Restablecer Contraseña

---

# Gestión de Partidos

## Tabla

- ID
- Fase
- Equipos
- Fecha
- Estado
- Resultado

## Estados

- Programado
- En Juego
- Finalizado

---

# Centro de Marcadores

## Tarjetas de Resultado

Cada partido debe mostrar:

- Equipo Local
- Equipo Visitante
- Marcador
- Hora
- Grupo

Botón:

```text
Guardar Resultado Oficial
```

---

# Tabla de Posiciones

## Ranking General

Columnas:

- Posición
- Usuario
- Exactos
- Simples
- Total

## Podio

🥇 Primer Lugar

🥈 Segundo Lugar

🥉 Tercer Lugar

Con resaltado especial.

---

# Efectos Visuales

## Glassmorphism

```css
background: rgba(15,23,42,.75);
backdrop-filter: blur(12px);
```

## Hover

```css
transform: translateY(-3px);
```

## Glow Azul

```css
box-shadow: 0 0 20px rgba(37,99,235,.35);
```

## Glow Dorado

```css
box-shadow: 0 0 25px rgba(245,158,11,.35);
```

---

# Responsive Design

## Desktop

≥ 1280px

Sidebar expandido.

## Tablet

768px - 1279px

Sidebar compacto.

## Mobile

≤ 767px

Menú hamburguesa.

KPIs en una sola columna.

---

# Arquitectura

## Vistas

```text
views/admin/dashboard.ejs
views/admin/users.ejs
views/admin/matches.ejs
views/admin/leaderboard.ejs
views/admin/results-center.ejs
```

## Controladores

```text
controllers/adminDashboardController.js
controllers/adminUsersController.js
controllers/adminMatchesController.js
controllers/adminResultsController.js
```

---

# Resultado Esperado

Un panel administrativo de nivel profesional, visualmente coherente con el resto del proyecto Quiniela Mundial 2026, con estética deportiva moderna, métricas claras y herramientas eficientes para la administración completa del torneo.
