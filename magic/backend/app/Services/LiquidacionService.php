<?php

namespace App\Services;

use App\Models\RutaActiva;
use App\Models\Reserva;
use App\Models\EgresoRutaActiva;
use App\Models\Estado;
use App\Services\TransferenciaService;
use App\Services\PagoService;

class LiquidacionService
{
    protected TransferenciaService $transferenciaService;
    protected PagoService $pagoService;

    public function __construct(TransferenciaService $transferenciaService, PagoService $pagoService)
    {
        $this->transferenciaService = $transferenciaService;
        $this->pagoService = $pagoService;
    }

    /**
     * Verificar si una ruta está lista para liquidar
     * Reemplaza: fn_ruta_liquidada
     */
    public function verificarEstadoLiquidacion(int $rutaActivaId): array
    {
        $rutaActiva = RutaActiva::with(['estado', 'vehiculo', 'ruta'])->findOrFail($rutaActivaId);

        $reservas = Reserva::where('id_ruta_activa', $rutaActivaId)
            ->whereNull('deleted_at')
            ->get();

        $egresos = EgresoRutaActiva::where('id_ruta_activa', $rutaActivaId)
            ->whereNull('deleted_at')
            ->get();

        // Analizar estado de pagos
        $estadoPagos = $this->analizarEstadoPagos($reservas);

        // Determinar estado de liquidación
        $estadoLiquidacion = $this->determinarEstadoLiquidacion($rutaActiva, $estadoPagos);

        return [
            'ruta_activa_id' => $rutaActivaId,
            'fecha_ruta' => $rutaActiva->ruta_activa_fecha,
            'ruta_detalle' => $rutaActiva->ruta->rutas_origen . ' -> ' . $rutaActiva->ruta->rutas_destino,
            'vehiculo_placa' => $rutaActiva->vehiculo->vehiculo_placa ?? 'N/A',
            'estado_actual' => $rutaActiva->estado->estado_nombre,
            'estado_liquidacion' => $estadoLiquidacion,
            'puede_liquidar' => $estadoLiquidacion === 'LISTO_LIQUIDAR',
            'ya_liquidada' => $estadoLiquidacion === 'LIQUIDADA',
            'resumen_financiero' => $this->calcularResumenFinanciero($reservas, $egresos, $rutaActiva),
            'detalle_pagos' => $estadoPagos,
            'total_egresos' => $egresos->sum('cantidad_egreso'),
            'acciones_pendientes' => $this->obtenerAccionesPendientes($estadoLiquidacion, $estadoPagos)
        ];
    }

    /**
     * Analizar estado de pagos de las reservas
     */
    private function analizarEstadoPagos($reservas): array
    {
        $resumen = [
            'total_reservas' => $reservas->count(),
            'total_monto' => $reservas->sum('reservas_cobrar_a_pax'),
            'pagos_confirmados' => 0,
            'pagos_pendientes' => 0,
            'pagos_conductor_pendientes' => 0,
            'montos' => [
                'confirmados' => 0,
                'pendientes' => 0,
                'conductor_pendientes' => 0
            ],
            'detalle_por_reserva' => []
        ];

        foreach ($reservas as $reserva) {
            $escenario = $this->transferenciaService->determinarEscenario($reserva->id_reservas);

            // Solo analizar ventas directas de Magic Travel
            if ($escenario['escenario'] === 'VENTA_DIRECTA') {
                $formaPago = $this->pagoService->determinarFormaPago($reserva->id_reservas);
                $monto = $reserva->reservas_cobrar_a_pax;

                switch ($formaPago['forma_pago']) {
                    case 'PAGO_CAJA':
                    case 'PAGADO':
                        $resumen['pagos_confirmados']++;
                        $resumen['montos']['confirmados'] += $monto;
                        break;
                    case 'PAGO_CONDUCTOR':
                        $resumen['pagos_conductor_pendientes']++;
                        $resumen['montos']['conductor_pendientes'] += $monto;
                        break;
                    case 'PENDIENTE':
                        $resumen['pagos_pendientes']++;
                        $resumen['montos']['pendientes'] += $monto;
                        break;
                }

                $resumen['detalle_por_reserva'][] = [
                    'reserva_id' => $reserva->id_reservas,
                    'cliente' => $reserva->reservas_nombres_cliente . ' ' . $reserva->reservas_apellidos_cliente,
                    'monto' => $monto,
                    'forma_pago' => $formaPago['forma_pago'],
                    'estado_reserva' => $reserva->estado->estado_nombre
                ];
            }
        }

        return $resumen;
    }

