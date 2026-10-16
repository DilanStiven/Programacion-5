# Consulta de eventos por materia

## Endpoint

```http
GET /api/v1/materias/{id}/eventos
```

Obtiene los eventos asociados a una materia que pertenece al usuario de la solicitud.

### Parámetro de ruta

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| `id` | Entero positivo | Identificador de la materia. |

El usuario se obtiene de `request.user.id`; no se envía como parámetro de URL ni como dato del cuerpo.

## Respuesta exitosa

Código HTTP: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "materiaId": 1,
      "titulo": "Clase de Algoritmos",
      "descripcion": "Sesión presencial sobre árboles y recorridos.",
      "fecha": "2026-08-20T05:00:00.000Z",
      "horaInicio": "08:00:00",
      "horaFin": "10:00:00",
      "tipo": "clase",
      "createdAt": "2026-09-04T17:26:49.000Z",
      "updatedAt": "2026-09-04T17:26:49.000Z"
    }
  ]
}
```

Si la materia pertenece al usuario pero no tiene eventos, `data` es un arreglo vacío.

## Campos del evento

| Campo de respuesta | Columna de base de datos |
| --- | --- |
| `id` | `evento.id_evento` |
| `materiaId` | `evento.id_materia` |
| `titulo` | `evento.titulo` |
| `descripcion` | `evento.descripcion` |
| `fecha` | `evento.fecha` |
| `horaInicio` | `evento.hora_inicio` |
| `horaFin` | `evento.hora_fin` |
| `tipo` | `evento.tipo` |
| `createdAt` | `evento.created_at` |
| `updatedAt` | `evento.updated_at` |

La fecha puede serializarse como fecha ISO en UTC. Las horas se devuelven en formato `HH:MM:SS`.

## Acceso y validaciones

- El identificador de materia debe ser un entero positivo; valores inválidos generan un error HTTP 400.
- La materia debe existir y pertenecer al usuario actual. Si no existe para ese usuario, la API responde HTTP 404.
- La consulta filtra por el identificador de materia y el propietario de la materia.
- El middleware temporal del proyecto asigna `request.user.id = 1`; por tanto, mientras esté activo, solo se consultan materias de ese usuario.

## Consulta utilizada

```sql
SELECT
  e.id_evento AS id,
  e.id_materia AS materiaId,
  e.titulo,
  e.descripcion,
  e.fecha,
  e.hora_inicio AS horaInicio,
  e.hora_fin AS horaFin,
  e.tipo,
  e.created_at AS createdAt,
  e.updated_at AS updatedAt
FROM evento e
INNER JOIN materia m ON m.id_materia = e.id_materia
WHERE m.id_materia = ? AND m.id_usuario = ?;
```

Los signos `?` corresponden a parámetros enlazados mediante `pool.execute`, en este orden: `[id, userId]`.

## Prueba manual

Con la API iniciada y la base de datos configurada, ejecutar:

```powershell
curl.exe -i http://localhost:3000/api/v1/materias/1/eventos
```

Reemplaza `1` por el ID de una materia del usuario autenticado. Un resultado HTTP 200 confirma la consulta; una materia sin eventos debe devolver `"data": []`.
