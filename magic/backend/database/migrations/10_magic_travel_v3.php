<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN MAGIC TRAVEL v4.0 - SISTEMA MODULAR DE SERVICIOS
     * Estructura modular tipo "menú de restaurante"
     * Máxima flexibilidad para combinación de servicios
     * Precios dinámicos por agencia y temporada
     * Mantiene toda la lógica de negocio de Magic Travel
     */
    public function up()
    {
        // =====================================================
        // NIVEL 1: TABLAS INDEPENDIENTES (Sin cambios)
        // =====================================================

        // 1. Agencias (SIN CAMBIOS)
        Schema::create('agencias', function (Blueprint $table) {
            $table->id('id_agencias');
            $table->string('agencias_nombre', 45);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // 2. Estado (SIN CAMBIOS)
        Schema::create('estado', function (Blueprint $table) {
            $table->id('estado_id');
            $table->string('estado_nombre', 45);
            $table->string('estado_descripcion', 45)->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // 3. Cargo (SIN CAMBIOS)
        Schema::create('cargo', function (Blueprint $table) {
            $table->id('id_cargo');
            $table->string('cargo_nombre', 45)->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // 4. Rutas (SIN CAMBIOS)
        Schema::create('rutas', function (Blueprint $table) {
            $table->id('id_rutas');
            $table->string('rutas_origen', 45);
            $table->string('rutas_destino', 45);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // 5. Tours (SIN CAMBIOS)
        Schema::create('tours', function (Blueprint $table) {
            $table->id('id_tours');
            $table->string('tours_nombre', 45);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // =====================================================
        // NIVEL 2: TABLAS INTERMEDIAS (Con tablas pivote)
        // =====================================================

        // 6. Agencias_Rutas (SIN CAMBIOS)
        Schema::create('agencias_rutas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_rutas');

            $table->foreign('id_agencias')->references('id_agencias')->on('agencias')->onDelete('cascade');
            $table->foreign('id_rutas')->references('id_rutas')->on('rutas')->onDelete('cascade');

            $table->primary(['id_agencias', 'id_rutas']);
        });

        // 7. Agencias_Tours (SIN CAMBIOS)
        Schema::create('agencias_tours', function (Blueprint $table) {
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_tours');

            $table->foreign('id_agencias')->references('id_agencias')->on('agencias')->onDelete('cascade');
            $table->foreign('id_tours')->references('id_tours')->on('tours')->onDelete('cascade');

            $table->primary(['id_agencias', 'id_tours']);
        });

        // 8. Vehículo (SIN CAMBIOS)
        Schema::create('vehiculo', function (Blueprint $table) {
            $table->id('id_vehiculo');
            $table->string('vehiculo_marca', 45)->nullable();
            $table->string('vehiculo_placa', 45)->nullable();
            $table->integer('vehiculo_capacidad')->nullable();
            $table->decimal('vehiculo_pago_conductor', 10, 2)->nullable();
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_agencias');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_agencias')->references('id_agencias')->on('agencias');
        });

        // 9. Empleados (SIN CAMBIOS)
        Schema::create('empleados', function (Blueprint $table) {
            $table->id('id_empleados');
            $table->string('empleados_nombres', 45);
            $table->string('empleados_apellidos', 45);
            $table->string('empleados_dpi', 45)->nullable();
            $table->unsignedBigInteger('id_agencias');
            $table->unsignedBigInteger('id_cargo');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_agencias')->references('id_agencias')->on('agencias');
            $table->foreign('id_cargo')->references('id_cargo')->on('cargo');
        });

        // =====================================================
        // NIVEL 3: TABLAS DEPENDIENTES (Con cambios importantes)
        // =====================================================

        // 10. Usuarios (SIN CAMBIOS)
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuarios');
            $table->string('usuarios_nombre', 45)->nullable();
            $table->string('usuarios_correo', 100)->unique()->nullable();
            $table->string('usuario_password', 500);
            $table->dateTime('ultima_sesion')->nullable();
            $table->unsignedBigInteger('id_empleados');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_empleados')->references('id_empleados')->on('empleados');
        });

        // 11. Usuarios Permisos (ACTUALIZADO - Con permisos de exportación)
        Schema::create('usuarios_permisos', function (Blueprint $table) {
            $table->id('id_usuarios_permisos');
            $table->unsignedBigInteger('id_usuarios');
            $table->string('modulo', 50);
            $table->boolean('puede_ver')->default(false);
            $table->boolean('puede_crear')->default(false);
            $table->boolean('puede_editar')->default(false);
            $table->boolean('puede_eliminar')->default(false);
            $table->boolean('puede_exportar_excel')->default(false);
            $table->boolean('puede_exportar_pdf')->default(false);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_usuarios')->references('id_usuarios')->on('usuarios')
                ->onDelete('cascade');

            $table->unique(['id_usuarios', 'modulo'], 'unique_usuario_modulo');
        });

        // 12. Ruta Activa (SIN CAMBIOS)
        Schema::create('ruta_activa', function (Blueprint $table) {
            $table->id('id_ruta_activa');
            $table->dateTime('ruta_activa_fecha');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_rutas');
            $table->unsignedBigInteger('id_vehiculo');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_rutas')->references('id_rutas')->on('rutas');
            $table->foreign('id_vehiculo')->references('id_vehiculo')->on('vehiculo');
        });

        // 13. Tour Activo (SIN CAMBIOS)
        Schema::create('tour_activo', function (Blueprint $table) {
            $table->id('id_tour_activo');
            $table->dateTime('tour_activo_fecha');
            $table->string('tour_activo_tipo', 45);
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('id_tours');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_tours')->references('id_tours')->on('tours');
        });

        // =====================================================
        // NIVEL 4: NUEVAS TABLAS MODULARES v4.0
        // =====================================================

        // 14. Tipos de Servicio (NUEVA - Catálogo de tipos)
        Schema::create('tipos_servicio', function (Blueprint $table) {
            $table->id('id_tipo_servicio');
            $table->string('nombre_tipo', 50); // Ejemplo: "Transporte", "Tour"
            $table->string('descripcion_tipo', 200)->nullable(); // Transporte de pasajeros
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
        });

        // 15. Catálogo de Servicios (NUEVA - El "menú")
        Schema::create('servicios_catalogo', function (Blueprint $table) {
            $table->id('id_servicio_catalogo');
            $table->unsignedBigInteger('id_tipo_servicio'); // 1 = Transporte
            $table->string('nombre_servicio', 100); // Ejemplo: "Transporte", "Tour Ciudad"
            $table->enum('modalidad_servicio', ['COLECTIVO', 'PRIVADO'])->default('COLECTIVO');
            $table->text('descripcion')->nullable(); //Transporte de Antigua a Panajachel
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_tipo_servicio')->references('id_tipo_servicio')->on('tipos_servicio');
        });

        // 16. Precios por Agencia (NUEVA - Cada agencia sus precios)
        Schema::create('agencias_servicios_precios', function (Blueprint $table) {
            $table->id('id_precio');
            $table->unsignedBigInteger('id_agencias'); // magic travel
            $table->unsignedBigInteger('id_servicio_catalogo'); // Transporte Antigua - Panajachel
            $table->decimal('precio_adulto', 10, 2); // 150.00
            $table->decimal('precio_nino', 10, 2); // 100.00
            $table->integer('descuento_porcentaje')->default(0); // 10 = 10%
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_agencias')->references('id_agencias')->on('agencias');
            $table->foreign('id_servicio_catalogo')->references('id_servicio_catalogo')->on('servicios_catalogo');

            $table->index(['id_agencias', 'id_servicio_catalogo', 'activo'], 'idx_agencia_servicio_activo');
        });

        // 17. Reservas MODIFICADAS (IMPORTANTE - Simplificadas)
        Schema::create('reservas', function (Blueprint $table) {
            $table->id('id_reservas');
            $table->string('reservas_nombres_cliente', 45); // Nombre del cliente principal
            $table->string('reservas_apellidos_cliente', 45); // Apellido del cliente principal
            $table->string('reservas_direccion_abordaje', 45); // Dirección donde se le recoge
            $table->string('reservas_telefono_cliente', 45); // Teléfono de contacto
            $table->string('reservas_cliente_nit', 45)->nullable(); // NIT para factura
            $table->string('reservas_habitacion_pax', 45)->nullable(); // Habitación / Pax
            $table->string('reservas_transferido_por', 30); // Nombre de quien transfiere

            // NUEVOS CAMPOS v4.0:
            $table->dateTime('fecha_servicio'); // Fecha y hora del servicio
            $table->text('observaciones_generales')->nullable(); // Observaciones generales

            // CONTROL DE ESCENARIOS MAGIC TRAVEL:
            $table->enum('escenario_reserva', [
                'VENTA_DIRECTA',
                'REUBICACION_INTERNA',
                'MAGIC_TRANSFIERE',
                'MAGIC_RECIBE_OPERA',
                'MAGIC_RECIBE_TRANSFIERE'
            ]); // Tipo de reserva según escenario
            $table->unsignedBigInteger('agencia_origen')->nullable(); // Cuando agencia transfiere reserva
            // agencia_origen es NULL si es venta directa o reubicación interna

            // RELACIONES:
            $table->unsignedBigInteger('id_agencia_transferida')->nullable(); // Agencia que recibe y opera la reserva
            $table->unsignedBigInteger('estado_id'); // Estado de la reserva
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('estado_id')->references('estado_id')->on('estado');
            $table->foreign('id_agencia_transferida')->references('id_agencias')->on('agencias');
            $table->foreign('agencia_origen')->references('id_agencias')->on('agencias')->onDelete('set null');
            $table->index(['escenario_reserva', 'fecha_servicio'], 'idx_escenario_fecha');
            $table->index(['agencia_origen', 'estado_id'], 'idx_origen_estado');
        });

        // 17.1 Vouchers Sistema (NUEVA - Códigos inmutables)
        Schema::create('vouchers_sistema', function (Blueprint $table) {
            $table->id('id_voucher');
            $table->string('codigo_voucher', 50)->unique();
            $table->unsignedBigInteger('id_reservas');
            $table->dateTime('fecha_generacion');
            $table->boolean('es_valido')->default(true);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_reservas')->references('id_reservas')->on('reservas');
        });

        // 18. Detalle de Servicios por Reserva (NUEVA - Los "platos" de cada orden: analogia restaurante)
        Schema::create('reservas_servicios_detalle', function (Blueprint $table) {
            $table->id('id_detalle');
            $table->unsignedBigInteger('id_reservas'); // Relación con la reserva
            $table->unsignedBigInteger('id_servicio_catalogo'); // Tipo de servicio reservado

            // OPCIONALES según tipo de servicio:
            $table->unsignedBigInteger('id_ruta_activa')->nullable();
            $table->unsignedBigInteger('id_tour_activo')->nullable();

            // CANTIDAD Y PRECIOS:
            $table->integer('cantidad_adultos')->default(0);
            $table->integer('cantidad_ninos')->default(0);
            $table->decimal('precio_unitario_adulto', 10, 2);
            $table->decimal('precio_unitario_nino', 10, 2);
            $table->integer('descuento_aplicado')->default(0);

            // CONTROL OPERACIONAL:
            $table->unsignedBigInteger('agencia_operadora');
            $table->decimal('monto_cobrar_conductor', 10, 2)->nullable();
            $table->enum('estado_pago', ['PENDIENTE', 'PAGADO_CAJA', 'PAGADO_CONDUCTOR', 'CONFIRMAR_RECIBIDO'])->default('PENDIENTE');

            // CONTROL FINANCIERO:
            $table->decimal('precio_venta_cliente', 10, 2);
            $table->decimal('precio_compra_agencia', 10, 2)->nullable();
            $table->decimal('comision_monto', 10, 2)->default(0);
            $table->decimal('comision_porcentaje', 5, 2)->default(0);

            // CONTROL DE SEGMENTOS:
            $table->integer('segmento_orden')->default(1);
            $table->string('punto_origen', 100)->nullable();
            $table->string('punto_destino', 100)->nullable();
            $table->boolean('es_conexion')->default(false);

            // METADATOS:
            $table->text('observaciones')->nullable();
            $table->integer('orden_servicio')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_reservas')->references('id_reservas')->on('reservas')->onDelete('cascade');
            $table->foreign('id_servicio_catalogo')->references('id_servicio_catalogo')->on('servicios_catalogo');
            $table->foreign('id_ruta_activa')->references('id_ruta_activa')->on('ruta_activa');
            $table->foreign('id_tour_activo')->references('id_tour_activo')->on('tour_activo');
            $table->foreign('agencia_operadora')->references('id_agencias')->on('agencias');

            $table->index(['id_reservas', 'orden_servicio'], 'idx_reserva_orden');
            $table->index(['agencia_operadora', 'estado_pago'], 'idx_operadora_pago');
            $table->index(['id_ruta_activa', 'segmento_orden'], 'idx_ruta_segmento');
        });

        // 19. Datos Reservas Clientes (SIN CAMBIOS)
        Schema::create('datos_reservas_clientes', function (Blueprint $table) {
            $table->id('id_datos_reservas_clientes');
            $table->string('datos_reservas_clientes_nombres', 45)->nullable();
            $table->string('datos_reservas_clientes_apellidos', 45)->nullable();
            $table->unsignedBigInteger('id_reservas');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_reservas')->references('id_reservas')->on('reservas');
        });

        // =====================================================
        // NIVEL 5: MÓDULOS VENTAS Y CONTABILIDAD (Adaptados)
        // =====================================================

        // 20. Egresos Ruta Activa (SIN CAMBIOS)
        Schema::create('egresos_ruta_activa', function (Blueprint $table) {
            $table->id('id_egresos_ruta_activa');
            $table->text('motivo_egreso');
            $table->decimal('cantidad_egreso', 10, 2);
            $table->text('descripcion_egreso')->nullable();
            $table->unsignedBigInteger('id_ruta_activa');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_ruta_activa')->references('id_ruta_activa')->on('ruta_activa');
        });

        // 21. Caja (ADAPTADA - Se relaciona con reservas directamente)
        Schema::create('caja', function (Blueprint $table) {
            $table->id('id_caja');
            $table->string('numero_voucher', 50)->nullable();
            $table->string('origen', 100);
            $table->string('destino', 100);
            $table->dateTime('fecha_servicio');
            $table->integer('pax_adultos');
            $table->integer('pax_ninos')->nullable();
            $table->integer('total_pax');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('precio_total', 10, 2);
            $table->string('direccion', 200);
            $table->decimal('servicio_cobrar_pax', 10, 2);
            $table->decimal('servicio_precio_descuento', 10, 2);
            $table->string('voucher_caja', 50)->nullable();
            $table->string('enlace_sat', 500)->nullable();
            $table->unsignedBigInteger('id_reservas');
            $table->unsignedBigInteger('estado_id');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_reservas')->references('id_reservas')->on('reservas');
            $table->foreign('estado_id')->references('estado_id')->on('estado');
        });

        // 22. Facturas SAT (SIN CAMBIOS)
        Schema::create('facturas_sat', function (Blueprint $table) {
            $table->id('id_facturas_sat');
            $table->string('numero_documento', 50);
            $table->decimal('gran_total', 10, 2);
            $table->string('serie', 50)->nullable();
            $table->string('numero_uuid', 100)->nullable();
            $table->datetime('fecha_emision')->nullable();
            $table->string('nit_receptor', 20)->nullable();
            $table->string('nombre_receptor', 200)->nullable();
            $table->text('enlace_consulta')->nullable();
            $table->json('datos_completos')->nullable();
            $table->unsignedBigInteger('id_caja');
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();

            $table->foreign('id_caja')->references('id_caja')->on('caja');
        });

        // =====================================================
        // CONSTRAINTS ADICIONALES v4.0
        // =====================================================

        // Constraint: Reserva debe tener al menos un servicio (validado en backend)

        // Constraint: Escenarios válidos para reservas
        DB::statement("ALTER TABLE reservas ADD CONSTRAINT chk_escenario_valido CHECK (
            escenario_reserva IN ('VENTA_DIRECTA', 'REUBICACION_INTERNA', 'MAGIC_TRANSFIERE', 'MAGIC_RECIBE_OPERA', 'MAGIC_RECIBE_TRANSFIERE')
        )");

        // Constraint: Estados de pago válidos
        DB::statement("ALTER TABLE reservas_servicios_detalle ADD CONSTRAINT chk_estado_pago_valido CHECK (
            estado_pago IN ('PENDIENTE', 'PAGADO_CAJA', 'PAGADO_CONDUCTOR', 'CONFIRMAR_RECIBIDO')
        )");

        // Constraint: Comisión porcentaje entre 0 y 100
        DB::statement('ALTER TABLE reservas_servicios_detalle ADD CONSTRAINT chk_comision_porcentaje CHECK (
            comision_porcentaje >= 0 AND comision_porcentaje <= 100
        )');

        // Constraint: Orden de segmentos debe ser positivo
        DB::statement('ALTER TABLE reservas_servicios_detalle ADD CONSTRAINT chk_segmento_orden CHECK (
            segmento_orden > 0
        )');

        // Constraint: Precio venta debe ser mayor o igual que precio compra
        DB::statement('ALTER TABLE reservas_servicios_detalle ADD CONSTRAINT chk_precio_venta_compra CHECK (
            precio_venta_cliente >= IFNULL(precio_compra_agencia, 0)
        )');

        // Constraint: Cantidad de adultos/niños no negativas
        // DB::statement('ALTER TABLE reservas ADD CONSTRAINT chk_reservas_totales CHECK (
        //     total_adultos >= 0 AND (total_ninos IS NULL OR total_ninos >= 0)
        // )');

        DB::statement('ALTER TABLE reservas_servicios_detalle ADD CONSTRAINT chk_detalle_cantidades CHECK (
            cantidad_adultos >= 0 AND cantidad_ninos >= 0
        )');

        // Constraint: Detalle debe tener ruta O tour según tipo de servicio (validado en backend)

        // Constraint: Egreso debe ser positivo
        DB::statement('ALTER TABLE egresos_ruta_activa ADD CONSTRAINT chk_egreso_positivo CHECK (
            cantidad_egreso > 0
        )');

        // Constraint: Total pax debe coincidir con suma de adultos y niños
        DB::statement('ALTER TABLE caja ADD CONSTRAINT chk_caja_total_pax CHECK (
            total_pax = pax_adultos + IFNULL(pax_ninos, 0)
        )');

        // =====================================================
        // DATOS INICIALES DEL CATÁLOGO v4.0 - REMOVIDOS
        // =====================================================

        // NOTA: Los datos iniciales se crearán mediante seeders separados
        // No se incluyen inserts en la migración
    }

    /**
     * Rollback - Eliminar en orden inverso
     */
    public function down()
    {
        Schema::dropIfExists('facturas_sat');
        Schema::dropIfExists('caja');
        Schema::dropIfExists('egresos_ruta_activa');
        Schema::dropIfExists('datos_reservas_clientes');
        Schema::dropIfExists('reservas_servicios_detalle');
        Schema::dropIfExists('reservas');
        Schema::dropIfExists('agencias_servicios_precios');
        Schema::dropIfExists('servicios_catalogo');
        Schema::dropIfExists('tipos_servicio');
        Schema::dropIfExists('tour_activo');
        Schema::dropIfExists('ruta_activa');
        Schema::dropIfExists('usuarios_permisos');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('empleados');
        Schema::dropIfExists('vehiculo');
        Schema::dropIfExists('agencias_tours');
        Schema::dropIfExists('agencias_rutas');
        Schema::dropIfExists('tours');
        Schema::dropIfExists('rutas');
        Schema::dropIfExists('cargo');
        Schema::dropIfExists('estado');
        Schema::dropIfExists('agencias');
    }
};
