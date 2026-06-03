# Product Requirements Document (PRD) - Estructura de Base de Datos

## 1. Resumen Analítico
La base de datos de **Quiniela VE PAGOS Mundial 2026** está construida sobre un motor relacional transaccional (**PostgreSQL**), diseñada con el propósito de asegurar la integridad de las predicciones de los usuarios y permitir el cálculo rápido de métricas analíticas. Su arquitectura garantiza consistencia (ACID), soporte nativo para claves foráneas y cascadas de eliminación, y un histórico de eventos rastreables.

Adicionalmente, el sistema posee una capa *fallback* (Mock DB en memoria JSON) como medida de contingencia ante caídas del motor principal, aunque este documento se enfoca en la estructura oficial relacional.

## 2. Entidades Principales (Tablas)

La estructura cuenta con 5 tablas core interconectadas:

### 2.1 Tabla: `users`
Maneja la identidad, autenticación y autorización.
- **`id`** (`UUID`, *Primary Key*): Generado automáticamente (`uuid_generate_v4()`).
- **`first_name`** (`VARCHAR(50)`): Nombre del usuario.
- **`last_name`** (`VARCHAR(50)`): Apellido.
- **`email`** (`VARCHAR(100)`, *Unique*): Normalizado a minúsculas, usado para el login.
- **`password_hash`** (`VARCHAR(255)`): Contraseña cifrada con Bcrypt.
- **`role`** (`VARCHAR(20)`): Determina los permisos (`user` o `admin`).
- **`created_at`** (`TIMESTAMP`): Fecha de registro.

### 2.2 Tabla: `matches`
Catálogo oficial de todos los partidos del mundial.
- **`id`** (`SERIAL`, *Primary Key*): Identificador autoincremental del partido.
- **`stage`** (`VARCHAR(30)`): Fase del torneo (Ej: Fase de Grupos, 8vos, Final).
- **`home_team`** & **`away_team`** (`VARCHAR(50)`): Nombres de las selecciones.
- **`home_team_flag`** & **`away_team_flag`** (`VARCHAR(255)`): *Legacy*, se apoya actualmente en utilidades locales para los ISOs.
- **`kickoff_time`** (`TIMESTAMP`): Fecha y hora oficial del partido (vital para bloquear pronósticos).
- **`home_score_actual`** & **`away_score_actual`** (`INT`): Marcador oficial, inicialmente nulo.
- **`status`** (`VARCHAR(20)`): `scheduled`, `live`, o `finished`.
- **`updated_at`** (`TIMESTAMP`): Última actualización.

### 2.3 Tabla: `predictions`
Almacena el core transaccional del negocio: los pronósticos de los usuarios.
- **`id`** (`UUID`, *Primary Key*).
- **`user_id`** (`UUID`, *Foreign Key*): Referencia a `users(id)`.
- **`match_id`** (`INT`, *Foreign Key*): Referencia a `matches(id)`.
- **`home_score_predicted`** & **`away_score_predicted`** (`INT`): Marcadores ingresados por el usuario.
- **`points_awarded`** (`INT`): Puntos ganados (0, 1 o 3).
- **`is_calculated`** (`BOOLEAN`): Bandera para indicar si ya se evaluó contra el resultado oficial.
- **`updated_at`** (`TIMESTAMP`).
- *Constraints*: `UNIQUE(user_id, match_id)` garantiza que un usuario solo pueda tener un pronóstico activo por partido.

### 2.4 Tabla: `leaderboards`
Mesa de agregación para la analítica de rendimiento (clasificación).
- **`user_id`** (`UUID`, *Primary Key, Foreign Key*): Referencia 1:1 con `users(id)`.
- **`total_points`** (`INT`): Suma acumulada de puntos.
- **`exact_matches_count`** (`INT`): Cantidad de veces que acertó el marcador 100% exacto (Criterio de desempate #1).
- **`outcome_matches_count`** (`INT`): Cantidad de veces que solo acertó el ganador/empate.
- **`updated_at`** (`TIMESTAMP`).

### 2.5 Tabla: `auditoria`
Tabla inmutable tipo *Append-Only* (log) para el control y trazabilidad de acciones.
- **`id`** (`SERIAL`, *Primary Key*).
- **`user_id`** (`UUID`, *Foreign Key*): Quién hizo la acción.
- **`match_id`** (`INT`, *Foreign Key*): Sobre qué partido se hizo.
- **`home_score`** & **`away_score`** (`INT`): Qué valores se registraron.
- **`action_type`** (`VARCHAR(50)`): Tipo de evento (por defecto `UPSERT`).
- **`created_at`** (`TIMESTAMP`): Fecha y hora exacta del movimiento (vital para resolución de disputas).

---

## 3. Topología de Relaciones (MER)

- Un **Usuario** (`users`) puede tener múltiples **Pronósticos** (`predictions`) -> Relación 1:N.
- Un **Usuario** (`users`) tiene exactamente un registro en el **Ranking** (`leaderboards`) -> Relación 1:1.
- Un **Partido** (`matches`) tiene múltiples **Pronósticos** (`predictions`) -> Relación 1:N.
- Un **Usuario** y un **Partido** generan múltiples logs de **Auditoría** (`auditoria`) -> Relación N:M.

*Eliminación en Cascada (`ON DELETE CASCADE`):* Si se elimina un usuario o un partido (vía Admin), todos sus pronósticos y su posición en la tabla se destruyen automáticamente para mantener consistencia estricta.

---

## 4. Estrategia Analítica y de Rendimiento (Optimizaciones)

Para soportar concurrencia alta (miles de usuarios consultando la tabla y sus puntos simultáneamente) se establecieron los siguientes índices:

1. **`idx_matches_kickoff`**: Acelera drásticamente los queries que filtran partidos abiertos/cerrados dependiendo de la fecha actual vs `kickoff_time`.
2. **`idx_predictions_lookup`**: Índice compuesto en `(user_id, match_id)` para hacer búsquedas `O(1)` cuando un usuario guarda su quiniela y el sistema revisa si debe hacer *INSERT* o *UPDATE*.
3. **`idx_leaderboards_ranking`**: Índice compuesto descendente `(total_points DESC, exact_matches_count DESC)`. Esta es la consulta más pesada de la app (el Dashboard de Posiciones). Gracias a este índice, la BBDD no necesita hacer *Sorts* en memoria; simplemente devuelve el índice pre-ordenado instantáneamente.
