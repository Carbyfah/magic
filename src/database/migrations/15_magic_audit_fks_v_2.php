<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN FK AUDITORÍA MAGIC TRAVEL v3.0 - LIMPIA
     * Agregar FKs de auditoría sin tabla facturas
     * EXCLUYE tabla usuario para evitar referencia circular
     * CON SOPORTE PARA TOURS
     */
    public function up()
    {
        $tables = [
            'tipo_persona',
            'rol',
            'estado',
            'servicio',
            'ruta',
            'agencia',
            'persona',
            'vehiculo',
            'contactos_agencia',
            // 'usuario', - EXCLUIDO: no puede tener FK hacia sí mismo
            'ruta_activada',
            'reserva',
            'tour_activado'
        ];

        foreach ($tables as $table) {
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT fk_{$table}_created_by
                          FOREIGN KEY (created_by) REFERENCES usuario(usuario_id) ON DELETE SET NULL");

            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT fk_{$table}_updated_by
                          FOREIGN KEY (updated_by) REFERENCES usuario(usuario_id) ON DELETE SET NULL");
        }
    }

    public function down()
    {
        $tables = [
            'tipo_persona',
            'rol',
            'estado',
            'servicio',
            'ruta',
            'agencia',
            'persona',
            'vehiculo',
            'contactos_agencia',
            // 'usuario', - EXCLUIDO
            'ruta_activada',
            'reserva',
            'tour_activado'
        ];

        foreach ($tables as $table) {
            DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY IF EXISTS fk_{$table}_created_by");
            DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY IF EXISTS fk_{$table}_updated_by");
        }
    }
};
