# StudentFlow Front

Aplicación de HTML, CSS y JavaScript sin framework para administrar recordatorios del usuario temporal `1` definido por el backend. Las consultas muestran la tarea y la materia asociadas; solo las operaciones CRUD de recordatorios modifican datos.

La página principal (`public/index.html`) permite listar, consultar, crear, reemplazar, actualizar parcialmente y eliminar recordatorios. Las operaciones de escritura piden confirmación cuando corresponde y actualizan el listado.

## Iniciar

Requisito: Node.js 22 o superior, MySQL y el backend configurados.

En una terminal de PowerShell, inicia el backend:

```powershell
cd D:\Downloads\camacho\2026B\programacionV\studentFlow_back
npm start
```

En otra terminal, inicia el frontend:

```powershell
cd D:\Downloads\camacho\2026B\programacionV\studentFlow_front
npm start
```

Abre **http://127.0.0.1:5500**. También puedes usar `npm run dev` para reiniciar el servidor local al editar archivos. Refresca el navegador para ver cambios en las páginas.

El servidor sirve únicamente `public/` y reenvía las solicitudes `/api/` al backend en `http://127.0.0.1:3000`. Así las páginas y el API comparten origen sin modificar el backend ni necesitar CORS durante el desarrollo. No abras el HTML con doble clic ni con Live Server: esos métodos no incluyen el proxy.

Si el backend usa otro puerto, configura la terminal antes de iniciar:

```powershell
$env:BACKEND_URL = "http://127.0.0.1:3001"
$env:FRONT_PORT = "5501"
npm start
```

`BACKEND_URL` es el origen del backend, sin `/api/v1`. `server.js` es un servidor para desarrollo local, no una configuración de despliegue.

## Archivos

```text
studentFlow_front/
  package.json
  server.js                       Servidor estático y proxy local
  public/
    index.html                    Aplicación CRUD de recordatorios
    css/styles.css                Estilos de la página de ejemplo
    js/
      config.js                   Ruta base y tiempo máximo de espera
      api/
        http.js                   Fetch, errores, filtros y respuesta 204
        health.js                 Estado del backend
        materias.js               Seis funciones del CRUD de materias
        recordatorios.js          Seis funciones del CRUD de recordatorios
      examples/
        datos.js                  Payloads editables de ejemplo
        endpoints.js              Ejemplo ejecutable de cada endpoint
      pages/
        recordatorios.js          Formularios y listado del CRUD de recordatorios
  tests/api.test.js               Pruebas del cliente de materias
  tests/recordatorios.test.js     Pruebas del cliente de recordatorios
```

## Endpoints disponibles

Todas las rutas parten de `/api/v1`.

| Función | Método | Ruta | Resultado |
| --- | --- | --- | --- |
| `consultarEstado()` | GET | `/health` | `{ success, data: { status, database } }` |
| `listarMaterias(filtros)` | GET | `/materias` | `{ success, data: [], meta }` |
| `obtenerMateria(id)` | GET | `/materias/:id` | `{ success, data: materia }` |
| `crearMateria(datos)` | POST | `/materias` | `{ success, data: materia }`, HTTP 201 |
| `reemplazarMateria(id, datos)` | PUT | `/materias/:id` | `{ success, data: materia }` |
| `actualizarMateria(id, cambios)` | PATCH | `/materias/:id` | `{ success, data: materia }` |
| `eliminarMateria(id)` | DELETE | `/materias/:id` | `null`, HTTP 204 sin cuerpo |
| `listarRecordatorios(filtros)` | GET | `/recordatorios` | `{ success, data: [], meta }` |
| `obtenerRecordatorio(id)` | GET | `/recordatorios/:id` | `{ success, data: recordatorio }` |
| `crearRecordatorio(datos)` | POST | `/recordatorios` | `{ success, data: recordatorio }`, HTTP 201 |
| `reemplazarRecordatorio(id, datos)` | PUT | `/recordatorios/:id` | `{ success, data: recordatorio }` |
| `actualizarRecordatorio(id, cambios)` | PATCH | `/recordatorios/:id` | `{ success, data: recordatorio }` |
| `eliminarRecordatorio(id)` | DELETE | `/recordatorios/:id` | `null`, HTTP 204 sin cuerpo |

