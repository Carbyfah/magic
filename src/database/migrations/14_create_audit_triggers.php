<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * TRIGGERS DE AUDITORÍA MAGIC TRAVEL v4.0 - ESTRUCTURA MODULAR CORREGIDA
     * Triggers automáticos para capturar INSERT, UPDATE, DELETE
     * en todas las tablas principales y guardar en tablas *_auditoria
     * CORREGIDO: Adaptado a nueva estructura v4.0
     * AGREGADO: Triggers para nuevas tablas v4.0
     * ELIMINADO: Triggers de tabla 'servicio' que ya no existe
     */
    public function up()
    {
        $this->createAgenciasAuditTriggers();
        $this->createEstadoAuditTriggers();
        $this->createCargoAuditTriggers();
        $this->createRutasAuditTriggers();
        $this->createToursAuditTriggers();
        $this->createAgenciasRutasAuditTriggers();
        $this->createAgenciasToursAuditTriggers();
        $this->createVehiculoAuditTriggers();
        $this->createEmpleadosAuditTriggers();
        $this->createUsuariosAuditTriggers();
        $this->createUsuariosPermisosAuditTriggers();
        $this->createRutaActivaAuditTriggers();
        $this->createTourActivoAuditTriggers();
        // NUEVAS TABLAS v4.0
        $this->createTiposServicioAuditTriggers();
        $this->createServiciosCatalogoAuditTriggers();
        $this->createAgenciasServiciosPreciosAuditTriggers();
        $this->createVouchersSistemaAuditTriggers();
        // TABLA PRINCIPAL v4.0
        $this->createReservasAuditTriggers();
        $this->createReservasServiciosDetalleAuditTriggers();
        $this->createDatosReservasClientesAuditTriggers();
        // MÓDULOS VENTAS Y CONTABILIDAD
        $this->createEgresosRutaActivaAuditTriggers();
        $this->createCajaAuditTriggers();
        $this->createFacturasSatAuditTriggers();
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
                    id_rutas, rutas_origen, rutas_destino,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_rutas, NEW.rutas_origen, NEW.rutas_destino,
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
                    id_rutas, rutas_origen, rutas_destino,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_rutas, OLD.rutas_origen, OLD.rutas_destino,
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
                    id_rutas, rutas_origen, rutas_destino,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_rutas, OLD.rutas_origen, OLD.rutas_destino,
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
                    id_tours, tours_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_tours, NEW.tours_nombre,
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
                    id_tours, tours_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tours, OLD.tours_nombre,
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
                    id_tours, tours_nombre,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tours, OLD.tours_nombre,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 6. AGENCIAS_RUTAS
    private function createAgenciasRutasAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_agencias_rutas_audit_insert
            AFTER INSERT ON agencias_rutas
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_rutas_auditoria (
                    id_agencias, id_rutas,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_agencias, NEW.id_rutas,
                    'INSERT', 1, NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_agencias_rutas_audit_delete
            BEFORE DELETE ON agencias_rutas
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_rutas_auditoria (
                    id_agencias, id_rutas,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_agencias, OLD.id_rutas,
                    'DELETE', 1, NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 7. AGENCIAS_TOURS
    private function createAgenciasToursAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_agencias_tours_audit_insert
            AFTER INSERT ON agencias_tours
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_tours_auditoria (
                    id_agencias, id_tours,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_agencias, NEW.id_tours,
                    'INSERT', 1, NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_agencias_tours_audit_delete
            BEFORE DELETE ON agencias_tours
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_tours_auditoria (
                    id_agencias, id_tours,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_agencias, OLD.id_tours,
                    'DELETE', 1, NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 8. VEHICULO
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
                    vehiculo_pago_conductor,
                    estado_id, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_vehiculo, NEW.vehiculo_marca, NEW.vehiculo_placa, NEW.vehiculo_capacidad,
                    NEW.vehiculo_pago_conductor,
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
                    vehiculo_pago_conductor,
                    estado_id, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_vehiculo, OLD.vehiculo_marca, OLD.vehiculo_placa, OLD.vehiculo_capacidad,
                    OLD.vehiculo_pago_conductor,
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
                    vehiculo_pago_conductor,
                    estado_id, id_agencias,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_vehiculo, OLD.vehiculo_marca, OLD.vehiculo_placa, OLD.vehiculo_capacidad,
                    OLD.vehiculo_pago_conductor,
                    OLD.estado_id, OLD.id_agencias,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 9. EMPLEADOS
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

    // 10. USUARIOS
    private function createUsuariosAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_usuarios_audit_insert
            AFTER INSERT ON usuarios
            FOR EACH ROW
            BEGIN
                INSERT INTO usuarios_auditoria (
                    id_usuarios, usuarios_nombre, usuarios_correo, usuario_password, ultima_sesion,
                    id_empleados,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_usuarios, NEW.usuarios_nombre, NEW.usuarios_correo, NEW.usuario_password, NEW.ultima_sesion,
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
                    id_usuarios, usuarios_nombre, usuarios_correo, usuario_password, ultima_sesion,
                    id_empleados,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_usuarios, OLD.usuarios_nombre, OLD.usuarios_correo, OLD.usuario_password, OLD.ultima_sesion,
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
                    id_usuarios, usuarios_nombre, usuarios_correo, usuario_password, ultima_sesion,
                    id_empleados,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_usuarios, OLD.usuarios_nombre, OLD.usuarios_correo, OLD.usuario_password, OLD.ultima_sesion,
                    OLD.id_empleados,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 11. USUARIOS PERMISOS
    private function createUsuariosPermisosAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_usuarios_permisos_audit_insert
            AFTER INSERT ON usuarios_permisos
            FOR EACH ROW
            BEGIN
                INSERT INTO usuarios_permisos_auditoria (
                    id_usuarios_permisos, id_usuarios, modulo,
                    puede_ver, puede_crear, puede_editar, puede_eliminar,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_usuarios_permisos, NEW.id_usuarios, NEW.modulo,
                    NEW.puede_ver, NEW.puede_crear, NEW.puede_editar, NEW.puede_eliminar,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_usuarios_permisos_audit_update
            AFTER UPDATE ON usuarios_permisos
            FOR EACH ROW
            BEGIN
                INSERT INTO usuarios_permisos_auditoria (
                    id_usuarios_permisos, id_usuarios, modulo,
                    puede_ver, puede_crear, puede_editar, puede_eliminar,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_usuarios_permisos, OLD.id_usuarios, OLD.modulo,
                    OLD.puede_ver, OLD.puede_crear, OLD.puede_editar, OLD.puede_eliminar,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_usuarios_permisos_audit_delete
            BEFORE DELETE ON usuarios_permisos
            FOR EACH ROW
            BEGIN
                INSERT INTO usuarios_permisos_auditoria (
                    id_usuarios_permisos, id_usuarios, modulo,
                    puede_ver, puede_crear, puede_editar, puede_eliminar,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_usuarios_permisos, OLD.id_usuarios, OLD.modulo,
                    OLD.puede_ver, OLD.puede_crear, OLD.puede_editar, OLD.puede_eliminar,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 12. RUTA ACTIVA
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

    // 13. TOUR ACTIVO
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
                    estado_id, id_tours,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_tour_activo, NEW.tour_activo_fecha, NEW.tour_activo_tipo,
                    NEW.estado_id, NEW.id_tours,
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
                    estado_id, id_tours,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tour_activo, OLD.tour_activo_fecha, OLD.tour_activo_tipo,
                    OLD.estado_id, OLD.id_tours,
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
                    estado_id, id_tours,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tour_activo, OLD.tour_activo_fecha, OLD.tour_activo_tipo,
                    OLD.estado_id, OLD.id_tours,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 14. TIPOS SERVICIO (NUEVA TABLA v4.0)
    private function createTiposServicioAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_tipos_servicio_audit_insert
            AFTER INSERT ON tipos_servicio
            FOR EACH ROW
            BEGIN
                INSERT INTO tipos_servicio_auditoria (
                    id_tipo_servicio, nombre_tipo, descripcion_tipo,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_tipo_servicio, NEW.nombre_tipo, NEW.descripcion_tipo,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_tipos_servicio_audit_update
            AFTER UPDATE ON tipos_servicio
            FOR EACH ROW
            BEGIN
                INSERT INTO tipos_servicio_auditoria (
                    id_tipo_servicio, nombre_tipo, descripcion_tipo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tipo_servicio, OLD.nombre_tipo, OLD.descripcion_tipo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_tipos_servicio_audit_delete
            BEFORE DELETE ON tipos_servicio
            FOR EACH ROW
            BEGIN
                INSERT INTO tipos_servicio_auditoria (
                    id_tipo_servicio, nombre_tipo, descripcion_tipo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_tipo_servicio, OLD.nombre_tipo, OLD.descripcion_tipo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 15. SERVICIOS CATALOGO (NUEVA TABLA v4.0)
    private function createServiciosCatalogoAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_servicios_catalogo_audit_insert
            AFTER INSERT ON servicios_catalogo
            FOR EACH ROW
            BEGIN
                INSERT INTO servicios_catalogo_auditoria (
                    id_servicio_catalogo, id_tipo_servicio, nombre_servicio,
                    modalidad_servicio, descripcion,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_servicio_catalogo, NEW.id_tipo_servicio, NEW.nombre_servicio,
                    NEW.modalidad_servicio, NEW.descripcion,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_servicios_catalogo_audit_update
            AFTER UPDATE ON servicios_catalogo
            FOR EACH ROW
            BEGIN
                INSERT INTO servicios_catalogo_auditoria (
                    id_servicio_catalogo, id_tipo_servicio, nombre_servicio,
                    modalidad_servicio, descripcion,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_servicio_catalogo, OLD.id_tipo_servicio, OLD.nombre_servicio,
                    OLD.modalidad_servicio, OLD.descripcion,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_servicios_catalogo_audit_delete
            BEFORE DELETE ON servicios_catalogo
            FOR EACH ROW
            BEGIN
                INSERT INTO servicios_catalogo_auditoria (
                    id_servicio_catalogo, id_tipo_servicio, nombre_servicio,
                    modalidad_servicio, descripcion,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_servicio_catalogo, OLD.id_tipo_servicio, OLD.nombre_servicio,
                    OLD.modalidad_servicio, OLD.descripcion,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 16. AGENCIAS SERVICIOS PRECIOS (NUEVA TABLA v4.0)
    private function createAgenciasServiciosPreciosAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_agencias_servicios_precios_audit_insert
            AFTER INSERT ON agencias_servicios_precios
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_servicios_precios_auditoria (
                    id_precio, id_agencias, id_servicio_catalogo,
                    precio_adulto, precio_nino, descuento_porcentaje, activo,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_precio, NEW.id_agencias, NEW.id_servicio_catalogo,
                    NEW.precio_adulto, NEW.precio_nino, NEW.descuento_porcentaje, NEW.activo,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_agencias_servicios_precios_audit_update
            AFTER UPDATE ON agencias_servicios_precios
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_servicios_precios_auditoria (
                    id_precio, id_agencias, id_servicio_catalogo,
                    precio_adulto, precio_nino, descuento_porcentaje, activo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_precio, OLD.id_agencias, OLD.id_servicio_catalogo,
                    OLD.precio_adulto, OLD.precio_nino, OLD.descuento_porcentaje, OLD.activo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_agencias_servicios_precios_audit_delete
            BEFORE DELETE ON agencias_servicios_precios
            FOR EACH ROW
            BEGIN
                INSERT INTO agencias_servicios_precios_auditoria (
                    id_precio, id_agencias, id_servicio_catalogo,
                    precio_adulto, precio_nino, descuento_porcentaje, activo,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_precio, OLD.id_agencias, OLD.id_servicio_catalogo,
                    OLD.precio_adulto, OLD.precio_nino, OLD.descuento_porcentaje, OLD.activo,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 17. VOUCHERS SISTEMA (NUEVA TABLA v4.0)
    private function createVouchersSistemaAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_vouchers_sistema_audit_insert
            AFTER INSERT ON vouchers_sistema
            FOR EACH ROW
            BEGIN
                INSERT INTO vouchers_sistema_auditoria (
                    id_voucher, codigo_voucher, id_reservas,
                    fecha_generacion, es_valido,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_voucher, NEW.codigo_voucher, NEW.id_reservas,
                    NEW.fecha_generacion, NEW.es_valido,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_vouchers_sistema_audit_update
            AFTER UPDATE ON vouchers_sistema
            FOR EACH ROW
            BEGIN
                INSERT INTO vouchers_sistema_auditoria (
                    id_voucher, codigo_voucher, id_reservas,
                    fecha_generacion, es_valido,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_voucher, OLD.codigo_voucher, OLD.id_reservas,
                    OLD.fecha_generacion, OLD.es_valido,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_vouchers_sistema_audit_delete
            BEFORE DELETE ON vouchers_sistema
            FOR EACH ROW
            BEGIN
                INSERT INTO vouchers_sistema_auditoria (
                    id_voucher, codigo_voucher, id_reservas,
                    fecha_generacion, es_valido,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_voucher, OLD.codigo_voucher, OLD.id_reservas,
                    OLD.fecha_generacion, OLD.es_valido,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 18. RESERVAS v4.0 (ESTRUCTURA NUEVA)
    private function createReservasAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_reservas_audit_insert
            AFTER INSERT ON reservas
            FOR EACH ROW
            BEGIN
                INSERT INTO reservas_auditoria (
                    id_reservas, reservas_nombres_cliente, reservas_apellidos_cliente,
                    reservas_direccion_abordaje, reservas_telefono_cliente,
                    reservas_cliente_nit, reservas_habitacion_pax,
                    reservas_transferido_por, fecha_servicio, observaciones_generales,
                    escenario_reserva, agencia_origen, id_agencia_transferida, estado_id,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_reservas, NEW.reservas_nombres_cliente, NEW.reservas_apellidos_cliente,
                    NEW.reservas_direccion_abordaje, NEW.reservas_telefono_cliente,
                    NEW.reservas_cliente_nit, NEW.reservas_habitacion_pax,
                    NEW.reservas_transferido_por, NEW.fecha_servicio, NEW.observaciones_generales,
                    NEW.escenario_reserva, NEW.agencia_origen, NEW.id_agencia_transferida, NEW.estado_id,
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
                    id_reservas, reservas_nombres_cliente, reservas_apellidos_cliente,
                    reservas_direccion_abordaje, reservas_telefono_cliente,
                    reservas_cliente_nit, reservas_habitacion_pax,
                    reservas_transferido_por, fecha_servicio, observaciones_generales,
                    escenario_reserva, agencia_origen, id_agencia_transferida, estado_id,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_reservas, OLD.reservas_nombres_cliente, OLD.reservas_apellidos_cliente,
                    OLD.reservas_direccion_abordaje, OLD.reservas_telefono_cliente,
                    OLD.reservas_cliente_nit, OLD.reservas_habitacion_pax,
                    OLD.reservas_transferido_por, OLD.fecha_servicio, OLD.observaciones_generales,
                    OLD.escenario_reserva, OLD.agencia_origen, OLD.id_agencia_transferida, OLD.estado_id,
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
                    id_reservas, reservas_nombres_cliente, reservas_apellidos_cliente,
                    reservas_direccion_abordaje, reservas_telefono_cliente,
                    reservas_cliente_nit, reservas_habitacion_pax,
                    reservas_transferido_por, fecha_servicio, observaciones_generales,
                    escenario_reserva, agencia_origen, id_agencia_transferida, estado_id,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_reservas, OLD.reservas_nombres_cliente, OLD.reservas_apellidos_cliente,
                    OLD.reservas_direccion_abordaje, OLD.reservas_telefono_cliente,
                    OLD.reservas_cliente_nit, OLD.reservas_habitacion_pax,
                    OLD.reservas_transferido_por, OLD.fecha_servicio, OLD.observaciones_generales,
                    OLD.escenario_reserva, OLD.agencia_origen, OLD.id_agencia_transferida, OLD.estado_id,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 19. RESERVAS SERVICIOS DETALLE (LA TABLA MÁS IMPORTANTE v4.0)
    private function createReservasServiciosDetalleAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_reservas_servicios_detalle_audit_insert
            AFTER INSERT ON reservas_servicios_detalle
            FOR EACH ROW
            BEGIN
                INSERT INTO reservas_servicios_detalle_auditoria (
                    id_detalle, id_reservas, id_servicio_catalogo,
                    id_ruta_activa, id_tour_activo,
                    cantidad_adultos, cantidad_ninos,
                    precio_unitario_adulto, precio_unitario_nino, descuento_aplicado,
                    agencia_operadora, monto_cobrar_conductor, estado_pago,
                    precio_venta_cliente, precio_compra_agencia, comision_monto, comision_porcentaje,
                    segmento_orden, punto_origen, punto_destino, es_conexion,
                    observaciones, orden_servicio,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_detalle, NEW.id_reservas, NEW.id_servicio_catalogo,
                    NEW.id_ruta_activa, NEW.id_tour_activo,
                    NEW.cantidad_adultos, NEW.cantidad_ninos,
                    NEW.precio_unitario_adulto, NEW.precio_unitario_nino, NEW.descuento_aplicado,
                    NEW.agencia_operadora, NEW.monto_cobrar_conductor, NEW.estado_pago,
                    NEW.precio_venta_cliente, NEW.precio_compra_agencia, NEW.comision_monto, NEW.comision_porcentaje,
                    NEW.segmento_orden, NEW.punto_origen, NEW.punto_destino, NEW.es_conexion,
                    NEW.observaciones, NEW.orden_servicio,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_reservas_servicios_detalle_audit_update
            AFTER UPDATE ON reservas_servicios_detalle
            FOR EACH ROW
            BEGIN
                INSERT INTO reservas_servicios_detalle_auditoria (
                    id_detalle, id_reservas, id_servicio_catalogo,
                    id_ruta_activa, id_tour_activo,
                    cantidad_adultos, cantidad_ninos,
                    precio_unitario_adulto, precio_unitario_nino, descuento_aplicado,
                    agencia_operadora, monto_cobrar_conductor, estado_pago,
                    precio_venta_cliente, precio_compra_agencia, comision_monto, comision_porcentaje,
                    segmento_orden, punto_origen, punto_destino, es_conexion,
                    observaciones, orden_servicio,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_detalle, OLD.id_reservas, OLD.id_servicio_catalogo,
                    OLD.id_ruta_activa, OLD.id_tour_activo,
                    OLD.cantidad_adultos, OLD.cantidad_ninos,
                    OLD.precio_unitario_adulto, OLD.precio_unitario_nino, OLD.descuento_aplicado,
                    OLD.agencia_operadora, OLD.monto_cobrar_conductor, OLD.estado_pago,
                    OLD.precio_venta_cliente, OLD.precio_compra_agencia, OLD.comision_monto, OLD.comision_porcentaje,
                    OLD.segmento_orden, OLD.punto_origen, OLD.punto_destino, OLD.es_conexion,
                    OLD.observaciones, OLD.orden_servicio,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                    );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_reservas_servicios_detalle_audit_delete
            BEFORE DELETE ON reservas_servicios_detalle
            FOR EACH ROW
            BEGIN
                INSERT INTO reservas_servicios_detalle_auditoria (
                    id_detalle, id_reservas, id_servicio_catalogo,
                    id_ruta_activa, id_tour_activo,
                    cantidad_adultos, cantidad_ninos,
                    precio_unitario_adulto, precio_unitario_nino, descuento_aplicado,
                    agencia_operadora, monto_cobrar_conductor, estado_pago,
                    precio_venta_cliente, precio_compra_agencia, comision_monto, comision_porcentaje,
                    segmento_orden, punto_origen, punto_destino, es_conexion,
                    observaciones, orden_servicio,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_detalle, OLD.id_reservas, OLD.id_servicio_catalogo,
                    OLD.id_ruta_activa, OLD.id_tour_activo,
                    OLD.cantidad_adultos, OLD.cantidad_ninos,
                    OLD.precio_unitario_adulto, OLD.precio_unitario_nino, OLD.descuento_aplicado,
                    OLD.agencia_operadora, OLD.monto_cobrar_conductor, OLD.estado_pago,
                    OLD.precio_venta_cliente, OLD.precio_compra_agencia, OLD.comision_monto, OLD.comision_porcentaje,
                    OLD.segmento_orden, OLD.punto_origen, OLD.punto_destino, OLD.es_conexion,
                    OLD.observaciones, OLD.orden_servicio,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 20. DATOS RESERVAS CLIENTES
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

    // 21. EGRESOS RUTA ACTIVA
    private function createEgresosRutaActivaAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_egresos_ruta_activa_audit_insert
            AFTER INSERT ON egresos_ruta_activa
            FOR EACH ROW
            BEGIN
                INSERT INTO egresos_ruta_activa_auditoria (
                    id_egresos_ruta_activa, motivo_egreso, cantidad_egreso,
                    descripcion_egreso, id_ruta_activa,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_egresos_ruta_activa, NEW.motivo_egreso, NEW.cantidad_egreso,
                    NEW.descripcion_egreso, NEW.id_ruta_activa,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_egresos_ruta_activa_audit_update
            AFTER UPDATE ON egresos_ruta_activa
            FOR EACH ROW
            BEGIN
                INSERT INTO egresos_ruta_activa_auditoria (
                    id_egresos_ruta_activa, motivo_egreso, cantidad_egreso,
                    descripcion_egreso, id_ruta_activa,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_egresos_ruta_activa, OLD.motivo_egreso, OLD.cantidad_egreso,
                    OLD.descripcion_egreso, OLD.id_ruta_activa,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_egresos_ruta_activa_audit_delete
            BEFORE DELETE ON egresos_ruta_activa
            FOR EACH ROW
            BEGIN
                INSERT INTO egresos_ruta_activa_auditoria (
                    id_egresos_ruta_activa, motivo_egreso, cantidad_egreso,
                    descripcion_egreso, id_ruta_activa,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_egresos_ruta_activa, OLD.motivo_egreso, OLD.cantidad_egreso,
                    OLD.descripcion_egreso, OLD.id_ruta_activa,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 22. CAJA
    private function createCajaAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_caja_audit_insert
            AFTER INSERT ON caja
            FOR EACH ROW
            BEGIN
                INSERT INTO caja_auditoria (
                    id_caja, numero_voucher, origen, destino, fecha_servicio,
                    pax_adultos, pax_ninos, total_pax, precio_unitario, precio_total,
                    direccion, servicio_cobrar_pax, servicio_precio_descuento,
                    voucher_caja, enlace_sat, id_reservas, estado_id,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_caja, NEW.numero_voucher, NEW.origen, NEW.destino, NEW.fecha_servicio,
                    NEW.pax_adultos, NEW.pax_ninos, NEW.total_pax, NEW.precio_unitario, NEW.precio_total,
                    NEW.direccion, NEW.servicio_cobrar_pax, NEW.servicio_precio_descuento,
                    NEW.voucher_caja, NEW.enlace_sat, NEW.id_reservas, NEW.estado_id,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_caja_audit_update
            AFTER UPDATE ON caja
            FOR EACH ROW
            BEGIN
                INSERT INTO caja_auditoria (
                    id_caja, numero_voucher, origen, destino, fecha_servicio,
                    pax_adultos, pax_ninos, total_pax, precio_unitario, precio_total,
                    direccion, servicio_cobrar_pax, servicio_precio_descuento,
                    voucher_caja, enlace_sat, id_reservas, estado_id,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_caja, OLD.numero_voucher, OLD.origen, OLD.destino, OLD.fecha_servicio,
                    OLD.pax_adultos, OLD.pax_ninos, OLD.total_pax, OLD.precio_unitario, OLD.precio_total,
                    OLD.direccion, OLD.servicio_cobrar_pax, OLD.servicio_precio_descuento,
                    OLD.voucher_caja, OLD.enlace_sat, OLD.id_reservas, OLD.estado_id,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_caja_audit_delete
            BEFORE DELETE ON caja
            FOR EACH ROW
            BEGIN
                INSERT INTO caja_auditoria (
                    id_caja, numero_voucher, origen, destino, fecha_servicio,
                    pax_adultos, pax_ninos, total_pax, precio_unitario, precio_total,
                    direccion, servicio_cobrar_pax, servicio_precio_descuento,
                    voucher_caja, enlace_sat, id_reservas, estado_id,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_caja, OLD.numero_voucher, OLD.origen, OLD.destino, OLD.fecha_servicio,
                    OLD.pax_adultos, OLD.pax_ninos, OLD.total_pax, OLD.precio_unitario, OLD.precio_total,
                    OLD.direccion, OLD.servicio_cobrar_pax, OLD.servicio_precio_descuento,
                    OLD.voucher_caja, OLD.enlace_sat, OLD.id_reservas, OLD.estado_id,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'DELETE', IFNULL(OLD.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");
    }

    // 23. FACTURAS SAT
    private function createFacturasSatAuditTriggers()
    {
        // INSERT
        DB::unprepared("
            CREATE TRIGGER tr_facturas_sat_audit_insert
            AFTER INSERT ON facturas_sat
            FOR EACH ROW
            BEGIN
                INSERT INTO facturas_sat_auditoria (
                    id_facturas_sat, numero_documento, gran_total, serie,
                    numero_uuid, fecha_emision, nit_receptor, nombre_receptor,
                    enlace_consulta, datos_completos, id_caja,
                    original_created_at, original_updated_at, original_created_by,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    NEW.id_facturas_sat, NEW.numero_documento, NEW.gran_total, NEW.serie,
                    NEW.numero_uuid, NEW.fecha_emision, NEW.nit_receptor, NEW.nombre_receptor,
                    NEW.enlace_consulta, NEW.datos_completos, NEW.id_caja,
                    NEW.created_at, NEW.updated_at, NEW.created_by,
                    'INSERT', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_facturas_sat_audit_update
            AFTER UPDATE ON facturas_sat
            FOR EACH ROW
            BEGIN
                INSERT INTO facturas_sat_auditoria (
                    id_facturas_sat, numero_documento, gran_total, serie,
                    numero_uuid, fecha_emision, nit_receptor, nombre_receptor,
                    enlace_consulta, datos_completos, id_caja,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_facturas_sat, OLD.numero_documento, OLD.gran_total, OLD.serie,
                    OLD.numero_uuid, OLD.fecha_emision, OLD.nit_receptor, OLD.nombre_receptor,
                    OLD.enlace_consulta, OLD.datos_completos, OLD.id_caja,
                    OLD.created_at, OLD.updated_at, OLD.created_by,
                    OLD.deleted_at,
                    'UPDATE', IFNULL(NEW.created_by, 1), NOW(),
                    IFNULL(@audit_ip, SUBSTRING_INDEX(USER(), '@', -1))
                );
            END
        ");

        // DELETE
        DB::unprepared("
            CREATE TRIGGER tr_facturas_sat_audit_delete
            BEFORE DELETE ON facturas_sat
            FOR EACH ROW
            BEGIN
                INSERT INTO facturas_sat_auditoria (
                    id_facturas_sat, numero_documento, gran_total, serie,
                    numero_uuid, fecha_emision, nit_receptor, nombre_receptor,
                    enlace_consulta, datos_completos, id_caja,
                    original_created_at, original_updated_at, original_created_by,
                    original_deleted_at,
                    accion, usuario_modificacion, fecha_modificacion, ip_modificacion
                ) VALUES (
                    OLD.id_facturas_sat, OLD.numero_documento, OLD.gran_total, OLD.serie,
                    OLD.numero_uuid, OLD.fecha_emision, OLD.nit_receptor, OLD.nombre_receptor,
                    OLD.enlace_consulta, OLD.datos_completos, OLD.id_caja,
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
        // Eliminar triggers de NUEVAS TABLAS (orden inverso)
        DB::unprepared('DROP TRIGGER IF EXISTS tr_facturas_sat_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_facturas_sat_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_facturas_sat_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_caja_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_caja_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_caja_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_egresos_ruta_activa_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_egresos_ruta_activa_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_egresos_ruta_activa_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_datos_clientes_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_datos_clientes_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_datos_clientes_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_servicios_detalle_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_servicios_detalle_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_servicios_detalle_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_reservas_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_vouchers_sistema_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_vouchers_sistema_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_vouchers_sistema_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_servicios_precios_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_servicios_precios_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_servicios_precios_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicios_catalogo_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicios_catalogo_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_servicios_catalogo_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_tipos_servicio_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tipos_servicio_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tipos_servicio_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_tour_activo_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tour_activo_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tour_activo_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_ruta_activa_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_ruta_activa_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_ruta_activa_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_permisos_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_permisos_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_permisos_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_usuarios_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_empleados_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_empleados_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_empleados_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_vehiculo_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_vehiculo_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_vehiculo_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_tours_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_tours_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_rutas_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_rutas_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_tours_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tours_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_tours_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_rutas_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_rutas_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_rutas_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_cargo_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_cargo_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_cargo_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_estado_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_estado_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_estado_audit_insert');

        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_audit_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_audit_update');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_agencias_audit_insert');
    }
};
