<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\Vehiculo;
use App\Models\FacturaSat;
use App\Models\Reserva;
use App\Models\RutaActiva;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class NotificacionesController extends Controller
{
    /**
     * Obtener todas las notificaciones del sistema
     * GET /api/notificaciones
     */
    public function index(): JsonResponse
    {
        try {
            $notificaciones = [
                'cumpleanos' => $this->obtenerNotificacionesCumpleanos(),
                'aniversarios' => $this->obtenerNotificacionesAniversarios(),
                'vehiculos' => $this->obtenerNotificacionesVehiculos(),
                'facturas' => $this->obtenerNotificacionesFacturas(),
                'reservas' => $this->obtenerNotificacionesReservas(),
                'sistema' => $this->obtenerNotificacionesSistema(),
            ];

            // Contar total de notificaciones
            $totalNotificaciones = array_sum(array_map(function ($categoria) {
                return count($categoria);
            }, $notificaciones));

            return response()->json([
                'success' => true,
                'data' => [
                    'notificaciones' => $notificaciones,
                    'resumen' => [
                        'total' => $totalNotificaciones,
                        'por_categoria' => array_map('count', $notificaciones),
                        'fecha_consulta' => now()->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo notificaciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notificaciones por categoría
     * GET /api/notificaciones/{categoria}
     */
    public function porCategoria($categoria): JsonResponse
    {
        try {
            $notificaciones = [];

            switch ($categoria) {
                case 'cumpleanos':
                    $notificaciones = $this->obtenerNotificacionesCumpleanos();
                    break;
                case 'aniversarios':
                    $notificaciones = $this->obtenerNotificacionesAniversarios();
                    break;
                case 'vehiculos':
                    $notificaciones = $this->obtenerNotificacionesVehiculos();
                    break;
                case 'facturas':
                    $notificaciones = $this->obtenerNotificacionesFacturas();
                    break;
                case 'reservas':
                    $notificaciones = $this->obtenerNotificacionesReservas();
                    break;
                case 'sistema':
                    $notificaciones = $this->obtenerNotificacionesSistema();
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Categoría de notificación no válida'
                    ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'categoria' => $categoria,
                    'notificaciones' => $notificaciones,
                    'total' => count($notificaciones)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo notificaciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resumen de alertas críticas
     * GET /api/notificaciones/alertas-criticas
     */
    public function alertasCriticas(): JsonResponse
    {
        try {
            $alertas = [
                'facturas_error' => [
                    'cantidad' => FacturaSat::whereNotNull('error_sat')->count(),
                    'descripcion' => 'Facturas con errores en SAT',
                    'prioridad' => 'alta',
                    'accion' => 'Revisar y reenviar facturas',
                ],
                'reservas_vencidas' => [
                    'cantidad' => Reserva::where('reservas_fecha_servicio', '<', today())
                        ->whereHas('estado', function ($q) {
                            $q->where('estado_nombre', 'like', '%pendiente%');
                        })->count(),
                    'descripcion' => 'Reservas vencidas pendientes',
                    'prioridad' => 'alta',
                    'accion' => 'Actualizar estado de reservas',
                ],
                'vehiculos_mantenimiento' => [
                    'cantidad' => Vehiculo::where('vehiculo_activo', true)
                        ->where('vehiculo_observaciones', 'like', '%mantenimiento%')
                        ->count(),
                    'descripcion' => 'Vehículos requieren mantenimiento',
                    'prioridad' => 'media',
                    'accion' => 'Programar mantenimiento',
                ],
                'empleados_sin_cargo' => [
                    'cantidad' => Empleado::where('empleados_activo', true)
                        ->whereNull('id_cargo')
                        ->count(),
                    'descripcion' => 'Empleados sin cargo asignado',
                    'prioridad' => 'media',
                    'accion' => 'Asignar cargos',
                ],
            ];

            // Filtrar solo alertas con cantidad > 0
            $alertasActivas = array_filter($alertas, function ($alerta) {
                return $alerta['cantidad'] > 0;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'alertas' => $alertasActivas,
                    'total_alertas' => count($alertasActivas),
                    'prioridad_alta' => count(array_filter($alertasActivas, function ($a) {
                        return $a['prioridad'] === 'alta';
                    })),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo alertas críticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener notificaciones de cumpleaños
     */
    private function obtenerNotificacionesCumpleanos(): array
    {
        $hoy = today();
        $proximosSieteDias = $hoy->copy()->addDays(7);

        $empleados = Empleado::where('empleados_activo', true)
            ->whereNotNull('empleados_fecha_nacimiento')
            ->get()
            ->filter(function ($empleado) use ($hoy, $proximosSieteDias) {
                $cumpleanos = $empleado->empleados_fecha_nacimiento->copy()->year($hoy->year);
                if ($cumpleanos < $hoy) {
                    $cumpleanos->addYear();
                }
                return $cumpleanos->between($hoy, $proximosSieteDias);
            })
            ->map(function ($empleado) use ($hoy) {
                $cumpleanos = $empleado->empleados_fecha_nacimiento->copy()->year($hoy->year);
                if ($cumpleanos < $hoy) {
                    $cumpleanos->addYear();
                }

                return [
                    'id' => $empleado->id_empleados,
                    'nombre' => $empleado->empleados_nombres . ' ' . $empleado->empleados_apellidos,
                    'fecha_nacimiento' => $empleado->empleados_fecha_nacimiento->format('d/m/Y'),
                    'dias_restantes' => $hoy->diffInDays($cumpleanos),
                    'es_hoy' => $cumpleanos->isToday(),
                    'edad_cumple' => $cumpleanos->year - $empleado->empleados_fecha_nacimiento->year,
                    'tipo' => 'cumpleanos',
                    'prioridad' => $cumpleanos->isToday() ? 'alta' : 'media'
                ];
            })
            ->sortBy('dias_restantes')
            ->values()
            ->toArray();

        return $empleados;
    }

    /**
     * Obtener notificaciones de aniversarios laborales
     */
    private function obtenerNotificacionesAniversarios(): array
    {
        $hoy = today();
        $proximosSieteDias = $hoy->copy()->addDays(7);

        $empleados = Empleado::where('empleados_activo', true)
            ->whereNotNull('empleados_fecha_ingreso')
            ->get()
            ->filter(function ($empleado) use ($hoy, $proximosSieteDias) {
                $aniversario = $empleado->empleados_fecha_ingreso->copy()->year($hoy->year);
                if ($aniversario < $hoy) {
                    $aniversario->addYear();
                }
                return $aniversario->between($hoy, $proximosSieteDias);
            })
            ->map(function ($empleado) use ($hoy) {
                $aniversario = $empleado->empleados_fecha_ingreso->copy()->year($hoy->year);
                if ($aniversario < $hoy) {
                    $aniversario->addYear();
                }

                return [
                    'id' => $empleado->id_empleados,
                    'nombre' => $empleado->empleados_nombres . ' ' . $empleado->empleados_apellidos,
                    'fecha_ingreso' => $empleado->empleados_fecha_ingreso->format('d/m/Y'),
                    'dias_restantes' => $hoy->diffInDays($aniversario),
                    'es_hoy' => $aniversario->isToday(),
                    'anos_cumple' => $aniversario->year - $empleado->empleados_fecha_ingreso->year,
                    'tipo' => 'aniversario',
                    'prioridad' => $aniversario->isToday() ? 'alta' : 'media'
                ];
            })
            ->sortBy('dias_restantes')
            ->values()
            ->toArray();

        return $empleados;
    }

    /**
     * Obtener notificaciones de vehículos
     */
    private function obtenerNotificacionesVehiculos(): array
    {
        $notificaciones = [];

        // Vehículos con observaciones que indiquen mantenimiento
        $vehiculosMantenimiento = Vehiculo::where('vehiculo_activo', true)
            ->whereNotNull('vehiculo_observaciones')
            ->get()
            ->map(function ($vehiculo) {
                return [
                    'id' => $vehiculo->id_vehiculos,
                    'placa' => $vehiculo->vehiculo_placa,
                    'marca' => $vehiculo->vehiculo_marca,
                    'observaciones' => $vehiculo->vehiculo_observaciones,
                    'tipo' => 'mantenimiento_vehiculo',
                    'prioridad' => 'media',
                    'mensaje' => 'Vehículo ' . $vehiculo->vehiculo_placa . ' requiere atención'
                ];
            })
            ->toArray();

        return $vehiculosMantenimiento;
    }

    /**
     * Obtener notificaciones de facturas
     */
    private function obtenerNotificacionesFacturas(): array
    {
        $notificaciones = [];

        // Facturas con errores
        $facturasError = FacturaSat::whereNotNull('error_sat')
            ->limit(10)
            ->get()
            ->map(function ($factura) {
                return [
                    'id' => $factura->id_facturas_sat,
                    'numero_factura' => $factura->numero_factura_sat,
                    'cliente' => $factura->nombre_cliente,
                    'error' => $factura->error_sat,
                    'tipo' => 'factura_error',
                    'prioridad' => 'alta',
                    'mensaje' => 'Error en factura SAT: ' . $factura->error_sat
                ];
            })
            ->toArray();

        // Facturas pendientes hace más de 24 horas
        $facturasPendientes = FacturaSat::where('estado_sat', 'Pendiente')
            ->where('created_at', '<', now()->subHours(24))
            ->limit(10)
            ->get()
            ->map(function ($factura) {
                return [
                    'id' => $factura->id_facturas_sat,
                    'numero_factura' => $factura->numero_factura_sat,
                    'cliente' => $factura->nombre_cliente,
                    'horas_pendiente' => $factura->created_at->diffInHours(now()),
                    'tipo' => 'factura_pendiente',
                    'prioridad' => 'media',
                    'mensaje' => 'Factura pendiente de certificar hace ' . $factura->created_at->diffInHours(now()) . ' horas'
                ];
            })
            ->toArray();

        return array_merge($facturasError, $facturasPendientes);
    }

    /**
     * Obtener notificaciones de reservas
     */
    private function obtenerNotificacionesReservas(): array
    {
        // Reservas con fecha de servicio para hoy
        $reservasHoy = Reserva::with(['estado'])
            ->whereDate('reservas_fecha_servicio', today())
            ->limit(10)
            ->get()
            ->map(function ($reserva) {
                return [
                    'id' => $reserva->id_reservas,
                    'cliente' => $reserva->reservas_nombres_cliente . ' ' . $reserva->reservas_apellidos_cliente,
                    'fecha_servicio' => $reserva->reservas_fecha_servicio->format('d/m/Y'),
                    'estado' => $reserva->estado->estado_nombre ?? 'Sin estado',
                    'tipo' => 'reserva_hoy',
                    'prioridad' => 'alta',
                    'mensaje' => 'Servicio programado para hoy'
                ];
            })
            ->toArray();

        return $reservasHoy;
    }

    /**
     * Obtener notificaciones del sistema
     */
    private function obtenerNotificacionesSistema(): array
    {
        $notificaciones = [];

        // Empleados sin cargo asignado
        $empleadosSinCargo = Empleado::where('empleados_activo', true)
            ->whereNull('id_cargo')
            ->count();

        if ($empleadosSinCargo > 0) {
            $notificaciones[] = [
                'cantidad' => $empleadosSinCargo,
                'tipo' => 'empleados_sin_cargo',
                'prioridad' => 'media',
                'mensaje' => $empleadosSinCargo . ' empleados sin cargo asignado'
            ];
        }

        // Vehículos inactivos
        $vehiculosInactivos = Vehiculo::where('vehiculo_activo', false)->count();

        if ($vehiculosInactivos > 0) {
            $notificaciones[] = [
                'cantidad' => $vehiculosInactivos,
                'tipo' => 'vehiculos_inactivos',
                'prioridad' => 'baja',
                'mensaje' => $vehiculosInactivos . ' vehículos inactivos en el sistema'
            ];
        }

        return $notificaciones;
    }
}
