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
            $table->unsignedBigInteger('empleado_id'); // Quien toma la reserva
            $table->unsignedBigInteger('ruta_id'); // CRÍTICO: Qué servicio reservan

            // Pasajeros
            $table->integer('pax_adultos')->default(0);
            $table->integer('pax_ninos')->default(0);
            $table->integer('pax_total')->storedAs('pax_adultos + pax_ninos');

            // Cliente (B2C o B2B)
            $table->string('nombre_pasajero_principal', 255); // Nombre del lead passenger
            $table->unsignedBigInteger('cliente_id')->nullable(); // Si es cliente registrado
            $table->unsignedBigInteger('agencia_id')->nullable(); // Si viene de agencia

            // Pickup info
            $table->string('hotel_pickup', 255)->nullable();
            $table->string('telefono_contacto', 20)->nullable();
            $table->text('notas_pickup')->nullable(); // Instrucciones especiales

            // Fechas y voucher
            $table->date('fecha_reservacion');
            $table->date('fecha_viaje');
            $table->time('hora_pickup')->nullable(); // Hora específica de recogida
            $table->string('voucher', 100)->nullable(); // Número de voucher agencia

            // Financiero
            $table->decimal('precio_total', 10, 2)->default(0.00);
            $table->string('responsable_pago', 255)->nullable(); // "Agencia X" o "Cliente directo"

            $table->unsignedBigInteger('estado_reserva_id');
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            // Foreign Keys
            $table->foreign('empleado_id')->references('id')->on('empleados');
            $table->foreign('ruta_id')->references('id')->on('rutas'); // CRÍTICO
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
            $table->unsignedBigInteger('chofer_apoyo_id')->nullable(); // Auxiliar/guía

            // Fechas y tiempos
            $table->date('fecha_operacion'); // Fecha real de operación
            $table->time('hora_salida_programada');
            $table->time('hora_salida_real')->nullable();
            $table->time('hora_llegada_real')->nullable();

            // Control de pasajeros
            $table->integer('capacidad_vehiculo'); // Capacidad real del vehículo asignado
            $table->integer('asientos_reservados')->default(0); // Total reservaciones
            $table->integer('pasajeros_abordaron')->default(0);
            $table->integer('pasajeros_no_show')->default(0);

            // Control operativo
            $table->decimal('combustible_inicial', 8, 2)->nullable();
            $table->decimal('combustible_final', 8, 2)->nullable();
            $table->decimal('combustible_consumido', 8, 2)->nullable()->storedAs('combustible_inicial - combustible_final');
            $table->integer('kilometraje_inicial')->nullable();
            $table->integer('kilometraje_final')->nullable();
            $table->integer('kilometros_recorridos')->nullable()->storedAs('kilometraje_final - kilometraje_inicial');

            // Costos operativos
            $table->decimal('costo_combustible', 10, 2)->default(0.00);
            $table->decimal('costo_chofer', 10, 2)->default(0.00);
            $table->decimal('costo_peajes', 10, 2)->default(0.00);

            $table->enum('estado', ['programada', 'en_ruta', 'completada', 'cancelada'])->default('programada');
            $table->text('observaciones')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            // Foreign Keys
            $table->foreign('ruta_id')->references('id')->on('rutas');
            $table->foreign('vehiculo_id')->references('id')->on('vehiculos');
            $table->foreign('chofer_id')->references('id')->on('empleados');
            $table->foreign('chofer_apoyo_id')->references('id')->on('empleados');
        });

        // 27. Ventas
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_venta', 50)->unique();
            $table->unsignedBigInteger('reserva_id')->unique(); // Una venta por reserva

            // Quien compra
            $table->unsignedBigInteger('cliente_id')->nullable();
            $table->unsignedBigInteger('agencia_id')->nullable();
            $table->unsignedBigInteger('empleado_vendedor_id');

            // Cuándo
            $table->datetime('fecha_hora_venta');
            $table->unsignedBigInteger('tipo_venta_id');

            // Montos
            $table->integer('cantidad_adultos')->default(0);
            $table->integer('cantidad_ninos')->default(0);
            $table->decimal('precio_unitario_adulto', 10, 2);
            $table->decimal('precio_unitario_nino', 10, 2)->default(0.00);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('descuento_monto', 10, 2)->default(0.00);
            $table->decimal('impuesto_monto', 10, 2)->default(0.00);
            $table->decimal('total_venta', 10, 2);

            // Comisiones
            $table->decimal('comision_agencia', 10, 2)->default(0.00);
            $table->decimal('comision_vendedor', 10, 2)->default(0.00);

            // Estados
            $table->unsignedBigInteger('estado_venta_id');
            $table->text('notas')->nullable();

            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();

            // Foreign Keys
            $table->foreign('reserva_id')->references('id')->on('reservas');
            $table->foreign('cliente_id')->references('id')->on('clientes');
            $table->foreign('agencia_id')->references('id')->on('agencias');
            $table->foreign('empleado_vendedor_id')->references('id')->on('empleados');
            $table->foreign('tipo_venta_id')->references('id')->on('tipos_venta');
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
