<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Agencia;
use App\Services\TransferenciaService;
use App\Services\LiquidacionService;
use Carbon\Carbon;

class ContabilidadService
{
    protected TransferenciaService $transferenciaService;
    protected LiquidacionService $liquidacionService;

    public function __construct(TransferenciaService $transferenciaService, LiquidacionService $liquidacionService)
    {
        $this->transferenciaService = $transferenciaService;
        $this->liquidacionService = $liquidacionService;
    }

    /**
     * Generar estado de cuenta entre agencias
     * Reemplaza: v_estado_cuenta_contabilidad
     */
    public function generarEstadoCuenta(?int $agenciaId = null, ?Carbon $fechaInicio = null, ?Carbon $fechaFin = null): array
    {
        $fechaInicio = $fechaInicio ?? Carbon::now()->startOfMonth();
        $fechaFin = $fechaFin ?? Carbon::now()->endOfMonth();

        $reservas = $this->obtenerReservasContabilidad($agenciaId, $fechaInicio, $fechaFin);

        $estadoCuenta = [
            'periodo' => [
                'inicio' => $fechaInicio->format('Y-m-d'),
                'fin' => $fechaFin->format('Y-m-d')
            ],
            'agencia_filtro' => $agenciaId,
            'resumen_por_agencia' => [],
            'resumen_por_escenario' => [],
            'balance_general' => [
                'total_servicios' => 0,
                'total_ingresos' => 0,
                'por_cobrar' => 0,
                'cobrados' => 0,
                'comisiones_pendientes' => 0
            ],
            'detalle_reservas' => []
        ];

        foreach ($reservas as $reserva) {
            $analisisReserva = $this->analizarReservaContabilidad($reserva);
            $estadoCuenta['detalle_reservas'][] = $analisisReserva;

            $this->acumularEnResumen($estadoCuenta, $analisisReserva);
        }

        return $estadoCuenta;
    }

    /**
     * Obtener reservas para contabilidad
     */
    private function obtenerReservasContabilidad(?int $agenciaId, Carbon $fechaInicio, Carbon $fechaFin)
    {
        $query = Reserva::with([
            'estado',
            'servicio.rutaActiva.ruta.agencia',
            'servicio.tourActivo.tour.agencia',
            'agenciaTransferida',
            'caja'
        ])
            ->whereHas('rutaActiva', function ($q) use ($fechaInicio, $fechaFin) {
                $q->whereBetween('ruta_activa_fecha', [$fechaInicio, $fechaFin]);
            })
            ->orWhereHas('tourActivo', function ($q) use ($fechaInicio, $fechaFin) {
                $q->whereBetween('tour_activo_fecha', [$fechaInicio, $fechaFin]);
            })
            ->whereNull('deleted_at');

        if ($agenciaId) {
            $query->where(function ($q) use ($agenciaId) {
                $q->where('id_agencia_transferida', $agenciaId)
                    ->orWhereHas('servicio.rutaActiva.ruta', function ($sq) use ($agenciaId) {
                        $sq->where('id_agencias', $agenciaId);
                    })
                    ->orWhereHas('servicio.tourActivo.tour', function ($sq) use ($agenciaId) {
                        $sq->where('id_agencias', $agenciaId);
                    });
            });
        }

        return $query->get();
    }