    /**
     * Determinar estado de liquidación
     */
    private function determinarEstadoLiquidacion(RutaActiva $rutaActiva, array $estadoPagos): string
    {
        $estadoRuta = strtolower($rutaActiva->estado->estado_nombre);

        // Si ya está liquidada
        if (str_contains($estadoRuta, 'liquidar') || str_contains($estadoRuta, 'liquidada')) {
            return 'LIQUIDADA';
        }

        // Si hay pagos pendientes
        if ($estadoPagos['pagos_pendientes'] > 0) {
            return 'PENDIENTE_PAGOS';
        }

        // Si hay pagos de conductor sin confirmar
        if ($estadoPagos['pagos_conductor_pendientes'] > 0) {
            return 'PENDIENTE_CONFIRMACION';
        }

        // Si todos los pagos están confirmados
        if (
            $estadoPagos['pagos_confirmados'] > 0 &&
            $estadoPagos['pagos_pendientes'] === 0 &&
            $estadoPagos['pagos_conductor_pendientes'] === 0
        ) {
            return 'LISTO_LIQUIDAR';
        }

        return 'SIN_RESERVAS';
    }

    /**
     * Calcular resumen financiero
     */
    private function calcularResumenFinanciero($reservas, $egresos, RutaActiva $rutaActiva): array
    {
        $ingresosBrutos = $reservas->sum('reservas_cobrar_a_pax');
        $totalEgresos = $egresos->sum('cantidad_egreso');
        $pagoConductor = $rutaActiva->vehiculo->vehiculo_pago_conductor ?? 0;

        $gananciaNeta = $ingresosBrutos - $totalEgresos - $pagoConductor;

        return [
            'ingresos_brutos' => $ingresosBrutos,
            'total_egresos' => $totalEgresos,
            'pago_conductor' => $pagoConductor,
            'ganancia_neta' => $gananciaNeta,
            'margen_ganancia' => $ingresosBrutos > 0 ? round(($gananciaNeta / $ingresosBrutos) * 100, 2) : 0
        ];
    }

    /**
     * Obtener acciones pendientes
     */
    private function obtenerAccionesPendientes(string $estadoLiquidacion, array $estadoPagos): array
    {
        $acciones = [];

        switch ($estadoLiquidacion) {
            case 'PENDIENTE_PAGOS':
                $acciones[] = "Confirmar pago de {$estadoPagos['pagos_pendientes']} reservas pendientes";
                break;
            case 'PENDIENTE_CONFIRMACION':
                $acciones[] = "Confirmar {$estadoPagos['pagos_conductor_pendientes']} pagos de conductor";
                break;
            case 'LISTO_LIQUIDAR':
                $acciones[] = "Proceder con liquidación de ruta";
                break;
            case 'LIQUIDADA':
                $acciones[] = "Ruta ya liquidada";
                break;
            case 'SIN_RESERVAS':
                $acciones[] = "No hay reservas para liquidar";
                break;
        }

        return $acciones;
    }

    /**
     * Procesar liquidación completa de ruta
     */
    public function procesarLiquidacionCompleta(int $rutaActivaId, int $usuarioId): array
    {
        $verificacion = $this->verificarEstadoLiquidacion($rutaActivaId);

        if (!$verificacion['puede_liquidar']) {
            throw new \InvalidArgumentException(
                "La ruta no puede ser liquidada. Estado: {$verificacion['estado_liquidacion']}"
            );
        }

        $rutaActiva = RutaActiva::findOrFail($rutaActivaId);

        // Cambiar estado a liquidada
        $estadoLiquidar = Estado::where('estado_nombre', 'like', '%liquidar%')
            ->orWhere('estado_nombre', 'like', '%liquidada%')
            ->first();

        if ($estadoLiquidar) {
            $rutaActiva->update(['estado_id' => $estadoLiquidar->estado_id]);
        }

        \Log::info('Ruta liquidada completamente', [
            'ruta_activa_id' => $rutaActivaId,
            'usuario_liquidacion' => $usuarioId,
            'resumen_financiero' => $verificacion['resumen_financiero']
        ]);

        return [
            'ruta_activa_id' => $rutaActivaId,
            'liquidada' => true,
            'fecha_liquidacion' => now(),
            'usuario_liquidacion' => $usuarioId,
            'resumen_final' => $verificacion['resumen_financiero']
        ];
    }

    /**
     * Obtener rutas pendientes de liquidación
     */
    public function obtenerRutasPendientesLiquidacion(): array
    {
        $rutas = RutaActiva::with(['estado', 'vehiculo', 'ruta'])
            ->whereHas('estado', function ($query) {
                $query->where('estado_nombre', 'not like', '%liquidar%')
                    ->where('estado_nombre', 'not like', '%liquidada%');
            })
            ->whereDate('ruta_activa_fecha', '<=', today())
            ->get();

        $rutasPendientes = [];

        foreach ($rutas as $ruta) {
            $verificacion = $this->verificarEstadoLiquidacion($ruta->id_ruta_activa);

            if (in_array($verificacion['estado_liquidacion'], ['LISTO_LIQUIDAR', 'PENDIENTE_PAGOS', 'PENDIENTE_CONFIRMACION'])) {
                $rutasPendientes[] = $verificacion;
            }
        }

        return $rutasPendientes;
    }
}
