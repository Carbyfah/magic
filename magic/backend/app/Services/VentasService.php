<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Caja;
use App\Models\Estado;
use App\Services\TransferenciaService;

class VentasService
{
    protected TransferenciaService $transferenciaService;

    public function __construct(TransferenciaService $transferenciaService)
    {
        $this->transferenciaService = $transferenciaService;
    }

    /**
     * Crear registro en caja automáticamente para ventas directas
     * Reemplaza: tr_reserva_crear_caja (parte del trigger original)
     */
    public function crearRegistroCajaAutomatico(Reserva $reserva): ?Caja
    {
        // Solo crear para ventas directas de Magic Travel pagadas en caja
        if (!$this->debeCrearRegistroCaja($reserva)) {
            return null;
        }

        return $this->generarRegistroCaja($reserva);
    }

    /**
     * Verificar si debe crear registro en caja
     */
    private function debeCrearRegistroCaja(Reserva $reserva): bool
    {
        // 1. Verificar que sea venta directa
        $escenario = $this->transferenciaService->determinarEscenario($reserva->id_reservas);
        if ($escenario['escenario'] !== 'VENTA_DIRECTA') {
            return false;
        }

        // 2. Verificar que esté pagada
        $estadoNombre = strtolower($reserva->estado->estado_nombre);
        if (!str_contains($estadoNombre, 'pagada')) {
            return false;
        }

        // 3. Verificar que no tenga ya un registro en caja
        $yaExiste = Caja::where('id_reservas', $reserva->id_reservas)
            ->whereNull('deleted_at')
            ->exists();

        return !$yaExiste;
    }

