-- Esquema y conjunto de prueba para laboratorio_ventas (MariaDB/MySQL).
-- Importar una sola vez en una base vacía desde phpMyAdmin.
CREATE DATABASE IF NOT EXISTS `laboratorio_ventas`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `laboratorio_ventas`;

SET NAMES utf8mb4;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio_catalogo` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_producto`),
  CONSTRAINT `chk_producto_precio` CHECK (`precio_catalogo` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ventas` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `fecha_venta` datetime NOT NULL,
  `estado` enum('CONFIRMADA','ANULADA') NOT NULL DEFAULT 'CONFIRMADA',
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_venta`),
  KEY `fk_venta_cliente` (`id_cliente`),
  KEY `idx_ventas_estado_fecha` (`estado`,`fecha_venta`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `detalle_venta` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_producto` (`id_producto`),
  KEY `idx_detalle_venta` (`id_venta`),
  CONSTRAINT `chk_detalle_cantidad` CHECK (`cantidad` > 0),
  CONSTRAINT `chk_detalle_precio` CHECK (`precio_unitario` >= 0),
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  CONSTRAINT `fk_detalle_venta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `resumen_ventas_diarias` (
  `fecha` date NOT NULL,
  `cantidad_ventas` int NOT NULL,
  `unidades_vendidas` int NOT NULL,
  `ingresos` decimal(14,2) NOT NULL,
  `ticket_promedio` decimal(14,2) NOT NULL,
  `ultima_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `clientes` (`id_cliente`,`nombre`) VALUES
(1,'Ana'),(2,'Luis'),(3,'María');

INSERT INTO `productos` (`id_producto`,`nombre`,`precio_catalogo`) VALUES
(1,'Teclado',100.00),(2,'Mouse',50.00),(3,'Monitor',600.00),(4,'Audífonos',200.00);

-- Treinta ventas en varios días; hay anuladas y ventas con varios productos.
INSERT INTO `ventas` (`id_venta`,`id_cliente`,`fecha_venta`,`estado`,`fecha_modificacion`) VALUES
(1,1,'2026-10-28 10:15:00','CONFIRMADA','2026-11-02 09:03:40'),
(2,2,'2026-10-28 12:00:00','CONFIRMADA','2026-11-02 09:03:40'),
(3,3,'2026-10-29 08:15:00','CONFIRMADA','2026-11-02 09:03:40'),
(4,1,'2026-10-29 18:10:00','ANULADA','2026-11-02 09:03:40'),
(5,2,'2026-11-01 09:00:00','CONFIRMADA','2026-11-02 09:03:40'),
(6,3,'2026-11-02 07:20:00','CONFIRMADA','2026-11-02 09:03:40'),
(7,1,'2026-11-02 08:00:00','CONFIRMADA','2026-11-02 09:03:40'),
(8,2,'2026-11-02 15:11:20','CONFIRMADA','2026-11-02 15:11:35'),
(9,3,'2026-11-03 09:10:00','CONFIRMADA','2026-11-03 09:10:00'),
(10,1,'2026-11-03 11:25:00','CONFIRMADA','2026-11-03 11:25:00'),
(11,2,'2026-11-03 14:40:00','ANULADA','2026-11-03 14:40:00'),
(12,3,'2026-11-04 08:05:00','CONFIRMADA','2026-11-04 08:05:00'),
(13,1,'2026-11-04 10:30:00','CONFIRMADA','2026-11-04 10:30:00'),
(14,2,'2026-11-04 16:15:00','CONFIRMADA','2026-11-04 16:15:00'),
(15,3,'2026-11-05 09:00:00','CONFIRMADA','2026-11-05 09:00:00'),
(16,1,'2026-11-05 12:20:00','ANULADA','2026-11-05 12:20:00'),
(17,2,'2026-11-05 17:45:00','CONFIRMADA','2026-11-05 17:45:00'),
(18,3,'2026-11-06 08:35:00','CONFIRMADA','2026-11-06 08:35:00'),
(19,1,'2026-11-06 13:10:00','CONFIRMADA','2026-11-06 13:10:00'),
(20,2,'2026-11-06 18:00:00','CONFIRMADA','2026-11-06 18:00:00'),
(21,3,'2026-11-07 09:25:00','CONFIRMADA','2026-11-07 09:25:00'),
(22,1,'2026-11-07 15:50:00','ANULADA','2026-11-07 15:50:00'),
(23,2,'2026-11-08 10:05:00','CONFIRMADA','2026-11-08 10:05:00'),
(24,3,'2026-11-08 12:40:00','CONFIRMADA','2026-11-08 12:40:00'),
(25,1,'2026-11-08 17:15:00','CONFIRMADA','2026-11-08 17:15:00'),
(26,2,'2026-11-09 08:20:00','CONFIRMADA','2026-11-09 08:20:00'),
(27,3,'2026-11-09 11:55:00','CONFIRMADA','2026-11-09 11:55:00'),
(28,1,'2026-11-09 16:30:00','CONFIRMADA','2026-11-09 16:30:00'),
(29,2,'2026-11-10 09:45:00','ANULADA','2026-11-10 09:45:00'),
(30,3,'2026-11-10 14:10:00','CONFIRMADA','2026-11-10 14:10:00');

INSERT INTO `detalle_venta` (`id_detalle`,`id_venta`,`id_producto`,`cantidad`,`precio_unitario`) VALUES
(1,1,2,2,50.00),(2,1,1,1,100.00),(3,2,3,1,600.00),
(4,3,4,1,200.00),(5,3,2,1,50.00),(6,4,3,1,600.00),
(7,5,1,3,100.00),(8,6,2,1,50.00),(9,6,4,1,200.00),
(10,7,3,2,600.00),(11,8,3,2,600.00),
(12,9,1,1,100.00),(13,9,2,2,50.00),(14,10,3,1,600.00),
(15,11,4,1,200.00),(16,12,2,3,50.00),(17,12,1,1,100.00),
(18,13,4,2,200.00),(19,14,1,2,100.00),(20,15,3,1,600.00),
(21,15,2,1,50.00),(22,16,4,1,200.00),(23,17,2,2,50.00),
(24,18,3,1,600.00),(25,18,1,1,100.00),(26,19,4,1,200.00),
(27,20,1,1,100.00),(28,21,3,2,600.00),(29,21,2,1,50.00),
(30,22,1,2,100.00),(31,23,2,2,50.00),(32,24,4,1,200.00),
(33,24,3,1,600.00),(34,25,1,3,100.00),(35,26,3,1,600.00),
(36,27,4,2,200.00),(37,27,2,1,50.00),(38,28,1,1,100.00),
(39,29,3,1,600.00),(40,30,3,1,600.00),(41,30,2,2,50.00);

ALTER TABLE `clientes` AUTO_INCREMENT = 4;
ALTER TABLE `productos` AUTO_INCREMENT = 5;
ALTER TABLE `ventas` AUTO_INCREMENT = 31;
ALTER TABLE `detalle_venta` AUTO_INCREMENT = 42;

-- El resumen se llena después de instalar el procedimiento del archivo 02.
