
# 11. Módulo de Posiciones (Leaderboard Premium)

## 11.1 Objetivo

El módulo de Posiciones tiene como finalidad mostrar de forma clara, atractiva y competitiva el rendimiento de todos los participantes de la Quiniela Mundial 2026.

La pantalla reemplaza la tabla tradicional por una experiencia visual inspirada en plataformas deportivas profesionales, manteniendo la identidad visual basada en:

- Azul FIFA
- Dorado Mundial
- Fondo de estadio
- Efectos Glassmorphism
- Componentes oscuros de alto contraste

---

# 11.2 Concepto de Diseño

## Inspiración

- FIFA World Cup
- EA Sports FC
- SofaScore
- Tabla LPF

## Objetivo Visual

Transmitir:

- Competencia
- Prestigio
- Jerarquía
- Rendimiento

---

# 11.3 Estructura General

```text
Navbar Principal
Hero Posiciones
Tabla Premium de Clasificación
Footer
```

---

# 11.4 Fondo de Pantalla

## Imagen

```text
/images/stadium_bg.jpeg
```

## CSS

```css
background-image: url('/images/stadium_bg.jpeg');
background-size: cover;
background-position: center;
background-attachment: fixed;
```

## Overlay

```css
background: rgba(2, 6, 23, 0.88);
```

---

# 11.5 Encabezado

## Título

🏆 Posiciones de la Quiniela

## Subtítulo

Resultados actualizados en tiempo real según el puntaje de la FIFA.

## Información adicional

Última actualización:
25/06/2026 - 15:30

---

# 11.6 Tabla de Clasificación

| Campo | Descripción |
|---------|-------------|
| Puesto | Posición actual |
| Participante | Nombre del usuario |
| Exactos | Aciertos exactos (3 pts) |
| Simples | Resultado acertado (1 pt) |
| Total | Puntos acumulados |

---

# 11.7 Podio

## Primer Lugar

Color:

```css
#FBBF24
```

Características:

- Borde dorado
- Glow dorado
- Ícono de trofeo

## Segundo Lugar

```css
#CBD5E1
```

## Tercer Lugar

```css
#CD7F32
```

---

# 11.8 Tarjetas de Participantes

```css
background: rgba(15,23,42,.75);
backdrop-filter: blur(8px);
border: 1px solid rgba(255,255,255,.05);
```

## Hover

```css
transform: translateY(-2px);

box-shadow:
0 0 15px rgba(37,99,235,.25);
```

---

# 11.9 Avatar Automático

Basado en la primera letra del usuario.

```css
width: 42px;
height: 42px;
border-radius: 50%;
background: #2563EB;
color: white;
font-weight: bold;
```

---

# 11.10 Consulta SQL

```sql
SELECT
    u.id,
    u.first_name,
    u.last_name,
    l.total_points,
    l.exact_matches_count,
    l.outcome_matches_count
FROM leaderboards l
INNER JOIN users u
ON u.id = l.user_id
ORDER BY
    l.total_points DESC,
    l.exact_matches_count DESC;
```

---

# 11.11 Controller

Archivo:

```text
controllers/rankingController.js
```

```javascript
exports.getLeaderboard = async (req, res) => {

    const rankings =
        await Ranking.getLeaderboard();

    res.render(
        'leaderboard',
        {
            rankings
        }
    );
};
```

---

# 11.12 Vista

```text
views/leaderboard.ejs
```

---

# 11.13 Paleta de Colores

| Elemento | Color |
|-----------|---------|
| Fondo Principal | #020617 |
| Fondo Secundario | #0F172A |
| Azul FIFA | #2563EB |
| Azul Oscuro | #1E3A8A |
| Dorado Mundial | #F59E0B |
| Verde Exactos | #10B981 |
| Naranja Simples | #F97316 |
| Blanco | #FFFFFF |

---

# 11.14 Responsive Design

## Desktop

≥ 1280px

## Tablet

768px - 1279px

## Mobile

≤ 767px

Cada participante se muestra como una tarjeta vertical.

---

# 11.15 Animaciones

## Entrada

```css
fade-up
```

## Hover

```css
scale(1.01)
```

## Podio

```css
glow-animation
```
