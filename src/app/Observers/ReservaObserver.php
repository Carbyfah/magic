<?php

namespace App\Observers;

use App\Models\Reserva;
use App\Services\PrecioService;
use App\Services\CapacidadService;
use App\Services\EstadoRutaService;
use App\Services\VentasService;
use InvalidArgumentException;

class ReservaObserver
{
    protected PrecioService $precioService;
    protected CapacidadService $capacidadService;
    protected EstadoRutaService $estadoRutaService;
    protected VentasService $ventasService;

    public function __construct(
        PrecioService $precioService,
        CapacidadService $capacidadService,
        EstadoRutaService $estadoRutaService,
        VentasService $ventasService
    ) {
        $this->precioService = $precioService;
        $this->capacidadService = $capacidadService;
        $this->estadoRutaService = $estadoRutaService;
        $this->ventasService = $ventasService;
    }

    /**
     * Handle the Reserva "creating" event.
     */
    public function creating(Reserva $reserva): void
    {
        $this->validarDatosBasicos($reserva);
        $this->validarCapacidadVehiculo($reserva);
        $this->calcularPrecioAutomatico($reserva);
    }

    /**
     * Handle the Reserva "updating" event.
     */
    public function updating(Reserva $reserva): void
    {
        if ($reserva->isDirty(['reservas_cantidad_adultos', 'reservas_cantidad_ninos', 'id_servicio'])) {
            $this->validarDatosBasicos($reserva);

            if ($reserva->isDirty(['id_ruta_activa', 'reservas_cantidad_adultos', 'reservas_cantidad_ninos'])) {
                $this->validarCapacidadVehiculo($reserva, $reserva->id_reservas);
            }

            $this->calcularPrecioAutomatico($reserva);
        }
    }

    /**
     * Handle the Reserva "saved" event.
     * ACTUALIZADO: Incluye auto-creación en caja
     */
    public function saved(Reserva $reserva): void
    {
        // Actualizar estado de ruta si es una reserva de ruta
        if ($reserva->id_ruta_activa) {
            $this->estadoRutaService->actualizarEstadoSegunOcupacion($reserva->id_ruta_activa);
        }

        // Auto-crear registro en caja para ventas directas pagadas
        if ($reserva->wasChanged('estado_id') || $reserva->wasRecentlyCreated) {
            try {
                $caja = $this->ventasService->crearRegistroCajaAutomatico($reserva);
                if ($caja) {
                    \Log::info('Registro en caja creado automáticamente', [
                        'reserva_id' => $reserva->id_reservas,
                        'caja_id' => $caja->id_caja,
                        'monto' => $caja->precio_total
                    ]);
                }
            } catch (\Exception $e) {
                \Log::warning('Error creando registro automático en caja', [
                    'reserva_id' => $reserva->id_reservas,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Log de cambios importantes
        if ($reserva->wasChanged(['reservas_cantidad_adultos', 'reservas_cantidad_ninos', 'reservas_cobrar_a_pax'])) {
            \Log::info('Reserva actualizada', [
                'reserva_id' => $reserva->id_reservas,
                'adultos' => $reserva->reservas_cantidad_adultos,
                'ninos' => $reserva->reservas_cantidad_ninos,
                'total_pax' => $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0),
                'monto_total' => $reserva->reservas_cobrar_a_pax,
                'servicio_id' => $reserva->id_servicio,
                'ruta_activa_id' => $reserva->id_ruta_activa
            ]);
        }
    }

    /**
     * Handle the Reserva "deleted" event.
     */
    public function deleted(Reserva $reserva): void
    {
        // Actualizar estado de ruta cuando se elimina una reserva
        if ($reserva->id_ruta_activa) {
            $this->estadoRutaService->actualizarEstadoSegunOcupacion($reserva->id_ruta_activa);
        }

        \Log::info('Reserva eliminada', [
            'reserva_id' => $reserva->id_reservas,
            'ruta_activa_id' => $reserva->id_ruta_activa,
            'liberados_adultos' => $reserva->reservas_cantidad_adultos,
            'liberados_ninos' => $reserva->reservas_cantidad_ninos ?? 0
        ]);
    }

    /**
     * Validar datos básicos de la reserva
     */
    private function validarDatosBasicos(Reserva $reserva): void
    {
        if ($reserva->reservas_cantidad_adultos <= 0) {
            throw new InvalidArgumentException('La cantidad de adultos debe ser mayor a 0');
        }

        if ($reserva->reservas_cantidad_ninos !== null && $reserva->reservas_cantidad_ninos < 0) {
            throw new InvalidArgumentException('La cantidad de niños no puede ser negativa');
        }

        $tieneRuta = !empty($reserva->id_ruta_activa);
        $tieneTour = !empty($reserva->id_tour_activo);

        if (!$tieneRuta && !$tieneTour) {
            throw new InvalidArgumentException('La reserva debe estar asociada a una ruta activa o un tour activo');
        }

        if ($tieneRuta && $tieneTour) {
            throw new InvalidArgumentException('La reserva no puede estar asociada a ambos: ruta y tour al mismo tiempo');
        }
    }

    /**
     * Validar capacidad del vehículo (solo para rutas)
     */
    private function validarCapacidadVehiculo(Reserva $reserva, ?int $reservaIdExcluir = null): void
    {
        if (empty($reserva->id_ruta_activa)) {
            return;
        }

        $totalPasajeros = $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);

        $puedeAcomodar = $this->capacidadService->validarCapacidad(
            $reserva->id_ruta_activa,
            $reserva->reservas_cantidad_adultos,
            $reserva->reservas_cantidad_ninos ?? 0,
            $reservaIdExcluir
        );

        if (!$puedeAcomodar) {
            $disponibilidad = $this->capacidadService->verificarDisponibilidad(
                $reserva->id_ruta_activa,
                $totalPasajeros
            );

            throw new InvalidArgumentException(
                "CAPACIDAD EXCEDIDA: {$disponibilidad['mensaje']}. " .
                    "Capacidad total: {$disponibilidad['capacidad_total']}, " .
                    "Ocupación actual: {$disponibilidad['ocupacion_actual']}, " .
                    "Espacios disponibles: {$disponibilidad['espacios_disponibles']}, " .
                    "Pasajeros solicitados: {$totalPasajeros}"
            );
        }
    }

    /**
     * Calcular precio automáticamente si no se especificó
     */
    private function calcularPrecioAutomatico(Reserva $reserva): void
    {
        if (empty($reserva->reservas_cobrar_a_pax) || $reserva->reservas_cobrar_a_pax == 0) {
            $precioCalculado = $this->precioService->calcularPrecioReserva(
                $reserva->id_servicio,
                $reserva->reservas_cantidad_adultos,
                $reserva->reservas_cantidad_ninos ?? 0
            );

            $reserva->reservas_cobrar_a_pax = $precioCalculado;
        }
    }
}