    /**
     * Generar registro en caja
     */
    private function generarRegistroCaja(Reserva $reserva): Caja
    {
        $datosServicio = $this->obtenerDatosServicio($reserva);

        return Caja::create([
            'origen' => $datosServicio['origen'],
            'destino' => $datosServicio['destino'],
            'fecha_servicio' => $datosServicio['fecha_servicio'],
            'pax_adultos' => $reserva->reservas_cantidad_adultos,
            'pax_ninos' => $reserva->reservas_cantidad_ninos ?? 0,
            'total_pax' => $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0),
            'precio_unitario' => $datosServicio['precio_unitario'],
            'precio_total' => $reserva->reservas_cobrar_a_pax,
            'direccion' => $reserva->reservas_direccion_abordaje ?? 'N/A',
            'servicio_cobrar_pax' => $reserva->reservas_cobrar_a_pax,
            'servicio_precio_descuento' => $datosServicio['precio_unitario'],
            'id_reservas' => $reserva->id_reservas,
            'estado_id' => $reserva->estado_id,
            'created_by' => $reserva->created_by
        ]);
    }

    /**
     * Obtener datos del servicio para la caja
     */
    private function obtenerDatosServicio(Reserva $reserva): array
    {
        $servicio = $reserva->servicio;
        $precioUnitario = $servicio->servicio_precio_descuento ?? $servicio->precio_servicio;

        // Datos por defecto
        $datos = [
            'origen' => 'N/A',
            'destino' => 'N/A',
            'fecha_servicio' => now(),
            'precio_unitario' => $precioUnitario
        ];

        // Si es ruta
        if ($reserva->id_ruta_activa && $reserva->rutaActiva) {
            $ruta = $reserva->rutaActiva->ruta;
            if ($ruta) {
                $datos['origen'] = $ruta->rutas_origen;
                $datos['destino'] = $ruta->rutas_destino;
            }
            $datos['fecha_servicio'] = $reserva->rutaActiva->ruta_activa_fecha;
        }

        // Si es tour
        if ($reserva->id_tour_activo && $reserva->tourActivo) {
            $tour = $reserva->tourActivo->tour;
            if ($tour) {
                $datos['origen'] = 'Tour';
                $datos['destino'] = $tour->tours_nombre;
            }
            $datos['fecha_servicio'] = $reserva->tourActivo->tour_activo_fecha;
        }

        return $datos;
    }

    /**
     * Obtener control de ventas del día
     */
    public function obtenerControlVentasDia($fecha = null): array
    {
        $fecha = $fecha ?? today();

        $reservas = Reserva::with(['estado', 'servicio'])
            ->whereHas('rutaActiva', function ($q) use ($fecha) {
                $q->whereDate('ruta_activa_fecha', $fecha);
            })
            ->orWhereHas('tourActivo', function ($q) use ($fecha) {
                $q->whereDate('tour_activo_fecha', $fecha);
            })
            ->whereNull('deleted_at')
            ->get();

        $resumen = [
            'fecha' => $fecha->format('Y-m-d'),
            'total_servicios' => 0,
            'total_pasajeros' => 0,
            'ingresos_totales' => 0,
            'por_cobrar' => ['cantidad' => 0, 'monto' => 0],
            'cobrados' => ['cantidad' => 0, 'monto' => 0],
            'confirmar_recibido' => ['cantidad' => 0, 'monto' => 0],
            'clasificacion_detallada' => []
        ];

        foreach ($reservas as $reserva) {
            $escenario = $this->transferenciaService->determinarEscenario($reserva->id_reservas);

            // Solo contar ventas directas de Magic Travel
            if ($escenario['escenario'] === 'VENTA_DIRECTA') {
                $resumen['total_servicios']++;
                $resumen['total_pasajeros'] += $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
                $resumen['ingresos_totales'] += $reserva->reservas_cobrar_a_pax;

                $clasificacion = $this->clasificarReservaParaVentas($reserva);
                $resumen[$clasificacion]['cantidad']++;
                $resumen[$clasificacion]['monto'] += $reserva->reservas_cobrar_a_pax;

                $resumen['clasificacion_detallada'][] = [
                    'reserva_id' => $reserva->id_reservas,
                    'cliente' => $reserva->reservas_nombres_cliente . ' ' . $reserva->reservas_apellidos_cliente,
                    'monto' => $reserva->reservas_cobrar_a_pax,
                    'estado' => $reserva->estado->estado_nombre,
                    'clasificacion' => $clasificacion
                ];
            }
        }

        return $resumen;
    }

    /**
     * Clasificar reserva para módulo de ventas
     */
    private function clasificarReservaParaVentas(Reserva $reserva): string
    {
        $estadoNombre = strtolower($reserva->estado->estado_nombre);
        $tieneCaja = Caja::where('id_reservas', $reserva->id_reservas)->exists();

        if ($tieneCaja || str_contains($estadoNombre, 'pagada')) {
            return 'cobrados';
        }

        if (str_contains($estadoNombre, 'confirmar') || str_contains($estadoNombre, 'recibido')) {
            return 'confirmar_recibido';
        }

        return 'por_cobrar';
    }

    /**
     * Procesar liquidación de ruta
     */
    public function procesarLiquidacionRuta(int $rutaActivaId, int $usuarioId): array
    {
        $reservas = Reserva::where('id_ruta_activa', $rutaActivaId)
            ->whereNull('deleted_at')
            ->get();

        $resultado = [
            'ruta_activa_id' => $rutaActivaId,
            'total_reservas' => $reservas->count(),
            'reservas_procesadas' => 0,
            'registros_caja_creados' => 0,
            'errores' => []
        ];

        foreach ($reservas as $reserva) {
            try {
                $escenario = $this->transferenciaService->determinarEscenario($reserva->id_reservas);

                if ($escenario['escenario'] === 'VENTA_DIRECTA') {
                    $caja = $this->crearRegistroCajaAutomatico($reserva);
                    if ($caja) {
                        $resultado['registros_caja_creados']++;
                    }
                }

                $resultado['reservas_procesadas']++;
            } catch (\Exception $e) {
                $resultado['errores'][] = [
                    'reserva_id' => $reserva->id_reservas,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $resultado;
    }
}
