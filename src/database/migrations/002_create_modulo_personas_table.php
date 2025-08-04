<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN 002: MÓDULO PERSONAS
     * Tablas: personas, empleados, clientes, choferes_detalle
     * Con todas las relaciones FK
     */
    public function up()
    {
        // 18. Personas (Tabla Base)
        Schema::create('personas', function (Blueprint $table) {
            $table->id();
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('email', 255)->nullable();
            $table->string('telefono_principal', 20)->nullable();
            $table->string('whatsapp', 20)->nullable();
            $table->text('direccion')->nullable();
            $table->unsignedBigInteger('tipo_persona_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('tipo_persona_id')->references('id')->on('tipos_persona');
        });

        // 19. Empleados
        Schema::create('empleados', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('persona_id')->unique();
            $table->string('codigo_empleado', 50)->unique();
            $table->string('password', 255)->nullable();
            $table->unsignedBigInteger('rol_id');
            $table->unsignedBigInteger('estado_empleado_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('persona_id')->references('id')->on('personas');
            $table->foreign('rol_id')->references('id')->on('roles');
            $table->foreign('estado_empleado_id')->references('id')->on('estados_empleado');
        });

        // 20. Clientes
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('persona_id')->unique();
            $table->string('codigo_cliente', 50)->unique();
            $table->unsignedBigInteger('tipo_cliente_id');
            $table->unsignedBigInteger('pais_residencia_id')->nullable();
            $table->string('ciudad_residencia', 100)->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('persona_id')->references('id')->on('personas');
            $table->foreign('tipo_cliente_id')->references('id')->on('tipos_cliente');
            $table->foreign('pais_residencia_id')->references('id')->on('paises');
        });

        // 21. Choferes Detalle
        Schema::create('choferes_detalle', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empleado_id')->unique();
            $table->string('dpi', 20)->unique();
            $table->string('numero_licencia', 50)->unique();
            $table->unsignedBigInteger('tipo_licencia_id');
            $table->date('fecha_emision_licencia');
            $table->date('fecha_vencimiento_licencia');
            $table->boolean('licencia_vigente')->default(1);
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('empleado_id')->references('id')->on('empleados');
            $table->foreign('tipo_licencia_id')->references('id')->on('tipos_licencia');
        });
    }

    /**
     * Rollback - Eliminar tablas del módulo personas
     */
    public function down()
    {
        Schema::dropIfExists('choferes_detalle');
        Schema::dropIfExists('clientes');
        Schema::dropIfExists('empleados');
        Schema::dropIfExists('personas');
    }
};
