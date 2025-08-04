<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN 004: MÓDULO RESERVAS Y VENTAS
     * Tablas: reservas, rutas_ejecutadas, ventas
     * Con todas las relaciones FK
     */
    public function up()
    {
        // 25. Reservas
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_reserva', 50)->unique();
            $table->unsignedBigInteger('empleado_id');
            $table->integer('pax');
            $table->string('nombre_cliente', 255);
            $table->unsignedBigInteger('cliente_id')->nullable();
            $table->string('hotel', 255)->nullable();
            $table->string('telefono_habitacion', 20)->nullable();
            $table->string('origen', 255);
            $table->string('destino', 255);
            $table->time('hora_viaje');
            $table->string('voucher_origen', 100)->nullable();
            $table->unsignedBigInteger('agencia_id')->nullable();
            $table->date('fecha_reservacion');
            $table->date('fecha_viaje');
            $table->string('cobrar_a', 255)->nullable();
            $table->unsignedBigInteger('estado_reserva_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('empleado_id')->references('id')->on('empleados');
            $table->foreign('cliente_id')->references('id')->on('clientes');
            $table->foreign('agencia_id')->references('id')->on('agencias');
            $table->foreign('estado_reserva_id')->references('id')->on('estados_reserva');
        });

        // 26. Rutas Ejecutadas (Instancias Diarias)
        Schema::create('rutas_ejecutadas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_ejecucion', 50)->unique();
            $table->unsignedBigInteger('ruta_id');
            $table->unsignedBigInteger('vehiculo_id');
            $table->unsignedBigInteger('chofer_id');
            $table->date('fecha_ejecucion');
            $table->date('fecha_programada');
            $table->time('hora_salida_real')->nullable();
            $table->time('hora_llegada_real')->nullable();
            $table->integer('pasajeros_programados')->default(0);
            $table->integer('pasajeros_abordaron')->default(0);
            $table->integer('pasajeros_no_show')->default(0);
            $table->decimal('combustible_inicial', 8, 2)->nullable();
            $table->decimal('combustible_final', 8, 2)->nullable();
            $table->decimal('combustible_consumido', 8, 2)->nullable()->storedAs('combustible_inicial - combustible_final');
            $table->integer('kilometraje_inicial')->nullable();
            $table->integer('kilometraje_final')->nullable();
            $table->integer('kilometros_recorridos')->nullable()->storedAs('kilometraje_final - kilometraje_inicial');
            $table->unsignedBigInteger('estado_ejecucion_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('ruta_id')->references('id')->on('rutas');
            $table->foreign('vehiculo_id')->references('id')->on('vehiculos');
            $table->foreign('chofer_id')->references('id')->on('empleados');
            $table->foreign('estado_ejecucion_id')->references('id')->on('estados_reserva');
        });

        // 27. Ventas
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_venta', 50)->unique();
            $table->unsignedBigInteger('reserva_id')->nullable();
            $table->unsignedBigInteger('ruta_ejecutada_id')->nullable();
            $table->unsignedBigInteger('cliente_id')->nullable();
            $table->unsignedBigInteger('agencia_id')->nullable();
            $table->unsignedBigInteger('empleado_vendedor_id');
            $table->date('fecha_venta');
            $table->datetime('fecha_hora_venta');
            $table->unsignedBigInteger('tipo_venta_id');
            $table->string('servicio_vendido', 255);
            $table->date('fecha_servicio');
            $table->integer('cantidad_pasajeros');
            $table->text('detalle_pasajeros')->nullable();
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('descuento_porcentaje', 5, 2)->default(0.00);
            $table->decimal('descuento_monto', 8, 2)->default(0.00);
            $table->decimal('impuestos_porcentaje', 5, 2)->default(0.00);
            $table->decimal('impuestos_monto', 8, 2)->default(0.00);
            $table->decimal('total_venta', 10, 2);
            $table->decimal('comision_agencia_porcentaje', 5, 2)->default(0.00);
            $table->decimal('comision_agencia_monto', 8, 2)->default(0.00);
            $table->decimal('comision_vendedor_porcentaje', 5, 2)->default(0.00);
            $table->decimal('comision_vendedor_monto', 8, 2)->default(0.00);
            $table->unsignedBigInteger('forma_pago_id');
            $table->decimal('monto_pagado', 10, 2)->default(0.00);
            $table->decimal('monto_pendiente', 10, 2)->default(0.00);
            $table->unsignedBigInteger('estado_pago_id');
            $table->unsignedBigInteger('estado_venta_id');
            $table->text('observaciones_cobra')->nullable();
            $table->date('fecha_limite_pago')->nullable();
            $table->boolean('requiere_factura')->default(0);
            $table->string('datos_facturacion', 255)->nullable();
            $table->text('motivo_cancelacion')->nullable();
            $table->date('fecha_cancelacion')->nullable();
            $table->decimal('costo_combustible', 8, 2)->default(0.00);
            $table->decimal('costo_chofer', 8, 2)->default(0.00);
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();

            // Foreign Keys
            $table->foreign('reserva_id')->references('id')->on('reservas');
            $table->foreign('ruta_ejecutada_id')->references('id')->on('rutas_ejecutadas');
            $table->foreign('cliente_id')->references('id')->on('clientes');
            $table->foreign('agencia_id')->references('id')->on('agencias');
            $table->foreign('empleado_vendedor_id')->references('id')->on('empleados');
            $table->foreign('tipo_venta_id')->references('id')->on('tipos_venta');
            $table->foreign('forma_pago_id')->references('id')->on('formas_pago');
            $table->foreign('estado_pago_id')->references('id')->on('estados_pago');
            $table->foreign('estado_venta_id')->references('id')->on('estados_venta');
        });
    }

    /**
     * Rollback - Eliminar tablas del módulo reservas y ventas
     */
    public function down()
    {
        Schema::dropIfExists('ventas');
        Schema::dropIfExists('rutas_ejecutadas');
        Schema::dropIfExists('reservas');
    }
};
