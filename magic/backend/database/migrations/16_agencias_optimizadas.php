<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * OPTIMIZACIÓN ESPECÍFICA PARA TABLA AGENCIAS
     * Enfocado en rendimiento para Magic Travel
     * Vista optimizada + índices específicos para consultas reales
     */
    public function up()
    {
        // =====================================================
        // VISTA OPTIMIZADA PARA LISTA DE AGENCIAS (SIN ESTADÍSTICAS)
        // =====================================================

        DB::statement("
            CREATE VIEW agencias_lista AS
            SELECT
                id_agencias,
                agencias_nombre,
                CASE
                    WHEN agencias_nombre = 'Magic Travel' THEN 'Principal'
                    ELSE 'Operativa'
                END as tipo_agencia,
                CASE
                    WHEN deleted_at IS NULL THEN 'Activa'
                    ELSE 'Inactiva'
                END as estado_simple,
                created_at,
                updated_at,
                deleted_at
            FROM agencias
            WHERE deleted_at IS NULL
            ORDER BY
                CASE WHEN agencias_nombre = 'Magic Travel' THEN 0 ELSE 1 END,
                agencias_nombre ASC
        ");

        // =====================================================
        // ÍNDICES ESPECÍFICOS PARA CONSULTAS REALES
        // =====================================================

        // Índice para búsquedas por nombre (consulta más frecuente)
        DB::statement('
            CREATE INDEX idx_agencias_busqueda_rapida
            ON agencias(agencias_nombre, deleted_at, id_agencias)
        ');

        // Índice específico para Magic Travel (consulta crítica)
        DB::statement('
            CREATE INDEX idx_agencias_magic_travel
            ON agencias(agencias_nombre, deleted_at, id_agencias)
        ');

        // Índice para paginación eficiente
        DB::statement('
            CREATE INDEX idx_agencias_paginacion
            ON agencias(deleted_at, agencias_nombre, id_agencias)
        ');

        // Índice para filtros de estado
        DB::statement('
            CREATE INDEX idx_agencias_activas
            ON agencias(deleted_at, created_at, agencias_nombre)
        ');

        // =====================================================
        // VISTA PARA ESTADÍSTICAS RÁPIDAS (CUANDO SE NECESITEN)
        // =====================================================

        DB::statement("
            CREATE VIEW agencias_con_estadisticas AS
            SELECT
                a.id_agencias,
                a.agencias_nombre,
                a.created_at,
                a.updated_at,
                a.deleted_at,
                COALESCE(emp.total_empleados, 0) as total_empleados,
                COALESCE(rut.total_rutas, 0) as total_rutas,
                COALESCE(tur.total_tours, 0) as total_tours,
                COALESCE(veh.total_vehiculos, 0) as total_vehiculos
            FROM agencias a
            LEFT JOIN (
                SELECT id_agencias, COUNT(*) as total_empleados
                FROM empleados
                WHERE deleted_at IS NULL
                GROUP BY id_agencias
            ) emp ON a.id_agencias = emp.id_agencias
            LEFT JOIN (
                SELECT ar.id_agencias, COUNT(*) as total_rutas
                FROM agencias_rutas ar
                INNER JOIN rutas r ON ar.id_rutas = r.id_rutas
                WHERE r.deleted_at IS NULL
                GROUP BY ar.id_agencias
            ) rut ON a.id_agencias = rut.id_agencias
            LEFT JOIN (
                SELECT at.id_agencias, COUNT(*) as total_tours
                FROM agencias_tours at
                INNER JOIN tours t ON at.id_tours = t.id_tours
                WHERE t.deleted_at IS NULL
                GROUP BY at.id_agencias
            ) tur ON a.id_agencias = tur.id_agencias
            LEFT JOIN (
                SELECT id_agencias, COUNT(*) as total_vehiculos
                FROM vehiculo
                WHERE deleted_at IS NULL
                GROUP BY id_agencias
            ) veh ON a.id_agencias = veh.id_agencias
            WHERE a.deleted_at IS NULL
        ");

        // =====================================================
        // OPTIMIZACIONES ADICIONALES
        // =====================================================

        // Estadísticas de la tabla para el optimizador
        DB::statement('ANALYZE TABLE agencias');

        echo "Optimizaciones para tabla agencias aplicadas:\n";
        echo "- Vista agencias_lista creada (consultas rápidas)\n";
        echo "- Vista agencias_con_estadisticas creada (cuando se necesiten stats)\n";
        echo "- 4 índices específicos creados\n";
        echo "- Tabla analizada para optimizador MySQL\n";
    }

    /**
     * Rollback - Eliminar optimizaciones
     */
    public function down()
    {
        // Eliminar vistas
        DB::statement('DROP VIEW IF EXISTS agencias_con_estadisticas');
        DB::statement('DROP VIEW IF EXISTS agencias_lista');

        // Eliminar índices específicos
        DB::statement('DROP INDEX IF EXISTS idx_agencias_activas ON agencias');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_paginacion ON agencias');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_magic_travel ON agencias');
        DB::statement('DROP INDEX IF EXISTS idx_agencias_busqueda_rapida ON agencias');

        echo "Optimizaciones para tabla agencias removidas\n";
    }
};
