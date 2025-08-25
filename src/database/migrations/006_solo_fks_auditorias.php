<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN 006: FOREIGN KEYS DE AUDITORÍA
     * Agrega las FKs created_by y updated_by a TODAS las tablas
     * Se ejecuta AL FINAL para evitar referencias circulares
     */
    public function up()
    {
        $tables = [
            // Catálogos
            'tipos_persona',
            'paises',
            'roles',
            'estados_empleado',
            'tipos_cliente',
            'tipos_licencia',
            'tipos_vehiculo',
            'tipos_combustible',
            'estados_vehiculo',
            'tipos_agencia',
            'formas_pago',
            'estados_comercial',
            'estados_ruta',
            'estados_reserva',
            'tipos_venta',
            'estados_venta',
            'estados_pago',
            'estados_ejecucion',
            // Personas
            'personas',
            'empleados',
            'clientes',
            'choferes_detalle',
            // Operaciones
            'vehiculos',
            'agencias',
            'rutas',
            // Reservas y Ventas
            'reservas',
            'rutas_ejecutadas',
            'ventas',
            'reservas_rutas_ejecutadas',
            'pagos'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    // Solo si las columnas existen
                    if (Schema::hasColumn($tableName, 'created_by')) {
                        $table->foreign('created_by')
                            ->references('id')
                            ->on('empleados')
                            ->nullOnDelete();
                    }

                    if (Schema::hasColumn($tableName, 'updated_by')) {
                        $table->foreign('updated_by')
                            ->references('id')
                            ->on('empleados')
                            ->nullOnDelete();
                    }
                });
            }
        }
    }

    public function down()
    {
        // Lista de tablas para eliminar FKs
        $tables = [
            'tipos_persona',
            'paises',
            'roles',
            'estados_empleado',
            'tipos_cliente',
            'tipos_licencia',
            'tipos_vehiculo',
            'tipos_combustible',
            'estados_vehiculo',
            'tipos_agencia',
            'formas_pago',
            'estados_comercial',
            'estados_ruta',
            'estados_reserva',
            'tipos_venta',
            'estados_venta',
            'estados_pago',
            'estados_ejecucion',
            'personas',
            'empleados',
            'clientes',
            'choferes_detalle',
            'vehiculos',
            'agencias',
            'rutas',
            'reservas',
            'rutas_ejecutadas',
            'ventas',
            'reservas_rutas_ejecutadas',
            'pagos'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    try {
                        if (Schema::hasColumn($tableName, 'created_by')) {
                            $table->dropForeign(['created_by']);
                        }
                        if (Schema::hasColumn($tableName, 'updated_by')) {
                            $table->dropForeign(['updated_by']);
                        }
                    } catch (\Exception $e) {
                        // Continuar si no existe
                    }
                });
            }
        }
    }
};
