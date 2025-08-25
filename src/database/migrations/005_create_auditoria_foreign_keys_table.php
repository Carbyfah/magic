<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 28. Auditoría - VERSIÓN SIMPLIFICADA Y OPTIMIZADA
        Schema::create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->enum('accion', ['insert', 'update', 'delete', 'login', 'logout', 'view', 'export']);
            $table->string('tabla', 50)->nullable();
            $table->unsignedBigInteger('registro_id')->nullable();
            $table->text('datos_anteriores')->nullable();
            $table->text('datos_nuevos')->nullable();
            $table->text('campos_modificados')->nullable();
            $table->string('modulo', 50)->nullable();
            $table->string('descripcion', 255)->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->string('sesion_id', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Índices
            $table->index('usuario_id');
            $table->index('accion');
            $table->index('tabla');
            $table->index('registro_id');
            $table->index('created_at');
            $table->index(['tabla', 'registro_id']);
            $table->index('modulo');
        });

        // NO CREAR estados_ejecucion si vas a usar ENUM en rutas_ejecutadas
        // Si quieres usar FK, entonces:
        /*
        Schema::create('estados_ejecucion', function (Blueprint $table) {
            // ... código de la tabla
        });

        // Y modificar rutas_ejecutadas:
        Schema::table('rutas_ejecutadas', function (Blueprint $table) {
            $table->dropColumn('estado'); // Eliminar ENUM
            $table->unsignedBigInteger('estado_ejecucion_id')->after('costo_peajes');
            $table->foreign('estado_ejecucion_id')->references('id')->on('estados_ejecucion');
        });
        */

        // 30. Tabla Puente: Reservas - Rutas Ejecutadas (CRÍTICA - FALTABA)
        Schema::create('reservas_rutas_ejecutadas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reserva_id');
            $table->unsignedBigInteger('ruta_ejecutada_id');
            $table->boolean('pasajero_abordo')->default(0);
            $table->time('hora_pickup_real')->nullable();
            $table->string('punto_pickup', 255)->nullable();
            $table->integer('numero_asiento')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            // Foreign Keys
            $table->foreign('reserva_id')->references('id')->on('reservas')->onDelete('cascade');
            $table->foreign('ruta_ejecutada_id')->references('id')->on('rutas_ejecutadas')->onDelete('cascade');

            // Índice único
            $table->unique(['reserva_id', 'ruta_ejecutada_id'], 'reserva_ruta_unique');
        });

        // 31. Pagos (Separada de Ventas)
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_pago', 50)->unique();
            $table->unsignedBigInteger('venta_id');
            $table->unsignedBigInteger('forma_pago_id');
            $table->decimal('monto', 10, 2);
            $table->datetime('fecha_pago');
            $table->string('referencia', 100)->nullable();
            $table->string('banco', 100)->nullable();
            $table->string('numero_autorizacion', 100)->nullable();
            $table->unsignedBigInteger('estado_pago_id');
            $table->unsignedBigInteger('empleado_cajero_id')->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            // Foreign Keys
            $table->foreign('venta_id')->references('id')->on('ventas');
            $table->foreign('forma_pago_id')->references('id')->on('formas_pago');
            $table->foreign('estado_pago_id')->references('id')->on('estados_pago');
            $table->foreign('empleado_cajero_id')->references('id')->on('empleados');

            // Índices
            $table->index('fecha_pago');
            $table->index('venta_id');
        });

        // FK de auditoría para la tabla auditoria
        Schema::table('auditoria', function (Blueprint $table) {
            $table->foreign('usuario_id')->references('id')->on('empleados')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('auditoria', function (Blueprint $table) {
            $table->dropForeign(['usuario_id']);
        });

        Schema::dropIfExists('pagos');
        Schema::dropIfExists('reservas_rutas_ejecutadas');
        // Schema::dropIfExists('estados_ejecucion'); // Si decides usarla
        Schema::dropIfExists('auditoria');
    }
};
