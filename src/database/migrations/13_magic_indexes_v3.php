<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN ÍNDICES MAGIC TRAVEL v4.0 - ESTRUCTURA MODULAR CORREGIDA
     * Índices optimizados para la nueva estructura v4.0
     * Adaptados a nombres de tabla y campos actuales
     * CON SOPORTE COMPLETO PARA SISTEMA MODULAR DE SERVICIOS
     * CORREGIDO: Eliminados índices de tablas/campos que ya no existen
     * AGREGADO: Índices para nuevas tablas v4.0 (tipos_servicio, servicios_catalogo, etc.)
     */
    public function up()
    {
        $this->createOptimizedIndexes();
    }

    /**
     * Crear índices optimizados según estructura v4.0 completa
     */
    private function createOptimizedIndexes()
    {
        // =====================================================
        // ÍNDICES PARA NUEVAS TABLAS PIVOTE
        // =====================================================
        DB::statement('CREATE INDEX idx_agencias_rutas_agencia ON agencias_rutas(id_agencias)');
        DB::statement('CREATE INDEX idx_agencias_rutas_ruta ON agencias_rutas(id_rutas)');
        DB::statement('CREATE INDEX idx_agencias_rutas_completo ON agencias_rutas(id_agencias, id_rutas)');

        DB::statement('CREATE INDEX idx_agencias_tours_agencia ON agencias_tours(id_agencias)');
        DB::statement('CREATE INDEX idx_agencias_tours_tour ON agencias_tours(id_tours)');
        DB::statement('CREATE INDEX idx_agencias_tours_completo ON agencias_tours(id_agencias, id_tours)');

        // =====================================================
        // ÍNDICES PARA NUEVAS TABLAS v4.0 - SISTEMA MODULAR
        // =====================================================

        // Índices para tipos_servicio
        DB::statement('CREATE INDEX idx_tipos_servicio_nombre ON tipos_servicio(nombre_tipo, deleted_at)');
        DB::statement('CREATE INDEX idx_tipos_servicio_deleted ON tipos_servicio(deleted_at)');
        DB::statement('CREATE INDEX idx_tipos_servicio_timestamps ON tipos_servicio(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_tipos_servicio_created_by ON tipos_servicio(created_by)');

        // Índices para servicios_catalogo
        DB::statement('CREATE INDEX idx_servicios_catalogo_tipo ON servicios_catalogo(id_tipo_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_servicios_catalogo_nombre ON servicios_catalogo(nombre_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_servicios_catalogo_modalidad ON servicios_catalogo(modalidad_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_servicios_catalogo_deleted ON servicios_catalogo(deleted_at)');
        DB::statement('CREATE INDEX idx_servicios_catalogo_timestamps ON servicios_catalogo(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_servicios_catalogo_created_by ON servicios_catalogo(created_by)');

        // Índices para agencias_servicios_precios
        DB::statement('CREATE INDEX idx_agencias_servicios_precios_agencia ON agencias_servicios_precios(id_agencias, deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_servicios_precios_servicio ON agencias_servicios_precios(id_servicio_catalogo, deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_servicios_precios_activo ON agencias_servicios_precios(activo, deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_servicios_precios_precios ON agencias_servicios_precios(precio_adulto, precio_nino, deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_servicios_precios_deleted ON agencias_servicios_precios(deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_servicios_precios_timestamps ON agencias_servicios_precios(created_at, updated_at)');

        // Índices para vouchers_sistema
        DB::statement('CREATE INDEX idx_vouchers_sistema_codigo ON vouchers_sistema(codigo_voucher, deleted_at)');
        DB::statement('CREATE INDEX idx_vouchers_sistema_reserva ON vouchers_sistema(id_reservas, deleted_at)');
        DB::statement('CREATE INDEX idx_vouchers_sistema_valido ON vouchers_sistema(es_valido, deleted_at)');
        DB::statement('CREATE INDEX idx_vouchers_sistema_fecha ON vouchers_sistema(fecha_generacion, deleted_at)');
        DB::statement('CREATE INDEX idx_vouchers_sistema_deleted ON vouchers_sistema(deleted_at)');

        // Índices para reservas_servicios_detalle (LA TABLA MÁS IMPORTANTE)
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_reserva ON reservas_servicios_detalle(id_reservas, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_catalogo ON reservas_servicios_detalle(id_servicio_catalogo, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_ruta ON reservas_servicios_detalle(id_ruta_activa, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_tour ON reservas_servicios_detalle(id_tour_activo, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_operadora ON reservas_servicios_detalle(agencia_operadora, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_estado_pago ON reservas_servicios_detalle(estado_pago, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_precios ON reservas_servicios_detalle(precio_venta_cliente, precio_compra_agencia, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_comision ON reservas_servicios_detalle(comision_monto, comision_porcentaje, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_segmento ON reservas_servicios_detalle(segmento_orden, es_conexion, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_orden ON reservas_servicios_detalle(orden_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_cantidades ON reservas_servicios_detalle(cantidad_adultos, cantidad_ninos, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_deleted ON reservas_servicios_detalle(deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_servicios_detalle_timestamps ON reservas_servicios_detalle(created_at, updated_at)');

        // =====================================================
        // ÍNDICES DE REPORTES Y DASHBOARD v4.0
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_fecha_creacion ON reservas(created_at, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_ocupacion ON ruta_activa(ruta_activa_fecha, estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_ocupacion ON tour_activo(tour_activo_fecha, estado_id, deleted_at)');

        // =====================================================
        // ÍNDICES DE PERFORMANCE PARA JOINS
        // =====================================================
        DB::statement('CREATE INDEX idx_usuarios_empleados ON usuarios(id_empleados, deleted_at)');
        DB::statement('CREATE INDEX idx_empleados_agencia ON empleados(id_agencias, deleted_at)');
        DB::statement('CREATE INDEX idx_empleados_cargo ON empleados(id_cargo, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_vehiculo ON ruta_activa(id_vehiculo, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_rutas ON ruta_activa(id_rutas, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activo_tours ON tour_activo(id_tours, deleted_at)');

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
        // ÍNDICES DE BÚSQUEDA Y FILTRADO v4.0
        // =====================================================

        // Reservas v4.0
        DB::statement('CREATE INDEX idx_reservas_cliente ON reservas(reservas_nombres_cliente, reservas_apellidos_cliente, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_telefono ON reservas(reservas_telefono_cliente, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_nit ON reservas(reservas_cliente_nit, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_fecha_servicio ON reservas(fecha_servicio, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_escenario ON reservas(escenario_reserva, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_agencia_origen ON reservas(agencia_origen, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_agencia_transferida ON reservas(id_agencia_transferida, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_estado ON reservas(estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_transferido_por ON reservas(reservas_transferido_por, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_escenario_fecha ON reservas(escenario_reserva, fecha_servicio, deleted_at)');

        // Empleados
        DB::statement('CREATE INDEX idx_empleados_nombres ON empleados(empleados_nombres, empleados_apellidos, deleted_at)');
        DB::statement('CREATE INDEX idx_empleados_dpi ON empleados(empleados_dpi)');

        // Vehículos
        DB::statement('CREATE INDEX idx_vehiculo_placa ON vehiculo(vehiculo_placa, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_marca ON vehiculo(vehiculo_marca, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_capacidad ON vehiculo(vehiculo_capacidad, deleted_at)');
        DB::statement('CREATE INDEX idx_vehiculo_pago_conductor ON vehiculo(vehiculo_pago_conductor, deleted_at)');

        // Rutas y Tours
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
        // ÍNDICES COMPUESTOS PARA REPORTES AVANZADOS v4.0
        // =====================================================
        DB::statement('CREATE INDEX idx_ruta_vehiculo_fecha ON ruta_activa(id_vehiculo, ruta_activa_fecha, deleted_at)');
        DB::statement('CREATE INDEX idx_tour_fecha_tipo ON tour_activo(tour_activo_fecha, tour_activo_tipo, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_transferencias ON reservas(id_agencia_transferida, created_at, deleted_at)');

        // =====================================================
        // ÍNDICES PARA OPTIMIZAR VISTAS DEL MÓDULO VENTAS
        // =====================================================
        DB::statement('CREATE INDEX idx_caja_ventas_fecha ON caja(fecha_servicio, estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_caja_ventas_ingresos ON caja(servicio_cobrar_pax, servicio_precio_descuento, deleted_at)');
        DB::statement('CREATE INDEX idx_reservas_ventas_estado ON reservas(estado_id, id_agencia_transferida, deleted_at)');
        DB::statement('CREATE INDEX idx_egresos_liquidacion ON egresos_ruta_activa(id_ruta_activa, cantidad_egreso, deleted_at)');

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
        DB::statement('CREATE INDEX idx_usuarios_ultima_sesion ON usuarios(ultima_sesion, deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activa_timestamps ON ruta_activa(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_tour_activo_timestamps ON tour_activo(created_at, updated_at)');
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
        DB::statement('CREATE INDEX idx_reservas_created_by ON reservas(created_by)');
        DB::statement('CREATE INDEX idx_datos_clientes_created_by ON datos_reservas_clientes(created_by)');

        // =====================================================
        // ÍNDICES PARA OPTIMIZAR VISTAS ESPECÍFICAS v4.0
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_activas ON reservas(deleted_at, created_at)');
        DB::statement('CREATE INDEX idx_vehiculo_ruta_capacidad ON vehiculo(id_vehiculo, vehiculo_capacidad, vehiculo_pago_conductor, deleted_at)');

        // =====================================================
        // ÍNDICES ESPECIALES PARA ESCENARIOS DE TRANSFERENCIA v4.0
        // =====================================================
        DB::statement('CREATE INDEX idx_reservas_escenarios ON reservas(id_agencia_transferida, estado_id, deleted_at)');
        DB::statement('CREATE INDEX idx_agencias_magic_travel ON agencias(agencias_nombre, deleted_at)');

        // =====================================================
        // ÍNDICES ESPECIALES PARA CONSULTAS N:N
        // =====================================================
        DB::statement('CREATE INDEX idx_agencias_rutas_busqueda ON agencias_rutas(id_rutas, id_agencias)');
        DB::statement('CREATE INDEX idx_agencias_tours_busqueda ON agencias_tours(id_tours, id_agencias)');
    }

    /**
     * Rollback - Eliminar índices en orden inverso
     */
    public function down()
    {
        // Índices especiales para consultas N:N
        DB::statement('DROP INDEX IF EXISTS idx_agencias_tours_busqueda ON agencias_tours');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_rutas_busqueda ON agencias_rutas');

        // Índices especiales para escenarios de transferencia
        DB::statement('DROP INDEX IF EXISTS idx_agencias_magic_travel ON agencias');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_escenarios ON reservas');

        // Índices para optimizar vistas
        DB::statement('DROP INDEX IF EXISTS idx_vehiculo_ruta_capacidad ON vehiculo');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_activas ON reservas');

        // Índices de created_by - tablas existentes
        DB::statement('DROP INDEX IF EXISTS idx_datos_clientes_created_by ON datos_reservas_clientes');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_created_by ON reservas');
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
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_timestamps ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_timestamps ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_ultima_sesion ON usuarios');
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

        // Índices para módulo ventas
        DB::statement('DROP INDEX IF EXISTS idx_egresos_liquidacion ON egresos_ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_ventas_estado ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_caja_ventas_ingresos ON caja');
        DB::statement('DROP INDEX IF EXISTS idx_caja_ventas_fecha ON caja');

        // Índices compuestos
        DB::statement('DROP INDEX IF EXISTS idx_reservas_transferencias ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_tour_fecha_tipo ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_vehiculo_fecha ON ruta_activa');

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
        DB::statement('DROP INDEX IF EXISTS idx_reservas_escenario_fecha ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_transferido_por ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_estado ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_agencia_transferida ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_agencia_origen ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_escenario ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_fecha_servicio ON reservas');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_nit ON reservas');
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
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_tours ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_rutas ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_vehiculo ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_cargo ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_empleados_agencia ON empleados');
        DB::statement('DROP INDEX IF EXISTS idx_usuarios_empleados ON usuarios');

        // Índices de reportes
        DB::statement('DROP INDEX IF EXISTS idx_tour_activo_ocupacion ON tour_activo');
        DB::statement('DROP INDEX IF EXISTS idx_ruta_activa_ocupacion ON ruta_activa');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_fecha_creacion ON reservas');

        // Índices para tablas pivote
        DB::statement('DROP INDEX IF EXISTS idx_agencias_tours_completo ON agencias_tours');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_tours_tour ON agencias_tours');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_tours_agencia ON agencias_tours');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_rutas_completo ON agencias_rutas');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_rutas_ruta ON agencias_rutas');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_rutas_agencia ON agencias_rutas');

        // Eliminar índices v4.0 - nuevas tablas
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_timestamps ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_deleted ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_cantidades ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_orden ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_segmento ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_comision ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_precios ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_estado_pago ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_operadora ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_tour ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_ruta ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_catalogo ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_reservas_servicios_detalle_reserva ON reservas_servicios_detalle');
        DB::statement('DROP INDEX IF EXISTS idx_vouchers_sistema_deleted ON vouchers_sistema');
        DB::statement('DROP INDEX IF EXISTS idx_vouchers_sistema_fecha ON vouchers_sistema');
        DB::statement('DROP INDEX IF EXISTS idx_vouchers_sistema_valido ON vouchers_sistema');
        DB::statement('DROP INDEX IF EXISTS idx_vouchers_sistema_reserva ON vouchers_sistema');
        DB::statement('DROP INDEX IF EXISTS idx_vouchers_sistema_codigo ON vouchers_sistema');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_servicios_precios_timestamps ON agencias_servicios_precios');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_servicios_precios_deleted ON agencias_servicios_precios');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_servicios_precios_precios ON agencias_servicios_precios');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_servicios_precios_activo ON agencias_servicios_precios');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_servicios_precios_servicio ON agencias_servicios_precios');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_servicios_precios_agencia ON agencias_servicios_precios');
        DB::statement('DROP INDEX IF EXISTS idx_servicios_catalogo_created_by ON servicios_catalogo');
        DB::statement('DROP INDEX IF EXISTS idx_servicios_catalogo_timestamps ON servicios_catalogo');
        DB::statement('DROP INDEX IF EXISTS idx_servicios_catalogo_deleted ON servicios_catalogo');
        DB::statement('DROP INDEX IF EXISTS idx_servicios_catalogo_modalidad ON servicios_catalogo');
        DB::statement('DROP INDEX IF EXISTS idx_servicios_catalogo_nombre ON servicios_catalogo');
        DB::statement('DROP INDEX IF EXISTS idx_servicios_catalogo_tipo ON servicios_catalogo');
        DB::statement('DROP INDEX IF EXISTS idx_tipos_servicio_created_by ON tipos_servicio');
        DB::statement('DROP INDEX IF EXISTS idx_tipos_servicio_timestamps ON tipos_servicio');
        DB::statement('DROP INDEX IF EXISTS idx_tipos_servicio_deleted ON tipos_servicio');
        DB::statement('DROP INDEX IF EXISTS idx_tipos_servicio_nombre ON tipos_servicio');
    }
};
