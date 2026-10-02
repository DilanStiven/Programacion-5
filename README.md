# StudentFlow - Programación

Repositorio del proyecto de clase.

- `studentFlow_back/`: código fuente de la API REST (Node.js + Express + MySQL), configuración de ejecución y backend funcional.
- `BD y archivos/`: entregables de análisis, diseño y documentación del proyecto. La organización de esta carpeta se detalla abajo.
- `Proyectos/`: ejercicios de clase y PRD.

## Estructura de `BD y archivos/`

```text
BD y archivos/
├── BD/
│   ├── BDMysql.png
│   ├── 01_studentflow_schema_mysql.sql
│   ├── 02_studentflow_seed_inicial.sql
│   ├── 03_studentflow_ajustes_consistencia.sql
│   ├── 04_verificacion_ajustes_studentflow.sql
│   └── documentos de justificación y verificación del modelo
├── documentacion materias/
│   └── Endpoint_GET_Eventos_por_Materia.md
├── 02_Explicacion_archivos_generales.md
├── Detalle_Primeros_7_Pasos_Fase1.md
├── Diagrama_Flujo_Peticion_Backend.md
├── Fase1_Preparacion_Entorno_Desarrollo.md
└── functionEnpointGetEventosMaterias.md
```

- **`BD/`** contiene el diagrama entidad-relación, el esquema SQL, los datos de ejemplo, los ajustes de consistencia y la documentación específica de la base de datos.
- **`documentacion materias/`** contiene documentación funcional de los endpoints relacionados con materias; actualmente incluye la consulta GET de eventos por materia.
- **`Fase1_Preparacion_Entorno_Desarrollo.md`** y **`Detalle_Primeros_7_Pasos_Fase1.md`** documentan la preparación y los pasos iniciales de trabajo.
- **`Diagrama_Flujo_Peticion_Backend.md`** explica el recorrido de una petición por el backend; **`02_Explicacion_archivos_generales.md`** describe archivos y componentes generales de la API.
- **`functionEnpointGetEventosMaterias.md`** contiene el procedimiento solicitado para el endpoint GET de eventos por materia. Se mantiene directamente en `BD y archivos/`, no dentro de `documentacion materias/`.
- **`studentFlow_back/`** es el proyecto ejecutable. Sus rutas, controladores, servicios y repositorios contienen la implementación; la carpeta de documentación describe el trabajo, pero no reemplaza el código.

## Endpoints de materias (`/api/v1/materias`)

| Método | Ruta | Función |
|--------|------|---------|
| GET | `/` | listMaterias |
| GET | `/:id/tareas` | getMateriasTareas |
| GET | `/:id/eventos` | listEventosByMateria |
| GET | `/:id` | getMateriaById |
| POST | `/` | createMateria |
| PUT | `/:id` | replaceMateria |
| PATCH | `/:id` | updateMateria |
| DELETE | `/:id` | deleteMateria |

## Cómo correrlo

```bash
cd studentFlow_back
npm install
cp .env.example .env   # y completar DB_PASSWORD
npm run dev
```