Los filtros del listado de recordatorios son `search` (mensaje, título de tarea o materia), `leido` (`true`/`false`), `canal` (`in_app`/`email`), `tareaId`, `page`, `limit` (1–100), `sort` y `order`. La respuesta incluye el contexto relacionado (`tareaTitulo`, `tareaFechaEntrega`, `materiaNombre` y `materiaCodigo`). Las operaciones solo modifican o eliminan filas de `recordatorio`; `tarea` y `materia` se consultan para comprobar la propiedad y mostrar contexto.

## Endpoints de materias existentes

Las rutas de materias siguen disponibles en el backend. Sus páginas individuales se conservan en `public/llamadoCompleto/`.

Filtros del listado de materias:

| Campo | Valores |
| --- | --- |
| `search` | Texto a buscar en nombre o código |
| `activa` | `true` o `false`; omitir para incluir ambas |
| `page` | Entero desde 1; por defecto 1 |
| `limit` | Entero de 1 a 100; por defecto 20 |
| `sort` | `id`, `nombre`, `codigo`, `creditos`, `createdAt` |
| `order` | `asc` o `desc` |

La paginación se devuelve en `meta`: `page`, `limit`, `total` y `pages`.

En POST y PUT se envían `nombre`, `codigo` y `color` (`#RRGGBB`). `creditos` es un entero mayor o igual que cero o `null`; `activa` es un booleano. Si se omiten, el backend asigna `creditos: null` y `activa: true`. En PATCH se envía al menos uno de estos campos. PUT reemplaza la representación y PATCH conserva los campos omitidos.

## Probar el CRUD de recordatorios

1. Inicia el backend con la base StudentFlow configurada y el frontend.
2. Abre `http://127.0.0.1:5500` y consulta el listado.
3. Usa el ID de una tarea existente (el seed inicial contiene IDs del 1 al 6) para crear un recordatorio.
4. Prueba consultar, reemplazar o actualizar el registro desde la misma página.
5. Si deseas eliminarlo, confirma la operación; solo se borra ese recordatorio.

Los formularios no escriben datos al abrir la página. Las rutas POST, PUT, PATCH y DELETE modifican únicamente `recordatorio`. El backend todavía identifica al usuario mediante el middleware temporal con ID `1`.

## Usar desde futuras páginas

Coloca las nuevas páginas HTML dentro de `public/` y sus scripts en `public/js/pages/`. Los módulos del API no dependen del DOM ni de la página de prueba.

Ejemplo de `public/materias.html`:

```html
<!doctype html>
<html lang="es">
  <meta charset="utf-8">
  <title>Mis materias</title>
  <p id="mensaje" role="status"></p>
  <ul id="materias"></ul>
  <script type="module" src="./js/pages/materias.js"></script>
</html>
```

Ejemplo de `public/js/pages/materias.js`:

```javascript
import { listarMaterias } from "../api/materias.js";

try {
  const { data, meta } = await listarMaterias({ page: 1, limit: 10 });
  const lista = document.querySelector("#materias");
  for (const materia of data) {
    const item = document.createElement("li");
    item.textContent = `${materia.nombre} (${materia.codigo})`;
    lista.append(item);
  }
  document.querySelector("#mensaje").textContent = `${meta.total} materias encontradas`;
} catch (error) {
  document.querySelector("#mensaje").textContent = error.message;
  console.error(error.status, error.code);
}
```

Para los demás métodos:

```javascript
import {
  obtenerMateria, crearMateria, reemplazarMateria,
  actualizarMateria, eliminarMateria
} from "../api/materias.js";
import { consultarEstado } from "../api/health.js";
import { materiaEjemplo, reemplazoEjemplo } from "../examples/datos.js";

// Ejecutar cada operación desde el evento correspondiente de la página.
await consultarEstado();
const { data: nueva } = await crearMateria(materiaEjemplo);
await obtenerMateria(nueva.id);
await reemplazarMateria(nueva.id, reemplazoEjemplo);
await actualizarMateria(nueva.id, { activa: false });
await eliminarMateria(nueva.id);
```

Las funciones arrojan `ApiError` con `message`, `status` y `code` cuando falla una solicitud. `status: 0` indica un fallo local de red o tiempo de espera. El proxy devuelve 502 si no puede contactar al backend. Los mensajes 400, 404, 409, 422 y 500 del API se conservan.

## Verificar

```powershell
npm test
```

Las pruebas simulan `fetch`: verifican los siete métodos y rutas, cuerpos JSON, filtros, paginación, errores y eliminación sin contenido. No necesitan MySQL y no modifican datos. Las pruebas del CRUD real se hacen desde la página con el backend y MySQL disponibles.
