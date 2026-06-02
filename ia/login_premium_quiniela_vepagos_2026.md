# Login Premium - Quiniela VEPAGOS Mundial de Fútbol 2026

## Objetivo

Diseñar una pantalla de inicio de sesión moderna, deportiva y profesional, alineada con toda la identidad visual del proyecto Quiniela VEPAGOS Mundial de Fútbol 2026.

La pantalla debe transmitir:

- Emoción deportiva
- Profesionalismo
- Tecnología
- Exclusividad
- Ambiente mundialista

---

# Concepto Visual

Inspiración:

- FIFA World Cup
- UEFA Champions League
- EA Sports FC
- Plataformas deportivas premium

La experiencia debe sentirse como el acceso oficial a una competición mundial.

---

# Branding Principal

## Título

```text
🏆
Quiniela VEPAGOS
Mundial de Fútbol 2026
```

### Estructura

Primera línea:

```text
🏆
```

Segunda línea:

```text
Quiniela VEPAGOS
```

Tercera línea:

```text
Mundial de Fútbol 2026
```

Eliminar completamente el texto:

```text
by VEPAGOS
```

porque genera redundancia visual.

---

# Fondo Principal

## Imagen

Utilizar una imagen inspirada en:

- Estadio nocturno
- Iluminación profesional
- Ambiente mundialista
- Jugador realizando una jugada espectacular

Referencia:

- Silueta deportiva
- Luces de estadio desenfocadas
- Profundidad cinematográfica

---

# Overlay

Aplicar una capa oscura:

```css
background: rgba(2,6,23,.75);
```

o

```css
background: linear-gradient(
180deg,
rgba(2,6,23,.65),
rgba(2,6,23,.85)
);
```

---

# Paleta de Colores

| Elemento | Color |
|-----------|---------|
| Azul Principal | #2563EB |
| Azul Oscuro | #1E3A8A |
| Fondo | #020617 |
| Dorado | #F59E0B |
| Blanco | #FFFFFF |
| Gris Claro | #CBD5E1 |
| Verde VEPAGOS | #22C55E |

---

# Distribución Desktop

```text
┌───────────────────────────────────────────────┐
│                 LOGO/TÍTULO                   │
│                                               │
│           Quiniela VEPAGOS                    │
│         Mundial de Fútbol 2026                │
│                                               │
│              Card de Login                    │
│                                               │
└───────────────────────────────────────────────┘
```

Todo centrado vertical y horizontalmente.

---

# Card de Login

## Dimensiones

```css
width: 480px;
max-width: 95%;
```

---

## Estilo

Glassmorphism premium:

```css
background: rgba(15,23,42,.75);
backdrop-filter: blur(14px);
border: 1px solid rgba(255,255,255,.08);
border-radius: 24px;
```

---

# Campos

## Correo Electrónico

Icono:

```text
✉️
```

Placeholder:

```text
Ingresa tu correo electrónico
```

---

## Contraseña

Icono:

```text
🔒
```

Placeholder:

```text
Ingresa tu contraseña
```

---

# Botón Principal

Texto:

```text
Ingresar
```

Estilo:

```css
background:#2563EB;
```

Hover:

```css
background:#1D4ED8;
transform:translateY(-2px);
```

---

# Acciones Secundarias

Debajo del formulario:

```text
¿Olvidaste tu contraseña?
```

```text
¿No tienes cuenta? Regístrate
```

---

# Efectos Visuales

## Glow Azul

```css
box-shadow:
0 0 20px rgba(37,99,235,.35);
```

## Glow Dorado

```css
box-shadow:
0 0 25px rgba(245,158,11,.30);
```

---

# Responsive

## Mobile

- Logo reducido
- Card al 95%
- Texto centrado
- Botones full width

## Tablet

- Card 500px
- Fondo adaptativo

## Desktop

- Experiencia completa
- Fondo cinematográfico

---

# Estructura de Archivos

```text
views/
└── auth/
    └── login.ejs

public/
├── css/
│   └── login.css
├── img/
│   ├── stadium-login.jpg
│   └── vepagos-logo.png
```

---

# Resultado Esperado

Una pantalla de acceso premium, elegante y moderna, totalmente integrada con la identidad visual de Quiniela VEPAGOS Mundial de Fútbol 2026, utilizando un fondo deportivo cinematográfico, branding destacado y una experiencia de usuario de nivel profesional.
