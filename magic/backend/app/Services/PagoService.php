<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Caja;

class PagoService
{
    /**
     * Determinar forma de pago de una reserva
     * Reemplaza: fn_forma_pago_reserva
     */
    public function determinarFormaPago(int $reservaId): array
    {
        $reserva = Reserva::with('estado')->findOrFail($reservaId);
        $tieneCaja = $this->verificarRegistroEnCaja($reservaId);
        $estadoNombre = strtolower($reserva->estado->estado_nombre);

        $formaPago = $this->clasificarFormaPago($estadoNombre, $tieneCaja);

        return [
            'reserva_id' => $reservaId,
            'forma_pago' => $formaPago,
            'estado_reserva' => $reserva->estado->estado_nombre,
            'tiene_registro_caja' => $tieneCaja,
            'monto_reserva' => $reserva->reservas_cobrar_a_pax,
            'descripcion' => $this->obtenerDescripcionPago($formaPago),
            'acciones_requeridas' => $this->obtenerAccionesRequeridas($formaPago)
        ];
    }

    /**
     * Clasificar forma de pago según estado y registro en caja
     */
    private function clasificarFormaPago(string $estadoNombre, bool $tieneCaja): string
    {
        if ($tieneCaja) {
            return 'PAGO_CAJA';
        }

        if (str_contains($estadoNombre, 'confirmar') || str_contains($estadoNombre, 'recibido')) {
            return 'PAGO_CONDUCTOR';
        }

        if (str_contains($estadoNombre, 'pagada') || str_contains($estadoNombre, 'cobrado')) {
            return 'PAGADO';
        }

        if (str_contains($estadoNombre, 'pendiente') || str_contains($estadoNombre, 'confirmada')) {
            return 'PENDIENTE';
        }

        return 'DESCONOCIDO';
    }

    /**
     * Verificar si existe registro en caja
     */
    private function verificarRegistroEnCaja(int $reservaId): bool
    {
        return Caja::where('id_reservas', $reservaId)
            ->whereNull('deleted_at')
            ->exists();
    }

    /**
     * Obtener descripción de la forma de pago
     */
    private function obtenerDescripcionPago(string $formaPago): string
    {
        $descripciones = [
            'PAGO_CAJA' => 'Cliente pagó directamente en oficina/caja',
            'PAGO_CONDUCTOR' => 'Cliente pagó al conductor del vehículo',
            'PAGADO' => 'Pago confirmado pero sin especificar forma',
            'PENDIENTE' => 'Cliente no ha realizado el pago',
            'DESCONOCIDO' => 'No se puede determinar la forma de pago'
        ];

        return $descripciones[$formaPago] ?? 'Forma de pago no definida';
    }

    /**
     * Obtener acciones requeridas según forma de pago
     */
    private function obtenerAccionesRequeridas(string $formaPago): array
    {
        $acciones = [
            'PAGO_CAJA' => [
                'confirmar_pago' => false,
                'crear_registro_caja' => false,
                'seguimiento_conductor' => false,
                'descripcion' => 'Pago completo, sin acciones pendientes'
            ],
            'PAGO_CONDUCTOR' => [
                'confirmar_pago' => true,
                'crear_registro_caja' => true,
                'seguimiento_conductor' => true,
                'descripcion' => 'Confirmar que conductor entregó dinero a ventas'
            ],
            'PAGADO' => [
                'confirmar_pago' => false,
                'crear_registro_caja' => false,
                'seguimiento_conductor' => false,
                'descripcion' => 'Verificar forma de pago específica'
            ],
            'PENDIENTE' => [
                'confirmar_pago' => false,
                'crear_registro_caja' => false,
                'seguimiento_conductor' => false,
                'descripcion' => 'Gestionar cobro con cliente'
            ]
        ];

        return $acciones[$formaPago] ?? [
            'confirmar_pago' => false,
            'crear_registro_caja' => false,
            'seguimiento_conductor' => false,
            'descripcion' => 'Revisar estado manualmente'
        ];
    }

