<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN 001: CATÁLOGOS INDEPENDIENTES
     * Todas las tablas independientes sin FK
     * 17 tablas de catálogos maestros
     */
    public function up()
    {
        // 1. Tipos de Persona
        Schema::create('tipos_persona', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 2. Países
        Schema::create('paises', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_pais', 100);
            $table->string('codigo_iso', 3)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 3. Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_rol', 100);
            $table->text('descripcion')->nullable();
            $table->json('permisos_json')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 4. Estados de Empleado
        Schema::create('estados_empleado', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 5. Tipos de Cliente
        Schema::create('tipos_cliente', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 6. Tipos de Licencia
        Schema::create('tipos_licencia', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 7. Tipos de Vehículo
        Schema::create('tipos_vehiculo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 8. Tipos de Combustible
        Schema::create('tipos_combustible', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_combustible', 50);
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 9. Estados de Vehículo
        Schema::create('estados_vehiculo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 10. Tipos de Agencia
        Schema::create('tipos_agencia', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 11. Formas de Pago
        Schema::create('formas_pago', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_forma', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 12. Estados Comerciales
        Schema::create('estados_comercial', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 13. Estados de Ruta
        Schema::create('estados_ruta', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 14. Estados de Reserva
        Schema::create('estados_reserva', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 15. Tipos de Venta
        Schema::create('tipos_venta', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 16. Estados de Venta
        Schema::create('estados_venta', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        // 17. Estados de Pago
        Schema::create('estados_pago', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    /**
     * Rollback - Eliminar todas las tablas independientes
     */
    public function down()
    {
        Schema::dropIfExists('estados_pago');
        Schema::dropIfExists('estados_venta');
        Schema::dropIfExists('tipos_venta');
        Schema::dropIfExists('estados_reserva');
        Schema::dropIfExists('estados_ruta');
        Schema::dropIfExists('estados_comercial');
        Schema::dropIfExists('formas_pago');
        Schema::dropIfExists('tipos_agencia');
        Schema::dropIfExists('estados_vehiculo');
        Schema::dropIfExists('tipos_combustible');
        Schema::dropIfExists('tipos_vehiculo');
        Schema::dropIfExists('tipos_licencia');
        Schema::dropIfExists('tipos_cliente');
        Schema::dropIfExists('estados_empleado');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('paises');
        Schema::dropIfExists('tipos_persona');
    }
};
