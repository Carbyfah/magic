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
     * CON SOPORTE PARA TOURS
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
        // TRIGGER 1: Calcular monto automáticamente en RESERVA (ABSTRACTO) - CON TOURS
        DB::unprepared("
            CREATE TRIGGER tr_reserva_calcular_monto
            BEFORE INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE precio_adulto DECIMAL(10,2) DEFAULT 0;
                DECLARE precio_descuento DECIMAL(10,2) DEFAULT 0;
                DECLARE es_agencia INT DEFAULT 0;

                -- Verificar si es reserva de agencia (abstracto)
                SET es_agencia = IF(NEW.agencia_id IS NOT NULL, 1, 0);

                -- Obtener precios según tipo de reserva
                IF NEW.ruta_activada_id IS NOT NULL THEN
                    -- Reserva de RUTA: obtener precios via ruta_activada
                    SELECT IFNULL(s.servicio_precio_normal, 0), IFNULL(s.servicio_precio_descuento, 0)
                    INTO precio_adulto, precio_descuento
                    FROM ruta_activada ra
                    JOIN servicio s ON ra.servicio_id = s.servicio_id
                    WHERE ra.ruta_activada_id = NEW.ruta_activada_id;
                ELSEIF NEW.tour_activado_id IS NOT NULL THEN
                    -- Reserva de TOUR: obtener precios via tour_activado
                    SELECT IFNULL(s.servicio_precio_normal, 0), IFNULL(s.servicio_precio_descuento, 0)
                    INTO precio_adulto, precio_descuento
                    FROM tour_activado ta
                    JOIN servicio s ON ta.servicio_id = s.servicio_id
                    WHERE ta.tour_activado_id = NEW.tour_activado_id;
                END IF;

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

        // TRIGGER 2: Actualizar monto si se modifican cantidades (ABSTRACTO) - CON TOURS
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

                    SET es_agencia = IF(NEW.agencia_id IS NOT NULL, 1, 0);

                    -- Obtener precios según tipo de reserva
                    IF NEW.ruta_activada_id IS NOT NULL THEN
                        -- Reserva de RUTA
                        SELECT IFNULL(s.servicio_precio_normal, 0), IFNULL(s.servicio_precio_descuento, 0)
                        INTO precio_adulto, precio_descuento
                        FROM ruta_activada ra
                        JOIN servicio s ON ra.servicio_id = s.servicio_id
                        WHERE ra.ruta_activada_id = NEW.ruta_activada_id;
                    ELSEIF NEW.tour_activado_id IS NOT NULL THEN
                        -- Reserva de TOUR
                        SELECT IFNULL(s.servicio_precio_normal, 0), IFNULL(s.servicio_precio_descuento, 0)
                        INTO precio_adulto, precio_descuento
                        FROM tour_activado ta
                        JOIN servicio s ON ta.servicio_id = s.servicio_id
                        WHERE ta.tour_activado_id = NEW.tour_activado_id;
                    END IF;

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

        // TRIGGER 3: Control de capacidad de vehículo (ABSTRACTO) - SOLO PARA RUTAS
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

                -- SOLO validar capacidad para RUTAS (los tours no tienen límite)
                IF NEW.ruta_activada_id IS NOT NULL THEN
                    -- Obtener capacidad del vehículo asignado
                    SELECT IFNULL(v.vehiculo_capacidad, 0) INTO capacidad_vehiculo
                    FROM ruta_activada ra
                    JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
                    WHERE ra.ruta_activada_id = NEW.ruta_activada_id;

                    -- Solo validar si el vehículo tiene capacidad definida
                    IF capacidad_vehiculo > 0 THEN
                        -- Calcular ocupación actual (solo reservas activas de la misma ruta)
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
                END IF;
                -- Los TOURS no necesitan validación de capacidad
            END
        ");

        // TRIGGER 4: Alerta de capacidad al 80% (ABSTRACTO) - SOLO PARA RUTAS
        DB::unprepared("
            CREATE TRIGGER tr_reserva_alerta_capacidad
            AFTER INSERT ON reserva
            FOR EACH ROW
            BEGIN
                DECLARE capacidad_vehiculo INT DEFAULT 0;
                DECLARE ocupacion_actual INT DEFAULT 0;
                DECLARE porcentaje_ocupacion DECIMAL(5,2) DEFAULT 0;

                -- SOLO generar alertas para RUTAS (los tours no tienen capacidad)
                IF NEW.ruta_activada_id IS NOT NULL THEN
                    -- Obtener capacidad y ocupación actual
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
                END IF;
                -- Los TOURS no generan alertas de capacidad
            END
        ");
    }

    /**
     * Crear funciones 100% abstractas
     */
    private function createAbstractFunctions()
    {
        // FUNCIÓN 1: Asignar ruta automáticamente (ABSTRACTA) - SOLO RUTAS
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

                -- Buscar RUTA con espacio disponible (genérico)
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

        // FUNCIÓN 2: Buscar tour disponible (NUEVA) - SOLO TOURS
        DB::unprepared("
            CREATE FUNCTION fn_buscar_tour_disponible(
                p_servicio_id INT,
                p_fecha DATE
            ) RETURNS INT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_tour_activado_id INT DEFAULT 0;

                -- Buscar TOUR disponible (sin límite de capacidad)
                SELECT ta.tour_activado_id
                INTO v_tour_activado_id
                FROM tour_activado ta
                WHERE ta.servicio_id = p_servicio_id
                  AND DATE(ta.tour_activado_fecha_hora) = p_fecha
                  AND ta.tour_activado_situacion = 1
                ORDER BY ta.tour_activado_fecha_hora ASC
                LIMIT 1;

                RETURN IFNULL(v_tour_activado_id, 0);
            END
        ");

        // FUNCIÓN 3: Calcular precio para reserva (ABSTRACTA) - CON TOURS
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

        // FUNCIÓN 4: Verificar disponibilidad (ABSTRACTA) - SOLO RUTAS
        DB::unprepared("
            CREATE FUNCTION fn_verificar_disponibilidad_ruta(
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

                -- Obtener capacidad y ocupación actual para RUTAS
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

        // FUNCIÓN 5: Verificar disponibilidad tour (NUEVA) - SOLO TOURS
        DB::unprepared("
            CREATE FUNCTION fn_verificar_disponibilidad_tour(
                p_tour_activado_id INT
            ) RETURNS TEXT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_total_reservas INT DEFAULT 0;
                DECLARE v_resultado TEXT;

                -- Contar reservas del tour
                SELECT IFNULL(COUNT(r.reserva_id), 0)
                INTO v_total_reservas
                FROM reserva r
                WHERE r.tour_activado_id = p_tour_activado_id
                AND r.reserva_situacion = 1;

                -- Crear resultado como JSON string (tours no tienen límite)
                SET v_resultado = CONCAT('{',
                    '\"tipo\":\"tour\",',
                    '\"total_reservas\":', v_total_reservas, ',',
                    '\"sin_limite_capacidad\":true,',
                    '\"siempre_disponible\":true',
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
        // VISTA 1: Ocupación de rutas (ABSTRACTA) - SOLO RUTAS
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

        // VISTA 2: Información de tours (NUEVA) - SOLO TOURS
        DB::statement("
            CREATE VIEW v_info_tours AS
            SELECT
                ta.tour_activado_id,
                ta.tour_activado_codigo,
                DATE(ta.tour_activado_fecha_hora) as fecha_operacion,
                TIME(ta.tour_activado_fecha_hora) as hora_inicio,
                s.servicio_servicio as servicio,
                ta.tour_activado_descripcion as descripcion,
                ta.tour_activado_punto_encuentro as punto_encuentro,
                ta.tour_activado_duracion_horas as duracion_horas,
                IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) as total_pasajeros,
                COUNT(res.reserva_id) as total_reservas,
                e.estado_estado as estado_tour,
                CONCAT(p.persona_nombres, ' ', p.persona_apellidos) as guia_responsable,
                'SIN_LIMITE' as capacidad_info,
                'SIEMPRE_DISPONIBLE' as status_disponibilidad
            FROM tour_activado ta
            JOIN servicio s ON ta.servicio_id = s.servicio_id
            JOIN estado e ON ta.estado_id = e.estado_id
            LEFT JOIN persona p ON ta.persona_id = p.persona_id
            LEFT JOIN reserva res ON ta.tour_activado_id = res.tour_activado_id
                                   AND res.reserva_situacion = 1
            WHERE ta.tour_activado_situacion = 1
            GROUP BY ta.tour_activado_id, ta.tour_activado_codigo, ta.tour_activado_fecha_hora,
                     s.servicio_servicio, ta.tour_activado_descripcion, ta.tour_activado_punto_encuentro,
                     ta.tour_activado_duracion_horas, e.estado_estado, p.persona_nombres, p.persona_apellidos
            ORDER BY ta.tour_activado_fecha_hora
        ");

        // VISTA 3: Reservas completas (ABSTRACTA) - RUTAS Y TOURS UNIFICADOS
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

                CASE
                    WHEN res.ruta_activada_id IS NOT NULL THEN CONCAT(r.ruta_origen, ' -> ', r.ruta_destino)
                    WHEN res.tour_activado_id IS NOT NULL THEN IFNULL(ta.tour_activado_descripcion, 'Tour')
                    ELSE 'N/A'
                END as servicio_detalle,

                CASE
                    WHEN res.ruta_activada_id IS NOT NULL THEN DATE(ra.ruta_activada_fecha_hora)
                    WHEN res.tour_activado_id IS NOT NULL THEN DATE(ta.tour_activado_fecha_hora)
                    ELSE NULL
                END as fecha_servicio,

                CASE
                    WHEN res.ruta_activada_id IS NOT NULL THEN TIME(ra.ruta_activada_fecha_hora)
                    WHEN res.tour_activado_id IS NOT NULL THEN TIME(ta.tour_activado_fecha_hora)
                    ELSE NULL
                END as hora_servicio,

                CASE
                    WHEN res.ruta_activada_id IS NOT NULL THEN v.vehiculo_placa
                    WHEN res.tour_activado_id IS NOT NULL THEN 'N/A (Tour)'
                    ELSE 'N/A'
                END as vehiculo_info,

                CASE
                    WHEN res.ruta_activada_id IS NOT NULL THEN 'RUTA'
                    WHEN res.tour_activado_id IS NOT NULL THEN 'TOUR'
                    ELSE 'INDEFINIDO'
                END as tipo_servicio,

                er.estado_estado as estado_reserva,
                a.agencia_razon_social,
                a.agencia_telefono as telefono_agencia,
                CONCAT(p.persona_nombres, ' ', p.persona_apellidos) as vendedor,
                CASE WHEN res.agencia_id IS NOT NULL THEN 'AGENCIA' ELSE 'DIRECTO' END as tipo_venta,
                CASE WHEN LOWER(er.estado_estado) = 'ejecutada' THEN 'FACTURADO' ELSE 'PENDIENTE' END as estado_factura

            FROM reserva res
            JOIN estado er ON res.estado_id = er.estado_id
            JOIN usuario u ON res.usuario_id = u.usuario_id
            JOIN persona p ON u.persona_id = p.persona_id
            LEFT JOIN agencia a ON res.agencia_id = a.agencia_id
            LEFT JOIN ruta_activada ra ON res.ruta_activada_id = ra.ruta_activada_id
            LEFT JOIN tour_activado ta ON res.tour_activado_id = ta.tour_activado_id
            LEFT JOIN servicio s ON (ra.servicio_id = s.servicio_id OR ta.servicio_id = s.servicio_id)
            LEFT JOIN ruta r ON ra.ruta_id = r.ruta_id
            LEFT JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id

            WHERE res.reserva_situacion = 1
            ORDER BY res.created_at DESC
        ");

        // VISTA 5: Dashboard unificado (NUEVA) - RUTAS Y TOURS
        DB::statement("
            CREATE VIEW v_dashboard_unificado AS
            SELECT
                'RUTA' as tipo_servicio,
                ra.ruta_activada_id as servicio_id,
                ra.ruta_activada_codigo as codigo,
                DATE(ra.ruta_activada_fecha_hora) as fecha,
                TIME(ra.ruta_activada_fecha_hora) as hora,
                s.servicio_servicio as servicio,
                CONCAT(r.ruta_origen, ' -> ', r.ruta_destino) as detalle,
                v.vehiculo_placa as info_adicional,
                v.vehiculo_capacidad as capacidad_maxima,
                IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                COUNT(res.reserva_id) as total_reservas,
                IFNULL(SUM(res.reserva_monto), 0) as ingresos_estimados,
                e.estado_estado as estado
            FROM ruta_activada ra
            JOIN servicio s ON ra.servicio_id = s.servicio_id
            JOIN ruta r ON ra.ruta_id = r.ruta_id
            JOIN vehiculo v ON ra.vehiculo_id = v.vehiculo_id
            JOIN estado e ON ra.estado_id = e.estado_id
            LEFT JOIN reserva res ON ra.ruta_activada_id = res.ruta_activada_id AND res.reserva_situacion = 1
            WHERE ra.ruta_activada_situacion = 1
            GROUP BY ra.ruta_activada_id, ra.ruta_activada_codigo, ra.ruta_activada_fecha_hora,
                     s.servicio_servicio, r.ruta_origen, r.ruta_destino, v.vehiculo_placa,
                     v.vehiculo_capacidad, e.estado_estado

            UNION ALL

            SELECT
                'TOUR' as tipo_servicio,
                ta.tour_activado_id as servicio_id,
                ta.tour_activado_codigo as codigo,
                DATE(ta.tour_activado_fecha_hora) as fecha,
                TIME(ta.tour_activado_fecha_hora) as hora,
                s.servicio_servicio as servicio,
                IFNULL(ta.tour_activado_descripcion, 'Tour') as detalle,
                IFNULL(ta.tour_activado_punto_encuentro, 'N/A') as info_adicional,
                NULL as capacidad_maxima,
                IFNULL(SUM(res.reserva_cantidad_adultos + IFNULL(res.reserva_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                COUNT(res.reserva_id) as total_reservas,
                IFNULL(SUM(res.reserva_monto), 0) as ingresos_estimados,
                e.estado_estado as estado
            FROM tour_activado ta
            JOIN servicio s ON ta.servicio_id = s.servicio_id
            JOIN estado e ON ta.estado_id = e.estado_id
            LEFT JOIN reserva res ON ta.tour_activado_id = res.tour_activado_id AND res.reserva_situacion = 1
            WHERE ta.tour_activado_situacion = 1
            GROUP BY ta.tour_activado_id, ta.tour_activado_codigo, ta.tour_activado_fecha_hora,
                     s.servicio_servicio, ta.tour_activado_descripcion, ta.tour_activado_punto_encuentro,
                     e.estado_estado

            ORDER BY fecha, hora
        ");
    }

    /**
     * Rollback - Eliminar toda la automatización
     */
    public function down()
    {
        // Eliminar vistas
        DB::statement('DROP VIEW IF EXISTS v_dashboard_unificado');
        DB::statement('DROP VIEW IF EXISTS v_ingresos_diarios');
        DB::statement('DROP VIEW IF EXISTS v_reservas_completas');
        DB::statement('DROP VIEW IF EXISTS v_info_tours');
        DB::statement('DROP VIEW IF EXISTS v_ocupacion_rutas');

        // Eliminar funciones
        DB::unprepared('DROP FUNCTION IF EXISTS fn_verificar_disponibilidad_tour');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_verificar_disponibilidad_ruta');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_calcular_precio_reserva');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_buscar_tour_disponible');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_asignar_ruta_automatica');

        // Eliminar triggers
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_alerta_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_control_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_actualizar_monto');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_calcular_monto');
    }
};
