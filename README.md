# StudentFlow - Programación

Repositorio de trabajo del proyecto de clase StudentFlow. Actualmente incluye el backend, los archivos de diseño de la base de datos, guías de trabajo y materiales del curso.

## Organización del repositorio

```text
.
├── Guias/
│   ├── documentacion materias/
│   └── guías de configuración, arquitectura y endpoints
├── BD y archivos/
│   └── BD/
│       ├── diagrama y documentación del modelo
│       └── scripts SQL de esquema, datos, ajustes y verificación
├── Proyectos/
│   ├── PRD de StudentFlow
│   └── ejercicios de clase
└── studentFlow_back/
    └── src/
        ├── config/
        ├── controllers/
        ├── middlewares/
        ├── repositories/
        ├── routes/
        ├── services/
        ├── utils/
        └── validators/
```

### Guías

- [Preparación del entorno](Guias/Fase1_Preparacion_Entorno_Desarrollo.md) y [detalle de los primeros siete pasos](Guias/Detalle_Primeros_7_Pasos_Fase1.md).
- [Flujo de una petición al backend](Guias/Diagrama_Flujo_Peticion_Backend.md) y [explicación de archivos generales](Guias/02_Explicacion_archivos_generales.md).
- [Implementación de eventos por materia](Guias/functionEnpointGetEventosMaterias.md) y [documentación del endpoint](Guias/documentacion%20materias/Endpoint_GET_Eventos_por_Materia.md).

### Base de datos y materiales de clase

- `BD y archivos/BD/` reúne el diagrama, la justificación y documentación del modelo, además de los scripts SQL para crear el esquema, cargar datos iniciales, aplicar ajustes de consistencia y verificarlos.
- `Proyectos/` conserva el PRD de StudentFlow y los ejercicios de clase.

## Avance hasta ahora

### Backend

- Backend Node.js con Express y MySQL, organizado en rutas, controladores, servicios, repositorios, validadores y middlewares.
- Endpoint de salud disponible en `/api/v1/health`.
- Operaciones para listar, consultar, crear, reemplazar, actualizar y eliminar materias bajo `/api/v1/materias`.
- CRUD de recordatorios bajo `/api/v1/recordatorios`; las consultas incluyen la tarea y la materia relacionadas, y las escrituras afectan únicamente a `recordatorio`.
- Listado de materias con filtros y paginación; consultas de tareas y eventos por materia.
- Validación de entradas y manejo centralizado de errores.
- La asignación de usuario todavía usa un middleware temporal que establece el ID `1`; falta integrar autenticación real.

### Base de datos y documentación

- Esquema relacional MySQL y datos iniciales preparados.
- Scripts para aplicar ajustes de consistencia y revisar constraints y relaciones.
- Guías de configuración, arquitectura y endpoints reunidas en `Guias/`.
- El frontend de ejemplo está en `studentFlow_front/` y permite probar el CRUD de recordatorios desde el navegador.

La [documentación del CRUD de recordatorios](DOCUMENTACION/Archivos/END%20POINTS/CRUD_Recordatorios.md) describe sus rutas, campos y límites de escritura.

## Endpoints de materias (`/api/v1/materias`)

| Método | Ruta | Función |
|--------|------|---------|
| GET | `/` | Listar materias |
| GET | `/:id/tareas` | Consultar tareas de una materia |
| GET | `/:id/eventos` | Consultar eventos de una materia |
| GET | `/:id` | Consultar una materia |
| POST | `/` | Crear una materia |
| PUT | `/:id` | Reemplazar una materia |
| PATCH | `/:id` | Actualizar parcialmente una materia |
| DELETE | `/:id` | Eliminar una materia |

## Cómo ejecutar el backend

Requisitos: Node.js 18 o superior y MySQL en ejecución.

```powershell
Set-Location studentFlow_back
npm install
Copy-Item .env.example .env  # Solo si todavía no existe .env
npm run dev
```

Configura las variables de conexión a MySQL en `.env` antes de iniciar el servidor. No compartas ni subas ese archivo; usa `.env.example` como plantilla.
