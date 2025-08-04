<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN 005: AUDITORÍA Y FOREIGN KEYS
     * Tabla: auditoria
     * FK de auditoría: created_by, updated_by para todas las tablas
     */
    public function up()
    {
        // 28. Auditoría
        Schema::create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_auditoria', 50)->unique();
            $table->unsignedBigInteger('usuario_id');
            $table->string('nombre_usuario', 255);
            $table->string('rol_usuario', 100);
            $table->enum('tipo_accion', ['insert', 'update', 'delete', 'login', 'logout']);
            $table->string('tabla_afectada', 100);
            $table->string('registro_id', 50);
            $table->string('campo_clave', 100)->nullable();
            $table->string('valor_clave', 255)->nullable();
            $table->longText('datos_anteriores')->nullable();
            $table->longText('datos_nuevos')->nullable();
            $table->longText('campos_modificados')->nullable();
            $table->text('motivo_cambio')->nullable();
            $table->text('descripcion_accion');
            $table->enum('nivel_impacto', ['bajo', 'medio', 'alto', 'crítico'])->default('bajo');
            $table->string('ip_address', 45);
            $table->string('user_agent', 500)->nullable();
            $table->string('sesion_id', 255)->nullable();
            $table->string('transaccion_id', 255)->nullable();
            $table->string('modulo_sistema', 100);
            $table->string('pantalla_origen', 100)->nullable();
            $table->string('funcion_origen', 100)->nullable();
            $table->timestamp('fecha_hora_accion')->useCurrent();
            // Campos simples (sin generados automáticamente)
            $table->time('hora_accion')->nullable();
            $table->integer('dia_semana')->nullable();
            $table->integer('semana_ano')->nullable();
            $table->integer('mes_ano')->nullable();
            $table->integer('ano')->nullable();
            $table->boolean('accion_exitosa')->default(1);
            $table->text('mensaje_error')->nullable();
            $table->boolean('requiere_revision')->default(0);
            $table->string('revisado_por', 255)->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->text('observaciones_revision')->nullable();
            $table->boolean('accion_autorizada')->default(1);
            $table->string('codigo_autorizacion', 100)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();

            // Foreign Key
            $table->foreign('usuario_id')->references('id')->on('empleados');
        });

        // =====================================================
        // FOREIGN KEYS DE AUDITORÍA PARA TODAS LAS TABLAS
        // =====================================================

        // TABLAS INDEPENDIENTES
        Schema::table('tipos_persona', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('paises', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('estados_empleado', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('tipos_cliente', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('tipos_licencia', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('tipos_vehiculo', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('tipos_combustible', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('estados_vehiculo', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('tipos_agencia', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('formas_pago', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('estados_comercial', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('estados_ruta', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('estados_reserva', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('tipos_venta', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('estados_venta', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('estados_pago', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        // MÓDULO PERSONAS
        Schema::table('personas', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('empleados', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('choferes_detalle', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        // MÓDULO OPERACIONES
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('agencias', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('rutas', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        // MÓDULO RESERVAS Y VENTAS
        Schema::table('reservas', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('rutas_ejecutadas', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('empleados');
            $table->foreign('updated_by')->references('id')->on('empleados');
        });
    }

    /**
     * Rollback - Eliminar auditoría y todas las FK de auditoría
     */
    public function down()
    {
        // Eliminar FK de auditoría de todas las tablas
        $tables = [
            'tipos_persona',
            'paises',
            'roles',
            'estados_empleado',
            'tipos_cliente',
            'tipos_licencia',
            'tipos_vehiculo',
            'tipos_combustible',
            'estados_vehiculo',
            'tipos_agencia',
            'formas_pago',
            'estados_comercial',
            'estados_ruta',
            'estados_reserva',
            'tipos_venta',
            'estados_venta',
            'estados_pago',
            'personas',
            'empleados',
            'clientes',
            'choferes_detalle',
            'vehiculos',
            'agencias',
            'rutas',
            'reservas',
            'rutas_ejecutadas',
            'ventas'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['created_by']);
                $table->dropForeign(['updated_by']);
            });
        }

        // Eliminar tabla auditoría
        Schema::dropIfExists('auditoria');
    }
};
