<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN ÍNDICES MAGIC TRAVEL v3.0 - CON NUEVAS TABLAS Y MÓDULOS
     * Índices optimizados para la nueva estructura v3
     * Adaptados a nombres de tabla y campos actuales
     * CON SOPORTE COMPLETO PARA TOURS, RUTAS, VENTAS Y CONTABILIDAD
     * AGREGADO: Índices para tablas nuevas (caja, egresos_ruta_activa, facturas_sat, usuarios_permisos)
     * ELIMINADOS: todos los campos *_situacion (soft delete hace este trabajo)
     */
    public function up()
    {
        $this->createOptimizedIndexes();
    }

    /**
     * Crear índices optimizados según estructura v3 completa
     */
    private function createOptimizedIndexes()
    {
        // =====================================================
        // ÍNDICES DE REPORTES Y DASHBOARD
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_ingresos ON reservas(created_at, deleted_at, reservas_cobrar_a_pax)');
        DB::statement('CREATE INDEX idx_reservas_fecha_creacion ON reservas(created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_fecha_ruta ON reservas(id_ruta_activa, created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_fecha_tour ON reservas(id_tour_activo, created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_ocupacion ON ruta_activa(ruta_activa_fecha, estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_ocupacion ON tour_activo(tour_activo_fecha, estado_id, deleted_at)');

        // =====================================================
        // ÍNDICES DE PERFORMANCE PARA JOINS
        // =====================================================
        DB::statement('CREATE INDEX idx_usuarios_empleados ON usuarios(id_empleados, deleted_at)');
        DB::statement('CREATE INDEX idx_empleados_agencia ON empleados(id_agencias, deleted_at)');
        DB::statement('CREATE INDEX idx_empleados_cargo ON empleados(id_cargo, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_ruta_join ON reservas(id_ruta_activa, deleted_at, estado_id)');
        DB::statement('CREATE INDEX idx_reservas_tour_join ON reservas(id_tour_activo, deleted_at, estado_id)');
        DB::statement('CREATE INDEX idx_reservas_servicio_join ON reservas(id_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_vehiculo ON ruta_activa(id_vehiculo, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_rutas ON ruta_activa(id_rutas, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_tours ON tour_activo(id_tour, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_ruta_activa ON servicio(id_ruta_activa, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_tour_activo ON servicio(id_tour_activo, deleted_at)');

        // =====================================================
        // ÍNDICES PARA NUEVAS TABLAS - MÓDULO VENTAS
        // =====================================================
        DB::statement('CREATE INDEX idx_caja_fecha_servicio ON caja(fecha_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_reserva ON caja(id_reservas, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_estado ON caja(estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_voucher ON caja(voucher_caja, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_ingresos ON caja(servicio_cobrar_pax, created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_origen_destino ON caja(origen, destino, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_pax ON caja(total_pax, fecha_servicio, deleted_at)');

        // =====================================================
        // ÍNDICES PARA EGRESOS RUTA ACTIVA
        // =====================================================
        DB::statement('CREATE INDEX idx_egresos_ruta ON egresos_ruta_activa(id_ruta_activa, deleted_at)');
        DB::statement('CREATE INDEX idx_egresos_cantidad ON egresos_ruta_activa(cantidad_egreso, created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_egresos_motivo ON egresos_ruta_activa(motivo_egreso(191), deleted_at)');
        DB::statement('CREATE INDEX idx_egresos_fecha ON egresos_ruta_activa(created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_egresos_created_by ON egresos_ruta_activa(created_by, deleted_at)');

        // =====================================================
        // ÍNDICES PARA FACTURAS SAT
        // =====================================================
        DB::statement('CREATE INDEX idx_facturas_sat_caja ON facturas_sat(id_caja, deleted_at)');
        DB::statement('CREATE INDEX idx_facturas_sat_numero ON facturas_sat(numero_documento, deleted_at)');
        DB::statement('CREATE INDEX idx_facturas_sat_fecha ON facturas_sat(fecha_emision, deleted_at)');
        DB::statement('CREATE INDEX idx_facturas_sat_total ON facturas_sat(gran_total, created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_facturas_sat_nit ON facturas_sat(nit_receptor, deleted_at)');

        // =====================================================
        // ÍNDICES PARA USUARIOS PERMISOS
        // =====================================================
        DB::statement('CREATE INDEX idx_usuarios_permisos_usuario ON usuarios_permisos(id_usuarios, deleted_at)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_modulo ON usuarios_permisos(modulo, deleted_at)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_ver ON usuarios_permisos(puede_ver, modulo, deleted_at)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_crear ON usuarios_permisos(puede_crear, modulo, deleted_at)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_editar ON usuarios_permisos(puede_editar, modulo, deleted_at)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_eliminar ON usuarios_permisos(puede_eliminar, modulo, deleted_at)');

        // =====================================================
        // ÍNDICES DE BÚSQUEDA Y FILTRADO
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_cliente ON reservas(reservas_nombres_cliente, reservas_apellidos_cliente, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_telefono ON reservas(reservas_telefono_cliente)');
        DB::statement('CREATE INDEX idx_reservas_voucher ON reservas(reservas_voucher(191), deleted_at)'); // NUEVO CAMPO
        DB::statement('CREATE INDEX idx_empleados_nombres ON empleados(empleados_nombres, empleados_apellidos, deleted_at)');
        DB::statement('CREATE INDEX idx_empleados_dpi ON empleados(empleados_dpi)');
        DB::statement('CREATE INDEX idx_vehiculo_placa ON vehiculo(vehiculo_placa, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_marca ON vehiculo(vehiculo_marca, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_capacidad ON vehiculo(vehiculo_capacidad, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_pago_conductor ON vehiculo(vehiculo_pago_conductor, deleted_at)'); // NUEVO CAMPO
        DB::statement('CREATE INDEX idx_rutas_origen_destino ON rutas(rutas_origen, rutas_destino, deleted_at)');
        DB::statement('CREATE INDEX idx_tours_nombre ON tours(tours_nombre, deleted_at)');

        // =====================================================
        // ÍNDICES PARA ESTADOS Y RELACIONES FK
        // =====================================================
        DB::statement('CREATE INDEX idx_estado_nombre ON estado(estado_nombre, deleted_at)');
        DB::statement('CREATE INDEX idx_cargo_nombre ON cargo(cargo_nombre, deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_nombre ON agencias(agencias_nombre, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_estado ON vehiculo(estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_agencia ON vehiculo(id_agencias, deleted_at)');
        DB::statement('CREATE INDEX idx_rutas_agencia ON rutas(id_agencias, deleted_at)');
        DB::statement('CREATE INDEX idx_tours_agencia ON tours(id_agencias, deleted_at)');

        // =====================================================
        // ÍNDICES ESPECÍFICOS PARA RUTA ACTIVA
        // =====================================================
        DB::statement('CREATE INDEX idx_ruta_activa_fecha ON ruta_activa(ruta_activa_fecha, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_estado ON ruta_activa(estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_completo ON ruta_activa(deleted_at, estado_id, ruta_activa_fecha, id_vehiculo)');

        // =====================================================
        // ÍNDICES ESPECÍFICOS PARA TOUR ACTIVO
        // =====================================================
        DB::statement('CREATE INDEX idx_tour_activo_fecha ON tour_activo(tour_activo_fecha, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_tipo ON tour_activo(tour_activo_tipo, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_estado ON tour_activo(estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_completo ON tour_activo(deleted_at, estado_id, tour_activo_fecha)');

        // =====================================================
        // ÍNDICES PARA SERVICIO Y PRECIOS
        // =====================================================
        DB::statement('CREATE INDEX idx_servicio_tipo ON servicio(tipo_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_precio ON servicio(precio_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_descuento ON servicio(servicio_descuento_porcentaje, servicio_precio_descuento)');

        // =====================================================
        // ÍNDICES PARA RESERVAS Y CAPACIDAD
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_pasajeros ON reservas(reservas_cantidad_adultos, reservas_cantidad_ninos, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_monto ON reservas(reservas_cobrar_a_pax, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_transferido ON reservas(reservas_transferido_por, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_nit ON reservas(reservas_cliente_nit)');
        DB::statement('CREATE INDEX idx_reservas_agencia_transferida ON reservas(id_agencia_transferida, deleted_at)');

        // =====================================================
        // ÍNDICES COMPUESTOS PARA REPORTES AVANZADOS
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_agencia_fecha ON reservas(created_at, deleted_at, reservas_cobrar_a_pax)');
        DB::statement('CREATE INDEX idx_reservas_tipo_servicio ON reservas(id_ruta_activa, id_tour_activo, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_vehiculo_fecha ON ruta_activa(id_vehiculo, ruta_activa_fecha, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_fecha_tipo ON tour_activo(tour_activo_fecha, tour_activo_tipo, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_transferencias ON reservas(id_agencia_transferida, created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_transferidas_monto ON reservas(id_agencia_transferida, reservas_cobrar_a_pax, deleted_at)');

        // =====================================================
        // ÍNDICES PARA OPTIMIZAR VISTAS DEL MÓDULO VENTAS
        // =====================================================
        DB::statement('CREATE INDEX idx_caja_ventas_fecha ON caja(fecha_servicio, estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_ventas_ingresos ON caja(servicio_cobrar_pax, servicio_precio_descuento, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_ventas_estado ON reservas(estado_id, id_agencia_transferida, deleted_at)');
        DB::statement('CREATE INDEX idx_egresos_liquidacion ON egresos_ruta_activa(id_ruta_activa, cantidad_egreso, deleted_at)');

        // =====================================================
        // ÍNDICES PARA OPTIMIZAR VISTAS DEL MÓDULO CONTABILIDAD
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_contabilidad ON reservas(estado_id, created_at, reservas_cobrar_a_pax, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_voucher_estado ON reservas(reservas_voucher(191), estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_contabilidad ON servicio(servicio_precio_descuento, precio_servicio, deleted_at)');

        // =====================================================
        // ÍNDICES DE TIMESTAMPS Y AUDITORÍA - TABLAS NUEVAS
        // =====================================================
        DB::statement('CREATE INDEX idx_caja_timestamps ON caja(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_egresos_timestamps ON egresos_ruta_activa(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_facturas_sat_timestamps ON facturas_sat(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_timestamps ON usuarios_permisos(created_at, updated_at)');

        // =====================================================
        // ÍNDICES DE TIMESTAMPS Y AUDITORÍA - TABLAS EXISTENTES
        // =====================================================
        DB::statement('CREATE INDEX idx_agencias_timestamps ON agencias(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_estado_timestamps ON estado(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_cargo_timestamps ON cargo(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_rutas_timestamps ON rutas(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_tours_timestamps ON tours(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_vehiculo_timestamps ON vehiculo(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_empleados_timestamps ON empleados(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_usuarios_timestamps ON usuarios(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_timestamps ON ruta_activa(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_tour_activo_timestamps ON tour_activo(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_servicio_timestamps ON servicio(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_reservas_timestamps ON reservas(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_datos_clientes_timestamps ON datos_reservas_clientes(created_at, updated_at)');

        // =====================================================
        // ÍNDICES DE SOFT DELETES - TABLAS NUEVAS
        // =====================================================
        DB::statement('CREATE INDEX idx_caja_deleted ON caja(deleted_at)');
        DB::statement('CREATE INDEX idx_egresos_deleted ON egresos_ruta_activa(deleted_at)');
        DB::statement('CREATE INDEX idx_facturas_sat_deleted ON facturas_sat(deleted_at)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_deleted ON usuarios_permisos(deleted_at)');

        // =====================================================
        // ÍNDICES DE SOFT DELETES - TABLAS EXISTENTES
        // =====================================================
        DB::statement('CREATE INDEX idx_agencias_deleted ON agencias(deleted_at)');
        DB::statement('CREATE INDEX idx_estado_deleted ON estado(deleted_at)');
        DB::statement('CREATE INDEX idx_cargo_deleted ON cargo(deleted_at)');
        DB::statement('CREATE INDEX idx_rutas_deleted ON rutas(deleted_at)');
        DB::statement('CREATE INDEX idx_tours_deleted ON tours(deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_deleted ON vehiculo(deleted_at)');
        DB::statement('CREATE INDEX idx_empleados_deleted ON empleados(deleted_at)');
        DB::statement('CREATE INDEX idx_usuarios_deleted ON usuarios(deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_deleted ON ruta_activa(deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_deleted ON tour_activo(deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_deleted ON servicio(deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_deleted ON reservas(deleted_at)');
        DB::statement('CREATE INDEX idx_datos_clientes_deleted ON datos_reservas_clientes(deleted_at)');

        // =====================================================
        // ÍNDICES PARA DATOS RESERVAS CLIENTES
        // =====================================================
        DB::statement('CREATE INDEX idx_datos_clientes_reserva ON datos_reservas_clientes(id_reservas, deleted_at)');
        DB::statement('CREATE INDEX idx_datos_clientes_nombres ON datos_reservas_clientes(datos_reservas_clientes_nombres, datos_reservas_clientes_apellidos)');

        // =====================================================
        // ÍNDICES DE CREATED_BY PARA AUDITORÍA - TABLAS NUEVAS
        // =====================================================
        DB::statement('CREATE INDEX idx_caja_created_by ON caja(created_by)');
        DB::statement('CREATE INDEX idx_facturas_sat_created_by ON facturas_sat(created_by)');
        DB::statement('CREATE INDEX idx_usuarios_permisos_created_by ON usuarios_permisos(created_by)');

        // =====================================================
        // ÍNDICES DE CREATED_BY PARA AUDITORÍA - TABLAS EXISTENTES
        // =====================================================
        DB::statement('CREATE INDEX idx_agencias_created_by ON agencias(created_by)');
        DB::statement('CREATE INDEX idx_estado_created_by ON estado(created_by)');
        DB::statement('CREATE INDEX idx_cargo_created_by ON cargo(created_by)');
        DB::statement('CREATE INDEX idx_rutas_created_by ON rutas(created_by)');
        DB::statement('CREATE INDEX idx_tours_created_by ON tours(created_by)');
        DB::statement('CREATE INDEX idx_vehiculo_created_by ON vehiculo(created_by)');
        DB::statement('CREATE INDEX idx_empleados_created_by ON empleados(created_by)');
        DB::statement('CREATE INDEX idx_usuarios_created_by ON usuarios(created_by)');
        DB::statement('CREATE INDEX idx_ruta_activa_created_by ON ruta_activa(created_by)');
        DB::statement('CREATE INDEX idx_tour_activo_created_by ON tour_activo(created_by)');
        DB::statement('CREATE INDEX idx_servicio_created_by ON servicio(created_by)');
        DB::statement('CREATE INDEX idx_reservas_created_by ON reservas(created_by)');
        DB::statement('CREATE INDEX idx_datos_clientes_created_by ON datos_reservas_clientes(created_by)');

        // =====================================================
        // ÍNDICES PARA OPTIMIZAR VISTAS DE LA MIGRACIÓN 12
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_activas ON reservas(deleted_at, created_at)');
        DB::statement('CREATE INDEX idx_vehiculo_ruta_capacidad ON vehiculo(id_vehiculo, vehiculo_capacidad, vehiculo_pago_conductor, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_precios_descuento ON servicio(precio_servicio, servicio_precio_descuento, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_monto_fecha ON reservas(reservas_cobrar_a_pax, created_at, deleted_at)');

        // =====================================================
        // ÍNDICES ESPECIALES PARA ESCENARIOS DE TRANSFERENCIA
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_escenarios ON reservas(id_agencia_transferida, estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_magic_travel ON agencias(agencias_nombre, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_agencia_ruta ON servicio(id_ruta_activa, deleted_at)');
        DB::statement('CREATE INDEX idx_servicio_agencia_tour ON servicio(id_tour_activo, deleted_at)');
    }

    /**
     * Rollback - Eliminar índices en orden inverso
     */
    public function down()
    {
        // Índices especiales para escenarios de transferencia
        DB::statement('DROP INDEX IF EXISTS idx_servicio_agencia_tour ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_agencia_ruta ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_magic_travel ON agencias');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_escenarios ON reservas');

        // Índices para optimizar vistas
        DB::statement('DROP INDEX IF EXISTS idx_reservas_monto_fecha ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_precios_descuento ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_ruta_capacidad ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_activas ON reservas');

        // Índices de created_by - tablas existentes
        DB::statement('DROP INDEX IF EXISTS idx_datos_clientes_created_by ON datos_reservas_clientes');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_created_by ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_created_by ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_created_by ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_created_by ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_created_by ON usuarios');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_created_by ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_created_by ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_tours_created_by ON tours');
        DB::statement('DROP INDEX IF EXISTS idx_rutas_created_by ON rutas');
        DB::statement('DROP INDEX IF EXISTS idx_cargo_created_by ON cargo');
        DB::statement('DROP INDEX IF EXISTS idx_estado_created_by ON estado');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_created_by ON agencias');

        // Índices de created_by - tablas nuevas
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_created_by ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_created_by ON facturas_sat');
        DB::statement('DROP INDEX IF EXISTS idx_caja_created_by ON caja');

        // Índices de datos reservas clientes
        DB::statement('DROP INDEX IF EXISTS idx_datos_clientes_nombres ON datos_reservas_clientes');
        DB::statement('DROP INDEX IF EXISTS idx_datos_clientes_reserva ON datos_reservas_clientes');

        // Índices de soft deletes - tablas existentes
        DB::statement('DROP INDEX IF EXISTS idx_datos_clientes_deleted ON datos_reservas_clientes');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_deleted ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_deleted ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_deleted ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_deleted ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_deleted ON usuarios');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_deleted ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_deleted ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_tours_deleted ON tours');
        DB::statement('DROP INDEX IF EXISTS idx_rutas_deleted ON rutas');
        DB::statement('DROP INDEX IF EXISTS idx_cargo_deleted ON cargo');
        DB::statement('DROP INDEX IF EXISTS idx_estado_deleted ON estado');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_deleted ON agencias');

        // Índices de soft deletes - tablas nuevas
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_deleted ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_deleted ON facturas_sat');
        DB::statement('DROP INDEX IF EXISTS idx_egresos_deleted ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_caja_deleted ON caja');

        // Índices de timestamps - tablas existentes
        DB::statement('DROP INDEX IF EXISTS idx_datos_clientes_timestamps ON datos_reservas_clientes');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_timestamps ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_timestamps ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_timestamps ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_timestamps ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_timestamps ON usuarios');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_timestamps ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_timestamps ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_tours_timestamps ON tours');
        DB::statement('DROP INDEX IF EXISTS idx_rutas_timestamps ON rutas');
        DB::statement('DROP INDEX IF EXISTS idx_cargo_timestamps ON cargo');
        DB::statement('DROP INDEX IF EXISTS idx_estado_timestamps ON estado');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_timestamps ON agencias');

        // Índices de timestamps - tablas nuevas
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_timestamps ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_timestamps ON facturas_sat');
        DB::statement('DROP INDEX IF EXISTS idx_egresos_timestamps ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_caja_timestamps ON caja');

        // Índices para módulo contabilidad
        DB::statement('DROP INDEX IF EXISTS idx_servicio_contabilidad ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_voucher_estado ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_contabilidad ON reservas');

        // Índices para módulo ventas
        DB::statement('DROP INDEX IF EXISTS idx_egresos_liquidacion ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_ventas_estado ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_caja_ventas_ingresos ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_ventas_fecha ON caja');

        // Índices compuestos
        DB::statement('DROP INDEX IF EXISTS idx_reservas_transferidas_monto ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_transferencias ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_tour_fecha_tipo ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_vehiculo_fecha ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_tipo_servicio ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_agencia_fecha ON reservas');

        // Índices de reservas
        DB::statement('DROP INDEX IF EXISTS idx_reservas_agencia_transferida ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_nit ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_transferido ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_monto ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_pasajeros ON reservas');

        // Índices de servicio
        DB::statement('DROP INDEX IF EXISTS idx_servicio_descuento ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_precio ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_tipo ON servicio');

        // Índices de tour activo
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_completo ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_estado ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_tipo ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_fecha ON tour_activo');

        // Índices de ruta activa
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_completo ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_estado ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_fecha ON ruta_activa');

        // Índices de estados y FK
        DB::statement('DROP INDEX IF EXISTS idx_tours_agencia ON tours');
        DB::statement('DROP INDEX IF EXISTS idx_rutas_agencia ON rutas');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_agencia ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_estado ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_nombre ON agencias');
        DB::statement('DROP INDEX IF EXISTS idx_cargo_nombre ON cargo');
        DB::statement('DROP INDEX IF EXISTS idx_estado_nombre ON estado');

        // Índices de búsqueda
        DB::statement('DROP INDEX IF EXISTS idx_tours_nombre ON tours');
        DB::statement('DROP INDEX IF EXISTS idx_rutas_origen_destino ON rutas');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_pago_conductor ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_capacidad ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_marca ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_placa ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_dpi ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_nombres ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_voucher ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_telefono ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_cliente ON reservas');

        // Índices para usuarios permisos
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_eliminar ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_editar ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_crear ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_ver ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_modulo ON usuarios_permisos');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_permisos_usuario ON usuarios_permisos');

        // Índices para facturas SAT
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_nit ON facturas_sat');
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_total ON facturas_sat');
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_fecha ON facturas_sat');
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_numero ON facturas_sat');
        DB::statement('DROP INDEX IF EXISTS idx_facturas_sat_caja ON facturas_sat');

        // Índices para egresos ruta activa
        DB::statement('DROP INDEX IF EXISTS idx_egresos_created_by ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_egresos_fecha ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_egresos_motivo ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_egresos_cantidad ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_egresos_ruta ON egresos_ruta_activa');

        // Índices para caja
        DB::statement('DROP INDEX IF EXISTS idx_caja_pax ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_origen_destino ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_ingresos ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_voucher ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_estado ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_reserva ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_fecha_servicio ON caja');

        // Índices de performance
        DB::statement('DROP INDEX IF EXISTS idx_servicio_tour_activo ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_servicio_ruta_activa ON servicio');
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_tours ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_rutas ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_vehiculo ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicio_join ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_tour_join ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_ruta_join ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_cargo ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_agencia ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_empleados ON usuarios');

        // Índices de reportes
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_ocupacion ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_ocupacion ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_fecha_tour ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_fecha_ruta ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_fecha_creacion ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_ingresos ON reservas');
    }
};
