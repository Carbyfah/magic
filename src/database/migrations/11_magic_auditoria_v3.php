<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN AUDITORÍA MAGIC TRAVEL v3.0 - COMPLETA CON TODAS LAS NUEVAS TABLAS
     * Tablas de auditoría paralelas para todas las tablas del sistema
     * Orden: Nivel 1 → Nivel 2 → Nivel 3 → Nivel 4 → Nivel 5 (Nuevas)
     * ELIMINADOS: todos los campos *_situacion (soft delete hace este trabajo)
     * AGREGADO: Auditoría para usuarios_permisos, caja, egresos_ruta_activa, facturas_sat
     * CORREGIDO: Campo vehiculo_pago_conductor y reservas_voucher incluidos
     * AJUSTE: Removidas FK de agencias en rutas y tours (ahora usan tablas pivote)
     * AJUSTE: Agregado campo ultima_sesion en usuarios_auditoria
     */
    public function up()
    {
        // =====================================================
        // NIVEL 1: AUDITORÍA TABLAS INDEPENDIENTES
        // =====================================================

        // 1. Auditoría Agencias
        Schema::create('agencias_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_agencias');
            $table->string('agencias_nombre', 45);
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_agencias', 'fecha_modificacion'], 'idx_agencias_audit');
            $table->index('usuario_modificacion', 'idx_agencias_user');
        });

        // 2. Auditoría Estado
        Schema::create('estado_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('estado_id');
            $table->string('estado_nombre', 45);
            $table->string('estado_descripcion', 45)->nullable();
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['estado_id', 'fecha_modificacion'], 'idx_estado_audit');
            $table->index('usuario_modificacion', 'idx_estado_user');
        });

        // 3. Auditoría Cargo
        Schema::create('cargo_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_cargo');
            $table->string('cargo_nombre', 45)->nullable();
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_cargo', 'fecha_modificacion'], 'idx_cargo_audit');
            $table->index('usuario_modificacion', 'idx_cargo_user');
        });

        // =====================================================
        // NIVEL 2: AUDITORÍA TABLAS INTERMEDIAS
        // =====================================================

        // 4. Auditoría Agencias_Rutas (NUEVA TABLA PIVOTE)
        Schema::create('agencias_rutas_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_rutas');
            $table->enum('accion', ['INSERT', 'DELETE']); // Solo INSERT/DELETE en pivotes
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_agencias', 'id_rutas', 'fecha_modificacion'], 'idx_agencias_rutas_audit');
            $table->index('usuario_modificacion', 'idx_agencias_rutas_user');
        });

        // 5. Auditoría Agencias_Tours (NUEVA TABLA PIVOTE)
        Schema::create('agencias_tours_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_tour');
            $table->enum('accion', ['INSERT', 'DELETE']); // Solo INSERT/DELETE en pivotes
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_agencias', 'id_tour', 'fecha_modificacion'], 'idx_agencias_tours_audit');
            $table->index('usuario_modificacion', 'idx_agencias_tours_user');
        });

        // 6. Auditoría Rutas - AJUSTE: Removida FK id_agencias (ahora usa tabla pivote)
        Schema::create('rutas_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_rutas');
            $table->string('rutas_origen', 45);
            $table->string('rutas_destino', 45);
            // REMOVIDO: $table->unsignedBigInteger('id_agencias'); - Ahora usa agencias_rutas
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_rutas', 'fecha_modificacion'], 'idx_rutas_audit');
            $table->index('usuario_modificacion', 'idx_rutas_user');
        });

        // 7. Auditoría Tours - AJUSTE: Removida FK id_agencias (ahora usa tabla pivote)
        Schema::create('tours_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_tour');
            $table->string('tours_nombre', 45);
            // REMOVIDO: $table->unsignedBigInteger('id_agencias'); - Ahora usa agencias_tours
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_tour', 'fecha_modificacion'], 'idx_tours_audit');
            $table->index('usuario_modificacion', 'idx_tours_user');
        });

        // 8. Auditoría Vehículo (CORREGIDO - con vehiculo_pago_conductor)
        Schema::create('vehiculo_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_vehiculo');
            $table->string('vehiculo_marca', 45)->nullable();
            $table->string('vehiculo_placa', 45)->nullable();
            $table->integer('vehiculo_capacidad')->nullable();
            $table->decimal('vehiculo_pago_conductor', 10, 2)->nullable(); // NUEVO CAMPO AGREGADO
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_agencias');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_vehiculo', 'fecha_modificacion'], 'idx_vehiculo_audit');
            $table->index('usuario_modificacion', 'idx_vehiculo_user');
        });

        // 9. Auditoría Empleados
        Schema::create('empleados_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_empleados');
            $table->string('empleados_nombres', 45);
            $table->string('empleados_apellidos', 45);
            $table->string('empleados_dpi', 45)->nullable();
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_cargo');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_empleados', 'fecha_modificacion'], 'idx_empleados_audit');
            $table->index('usuario_modificacion', 'idx_empleados_user');
        });

        // =====================================================
        // NIVEL 3: AUDITORÍA TABLAS DEPENDIENTES
        // =====================================================

        // 10. Auditoría Usuarios - AJUSTE: Agregado campo ultima_sesion
        Schema::create('usuarios_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_usuarios');
            $table->string('usuarios_nombre', 45)->nullable();
            $table->string('usuarios_correo', 100)->nullable();
            $table->string('usuario_password', 500);
            $table->dateTime('ultima_sesion')->nullable(); // AGREGADO: Campo que faltaba
            $table->unsignedBigInteger('id_empleados');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_usuarios', 'fecha_modificacion'], 'idx_usuarios_audit');
            $table->index('usuario_modificacion', 'idx_usuarios_user');
        });

        // 11. Auditoría Usuarios Permisos (NUEVA TABLA)
        Schema::create('usuarios_permisos_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_usuarios_permisos');
            $table->unsignedBigInteger('id_usuarios');
            $table->string('modulo', 50);
            $table->boolean('puede_ver');
            $table->boolean('puede_crear');
            $table->boolean('puede_editar');
            $table->boolean('puede_eliminar');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_usuarios_permisos', 'fecha_modificacion'], 'idx_usuarios_permisos_audit');
            $table->index(['id_usuarios', 'modulo'], 'idx_usuarios_permisos_user_mod');
            $table->index('usuario_modificacion', 'idx_usuarios_permisos_user');
        });

        // 11.1 Auditoría Tipos de Servicio (NUEVA TABLA v4.0)
        Schema::create('tipos_servicio_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_tipo_servicio');
            $table->string('nombre_tipo', 50);
            $table->string('descripcion_tipo', 200)->nullable();
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_tipo_servicio', 'fecha_modificacion'], 'idx_tipos_servicio_audit');
            $table->index('usuario_modificacion', 'idx_tipos_servicio_user');
        });

        // 11.2 Auditoría Catálogo Servicios (NUEVA TABLA v4.0)
        Schema::create('servicios_catalogo_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_servicio_catalogo');
            $table->unsignedBigInteger('id_tipo_servicio');
            $table->string('nombre_servicio', 100);
            $table->enum('modalidad_servicio', ['COLECTIVO', 'PRIVADO']);
            $table->text('descripcion')->nullable();
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_servicio_catalogo', 'fecha_modificacion'], 'idx_servicios_catalogo_audit');
            $table->index('usuario_modificacion', 'idx_servicios_catalogo_user');
        });

        // 11.3 Auditoría Precios por Agencia (NUEVA TABLA v4.0)
        Schema::create('agencias_servicios_precios_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_precio');
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_servicio_catalogo');
            $table->decimal('precio_adulto', 10, 2);
            $table->decimal('precio_nino', 10, 2);
            $table->integer('descuento_porcentaje');
            $table->boolean('activo');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_precio', 'fecha_modificacion'], 'idx_agencias_servicios_precios_audit');
            $table->index('usuario_modificacion', 'idx_agencias_servicios_precios_user');
        });

        // 11.4 Auditoría Vouchers Sistema (NUEVA TABLA v4.0)
        Schema::create('vouchers_sistema_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_voucher');
            $table->string('codigo_voucher', 50);
            $table->unsignedBigInteger('id_reservas');
            $table->dateTime('fecha_generacion');
            $table->boolean('es_valido');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_voucher', 'fecha_modificacion'], 'idx_vouchers_sistema_audit');
            $table->index('usuario_modificacion', 'idx_vouchers_sistema_user');
        });

        // 11.5 Auditoría Detalle Servicios Reserva (NUEVA TABLA v4.0 - LA MÁS IMPORTANTE)
        Schema::create('reservas_servicios_detalle_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_detalle');
            $table->unsignedBigInteger('id_reservas');
            $table->unsignedBigInteger('id_servicio_catalogo');
            $table->unsignedBigInteger('id_ruta_activa')->nullable();
            $table->unsignedBigInteger('id_tour_activo')->nullable();
            $table->integer('cantidad_adultos');
            $table->integer('cantidad_ninos');
            $table->decimal('precio_unitario_adulto', 10, 2);
            $table->decimal('precio_unitario_nino', 10, 2);
            $table->integer('descuento_aplicado');
            $table->unsignedBigInteger('agencia_operadora');
            $table->decimal('monto_cobrar_conductor', 10, 2)->nullable();
            $table->enum('estado_pago', ['PENDIENTE', 'PAGADO_CAJA', 'PAGADO_CONDUCTOR', 'CONFIRMAR_RECIBIDO']);
            $table->decimal('precio_venta_cliente', 10, 2);
            $table->decimal('precio_compra_agencia', 10, 2)->nullable();
            $table->decimal('comision_monto', 10, 2);
            $table->decimal('comision_porcentaje', 5, 2);
            $table->integer('segmento_orden');
            $table->string('punto_origen', 100)->nullable();
            $table->string('punto_destino', 100)->nullable();
            $table->boolean('es_conexion');
            $table->text('observaciones')->nullable();
            $table->integer('orden_servicio');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_detalle', 'fecha_modificacion'], 'idx_reservas_servicios_detalle_audit');
            $table->index('usuario_modificacion', 'idx_reservas_servicios_detalle_user');
        });

        // 12. Auditoría Ruta Activa
        Schema::create('ruta_activa_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_ruta_activa');
            $table->dateTime('ruta_activa_fecha');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_rutas');
            $table->unsignedBigInteger('id_vehiculo');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_ruta_activa', 'fecha_modificacion'], 'idx_ruta_activa_audit');
            $table->index('usuario_modificacion', 'idx_ruta_activa_user');
        });

        // 13. Auditoría Tour Activo
        Schema::create('tour_activo_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_tour_activo');
            $table->dateTime('tour_activo_fecha');
            $table->string('tour_activo_tipo', 45);
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_tour');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_tour_activo', 'fecha_modificacion'], 'idx_tour_activo_audit');
            $table->index('usuario_modificacion', 'idx_tour_activo_user');
        });

        // =====================================================
        // NIVEL 4: AUDITORÍA TABLAS FINALES
        // =====================================================

        // 14. Auditoría Servicio
        Schema::create('servicio_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_servicio');
            $table->enum('tipo_servicio', ['COLECTIVO', 'PRIVADO']);
            $table->decimal('precio_servicio', 10, 2);
            $table->integer('servicio_descuento_porcentaje')->nullable();
            $table->decimal('servicio_precio_descuento', 10, 2)->nullable();
            $table->unsignedBigInteger('id_tour_activo')->nullable();
            $table->unsignedBigInteger('id_ruta_activa')->nullable();
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_servicio', 'fecha_modificacion'], 'idx_servicio_audit');
            $table->index('usuario_modificacion', 'idx_servicio_user');
        });

        // 15. Auditoría Reservas v4.0 (NUEVA ESTRUCTURA)
        Schema::create('reservas_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_reservas');
            $table->string('reservas_nombres_cliente', 45);
            $table->string('reservas_apellidos_cliente', 45);
            $table->string('reservas_direccion_abordaje', 45);
            $table->string('reservas_telefono_cliente', 45);
            $table->string('reservas_cliente_nit', 45)->nullable();
            $table->string('reservas_habitacion_pax', 45)->nullable();
            $table->string('reservas_transferido_por', 30);
            $table->dateTime('fecha_servicio');
            $table->text('observaciones_generales')->nullable();
            $table->enum('escenario_reserva', [
                'VENTA_DIRECTA',
                'REUBICACION_INTERNA',
                'MAGIC_TRANSFIERE',
                'MAGIC_RECIBE_OPERA',
                'MAGIC_RECIBE_TRANSFIERE'
            ]);
            $table->unsignedBigInteger('agencia_origen')->nullable();
            $table->unsignedBigInteger('id_agencia_transferida')->nullable();
            $table->unsignedBigInteger('estado_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_reservas', 'fecha_modificacion'], 'idx_reservas_audit');
            $table->index('usuario_modificacion', 'idx_reservas_user');
        });

        // 16. Auditoría Datos Reservas Clientes
        Schema::create('datos_reservas_clientes_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_datos_reservas_clientes');
            $table->string('datos_reservas_clientes_nombres', 45)->nullable();
            $table->string('datos_reservas_clientes_apellidos', 45)->nullable();
            $table->unsignedBigInteger('id_reservas');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_datos_reservas_clientes', 'fecha_modificacion'], 'idx_datos_clientes_audit');
            $table->index('usuario_modificacion', 'idx_datos_clientes_user');
        });

        // =====================================================
        // NIVEL 5: AUDITORÍA NUEVAS TABLAS AGREGADAS
        // =====================================================

        // 17. Auditoría Egresos Ruta Activa (NUEVA TABLA)
        Schema::create('egresos_ruta_activa_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_egresos_ruta_activa');
            $table->text('motivo_egreso');
            $table->decimal('cantidad_egreso', 10, 2);
            $table->text('descripcion_egreso')->nullable();
            $table->unsignedBigInteger('id_ruta_activa');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_egresos_ruta_activa', 'fecha_modificacion'], 'idx_egresos_ruta_audit');
            $table->index(['id_ruta_activa', 'fecha_modificacion'], 'idx_egresos_ruta_activa_audit');
            $table->index('usuario_modificacion', 'idx_egresos_ruta_user');
        });

        // 18. Auditoría Caja (NUEVA TABLA)
        Schema::create('caja_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_caja');
            $table->string('numero_voucher', 50)->nullable();
            $table->string('origen', 100);
            $table->string('destino', 100);
            $table->dateTime('fecha_servicio');
            $table->integer('pax_adultos');
            $table->integer('pax_ninos')->nullable();
            $table->integer('total_pax');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('precio_total', 10, 2);
            $table->string('direccion', 200);
            $table->decimal('servicio_cobrar_pax', 10, 2);
            $table->decimal('servicio_precio_descuento', 10, 2);
            $table->string('voucher_caja', 50)->nullable();
            $table->string('enlace_sat', 500)->nullable();
            $table->unsignedBigInteger('id_reservas');
            $table->unsignedBigInteger('estado_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_caja', 'fecha_modificacion'], 'idx_caja_audit');
            $table->index(['id_reservas', 'fecha_modificacion'], 'idx_caja_reserva_audit');
            $table->index('usuario_modificacion', 'idx_caja_user');
        });

        // 19. Auditoría Facturas SAT (NUEVA TABLA)
        Schema::create('facturas_sat_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_facturas_sat');
            $table->string('numero_documento', 50);
            $table->decimal('gran_total', 10, 2);
            $table->string('serie', 50)->nullable();
            $table->string('numero_uuid', 100)->nullable();
            $table->datetime('fecha_emision')->nullable();
            $table->string('nit_receptor', 20)->nullable();
            $table->string('nombre_receptor', 200)->nullable();
            $table->text('enlace_consulta')->nullable();
            $table->json('datos_completos')->nullable();
            $table->unsignedBigInteger('id_caja');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['id_facturas_sat', 'fecha_modificacion'], 'idx_facturas_sat_audit');
            $table->index(['id_caja', 'fecha_modificacion'], 'idx_facturas_sat_caja_audit');
            $table->index('usuario_modificacion', 'idx_facturas_sat_user');
        });
    }

    /**
     * Rollback - Eliminar todas las tablas de auditoría en orden inverso
     */
    public function down()
    {
        // Nuevas tablas nivel 5
        Schema::dropIfExists('facturas_sat_auditoria');
        Schema::dropIfExists('caja_auditoria');
        Schema::dropIfExists('egresos_ruta_activa_auditoria');

        // Tablas nivel 4 v4.0
        Schema::dropIfExists('reservas_servicios_detalle_auditoria');
        Schema::dropIfExists('vouchers_sistema_auditoria');
        Schema::dropIfExists('datos_reservas_clientes_auditoria');
        Schema::dropIfExists('reservas_auditoria');

        // Tablas nivel 3 v4.0
        Schema::dropIfExists('agencias_servicios_precios_auditoria');
        Schema::dropIfExists('servicios_catalogo_auditoria');
        Schema::dropIfExists('tipos_servicio_auditoria');
        Schema::dropIfExists('tour_activo_auditoria');
        Schema::dropIfExists('ruta_activa_auditoria');
        Schema::dropIfExists('usuarios_permisos_auditoria');
        Schema::dropIfExists('usuarios_auditoria');

        // Tablas nivel 2
        Schema::dropIfExists('empleados_auditoria');
        Schema::dropIfExists('vehiculo_auditoria');
        Schema::dropIfExists('tours_auditoria');
        Schema::dropIfExists('rutas_auditoria');
        Schema::dropIfExists('agencias_tours_auditoria');
        Schema::dropIfExists('agencias_rutas_auditoria');

        // Tablas nivel 1
        Schema::dropIfExists('cargo_auditoria');
        Schema::dropIfExists('estado_auditoria');
        Schema::dropIfExists('agencias_auditoria');
    }
};
