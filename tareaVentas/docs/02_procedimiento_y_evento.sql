-- Procedimiento de consolidación y actualización automática cada cinco minutos.
-- Ejecutar después de 01_esquema_y_datos.sql, como usuario con permisos
-- CREATE ROUTINE, EVENT y SUPER/SYSTEM_VARIABLES_ADMIN en el servidor local.
USE `laboratorio_ventas`;

-- El Event Scheduler es una opción global del servidor. En algunos servidores
-- administrados debe habilitarlo el administrador desde su configuración.
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS `ev_actualizar_resumen_ventas`;
DROP PROCEDURE IF EXISTS `sp_actualizar_resumen_ventas`;

DELIMITER $$
CREATE PROCEDURE `sp_actualizar_resumen_ventas`()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    DELETE FROM `resumen_ventas_diarias`;

    INSERT INTO `resumen_ventas_diarias`
      (`fecha`, `cantidad_ventas`, `unidades_vendidas`, `ingresos`,
       `ticket_promedio`, `ultima_actualizacion`)
    SELECT DATE(v.`fecha_venta`),
           COUNT(DISTINCT v.`id_venta`),
           SUM(d.`cantidad`),
           SUM(d.`cantidad` * d.`precio_unitario`),
           ROUND(SUM(d.`cantidad` * d.`precio_unitario`)
                 / COUNT(DISTINCT v.`id_venta`), 2),
           NOW()
    FROM `ventas` AS v
    INNER JOIN `detalle_venta` AS d ON d.`id_venta` = v.`id_venta`
    WHERE v.`estado` = 'CONFIRMADA'
    GROUP BY DATE(v.`fecha_venta`);

    COMMIT;
END$$

CREATE EVENT `ev_actualizar_resumen_ventas`
    ON SCHEDULE EVERY 5 MINUTE
    STARTS CURRENT_TIMESTAMP + INTERVAL 5 MINUTE
    ON COMPLETION PRESERVE
    ENABLE
    DO CALL `sp_actualizar_resumen_ventas`()$$
DELIMITER ;

-- Carga inicial inmediata; luego el evento repetirá el cálculo cada cinco minutos.
CALL `sp_actualizar_resumen_ventas`();

-- Comprobaciones para ejecutar en phpMyAdmin:
-- SHOW VARIABLES LIKE 'event_scheduler';
-- SHOW EVENTS FROM `laboratorio_ventas`;
-- SELECT COUNT(*) AS ventas_de_prueba FROM `ventas`;
-- SELECT * FROM `resumen_ventas_diarias` ORDER BY `fecha`;
