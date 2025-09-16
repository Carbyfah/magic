<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN FK AUDITORÍA MAGIC TRAVEL v3.0 - ESTRUCTURA COMPLETA CON NUEVAS TABLAS
     * Agregar FKs de auditoría para nueva estructura v3
     * EXCLUYE tabla usuarios para evitar referencia circular
     * Adaptado a nombres de tabla v3 con nuevas tablas agregadas
     * INCLUYE: caja, egresos_ruta_activa, facturas_sat, usuarios_permisos
     */
    public function up()
    {
        $tables = [
            // Tablas originales
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
            'datos_reservas_clientes',

            // Nuevas tablas agregadas en migración 10
            'usuarios_permisos',
            'caja',
            'egresos_ruta_activa',
            'facturas_sat'
        ];

        foreach ($tables as $table) {
            // Verificar que la tabla existe antes de agregar FK
            $tableExists = DB::select("SHOW TABLES LIKE '{$table}'");

            if (!empty($tableExists)) {
                // Verificar que el campo created_by existe
                $columnExists = DB::select("SHOW COLUMNS FROM {$table} LIKE 'created_by'");

                if (!empty($columnExists)) {
                    try {
                        // Verificar si la FK ya existe
                        $fkExists = DB::select("
                            SELECT COUNT(*) as count
                            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                            WHERE TABLE_NAME = '{$table}'
                            AND CONSTRAINT_NAME = 'fk_{$table}_created_by'
                            AND TABLE_SCHEMA = DATABASE()
                        ");

                        if ($fkExists[0]->count == 0) {
                            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT fk_{$table}_created_by
                                        FOREIGN KEY (created_by) REFERENCES usuarios(id_usuarios) ON DELETE SET NULL");
                            echo "FK created_by agregada a tabla {$table}\n";
                        } else {
                            echo "FK created_by ya existe en tabla {$table}, saltando...\n";
                        }
                    } catch (\Exception $e) {
                        echo "Error agregando FK created_by a {$table}: " . $e->getMessage() . "\n";
                    }
                } else {
                    echo "Campo created_by no existe en tabla {$table}, saltando...\n";
                }

                // Verificar que el campo updated_by existe (aunque no está en la estructura actual)
                $updatedByExists = DB::select("SHOW COLUMNS FROM {$table} LIKE 'updated_by'");

                if (!empty($updatedByExists)) {
                    try {
                        // Verificar si la FK ya existe
                        $fkExists = DB::select("
                            SELECT COUNT(*) as count
                            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                            WHERE TABLE_NAME = '{$table}'
                            AND CONSTRAINT_NAME = 'fk_{$table}_updated_by'
                            AND TABLE_SCHEMA = DATABASE()
                        ");

                        if ($fkExists[0]->count == 0) {
                            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT fk_{$table}_updated_by
                                        FOREIGN KEY (updated_by) REFERENCES usuarios(id_usuarios) ON DELETE SET NULL");
                            echo "FK updated_by agregada a tabla {$table}\n";
                        } else {
                            echo "FK updated_by ya existe en tabla {$table}, saltando...\n";
                        }
                    } catch (\Exception $e) {
                        echo "Error agregando FK updated_by a {$table}: " . $e->getMessage() . "\n";
                    }
                } else {
                    echo "Campo updated_by no existe en tabla {$table}, saltando...\n";
                }
            } else {
                echo "Tabla {$table} no existe, saltando...\n";
            }
        }

        echo "\n=== RESUMEN FK AUDITORÍA COMPLETADO ===\n";
        echo "- Se procesaron " . count($tables) . " tablas\n";
        echo "- Se agregaron FKs para campos created_by donde existían\n";
        echo "- Se respetaron las FKs existentes\n";
        echo "- Tabla 'usuarios' excluida para evitar referencia circular\n";
        echo "=========================================\n";
    }

    /**
     * Rollback - Eliminar FKs de auditoría
     */
    public function down()
    {
        $tables = [
            // Tablas originales
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
            'datos_reservas_clientes',

            // Nuevas tablas agregadas
            'usuarios_permisos',
            'caja',
            'egresos_ruta_activa',
            'facturas_sat'
        ];

        foreach ($tables as $table) {
            // Verificar que la tabla existe antes de eliminar FK
            $tableExists = DB::select("SHOW TABLES LIKE '{$table}'");

            if (!empty($tableExists)) {
                try {
                    // Intentar eliminar FK created_by si existe
                    $fkExists = DB::select("
                        SELECT COUNT(*) as count
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                        WHERE TABLE_NAME = '{$table}'
                        AND CONSTRAINT_NAME = 'fk_{$table}_created_by'
                        AND TABLE_SCHEMA = DATABASE()
                    ");

                    if ($fkExists[0]->count > 0) {
                        DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY fk_{$table}_created_by");
                        echo "FK created_by eliminada de tabla {$table}\n";
                    } else {
                        echo "FK created_by no existe en tabla {$table}, saltando...\n";
                    }
                } catch (\Exception $e) {
                    echo "Error eliminando FK created_by de {$table}: " . $e->getMessage() . "\n";
                }

                try {
                    // Intentar eliminar FK updated_by si existe
                    $fkExists = DB::select("
                        SELECT COUNT(*) as count
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                        WHERE TABLE_NAME = '{$table}'
                        AND CONSTRAINT_NAME = 'fk_{$table}_updated_by'
                        AND TABLE_SCHEMA = DATABASE()
                    ");

                    if ($fkExists[0]->count > 0) {
                        DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY fk_{$table}_updated_by");
                        echo "FK updated_by eliminada de tabla {$table}\n";
                    } else {
                        echo "FK updated_by no existe en tabla {$table}, saltando...\n";
                    }
                } catch (\Exception $e) {
                    echo "Error eliminando FK updated_by de {$table}: " . $e->getMessage() . "\n";
                }
            } else {
                echo "Tabla {$table} no existe, saltando...\n";
            }
        }

        echo "\n=== ROLLBACK FK AUDITORÍA COMPLETADO ===\n";
        echo "- Se procesaron " . count($tables) . " tablas\n";
        echo "- Se eliminaron FKs de auditoría donde existían\n";
        echo "==========================================\n";
    }
};
