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
            $table->string('codigo', 10)->unique(); // 'EMP', 'CLI', 'PROV'
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1); // Activo/Inactivo
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes(); // deleted_at timestamp
        });

        // 2. Países
        Schema::create('paises', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_pais', 100);
            $table->string('codigo_iso2', 2)->unique(); // GT, US, MX
            $table->string('codigo_iso3', 3)->unique(); // GTM, USA, MEX
            $table->string('codigo_telefono', 5)->nullable(); // +502, +1
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 3. Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique(); // ADMIN, VENDEDOR, CHOFER
            $table->string('nombre_rol', 100);
            $table->text('descripcion')->nullable();
            $table->text('permisos_json')->nullable(); // TEXT en lugar de JSON para MariaDB
            $table->integer('nivel_jerarquia')->default(1); // 1=más bajo, 10=admin
            $table->boolean('puede_autorizar')->default(0); // Para aprobar descuentos, etc
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 4. Estados de Empleado
        Schema::create('estados_empleado', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // ACT, VAC, SUS, BAJA
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('permite_trabajar')->default(0); // Si puede ser asignado a rutas
            $table->boolean('cuenta_planilla')->default(1); // Si está en nómina activa
            $table->integer('orden')->default(0); // Para ordenar en selects
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 5. Tipos de Cliente
        Schema::create('tipos_cliente', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // IND, CORP, AGEN, VIP
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->decimal('descuento_default', 5, 2)->default(0.00); // % descuento
            $table->boolean('requiere_credito')->default(0); // Si permite pago diferido
            $table->integer('dias_credito')->default(0); // Plazo de pago
            $table->integer('prioridad')->default(1); // Para reservas/asignación
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 6. Tipos de Licencia
        Schema::create('tipos_licencia', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 5)->unique(); // A, B, C, M, E
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 7. Tipos de Vehículo
        Schema::create('tipos_vehiculo', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // BUS, MINIBUS, VAN, SEDAN
            $table->string('nombre_tipo', 100);
            $table->integer('capacidad_estandar')->default(0); // Capacidad típica
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 8. Tipos de Combustible
        Schema::create('tipos_combustible', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // GAS, DIESEL, ELEC, HIB
            $table->string('nombre_combustible', 50);
            $table->string('unidad_medida', 10)->default('GAL'); // GAL, LT
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 9. Estados de Vehículo
        Schema::create('estados_vehiculo', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // DISP, RUTA, MANT, AVER
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('disponible_operacion')->default(0); // Si puede asignarse a rutas
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 10. Tipos de Agencia
        Schema::create('tipos_agencia', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // MAY, MIN, ONL, HOT, TOUR
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 11. Formas de Pago
        Schema::create('formas_pago', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // EFE, TAR, TRANS, CRED
            $table->string('nombre_forma', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('requiere_comprobante')->default(0); // Si necesita doc respaldo
            $table->boolean('genera_credito')->default(0); // Si es pago diferido
            $table->integer('dias_credito')->default(0); // Plazo si es crédito
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 12. Estados Comerciales
        Schema::create('estados_comercial', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // ACT, SUSP, MOR, VIP
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
            $table->string('codigo', 10)->unique(); // ACT, INACT, TEMP, CANC
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('acepta_reservas')->default(1); // Si permite nuevas reservas
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 14. Estados de Reserva
        Schema::create('estados_reserva', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // PEND, CONF, EJEC, FIN, CANC, NOSHOW
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->integer('orden_flujo')->default(0); // 1=Pend, 2=Conf, 3=Ejec, 4=Fin
            $table->boolean('editable')->default(1); // Si permite cambios
            $table->boolean('cuenta_ocupacion')->default(0); // Si ocupa espacio en ruta
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 15. Tipos de Venta
        Schema::create('tipos_venta', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // DIR, AGEN, ONL, SHUT, TOUR, TRANS
            $table->string('nombre_tipo', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('genera_comision')->default(0); // Si aplica comisión
            $table->boolean('requiere_voucher')->default(0); // Si necesita voucher
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 16. Estados de Venta
        Schema::create('estados_venta', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // ACT, CANC, REEMB, ANUL
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('cuenta_ingreso')->default(1); // Si suma a ingresos
            $table->boolean('modificable')->default(1); // Si permite cambios
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });

        // 17. Estados de Pago
        Schema::create('estados_pago', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // PEND, PARC, PAG, VENC, INCOB
            $table->string('nombre_estado', 100);
            $table->text('descripcion')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('requiere_cobro')->default(1); // Si necesita gestión de cobro
            $table->boolean('permite_servicio')->default(1); // Si permite brindar servicio
            $table->boolean('situacion')->default(1);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
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
