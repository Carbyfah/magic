<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * TRIGGERS DE AUDITORÍA MAGIC TRAVEL v3.0 - SIN CAMPOS SITUACIÓN
     * Triggers automáticos para capturar INSERT, UPDATE, DELETE
     * en todas las tablas principales y guardar en tablas *_auditoria
     * ELIMINADOS: todos los campos *_situacion (soft delete hace este trabajo)
     */
    public function up()
    {
        $this->createAgenciasAuditTriggers();
        $this->createEstadoAuditTriggers();
        $this->createCargoAuditTriggers();
        $this->createRutasAuditTriggers();
        $this->createToursAuditTriggers();
        $this->createVehiculoAuditTriggers();
        $this->createEmpleadosAuditTriggers();
        $this->createUsuariosAuditTriggers();
        $this->createRutaActivaAuditTriggers();
        $this->createTourActivoAuditTriggers();
        $this->createServicioAuditTriggers();
        $this->createReservasAuditTriggers();
        $this->createDatosReservasClientesAuditTriggers();
    }

    // 1. AGENCIAS
    private function createAgenciasAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_agencias_audit_insert
            AFTER INSERT ON agencias
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_auditoria (
                    id_agencias, agencias_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_agencias, NEW.agencias_nombre,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_agencias_audit_update
            AFTER UPDATE ON agencias
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_auditoria (
                    id_agencias, agencias_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_agencias, OLD.agencias_nombre,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_agencias_audit_delete
            BEFORE DELETE ON agencias
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_auditoria (
                    id_agencias, agencias_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_agencias, OLD.agencias_nombre,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 2. ESTADO
    private function createEstadoAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_estado_audit_insert
            AFTER INSERT ON estado
            FOR EACH ROW
            BEGIN
                INSERT INTO estado_auditoria (
                    estado_id, estado_nombre, estado_descripcion,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.estado_id, NEW.estado_nombre, NEW.estado_descripcion,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_estado_audit_update
            AFTER UPDATE ON estado
            FOR EACH ROW
            BEGIN
                INSERT INTO estado_auditoria (
                    estado_id, estado_nombre, estado_descripcion,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.estado_id, OLD.estado_nombre, OLD.estado_descripcion,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_estado_audit_delete
            BEFORE DELETE ON estado
            FOR EACH ROW
            BEGIN
                INSERT INTO estado_auditoria (
                    estado_id, estado_nombre, estado_descripcion,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.estado_id, OLD.estado_nombre, OLD.estado_descripcion,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 3. CARGO
    private function createCargoAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_cargo_audit_insert
            AFTER INSERT ON cargo
            FOR EACH ROW
            BEGIN
                INSERT INTO cargo_auditoria (
                    id_cargo, cargo_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_cargo, NEW.cargo_nombre,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_cargo_audit_update
            AFTER UPDATE ON cargo
            FOR EACH ROW
            BEGIN
                INSERT INTO cargo_auditoria (
                    id_cargo, cargo_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_cargo, OLD.cargo_nombre,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_cargo_audit_delete
            BEFORE DELETE ON cargo
            FOR EACH ROW
            BEGIN
                INSERT INTO cargo_auditoria (
                    id_cargo, cargo_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_cargo, OLD.cargo_nombre,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 4. RUTAS
    private function createRutasAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_rutas_audit_insert
            AFTER INSERT ON rutas
            FOR EACH ROW
            BEGIN
                INSERT INTO rutas_auditoria (
                    id_rutas, rutas_origen, rutas_destino, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_rutas, NEW.rutas_origen, NEW.rutas_destino, NEW.id_agencias,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_rutas_audit_update
            AFTER UPDATE ON rutas
            FOR EACH ROW
            BEGIN
                INSERT INTO rutas_auditoria (
                    id_rutas, rutas_origen, rutas_destino, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_rutas, OLD.rutas_origen, OLD.rutas_destino, OLD.id_agencias,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_rutas_audit_delete
            BEFORE DELETE ON rutas
            FOR EACH ROW
            BEGIN
                INSERT INTO rutas_auditoria (
                    id_rutas, rutas_origen, rutas_destino, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_rutas, OLD.rutas_origen, OLD.rutas_destino, OLD.id_agencias,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 5. TOURS
    private function createToursAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_tours_audit_insert
            AFTER INSERT ON tours
            FOR EACH ROW
            BEGIN
                INSERT INTO tours_auditoria (
                    id_tour, tours_nombre, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_tour, NEW.tours_nombre, NEW.id_agencias,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_tours_audit_update
            AFTER UPDATE ON tours
            FOR EACH ROW
            BEGIN
                INSERT INTO tours_auditoria (
                    id_tour, tours_nombre, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tour, OLD.tours_nombre, OLD.id_agencias,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_tours_audit_delete
            BEFORE DELETE ON tours
            FOR EACH ROW
            BEGIN
                INSERT INTO tours_auditoria (
                    id_tour, tours_nombre, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tour, OLD.tours_nombre, OLD.id_agencias,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 6. VEHICULO
    private function createVehiculoAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_vehiculo_audit_insert
            AFTER INSERT ON vehiculo
            FOR EACH ROW
            BEGIN
                INSERT INTO vehiculo_auditoria (
                    id_vehiculo, vehiculo_marca, vehiculo_placa, vehiculo_capacidad,
                    estado_id, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_vehiculo, NEW.vehiculo_marca, NEW.vehiculo_placa, NEW.vehiculo_capacidad,
                    NEW.estado_id, NEW.id_agencias,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_vehiculo_audit_update
            AFTER UPDATE ON vehiculo
            FOR EACH ROW
            BEGIN
                INSERT INTO vehiculo_auditoria (
                    id_vehiculo, vehiculo_marca, vehiculo_placa, vehiculo_capacidad,
                    estado_id, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_vehiculo, OLD.vehiculo_marca, OLD.vehiculo_placa, OLD.vehiculo_capacidad,
                    OLD.estado_id, OLD.id_agencias,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_vehiculo_audit_delete
            BEFORE DELETE ON vehiculo
            FOR EACH ROW
            BEGIN
                INSERT INTO vehiculo_auditoria (
                    id_vehiculo, vehiculo_marca, vehiculo_placa, vehiculo_capacidad,
                    estado_id, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_vehiculo, OLD.vehiculo_marca, OLD.vehiculo_placa, OLD.vehiculo_capacidad,
                    OLD.estado_id, OLD.id_agencias,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 7. EMPLEADOS
    private function createEmpleadosAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_empleados_audit_insert
            AFTER INSERT ON empleados
            FOR EACH ROW
            BEGIN
                INSERT INTO empleados_auditoria (
                    id_empleados, empleados_nombres, empleados_apellidos, empleados_dpi,
                    id_agencias, id_cargo,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_empleados, NEW.empleados_nombres, NEW.empleados_apellidos, NEW.empleados_dpi,
                    NEW.id_agencias, NEW.id_cargo,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_empleados_audit_update
            AFTER UPDATE ON empleados
            FOR EACH ROW
            BEGIN
                INSERT INTO empleados_auditoria (
                    id_empleados, empleados_nombres, empleados_apellidos, empleados_dpi,
                    id_agencias, id_cargo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_empleados, OLD.empleados_nombres, OLD.empleados_apellidos, OLD.empleados_dpi,
                    OLD.id_agencias, OLD.id_cargo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_empleados_audit_delete
            BEFORE DELETE ON empleados
            FOR EACH ROW
            BEGIN
                INSERT INTO empleados_auditoria (
                    id_empleados, empleados_nombres, empleados_apellidos, empleados_dpi,
                    id_agencias, id_cargo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_empleados, OLD.empleados_nombres, OLD.empleados_apellidos, OLD.empleados_dpi,
                    OLD.id_agencias, OLD.id_cargo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 8. USUARIOS
    private function createUsuariosAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_usuarios_audit_insert
            AFTER INSERT ON usuarios
            FOR EACH ROW
            BEGIN
                INSERT INTO usuarios_auditoria (
                    id_usuarios, usuarios_nombre, usuarios_correo, usuario_password,
                    id_empleados,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_usuarios, NEW.usuarios_nombre, NEW.usuarios_correo, NEW.usuario_password,
                    NEW.id_empleados,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_usuarios_audit_update
            AFTER UPDATE ON usuarios
            FOR EACH ROW
            BEGIN
                INSERT INTO usuarios_auditoria (
                    id_usuarios, usuarios_nombre, usuarios_correo, usuario_password,
                    id_empleados,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_usuarios, OLD.usuarios_nombre, OLD.usuarios_correo, OLD.usuario_password,
                    OLD.id_empleados,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_usuarios_audit_delete
            BEFORE DELETE ON usuarios
            FOR EACH ROW
            BEGIN
                INSERT INTO usuarios_auditoria (
                    id_usuarios, usuarios_nombre, usuarios_correo, usuario_password,
                    id_empleados,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_usuarios, OLD.usuarios_nombre, OLD.usuarios_correo, OLD.usuario_password,
                    OLD.id_empleados,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 9. RUTA ACTIVA
    private function createRutaActivaAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_ruta_activa_audit_insert
            AFTER INSERT ON ruta_activa
            FOR EACH ROW
            BEGIN
                INSERT INTO ruta_activa_auditoria (
                    id_ruta_activa, ruta_activa_fecha,
                    estado_id, id_rutas, id_vehiculo,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_ruta_activa, NEW.ruta_activa_fecha,
                    NEW.estado_id, NEW.id_rutas, NEW.id_vehiculo,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_ruta_activa_audit_update
            AFTER UPDATE ON ruta_activa
            FOR EACH ROW
            BEGIN
                INSERT INTO ruta_activa_auditoria (
                    id_ruta_activa, ruta_activa_fecha,
                    estado_id, id_rutas, id_vehiculo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_ruta_activa, OLD.ruta_activa_fecha,
                    OLD.estado_id, OLD.id_rutas, OLD.id_vehiculo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_ruta_activa_audit_delete
            BEFORE DELETE ON ruta_activa
            FOR EACH ROW
            BEGIN
                INSERT INTO ruta_activa_auditoria (
                    id_ruta_activa, ruta_activa_fecha,
                    estado_id, id_rutas, id_vehiculo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_ruta_activa, OLD.ruta_activa_fecha,
                    OLD.estado_id, OLD.id_rutas, OLD.id_vehiculo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 10. TOUR ACTIVO
    private function createTourActivoAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_tour_activo_audit_insert
            AFTER INSERT ON tour_activo
            FOR EACH ROW
            BEGIN
                INSERT INTO tour_activo_auditoria (
                    id_tour_activo, tour_activo_fecha, tour_activo_tipo,
                    estado_id, id_tour,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_tour_activo, NEW.tour_activo_fecha, NEW.tour_activo_tipo,
                    NEW.estado_id, NEW.id_tour,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_tour_activo_audit_update
            AFTER UPDATE ON tour_activo
            FOR EACH ROW
            BEGIN
                INSERT INTO tour_activo_auditoria (
                    id_tour_activo, tour_activo_fecha, tour_activo_tipo,
                    estado_id, id_tour,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tour_activo, OLD.tour_activo_fecha, OLD.tour_activo_tipo,
                    OLD.estado_id, OLD.id_tour,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_tour_activo_audit_delete
            BEFORE DELETE ON tour_activo
            FOR EACH ROW
            BEGIN
                INSERT INTO tour_activo_auditoria (
                    id_tour_activo, tour_activo_fecha, tour_activo_tipo,
                    estado_id, id_tour,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tour_activo, OLD.tour_activo_fecha, OLD.tour_activo_tipo,
                    OLD.estado_id, OLD.id_tour,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 11. SERVICIO
    private function createServicioAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_servicio_audit_insert
            AFTER INSERT ON servicio
            FOR EACH ROW
            BEGIN
                INSERT INTO servicio_auditoria (
                    id_servicio, tipo_servicio, precio_servicio,
                    servicio_precio_descuento, servicio_descuento_porcentaje,
                    id_tour_activo, id_ruta_activa,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_servicio, NEW.tipo_servicio, NEW.precio_servicio,
                    NEW.servicio_precio_descuento, NEW.servicio_descuento_porcentaje,
                    NEW.id_tour_activo, NEW.id_ruta_activa,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_servicio_audit_update
            AFTER UPDATE ON servicio
            FOR EACH ROW
            BEGIN
                INSERT INTO servicio_auditoria (
                    id_servicio, tipo_servicio, precio_servicio,
                    servicio_precio_descuento, servicio_descuento_porcentaje,
                    id_tour_activo, id_ruta_activa,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_servicio, OLD.tipo_servicio, OLD.precio_servicio,
                    OLD.servicio_precio_descuento, OLD.servicio_descuento_porcentaje,
                    OLD.id_tour_activo, OLD.id_ruta_activa,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_servicio_audit_delete
            BEFORE DELETE ON servicio
            FOR EACH ROW
            BEGIN
                INSERT INTO servicio_auditoria (
                    id_servicio, tipo_servicio, precio_servicio,
                    servicio_precio_descuento, servicio_descuento_porcentaje,
                    id_tour_activo, id_ruta_activa,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_servicio, OLD.tipo_servicio, OLD.precio_servicio,
                    OLD.servicio_precio_descuento, OLD.servicio_descuento_porcentaje,
                    OLD.id_tour_activo, OLD.id_ruta_activa,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 12. RESERVAS
    private function createReservasAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_reservas_audit_insert
            AFTER INSERT ON reservas
            FOR EACH ROW
            BEGIN
                INSERT INTO reservas_auditoria (
                    id_reservas, reservas_cantidad_adultos, reservas_cantidad_ninos,
                    reservas_nombres_cliente, reservas_apellidos_cliente,
                    reservas_direccion_abordaje, reservas_telefono_cliente,
                    reservas_cliente_nit, reservas_habitacion_pax,
                    reservas_transferido_por, reservas_notas, reservas_cobrar_a_pax,
                    id_agencia_transferida,
                    id_servicio, estado_id, id_ruta_activa, id_tour_activo,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_reservas, NEW.reservas_cantidad_adultos, NEW.reservas_cantidad_ninos,
                    NEW.reservas_nombres_cliente, NEW.reservas_apellidos_cliente,
                    NEW.reservas_direccion_abordaje, NEW.reservas_telefono_cliente,
                    NEW.reservas_cliente_nit, NEW.reservas_habitacion_pax,
                    NEW.reservas_transferido_por, NEW.reservas_notas, NEW.reservas_cobrar_a_pax,
                    NEW.id_agencia_transferida,
                    NEW.id_servicio, NEW.estado_id, NEW.id_ruta_activa, NEW.id_tour_activo,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_reservas_audit_update
            AFTER UPDATE ON reservas
            FOR EACH ROW
            BEGIN
                INSERT INTO reservas_auditoria (
                    id_reservas, reservas_cantidad_adultos, reservas_cantidad_ninos,
                    reservas_nombres_cliente, reservas_apellidos_cliente,
                    reservas_direccion_abordaje, reservas_telefono_cliente,
                    reservas_cliente_nit, reservas_habitacion_pax,
                    reservas_transferido_por, reservas_notas, reservas_cobrar_a_pax,
                    id_agencia_transferida,
                    id_servicio, estado_id, id_ruta_activa, id_tour_activo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_reservas, OLD.reservas_cantidad_adultos, OLD.reservas_cantidad_ninos,
                    OLD.reservas_nombres_cliente, OLD.reservas_apellidos_cliente,
                    OLD.reservas_direccion_abordaje, OLD.reservas_telefono_cliente,
                    OLD.reservas_cliente_nit, OLD.reservas_habitacion_pax,
                    OLD.reservas_transferido_por, OLD.reservas_notas, OLD.reservas_cobrar_a_pax,
                    OLD.id_agencia_transferida,
                    OLD.id_servicio, OLD.estado_id, OLD.id_ruta_activa, OLD.id_tour_activo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_reservas_audit_delete
            BEFORE DELETE ON reservas
            FOR EACH ROW
            BEGIN
                INSERT INTO reservas_auditoria (
                    id_reservas, reservas_cantidad_adultos, reservas_cantidad_ninos,
                    reservas_nombres_cliente, reservas_apellidos_cliente,
                    reservas_direccion_abordaje, reservas_telefono_cliente,
                    reservas_cliente_nit, reservas_habitacion_pax,
                    reservas_transferido_por, reservas_notas, reservas_cobrar_a_pax,
                    id_agencia_transferida,
                    id_servicio, estado_id, id_ruta_activa, id_tour_activo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_reservas, OLD.reservas_cantidad_adultos, OLD.reservas_cantidad_ninos,
                    OLD.reservas_nombres_cliente, OLD.reservas_apellidos_cliente,
                    OLD.reservas_direccion_abordaje, OLD.reservas_telefono_cliente,
                    OLD.reservas_cliente_nit, OLD.reservas_habitacion_pax,
                    OLD.reservas_transferido_por, OLD.reservas_notas, OLD.reservas_cobrar_a_pax,
                    OLD.id_agencia_transferida,
                    OLD.id_servicio, OLD.estado_id, OLD.id_ruta_activa, OLD.id_tour_activo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 13. DATOS RESERVAS CLIENTES
    private function createDatosReservasClientesAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_datos_clientes_audit_insert
            AFTER INSERT ON datos_reservas_clientes
            FOR EACH ROW
            BEGIN
                INSERT INTO datos_reservas_clientes_auditoria (
                    id_datos_reservas_clientes,
                    datos_reservas_clientes_nombres, datos_reservas_clientes_apellidos,
                    id_reservas,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_datos_reservas_clientes,
                    NEW.datos_reservas_clientes_nombres, NEW.datos_reservas_clientes_apellidos,
                    NEW.id_reservas,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_datos_clientes_audit_update
            AFTER UPDATE ON datos_reservas_clientes
            FOR EACH ROW
            BEGIN
                INSERT INTO datos_reservas_clientes_auditoria (
                    id_datos_reservas_clientes,
                    datos_reservas_clientes_nombres, datos_reservas_clientes_apellidos,
                    id_reservas,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_datos_reservas_clientes,
                    OLD.datos_reservas_clientes_nombres, OLD.datos_reservas_clientes_apellidos,
                    OLD.id_reservas,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_datos_clientes_audit_delete
            BEFORE DELETE ON datos_reservas_clientes
            FOR EACH ROW
            BEGIN
                INSERT INTO datos_reservas_clientes_auditoria (
                    id_datos_reservas_clientes,
                    datos_reservas_clientes_nombres, datos_reservas_clientes_apellidos,
                    id_reservas,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_datos_reservas_clientes,
                    OLD.datos_reservas_clientes_nombres, OLD.datos_reservas_clientes_apellidos,
                    OLD.id_reservas,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    /**
     * Rollback - Eliminar todos los triggers de auditoría
     */
    public function down()
    {
        // Eliminar triggers de datos_reservas_clientes
        DB::unprepared('DROP TRIGGER IF EXISTS tr_datos_clientes_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_datos_clientes_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_datos_clientes_audit_insert');

        // Eliminar triggers de reservas
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_audit_insert');

        // Eliminar triggers de servicio
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicio_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicio_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicio_audit_insert');

        // Eliminar triggers de tour_activo
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tour_activo_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tour_activo_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tour_activo_audit_insert');

        // Eliminar triggers de ruta_activa
        DB::unprepared('DROP TRIGGER IF EXISTS tr_ruta_activa_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_ruta_activa_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_ruta_activa_audit_insert');

        // Eliminar triggers de usuarios
        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_audit_insert');

        // Eliminar triggers de empleados
        DB::unprepared('DROP TRIGGER IF EXISTS tr_empleados_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_empleados_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_empleados_audit_insert');

        // Eliminar triggers de vehiculo
        DB::unprepared('DROP TRIGGER IF EXISTS tr_vehiculo_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_vehiculo_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_vehiculo_audit_insert');

        // Eliminar triggers de tours
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tours_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tours_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tours_audit_insert');

        // Eliminar triggers de rutas
        DB::unprepared('DROP TRIGGER IF EXISTS tr_rutas_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_rutas_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_rutas_audit_insert');

        // Eliminar triggers de cargo
        DB::unprepared('DROP TRIGGER IF EXISTS tr_cargo_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_cargo_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_cargo_audit_insert');

        // Eliminar triggers de estado
        DB::unprepared('DROP TRIGGER IF EXISTS tr_estado_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_estado_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_estado_audit_insert');

        // Eliminar triggers de agencias
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_audit_insert');
    }
};
