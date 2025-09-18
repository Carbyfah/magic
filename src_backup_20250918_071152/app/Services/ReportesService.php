<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\RutaActiva;
use App\Models\Caja;
use App\Models\EgresoRutaActiva;
use App\Services\TransferenciaService;
use App\Services\PagoService;
use Carbon\Carbon;

class ReportesService
{
    protected TransferenciaService $transferenciaService;
    protected PagoService $pagoService;

    public function __construct(TransferenciaService $transferenciaService, PagoService $pagoService)
    {
        $this->transferenciaService = $transferenciaService;
        $this->pagoService = $pagoService;
    }

    /**
     * Reporte ejecutivo consolidado
     */
    public function reporteEjecutivo(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $resumen = [
            'periodo' => [
                'inicio' => $fechaInicio->format('Y-m-d'),
                'fin' => $fechaFin->format('Y-m-d'),
                'dias' => $fechaInicio->diffInDays($fechaFin) + 1
            ],
            'metricas_operativas' => $this->calcularMetricasOperativas($fechaInicio, $fechaFin),
            'metricas_financieras' => $this->calcularMetricasFinancieras($fechaInicio, $fechaFin),
            'analisis_escenarios' => $this->analizarEscenariosPeriodo($fechaInicio, $fechaFin),
            'rendimiento_rutas' => $this->analizarRendimientoRutas($fechaInicio, $fechaFin),
            'tendencias' => $this->calcularTendencias($fechaInicio, $fechaFin)
        ];

        return $resumen;
    }