    /**
     * Obtener resumen de pagos por clasificación
     */
    public function obtenerResumenPagos(): array
    {
        $reservas = Reserva::with('estado')->whereNull('deleted_at')->get();
        $resumen = [];

        foreach ($reservas as $reserva) {
            try {
                $analisis = $this->determinarFormaPago($reserva->id_reservas);
                $formaPago = $analisis['forma_pago'];

                if (!isset($resumen[$formaPago])) {
                    $resumen[$formaPago] = [
                        'total_reservas' => 0,
                        'monto_total' => 0,
                        'descripcion' => $analisis['descripcion']
                    ];
                }

                $resumen[$formaPago]['total_reservas']++;
                $resumen[$formaPago]['monto_total'] += $reserva->reservas_cobrar_a_pax;
            } catch (\Exception $e) {
                \Log::warning('Error analizando forma de pago', [
                    'reserva_id' => $reserva->id_reservas,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $resumen;
    }

    /**
     * Marcar pago como confirmado (conductor a caja)
     */
    public function confirmarPagoConductor(int $reservaId, int $usuarioId): array
    {
        $reserva = Reserva::findOrFail($reservaId);
        $analisis = $this->determinarFormaPago($reservaId);

        if ($analisis['forma_pago'] !== 'PAGO_CONDUCTOR') {
            throw new \InvalidArgumentException('Esta reserva no está marcada como pago a conductor');
        }

        // Cambiar estado a pagada
        $estadoPagada = \App\Models\Estado::where('estado_nombre', 'like', '%pagada%')->first();

        if ($estadoPagada) {
            $reserva->update(['estado_id' => $estadoPagada->estado_id]);
        }

        // Crear registro en caja
        $caja = $this->crearRegistroCaja($reserva, $usuarioId);

        return [
            'reserva_id' => $reservaId,
            'confirmado' => true,
            'caja_creada' => $caja->id_caja,
            'monto_confirmado' => $reserva->reservas_cobrar_a_pax
        ];
    }

    /**
     * Crear registro en caja desde pago de conductor
     */
    private function crearRegistroCaja(Reserva $reserva, int $usuarioId): Caja
    {
        // Obtener datos del servicio
        $origen = 'N/A';
        $destino = 'N/A';
        $fechaServicio = now();

        if ($reserva->id_ruta_activa) {
            $ruta = $reserva->rutaActiva->ruta ?? null;
            if ($ruta) {
                $origen = $ruta->rutas_origen;
                $destino = $ruta->rutas_destino;
            }
            $fechaServicio = $reserva->rutaActiva->ruta_activa_fecha ?? now();
        } elseif ($reserva->id_tour_activo) {
            $tour = $reserva->tourActivo->tour ?? null;
            if ($tour) {
                $destino = $tour->tours_nombre;
            }
            $fechaServicio = $reserva->tourActivo->tour_activo_fecha ?? now();
        }

        return Caja::create([
            'origen' => $origen,
            'destino' => $destino,
            'fecha_servicio' => $fechaServicio,
            'pax_adultos' => $reserva->reservas_cantidad_adultos,
            'pax_ninos' => $reserva->reservas_cantidad_ninos ?? 0,
            'total_pax' => $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0),
            'precio_unitario' => $reserva->servicio->servicio_precio_descuento ?? $reserva->servicio->precio_servicio,
            'precio_total' => $reserva->reservas_cobrar_a_pax,
            'direccion' => $reserva->reservas_direccion_abordaje,
            'servicio_cobrar_pax' => $reserva->reservas_cobrar_a_pax,
            'servicio_precio_descuento' => $reserva->servicio->servicio_precio_descuento ?? $reserva->servicio->precio_servicio,
            'id_reservas' => $reserva->id_reservas,
            'estado_id' => $reserva->estado_id,
            'created_by' => $usuarioId
        ]);
    }
}
