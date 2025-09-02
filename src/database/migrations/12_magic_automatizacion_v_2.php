<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN AUTOMATIZACIÓN MAGIC TRAVEL v3.0 - LIMPIA
     * Triggers abstractos actualizados para estructura simplificada
     * Sin tabla facturas, datetime unificado, sin campos calculados
     */
    public function up()
    {
        $this->createAbstractTriggers();
        $this->createAbstractFunctions();
        $this->createAbstractViews();
    }

    /**
     * Crear triggers 100% abstractos
     */
    private function createAbstractTriggers()
    {
        // TRIGGER 1: Calcular monto automáticamente en RESERVA (ABSTRACTO)
        DB::unprepared("
            CREATE TRIGGER tr_reserva_calcular_monto
            BEFORE INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE precio_adulto DECIMAL(10,2) DEFAULT 0;
                DECLARE precio_descuento DECIMAL(10,2) DEFAULT 0;
                DECLARE es_agencia INT DEFAULT 0;

                -- Obtener precios del servicio via ruta_activada
                SELECT IFNULL(s.servicio_precio_normal, 0), IFNULL(s.servicio_precio_descuento, 0)
                INTO precio_adulto, precio_descuento
                FROM ruta_activada ra
                JOIN servicio s ON ra.servicio_id = s.servicio_id
                WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                -- Verificar si es reserva de agencia (abstracto)
                SET es_agencia = IF(NEW.agencia_id IS NOT NULL, 1, 0);

                -- Calcular monto automáticamente (lógica de negocio genérica)
                IF es_agencia = 1 AND precio_descuento > 0 THEN
                    SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_descuento) +
                                          (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_descuento * 0.5));
                ELSEIF precio_adulto > 0 THEN
                    SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_adulto) +
                                          (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_adulto * 0.5));
                ELSE
                    SET NEW.reserva_monto = 0;
                END IF;
            END
        ");

        // TRIGGER 2: Actualizar monto si se modifican cantidades (ABSTRACTO)
        DB::unprepared("
            CREATE TRIGGER tr_reserva_actualizar_monto
            BEFORE UPDATE ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE precio_adulto DECIMAL(10,2) DEFAULT 0;
                DECLARE precio_descuento DECIMAL(10,2) DEFAULT 0;
                DECLARE es_agencia INT DEFAULT 0;

                -- Solo recalcular si cambiaron cantidades o agencia
                IF NEW.reserva_cantidad_adultos != OLD.reserva_cantidad_adultos
                   OR IFNULL(NEW.reserva_cantidad_ninos, 0) != IFNULL(OLD.reserva_cantidad_ninos, 0)
                   OR IFNULL(NEW.agencia_id, 0) != IFNULL(OLD.agencia_id, 0) THEN

                    -- Obtener precios del servicio
                    SELECT IFNULL(s.servicio_precio_normal, 0), IFNULL(s.servicio_precio_descuento, 0)
                    INTO precio_adulto, precio_descuento
                    FROM ruta_activada ra
                    JOIN servicio s ON ra.servicio_id = s.servicio_id
                    WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                    SET es_agencia = IF(NEW.agencia_id IS NOT NULL, 1, 0);

                    -- Recalcular monto (lógica genérica)
                    IF es_agencia = 1 AND precio_descuento > 0 THEN
                        SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_descuento) +
                                              (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_descuento * 0.5));
                    ELSEIF precio_adulto > 0 THEN
                        SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_adulto) +
                                              (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_adulto * 0.5));
                    ELSE
                        SET NEW.reserva_monto = 0;
                    END IF;
                END IF;
            END
        ");

        // TRIGGER 3: Control de capacidad de vehículo (ABSTRACTO)
        DB::unprepared("
            CREATE TRIGGER tr_reserva_control_capacidad
            BEFORE INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE capacidad_vehiculo INT DEFAULT 0;
                DECLARE ocupacion_actual INT DEFAULT 0;
                DECLARE nueva_ocupacion INT DEFAULT 0;
                DECLARE espacio_disponible INT DEFAULT 0;
                DECLARE mensaje_error TEXT;

                -- Obtener capacidad del vehículo asignado
                SELECT IFNULL(v.vehiculo_capacidad, 0) INTO capacidad_vehiculo
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                -- Solo validar si el vehículo tiene capacidad definida
                IF capacidad_vehiculo > 0 THEN
                    -- Calcular ocupación actual (solo reservas activas) - SIN TOTAL_PASAJEROS
                    SELECT IFNULL(SUM(reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)), 0)
                    INTO ocupacion_actual
                    FROM reserva r
                    WHERE r.ruta_activada_id = NEW.ruta_activada_id
                    AND r.reserva_situacion = 1;

                    -- Calcular nueva ocupación
                    SET nueva_ocupacion = ocupacion_actual + (NEW.reserva_cantidad_adultos + IFNULL(NEW.reserva_cantidad_ninos, 0));

                    -- Verificar si excede capacidad
                    IF nueva_ocupacion > capacidad_vehiculo THEN
                        SET espacio_disponible = capacidad_vehiculo - ocupacion_actual;
                        SET mensaje_error = CONCAT(
                            'CAPACIDAD EXCEDIDA: Vehículo tiene ', capacidad_vehiculo,
                            ' asientos. Ocupación actual: ', ocupacion_actual,
                            '. Espacios disponibles: ', espacio_disponible,
                            '. Pasajeros solicitados: ', (NEW.reserva_cantidad_adultos + IFNULL(NEW.reserva_cantidad_ninos, 0))
                        );
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = mensaje_error;
                    END IF;
                END IF;
            END
        ");

        // TRIGGER 4: Alerta de capacidad al 80% (ABSTRACTO)
        DB::unprepared("
            CREATE TRIGGER tr_reserva_alerta_capacidad
            AFTER INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE capacidad_vehiculo INT DEFAULT 0;
                DECLARE ocupacion_actual INT DEFAULT 0;
                DECLARE porcentaje_ocupacion DECIMAL(5,2) DEFAULT 0;

                -- Obtener capacidad y ocupación actual - SIN TOTAL_PASAJEROS
                SELECT
                    IFNULL(v.vehiculo_capacidad, 0),
                    IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0)
                INTO capacidad_vehiculo, ocupacion_actual
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                LEFT JOIN reserva r ON r.ruta_activada_id = ra.ruta_activada_id AND r.reserva_situacion = 1
                WHERE ra.ruta_activada_id = NEW.ruta_activada_id
                GROUP BY v.vehiculo_capacidad;

                -- Solo generar alerta si hay capacidad definida
                IF capacidad_vehiculo > 0 THEN
                    SET porcentaje_ocupacion = (ocupacion_actual / capacidad_vehiculo) * 100;

                    -- Generar alerta si ocupación >= 80%
                    IF porcentaje_ocupacion >= 80 THEN
                        SET @alerta_capacidad = CONCAT(
                            'ALERTA: Ruta ', NEW.ruta_activada_id,
                            ' al ', ROUND(porcentaje_ocupacion, 1), '% de capacidad (',
                            ocupacion_actual, '/', capacidad_vehiculo, ')'
                        );
                    END IF;
                END IF;
            END
        ");
    }

    /**
     * Crear funciones 100% abstractas
     */
    private function createAbstractFunctions()
    {
        // FUNCIÓN 1: Asignar ruta automáticamente (ABSTRACTA) - DATETIME UNIFICADO
        DB::unprepared("
            CREATE FUNCTION fn_asignar_ruta_automatica(
                p_servicio_id INT,
                p_fecha DATE,
                p_pasajeros INT
            ) RETURNS INT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_ruta_activada_id INT DEFAULT 0;

                -- Buscar ruta con espacio disponible (genérico) - SIN TOTAL_PASAJEROS
                SELECT ra.ruta_activada_id
                INTO v_ruta_activada_id
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                LEFT JOIN reserva r ON r.ruta_activada_id = ra.ruta_activada_id AND r.reserva_situacion = 1
                WHERE ra.servicio_id = p_servicio_id
                  AND DATE(ra.ruta_activada_fecha_hora) = p_fecha
                  AND ra.ruta_activada_situacion = 1
                GROUP BY ra.ruta_activada_id, v.vehiculo_capacidad
                HAVING (v.vehiculo_capacidad - IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0)) >= p_pasajeros
                ORDER BY (v.vehiculo_capacidad - IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0)) ASC
                LIMIT 1;

                RETURN IFNULL(v_ruta_activada_id, 0);
            END
        ");

        // FUNCIÓN 2: Calcular precio para reserva (ABSTRACTA)
        DB::unprepared("
            CREATE FUNCTION fn_calcular_precio_reserva(
                p_servicio_id INT,
                p_adultos INT,
                p_ninos INT,
                p_es_agencia BOOLEAN
            ) RETURNS DECIMAL(10,2)
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_precio_adulto DECIMAL(10,2) DEFAULT 0;
                DECLARE v_precio_descuento DECIMAL(10,2) DEFAULT 0;
                DECLARE v_total DECIMAL(10,2) DEFAULT 0;

                -- Obtener precios del servicio
                SELECT
                    IFNULL(servicio_precio_normal, 0),
                    IFNULL(servicio_precio_descuento, 0)
                INTO v_precio_adulto, v_precio_descuento
                FROM servicio
                WHERE servicio_id = p_servicio_id;

                -- Calcular total según tipo de cliente (lógica genérica)
                IF p_es_agencia AND v_precio_descuento > 0 THEN
                    SET v_total = (p_adultos * v_precio_descuento) +
                                 (IFNULL(p_ninos, 0) * (v_precio_descuento * 0.5));
                ELSEIF v_precio_adulto > 0 THEN
                    SET v_total = (p_adultos * v_precio_adulto) +
                                 (IFNULL(p_ninos, 0) * (v_precio_adulto * 0.5));
                END IF;

                RETURN v_total;
            END
        ");

        // FUNCIÓN 3: Verificar disponibilidad (ABSTRACTA) - SIN TOTAL_PASAJEROS
        DB::unprepared("
            CREATE FUNCTION fn_verificar_disponibilidad(
                p_ruta_activada_id INT,
                p_pasajeros INT
            ) RETURNS TEXT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_capacidad INT DEFAULT 0;
                DECLARE v_ocupado INT DEFAULT 0;
                DECLARE v_disponible INT DEFAULT 0;
                DECLARE v_resultado TEXT;

                -- Obtener capacidad y ocupación actual - SIN TOTAL_PASAJEROS
                SELECT
                    IFNULL(v.vehiculo_capacidad, 0),
                    IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0)
                INTO v_capacidad, v_ocupado
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                LEFT JOIN reserva r ON r.ruta_activada_id = ra.ruta_activada_id AND r.reserva_situacion = 1
                WHERE ra.ruta_activada_id = p_ruta_activada_id
                GROUP BY v.vehiculo_capacidad;

                SET v_disponible = v_capacidad - v_ocupado;

                -- Crear resultado como JSON string genérico
                SET v_resultado = CONCAT('{',
                    '\"capacidad_total\":', v_capacidad, ',',
                    '\"ocupacion_actual\":', v_ocupado, ',',
                    '\"espacios_disponibles\":', v_disponible, ',',
                    '\"puede_acomodar\":', IF(v_disponible >= p_pasajeros, 'true', 'false'), ',',
                    '\"porcentaje_ocupacion\":', IF(v_capacidad > 0, ROUND((v_ocupado / v_capacidad) * 100, 1), 0),
                    '}');

                RETURN v_resultado;
            END
        ");
    }

    /**
     * Crear vistas 100% abstractas
     */
    private function createAbstractViews()
    {
        // VISTA 1: Ocupación de rutas (ABSTRACTA) - DATETIME UNIFICADO Y SIN TOTAL_PASAJEROS
        DB::statement("
            CREATE VIEW v_ocupacion_rutas AS
            SELECT
                ra.ruta_activada_id,
                ra.ruta_activada_codigo,
                DATE(ra.ruta_activada_fecha_hora) as fecha_operacion,
                TIME(ra.ruta_activada_fecha_hora) as hora_salida,
                s.servicio_servicio as servicio,
                CONCAT(r.ruta_origen, ' -> ', r.ruta_destino) as ruta,
                v.vehiculo_placa,
                v.vehiculo_capacidad as capacidad_total,
                IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                (v.vehiculo_capacidad - IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0)) as espacios_disponibles,
                IF(v.vehiculo_capacidad > 0, ROUND((IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) / v.vehiculo_capacidad) * 100, 1), 0) as porcentaje_ocupacion,
                COUNT(res.reserva_id) as total_reservas,
                e.estado_estado as estado_ruta,
                CASE
                    WHEN v.vehiculo_capacidad = 0 THEN 'SIN_VEHICULO'
                    WHEN IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) = 0 THEN 'DISPONIBLE'
                    WHEN IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) < (v.vehiculo_capacidad * 0.8) THEN 'DISPONIBLE'
                    WHEN IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) < v.vehiculo_capacidad THEN 'CASI_LLENO'
                    ELSE 'COMPLETO'
                END as status_disponibilidad
            FROM ruta_activada ra
            JOIN servicio s ON ra.servicio_id = s.servicio_id
            JOIN ruta r ON ra.ruta_id = r.ruta_id
            JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
            JOIN estado e ON ra.estado_id = e.estado_id
            LEFT JOIN reserva res ON ra.ruta_activada_id = res.ruta_activada_id
                                   AND res.reserva_situacion = 1
            WHERE ra.ruta_activada_situacion = 1
            GROUP BY ra.ruta_activada_id, ra.ruta_activada_codigo, ra.ruta_activada_fecha_hora,
                     s.servicio_servicio, r.ruta_origen, r.ruta_destino,
                     v.vehiculo_placa, v.vehiculo_capacidad, e.estado_estado
            ORDER BY ra.ruta_activada_fecha_hora
        ");

        // VISTA 2: Reservas completas (ABSTRACTA) - SIN FACTURAS Y DATETIME UNIFICADO
        DB::statement("
            CREATE VIEW v_reservas_completas AS
            SELECT
                res.reserva_id,
                res.reserva_codigo,
                res.reserva_nombres_cliente,
                res.reserva_apellidos_cliente,
                res.reserva_telefono_cliente,
                res.reserva_cantidad_adultos,
                res.reserva_cantidad_ninos,
                (res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)) as reserva_total_pasajeros,
                res.reserva_monto,
                res.reserva_direccion_abordaje,
                res.created_at as fecha_reserva,
                s.servicio_servicio,
                s.servicio_precio_normal,
                s.servicio_precio_descuento,
                CONCAT(r.ruta_origen, ' -> ', r.ruta_destino) as ruta_completa,
                DATE(ra.ruta_activada_fecha_hora) as fecha_viaje,
                TIME(ra.ruta_activada_fecha_hora) as hora_salida,
                v.vehiculo_placa,
                v.vehiculo_marca,
                v.vehiculo_modelo,
                v.vehiculo_capacidad,
                er.estado_estado as estado_reserva,
                era.estado_estado as estado_ruta,
                a.agencia_razon_social,
                a.agencia_telefono as telefono_agencia,
                CONCAT(p.persona_nombres, ' ', p.persona_apellidos) as vendedor,
                CASE WHEN res.agencia_id IS NOT NULL THEN 'AGENCIA' ELSE 'DIRECTO' END as tipo_venta,
                CASE WHEN LOWER(er.estado_estado) = 'ejecutada' THEN 'FACTURADO' ELSE 'PENDIENTE' END as estado_factura
            FROM reserva res
            JOIN ruta_activada ra ON res.ruta_activada_id = ra.ruta_activada_id
            JOIN servicio s ON ra.servicio_id = s.servicio_id
            JOIN ruta r ON ra.ruta_id = r.ruta_id
            JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
            JOIN estado er ON res.estado_id = er.estado_id
            JOIN estado era ON ra.estado_id = era.estado_id
            JOIN usuario u ON res.usuario_id = u.usuario_id
            JOIN persona p ON u.persona_id = p.persona_id
            LEFT JOIN agencia a ON res.agencia_id = a.agencia_id
            WHERE res.reserva_situacion = 1
            ORDER BY res.created_at DESC
        ");

        // VISTA 3: Ingresos diarios (ABSTRACTA - SIN TABLA FACTURAS)
        DB::statement("
            CREATE VIEW v_ingresos_diarios AS
            SELECT
                DATE(res.created_at) as fecha,
                COUNT(res.reserva_id) as total_reservas,
                SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)) as total_pasajeros,
                SUM(IFNULL(res.reserva_monto, 0)) as ingresos_brutos,
                SUM(CASE WHEN res.agencia_id IS NOT NULL
                         THEN IFNULL(res.reserva_monto, 0) * 0.10
                         ELSE 0 END) as comisiones_agencias,
                SUM(IFNULL(res.reserva_monto, 0)) - SUM(CASE WHEN res.agencia_id IS NOT NULL
                                                  THEN IFNULL(res.reserva_monto, 0) * 0.10
                                                  ELSE 0 END) as ingresos_netos,
                COUNT(CASE WHEN res.agencia_id IS NOT NULL THEN 1 END) as reservas_agencia,
                COUNT(CASE WHEN res.agencia_id IS NULL THEN 1 END) as reservas_directas,
                GROUP_CONCAT(DISTINCT s.servicio_servicio SEPARATOR ', ') as servicios_vendidos
            FROM reserva res
            JOIN ruta_activada ra ON res.ruta_activada_id = ra.ruta_activada_id
            JOIN servicio s ON ra.servicio_id = s.servicio_id
            JOIN estado er ON res.estado_id = er.estado_id
            WHERE res.reserva_situacion = 1
              AND DATE(res.created_at) >= CURDATE() - INTERVAL 30 DAY
            GROUP BY DATE(res.created_at)
            ORDER BY fecha DESC
        ");
    }

    /**
     * Rollback - Eliminar toda la automatización
     */
    public function down()
    {
        // Eliminar vistas
        DB::statement('DROP VIEW IF EXISTS v_ingresos_diarios');
        DB::statement('DROP VIEW IF EXISTS v_reservas_completas');
        DB::statement('DROP VIEW IF EXISTS v_ocupacion_rutas');

        // Eliminar funciones
        DB::unprepared('DROP FUNCTION IF EXISTS fn_verificar_disponibilidad');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_calcular_precio_reserva');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_asignar_ruta_automatica');

        // Eliminar triggers
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_alerta_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_control_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_actualizar_monto');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_calcular_monto');
    }
};
