<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN AUTOMATIZACIÓN MAGIC TRAVEL v3.0 - CORREGIDA CON LÓGICA DE PAGOS
     * Triggers, funciones y vistas adaptados para nueva estructura
     * - Niños 25% descuento (no 50%)
     * - Usar servicio_precio_descuento y reservas_cobrar_a_pax
     * - Relaciones correctas con vehículos
     * - Estados de cuenta por agencias incluidos
     * - NUEVO: Módulo Ventas (Caja Diaria) - CORREGIDO
     * - NUEVO: Módulo Contabilidad mejorado
     * - NUEVO: Lógica de reubicaciones y 4 escenarios de transferencia
     * - NUEVO: Control de liquidación de rutas
     * - CORREGIDO: Lógica de pagos (mayoría en caja, ocasional conductor)
     * - Mantener abstracción total
     */
    public function up()
    {
        $this->createAbstractTriggers();
        $this->createAbstractFunctions();
        $this->createAbstractViews();
        $this->createVentasViews();
        $this->createContabilidadViews();
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
                DECLARE tipo_servicio_actual ENUM('COLECTIVO', 'PRIVADO') DEFAULT 'COLECTIVO';

                SELECT
                    IFNULL(servicio_precio_descuento, precio_servicio),
                    tipo_servicio
                INTO precio_final, tipo_servicio_actual
                FROM servicio
                WHERE id_servicio = NEW.id_servicio;

                IF tipo_servicio_actual = 'PRIVADO' THEN
                    SET total_calculado = precio_final;
                ELSE
                    SET precio_ninos = precio_final * 0.75;
                    SET total_calculado = (NEW.reservas_cantidad_adultos * precio_final) +
                                        (IFNULL(NEW.reservas_cantidad_ninos, 0) * precio_ninos);
                END IF;

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
                DECLARE tipo_servicio_actual ENUM('COLECTIVO', 'PRIVADO') DEFAULT 'COLECTIVO';

                IF NEW.reservas_cantidad_adultos != OLD.reservas_cantidad_adultos
                OR IFNULL(NEW.reservas_cantidad_ninos, 0) != IFNULL(OLD.reservas_cantidad_ninos, 0) THEN

                    SELECT
                        IFNULL(servicio_precio_descuento, precio_servicio),
                        tipo_servicio
                    INTO precio_final, tipo_servicio_actual
                    FROM servicio
                    WHERE id_servicio = NEW.id_servicio;

                    IF tipo_servicio_actual = 'PRIVADO' THEN
                        SET total_calculado = precio_final;
                    ELSE
                        SET precio_ninos = precio_final * 0.75;
                        SET total_calculado = (NEW.reservas_cantidad_adultos * precio_final) +
                                            (IFNULL(NEW.reservas_cantidad_ninos, 0) * precio_ninos);
                    END IF;

                    SET NEW.reservas_cobrar_a_pax = total_calculado;
                END IF;
            END
        ");

        // TRIGGER 5: Control de capacidad de vehículo (SOLO RUTAS)
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

                IF NEW.id_ruta_activa IS NOT NULL THEN
                    SELECT IFNULL(v.vehiculo_capacidad, 0)
                    INTO capacidad_vehiculo
                    FROM ruta_activa ra
                    JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
                    WHERE ra.id_ruta_activa = NEW.id_ruta_activa;

                    IF capacidad_vehiculo > 0 THEN
                        SELECT IFNULL(SUM(reservas_cantidad_adultos + IFNULL(reservas_cantidad_ninos, 0)), 0)
                        INTO ocupacion_actual
                        FROM reservas r
                        WHERE r.id_ruta_activa = NEW.id_ruta_activa
                        AND r.deleted_at IS NULL;

                        SET nueva_ocupacion = ocupacion_actual + (NEW.reservas_cantidad_adultos + IFNULL(NEW.reservas_cantidad_ninos, 0));

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
            END
        ");

        // TRIGGER 6: Auto-crear registro en caja SOLO para ventas directas Magic Travel con pago en caja
        DB::unprepared("
            CREATE TRIGGER tr_reserva_crear_caja
            AFTER INSERT ON reservas
            FOR EACH ROW
            BEGIN
                DECLARE v_agencia_servicio BIGINT DEFAULT 0;
                DECLARE v_magic_travel_id BIGINT DEFAULT 0;
                DECLARE v_origen VARCHAR(100) DEFAULT '';
                DECLARE v_destino VARCHAR(100) DEFAULT '';
                DECLARE v_fecha_servicio DATETIME;
                DECLARE v_precio_unitario DECIMAL(10,2) DEFAULT 0;
                DECLARE v_estado_pagada BIGINT DEFAULT 0;

                -- Obtener ID de Magic Travel
                SELECT id_agencias INTO v_magic_travel_id
                FROM agencias
                WHERE LOWER(agencias_nombre) LIKE '%magic travel%'
                LIMIT 1;

                -- Obtener estado 'Pagada'
                SELECT estado_id INTO v_estado_pagada
                FROM estado
                WHERE LOWER(estado_nombre) LIKE '%pagada%'
                LIMIT 1;

                -- Determinar agencia del servicio
                SELECT COALESCE(
                    (SELECT r.id_agencias FROM rutas r
                     JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
                     JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
                     WHERE s.id_servicio = NEW.id_servicio),
                    (SELECT t.id_agencias FROM tours t
                     JOIN tour_activo ta ON t.id_tour = ta.id_tour
                     JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
                     WHERE s.id_servicio = NEW.id_servicio),
                    0
                ) INTO v_agencia_servicio;

                -- Solo crear registro en caja si es venta directa de Magic Travel Y cliente pagó en caja
                IF v_agencia_servicio = v_magic_travel_id
                   AND NEW.id_agencia_transferida IS NULL
                   AND NEW.estado_id = v_estado_pagada THEN

                    -- Obtener datos del servicio
                    SELECT
                        COALESCE(r.rutas_origen, 'Tour'),
                        COALESCE(r.rutas_destino, t.tours_nombre, 'Destino'),
                        COALESCE(ra.ruta_activa_fecha, ta.tour_activo_fecha, NOW()),
                        COALESCE(s.servicio_precio_descuento, s.precio_servicio, 0)
                    INTO v_origen, v_destino, v_fecha_servicio, v_precio_unitario
                    FROM servicio s
                    LEFT JOIN ruta_activa ra ON s.id_ruta_activa = ra.id_ruta_activa
                    LEFT JOIN rutas r ON ra.id_rutas = r.id_rutas
                    LEFT JOIN tour_activo ta ON s.id_tour_activo = ta.id_tour_activo
                    LEFT JOIN tours t ON ta.id_tour = t.id_tour
                    WHERE s.id_servicio = NEW.id_servicio;

                    -- Insertar en caja
                    INSERT INTO caja (
                        origen, destino, fecha_servicio,
                        pax_adultos, pax_ninos, total_pax,
                        precio_unitario, precio_total,
                        direccion, servicio_cobrar_pax, servicio_precio_descuento,
                        id_reservas, estado_id, created_by, created_at
                    ) VALUES (
                        v_origen, v_destino, v_fecha_servicio,
                        NEW.reservas_cantidad_adultos,
                        IFNULL(NEW.reservas_cantidad_ninos, 0),
                        NEW.reservas_cantidad_adultos + IFNULL(NEW.reservas_cantidad_ninos, 0),
                        v_precio_unitario, NEW.reservas_cobrar_a_pax,
                        NEW.reservas_direccion_abordaje,
                        NEW.reservas_cobrar_a_pax, v_precio_unitario,
                        NEW.id_reservas, NEW.estado_id, NEW.created_by, NOW()
                    );
                END IF;
            END
        ");

        // TRIGGER 7: Actualizar total_pax en caja automáticamente
        DB::unprepared("
            CREATE TRIGGER tr_caja_calcular_total_pax
            BEFORE INSERT ON caja
            FOR EACH ROW
            BEGIN
                SET NEW.total_pax = NEW.pax_adultos + IFNULL(NEW.pax_ninos, 0);
                -- No recalcular precio_total aquí porque puede ser diferente del unitario*pax
            END
        ");

        // TRIGGER 8: Actualizar total_pax cuando se modifica caja
        DB::unprepared("
            CREATE TRIGGER tr_caja_actualizar_total_pax
            BEFORE UPDATE ON caja
            FOR EACH ROW
            BEGIN
                IF NEW.pax_adultos != OLD.pax_adultos OR IFNULL(NEW.pax_ninos, 0) != IFNULL(OLD.pax_ninos, 0) THEN
                    SET NEW.total_pax = NEW.pax_adultos + IFNULL(NEW.pax_ninos, 0);
                END IF;
            END
        ");
    }

    /**
     * Crear funciones 100% abstractas
     */
    private function createAbstractFunctions()
    {
        // FUNCIÓN 1: Calcular precio para reserva
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
                DECLARE v_tipo_servicio ENUM('COLECTIVO', 'PRIVADO') DEFAULT 'COLECTIVO';

                SELECT
                    IFNULL(servicio_precio_descuento, precio_servicio),
                    tipo_servicio
                INTO v_precio_final, v_tipo_servicio
                FROM servicio
                WHERE id_servicio = p_servicio_id;

                IF v_tipo_servicio = 'PRIVADO' THEN
                    SET v_total = v_precio_final;
                ELSE
                    SET v_precio_ninos = v_precio_final * 0.75;
                    SET v_total = (p_adultos * v_precio_final) + (IFNULL(p_ninos, 0) * v_precio_ninos);
                END IF;

                RETURN v_total;
            END
        ");

        // FUNCIÓN 2: Verificar disponibilidad de ruta
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

        // FUNCIÓN 3: Determinar escenario de transferencia
        DB::unprepared("
            CREATE FUNCTION fn_determinar_escenario_transferencia(
                p_reserva_id INT
            ) RETURNS VARCHAR(50)
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_agencia_servicio BIGINT DEFAULT 0;
                DECLARE v_agencia_transferida BIGINT DEFAULT NULL;
                DECLARE v_magic_travel_id BIGINT DEFAULT 0;
                DECLARE v_escenario VARCHAR(50) DEFAULT 'DESCONOCIDO';

                -- Obtener ID de Magic Travel
                SELECT id_agencias INTO v_magic_travel_id
                FROM agencias
                WHERE LOWER(agencias_nombre) LIKE '%magic travel%'
                LIMIT 1;

                -- Obtener datos de la reserva
                SELECT
                    id_agencia_transferida,
                    COALESCE(
                        (SELECT r.id_agencias FROM rutas r
                         JOIN ruta_activa ra ON r.id_rutas = ra.id_rutas
                         JOIN servicio s ON ra.id_ruta_activa = s.id_ruta_activa
                         WHERE s.id_servicio = res.id_servicio),
                        (SELECT t.id_agencias FROM tours t
                         JOIN tour_activo ta ON t.id_tour = ta.id_tour
                         JOIN servicio s ON ta.id_tour_activo = s.id_tour_activo
                         WHERE s.id_servicio = res.id_servicio),
                        0
                    )
                INTO v_agencia_transferida, v_agencia_servicio
                FROM reservas res
                WHERE res.id_reservas = p_reserva_id;

                -- Determinar escenario
                IF v_agencia_servicio = v_magic_travel_id THEN
                    IF v_agencia_transferida IS NULL THEN
                        SET v_escenario = 'VENTA_DIRECTA';
                    ELSEIF v_agencia_transferida = v_magic_travel_id THEN
                        SET v_escenario = 'REUBICACION_INTERNA';
                    ELSE
                        SET v_escenario = 'MAGIC_TRANSFIERE';
                    END IF;
                ELSE
                    IF v_agencia_transferida IS NULL THEN
                        SET v_escenario = 'MAGIC_RECIBE_OPERA';
                    ELSEIF v_agencia_transferida != v_magic_travel_id THEN
                        SET v_escenario = 'MAGIC_PUENTE';
                    ELSE
                        SET v_escenario = 'CASO_ESPECIAL';
                    END IF;
                END IF;

                RETURN v_escenario;
            END
        ");

        // FUNCIÓN 4: Verificar si ruta está liquidada
        DB::unprepared("
            CREATE FUNCTION fn_ruta_liquidada(
                p_ruta_activa_id INT
            ) RETURNS BOOLEAN
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_estado_nombre VARCHAR(45) DEFAULT '';
                DECLARE v_liquidada BOOLEAN DEFAULT FALSE;

                SELECT e.estado_nombre
                INTO v_estado_nombre
                FROM ruta_activa ra
                JOIN estado e ON ra.estado_id = e.estado_id
                WHERE ra.id_ruta_activa = p_ruta_activa_id;

                IF LOWER(v_estado_nombre) LIKE '%liquidar%' OR LOWER(v_estado_nombre) LIKE '%liquidada%' THEN
                    SET v_liquidada = TRUE;
                END IF;

                RETURN v_liquidada;
            END
        ");

        // FUNCIÓN 5: Determinar forma de pago (caja o conductor)
        DB::unprepared("
            CREATE FUNCTION fn_forma_pago_reserva(
                p_reserva_id INT
            ) RETURNS VARCHAR(20)
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_estado_nombre VARCHAR(45) DEFAULT '';
                DECLARE v_forma_pago VARCHAR(20) DEFAULT 'DESCONOCIDO';
                DECLARE v_tiene_caja BOOLEAN DEFAULT FALSE;

                -- Verificar estado de la reserva
                SELECT e.estado_nombre
                INTO v_estado_nombre
                FROM reservas r
                JOIN estado e ON r.estado_id = e.estado_id
                WHERE r.id_reservas = p_reserva_id;

                -- Verificar si tiene registro en caja
                SELECT COUNT(*) > 0
                INTO v_tiene_caja
                FROM caja c
                WHERE c.id_reservas = p_reserva_id
                AND c.deleted_at IS NULL;

                -- Determinar forma de pago
                IF v_tiene_caja = TRUE THEN
                    SET v_forma_pago = 'PAGO_CAJA';
                ELSEIF LOWER(v_estado_nombre) LIKE '%confirmar%' OR LOWER(v_estado_nombre) LIKE '%recibido%' THEN
                    SET v_forma_pago = 'PAGO_CONDUCTOR';
                ELSEIF LOWER(v_estado_nombre) LIKE '%pagada%' THEN
                    SET v_forma_pago = 'PAGADO';
                ELSE
                    SET v_forma_pago = 'PENDIENTE';
                END IF;

                RETURN v_forma_pago;
            END
        ");
    }

    /**
     * Crear vistas principales (adaptadas)
     */
    private function createAbstractViews()
    {
        // VISTA 1: Ocupación de rutas con egresos
        DB::statement("
            CREATE VIEW v_ocupacion_rutas_completa AS
            SELECT
                ra.id_ruta_activa,
                DATE(ra.ruta_activa_fecha) as fecha_operacion,
                TIME(ra.ruta_activa_fecha) as hora_salida,
                CONCAT(r.rutas_origen, ' -> ', r.rutas_destino) as ruta,
                v.vehiculo_placa,
                v.vehiculo_capacidad as capacidad_total,
                IFNULL(v.vehiculo_pago_conductor, 0) as pago_conductor,
                IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) as pasajeros_confirmados,
                (v.vehiculo_capacidad - IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0)) as espacios_disponibles,
                IF(v.vehiculo_capacidad > 0, ROUND((IFNULL(SUM(res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)), 0) / v.vehiculo_capacidad) * 100, 1), 0) as porcentaje_ocupacion,
                COUNT(res.id_reservas) as total_reservas,
                IFNULL(SUM(era.cantidad_egreso), 0) as total_egresos,
                IFNULL(SUM(res.reservas_cobrar_a_pax), 0) as ingresos_estimados,
                (IFNULL(SUM(res.reservas_cobrar_a_pax), 0) - IFNULL(SUM(era.cantidad_egreso), 0) - IFNULL(v.vehiculo_pago_conductor, 0)) as ganancia_estimada,
                e.estado_nombre as estado_ruta,
                fn_ruta_liquidada(ra.id_ruta_activa) as ruta_liquidada,
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
            LEFT JOIN egresos_ruta_activa era ON ra.id_ruta_activa = era.id_ruta_activa AND era.deleted_at IS NULL
            WHERE ra.deleted_at IS NULL
            GROUP BY ra.id_ruta_activa, ra.ruta_activa_fecha, r.rutas_origen, r.rutas_destino,
                     v.vehiculo_placa, v.vehiculo_capacidad, v.vehiculo_pago_conductor, e.estado_nombre
            ORDER BY ra.ruta_activa_fecha
        ");

        // VISTA 2: Reservas completas con escenarios y forma de pago
        DB::statement("
            CREATE VIEW v_reservas_completas_escenarios AS
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
                res.reservas_voucher,
                res.created_at as fecha_reserva,
                fn_determinar_escenario_transferencia(res.id_reservas) as escenario_transferencia,
                fn_forma_pago_reserva(res.id_reservas) as forma_pago,

                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN CONCAT(r.rutas_origen, ' -> ', r.rutas_destino)
                    WHEN res.id_tour_activo IS NOT NULL THEN CONCAT('Tour: ', t.tours_nombre)
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
                res.reservas_transferido_por as transferido_por,

                -- Agencias involucradas
                COALESCE(ag_servicio.agencias_nombre, 'N/A') as agencia_servicio,
                COALESCE(ag_transferida.agencias_nombre, 'N/A') as agencia_transferida

            FROM reservas res
            JOIN estado er ON res.estado_id = er.estado_id
            JOIN servicio s ON res.id_servicio = s.id_servicio
            LEFT JOIN ruta_activa ra ON res.id_ruta_activa = ra.id_ruta_activa
            LEFT JOIN tour_activo ta ON res.id_tour_activo = ta.id_tour_activo
            LEFT JOIN rutas r ON ra.id_rutas = r.id_rutas
            LEFT JOIN tours t ON ta.id_tour = t.id_tour
            LEFT JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
            LEFT JOIN agencias ag_servicio ON (r.id_agencias = ag_servicio.id_agencias OR t.id_agencias = ag_servicio.id_agencias)
            LEFT JOIN agencias ag_transferida ON res.id_agencia_transferida = ag_transferida.id_agencias

            WHERE res.deleted_at IS NULL
            ORDER BY res.created_at DESC
        ");
    }

    /**
     * Crear vistas específicas para módulo VENTAS
     */
    private function createVentasViews()
    {
        // VISTA 1: Control de Ventas - Reservas según forma de pago
        DB::statement("
            CREATE VIEW v_control_ventas AS
            SELECT
                res.id_reservas,
                res.reservas_nombres_cliente,
                res.reservas_apellidos_cliente,
                res.reservas_telefono_cliente,
                DATE(COALESCE(ra.ruta_activa_fecha, ta.tour_activo_fecha)) as fecha_servicio,
                TIME(COALESCE(ra.ruta_activa_fecha, ta.tour_activo_fecha)) as hora_servicio,

                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN CONCAT(r.rutas_origen, ' -> ', r.rutas_destino)
                    WHEN res.id_tour_activo IS NOT NULL THEN t.tours_nombre
                    ELSE 'N/A'
                END as servicio_detalle,

                res.reservas_cantidad_adultos,
                res.reservas_cantidad_ninos,
                (res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pax,
                res.reservas_cobrar_a_pax as monto_total,
                res.reservas_direccion_abordaje,

                er.estado_nombre as estado_reserva,
                fn_forma_pago_reserva(res.id_reservas) as forma_pago,

                -- Clasificación para filtros de Ventas
                CASE
                    WHEN LOWER(er.estado_nombre) LIKE '%pendiente%' OR LOWER(er.estado_nombre) LIKE '%confirmada%' THEN 'POR_COBRAR'
                    WHEN LOWER(er.estado_nombre) LIKE '%pagada%' THEN 'COBRADOS'
                    WHEN LOWER(er.estado_nombre) LIKE '%confirmar%' OR LOWER(er.estado_nombre) LIKE '%recibido%' THEN 'CONFIRMAR_RECIBIDO'
                    ELSE 'OTRO'
                END as clasificacion_ventas,

                -- Solo mostrar ventas directas de Magic Travel
                ag_servicio.agencias_nombre as agencia_operadora,

                -- Información de caja si existe
                c.id_caja,
                c.voucher_caja,
                c.enlace_sat,

                res.created_at as fecha_creacion

            FROM reservas res
            JOIN estado er ON res.estado_id = er.estado_id
            JOIN servicio s ON res.id_servicio = s.id_servicio
            LEFT JOIN ruta_activa ra ON res.id_ruta_activa = ra.id_ruta_activa
            LEFT JOIN tour_activo ta ON res.id_tour_activo = ta.id_tour_activo
            LEFT JOIN rutas r ON ra.id_rutas = r.id_rutas
            LEFT JOIN tours t ON ta.id_tour = t.id_tour
            LEFT JOIN agencias ag_servicio ON (r.id_agencias = ag_servicio.id_agencias OR t.id_agencias = ag_servicio.id_agencias)
            LEFT JOIN caja c ON res.id_reservas = c.id_reservas AND c.deleted_at IS NULL

            WHERE res.deleted_at IS NULL
              AND res.id_agencia_transferida IS NULL -- Solo ventas directas
              AND LOWER(ag_servicio.agencias_nombre) LIKE '%magic travel%' -- Solo Magic Travel
            ORDER BY res.created_at DESC
        ");

        // VISTA 2: Caja Diaria - Solo registros de caja
        DB::statement("
            CREATE VIEW v_caja_diaria AS
            SELECT
                DATE(c.fecha_servicio) as fecha_operacion,
                c.id_caja,
                c.numero_voucher,
                c.origen,
                c.destino,
                c.fecha_servicio,
                c.pax_adultos,
                c.pax_ninos,
                c.total_pax,
                c.precio_unitario,
                c.precio_total,
                c.direccion,
                c.servicio_cobrar_pax as ingreso_caja,
                c.servicio_precio_descuento as costo_servicio,
                (c.servicio_cobrar_pax - c.servicio_precio_descuento) as ganancia_bruta,
                c.voucher_caja,
                c.enlace_sat,

                -- Información de la reserva asociada
                res.reservas_nombres_cliente,
                res.reservas_apellidos_cliente,
                res.reservas_telefono_cliente,
                er.estado_nombre as estado_reserva,

                -- Verificar si hay factura SAT
                CASE
                    WHEN fs.id_facturas_sat IS NOT NULL THEN 'FACTURADO'
                    ELSE 'SIN_FACTURA'
                END as estado_facturacion,
                fs.numero_documento as numero_factura,
                fs.gran_total as total_facturado,

                c.created_at as fecha_registro_caja

            FROM caja c
            JOIN reservas res ON c.id_reservas = res.id_reservas
            JOIN estado er ON res.estado_id = er.estado_id
            LEFT JOIN facturas_sat fs ON c.id_caja = fs.id_caja AND fs.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
            ORDER BY c.fecha_servicio DESC
        ");

        // VISTA 3: Resumen de Ventas por Fecha
        DB::statement("
            CREATE VIEW v_resumen_ventas_fecha AS
            SELECT
                DATE(cv.fecha_servicio) as fecha,
                COUNT(cv.id_reservas) as total_servicios,
                SUM(cv.total_pax) as total_pasajeros,

                -- Por clasificación
                COUNT(CASE WHEN cv.clasificacion_ventas = 'POR_COBRAR' THEN 1 END) as por_cobrar,
                COUNT(CASE WHEN cv.clasificacion_ventas = 'COBRADOS' THEN 1 END) as cobrados,
                COUNT(CASE WHEN cv.clasificacion_ventas = 'CONFIRMAR_RECIBIDO' THEN 1 END) as confirmar_recibido,

                -- Por forma de pago
                COUNT(CASE WHEN cv.forma_pago = 'PAGO_CAJA' THEN 1 END) as pagos_caja,
                COUNT(CASE WHEN cv.forma_pago = 'PAGO_CONDUCTOR' THEN 1 END) as pagos_conductor,
                COUNT(CASE WHEN cv.forma_pago = 'PENDIENTE' THEN 1 END) as pendientes,

                -- Montos
                SUM(cv.monto_total) as ingresos_totales,
                SUM(CASE WHEN cv.clasificacion_ventas = 'COBRADOS' THEN cv.monto_total ELSE 0 END) as ingresos_confirmados,
                SUM(CASE WHEN cv.clasificacion_ventas = 'POR_COBRAR' THEN cv.monto_total ELSE 0 END) as pendientes_cobro,

                -- Promedio
                AVG(cv.monto_total) as ticket_promedio

            FROM v_control_ventas cv
            GROUP BY DATE(cv.fecha_servicio)
            ORDER BY fecha DESC
        ");

        // VISTA 4: Control de Liquidación de Rutas (VENTAS)
        DB::statement("
            CREATE VIEW v_control_liquidacion_ventas AS
            SELECT
                ra.id_ruta_activa,
                DATE(ra.ruta_activa_fecha) as fecha_ruta,
                TIME(ra.ruta_activa_fecha) as hora_ruta,
                CONCAT(r.rutas_origen, ' -> ', r.rutas_destino) as ruta_detalle,
                v.vehiculo_placa,
                v.vehiculo_pago_conductor,

                COUNT(cv.id_reservas) as total_reservas,
                SUM(cv.total_pax) as total_pasajeros,
                SUM(cv.monto_total) as ingresos_esperados,

                -- Control de pagos
                COUNT(CASE WHEN cv.clasificacion_ventas = 'COBRADOS' THEN 1 END) as pagos_confirmados,
                COUNT(CASE WHEN cv.clasificacion_ventas = 'POR_COBRAR' THEN 1 END) as pendientes_pago,
                COUNT(CASE WHEN cv.clasificacion_ventas = 'CONFIRMAR_RECIBIDO' THEN 1 END) as pendientes_confirmacion,

                SUM(CASE WHEN cv.clasificacion_ventas = 'COBRADOS' THEN cv.monto_total ELSE 0 END) as ingresos_confirmados,

                -- Control de egresos
                COUNT(era.id_egresos_ruta_activa) as total_egresos,
                IFNULL(SUM(era.cantidad_egreso), 0) as monto_egresos,

                -- Estado y control de liquidación
                er.estado_nombre as estado_ruta,
                fn_ruta_liquidada(ra.id_ruta_activa) as ruta_liquidada,

                CASE
                    WHEN fn_ruta_liquidada(ra.id_ruta_activa) = TRUE THEN 'LIQUIDADA'
                    WHEN COUNT(CASE WHEN cv.clasificacion_ventas = 'POR_COBRAR' THEN 1 END) > 0 THEN 'PENDIENTE_PAGOS'
                    WHEN COUNT(CASE WHEN cv.clasificacion_ventas = 'CONFIRMAR_RECIBIDO' THEN 1 END) > 0 THEN 'PENDIENTE_CONFIRMACION'
                    ELSE 'LISTO_LIQUIDAR'
                END as estado_liquidacion,

                -- Balance estimado
                (SUM(cv.monto_total) - IFNULL(SUM(era.cantidad_egreso), 0) - IFNULL(v.vehiculo_pago_conductor, 0)) as ganancia_estimada

            FROM ruta_activa ra
            JOIN rutas r ON ra.id_rutas = r.id_rutas
            JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
            JOIN estado er ON ra.estado_id = er.estado_id
            LEFT JOIN v_control_ventas cv ON ra.id_ruta_activa = (
                SELECT ra2.id_ruta_activa FROM ruta_activa ra2
                JOIN servicio s2 ON ra2.id_ruta_activa = s2.id_ruta_activa
                WHERE s2.id_servicio = (
                    SELECT s3.id_servicio FROM servicio s3
                    JOIN reservas r3 ON s3.id_servicio = r3.id_servicio
                    WHERE r3.id_reservas = cv.id_reservas
                )
            )
            LEFT JOIN egresos_ruta_activa era ON ra.id_ruta_activa = era.id_ruta_activa AND era.deleted_at IS NULL
            WHERE ra.deleted_at IS NULL
            GROUP BY ra.id_ruta_activa, ra.ruta_activa_fecha, r.rutas_origen, r.rutas_destino,
                     v.vehiculo_placa, v.vehiculo_pago_conductor, er.estado_nombre
            ORDER BY ra.ruta_activa_fecha DESC
        ");

        // VISTA 5: Egresos por Ruta
        DB::statement("
            CREATE VIEW v_egresos_por_ruta AS
            SELECT
                era.id_egresos_ruta_activa,
                era.motivo_egreso,
                era.cantidad_egreso,
                era.descripcion_egreso,
                era.created_at as fecha_egreso,
                ra.id_ruta_activa,
                DATE(ra.ruta_activa_fecha) as fecha_ruta,
                CONCAT(r.rutas_origen, ' -> ', r.rutas_destino) as ruta_detalle,
                v.vehiculo_placa,

                -- Usuario que registró el egreso
                COALESCE(
                    CONCAT(emp.empleados_nombres, ' ', emp.empleados_apellidos),
                    'Sistema'
                ) as registrado_por,

                -- Estado de la ruta
                er.estado_nombre as estado_ruta,
                fn_ruta_liquidada(ra.id_ruta_activa) as ruta_liquidada

            FROM egresos_ruta_activa era
            JOIN ruta_activa ra ON era.id_ruta_activa = ra.id_ruta_activa
            JOIN rutas r ON ra.id_rutas = r.id_rutas
            JOIN vehiculo v ON ra.id_vehiculo = v.id_vehiculo
            JOIN estado er ON ra.estado_id = er.estado_id
            LEFT JOIN usuarios u ON era.created_by = u.id_usuarios
            LEFT JOIN empleados emp ON u.id_empleados = emp.id_empleados
            WHERE era.deleted_at IS NULL
            ORDER BY era.created_at DESC
        ");
    }

    /**
     * Crear vistas específicas para módulo CONTABILIDAD
     */
    private function createContabilidadViews()
    {
        // VISTA 1: Estado de Cuenta Contabilidad con 4 Escenarios
        DB::statement("
            CREATE VIEW v_estado_cuenta_contabilidad AS
            SELECT
                res.id_reservas,
                res.reservas_transferido_por,
                res.reservas_voucher,
                DATE(COALESCE(ra.ruta_activa_fecha, ta.tour_activo_fecha)) as fecha_servicio,
                TIME(COALESCE(ra.ruta_activa_fecha, ta.tour_activo_fecha)) as hora_servicio,
                res.reservas_cantidad_adultos,
                res.reservas_cantidad_ninos,
                (res.reservas_cantidad_adultos + IFNULL(res.reservas_cantidad_ninos, 0)) as total_pax,
                res.reservas_direccion_abordaje,
                res.reservas_nombres_cliente,
                res.reservas_apellidos_cliente,

                -- Servicio dinámico
                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN CONCAT(r.rutas_origen, ' -> ', r.rutas_destino)
                    WHEN res.id_tour_activo IS NOT NULL THEN t.tours_nombre
                    ELSE 'N/A'
                END as servicio_detalle,

                s.servicio_precio_descuento as precio_unitario,
                res.reservas_cobrar_a_pax as monto_recibido,

                -- Información de agencias y escenario
                ag_servicio.agencias_nombre as agencia_operadora,
                COALESCE(ag_transferida.agencias_nombre, 'N/A') as agencia_transferida,
                fn_determinar_escenario_transferencia(res.id_reservas) as escenario,

                -- Estados para filtros de contabilidad
                CASE
                    WHEN LOWER(er.estado_nombre) LIKE '%cobrar%' OR LOWER(er.estado_nombre) LIKE '%pendiente%' OR LOWER(er.estado_nombre) LIKE '%confirmada%' THEN 'POR_COBRAR'
                    WHEN LOWER(er.estado_nombre) LIKE '%cobrado%' OR LOWER(er.estado_nombre) LIKE '%pagada%' OR LOWER(er.estado_nombre) LIKE '%liquidar%' THEN 'COBRADOS'
                    ELSE 'OTRO'
                END as clasificacion_contabilidad,

                er.estado_nombre as estado_reserva,

                -- Información de liquidación
                CASE
                    WHEN res.id_ruta_activa IS NOT NULL THEN fn_ruta_liquidada(res.id_ruta_activa)
                    ELSE TRUE
                END as servicio_liquidado,

                res.created_at as fecha_creacion

            FROM reservas res
            JOIN servicio s ON res.id_servicio = s.id_servicio
            JOIN estado er ON res.estado_id = er.estado_id
            LEFT JOIN ruta_activa ra ON res.id_ruta_activa = ra.id_ruta_activa
            LEFT JOIN rutas r ON ra.id_rutas = r.id_rutas
            LEFT JOIN tour_activo ta ON res.id_tour_activo = ta.id_tour_activo
            LEFT JOIN tours t ON ta.id_tour = t.id_tour
            LEFT JOIN agencias ag_servicio ON (r.id_agencias = ag_servicio.id_agencias OR t.id_agencias = ag_servicio.id_agencias)
            LEFT JOIN agencias ag_transferida ON res.id_agencia_transferida = ag_transferida.id_agencias

            WHERE res.deleted_at IS NULL
            ORDER BY res.created_at DESC
        ");

        // VISTA 2: Resumen por Agencia (Contabilidad)
        DB::statement("
            CREATE VIEW v_resumen_agencia_contabilidad AS
            SELECT
                ec.agencia_operadora as agencia,
                COUNT(ec.id_reservas) as total_servicios,
                SUM(ec.total_pax) as total_pasajeros,

                -- Por escenario
                COUNT(CASE WHEN ec.escenario = 'VENTA_DIRECTA' THEN 1 END) as ventas_directas,
                COUNT(CASE WHEN ec.escenario = 'REUBICACION_INTERNA' THEN 1 END) as reubicaciones,
                COUNT(CASE WHEN ec.escenario = 'MAGIC_RECIBE_OPERA' THEN 1 END) as recibe_opera,
                COUNT(CASE WHEN ec.escenario = 'MAGIC_PUENTE' THEN 1 END) as solo_puente,

                -- Por clasificación contable
                COUNT(CASE WHEN ec.clasificacion_contabilidad = 'POR_COBRAR' THEN 1 END) as por_cobrar,
                COUNT(CASE WHEN ec.clasificacion_contabilidad = 'COBRADOS' THEN 1 END) as cobrados,

                -- Montos
                SUM(ec.monto_recibido) as total_recibido,
                SUM(ec.precio_unitario * ec.total_pax) as total_costos,
                SUM(ec.monto_recibido - (ec.precio_unitario * ec.total_pax)) as balance_bruto,

                -- Solo servicios liquidados
                COUNT(CASE WHEN ec.servicio_liquidado = TRUE THEN 1 END) as servicios_liquidados,
                COUNT(CASE WHEN ec.servicio_liquidado = FALSE THEN 1 END) as servicios_pendientes

            FROM v_estado_cuenta_contabilidad ec
            WHERE ec.agencia_operadora IS NOT NULL
            GROUP BY ec.agencia_operadora
            ORDER BY balance_bruto DESC
        ");

        // VISTA 3: Estado de Cuenta por Fechas (Contabilidad)
        DB::statement("
            CREATE VIEW v_estado_cuenta_fechas AS
            SELECT
                ec.fecha_servicio,
                WEEK(ec.fecha_servicio) as semana,
                MONTH(ec.fecha_servicio) as mes,
                YEAR(ec.fecha_servicio) as año,

                COUNT(ec.id_reservas) as total_reservas,
                SUM(ec.total_pax) as total_pasajeros,

                -- Estados contables
                COUNT(CASE WHEN ec.clasificacion_contabilidad = 'POR_COBRAR' THEN 1 END) as por_cobrar,
                COUNT(CASE WHEN ec.clasificacion_contabilidad = 'COBRADOS' THEN 1 END) as cobrados,

                -- Solo liquidados
                COUNT(CASE WHEN ec.servicio_liquidado = TRUE THEN 1 END) as liquidados,
                COUNT(CASE WHEN ec.servicio_liquidado = FALSE THEN 1 END) as pendiente_liquidacion,

                -- Montos
                SUM(ec.monto_recibido) as total_recibido,
                SUM(ec.precio_unitario * ec.total_pax) as total_costos,
                SUM(ec.monto_recibido - (ec.precio_unitario * ec.total_pax)) as balance_neto,

                -- Por agencia (Magic Travel vs otros)
                COUNT(CASE WHEN ec.agencia_operadora LIKE '%Magic Travel%' THEN 1 END) as servicios_propios,
                COUNT(CASE WHEN ec.agencia_operadora NOT LIKE '%Magic Travel%' THEN 1 END) as servicios_terceros

            FROM v_estado_cuenta_contabilidad ec
            GROUP BY ec.fecha_servicio, WEEK(ec.fecha_servicio), MONTH(ec.fecha_servicio), YEAR(ec.fecha_servicio)
            ORDER BY ec.fecha_servicio DESC
        ");

        // VISTA 4: Detalle de Vouchers (Contabilidad)
        DB::statement("
            CREATE VIEW v_detalle_vouchers AS
            SELECT
                ec.id_reservas,
                ec.reservas_voucher,
                ec.fecha_servicio,
                ec.servicio_detalle,
                ec.reservas_nombres_cliente,
                ec.reservas_apellidos_cliente,
                ec.total_pax,
                ec.monto_recibido,
                ec.agencia_operadora,
                ec.agencia_transferida,
                ec.escenario,
                ec.clasificacion_contabilidad,
                ec.estado_reserva,
                ec.servicio_liquidado,

                -- Información adicional de voucher
                CASE
                    WHEN ec.reservas_voucher IS NOT NULL AND ec.reservas_voucher != '' THEN 'CON_VOUCHER'
                    ELSE 'SIN_VOUCHER'
                END as estado_voucher,

                CASE
                    WHEN ec.servicio_liquidado = TRUE AND (ec.reservas_voucher IS NOT NULL AND ec.reservas_voucher != '') THEN 'COMPLETO'
                    WHEN ec.servicio_liquidado = FALSE THEN 'PENDIENTE_LIQUIDACION'
                    WHEN ec.reservas_voucher IS NULL OR ec.reservas_voucher = '' THEN 'PENDIENTE_VOUCHER'
                    ELSE 'ESTADO_INDEFINIDO'
                END as estado_proceso

            FROM v_estado_cuenta_contabilidad ec
            ORDER BY ec.fecha_servicio DESC
        ");
    }

    /**
     * Rollback - Eliminar toda la automatización
     */
    public function down()
    {
        // Eliminar vistas de contabilidad
        DB::statement('DROP VIEW IF EXISTS v_detalle_vouchers');
        DB::statement('DROP VIEW IF EXISTS v_estado_cuenta_fechas');
        DB::statement('DROP VIEW IF EXISTS v_resumen_agencia_contabilidad');
        DB::statement('DROP VIEW IF EXISTS v_estado_cuenta_contabilidad');

        // Eliminar vistas de ventas
        DB::statement('DROP VIEW IF EXISTS v_egresos_por_ruta');
        DB::statement('DROP VIEW IF EXISTS v_control_liquidacion_ventas');
        DB::statement('DROP VIEW IF EXISTS v_resumen_ventas_fecha');
        DB::statement('DROP VIEW IF EXISTS v_caja_diaria');
        DB::statement('DROP VIEW IF EXISTS v_control_ventas');

        // Eliminar vistas principales
        DB::statement('DROP VIEW IF EXISTS v_reservas_completas_escenarios');
        DB::statement('DROP VIEW IF EXISTS v_ocupacion_rutas_completa');

        // Eliminar funciones
        DB::unprepared('DROP FUNCTION IF EXISTS fn_forma_pago_reserva');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_ruta_liquidada');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_determinar_escenario_transferencia');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_verificar_disponibilidad_ruta');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_calcular_precio_reserva');

        // Eliminar triggers
        DB::unprepared('DROP TRIGGER IF EXISTS tr_caja_actualizar_total_pax');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_caja_calcular_total_pax');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_crear_caja');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_control_capacidad');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_actualizar_precio');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reserva_calcular_precio');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicio_actualizar_descuento');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicio_calcular_descuento');
    }
};