    /**
     * Analizar reserva para contabilidad
     */
    private function analizarReservaContabilidad(Reserva $reserva): array
    {
        $escenario = $this->transferenciaService->determinarEscenario($reserva->id_reservas);

        // Determinar agencias involucradas
        $agenciaOperadora = null;
        $agenciaTransferida = $reserva->agenciaTransferida->agencias_nombre ?? null;

        if ($reserva->id_ruta_activa) {
            $agenciaOperadora = $reserva->servicio->rutaActiva->ruta->agencia->agencias_nombre ?? null;
        } elseif ($reserva->id_tour_activo) {
            $agenciaOperadora = $reserva->servicio->tourActivo->tour->agencia->agencias_nombre ?? null;
        }

        // Determinar estado financiero
        $estadoFinanciero = $this->determinarEstadoFinanciero($reserva, $escenario);

        return [
            'reserva_id' => $reserva->id_reservas,
            'fecha_servicio' => $reserva->id_ruta_activa
                ? $reserva->rutaActiva->ruta_activa_fecha->format('Y-m-d')
                : ($reserva->tourActivo->tour_activo_fecha->format('Y-m-d') ?? null),
            'cliente' => $reserva->reservas_nombres_cliente . ' ' . $reserva->reservas_apellidos_cliente,
            'servicio_detalle' => $this->obtenerDetalleServicio($reserva),
            'total_pax' => $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0),
            'monto_servicio' => $reserva->reservas_cobrar_a_pax,
            'agencia_operadora' => $agenciaOperadora,
            'agencia_transferida' => $agenciaTransferida,
            'escenario' => $escenario['escenario'],
            'descripcion_escenario' => $escenario['descripcion'],
            'estado_financiero' => $estadoFinanciero,
            'requiere_voucher' => $this->requiereVoucher($escenario),
            'tiene_voucher' => !empty($reserva->reservas_voucher),
            'servicio_liquidado' => $this->servicioLiquidado($reserva),
            'observaciones' => $this->generarObservaciones($reserva, $escenario, $estadoFinanciero)
        ];
    }

    /**
     * Determinar estado financiero
     */
    private function determinarEstadoFinanciero(Reserva $reserva, array $escenario): string
    {
        $estadoReserva = strtolower($reserva->estado->estado_nombre);
        $tieneCaja = $reserva->caja !== null;

        if ($tieneCaja || str_contains($estadoReserva, 'pagada') || str_contains($estadoReserva, 'cobrado')) {
            return 'COBRADOS';
        }

        if (str_contains($estadoReserva, 'pendiente') || str_contains($estadoReserva, 'confirmada')) {
            return 'POR_COBRAR';
        }

        return 'INDEFINIDO';
    }

    /**
     * Verificar si requiere voucher
     */
    private function requiereVoucher(array $escenario): bool
    {
        return in_array($escenario['escenario'], ['MAGIC_TRANSFIERE', 'MAGIC_RECIBE_OPERA', 'MAGIC_PUENTE']);
    }

    /**
     * Verificar si el servicio está liquidado
     */
    private function servicioLiquidado(Reserva $reserva): bool
    {
        if ($reserva->id_ruta_activa) {
            $verificacion = $this->liquidacionService->verificarEstadoLiquidacion($reserva->id_ruta_activa);
            return $verificacion['ya_liquidada'];
        }

        // Tours se consideran liquidados automáticamente
        return true;
    }

    /**
     * Obtener detalle del servicio
     */
    private function obtenerDetalleServicio(Reserva $reserva): string
    {
        if ($reserva->id_ruta_activa) {
            $ruta = $reserva->rutaActiva->ruta ?? null;
            return $ruta ? "{$ruta->rutas_origen} -> {$ruta->rutas_destino}" : 'Ruta N/A';
        }

        if ($reserva->id_tour_activo) {
            $tour = $reserva->tourActivo->tour ?? null;
            return $tour ? "Tour: {$tour->tours_nombre}" : 'Tour N/A';
        }

        return 'Servicio N/A';
    }

    /**
     * Generar observaciones
     */
    private function generarObservaciones(Reserva $reserva, array $escenario, string $estadoFinanciero): array
    {
        $observaciones = [];

        if (!$this->servicioLiquidado($reserva)) {
            $observaciones[] = 'Servicio pendiente de liquidación';
        }

        if ($this->requiereVoucher($escenario) && empty($reserva->reservas_voucher)) {
            $observaciones[] = 'Requiere voucher de transferencia';
        }

        if ($estadoFinanciero === 'POR_COBRAR') {
            $observaciones[] = 'Pago pendiente de confirmación';
        }

        if ($escenario['escenario'] === 'REUBICACION_INTERNA') {
            $observaciones[] = 'Movimiento interno - sin impacto financiero';
        }

        return $observaciones;
    }

    /**
     * Acumular datos en resumen
     */
    private function acumularEnResumen(array &$estadoCuenta, array $analisisReserva): void
    {
        // Resumen general
        $estadoCuenta['balance_general']['total_servicios']++;
        $estadoCuenta['balance_general']['total_ingresos'] += $analisisReserva['monto_servicio'];

        if ($analisisReserva['estado_financiero'] === 'COBRADOS') {
            $estadoCuenta['balance_general']['cobrados'] += $analisisReserva['monto_servicio'];
        } else {
            $estadoCuenta['balance_general']['por_cobrar'] += $analisisReserva['monto_servicio'];
        }

        // Resumen por agencia
        $agencia = $analisisReserva['agencia_operadora'] ?? 'Sin Agencia';
        if (!isset($estadoCuenta['resumen_por_agencia'][$agencia])) {
            $estadoCuenta['resumen_por_agencia'][$agencia] = [
                'servicios' => 0,
                'monto_total' => 0,
                'cobrados' => 0,
                'por_cobrar' => 0
            ];
        }

        $estadoCuenta['resumen_por_agencia'][$agencia]['servicios']++;
        $estadoCuenta['resumen_por_agencia'][$agencia]['monto_total'] += $analisisReserva['monto_servicio'];
        $estadoCuenta['resumen_por_agencia'][$agencia][$analisisReserva['estado_financiero'] === 'COBRADOS' ? 'cobrados' : 'por_cobrar'] += $analisisReserva['monto_servicio'];

        // Resumen por escenario
        $escenario = $analisisReserva['escenario'];
        if (!isset($estadoCuenta['resumen_por_escenario'][$escenario])) {
            $estadoCuenta['resumen_por_escenario'][$escenario] = [
                'servicios' => 0,
                'monto_total' => 0,
                'descripcion' => $analisisReserva['descripcion_escenario']
            ];
        }

        $estadoCuenta['resumen_por_escenario'][$escenario]['servicios']++;
        $estadoCuenta['resumen_por_escenario'][$escenario]['monto_total'] += $analisisReserva['monto_servicio'];
    }

    /**
     * Obtener balance entre agencias específicas
     */
    public function balanceEntreAgencias(int $agencia1Id, int $agencia2Id, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $agencia1 = Agencia::findOrFail($agencia1Id);
        $agencia2 = Agencia::findOrFail($agencia2Id);

        $estadoCuenta1 = $this->generarEstadoCuenta($agencia1Id, $fechaInicio, $fechaFin);
        $estadoCuenta2 = $this->generarEstadoCuenta($agencia2Id, $fechaInicio, $fechaFin);

        // Calcular balance neto
        $debe1a2 = 0; // Lo que agencia1 debe a agencia2
        $debe2a1 = 0; // Lo que agencia2 debe a agencia1

        // Analizar transferencias entre las dos agencias específicas
        foreach ($estadoCuenta1['detalle_reservas'] as $reserva) {
            if ($reserva['agencia_transferida'] === $agencia2->agencias_nombre) {
                $debe1a2 += $reserva['monto_servicio'];
            }
        }

        foreach ($estadoCuenta2['detalle_reservas'] as $reserva) {
            if ($reserva['agencia_transferida'] === $agencia1->agencias_nombre) {
                $debe2a1 += $reserva['monto_servicio'];
            }
        }

        $balanceNeto = $debe2a1 - $debe1a2;

        return [
            'agencia_1' => $agencia1->agencias_nombre,
            'agencia_2' => $agencia2->agencias_nombre,
            'periodo' => [
                'inicio' => $fechaInicio->format('Y-m-d'),
                'fin' => $fechaFin->format('Y-m-d')
            ],
            'debe_agencia_1_a_2' => $debe1a2,
            'debe_agencia_2_a_1' => $debe2a1,
            'balance_neto' => $balanceNeto,
            'quien_debe' => $balanceNeto > 0
                ? $agencia1->agencias_nombre
                : ($balanceNeto < 0 ? $agencia2->agencias_nombre : 'EQUILIBRADO'),
            'monto_balance' => abs($balanceNeto)
        ];
    }
}