    /**
     * Calcular métricas operativas
     */
    private function calcularMetricasOperativas(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $rutasEjecutadas = RutaActiva::whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin])
            ->whereNull('deleted_at')
            ->count();

        $reservasTotales = Reserva::whereHas('rutaActiva', function ($q) use ($fechaInicio, $fechaFin) {
            $q->whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin]);
        })
            ->orWhereHas('tourActivo', function ($q) use ($fechaInicio, $fechaFin) {
                $q->whereBetween('tour_activo_fecha', [$fechaInicio, $fechaFin]);
            })
            ->whereNull('deleted_at')
            ->get();

        $totalPasajeros = $reservasTotales->sum(function ($reserva) {
            return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
        });

        $ocupacionPromedio = $this->calcularOcupacionPromedio($fechaInicio, $fechaFin);

        return [
            'rutas_ejecutadas' => $rutasEjecutadas,
            'total_reservas' => $reservasTotales->count(),
            'total_pasajeros' => $totalPasajeros,
            'promedio_pax_por_ruta' => $rutasEjecutadas > 0 ? round($totalPasajeros / $rutasEjecutadas, 2) : 0,
            'ocupacion_promedio' => $ocupacionPromedio,
            'cancelaciones' => $reservasTotales->where('estado.estado_nombre', 'like', '%cancelada%')->count()
        ];
    }

    /**
     * Calcular métricas financieras
     */
    private function calcularMetricasFinancieras(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $ingresosBrutos = Caja::whereBetween('fecha_servicio', [$fechaInicio, $fechaFin])
            ->whereNull('deleted_at')
            ->sum('servicio_cobrar_pax');

        $totalEgresos = EgresoRutaActiva::whereHas('rutaActiva', function ($q) use ($fechaInicio, $fechaFin) {
            $q->whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin]);
        })
            ->whereNull('deleted_at')
            ->sum('cantidad_egreso');

        $pagosConductores = RutaActiva::with('vehiculo')
            ->whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin])
            ->whereNull('deleted_at')
            ->get()
            ->sum('vehiculo.vehiculo_pago_conductor');

        $gananciaNeta = $ingresosBrutos - $totalEgresos - $pagosConductores;

        return [
            'ingresos_brutos' => $ingresosBrutos,
            'total_egresos' => $totalEgresos,
            'pagos_conductores' => $pagosConductores,
            'ganancia_neta' => $gananciaNeta,
            'margen_ganancia' => $ingresosBrutos > 0 ? round(($gananciaNeta / $ingresosBrutos) * 100, 2) : 0,
            'ticket_promedio' => $this->calcularTicketPromedio($fechaInicio, $fechaFin)
        ];
    }

    /**
     * Analizar escenarios del período
     */
    private function analizarEscenariosPeriodo(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $reservas = Reserva::whereHas('rutaActiva', function ($q) use ($fechaInicio, $fechaFin) {
            $q->whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin]);
        })
            ->orWhereHas('tourActivo', function ($q) use ($fechaInicio, $fechaFin) {
                $q->whereBetween('tour_activo_fecha', [$fechaInicio, $fechaFin]);
            })
            ->whereNull('deleted_at')
            ->get();

        $analisisPorEscenario = [];

        foreach ($reservas as $reserva) {
            try {
                $escenario = $this->transferenciaService->determinarEscenario($reserva->id_reservas);
                $tipoEscenario = $escenario['escenario'];

                if (!isset($analisisPorEscenario[$tipoEscenario])) {
                    $analisisPorEscenario[$tipoEscenario] = [
                        'cantidad' => 0,
                        'monto_total' => 0,
                        'pasajeros' => 0,
                        'descripcion' => $escenario['descripcion']
                    ];
                }

                $analisisPorEscenario[$tipoEscenario]['cantidad']++;
                $analisisPorEscenario[$tipoEscenario]['monto_total'] += $reserva->reservas_cobrar_a_pax;
                $analisisPorEscenario[$tipoEscenario]['pasajeros'] += $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
            } catch (\Exception $e) {
                // Log del error pero continuar
                \Log::warning('Error analizando escenario en reporte', [
                    'reserva_id' => $reserva->id_reservas,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $analisisPorEscenario;
    }

    /**
     * Analizar rendimiento de rutas
     */
    private function analizarRendimientoRutas(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $rutasConDatos = RutaActiva::with(['ruta', 'vehiculo', 'reservas.servicio'])
            ->whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin])
            ->whereNull('deleted_at')
            ->get();

        $rendimientoPorRuta = [];

        foreach ($rutasConDatos as $rutaActiva) {
            $origen = $rutaActiva->ruta->rutas_origen ?? 'N/A';
            $destino = $rutaActiva->ruta->rutas_destino ?? 'N/A';
            $rutaKey = "{$origen} -> {$destino}";

            if (!isset($rendimientoPorRuta[$rutaKey])) {
                $rendimientoPorRuta[$rutaKey] = [
                    'frecuencia' => 0,
                    'total_pasajeros' => 0,
                    'ingresos_totales' => 0,
                    'ocupacion_promedio' => 0
                ];
            }

            $reservas = $rutaActiva->reservas->where('deleted_at', null);
            $pasajeros = $reservas->sum(function ($r) {
                return $r->reservas_cantidad_adultos + ($r->reservas_cantidad_ninos ?? 0);
            });
            $ingresos = $reservas->sum('reservas_cobrar_a_pax');
            $capacidad = $rutaActiva->vehiculo->vehiculo_capacidad ?? 1;
            $ocupacion = $capacidad > 0 ? ($pasajeros / $capacidad) * 100 : 0;

            $rendimientoPorRuta[$rutaKey]['frecuencia']++;
            $rendimientoPorRuta[$rutaKey]['total_pasajeros'] += $pasajeros;
            $rendimientoPorRuta[$rutaKey]['ingresos_totales'] += $ingresos;
            $rendimientoPorRuta[$rutaKey]['ocupacion_promedio'] += $ocupacion;
        }

        // Calcular promedios
        foreach ($rendimientoPorRuta as $ruta => &$datos) {
            $datos['ocupacion_promedio'] = $datos['frecuencia'] > 0
                ? round($datos['ocupacion_promedio'] / $datos['frecuencia'], 2)
                : 0;
            $datos['ingreso_promedio_por_viaje'] = $datos['frecuencia'] > 0
                ? round($datos['ingresos_totales'] / $datos['frecuencia'], 2)
                : 0;
        }

        // Ordenar por ingresos totales
        uasort($rendimientoPorRuta, function ($a, $b) {
            return $b['ingresos_totales'] <=> $a['ingresos_totales'];
        });

        return array_slice($rendimientoPorRuta, 0, 10, true); // Top 10 rutas
    }

    /**
     * Calcular tendencias
     */
    private function calcularTendencias(Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $dias = $fechaInicio->diffInDays($fechaFin) + 1;
        $ventasPorDia = [];

        for ($fecha = $fechaInicio->copy(); $fecha->lte($fechaFin); $fecha->addDay()) {
            $ingresosDia = Caja::whereDate('fecha_servicio', $fecha)
                ->whereNull('deleted_at')
                ->sum('servicio_cobrar_pax');

            $ventasPorDia[] = [
                'fecha' => $fecha->format('Y-m-d'),
                'ingresos' => $ingresosDia
            ];
        }

        // Calcular tendencia (regresión lineal simple)
        $n = count($ventasPorDia);
        $sumX = array_sum(array_keys($ventasPorDia));
        $sumY = array_sum(array_column($ventasPorDia, 'ingresos'));
        $sumXY = 0;
        $sumX2 = 0;

        foreach ($ventasPorDia as $i => $dia) {
            $sumXY += $i * $dia['ingresos'];
            $sumX2 += $i * $i;
        }

        $tendencia = $n > 1 ? ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX) : 0;

        return [
            'ventas_por_dia' => $ventasPorDia,
            'tendencia_diaria' => round($tendencia, 2),
            'direccion_tendencia' => $tendencia > 0 ? 'CRECIENTE' : ($tendencia < 0 ? 'DECRECIENTE' : 'ESTABLE'),
            'mejor_dia' => collect($ventasPorDia)->sortByDesc('ingresos')->first(),
            'peor_dia' => collect($ventasPorDia)->sortBy('ingresos')->first()
        ];
    }

    /**
     * Calcular ocupación promedio
     */
    private function calcularOcupacionPromedio(Carbon $fechaInicio, Carbon $fechaFin): float
    {
        $rutasActivas = RutaActiva::with(['vehiculo', 'reservas'])
            ->whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin])
            ->whereNull('deleted_at')
            ->get();

        $totalOcupacion = 0;
        $rutasValidas = 0;

        foreach ($rutasActivas as $ruta) {
            $capacidad = $ruta->vehiculo->vehiculo_capacidad ?? 0;
            if ($capacidad > 0) {
                $pasajeros = $ruta->reservas->where('deleted_at', null)->sum(function ($r) {
                    return $r->reservas_cantidad_adultos + ($r->reservas_cantidad_ninos ?? 0);
                });
                $totalOcupacion += ($pasajeros / $capacidad) * 100;
                $rutasValidas++;
            }
        }

        return $rutasValidas > 0 ? round($totalOcupacion / $rutasValidas, 2) : 0;
    }

    /**
     * Calcular ticket promedio
     */
    private function calcularTicketPromedio(Carbon $fechaInicio, Carbon $fechaFin): float
    {
        $cajas = Caja::whereBetween('fecha_servicio', [$fechaInicio, $fechaFin])
            ->whereNull('deleted_at')
            ->get();

        return $cajas->count() > 0 ? round($cajas->avg('servicio_cobrar_pax'), 2) : 0;
    }
}
