<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN AUTOMATIZACIÓN MAGIC TRAVEL v2.0 - CORREGIDA
     * Triggers, funciones y vistas para automatización completa del negocio
     * Implementa toda la lógica acordada de automatización
     */
    public function up()
    {
        $this->createBusinessTriggers();
        $this->createBusinessFunctions();
        $this->createBusinessViews();
    }

    /**
     * Crear triggers de automatización del negocio
     */
    private function createBusinessTriggers()
    {
        // TRIGGER 1: Calcular monto automáticamente en RESERVA
        DB::unprepared("
            CREATE TRIGGER tr_reserva_calcular_monto
            BEFORE INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE precio_adulto DECIMAL(10,2);
                DECLARE precio_descuento DECIMAL(10,2);
                DECLARE es_agencia INT;

                -- Obtener precios del servicio via ruta_activada
                SELECT s.servicio_precio_normal, s.servicio_precio_descuento
                INTO precio_adulto, precio_descuento
                FROM ruta_activada ra
                JOIN servicio s ON ra.servicio_id = s.servicio_id
                WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                -- Verificar si es reserva de agencia
                SET es_agencia = IF(NEW.agencia_id IS NOT NULL, 1, 0);

                -- Calcular monto automáticamente
                IF es_agencia = 1 THEN
                    SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_descuento) +
                                          (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_descuento * 0.5));
                ELSE
                    SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_adulto) +
                                          (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_adulto * 0.5));
                END IF;

                -- CORRECCIÓN: No asignar campo calculado automático
                -- El campo reserva_total_pasajeros se calcula automáticamente por storedAs()
            END
        ");

        // TRIGGER 2: Actualizar monto si se modifican cantidades
        DB::unprepared("
            CREATE TRIGGER tr_reserva_actualizar_monto
            BEFORE UPDATE ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE precio_adulto DECIMAL(10,2);
                DECLARE precio_descuento DECIMAL(10,2);
                DECLARE es_agencia INT;

                -- Solo recalcular si cambiaron cantidades
                IF NEW.reserva_cantidad_adultos != OLD.reserva_cantidad_adultos
                   OR NEW.reserva_cantidad_ninos != OLD.reserva_cantidad_ninos THEN

                    -- Obtener precios del servicio
                    SELECT s.servicio_precio_normal, s.servicio_precio_descuento
                    INTO precio_adulto, precio_descuento
                    FROM ruta_activada ra
                    JOIN servicio s ON ra.servicio_id = s.servicio_id
                    WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                    SET es_agencia = IF(NEW.agencia_id IS NOT NULL, 1, 0);

                    -- Recalcular monto
                    IF es_agencia = 1 THEN
                        SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_descuento) +
                                              (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_descuento * 0.5));
                    ELSE
                        SET NEW.reserva_monto = (NEW.reserva_cantidad_adultos * precio_adulto) +
                                              (IFNULL(NEW.reserva_cantidad_ninos, 0) * (precio_adulto * 0.5));
                    END IF;
                END IF;
            END
        ");

        // TRIGGER 3: Auto-generar factura cuando reserva se ejecuta
        DB::unprepared("
            CREATE TRIGGER tr_reserva_generar_factura
            AFTER UPDATE ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE estado_ejecutada INT DEFAULT 0;
                DECLARE estado_confirmada INT DEFAULT 0;
                DECLARE nuevo_codigo_factura VARCHAR(45);
                DECLARE servicio_reserva INT;

                -- CORRECCIÓN: Verificar que existan los estados antes de usarlos
                SELECT IFNULL((SELECT estado_id FROM estado WHERE estado_codigo = 'RES_EJEC' LIMIT 1), 0) INTO estado_ejecutada;
                SELECT IFNULL((SELECT estado_id FROM estado WHERE estado_codigo = 'RES_CONF' LIMIT 1), 0) INTO estado_confirmada;

                -- Solo proceder si los estados existen
                IF estado_ejecutada > 0 AND estado_confirmada > 0 THEN
                    -- Si cambió a estado ejecutada desde confirmada
                    IF NEW.estado_id = estado_ejecutada AND OLD.estado_id = estado_confirmada THEN

                        -- Obtener servicio_id de la reserva
                        SELECT ra.servicio_id INTO servicio_reserva
                        FROM ruta_activada ra
                        WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                        -- Generar código de factura único
                        SET nuevo_codigo_factura = CONCAT('FAC-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(NEW.reserva_id, 4, '0'));

                        -- Crear factura automáticamente
                        INSERT INTO facturas (
                            facturas_codigo,
                            facturas_fecha,
                            facturas_situacion,
                            usuario_id,
                            servicio_id,
                            reserva_id,
                            created_at,
                            created_by
                        ) VALUES (
                            nuevo_codigo_factura,
                            NOW(),
                            1,
                            NEW.usuario_id,
                            servicio_reserva,
                            NEW.reserva_id,
                            NOW(),
                            COALESCE(NEW.updated_by, NEW.usuario_id)
                        );
                    END IF;
                END IF;
            END
        ");

        // TRIGGER 4: Control de capacidad de vehículo (CORREGIDO)
        DB::unprepared("
            CREATE TRIGGER tr_reserva_control_capacidad
            BEFORE INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE capacidad_vehiculo INT;
                DECLARE ocupacion_actual INT;
                DECLARE nueva_ocupacion INT;
                DECLARE espacio_disponible INT;
                DECLARE mensaje_error TEXT;

                -- Obtener capacidad del vehículo asignado
                SELECT v.vehiculo_capacidad INTO capacidad_vehiculo
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                -- CORRECCIÓN: Calcular ocupación usando cálculo manual (no campo calculado)
                SELECT IFNULL(SUM(reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)), 0) INTO ocupacion_actual
                FROM reserva r
                WHERE r.ruta_activada_id = NEW.ruta_activada_id
                AND r.reserva_situacion = 1;

                -- Calcular nueva ocupación
                SET nueva_ocupacion = ocupacion_actual + (NEW.reserva_cantidad_adultos + IFNULL(NEW.reserva_cantidad_ninos, 0));

                -- Verificar si excede capacidad
                IF nueva_ocupacion > capacidad_vehiculo THEN
                    SET espacio_disponible = capacidad_vehiculo - ocupacion_actual;

                    -- Construir mensaje de error usando variable
                    SET mensaje_error = CONCAT('CAPACIDAD EXCEDIDA: Vehiculo tiene ', capacidad_vehiculo,
                                              ' asientos. Ocupacion actual: ', ocupacion_actual,
                                              '. Espacios disponibles: ', espacio_disponible,
                                              '. Pasajeros solicitados: ', (NEW.reserva_cantidad_adultos + IFNULL(NEW.reserva_cantidad_ninos, 0)));

                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = mensaje_error;
                END IF;
            END
        ");

        // TRIGGER 5: Notificación de capacidad al 80% (SIN SELECT)
        DB::unprepared("
            CREATE TRIGGER tr_reserva_alerta_capacidad
            AFTER INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE capacidad_vehiculo INT;
                DECLARE ocupacion_actual INT;
                DECLARE porcentaje_ocupacion DECIMAL(5,2);

                -- CORRECCIÓN: Calcular ocupación después del insert usando cálculo manual
                SELECT v.vehiculo_capacidad,
                       IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0)
                INTO capacidad_vehiculo, ocupacion_actual
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                LEFT JOIN reserva r ON r.ruta_activada_id = ra.ruta_activada_id AND r.reserva_situacion = 1
                WHERE ra.ruta_activada_id = NEW.ruta_activada_id
                GROUP BY v.vehiculo_capacidad;

                SET porcentaje_ocupacion = (ocupacion_actual / capacidad_vehiculo) * 100;

                -- Si ocupación >= 80%, registrar en auditoria (eliminamos SELECT porque triggers no pueden retornar datos)
                IF porcentaje_ocupacion >= 80 THEN
                    -- La aplicación puede monitorear este trigger mediante los logs de auditoría
                    -- O se puede crear una tabla de alertas después si es necesario
                    SET @alerta_capacidad = CONCAT('ALERTA: Ruta ', NEW.ruta_activada_id,
                                 ' al ', ROUND(porcentaje_ocupacion, 1), '% de capacidad (',
                                 ocupacion_actual, '/', capacidad_vehiculo, ')');
                END IF;
            END
        ");

        // TRIGGER 6: Cambio automático de estado de ruta_activada
        DB::unprepared("
            CREATE TRIGGER tr_ruta_activada_cambio_estado
            AFTER UPDATE ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE total_reservas_ejecutadas INT;
                DECLARE total_reservas_confirmadas INT;
                DECLARE estado_iniciada INT DEFAULT 0;
                DECLARE estado_finalizada INT DEFAULT 0;

                -- CORRECCIÓN: Verificar que existan los estados antes de usarlos
                SELECT IFNULL((SELECT estado_id FROM estado WHERE estado_codigo = 'RUT_INIC' LIMIT 1), 0) INTO estado_iniciada;
                SELECT IFNULL((SELECT estado_id FROM estado WHERE estado_codigo = 'RUT_FIN' LIMIT 1), 0) INTO estado_finalizada;

                -- Solo proceder si los estados existen
                IF estado_iniciada > 0 AND estado_finalizada > 0 THEN
                    -- Contar reservas en diferentes estados para esta ruta
                    SELECT
                        SUM(CASE WHEN estado_id = (SELECT estado_id FROM estado WHERE estado_codigo = 'RES_EJEC' LIMIT 1) THEN 1 ELSE 0 END),
                        SUM(CASE WHEN estado_id = (SELECT estado_id FROM estado WHERE estado_codigo = 'RES_CONF' LIMIT 1) THEN 1 ELSE 0 END)
                    INTO total_reservas_ejecutadas, total_reservas_confirmadas
                    FROM reserva
                    WHERE ruta_activada_id = NEW.ruta_activada_id
                    AND reserva_situacion = 1;

                    -- Si hay reservas ejecutándose, cambiar ruta a iniciada
                    IF total_reservas_ejecutadas > 0 THEN
                        UPDATE ruta_activada
                        SET estado_id = estado_iniciada,
                            updated_at = NOW(),
                            updated_by = COALESCE(NEW.updated_by, NEW.usuario_id)
                        WHERE ruta_activada_id = NEW.ruta_activada_id
                        AND estado_id != estado_iniciada;
                    END IF;

                    -- Si todas las reservas confirmadas están ejecutadas, finalizar ruta
                    IF total_reservas_confirmadas = 0 AND total_reservas_ejecutadas > 0 THEN
                        UPDATE ruta_activada
                        SET estado_id = estado_finalizada,
                            updated_at = NOW(),
                            updated_by = COALESCE(NEW.updated_by, NEW.usuario_id)
                        WHERE ruta_activada_id = NEW.ruta_activada_id;
                    END IF;
                END IF;
            END
        ");
    }

    /**
     * Crear funciones de automatización
     */
    private function createBusinessFunctions()
    {
        // FUNCIÓN 1: Asignar ruta automáticamente
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
                DECLARE v_capacidad_disponible INT DEFAULT 0;

                -- CORRECCIÓN: Usar cálculo manual en lugar de campo calculado
                SELECT ra.ruta_activada_id,
                       (v.vehiculo_capacidad - IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0)) as disponible
                INTO v_ruta_activada_id, v_capacidad_disponible
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                LEFT JOIN reserva r ON r.ruta_activada_id = ra.ruta_activada_id AND r.reserva_situacion = 1
                WHERE ra.servicio_id = p_servicio_id
                  AND DATE(ra.ruta_activada_fecha) = p_fecha
                  AND ra.ruta_activada_situacion = 1
                GROUP BY ra.ruta_activada_id, v.vehiculo_capacidad
                HAVING disponible >= p_pasajeros
                ORDER BY disponible ASC  -- Llenar rutas balanceadamente
                LIMIT 1;

                RETURN IFNULL(v_ruta_activada_id, 0);
            END
        ");

        // FUNCIÓN 2: Calcular precio para reserva
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
                DECLARE v_precio_adulto DECIMAL(10,2);
                DECLARE v_precio_descuento DECIMAL(10,2);
                DECLARE v_total DECIMAL(10,2);

                -- Obtener precios del servicio
                SELECT servicio_precio_normal, servicio_precio_descuento
                INTO v_precio_adulto, v_precio_descuento
                FROM servicio
                WHERE servicio_id = p_servicio_id;

                -- Calcular total según tipo de cliente
                IF p_es_agencia THEN
                    SET v_total = (p_adultos * v_precio_descuento) +
                                 (IFNULL(p_ninos, 0) * (v_precio_descuento * 0.5));
                ELSE
                    SET v_total = (p_adultos * v_precio_adulto) +
                                 (IFNULL(p_ninos, 0) * (v_precio_adulto * 0.5));
                END IF;

                RETURN v_total;
            END
        ");

        //  CORRECCIÓN: Cambiar función JSON por TEXT para compatibilidad MariaDB
        DB::unprepared("
            CREATE FUNCTION fn_verificar_disponibilidad(
                p_ruta_activada_id INT,
                p_pasajeros INT
            ) RETURNS TEXT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_capacidad INT;
                DECLARE v_ocupado INT;
                DECLARE v_disponible INT;
                DECLARE v_resultado TEXT;

                -- CORRECCIÓN: Usar cálculo manual para ocupación
                SELECT v.vehiculo_capacidad,
                       IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0)
                INTO v_capacidad, v_ocupado
                FROM ruta_activada ra
                JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                LEFT JOIN reserva r ON r.ruta_activada_id = ra.ruta_activada_id AND r.reserva_situacion = 1
                WHERE ra.ruta_activada_id = p_ruta_activada_id
                GROUP BY v.vehiculo_capacidad;

                SET v_disponible = v_capacidad - v_ocupado;

                -- CORRECCIÓN: Crear resultado como JSON string (compatibilidad MariaDB)
                SET v_resultado = CONCAT('{',
                    '\"capacidad_total\":', v_capacidad, ',',
                    '\"ocupacion_actual\":', v_ocupado, ',',
                    '\"espacios_disponibles\":', v_disponible, ',',
                    '\"puede_acomodar\":', IF(v_disponible >= p_pasajeros, 'true', 'false'), ',',
                    '\"porcentaje_ocupacion\":', ROUND((v_ocupado / v_capacidad) * 100, 1),
                    '}');

                RETURN v_resultado;
            END
        ");
    }

    /**
     * Crear vistas para el dashboard y reportes
     */
    private function createBusinessViews()
    {
        // CORRECCIÓN: Usar cálculos manuales en lugar de campo calculado en vistas
        DB::statement("
            CREATE VIEW v_ocupacion_rutas AS
            SELECT
                ra.ruta_activada_id,
                ra.ruta_activada_codigo,
                DATE(ra.ruta_activada_fecha) as fecha_operacion,
                TIME(ra.ruta_activada_hora) as hora_salida,
                s.servicio_servicio as servicio,
                CONCAT(r.ruta_origen, ' -> ', r.ruta_destino) as ruta,
                v.vehiculo_placa,
                v.vehiculo_capacidad as capacidad_total,
                IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                (v.vehiculo_capacidad - IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0)) as espacios_disponibles,
                ROUND((IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) / v.vehiculo_capacidad) * 100, 1) as porcentaje_ocupacion,
                COUNT(res.reserva_id) as total_reservas,
                e.estado_estado as estado_ruta,
                CASE
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
              AND DATE(ra.ruta_activada_fecha) >= CURDATE() - INTERVAL 1 DAY
            GROUP BY ra.ruta_activada_id, ra.ruta_activada_codigo, ra.ruta_activada_fecha,
                     ra.ruta_activada_hora, s.servicio_servicio, r.ruta_origen, r.ruta_destino,
                     v.vehiculo_placa, v.vehiculo_capacidad, e.estado_estado
            ORDER BY ra.ruta_activada_fecha, ra.ruta_activada_hora
        ");

        // VISTA 2: Reservas completas con toda la información
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

                -- Información del servicio
                s.servicio_servicio,
                s.servicio_precio_normal,
                s.servicio_precio_descuento,

                -- Información de la ruta
                CONCAT(r.ruta_origen, ' -> ', r.ruta_destino) as ruta_completa,
                DATE(ra.ruta_activada_fecha) as fecha_viaje,
                TIME(ra.ruta_activada_hora) as hora_salida,

                -- Información del vehículo
                v.vehiculo_placa,
                v.vehiculo_marca,
                v.vehiculo_modelo,
                v.vehiculo_capacidad,

                -- Estados
                er.estado_estado as estado_reserva,
                era.estado_estado as estado_ruta,

                -- Información de agencia (si aplica)
                a.agencia_razon_social,
                a.agencia_telefono as telefono_agencia,

                -- Usuario vendedor
                CONCAT(p.persona_nombres, ' ', p.persona_apellidos) as vendedor,

                -- Información financiera
                CASE WHEN res.agencia_id IS NOT NULL THEN 'AGENCIA' ELSE 'DIRECTO' END as tipo_venta,
                CASE WHEN f.facturas_id IS NOT NULL THEN 'FACTURADO' ELSE 'PENDIENTE' END as estado_factura

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
            LEFT JOIN facturas f ON res.reserva_id = f.reserva_id
            WHERE res.reserva_situacion = 1
            ORDER BY res.created_at DESC
        ");

        // VISTA 3: Ingresos diarios
        DB::statement("
            CREATE VIEW v_ingresos_diarios AS
            SELECT
                DATE(res.created_at) as fecha,
                COUNT(res.reserva_id) as total_reservas,
                SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)) as total_pasajeros,
                SUM(res.reserva_monto) as ingresos_brutos,
                SUM(CASE WHEN res.agencia_id IS NOT NULL
                         THEN res.reserva_monto * 0.10
                         ELSE 0 END) as comisiones_agencias,
                SUM(res.reserva_monto) - SUM(CASE WHEN res.agencia_id IS NOT NULL
                                                  THEN res.reserva_monto * 0.10
                                                  ELSE 0 END) as ingresos_netos,
                COUNT(CASE WHEN res.agencia_id IS NOT NULL THEN 1 END) as reservas_agencia,
                COUNT(CASE WHEN res.agencia_id IS NULL THEN 1 END) as reservas_directas,

                -- Distribución por servicio
                GROUP_CONCAT(DISTINCT s.servicio_servicio SEPARATOR ', ') as servicios_vendidos,

                -- Estado promedio de conversión
                ROUND((COUNT(CASE WHEN er.estado_codigo IN ('RES_CONF', 'RES_EJEC', 'RES_FIN') THEN 1 END)
                      / COUNT(*)) * 100, 1) as porcentaje_conversion

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
        DB::unprepared('DROP TRIGGER IF EXISTS tr_ruta_activada_cambio_estado');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_alerta_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_control_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_generar_factura');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_actualizar_monto');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_calcular_monto');
    }
};
