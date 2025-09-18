<?php

namespace App\Observers;

use App\Models\Servicio;
use App\Services\PrecioService;

class ServicioObserver
{
    protected PrecioService $precioService;

    public function __construct(PrecioService $precioService)
    {
        $this->precioService = $precioService;
    }

    /**
     * Handle the Servicio "creating" event.
     * Reemplaza: tr_servicio_calcular_descuento
     */
    public function creating(Servicio $servicio): void
    {
        $this->calcularPrecioConDescuento($servicio);
    }

    /**
     * Handle the Servicio "updating" event.
     * Reemplaza: tr_servicio_actualizar_descuento
     */
    public function updating(Servicio $servicio): void
    {
        // Solo recalcular si cambió el precio base o el porcentaje de descuento
        if ($servicio->isDirty(['precio_servicio', 'servicio_descuento_porcentaje'])) {
            $this->calcularPrecioConDescuento($servicio);
        }
    }

    /**
     * Calcular precio con descuento automáticamente
     */
    private function calcularPrecioConDescuento(Servicio $servicio): void
    {
        // Validar que el precio base sea positivo
        if ($servicio->precio_servicio <= 0) {
            throw new \InvalidArgumentException('El precio del servicio debe ser mayor a 0');
        }

        // Validar rango de descuento
        if ($servicio->servicio_descuento_porcentaje !== null) {
            if ($servicio->servicio_descuento_porcentaje < 0 || $servicio->servicio_descuento_porcentaje > 100) {
                throw new \InvalidArgumentException('El porcentaje de descuento debe estar entre 0 y 100');
            }

            // Calcular precio con descuento
            if ($servicio->servicio_descuento_porcentaje > 0) {
                $servicio->servicio_precio_descuento = $this->precioService->calcularPrecioConDescuento(
                    $servicio->precio_servicio,
                    $servicio->servicio_descuento_porcentaje
                );
            } else {
                // Sin descuento
                $servicio->servicio_precio_descuento = $servicio->precio_servicio;
            }
        } else {
            // Sin descuento definido
            $servicio->servicio_precio_descuento = $servicio->precio_servicio;
        }
    }

    /**
     * Handle the Servicio "saved" event.
     * Para logging o notificaciones adicionales
     */
    public function saved(Servicio $servicio): void
    {
        // Aquí podríamos agregar logging de cambios de precios
        if ($servicio->wasChanged(['precio_servicio', 'servicio_descuento_porcentaje', 'servicio_precio_descuento'])) {
            \Log::info('Precio de servicio actualizado', [
                'servicio_id' => $servicio->id_servicio,
                'precio_base' => $servicio->precio_servicio,
                'descuento_porcentaje' => $servicio->servicio_descuento_porcentaje,
                'precio_final' => $servicio->servicio_precio_descuento,
                'tipo_servicio' => $servicio->tipo_servicio
            ]);
        }
    }
}
