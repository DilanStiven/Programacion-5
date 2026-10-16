# Endpoint GET de eventos por materia

## Objetivo

Implementar `GET /api/v1/materias/:id/eventos` en el backend de StudentFlow para consultar los eventos de una materia que pertenece al usuario de la solicitud.

- `id`: identificador de materia recibido en `request.params.id`.
- `userId`: identificador del usuario obtenido de `request.user.id`.
- Respuesta exitosa: HTTP 200 con `{ "success": true, "data": [...] }`.
- Si la materia pertenece al usuario, pero no tiene eventos, `data` será `[]`.
- Si la materia no existe o pertenece a otro usuario, el servicio responde con HTTP 404, siguiendo el patrón actual del servicio de tareas.

El endpoint ya está implementado en los cuatro archivos descritos a continuación. Los fragmentos muestran el código de la solución y cómo se conecta cada capa; son adiciones al código existente, no reemplazos de otras funciones.

## Comparación con el endpoint de tareas

El documento de referencia explica el mismo flujo de cuatro capas, pero algunos nombres y comportamientos descritos ahí no coinciden con el código actual del proyecto. La implementación existente usa:

| Capa | Tareas existente | Eventos |
| --- | --- | --- |
| Ruta | `GET /:id/tareas` → `getMateriasTareas` | `GET /:id/eventos` → `listEventosByMateria` |
| Controlador | `getMateriasTareas` | `listEventosByMateria` |
| Servicio | `listTareasByMateriaId` | `listEventosByMateria` |
| Repositorio | `findTareasByMateriaIdAndUserId` | `findEventosByMateriaAndUserId` |

El servicio actual de tareas llama primero a `getMateriaById(id, userId)`. Esa comprobación devuelve 404 si la materia no existe para ese usuario. El servicio de eventos sigue el mismo patrón. Por eso, para una materia inexistente o ajena, el resultado real no es HTTP 200 con un arreglo vacío como dice una parte del documento de referencia: es un error 404. Para una materia propia sin eventos, el repositorio sí retorna `[]`.

El repositorio del proyecto se llama `src/repositories/materias.repositorio.js` y se importa con ese nombre desde el servicio. Las funciones reales de tareas también tienen nombres distintos de algunos ejemplos de la guía; no se renombraron para agregar eventos.

## 1. `src/routes/materias.routes.js`

Adicionar `listEventosByMateria` a la importación existente del controlador:

```js
import {
  listMaterias,
  getMateriaById,
  getMateriasTareas,
  listEventosByMateria,
  createMateria,
  replaceMateria,
  updateMateria,
  deleteMateria
} from "../controllers/materias.controller.js";
```

Registrar la ruta junto a la ruta de tareas:

```js
router.get("/:id/eventos", listEventosByMateria);
```

`src/app.js` ya monta este router bajo `/api/v1/materias`, por lo que no hace falta agregar otro registro en `app.js`.

## 2. `src/controllers/materias.controller.js`

La función valida el parámetro, obtiene el usuario autenticado, llama al servicio y utiliza el middleware centralizado para manejar errores:

```js
export async function listEventosByMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const userId = request.user.id;
    const eventos = await materiasService.listEventosByMateria(id, userId);
    return sendSuccess(response, eventos);
  } catch (error) {
    return next(error);
  }
}
```

Las importaciones existentes de `materiasService`, `validateMateriaId` y `sendSuccess` se reutilizan.

## 3. `src/services/materias.service.js`

El servicio verifica primero que la materia pertenezca al usuario y luego delega la consulta:

```js
export async function listEventosByMateria(id, userId) {
  await getMateriaById(id, userId);
  return materiasRepository.findEventosByMateriaAndUserId(id, userId);
}
```

Se reutilizan las importaciones existentes de `materiasRepository` y `getMateriaById`.

## 4. `src/repositories/materias.repositorio.js`

La consulta usa `pool.execute`, alias camelCase, un `INNER JOIN` con `materia` y parámetros enlazados para filtrar por materia y propietario:

```js
export async function findEventosByMateriaAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT
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
     WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId]
  );

  return rows;
}
```

La importación de `pool` ya existe. El SQL selecciona los campos definidos en la tabla `evento` del esquema, y devuelve todas las filas coincidentes.

## Componentes existentes que se reutilizan

| Archivo | Función o configuración | Uso |
| --- | --- | --- |
| `src/validators/materias.validator.js` | `validateMateriaId(id)` | Valida el identificador de materia. |
| `src/utils/api-response.js` | `sendSuccess(response, data)` | Devuelve HTTP 200 con el arreglo dentro de `data`. |
| `src/config/database.js` | `pool` | Proporciona la conexión MySQL. |
| `src/app.js` | Montaje de rutas `/api/v1/materias` | Hace accesible la nueva ruta bajo el prefijo de la API. |
| `src/middlewares/request-context.middleware.js` | `attachTemporaryUser` | Actualmente asigna `request.user.id = 1` para cada solicitud. |
| `src/middlewares/error.middleware.js` | `errorHandler` | Convierte errores propagados con `next(error)` en respuestas HTTP. |

Mientras se use el middleware temporal, los resultados están limitados a materias del usuario con ID `1`. Cuando se integre autenticación real, `request.user.id` debe provenir del usuario autenticado.

## Flujo del endpoint

```text
GET /api/v1/materias/:id/eventos
  → materias.routes.js
  → listEventosByMateria (controlador)
  → validateMateriaId
  → listEventosByMateria (servicio)
  → getMateriaById (comprobación de pertenencia)
  → findEventosByMateriaAndUserId (repositorio)
  → MySQL
  → sendSuccess: { success: true, data: eventos }
```

## Verificación

Con el servidor iniciado y MySQL configurado, consultar una materia propia que tenga eventos:

```powershell
curl.exe -i http://localhost:3000/api/v1/materias/1/eventos
```

La implementación se verificó con HTTP 200 y una respuesta de la forma:

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

Casos adicionales:

- Materia del usuario sin eventos: HTTP 200 y `data: []`.
- Identificador inválido, por ejemplo `abc`, `0` o `-1`: error de validación HTTP 400.
- Materia inexistente o perteneciente a otro usuario: HTTP 404 por la validación de pertenencia del servicio.

La serialización de `fecha` como fecha ISO UTC proviene del driver MySQL/Node.js; las horas se devuelven como cadenas `HH:MM:SS`.
