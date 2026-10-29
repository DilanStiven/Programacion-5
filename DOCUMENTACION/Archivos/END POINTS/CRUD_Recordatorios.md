# CRUD de recordatorios

La aplicación de ejemplo está disponible en `studentFlow_front`: inicia el backend y el frontend, y abre `http://127.0.0.1:5500`.

## Alcance del modelo

`recordatorio` tiene los campos `id_recordatorio`, `id_tarea`, `mensaje`, `fecha_hora`, `canal`, `leido` y `created_at`. Cada recordatorio pertenece a una tarea; la tarea pertenece a una materia, y la materia identifica al usuario propietario.

Las consultas unen `recordatorio`, `tarea` y `materia` para mostrar el título de la tarea, la fecha de entrega y la materia. La identidad se toma de `request.user.id`, que en este proyecto sigue siendo temporalmente el usuario `1`. Las operaciones de escritura solo insertan, actualizan o eliminan filas de `recordatorio`; `tarea` y `materia` se consultan únicamente para validar propiedad y presentar contexto.

## Rutas

Todas las rutas parten de `/api/v1/recordatorios`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Lista recordatorios del usuario con filtros y paginación. |
| GET | `/:id` | Consulta un recordatorio propio. |
| POST | `/` | Crea un recordatorio asociado a una tarea propia. |
| PUT | `/:id` | Reemplaza los campos editables del recordatorio. |
| PATCH | `/:id` | Actualiza solo los campos enviados. |
| DELETE | `/:id` | Elimina únicamente el recordatorio. Responde `204`. |

El listado admite `search` (mensaje, título de tarea o nombre de materia), `leido`, `canal` (`in_app` o `email`), `tareaId`, `page`, `limit` (1–100), `sort` y `order` (`asc`/`desc`). La respuesta mantiene el formato `{ success, data, meta }`.

## Ejemplos

Crear:

```http
POST /api/v1/recordatorios
Content-Type: application/json
```

```json
{
  "idTarea": 1,
  "mensaje": "Revisar la entrega de la tarea",
  "fechaHora": "2026-10-30T09:00",
  "canal": "in_app",
  "leido": false
}
```

La fecha y hora se normaliza al formato SQL `YYYY-MM-DD HH:mm:ss`. `idTarea` debe pertenecer al usuario actual; de lo contrario, la API responde `404`. Los IDs del ejemplo corresponden al seed y pueden variar según la base de datos configurada.

El objeto devuelto incluye los campos del recordatorio en camelCase y el contexto `tareaTitulo`, `tareaFechaEntrega`, `materiaId`, `materiaNombre` y `materiaCodigo`. La colección vacía se devuelve como `data: []`.

## Pruebas

Desde cada proyecto:

```powershell
Set-Location studentFlow_back
npm test

Set-Location ..\studentFlow_front
npm test
```

Las pruebas usan dobles de `pool.execute` y de `fetch`; no requieren conexión a MySQL y no cambian datos.
