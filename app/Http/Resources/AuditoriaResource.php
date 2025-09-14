<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuditoriaResource extends Model
{
    // Este es un modelo de solo lectura para las auditorías
    // No tiene tabla propia, sirve como helper para consultas

    /**
     * Obtener lista de todas las tablas de auditoría
     */
    public static function tablasAuditoria()
    {
        return [
            'tipo_persona' => [
                'tabla' => 'tipo_persona_auditoria',
                'nombre' => 'Tipos de Persona',
                'descripcion' => 'Auditoría de tipos de persona del sistema'
            ],
            'rol' => [
                'tabla' => 'rol_auditoria',
                'nombre' => 'Roles',
                'descripcion' => 'Auditoría de roles y permisos del sistema'
            ],
            'estado' => [
                'tabla' => 'estado_auditoria',
                'nombre' => 'Estados',
                'descripcion' => 'Auditoría de estados del sistema'
            ],
            'servicio' => [
                'tabla' => 'servicio_auditoria',
                'nombre' => 'Servicios',
                'descripcion' => 'Auditoría de servicios turísticos'
            ],
            'ruta' => [
                'tabla' => 'ruta_auditoria',
                'nombre' => 'Rutas',
                'descripcion' => 'Auditoría de rutas de viaje'
            ],
            'agencia' => [
                'tabla' => 'agencia_auditoria',
                'nombre' => 'Agencias',
                'descripcion' => 'Auditoría de agencias de viajes'
            ],
            'persona' => [
                'tabla' => 'persona_auditoria',
                'nombre' => 'Personas',
                'descripcion' => 'Auditoría de personas del sistema'
            ],
            'vehiculo' => [
                'tabla' => 'vehiculo_auditoria',
                'nombre' => 'Vehículos',
                'descripcion' => 'Auditoría de vehículos de la flota'
            ],
            'contactos_agencia' => [
                'tabla' => 'contactos_agencia_auditoria',
                'nombre' => 'Contactos de Agencia',
                'descripcion' => 'Auditoría de contactos de agencias'
            ],
            'usuario' => [
                'tabla' => 'usuario_auditoria',
                'nombre' => 'Usuarios',
                'descripcion' => 'Auditoría de usuarios del sistema'
            ],
            'ruta_activada' => [
                'tabla' => 'ruta_activada_auditoria',
                'nombre' => 'Rutas Activadas',
                'descripcion' => 'Auditoría de rutas programadas'
            ],
            'reserva' => [
                'tabla' => 'reserva_auditoria',
                'nombre' => 'Reservas',
                'descripcion' => 'Auditoría de reservaciones de clientes'
            ]
        ];
    }

    /**
     * Obtener estadísticas rápidas de auditoría
     */
    public static function estadisticasRapidas()
    {
        $tablas = self::tablasAuditoria();
        $stats = [
            'total_registros' => 0,
            'registros_hoy' => 0,
            'registros_semana' => 0,
            'ultima_actividad' => null
        ];

        $hoy = Carbon::today();
        $semanaAtras = Carbon::now()->subDays(7);
        $ultimaActividad = null;

        foreach ($tablas as $config) {
            $tabla = $config['tabla'];

            // Total registros
            $total = DB::table($tabla)->count();
            $stats['total_registros'] += $total;

            // Registros de hoy
            $hoy_count = DB::table($tabla)
                ->whereDate('fecha_modificacion', $hoy)
                ->count();
            $stats['registros_hoy'] += $hoy_count;

            // Registros de la semana
            $semana_count = DB::table($tabla)
                ->where('fecha_modificacion', '>=', $semanaAtras)
                ->count();
            $stats['registros_semana'] += $semana_count;

            // Última actividad de esta tabla
            $ultima_tabla = DB::table($tabla)
                ->select('fecha_modificacion')
                ->orderByDesc('fecha_modificacion')
                ->first();

            if (
                $ultima_tabla &&
                (!$ultimaActividad || $ultima_tabla->fecha_modificacion > $ultimaActividad)
            ) {
                $ultimaActividad = $ultima_tabla->fecha_modificacion;
            }
        }

        $stats['ultima_actividad'] = $ultimaActividad;

        return $stats;
    }

    /**
     * Buscar auditorías por texto en múltiples campos
     */
    public static function buscarPorTexto($texto, $limite = 50)
    {
        $tablas = self::tablasAuditoria();
        $resultados = collect();

        foreach ($tablas as $clave => $config) {
            $tabla = $config['tabla'];

            // Campos comunes en todas las auditorías
            $query = DB::table($tabla)
                ->select('*')
                ->addSelect(DB::raw("'{$clave}' as tabla_original"))
                ->addSelect(DB::raw("'{$config['nombre']}' as nombre_tabla"));

            // Buscar en campos específicos según la tabla
            switch ($clave) {
                case 'persona':
                    $query->where(function ($q) use ($texto) {
                        $q->where('persona_nombres', 'like', "%{$texto}%")
                            ->orWhere('persona_apellidos', 'like', "%{$texto}%")
                            ->orWhere('persona_email', 'like', "%{$texto}%");
                    });
                    break;

                case 'agencia':
                    $query->where(function ($q) use ($texto) {
                        $q->where('agencia_razon_social', 'like', "%{$texto}%")
                            ->orWhere('agencia_nit', 'like', "%{$texto}%")
                            ->orWhere('agencia_email', 'like', "%{$texto}%");
                    });
                    break;

                case 'vehiculo':
                    $query->where(function ($q) use ($texto) {
                        $q->where('vehiculo_placa', 'like', "%{$texto}%")
                            ->orWhere('vehiculo_marca', 'like', "%{$texto}%")
                            ->orWhere('vehiculo_modelo', 'like', "%{$texto}%");
                    });
                    break;

                case 'reserva':
                    $query->where(function ($q) use ($texto) {
                        $q->where('reserva_nombres_cliente', 'like', "%{$texto}%")
                            ->orWhere('reserva_apellidos_cliente', 'like', "%{$texto}%")
                            ->orWhere('reserva_email_cliente', 'like', "%{$texto}%")
                            ->orWhere('reserva_codigo', 'like', "%{$texto}%");
                    });
                    break;

                default:
                    // Para otras tablas, buscar en campos de código
                    $campo_codigo = $clave . '_codigo';
                    $query->where($campo_codigo, 'like', "%{$texto}%");
                    break;
            }

            $items = $query->orderByDesc('fecha_modificacion')
                ->limit(10)
                ->get();

            $resultados = $resultados->concat($items);
        }

        return $resultados->sortByDesc('fecha_modificacion')
            ->take($limite)
            ->values();
    }

    /**
     * Obtener actividad reciente de un usuario específico
     */
    public static function actividadUsuario($usuarioId, $dias = 30)
    {
        $tablas = self::tablasAuditoria();
        $fechaInicio = Carbon::now()->subDays($dias);
        $actividad = collect();

        foreach ($tablas as $clave => $config) {
            $tabla = $config['tabla'];

            $items = DB::table($tabla)
                ->select('*')
                ->addSelect(DB::raw("'{$clave}' as tabla_original"))
                ->addSelect(DB::raw("'{$config['nombre']}' as nombre_tabla"))
                ->where('usuario_modificacion', $usuarioId)
                ->where('fecha_modificacion', '>=', $fechaInicio)
                ->orderByDesc('fecha_modificacion')
                ->get();

            $actividad = $actividad->concat($items);
        }

        return $actividad->sortByDesc('fecha_modificacion')->values();
    }

    /**
     * Obtener resumen de cambios por período
     */
    public static function resumenPorPeriodo($fechaInicio, $fechaFin)
    {
        $tablas = self::tablasAuditoria();
        $resumen = [];

        foreach ($tablas as $clave => $config) {
            $tabla = $config['tabla'];

            $stats = DB::table($tabla)
                ->select('accion')
                ->selectRaw('COUNT(*) as total')
                ->whereBetween('fecha_modificacion', [$fechaInicio, $fechaFin])
                ->groupBy('accion')
                ->get()
                ->pluck('total', 'accion')
                ->toArray();

            $resumen[$clave] = [
                'nombre' => $config['nombre'],
                'inserciones' => $stats['INSERT'] ?? 0,
                'actualizaciones' => $stats['UPDATE'] ?? 0,
                'eliminaciones' => $stats['DELETE'] ?? 0,
                'total' => array_sum($stats)
            ];
        }

        return $resumen;
    }

    /**
     * Obtener los usuarios más activos en un período
     */
    public static function usuariosMasActivos($fechaInicio = null, $fechaFin = null, $limite = 10)
    {
        $tablas = self::tablasAuditoria();
        $usuarios = collect();

        $fechaInicio = $fechaInicio ?? Carbon::now()->subMonth();
        $fechaFin = $fechaFin ?? Carbon::now();

        foreach ($tablas as $config) {
            $tabla = $config['tabla'];

            $stats = DB::table($tabla)
                ->select('usuario_modificacion')
                ->selectRaw('COUNT(*) as total_acciones')
                ->whereBetween('fecha_modificacion', [$fechaInicio, $fechaFin])
                ->groupBy('usuario_modificacion')
                ->get();

            $usuarios = $usuarios->concat($stats);
        }

        return $usuarios->groupBy('usuario_modificacion')
            ->map(function ($grupo) {
                return [
                    'usuario_id' => $grupo->first()->usuario_modificacion,
                    'total_acciones' => $grupo->sum('total_acciones')
                ];
            })
            ->sortByDesc('total_acciones')
            ->take($limite)
            ->values();
    }

    /**
     * Validar que una tabla de auditoría existe
     */
    public static function tablaExiste($tabla)
    {
        $tablas = self::tablasAuditoria();
        return isset($tablas[$tabla]);
    }

    /**
     * Obtener configuración de una tabla específica
     */
    public static function configTabla($tabla)
    {
        $tablas = self::tablasAuditoria();
        return $tablas[$tabla] ?? null;
    }

    /**
     * Obtener campos específicos de una tabla de auditoría
     */
    public static function camposTabla($tabla)
    {
        $config = self::configTabla($tabla);
        if (!$config) return [];

        // Obtener estructura de la tabla desde la base de datos
        $columnas = DB::select("SHOW COLUMNS FROM {$config['tabla']}");

        return collect($columnas)->map(function ($col) {
            return [
                'nombre' => $col->Field,
                'tipo' => $col->Type,
                'nulo' => $col->Null === 'YES',
                'clave' => $col->Key,
                'default' => $col->Default
            ];
        })->toArray();
    }
}
