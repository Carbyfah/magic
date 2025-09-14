<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN AUTOMATIZACIÓN MAGIC TRAVEL v3.0 - FINAL CORREGIDA
     * Triggers, funciones y vistas adaptados para nueva estructura
     * - Niños 25% descuento (no 50%)
     * - Usar servicio_precio_descuento y reservas_cobrar_a_pax
     * - Relaciones correctas con vehículos
     * - Estados de cuenta por agencias incluidos
     * - Mantener abstracción total
     */
    public function up()
    {
        $this->createAbstractTriggers();
        $this->createAbstractFunctions();
        $this->createAbstractViews();
    }

    /**
     * Crear triggers 100% abstractos para nueva estructura v3
     */
    private function createAbstractTriggers()
    {
        // TRIGGER 1: Calcular servicio_precio_descuento automáticamente
        DB::unprepared("
            CREATE TRIGGER tr_servicio_calcular_descuento
            BEFORE INSERT ON servicio
            FOR EACH ROW
            BEGIN
                -- Calcular precio con descuento automáticamente
                IF NEW.servicio_descuento_porcentaje IS NOT NULL AND NEW.servicio_descuento_porcentaje > 0 THEN
                    SET NEW.servicio_precio_descuento = NEW.precio_servicio * (1 - (NEW.servicio_descuento_porcentaje / 100));
                ELSE
                    SET NEW.servicio_precio_descuento = NEW.precio_servicio;
                END IF;
            END
        ");

        // TRIGGER 2: Actualizar servicio_precio_descuento cuando se modifica
        DB::unprepared("
            CREATE TRIGGER tr_servicio_actualizar_descuento
            BEFORE UPDATE ON servicio
            FOR EACH ROW
            BEGIN
                -- Solo recalcular si cambió precio base o porcentaje
                IF NEW.precio_servicio != OLD.precio_servicio
                   OR IFNULL(NEW.servicio_descuento_porcentaje, 0) != IFNULL(OLD.servicio_descuento_porcentaje, 0) THEN

                    IF NEW.servicio_descuento_porcentaje IS NOT NULL AND NEW.servicio_descuento_porcentaje > 0 THEN
                        SET NEW.servicio_precio_descuento = NEW.precio_servicio * (1 - (NEW.servicio_descuento_porcentaje / 100));
                    ELSE
                        SET NEW.servicio_precio_descuento = NEW.precio_servicio;
                    END IF;
                END IF;
            END
        ");

        // TRIGGER 3: Calcular reservas_cobrar_a_pax automáticamente en RESERVA
        DB::unprepared("
            CREATE TRIGGER tr_reserva_calcular_precio
            BEFORE INSERT ON reservas
            FOR EACH ROW
            BEGIN
                DECLARE precio_final DECIMAL(10,2) DEFAULT 0;
                DECLARE precio_ninos DECIMAL(10,2) DEFAULT 0;
                DECLARE total_calculado DECIMAL(10,2) DEFAULT 0;
                DECLARE tipo_servicio_actual ENUM('COLECTIVO', 'PRIVADO') DEFAULT 'COLECTIVO'; -- AGREGADO: variable para tipo

                -- Obtener precio del servicio Y su tipo (MODIFICADO: ahora obtenemos también el tipo)
                SELECT
                    IFNULL(servicio_precio_descuento, precio_servicio),
                    tipo_servicio
                INTO precio_final, tipo_servicio_actual
                FROM servicio
                WHERE id_servicio = NEW.id_servicio;

                -- NUEVA LÓGICA: Calcular según tipo de servicio
                IF tipo_servicio_actual = 'PRIVADO' THEN
                    -- SERVICIO PRIVADO: precio fijo, no importa cantidad de personas
                    SET total_calculado = precio_final;
                ELSE
                    -- SERVICIO COLECTIVO: precio por persona (lógica original)
                    SET precio_ninos = precio_final * 0.75; -- 25% descuento para niños
                    SET total_calculado = (NEW.reservas_cantidad_adultos * precio_final) +
                                        (IFNULL(NEW.reservas_cantidad_ninos, 0) * precio_ninos);
                END IF;

                -- Solo asignar si no viene valor específico
                IF NEW.reservas_cobrar_a_pax IS NULL OR NEW.reservas_cobrar_a_pax = 0 THEN
                    SET NEW.reservas_cobrar_a_pax = total_calculado;
                END IF;
            END
        ");

        // TRIGGER 4: Actualizar precio cuando se modifican cantidades
        DB::unprepared("
            CREATE TRIGGER tr_reserva_actualizar_precio
            BEFORE UPDATE ON reservas
            FOR EACH ROW
            BEGIN
                DECLARE precio_final DECIMAL(10,2) DEFAULT 0;
                DECLARE precio_ninos DECIMAL(10,2) DEFAULT 0;
                DECLARE total_calculado DECIMAL(10,2) DEFAULT 0;
                DECLARE tipo_servicio_actual ENUM('COLECTIVO', 'PRIVADO') DEFAULT 'COLECTIVO'; -- AGREGADO: variable para tipo

                -- Solo recalcular si cambiaron cantidades
                IF NEW.reservas_cantidad_adultos != OLD.reservas_cantidad_adultos
                OR IFNULL(NEW.reservas_cantidad_ninos, 0) != IFNULL(OLD.reservas_cantidad_ninos, 0) THEN

                    -- Obtener precio del servicio Y su tipo (MODIFICADO: ahora obtenemos también el tipo)
                    SELECT
                        IFNULL(servicio_precio_descuento, precio_servicio),
                        tipo_servicio
                    INTO precio_final, tipo_servicio_actual
                    FROM servicio
                    WHERE id_servicio = NEW.id_servicio;

                    -- NUEVA LÓGICA: Calcular según tipo de servicio
                    IF tipo_servicio_actual = 'PRIVADO' THEN
                        -- SERVICIO PRIVADO: precio fijo, no recalcular por cantidades
                        SET total_calculado = precio_final;
                    ELSE
                        -- SERVICIO COLECTIVO: recalcular por cantidades (lógica original)
                        SET precio_ninos = precio_final * 0.75; -- 25% descuento para niños
                        SET total_calculado = (NEW.reservas_cantidad_adultos * precio_final) +
                                            (IFNULL(NEW.reservas_cantidad_ninos, 0) * precio_ninos);
                    END IF;

                    SET NEW.reservas_cobrar_a_pax = total_calculado;
                END IF;
            END
        ");

        // TRIGGER 5: Control de capacidad de vehículo (SOLO RUTAS) - CORREGIDO
        DB::unprepared("
            CREATE TRIGGER tr_reserva_control_capacidad
            BEFORE INSERT ON reservas
            FOR EACH ROW
            BEGIN
                DECLARE capacidad_vehiculo INT DEFAULT 0;
                DECLARE ocupacion_actual INT DEFAULT 0;
                DECLARE nueva_ocupacion INT DEFAULT 0;
                DECLARE espacio_disponible INT DEFAULT 0;
                DECLARE mensaje_error TEXT;

                -- SOLO validar capacidad para RUTAS (tours no tienen límite)
                IF NEW.id_ruta_activa IS NOT NULL THEN
                    -- Obtener capacidad del vehículo asignado (RELACIÓN CORREGIDA)
                    SELECT IFNULL(v.vehiculo_capacidad, 0)
                    INTO capacidad_vehiculo
                    FROM ruta_activa ra
                    JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
                    WHERE ra.id_ruta_activa = NEW.id_ruta_activa;

                    -- Solo validar si el vehículo tiene capacidad definida
                    IF capacidad_vehiculo > 0 THEN
                        -- Calcular ocupación actual
                        SELECT IFNULL(SUM(reservas_cantidad_adultos + IFNULL(reservas_cantidad_ninos, 0)), 0)
                        INTO ocupacion_actual
                        FROM reservas r
                        WHERE r.id_ruta_activa = NEW.id_ruta_activa
                        AND r.deleted_at IS NULL;

                        -- Calcular nueva ocupación
                        SET nueva_ocupacion = ocupacion_actual + (NEW.reservas_cantidad_adultos + IFNULL(NEW.reservas_cantidad_ninos, 0));

                        -- Verificar si excede capacidad
                        IF nueva_ocupacion > capacidad_vehiculo THEN
                            SET espacio_disponible = capacidad_vehiculo - ocupacion_actual;
                            SET mensaje_error = CONCAT(
                                'CAPACIDAD EXCEDIDA: Vehículo tiene ', capacidad_vehiculo,
                                ' asientos. Ocupación actual: ', ocupacion_actual,
                                '. Espacios disponibles: ', espacio_disponible,
                                '. Pasajeros solicitados: ', (NEW.reservas_cantidad_adultos + IFNULL(NEW.reservas_cantidad_ninos, 0))
                            );
                            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = mensaje_error;
                        END IF;
                    END IF;
                END IF;
                -- Los TOURS no necesitan validación de capacidad
            END
        ");

        // TRIGGER 6: Alerta de capacidad al 80% (SOLO RUTAS) - CORREGIDO
        DB::unprepared("
            CREATE TRIGGER tr_reserva_alerta_capacidad
            AFTER INSERT ON reservas
            FOR EACH ROW
            BEGIN
                DECLARE capacidad_vehiculo INT DEFAULT 0;
                DECLARE ocupacion_actual INT DEFAULT 0;
                DECLARE porcentaje_ocupacion DECIMAL(5,2) DEFAULT 0;

                -- SOLO generar alertas para RUTAS
                IF NEW.id_ruta_activa IS NOT NULL THEN
                    -- Obtener capacidad y ocupación actual (RELACIÓN CORREGIDA)
                    SELECT
                        IFNULL(v.vehiculo_capacidad, 0),
                        IFNULL(SUM(r.reservas_cantidad_adultos + IFNULL(r.reservas_cantidad_ninos, 0)), 0)
                    INTO capacidad_vehiculo, ocupacion_actual
                    FROM ruta_activa ra
                    JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
                    LEFT JOIN reservas r ON r.id_ruta_activa = ra.id_ruta_activa AND r.deleted_at IS NULL
                    WHERE ra.id_ruta_activa = NEW.id_ruta_activa
                    GROUP BY v.vehiculo_capacidad;

                    -- Solo generar alerta si hay capacidad definida
                    IF capacidad_vehiculo > 0 THEN
                        SET porcentaje_ocupacion = (ocupacion_actual / capacidad_vehiculo) * 100;

                        -- Generar alerta si ocupación >= 80%
                        IF porcentaje_ocupacion >= 80 THEN
                            SET @alerta_capacidad = CONCAT(
                                'ALERTA: Ruta ', NEW.id_ruta_activa,
                                ' al ', ROUND(porcentaje_ocupacion, 1), '% de capacidad (',
                                ocupacion_actual, '/', capacidad_vehiculo, ')'
                            );
                        END IF;
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
        // FUNCIÓN 1: Calcular precio para reserva (NUEVA LÓGICA)
        DB::unprepared("
            CREATE FUNCTION fn_calcular_precio_reserva(
                p_servicio_id INT,
                p_adultos INT,
                p_ninos INT
            ) RETURNS DECIMAL(10,2)
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_precio_final DECIMAL(10,2) DEFAULT 0;
                DECLARE v_precio_ninos DECIMAL(10,2) DEFAULT 0;
                DECLARE v_total DECIMAL(10,2) DEFAULT 0;
                DECLARE v_tipo_servicio ENUM('COLECTIVO', 'PRIVADO') DEFAULT 'COLECTIVO'; -- AGREGADO: variable para tipo

                -- Obtener precio del servicio Y su tipo (MODIFICADO: ahora obtenemos también el tipo)
                SELECT
                    IFNULL(servicio_precio_descuento, precio_servicio),
                    tipo_servicio
                INTO v_precio_final, v_tipo_servicio
                FROM servicio
                WHERE id_servicio = p_servicio_id;

                -- NUEVA LÓGICA: Calcular según tipo de servicio
                IF v_tipo_servicio = 'PRIVADO' THEN
                    -- SERVICIO PRIVADO: precio fijo, no importa cantidad de personas
                    SET v_total = v_precio_final;
                ELSE
                    -- SERVICIO COLECTIVO: precio por persona (lógica original)
                    SET v_precio_ninos = v_precio_final * 0.75; -- 25% descuento para niños
                    SET v_total = (p_adultos * v_precio_final) + (IFNULL(p_ninos, 0) * v_precio_ninos);
                END IF;

                RETURN v_total;
            END
        ");

        // FUNCIÓN 2: Verificar disponibilidad de ruta (ADAPTADA Y CORREGIDA)
        DB::unprepared("
            CREATE FUNCTION fn_verificar_disponibilidad_ruta(
                p_ruta_activa_id INT,
                p_pasajeros INT
            ) RETURNS TEXT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_capacidad INT DEFAULT 0;
                DECLARE v_ocupado INT DEFAULT 0;
                DECLARE v_disponible INT DEFAULT 0;
                DECLARE v_resultado TEXT;

                -- Obtener capacidad y ocupación actual (RELACIÓN CORREGIDA)
                SELECT
                    IFNULL(v.vehiculo_capacidad, 0),
                    IFNULL(SUM(r.reservas_cantidad_adultos + IFNULL(r.reservas_cantidad_ninos, 0)), 0)
                INTO v_capacidad, v_ocupado
                FROM ruta_activa ra
                JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
                LEFT JOIN reservas r ON r.id_ruta_activa = ra.id_ruta_activa AND r.deleted_at IS NULL
                WHERE ra.id_ruta_activa = p_ruta_activa_id
                GROUP BY v.vehiculo_capacidad;

                SET v_disponible = v_capacidad - v_ocupado;

                -- Crear resultado como JSON string
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

        // FUNCIÓN 3: Verificar disponibilidad tour (ADAPTADA)
        DB::unprepared("
            CREATE FUNCTION fn_verificar_disponibilidad_tour(
                p_tour_activo_id INT
            ) RETURNS TEXT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_total_reservas INT DEFAULT 0;
                DECLARE v_total_pasajeros INT DEFAULT 0;
                DECLARE v_resultado TEXT;

                -- Contar reservas y pasajeros del tour
                SELECT
                    IFNULL(COUNT(r.id_reservas), 0),
                    IFNULL(SUM(r.reservas_cantidad_adultos + IFNULL(r.reservas_cantidad_ninos, 0)), 0)
                INTO v_total_reservas, v_total_pasajeros
                FROM reservas r
                WHERE r.id_tour_activo = p_tour_activo_id
                AND r.deleted_at IS NULL;

                -- Crear resultado como JSON string
                SET v_resultado = CONCAT('{',
                    '\"tipo\":\"tour\",',
                    '\"total_reservas\":', v_total_reservas, ',',
                    '\"total_pasajeros\":', v_total_pasajeros, ',',
                    '\"sin_limite_capacidad\":true,',
                    '\"siempre_disponible\":true',
                    '}');

                RETURN v_resultado;
            END
        ");

        // FUNCIÓN 4: Buscar tour disponible (ADAPTADA)
        DB::unprepared("
            CREATE FUNCTION fn_buscar_tour_disponible(
                p_fecha DATE
            ) RETURNS INT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_tour_activo_id INT DEFAULT 0;

                -- Buscar TOUR disponible para fecha específica
                SELECT ta.id_tour_activo
                INTO v_tour_activo_id
                FROM tour_activo ta
                WHERE DATE(ta.tour_activo_fecha) = p_fecha
                  AND ta.deleted_at IS NULL
                ORDER BY ta.tour_activo_fecha ASC
                LIMIT 1;

                RETURN IFNULL(v_tour_activo_id, 0);
            END
        ");
    }

    /**
     * Crear vistas 100% abstractas adaptadas a v3
     */
    private function createAbstractViews()
    {
        // VISTA 1: Ocupación de rutas (ADAPTADA Y CORREGIDA)
        DB::statement("
            CREATE VIEW v_ocupacion_rutas AS
            SELECT
                ra.id_ruta_activa,
                DATE(ra.ruta_activa_fecha) as fecha_operacion,
                TIME(ra.ruta_activa_fecha) as hora_salida,
                CONCAT(r.rutas_origen, ' -> ', r.rutas_destino) as ruta,
                v.vehiculo_placa,
                v.vehiculo_capacidad as capacidad_total,
                IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                (v.vehiculo_capacidad - IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0)) as espacios_disponibles,
                IF(v.vehiculo_capacidad > 0, ROUND((IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) / v.vehiculo_capacidad) * 100, 1), 0) as porcentaje_ocupacion,
                COUNT(res.id_reservas) as total_reservas,
                e.estado_nombre as estado_ruta,
                CASE
                    WHEN v.vehiculo_capacidad = 0 THEN 'SIN_VEHICULO'
                    WHEN IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) = 0 THEN 'DISPONIBLE'
                    WHEN IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) < (v.vehiculo_capacidad * 0.8) THEN 'DISPONIBLE'
                    WHEN IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) < v.vehiculo_capacidad THEN 'CASI_LLENO'
                    ELSE 'COMPLETO'
                END as status_disponibilidad
            FROM ruta_activa ra
            JOIN rutas r ON ra.id_rutas = r.id_rutas
            JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
            JOIN estado e ON ra.estado_id = e.estado_id
            LEFT JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
            LEFT JOIN reservas res ON s.id_servicio = res.id_servicio AND res.deleted_at IS NULL
            WHERE ra.deleted_at IS NULL
            GROUP BY ra.id_ruta_activa, ra.ruta_activa_fecha, r.rutas_origen, r.rutas_destino,
                     v.vehiculo_placa, v.vehiculo_capacidad, e.estado_nombre
            ORDER BY ra.ruta_activa_fecha
        ");

        // VISTA 2: Información de tours (ADAPTADA)
        DB::statement("
            CREATE VIEW v_info_tours AS
            SELECT
                ta.id_tour_activo,
                DATE(ta.tour_activo_fecha) as fecha_operacion,
                TIME(ta.tour_activo_fecha) as hora_inicio,
                ta.tour_activo_tipo as tipo_tour,
                IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) as total_pasajeros,
                COUNT(res.id_reservas) as total_reservas,
                'SIN_LIMITE' as capacidad_info,
                'SIEMPRE_DISPONIBLE' as status_disponibilidad
            FROM tour_activo ta
            LEFT JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
            LEFT JOIN reservas res ON s.id_servicio = res.id_servicio AND res.deleted_at IS NULL
            WHERE ta.deleted_at IS NULL
            GROUP BY ta.id_tour_activo, ta.tour_activo_fecha, ta.tour_activo_tipo
            ORDER BY ta.tour_activo_fecha
        ");

        // VISTA 3: Reservas completas (ADAPTADA CON NUEVA LÓGICA)
        DB::statement("
            CREATE VIEW v_reservas_completas AS
            SELECT
                res.id_reservas,
                res.reservas_nombres_cliente,
                res.reservas_apellidos_cliente,
                res.reservas_telefono_cliente,
                res.reservas_cantidad_adultos,
                res.reservas_cantidad_ninos,
                (res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
                res.reservas_cobrar_a_pax as monto_total,
                res.reservas_direccion_abordaje,
                res.created_at as fecha_reserva,

                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN CONCAT(r.rutas_origen, ' -> ', r.rutas_destino)
                    WHEN res.id_tour_activo IS NOT NULL THEN ta.tour_activo_tipo
                    ELSE 'N/A'
                END as servicio_detalle,

                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN DATE(ra.ruta_activa_fecha)
                    WHEN res.id_tour_activo IS NOT NULL THEN DATE(ta.tour_activo_fecha)
                    ELSE NULL
                END as fecha_servicio,

                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN TIME(ra.ruta_activa_fecha)
                    WHEN res.id_tour_activo IS NOT NULL THEN TIME(ta.tour_activo_fecha)
                    ELSE NULL
                END as hora_servicio,

                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN v.vehiculo_placa
                    WHEN res.id_tour_activo IS NOT NULL THEN 'N/A (Tour)'
                    ELSE 'N/A'
                END as vehiculo_info,

                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN 'RUTA'
                    WHEN res.id_tour_activo IS NOT NULL THEN 'TOUR'
                    ELSE 'INDEFINIDO'
                END as tipo_servicio,

                er.estado_nombre as estado_reserva,
                res.reservas_transferido_por as transferido_por

            FROM reservas res
            JOIN estado er ON res.estado_id = er.estado_id
            JOIN servicio s ON res.id_servicio = s.id_servicio
            LEFT JOIN ruta_activa ra ON res.id_ruta_activa = ra.id_ruta_activa
            LEFT JOIN tour_activo ta ON res.id_tour_activo = ta.id_tour_activo
            LEFT JOIN rutas r ON ra.id_rutas = r.id_rutas
            LEFT JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo

            WHERE res.deleted_at IS NULL
            ORDER BY res.created_at DESC
        ");

        // VISTA 4: Ingresos diarios (ADAPTADA CON NUEVA LÓGICA)
        DB::statement("
            CREATE VIEW v_ingresos_diarios AS
            SELECT
                DATE(res.created_at) as fecha,
                COUNT(res.id_reservas) as total_reservas,
                SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
                SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as ingresos_totales,
                AVG(IFNULL(res.reservas_cobrar_a_pax, 0)) as ticket_promedio,
                COUNT(CASE WHEN res.id_ruta_activa IS NOT NULL THEN 1 END) as reservas_rutas,
                COUNT(CASE WHEN res.id_tour_activo IS NOT NULL THEN 1 END) as reservas_tours
            FROM reservas res
            JOIN estado er ON res.estado_id = er.estado_id
            WHERE res.deleted_at IS NULL
              AND DATE(res.created_at) >= CURDATE() - INTERVAL 30 DAY
            GROUP BY DATE(res.created_at)
            ORDER BY fecha DESC
        ");

        // VISTA 5: Dashboard unificado (ADAPTADA)
        DB::statement("
            CREATE VIEW v_dashboard_unificado AS
            SELECT
                'RUTA' as tipo_servicio,
                ra.id_ruta_activa as servicio_id,
                DATE(ra.ruta_activa_fecha) as fecha,
                TIME(ra.ruta_activa_fecha) as hora,
                CONCAT(r.rutas_origen, ' -> ', r.rutas_destino) as detalle,
                v.vehiculo_placa as info_adicional,
                v.vehiculo_capacidad as capacidad_maxima,
                IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                COUNT(res.id_reservas) as total_reservas,
                IFNULL(SUM(res.reservas_cobrar_a_pax), 0) as ingresos_estimados,
                e.estado_nombre as estado
            FROM ruta_activa ra
            JOIN rutas r ON ra.id_rutas = r.id_rutas
            JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
            JOIN estado e ON ra.estado_id = e.estado_id
            LEFT JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
            LEFT JOIN reservas res ON s.id_servicio = res.id_servicio AND res.deleted_at IS NULL
            WHERE ra.deleted_at IS NULL
            GROUP BY ra.id_ruta_activa, ra.ruta_activa_fecha, r.rutas_origen, r.rutas_destino,
                     v.vehiculo_placa, v.vehiculo_capacidad, e.estado_nombre

            UNION ALL

            SELECT
                'TOUR' as tipo_servicio,
                ta.id_tour_activo as servicio_id,
                DATE(ta.tour_activo_fecha) as fecha,
                TIME(ta.tour_activo_fecha) as hora,
                ta.tour_activo_tipo as detalle,
                'N/A' as info_adicional,
                NULL as capacidad_maxima,
                IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                COUNT(res.id_reservas) as total_reservas,
                IFNULL(SUM(res.reservas_cobrar_a_pax), 0) as ingresos_estimados,
                'Activo' as estado
            FROM tour_activo ta
            LEFT JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
            LEFT JOIN reservas res ON s.id_servicio = res.id_servicio AND res.deleted_at IS NULL
            WHERE ta.deleted_at IS NULL
            GROUP BY ta.id_tour_activo, ta.tour_activo_fecha, ta.tour_activo_tipo

            ORDER BY fecha, hora
        ");

        // VISTA 6: Estado de cuenta por agencias - HOY
        DB::statement("
    CREATE VIEW v_estado_cuenta_hoy AS
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) as saldo_agencia,
        CASE
            WHEN LOWER(a.agencias_nombre) LIKE '%magic travel%' THEN 'EMPRESA_PROPIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'AGENCIA_DEBE_PAGAR'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'MAGIC_DEBE_PAGAR'
            ELSE 'SALDOS_IGUALES'
        END as estado_cuenta,
        DATE(CURDATE()) as fecha_corte
    FROM agencias a
    JOIN rutas r ON a.id_agencias = r.id_agencias
    JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
    JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NULL
      AND DATE(res.created_at) = CURDATE()
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) as saldo_agencia,
        CASE
            WHEN LOWER(a.agencias_nombre) LIKE '%magic travel%' THEN 'EMPRESA_PROPIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'AGENCIA_DEBE_PAGAR'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'MAGIC_DEBE_PAGAR'
            ELSE 'SALDOS_IGUALES'
        END as estado_cuenta,
        DATE(CURDATE()) as fecha_corte
    FROM agencias a
    JOIN tours t ON a.id_agencias = t.id_agencias
    JOIN tour_activo ta ON t.id_tour = ta.id_tour
    JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NULL
      AND DATE(res.created_at) = CURDATE()
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    -- AGENCIAS QUE TRANSFIEREN - LÓGICA CORREGIDA
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        CASE
            WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                -- Escenario A: Magic Travel cobró al cliente y paga a otra agencia
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
            ELSE
                -- Escenario B: Magic Travel solo cobra comisión a la agencia
                SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))
        END as saldo_agencia,
        'TRANSFIERE_SERVICIOS' as estado_cuenta,
        DATE(CURDATE()) as fecha_corte
    FROM agencias a
    JOIN rutas r ON a.id_agencias = r.id_agencias
    JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
    JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NOT NULL
      AND DATE(res.created_at) = CURDATE()
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    -- AGENCIAS QUE RECIBEN TRANSFERENCIAS - LÓGICA CORREGIDA
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        CASE
            WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                -- La agencia cobra al cliente pero debe pagar a Magic Travel
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
            ELSE
                -- Magic Travel cobra comisión, agencia debe pagar
                (0 - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
        END as saldo_agencia,
        CASE
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'GANANCIA_POR_TRANSFERENCIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'DEBE_PAGAR_MAGIC'
            ELSE 'SALDOS_IGUALES_TRANSFERENCIA'
        END as estado_cuenta,
        DATE(CURDATE()) as fecha_corte
    FROM agencias a
    JOIN reservas res ON a.id_agencias = res.id_agencia_transferida
    JOIN servicio s ON res.id_servicio = s.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NOT NULL
      AND DATE(res.created_at) = CURDATE()
    GROUP BY a.id_agencias, a.agencias_nombre

    ORDER BY saldo_agencia DESC
");

        // VISTA 7: Estado de cuenta por agencias - SEMANA ACTUAL
        DB::statement("
    CREATE VIEW v_estado_cuenta_semana AS
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) as saldo_agencia,
        CASE
            WHEN LOWER(a.agencias_nombre) LIKE '%magic travel%' THEN 'EMPRESA_PROPIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'AGENCIA_DEBE_PAGAR'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'MAGIC_DEBE_PAGAR'
            ELSE 'SALDOS_IGUALES'
        END as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-W', LPAD(WEEK(CURDATE()), 2, '0')) as semana_corte
    FROM agencias a
    JOIN rutas r ON a.id_agencias = r.id_agencias
    JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
    JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NULL
      AND WEEK(res.created_at) = WEEK(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) as saldo_agencia,
        CASE
            WHEN LOWER(a.agencias_nombre) LIKE '%magic travel%' THEN 'EMPRESA_PROPIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'AGENCIA_DEBE_PAGAR'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'MAGIC_DEBE_PAGAR'
            ELSE 'SALDOS_IGUALES'
        END as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-W', LPAD(WEEK(CURDATE()), 2, '0')) as semana_corte
    FROM agencias a
    JOIN tours t ON a.id_agencias = t.id_agencias
    JOIN tour_activo ta ON t.id_tour = ta.id_tour
    JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NULL
      AND WEEK(res.created_at) = WEEK(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    -- AGENCIAS QUE TRANSFIEREN - LÓGICA CORREGIDA
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        CASE
            WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
            ELSE
                SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))
        END as saldo_agencia,
        'TRANSFIERE_SERVICIOS' as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-W', LPAD(WEEK(CURDATE()), 2, '0')) as semana_corte
    FROM agencias a
    JOIN rutas r ON a.id_agencias = r.id_agencias
    JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
    JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NOT NULL
      AND WEEK(res.created_at) = WEEK(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    -- AGENCIAS QUE RECIBEN TRANSFERENCIAS - LÓGICA CORREGIDA
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        CASE
            WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
            ELSE
                (0 - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
        END as saldo_agencia,
        CASE
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'GANANCIA_POR_TRANSFERENCIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'DEBE_PAGAR_MAGIC'
            ELSE 'SALDOS_IGUALES_TRANSFERENCIA'
        END as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-W', LPAD(WEEK(CURDATE()), 2, '0')) as semana_corte
    FROM agencias a
    JOIN reservas res ON a.id_agencias = res.id_agencia_transferida
    JOIN servicio s ON res.id_servicio = s.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NOT NULL
      AND WEEK(res.created_at) = WEEK(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    ORDER BY saldo_agencia DESC
");

        // VISTA 8: Estado de cuenta por agencias - MES ACTUAL
        DB::statement("
    CREATE VIEW v_estado_cuenta_mes AS
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) as saldo_agencia,
        CASE
            WHEN LOWER(a.agencias_nombre) LIKE '%magic travel%' THEN 'EMPRESA_PROPIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'AGENCIA_DEBE_PAGAR'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'MAGIC_DEBE_PAGAR'
            ELSE 'SALDOS_IGUALES'
        END as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0')) as mes_corte
    FROM agencias a
    JOIN rutas r ON a.id_agencias = r.id_agencias
    JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
    JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NULL
      AND MONTH(res.created_at) = MONTH(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) as saldo_agencia,
        CASE
            WHEN LOWER(a.agencias_nombre) LIKE '%magic travel%' THEN 'EMPRESA_PROPIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'AGENCIA_DEBE_PAGAR'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'MAGIC_DEBE_PAGAR'
            ELSE 'SALDOS_IGUALES'
        END as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0')) as mes_corte
    FROM agencias a
    JOIN tours t ON a.id_agencias = t.id_agencias
    JOIN tour_activo ta ON t.id_tour = ta.id_tour
    JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NULL
      AND MONTH(res.created_at) = MONTH(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    -- AGENCIAS QUE TRANSFIEREN - LÓGICA CORREGIDA
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        CASE
            WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
            ELSE
                SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))
        END as saldo_agencia,
        'TRANSFIERE_SERVICIOS' as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0')) as mes_corte
    FROM agencias a
    JOIN rutas r ON a.id_agencias = r.id_agencias
    JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
    JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
    JOIN reservas res ON s.id_servicio = res.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NOT NULL
      AND MONTH(res.created_at) = MONTH(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    UNION ALL

    -- AGENCIAS QUE RECIBEN TRANSFERENCIAS - LÓGICA CORREGIDA
    SELECT
        a.id_agencias,
        a.agencias_nombre as agencia,
        COUNT(res.id_reservas) as total_servicios,
        SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pasajeros,
        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)) as total_servicios_prestados,
        SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) as total_cobrado_clientes,
        CASE
            WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
            ELSE
                (0 - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
        END as saldo_agencia,
        CASE
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) > 0 THEN 'GANANCIA_POR_TRANSFERENCIA'
            WHEN (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))) < 0 THEN 'DEBE_PAGAR_MAGIC'
            ELSE 'SALDOS_IGUALES_TRANSFERENCIA'
        END as estado_cuenta,
        CONCAT(YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0')) as mes_corte
    FROM agencias a
    JOIN reservas res ON a.id_agencias = res.id_agencia_transferida
    JOIN servicio s ON res.id_servicio = s.id_servicio
    WHERE res.deleted_at IS NULL
      AND res.id_agencia_transferida IS NOT NULL
      AND MONTH(res.created_at) = MONTH(CURDATE())
      AND YEAR(res.created_at) = YEAR(CURDATE())
    GROUP BY a.id_agencias, a.agencias_nombre

    ORDER BY saldo_agencia DESC
");

        // FUNCIÓN 5: Estado de cuenta por fecha específica
        DB::unprepared("
    CREATE FUNCTION fn_estado_cuenta_fecha(fecha_especifica DATE)
    RETURNS TEXT
    READS SQL DATA
    DETERMINISTIC
    BEGIN
        DECLARE resultado TEXT DEFAULT '';
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_agencia VARCHAR(255);
        DECLARE v_total_servicios INT;
        DECLARE v_total_prestados DECIMAL(10,2);
        DECLARE v_total_cobrado DECIMAL(10,2);
        DECLARE v_saldo DECIMAL(10,2);
        DECLARE v_tipo_cuenta VARCHAR(50);

        DECLARE cur CURSOR FOR
            -- RESERVAS NORMALES DE RUTAS (sin transferir)
            SELECT
                a.agencias_nombre,
                COUNT(res.id_reservas),
                SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)),
                SUM(IFNULL(res.reservas_cobrar_a_pax, 0)),
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))),
                'NORMAL_RUTA' as tipo_cuenta
            FROM agencias a
            JOIN rutas r ON a.id_agencias = r.id_agencias
            JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
            JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
            JOIN reservas res ON s.id_servicio = res.id_servicio
            WHERE res.deleted_at IS NULL
              AND res.id_agencia_transferida IS NULL
              AND DATE(res.created_at) = fecha_especifica
            GROUP BY a.id_agencias, a.agencias_nombre

            UNION ALL

            -- RESERVAS NORMALES DE TOURS (sin transferir)
            SELECT
                a.agencias_nombre,
                COUNT(res.id_reservas),
                SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)),
                SUM(IFNULL(res.reservas_cobrar_a_pax, 0)),
                (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))),
                'NORMAL_TOUR' as tipo_cuenta
            FROM agencias a
            JOIN tours t ON a.id_agencias = t.id_agencias
            JOIN tour_activo ta ON t.id_tour = ta.id_tour
            JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
            JOIN reservas res ON s.id_servicio = res.id_servicio
            WHERE res.deleted_at IS NULL
              AND res.id_agencia_transferida IS NULL
              AND DATE(res.created_at) = fecha_especifica
            GROUP BY a.id_agencias, a.agencias_nombre

            UNION ALL

            -- AGENCIAS QUE TRANSFIEREN (lógica corregida)
            SELECT
                a.agencias_nombre,
                COUNT(res.id_reservas),
                SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)),
                SUM(IFNULL(res.reservas_cobrar_a_pax, 0)),
                CASE
                    WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
                    ELSE
                        SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio))
                END,
                'TRANSFIERE' as tipo_cuenta
            FROM agencias a
            JOIN rutas r ON a.id_agencias = r.id_agencias
            JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
            JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
            JOIN reservas res ON s.id_servicio = res.id_servicio
            WHERE res.deleted_at IS NULL
              AND res.id_agencia_transferida IS NOT NULL
              AND DATE(res.created_at) = fecha_especifica
            GROUP BY a.id_agencias, a.agencias_nombre

            UNION ALL

            -- AGENCIAS QUE RECIBEN TRANSFERENCIAS (lógica corregida)
            SELECT
                a.agencias_nombre,
                COUNT(res.id_reservas),
                SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)),
                SUM(IFNULL(res.reservas_cobrar_a_pax, 0)),
                CASE
                    WHEN SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) > 0 THEN
                        (SUM(IFNULL(res.reservas_cobrar_a_pax, 0)) - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
                    ELSE
                        (0 - SUM(IFNULL(s.servicio_precio_descuento, s.precio_servicio)))
                END,
                'RECIBE' as tipo_cuenta
            FROM agencias a
            JOIN reservas res ON a.id_agencias = res.id_agencia_transferida
            JOIN servicio s ON res.id_servicio = s.id_servicio
            WHERE res.deleted_at IS NULL
              AND res.id_agencia_transferida IS NOT NULL
              AND DATE(res.created_at) = fecha_especifica
            GROUP BY a.id_agencias, a.agencias_nombre;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;

        read_loop: LOOP
            FETCH cur INTO v_agencia, v_total_servicios, v_total_prestados, v_total_cobrado, v_saldo, v_tipo_cuenta;
            IF done THEN
                LEAVE read_loop;
            END IF;

            SET resultado = CONCAT(resultado,
                '{\"agencia\":\"', v_agencia,
                '\",\"servicios\":', v_total_servicios,
                ',\"prestados\":', v_total_prestados,
                ',\"cobrado\":', v_total_cobrado,
                ',\"saldo\":', v_saldo,
                ',\"tipo\":\"', v_tipo_cuenta, '\"},');
        END LOOP;

        CLOSE cur;

        IF LENGTH(resultado) > 0 THEN
            SET resultado = CONCAT('[', LEFT(resultado, LENGTH(resultado) - 1), ']');
        ELSE
            SET resultado = '[]';
        END IF;

        RETURN resultado;
    END
");
    }

    /**
     * Rollback - Eliminar toda la automatización
     */
    public function down()
    {
        // Eliminar función de estado de cuenta
        DB::unprepared('DROP FUNCTION IF EXISTS fn_estado_cuenta_fecha');

        // Eliminar vistas de estado de cuenta
        DB::statement('DROP VIEW IF EXISTS v_estado_cuenta_mes');
        DB::statement('DROP VIEW IF EXISTS v_estado_cuenta_semana');
        DB::statement('DROP VIEW IF EXISTS v_estado_cuenta_hoy');

        // Eliminar vistas principales
        DB::statement('DROP VIEW IF EXISTS v_dashboard_unificado');
        DB::statement('DROP VIEW IF EXISTS v_ingresos_diarios');
        DB::statement('DROP VIEW IF EXISTS v_reservas_completas');
        DB::statement('DROP VIEW IF EXISTS v_info_tours');
        DB::statement('DROP VIEW IF EXISTS v_ocupacion_rutas');

        // Eliminar funciones
        DB::unprepared('DROP FUNCTION IF EXISTS fn_buscar_tour_disponible');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_verificar_disponibilidad_tour');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_verificar_disponibilidad_ruta');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_calcular_precio_reserva');

        // Eliminar triggers
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_alerta_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_control_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_actualizar_precio');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_calcular_precio');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicio_actualizar_descuento');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicio_calcular_descuento');
    }
};
