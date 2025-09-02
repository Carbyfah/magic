<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN MAGIC TRAVEL v2.0 - CORREGIDA
     * Base de datos ordenada jerárquicamente para evitar errores de FK
     * Orden: Independientes → Intermedias → Dependientes
     */
    public function up()
    {
        // =====================================================
        // NIVEL 1: TABLAS INDEPENDIENTES (Sin FK)
        // =====================================================

        // 1. Tipos de Persona
        Schema::create('tipo_persona', function (Blueprint $table) {
            $table->id('tipo_persona_id');
            $table->string('tipo_persona_codigo', 45)->unique();
            $table->string('tipo_persona_tipo', 45)->nullable();
            $table->boolean('tipo_persona_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 2. Roles
        Schema::create('rol', function (Blueprint $table) {
            $table->id('rol_id');
            $table->string('rol_codigo', 45)->unique();
            $table->string('rol_rol', 45);
            $table->string('rol_descripcion', 100)->nullable();
            $table->boolean('rol_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 3. Estados (Abstracción Universal)
        Schema::create('estado', function (Blueprint $table) {
            $table->id('estado_id');
            $table->string('estado_codigo', 45)->unique();
            $table->string('estado_estado', 45);
            $table->string('estado_descripcion', 45)->nullable();
            $table->boolean('estado_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 4. Servicios (Catálogo Comercial)
        Schema::create('servicio', function (Blueprint $table) {
            $table->id('servicio_id');
            $table->string('servicio_codigo', 45)->unique();
            $table->string('servicio_servicio', 100)->nullable();
            $table->decimal('servicio_precio_normal', 10, 2)->nullable();
            $table->decimal('servicio_precio_descuento', 10, 2)->nullable();
            $table->boolean('servicio_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 5. Rutas (Plantillas Base)
        Schema::create('ruta', function (Blueprint $table) {
            $table->id('ruta_id');
            $table->string('ruta_codigo', 45)->unique();
            $table->string('ruta_ruta', 45);
            $table->string('ruta_origen', 100);
            $table->string('ruta_destino', 100);
            $table->boolean('ruta_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 6. Agencias
        Schema::create('agencia', function (Blueprint $table) {
            $table->id('agencia_id');
            $table->string('agencia_codigo', 45)->unique();
            $table->string('agencia_razon_social', 45);
            $table->string('agencia_nit', 45)->nullable();
            $table->string('agencia_email', 45)->nullable();
            $table->bigInteger('agencia_telefono')->nullable();
            $table->boolean('agencia_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // =====================================================
        // NIVEL 2: TABLAS INTERMEDIAS (Dependen de Nivel 1)
        // =====================================================

        // 7. Personas
        Schema::create('persona', function (Blueprint $table) {
            $table->id('persona_id');
            $table->string('persona_codigo', 45)->unique();
            $table->string('persona_nombres', 100);
            $table->string('persona_apellidos', 100);
            $table->bigInteger('persona_telefono')->nullable();
            $table->string('persona_email', 45)->nullable();
            $table->boolean('persona_situacion')->default(1);
            $table->unsignedBigInteger('tipo_persona_id');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            $table->foreign('tipo_persona_id')->references('tipo_persona_id')->on('tipo_persona');
        });

        // 8. Vehículos
        Schema::create('vehiculo', function (Blueprint $table) {
            $table->id('vehiculo_id');
            $table->string('vehiculo_codigo', 45)->unique();
            $table->string('vehiculo_placa', 45)->unique();
            $table->string('vehiculo_marca', 45);
            $table->string('vehiculo_modelo', 45)->nullable();
            $table->integer('vehiculo_capacidad');
            $table->boolean('vehiculo_situacion')->default(1);
            $table->unsignedBigInteger('estado_id');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
        });

        // 9. Contactos de Agencia
        Schema::create('contactos_agencia', function (Blueprint $table) {
            $table->id('contactos_agencia_id');
            $table->string('contactos_agencia_codigo', 45)->unique();
            $table->string('contactos_agencia_nombres', 100);
            $table->string('contactos_agencia_apellidos', 100);
            $table->string('contactos_agencia_cargo', 45);
            $table->bigInteger('contactos_agencia_telefono');
            $table->boolean('contactos_agencia_situacion')->default(1);
            $table->unsignedBigInteger('agencia_id');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            $table->foreign('agencia_id')->references('agencia_id')->on('agencia');
        });

        // =====================================================
        // NIVEL 3: TABLAS DEPENDIENTES (Dependen de Nivel 2)
        // =====================================================

        // 10. Usuarios
        Schema::create('usuario', function (Blueprint $table) {
            $table->id('usuario_id');
            $table->string('usuario_codigo', 45)->unique();
            $table->string('usuario_password', 500);
            $table->boolean('usuario_situacion')->default(1);
            $table->unsignedBigInteger('persona_id');
            $table->unsignedBigInteger('rol_id');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            $table->foreign('persona_id')->references('persona_id')->on('persona');
            $table->foreign('rol_id')->references('rol_id')->on('rol');
        });

        // 11. Rutas Activadas
        Schema::create('ruta_activada', function (Blueprint $table) {
            $table->id('ruta_activada_id');
            $table->string('ruta_activada_codigo', 45)->unique();
            $table->dateTime('ruta_activada_fecha_hora');
            $table->boolean('ruta_activada_situacion')->default(1);
            $table->unsignedBigInteger('persona_id');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('servicio_id');
            $table->unsignedBigInteger('ruta_id');
            $table->unsignedBigInteger('vehiculo_id');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            $table->foreign('persona_id')->references('persona_id')->on('persona');
            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('servicio_id')->references('servicio_id')->on('servicio');
            $table->foreign('ruta_id')->references('ruta_id')->on('ruta');
            $table->foreign('vehiculo_id')->references('vehiculo_id')->on('vehiculo');
        });

        // =====================================================
        // NIVEL 4: TABLAS FINALES (Dependen de Nivel 3)
        // =====================================================

        // 12. Reservas
        Schema::create('reserva', function (Blueprint $table) {
            $table->id('reserva_id');
            $table->string('reserva_codigo', 45)->unique();
            $table->string('reserva_nombres_cliente', 100);
            $table->string('reserva_apellidos_cliente', 100);
            $table->bigInteger('reserva_cliente_nit')->nullable();
            $table->bigInteger('reserva_telefono_cliente');
            $table->string('reserva_email_cliente', 80)->nullable();
            $table->integer('reserva_cantidad_adultos');
            $table->integer('reserva_cantidad_ninos')->nullable();
            // CORRECCION: Campo calculado automático a eliminar errores de suma manual
            $table->string('reserva_direccion_abordaje', 255)->nullable();
            $table->string('reserva_notas', 255)->nullable();
            $table->decimal('reserva_monto', 10, 2)->nullable();
            $table->boolean('reserva_situacion')->default(1);
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('agencia_id')->nullable();
            $table->unsignedBigInteger('ruta_activada_id');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            $table->foreign('usuario_id')->references('usuario_id')->on('usuario');
            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('agencia_id')->references('agencia_id')->on('agencia');
            $table->foreign('ruta_activada_id')->references('ruta_activada_id')->on('ruta_activada');
        });

        // =====================================================
        // NOTA: Las FKs de auditoría (created_by, updated_by)
        // se agregan en migración separada DESPUÉS de seeders
        // =====================================================
    }

    /**
     * Rollback - Eliminar en orden inverso
     */
    public function down()
    {
        Schema::dropIfExists('reserva');
        Schema::dropIfExists('ruta_activada');
        Schema::dropIfExists('usuario');
        Schema::dropIfExists('contactos_agencia');
        Schema::dropIfExists('vehiculo');
        Schema::dropIfExists('persona');
        Schema::dropIfExists('agencia');
        Schema::dropIfExists('ruta');
        Schema::dropIfExists('servicio');
        Schema::dropIfExists('estado');
        Schema::dropIfExists('rol');
        Schema::dropIfExists('tipo_persona');
    }
};
