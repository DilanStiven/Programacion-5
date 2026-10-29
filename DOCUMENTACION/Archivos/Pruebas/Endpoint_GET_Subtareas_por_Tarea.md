# Consulta de subtareas por tarea

## Endpoint

```http
GET /api/v1/tareas/{id}/subtareas
```

Obtiene las subtareas de una tarea que pertenece a una materia del usuario de la solicitud.

### Parámetros

| Parámetro | Ubicación | Tipo | Descripción |
| --- | --- | --- | --- |
| `id` | Ruta | Entero positivo | Identificador de la tarea. |

El usuario se obtiene de `request.user.id`; no se envía como parámetro ni como dato del cuerpo. El endpoint no recibe parámetros de consulta.

### Ejemplo de petición

```powershell
curl.exe -i http://localhost:3000/api/v1/tareas/42/subtareas
```

## Respuesta exitosa

Código HTTP: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "tareaId": 42,
      "titulo": "Leer el capítulo",
      "estado": "pendiente",
      "orden": 1,
      "createdAt": "2026-10-15T14:30:00.000Z",
      "updatedAt": "2026-10-15T14:30:00.000Z"
    }
  ]
}
```

Si la tarea existe, pertenece al usuario y no tiene subtareas, la respuesta es HTTP 200 con `"data": []`.

### Campos de la subtarea

| Campo de respuesta | Columna de base de datos |
| --- | --- |
| `id` | `subtarea.id_subtarea` |
| `tareaId` | `tarea.id_tarea` |
| `titulo` | `subtarea.titulo` |
| `estado` | `subtarea.estado` |
| `orden` | `subtarea.orden` |
| `createdAt` | `subtarea.created_at` |
| `updatedAt` | `subtarea.updated_at` |

Las subtareas se ordenan por `orden` ascendente y, como desempate, por identificador ascendente.

## Acceso y errores

- El identificador debe ser un entero positivo. Un valor inválido responde HTTP 400 con el error `INVALID_ID`.
- La tarea debe existir y pertenecer al usuario actual mediante la relación `tarea → materia → usuario`. Si no existe o no pertenece al usuario, responde HTTP 404 con `Tarea_not_found`.
- El middleware temporal asigna `request.user.id = 1`; mientras siga activo, las consultas solo verifican la propiedad de ese usuario.
- La respuesta de error conserva el formato del proyecto:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "El identificador de tarea no es válido."
  }
}
```

## Consulta utilizada

```sql
SELECT
  t.id_tarea AS tareaId,
  s.id_subtarea AS id,
  s.titulo,
  s.estado,
  s.orden,
  s.created_at AS createdAt,
  s.updated_at AS updatedAt
FROM tarea t
INNER JOIN materia m ON m.id_materia = t.id_materia
LEFT JOIN subtarea s ON s.id_tarea = t.id_tarea
WHERE t.id_tarea = ? AND m.id_usuario = ?
ORDER BY s.orden ASC, s.id_subtarea ASC;
```

Los signos `?` se enlazan mediante `pool.execute`, en este orden: `[tareaId, userId]`. El `LEFT JOIN` permite distinguir una tarea válida sin subtareas de una tarea inexistente o no autorizada.

## Funciones principales por capa

| Capa | Archivo | Función o registro | Responsabilidad |
| --- | --- | --- | --- |
| Route | [`tareas.routes.js`](../../../studentFlow_back/src/routes/tareas.routes.js) | `router.get("/:id/subtareas", listSubtareasByTarea)` | Registra la ruta GET. |
| Controller | [`tareas.controller.js`](../../../studentFlow_back/src/controllers/tareas.controller.js) | `listSubtareasByTarea` | Valida el ID, toma el usuario del contexto, llama al servicio y entrega la respuesta habitual. |
| Service | [`tareas.service.js`](../../../studentFlow_back/src/services/tareas.service.js) | `listSubtareasByTareaId` | Solicita los datos al repositorio y convierte la tarea ausente/no autorizada en el error 404 del proyecto. |
| Repository | [`tareas.repositorio.js`](../../../studentFlow_back/src/repositories/tareas.repositorio.js) | `findSubtareasByTareaIdAndUserId` | Ejecuta la consulta parametrizada, filtra por propietario y mapea la colección. |
| Validator | [`tareas.validator.js`](../../../studentFlow_back/src/validators/tareas.validator.js) | `validateTareaId` | Convierte y valida que el ID sea un entero positivo; usa `INVALID_ID` cuando no lo es. |

La ruta se monta en [`app.js`](../../../studentFlow_back/src/app.js) bajo `/api/v1/tareas`.

## Archivos creados, modificados o eliminados

| Estado | Archivo | Cambio |
| --- | --- | --- |
| Creado | [`tareas.routes.js`](../../../studentFlow_back/src/routes/tareas.routes.js) | Registra `GET /:id/subtareas`. |
| Creado | [`tareas.controller.js`](../../../studentFlow_back/src/controllers/tareas.controller.js) | Agrega el controlador de consulta de subtareas. |
| Creado | [`tareas.service.js`](../../../studentFlow_back/src/services/tareas.service.js) | Agrega la regla de error para tarea inexistente o no accesible. |
| Creado | [`tareas.repositorio.js`](../../../studentFlow_back/src/repositories/tareas.repositorio.js) | Agrega el acceso SQL parametrizado y el mapeo de resultados. |
| Creado | [`tareas.validator.js`](../../../studentFlow_back/src/validators/tareas.validator.js) | Agrega la validación del identificador de tarea. |
| Modificado | [`app.js`](../../../studentFlow_back/src/app.js) | Importa y monta el router de tareas. |
| Creado | `DOCUMENTACION/Archivos/Pruebas/Endpoint_GET_Subtareas_por_Tarea.md` | Documenta el contrato y las verificaciones del endpoint. |

No se eliminó ningún archivo.

## Verificaciones y limitaciones

- Se contrastaron las relaciones y columnas usadas con el diagrama y `DOCUMENTACION/BD/01_studentflow_schema_mysql.sql`.
- `node --check` terminó correctamente para los seis archivos del backend modificados o creados.
- Se comprobó por HTTP con `pool.execute` simulado que la ruta está registrada y que los casos de ID inválido, subtareas presentes, lista vacía y tarea inexistente/no autorizada producen el resultado esperado.
- La prueba simulada verificó además los parámetros `[tareaId, userId]` y los joins de propiedad usados en la consulta.
- No se probó la integración con MySQL ni datos reales; por tanto, el comportamiento de extremo a extremo con una base configurada queda pendiente.
- No se pudo comprobar el estado/diff de Git porque el ejecutable `git` no estaba disponible en el entorno.
