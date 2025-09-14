<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN FK AUDITORÍA MAGIC TRAVEL v3.0 - ESTRUCTURA NUEVA
     * Agregar FKs de auditoría para nueva estructura v3
     * EXCLUYE tabla usuarios para evitar referencia circular
     * Adaptado a nombres de tabla v3
     */
    public function up()
    {
        $tables = [
            'agencias',
            'estado',
            'cargo',
            'rutas',
            'tours',
            'vehiculo',
            'empleados',
            // 'usuarios', - EXCLUIDO: no puede tener FK hacia sí mismo
            'ruta_activa',
            'tour_activo',
            'servicio',
            'reservas',
            'datos_reservas_clientes'
        ];

        foreach ($tables as $table) {
            // Verificar que la tabla existe antes de agregar FK
            $tableExists = DB::select("SHOW TABLES LIKE '{$table}'");

            if (!empty($tableExists)) {
                // Verificar que el campo created_by existe
                $columnExists = DB::select("SHOW COLUMNS FROM {$table} LIKE 'created_by'");

                if (!empty($columnExists)) {
                    try {
                        DB::statement("ALTER TABLE {$table} ADD CONSTRAINT fk_{$table}_created_by
                                    FOREIGN KEY (created_by) REFERENCES usuarios(id_usuarios) ON DELETE SET NULL");
                        echo "FK created_by agregada a tabla {$table}\n";
                    } catch (\Exception $e) {
                        echo "Error agregando FK created_by a {$table}: " . $e->getMessage() . "\n";
                    }
                }

                // Verificar que el campo updated_by existe (aunque no está en la estructura actual)
                $updatedByExists = DB::select("SHOW COLUMNS FROM {$table} LIKE 'updated_by'");

                if (!empty($updatedByExists)) {
                    try {
                        DB::statement("ALTER TABLE {$table} ADD CONSTRAINT fk_{$table}_updated_by
                                    FOREIGN KEY (updated_by) REFERENCES usuarios(id_usuarios) ON DELETE SET NULL");
                        echo "FK updated_by agregada a tabla {$table}\n";
                    } catch (\Exception $e) {
                        echo "Error agregando FK updated_by a {$table}: " . $e->getMessage() . "\n";
                    }
                }
            } else {
                echo "Tabla {$table} no existe, saltando...\n";
            }
        }
    }

    /**
     * Rollback - Eliminar FKs de auditoría
     */
    public function down()
    {
        $tables = [
            'agencias',
            'estado',
            'cargo',
            'rutas',
            'tours',
            'vehiculo',
            'empleados',
            // 'usuarios', - EXCLUIDO
            'ruta_activa',
            'tour_activo',
            'servicio',
            'reservas',
            'datos_reservas_clientes'
        ];

        foreach ($tables as $table) {
            // Verificar que la tabla existe antes de eliminar FK
            $tableExists = DB::select("SHOW TABLES LIKE '{$table}'");

            if (!empty($tableExists)) {
                try {
                    DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY IF EXISTS fk_{$table}_created_by");
                    echo "FK created_by eliminada de tabla {$table}\n";
                } catch (\Exception $e) {
                    echo "Error eliminando FK created_by de {$table}: " . $e->getMessage() . "\n";
                }

                try {
                    DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY IF EXISTS fk_{$table}_updated_by");
                    echo "FK updated_by eliminada de tabla {$table}\n";
                } catch (\Exception $e) {
                    echo "Error eliminando FK updated_by de {$table}: " . $e->getMessage() . "\n";
                }
            } else {
                echo "Tabla {$table} no existe, saltando...\n";
            }
        }
    }
};
