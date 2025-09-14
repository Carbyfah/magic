<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN MAGIC TRAVEL v3.0 - NUEVA ESTRUCTURA CORREGIDA
     * Base de datos ordenada jerárquicamente para evitar errores de FK
     * Orden: Independientes → Intermedias → Dependientes
     */
    public function up()
    {
        // =====================================================
        // NIVEL 1: TABLAS INDEPENDIENTES (Sin FK)
        // =====================================================

        // 1. Agencias
        Schema::create('agencias', function (Blueprint $table) {
            $table->id('id_agencias');
            $table->string('agencias_nombre', 45);
            $table->boolean('agencias_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // 2. Estado
        Schema::create('estado', function (Blueprint $table) {
            $table->id('estado_id');
            $table->string('estado_nombre', 45);
            $table->string('estado_descripcion', 45)->nullable();
            $table->boolean('estado_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // 3. Cargo
        Schema::create('cargo', function (Blueprint $table) {
            $table->id('id_cargo');
            $table->string('cargo_nombre', 45)->nullable();
            $table->boolean('cargo_situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // =====================================================
        // NIVEL 2: TABLAS INTERMEDIAS (Dependen de Nivel 1)
        // =====================================================

        // 4. Rutas
        Schema::create('rutas', function (Blueprint $table) {
            $table->id('id_rutas');
            $table->string('rutas_origen', 45);
            $table->string('rutas_destino', 45);
            $table->boolean('rutas_situacion')->default(1);
            $table->unsignedBigInteger('id_agencias');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_agencias')->references('id_agencias')->on('agencias');
        });

        // 5. Tours
        Schema::create('tours', function (Blueprint $table) {
            $table->id('id_tour');
            $table->string('tours_nombre', 45);
            $table->boolean('tours_situacion')->default(1);
            $table->unsignedBigInteger('id_agencias');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_agencias')->references('id_agencias')->on('agencias');
        });

        // 6. Vehículo
        Schema::create('vehiculo', function (Blueprint $table) {
            $table->id('id_vehiculo');
            $table->string('vehiculo_marca', 45)->nullable();
            $table->string('vehiculo_placa', 45)->nullable();
            $table->integer('vehiculo_capacidad')->nullable();
            $table->boolean('vehiculo_situacion')->default(1);
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_agencias');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_agencias')->references('id_agencias')->on('agencias');
        });

        // 7. Empleados
        Schema::create('empleados', function (Blueprint $table) {
            $table->id('id_empleados');
            $table->string('empleados_nombres', 45);
            $table->string('empleados_apellidos', 45);
            $table->string('empleados_dpi', 45)->nullable();
            $table->boolean('empleados_situacion')->default(1);
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_cargo');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_agencias')->references('id_agencias')->on('agencias');
            $table->foreign('id_cargo')->references('id_cargo')->on('cargo');
        });

        // =====================================================
        // NIVEL 3: TABLAS DEPENDIENTES (Dependen de Nivel 2)
        // =====================================================

        // 8. Usuarios
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuarios');
            $table->string('usuarios_nombre', 45)->nullable();
            $table->string('usuario_password', 500);
            $table->boolean('usuarios_situacion')->default(1);
            $table->unsignedBigInteger('id_empleados');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_empleados')->references('id_empleados')->on('empleados');
        });

        // 9. Ruta Activa
        Schema::create('ruta_activa', function (Blueprint $table) {
            $table->id('id_ruta_activa');
            $table->dateTime('ruta_activa_fecha');
            $table->boolean('ruta_activa_situacion')->default(1);
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_rutas');
            $table->unsignedBigInteger('id_vehiculo'); // AGREGADO: relación directa con vehículo
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_rutas')->references('id_rutas')->on('rutas');
            $table->foreign('id_vehiculo')->references('id_vehiculo')->on('vehiculo');
        });

        // 10. Tour Activo
        Schema::create('tour_activo', function (Blueprint $table) {
            $table->id('id_tour_activo');
            $table->dateTime('tour_activo_fecha');
            $table->string('tour_activo_tipo', 45);
            $table->boolean('tour_situacion')->default(1);
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_tour');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_tour')->references('id_tour')->on('tours');
        });

        // =====================================================
        // NIVEL 4: TABLAS FINALES (Dependen de Nivel 3)
        // =====================================================

        // 11. Servicio
        Schema::create('servicio', function (Blueprint $table) {
            $table->id('id_servicio');
            $table->enum('tipo_servicio', ['COLECTIVO', 'PRIVADO']);
            $table->decimal('precio_servicio', 10, 2);
            $table->integer('servicio_descuento_porcentaje')->nullable(); // % que se va aplicar (0-100)
            $table->decimal('servicio_precio_descuento', 10, 2)->nullable(); // Precio con descuento calculado automáticamente
            $table->boolean('servicio_situacion')->default(1);
            $table->unsignedBigInteger('id_tour_activo')->nullable();
            $table->unsignedBigInteger('id_ruta_activa')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_tour_activo')->references('id_tour_activo')->on('tour_activo');
            $table->foreign('id_ruta_activa')->references('id_ruta_activa')->on('ruta_activa');
        });

        // 12. Reservas
        Schema::create('reservas', function (Blueprint $table) {
            $table->id('id_reservas');
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
            $table->boolean('reservas_situacion')->default(1);
            $table->unsignedBigInteger('id_servicio');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_ruta_activa')->nullable();
            $table->unsignedBigInteger('id_tour_activo')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_servicio')->references('id_servicio')->on('servicio');
            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_ruta_activa')->references('id_ruta_activa')->on('ruta_activa');
            $table->foreign('id_tour_activo')->references('id_tour_activo')->on('tour_activo');
            $table->foreign('id_agencia_transferida')->references('id_agencias')->on('agencias');
        });

        // 13. Datos Reservas Clientes
        Schema::create('datos_reservas_clientes', function (Blueprint $table) {
            $table->id('id_datos_reservas_clientes');
            $table->string('datos_reservas_clientes_nombres', 45)->nullable();
            $table->string('datos_reservas_clientes_apellidos', 45)->nullable();
            $table->boolean('datos_reservas_clientes_situacion')->default(1);
            $table->unsignedBigInteger('id_reservas');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_reservas')->references('id_reservas')->on('reservas');
        });

        // =====================================================
        // CONSTRAINTS ADICIONALES
        // =====================================================

        // Constraint: Reserva debe tener ruta O tour (no ambos, no ninguno)
        DB::statement('ALTER TABLE reservas ADD CONSTRAINT chk_reservas_tipo CHECK (
            (id_ruta_activa IS NOT NULL AND id_tour_activo IS NULL) OR
            (id_ruta_activa IS NULL AND id_tour_activo IS NOT NULL)
        )');

        // Constraint: Porcentaje de descuento entre 0 y 100
        DB::statement('ALTER TABLE servicio ADD CONSTRAINT chk_servicio_descuento_porcentaje CHECK (
            servicio_descuento_porcentaje IS NULL OR
            (servicio_descuento_porcentaje >= 0 AND servicio_descuento_porcentaje <= 100)
        )');

        // Constraint: Cantidad de adultos debe ser mayor a 0
        DB::statement('ALTER TABLE reservas ADD CONSTRAINT chk_reservas_cantidad_adultos CHECK (
            reservas_cantidad_adultos > 0
        )');

        // Constraint: Cantidad de niños no puede ser negativa
        DB::statement('ALTER TABLE reservas ADD CONSTRAINT chk_reservas_cantidad_ninos CHECK (
            reservas_cantidad_ninos IS NULL OR reservas_cantidad_ninos >= 0
        )');

        // =====================================================
        // NOTA: Las FKs de auditoría (created_by)
        // se agregan en migración separada DESPUÉS de seeders
        // =====================================================
    }

    /**
     * Rollback - Eliminar en orden inverso
     */
    public function down()
    {
        Schema::dropIfExists('datos_reservas_clientes');
        Schema::dropIfExists('reservas');
        Schema::dropIfExists('servicio');
        Schema::dropIfExists('tour_activo');
        Schema::dropIfExists('ruta_activa');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('empleados');
        Schema::dropIfExists('vehiculo');
        Schema::dropIfExists('tours');
        Schema::dropIfExists('rutas');
        Schema::dropIfExists('cargo');
        Schema::dropIfExists('estado');
        Schema::dropIfExists('agencias');
    }
};
