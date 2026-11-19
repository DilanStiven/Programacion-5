# Laboratorio de ventas

Aplicación local para registrar ventas y consultar un resumen diario consolidado en MySQL/MariaDB.

## Preparar la base de datos

1. Inicia **Apache** y **MySQL** en XAMPP.
2. Si es una instalación nueva, en phpMyAdmin importa `docs/laboratorio_ventas.sql` una sola vez. El script crea `laboratorio_ventas`, carga 30 ventas y crea el procedimiento y el evento de actualización.

   Si ya importaste la versión anterior de la base y quieres conservarla, ejecuta `docs/03_ampliar_datos_existentes.sql` y luego importa `docs/02_procedimiento_y_evento.sql`. La migración agrega las ventas 9-30 sin borrar las existentes.
3. Comprueba en MySQL que `event_scheduler` esté en `ON`. Si está desactivado, ejecuta como administrador:

   ```sql
   SET GLOBAL event_scheduler = ON;
   ```

   Este ajuste puede volver a `OFF` al reiniciar MariaDB. Para conservarlo en XAMPP, agrega `event_scheduler=ON` bajo `[mysqld]` en `my.ini` y reinicia MySQL.

El usuario que importa el archivo necesita permisos para crear la base, tablas, procedimientos y eventos. Para instalaciones administradas, importa por separado `docs/01_esquema_y_datos.sql` y `docs/02_procedimiento_y_evento.sql`, solicitando al administrador los permisos que falten.

## Iniciar la aplicación

Abre PowerShell en la carpeta `backend` (o ejecuta estos comandos desde la raíz del proyecto):

```powershell
cd backend
npm install
npm run dev
```

Abre **http://localhost:3001**. La API usa por defecto MySQL en `127.0.0.1:3306`, usuario `root`, contraseña vacía y base `laboratorio_ventas`. Para cambiar esa configuración, crea `backend/.env` a partir de `backend/.env.example`.

## Scripts SQL

- `docs/01_esquema_y_datos.sql`: estructura y datos de ejemplo. Importar una vez sobre una base vacía.
- `docs/02_procedimiento_y_evento.sql`: procedimiento de consolidación, evento cada cinco minutos y carga inicial del resumen.
- `docs/03_ampliar_datos_existentes.sql`: amplía de forma aditiva la base previa de 8 ventas.
- `docs/laboratorio_ventas.sql`: ambos pasos en un solo archivo para phpMyAdmin; importar una vez sobre una base vacía.
- `docs/04_informe_y_evidencias.md`: informe y matriz para registrar las comprobaciones hechas en el equipo.

## API

La API está versionada bajo `/api/v1`. Los endpoints del resumen son:

- `GET /api/v1/resumen/indicadores?desde=AAAA-MM-DD&hasta=AAAA-MM-DD`
- `GET /api/v1/resumen/ventas-diarias?desde=AAAA-MM-DD&hasta=AAAA-MM-DD`
- `GET /api/v1/resumen/estado`
- `POST /api/v1/resumen/actualizar` para una consolidación manual.

El dashboard consulta la tabla de resumen. El estado de consolidación compara los datos operativos con ese resumen para detectar cambios pendientes.
