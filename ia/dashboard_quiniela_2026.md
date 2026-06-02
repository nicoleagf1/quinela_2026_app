# Dashboard Principal del Usuario (Home)

## 10. Dashboard Principal del Participante

### 10.1 Objetivo

El Dashboard Principal constituye el punto de entrada para todos los participantes registrados en la Quiniela Mundial 2026.

Su propósito es centralizar la información más relevante para el usuario:

- Estado actual de la competición.
- Posición dentro de la tabla general.
- Próximos partidos disponibles para pronosticar.
- Estadísticas personales.
- Últimos resultados oficiales.
- Accesos rápidos a los módulos principales.

La pantalla está diseñada para generar una experiencia visual inmersiva inspirada en plataformas deportivas modernas como FIFA, EA Sports FC y SofaScore.

---

## 10.2 Principios de Diseño

### Experiencia Deportiva Premium

- Fondo de estadio iluminado.
- Imagen destacada del trofeo FIFA.
- Paleta oscura basada en azul profundo.
- Acentos dorados inspirados en la Copa del Mundo.
- Tarjetas con efecto Glassmorphism.
- Sombras suaves y profundidad visual.

### Jerarquía Visual

1. Hero Principal
2. Métricas Personales
3. Próximos Partidos
4. Tabla General
5. Estadísticas
6. Resultados Recientes

---

## 10.3 Distribución General

```text
Navbar Principal
Hero Section
Tarjetas de Resumen
Próximos Partidos
Tabla General
Estadísticas
Últimos Resultados
Footer
```

## 10.4 Hero Section

Contiene:

- Mensaje personalizado.
- Resumen motivacional.
- Acciones rápidas.
- Imagen de fondo del estadio.
- Trofeo FIFA 2026.

Botones:

- Ver Partidos → `/matches`
- Tabla General → `/leaderboard`

---

## 10.5 Tarjetas de Métricas

- Partidos Totales: 104
- Mis Puntos: 125 pts
- Mi Posición: #3
- Participantes: 28

---

## 10.6 Próximos Partidos

Fuente de datos:

```sql
SELECT *
FROM matches
WHERE status = 'scheduled'
ORDER BY kickoff_time ASC
LIMIT 5;
```

Información:

- Equipo local
- Equipo visitante
- Banderas
- Fecha y hora
- Estadio

Acción:

`Pronosticar`

---

## 10.7 Tabla General Reducida

```sql
SELECT user_id, total_points
FROM leaderboards
ORDER BY total_points DESC
LIMIT 5;
```

Información:

- Posición
- Participante
- Puntos

El usuario actual debe aparecer resaltado.

---

## 10.8 Estadísticas Personales

Porcentaje de aciertos:

```text
(aciertos / partidos_finalizados) * 100
```

Pronósticos realizados:

```text
(predicciones_realizadas / 104)
```

Representación mediante barras de progreso.

---

## 10.9 Últimos Resultados

```sql
SELECT *
FROM matches
WHERE status = 'finished'
ORDER BY updated_at DESC
LIMIT 5;
```

Visualización:

- España 2 - 1 Francia
- Brasil 3 - 0 Japón
- Argentina 1 - 1 Alemania

---

## 10.10 Arquitectura MVC

### Controller

`controllers/dashboardController.js`

### Model

`models/Dashboard.js`

### View

`views/dashboard.ejs`

### Route

```javascript
router.get('/dashboard', ensureAuthenticated, dashboardController.index);
```

---

## 10.11 Dashboard Controller

```javascript
exports.index = async (req, res) => {
    const userId = req.user.id;

    const stats = await Dashboard.getUserStats(userId);
    const upcomingMatches = await Match.getUpcomingMatches(5);
    const rankings = await Ranking.getTopFive();
    const recentResults = await Match.getRecentResults(5);

    res.render('dashboard', {
        user: req.user,
        stats,
        upcomingMatches,
        rankings,
        recentResults
    });
};
```

---

## 10.12 Paleta de Colores

| Elemento | Color |
|-----------|---------|
| Fondo Principal | #020617 |
| Fondo Secundario | #0F172A |
| Azul FIFA | #2563EB |
| Dorado Mundial | #F59E0B |
| Verde Estadísticas | #10B981 |
| Texto Principal | #FFFFFF |
| Texto Secundario | #CBD5E1 |

---

## 10.13 Recursos Gráficos

```text
/images/stadium_bg.jpeg
/images/worldcup_trophy.png
/images/flags/
/images/logo.png
```

---

## 10.14 Resultado Esperado

Una experiencia visual moderna inspirada en plataformas deportivas profesionales, permitiendo al usuario visualizar rápidamente:

- Posición actual.
- Puntos acumulados.
- Próximos partidos.
- Líderes de la competición.
- Rendimiento general.
