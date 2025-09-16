<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Agencia;

class TransferenciaService
{
    /**
     * Determinar escenario de transferencia automáticamente
     * Reemplaza: fn_determinar_escenario_transferencia
     */
    public function determinarEscenario(int $reservaId): array
    {
        $reserva = Reserva::with(['servicio.rutaActiva.ruta.agencia', 'servicio.tourActivo.tour.agencia', 'agenciaTransferida'])
            ->findOrFail($reservaId);

        $magicTravelId = $this->obtenerMagicTravelId();
        $agenciaServicio = $this->obtenerAgenciaServicio($reserva);
        $agenciaTransferida = $reserva->id_agencia_transferida;

        $escenario = $this->clasificarEscenario($agenciaServicio, $agenciaTransferida, $magicTravelId);

        return [
            'reserva_id' => $reservaId,
            'escenario' => $escenario,
            'agencia_servicio_id' => $agenciaServicio,
            'agencia_transferida_id' => $agenciaTransferida,
            'magic_travel_id' => $magicTravelId,
            'descripcion' => $this->obtenerDescripcionEscenario($escenario),
            'implicaciones_financieras' => $this->obtenerImplicacionesFinancieras($escenario)
        ];
    }

    /**
     * Clasificar según los 4 escenarios definidos
     */
    private function clasificarEscenario(?int $agenciaServicio, ?int $agenciaTransferida, int $magicTravelId): string
    {
        if ($agenciaServicio === $magicTravelId) {
            if ($agenciaTransferida === null) {
                return 'VENTA_DIRECTA';
            } elseif ($agenciaTransferida === $magicTravelId) {
                return 'REUBICACION_INTERNA';
            } else {
                return 'MAGIC_TRANSFIERE';
            }
        } else {
            if ($agenciaTransferida === null) {
                return 'MAGIC_RECIBE_OPERA';
            } elseif ($agenciaTransferida !== $magicTravelId) {
                return 'MAGIC_PUENTE';
            } else {
                return 'CASO_ESPECIAL';
            }
        }
    }

    /**
     * Obtener ID de Magic Travel
     */
    private function obtenerMagicTravelId(): int
    {
        $agencia = Agencia::where('agencias_nombre', 'like', '%magic travel%')->first();

        if (!$agencia) {
            throw new \Exception('No se encontró la agencia Magic Travel en el sistema');
        }

        return $agencia->id_agencias;
    }

    /**
     * Determinar agencia que opera el servicio
     */
    private function obtenerAgenciaServicio(Reserva $reserva): ?int
    {
        if ($reserva->id_ruta_activa && $reserva->servicio->rutaActiva) {
            return $reserva->servicio->rutaActiva->ruta->id_agencias ?? null;
        }

        if ($reserva->id_tour_activo && $reserva->servicio->tourActivo) {
            return $reserva->servicio->tourActivo->tour->id_agencias ?? null;
        }

        return null;
    }

    /**
     * Obtener descripción del escenario
     */
    private function obtenerDescripcionEscenario(string $escenario): string
    {
        $descripciones = [
            'VENTA_DIRECTA' => 'Magic Travel vende directamente al cliente y opera el servicio',
            'REUBICACION_INTERNA' => 'Cliente se mueve entre servicios de Magic Travel (sin intercambio financiero)',
            'MAGIC_TRANSFIERE' => 'Magic Travel recibe cliente pero transfiere operación a otra agencia',
            'MAGIC_RECIBE_OPERA' => 'Otra agencia envía cliente y Magic Travel opera el servicio',
            'MAGIC_PUENTE' => 'Magic Travel actúa como intermediario entre dos agencias',
            'CASO_ESPECIAL' => 'Escenario no contemplado en los casos estándar'
        ];

        return $descripciones[$escenario] ?? 'Escenario no definido';
    }

    /**
     * Obtener implicaciones financieras
     */
    private function obtenerImplicacionesFinancieras(string $escenario): array
    {
        $implicaciones = [
            'VENTA_DIRECTA' => [
                'cobra_cliente' => 'Magic Travel',
                'opera_servicio' => 'Magic Travel',
                'ganancia_completa' => true,
                'requiere_comision' => false,
                'crear_en_caja' => true
            ],
            'REUBICACION_INTERNA' => [
                'cobra_cliente' => 'Magic Travel',
                'opera_servicio' => 'Magic Travel',
                'ganancia_completa' => true,
                'requiere_comision' => false,
                'crear_en_caja' => false // Ya existe registro
            ],
            'MAGIC_TRANSFIERE' => [
                'cobra_cliente' => 'Magic Travel',
                'opera_servicio' => 'Agencia Externa',
                'ganancia_completa' => false,
                'requiere_comision' => true,
                'crear_en_caja' => false
            ],
            'MAGIC_RECIBE_OPERA' => [
                'cobra_cliente' => 'Agencia Externa',
                'opera_servicio' => 'Magic Travel',
                'ganancia_completa' => false,
                'requiere_comision' => true,
                'crear_en_caja' => false
            ],
            'MAGIC_PUENTE' => [
                'cobra_cliente' => 'Magic Travel',
                'opera_servicio' => 'Agencia Externa',
                'ganancia_completa' => false,
                'requiere_comision' => true,
                'crear_en_caja' => false
            ]
        ];

        return $implicaciones[$escenario] ?? [
            'cobra_cliente' => 'No definido',
            'opera_servicio' => 'No definido',
            'ganancia_completa' => false,
            'requiere_comision' => false,
            'crear_en_caja' => false
        ];
    }

    /**
     * Verificar si debe crear registro en caja
     */
    public function debeCrearEnCaja(int $reservaId): bool
    {
        $escenario = $this->determinarEscenario($reservaId);
        return $escenario['implicaciones_financieras']['crear_en_caja'] ?? false;
    }

    /**
     * Obtener todas las reservas por escenario
     */
    public function obtenerReservasPorEscenario(): array
    {
        $reservas = Reserva::with(['servicio.rutaActiva.ruta.agencia', 'servicio.tourActivo.tour.agencia', 'agenciaTransferida'])
            ->whereNull('deleted_at')
            ->get();

        $resumenPorEscenario = [];

        foreach ($reservas as $reserva) {
            try {
                $analisis = $this->determinarEscenario($reserva->id_reservas);
                $escenario = $analisis['escenario'];

                if (!isset($resumenPorEscenario[$escenario])) {
                    $resumenPorEscenario[$escenario] = [
                        'total_reservas' => 0,
                        'monto_total' => 0,
                        'descripcion' => $analisis['descripcion']
                    ];
                }

                $resumenPorEscenario[$escenario]['total_reservas']++;
                $resumenPorEscenario[$escenario]['monto_total'] += $reserva->reservas_cobrar_a_pax;
            } catch (\Exception $e) {
                // Log del error pero continuar procesando
                \Log::warning('Error determinando escenario', [
                    'reserva_id' => $reserva->id_reservas,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $resumenPorEscenario;
    }
}
