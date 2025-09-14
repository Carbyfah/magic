<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN AUDITORÍA MAGIC TRAVEL v3.0 - SIN CAMPOS SITUACIÓN
     * Tablas de auditoría paralelas para todas las tablas del sistema
     * Orden: Nivel 1 → Nivel 2 → Nivel 3 → Nivel 4
     * ELIMINADOS: todos los campos *_situacion (soft delete hace este trabajo)
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

        // 4. Auditoría Rutas
        Schema::create('rutas_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_rutas');
            $table->string('rutas_origen', 45);
            $table->string('rutas_destino', 45);
            $table->unsignedBigInteger('id_agencias');
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

        // 5. Auditoría Tours
        Schema::create('tours_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_tour');
            $table->string('tours_nombre', 45);
            $table->unsignedBigInteger('id_agencias');
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

        // 6. Auditoría Vehículo
        Schema::create('vehiculo_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_vehiculo');
            $table->string('vehiculo_marca', 45)->nullable();
            $table->string('vehiculo_placa', 45)->nullable();
            $table->integer('vehiculo_capacidad')->nullable();
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

        // 7. Auditoría Empleados
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

        // 8. Auditoría Usuarios
        Schema::create('usuarios_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_usuarios');
            $table->string('usuarios_nombre', 45)->nullable();
            $table->string('usuarios_correo', 100)->nullable();
            $table->string('usuario_password', 500);
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

        // 9. Auditoría Ruta Activa
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

        // 10. Auditoría Tour Activo
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

        // 11. Auditoría Servicio
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

        // 12. Auditoría Reservas
        Schema::create('reservas_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('id_reservas');
            $table->integer('reservas_cantidad_adultos');
            $table->integer('reservas_cantidad_ninos')->nullable();
            $table->string('reservas_nombres_cliente', 45);
            $table->string('reservas_apellidos_cliente', 45);
            $table->string('reservas_direccion_abordaje', 45);
            $table->string('reservas_telefono_cliente', 45);
            $table->string('reservas_cliente_nit', 45)->nullable();
            $table->string('reservas_habitacion_pax', 45)->nullable();
            $table->string('reservas_transferido_por', 30);
            $table->string('reservas_notas', 45)->nullable();
            $table->decimal('reservas_cobrar_a_pax', 10, 2);
            $table->unsignedBigInteger('id_agencia_transferida')->nullable();
            $table->unsignedBigInteger('id_servicio');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_ruta_activa')->nullable();
            $table->unsignedBigInteger('id_tour_activo')->nullable();
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

        // 13. Auditoría Datos Reservas Clientes
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
    }

    /**
     * Rollback - Eliminar todas las tablas de auditoría en orden inverso
     */
    public function down()
    {
        Schema::dropIfExists('datos_reservas_clientes_auditoria');
        Schema::dropIfExists('reservas_auditoria');
        Schema::dropIfExists('servicio_auditoria');
        Schema::dropIfExists('tour_activo_auditoria');
        Schema::dropIfExists('ruta_activa_auditoria');
        Schema::dropIfExists('usuarios_auditoria');
        Schema::dropIfExists('empleados_auditoria');
        Schema::dropIfExists('vehiculo_auditoria');
        Schema::dropIfExists('tours_auditoria');
        Schema::dropIfExists('rutas_auditoria');
        Schema::dropIfExists('cargo_auditoria');
        Schema::dropIfExists('estado_auditoria');
        Schema::dropIfExists('agencias_auditoria');
    }
};
