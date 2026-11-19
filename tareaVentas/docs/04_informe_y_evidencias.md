# Informe del laboratorio de ventas

**Equipo:** ____________________  
**Integrantes:** ____________________  
**Fecha de ejecución:** ____________________  
**Entorno:** XAMPP / MariaDB o MySQL ________  

> Plantilla lista para completar durante la ejecución local. Los campos de resultado observado y las capturas deben llenarse con evidencia del equipo; no se deben presentar como pruebas ejecutadas antes de correrlas.

## Objetivo y arquitectura

El sistema registra ventas y sus detalles en las tablas operativas `ventas` y `detalle_venta`. El procedimiento `sp_actualizar_resumen_ventas()` recalcula los indicadores diarios para ventas confirmadas y los guarda en `resumen_ventas_diarias`. El evento `ev_actualizar_resumen_ventas` vuelve a ejecutar el procedimiento cada cinco minutos. La API REST consulta el resumen para entregar indicadores al dashboard; la interfaz web se sirve desde el mismo backend.

El resumen es una proyección de consulta: una venta anulada o modificada se refleja después de la siguiente consolidación. El usuario puede solicitar una actualización manual desde el dashboard.

## Modelo y decisiones

- `clientes` y `productos` son catálogos relacionados con las ventas.
- `ventas` almacena cliente, fecha y estado. Las ventas usan `CONFIRMADA` o `ANULADA`.
- `detalle_venta` conserva la cantidad y el precio histórico vendido, aunque cambie el precio del catálogo.
- `resumen_ventas_diarias` mantiene una fila por fecha con ventas confirmadas: número de ventas distintas, unidades, ingresos, ticket promedio y hora de consolidación.
- El procedimiento reconstruye el resumen dentro de una transacción. Esto permite corregir el resultado de anulaciones y cambios sin duplicar cifras.
- El evento de MySQL separa la frecuencia de actualización del tráfico web. La demora esperada es de hasta cinco minutos mientras MySQL esté encendido y el Event Scheduler activo.

## Ejecución

1. Iniciar Apache y MySQL en XAMPP.
2. Importar `docs/laboratorio_ventas.sql` una vez en phpMyAdmin, usando un usuario con permisos para crear base de datos, procedimiento y evento.
3. Confirmar `event_scheduler = ON` y que aparezca `ev_actualizar_resumen_ventas` en los eventos de `laboratorio_ventas`.
4. En PowerShell, ejecutar `cd backend`, `npm install` y `npm run dev`.
5. Abrir `http://localhost:3001` y comprobar el estado de la API y los indicadores.

La carga inicial contiene 30 ventas distribuidas entre varios días, con ventas confirmadas, anuladas y varios detalles por venta.

## Validación y evidencias

Para contrastar el resumen con las tablas operativas, ejecutar esta consulta de control en phpMyAdmin:

```sql
SELECT DATE(v.fecha_venta) AS fecha,
       COUNT(DISTINCT v.id_venta) AS cantidad_ventas,
       SUM(d.cantidad) AS unidades_vendidas,
       SUM(d.cantidad * d.precio_unitario) AS ingresos,
       ROUND(SUM(d.cantidad * d.precio_unitario)
             / COUNT(DISTINCT v.id_venta), 2) AS ticket_promedio
FROM ventas AS v
JOIN detalle_venta AS d ON d.id_venta = v.id_venta
WHERE v.estado = 'CONFIRMADA'
GROUP BY DATE(v.fecha_venta)
ORDER BY fecha;
```

| Prueba | Acción | Resultado esperado | Resultado observado / evidencia | Cumple |
|---|---|---|---|---|
| Carga inicial | Contar ventas y revisar estados | 30 ventas, varios días, estados confirmada y anulada | ____________________ | ____ |
| Consolidación | Ejecutar `CALL sp_actualizar_resumen_ventas()` y comparar con la consulta de control | Mismos indicadores por fecha | ____________________ | ____ |
| Repetibilidad | Ejecutar el procedimiento dos veces sin cambios | Mismos indicadores; cambia solo la marca de actualización | ____________________ | ____ |
| Alta | Registrar una venta confirmada y consolidar | El día de la venta refleja sus unidades e ingresos | ____________________ | ____ |
| Anulación | Anular una venta confirmada y consolidar | Se excluye del conteo, unidades e ingresos | ____________________ | ____ |
| Modificación | Cambiar cantidad o precio de un detalle y consolidar | Se refleja el nuevo valor en el día correspondiente | ____________________ | ____ |
| Período vacío | Consultar fechas sin ventas desde el dashboard/API | KPIs en cero y serie vacía, sin error | ____________________ | ____ |
| Fecha inválida | Consultar con una fecha inexistente o rango invertido | Error HTTP 400 claro | ____________________ | ____ |
| Separación | Revisar `resumen.repository.js` y la API del dashboard | Indicadores y serie diaria leen `resumen_ventas_diarias` | ____________________ | ____ |
| Automatización | Cambiar datos, esperar el siguiente ciclo y revisar `ultima_actualizacion` | El evento actualiza el resumen en hasta cinco minutos | ____________________ | ____ |

**Capturas adjuntas:** importación SQL __________; evento habilitado __________; dashboard __________; comparación de consulta __________; prueba de actualización __________.

## Conclusión

El laboratorio muestra cómo separar el registro transaccional de la lectura analítica. La consolidación periódica facilita consultas sencillas desde el dashboard, con el costo de que las modificaciones recientes pueden tardar hasta cinco minutos en verse. Completar esta conclusión con los resultados observados y cualquier ajuste del entorno local.

**Conclusión del equipo:**  
____________________________________________________________________________  
____________________________________________________________________________
