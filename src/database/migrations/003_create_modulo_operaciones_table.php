<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN 003: MÓDULO OPERACIONES
     * Tablas: vehiculos, agencias, rutas
     * Con todas las relaciones FK
     */
    public function up()
    {
        // 22. Vehículos
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_vehiculo', 50)->unique();
            $table->string('placa', 20)->unique();
            $table->string('marca', 100);
            $table->string('modelo', 100);
            $table->integer('ano');
            $table->string('color', 50)->nullable();
            $table->unsignedBigInteger('tipo_vehiculo_id');
            $table->unsignedBigInteger('tipo_combustible_id');
            $table->integer('capacidad_pasajeros');
            $table->integer('capacidad_equipaje')->nullable();
            $table->string('numero_motor', 100)->nullable();
            $table->string('numero_chasis', 100)->nullable();
            $table->string('numero_tarjeta_circulacion', 50)->nullable();
            $table->date('vencimiento_tarjeta_circulacion')->nullable();
            $table->string('poliza_seguro', 100)->nullable();
            $table->date('vencimiento_seguro')->nullable();
            $table->unsignedBigInteger('estado_vehiculo_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('tipo_vehiculo_id')->references('id')->on('tipos_vehiculo');
            $table->foreign('tipo_combustible_id')->references('id')->on('tipos_combustible');
            $table->foreign('estado_vehiculo_id')->references('id')->on('estados_vehiculo');
        });

        // 23. Agencias
        Schema::create('agencias', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_agencia', 50)->unique();
            $table->string('razon_social', 255);
            $table->string('nombre_comercial', 255)->nullable();
            $table->string('nit', 20)->unique();
            $table->string('registro_turistico', 100)->nullable();
            $table->text('direccion');
            $table->string('telefono_principal', 20);
            $table->string('telefono_secundario', 20)->nullable();
            $table->string('email_principal', 255);
            $table->string('whatsapp', 20)->nullable();
            $table->unsignedBigInteger('pais_id');
            $table->string('contacto_nombre', 255)->nullable();
            $table->string('contacto_cargo', 100)->nullable();
            $table->string('contacto_telefono', 20)->nullable();
            $table->string('contacto_email', 255)->nullable();
            $table->unsignedBigInteger('tipo_agencia_id');
            $table->decimal('comision_porcentaje', 5, 2)->default(10.00);
            $table->unsignedBigInteger('forma_pago_id');
            $table->unsignedBigInteger('estado_comercial_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('pais_id')->references('id')->on('paises');
            $table->foreign('tipo_agencia_id')->references('id')->on('tipos_agencia');
            $table->foreign('forma_pago_id')->references('id')->on('formas_pago');
            $table->foreign('estado_comercial_id')->references('id')->on('estados_comercial');
        });

        // 24. Rutas (Plantillas)
        Schema::create('rutas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_ruta', 50)->unique();
            $table->string('nombre_ruta', 255);
            $table->string('ciudad_origen', 100);
            $table->string('ciudad_destino', 100);
            $table->string('punto_salida', 255)->nullable();
            $table->string('punto_llegada', 255)->nullable();
            $table->decimal('distancia_km', 8, 2)->nullable();
            $table->time('hora_salida');
            $table->time('hora_llegada_estimada')->nullable();
            $table->integer('duracion_vehiculo')->nullable();
            $table->integer('capacidad_maxima')->default(50);
            $table->integer('capacidad_recomendada')->default(45);
            $table->unsignedBigInteger('tipo_vehiculo_id');
            $table->boolean('opera_lunes')->default(1);
            $table->boolean('opera_martes')->default(1);
            $table->boolean('opera_miercoles')->default(1);
            $table->boolean('opera_jueves')->default(1);
            $table->boolean('opera_viernes')->default(1);
            $table->boolean('opera_sabado')->default(1);
            $table->boolean('opera_domingo')->default(1);
            $table->decimal('precio_adulto', 8, 2);
            $table->decimal('precio_nino', 8, 2)->nullable();
            $table->unsignedBigInteger('estado_ruta_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('tipo_vehiculo_id')->references('id')->on('tipos_vehiculo');
            $table->foreign('estado_ruta_id')->references('id')->on('estados_ruta');
        });
    }

    /**
     * Rollback - Eliminar tablas del módulo operaciones
     */
    public function down()
    {
        Schema::dropIfExists('rutas');
        Schema::dropIfExists('agencias');
        Schema::dropIfExists('vehiculos');
    }
};
