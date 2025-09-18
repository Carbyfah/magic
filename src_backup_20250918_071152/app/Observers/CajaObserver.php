<?php

namespace App\Observers;

use App\Models\Caja;
use InvalidArgumentException;

class CajaObserver
{
    /**
     * Handle the Caja "creating" event.
     * Reemplaza: tr_caja_calcular_total_pax
     */
    public function creating(Caja $caja): void
    {
        $this->calcularTotalPax($caja);
        $this->validarDatosFinancieros($caja);
    }

    /**
     * Handle the Caja "updating" event.
     * Reemplaza: tr_caja_actualizar_total_pax
     */
    public function updating(Caja $caja): void
    {
        // Solo recalcular si cambiaron las cantidades de PAX
        if ($caja->isDirty(['pax_adultos', 'pax_ninos'])) {
            $this->calcularTotalPax($caja);
        }

        // Validar consistencia financiera si cambiaron precios
        if ($caja->isDirty(['precio_unitario', 'precio_total', 'servicio_cobrar_pax'])) {
            $this->validarDatosFinancieros($caja);
        }
    }

    /**
     * Handle the Caja "saved" event.
     */
    public function saved(Caja $caja): void
    {
        // Log para auditoría de movimientos de caja
        if ($caja->wasChanged(['precio_total', 'servicio_cobrar_pax'])) {
            \Log::info('Movimiento en caja registrado', [
                'caja_id' => $caja->id_caja,
                'fecha_servicio' => $caja->fecha_servicio,
                'total_pax' => $caja->total_pax,
                'precio_total' => $caja->precio_total,
                'servicio_cobrar_pax' => $caja->servicio_cobrar_pax,
                'reserva_id' => $caja->id_reservas
            ]);
        }
    }

    /**
     * Calcular total de pasajeros automáticamente
     */
    private function calcularTotalPax(Caja $caja): void
    {
        if ($caja->pax_adultos < 0) {
            throw new InvalidArgumentException('La cantidad de adultos no puede ser negativa');
        }

        if ($caja->pax_ninos < 0) {
            throw new InvalidArgumentException('La cantidad de niños no puede ser negativa');
        }

        $caja->total_pax = $caja->pax_adultos + ($caja->pax_ninos ?? 0);
    }

    /**
     * Validar consistencia de datos financieros
     */
    private function validarDatosFinancieros(Caja $caja): void
    {
        // Validar que los precios sean positivos
        if ($caja->precio_unitario < 0) {
            throw new InvalidArgumentException('El precio unitario no puede ser negativo');
        }

        if ($caja->precio_total < 0) {
            throw new InvalidArgumentException('El precio total no puede ser negativo');
        }

        if ($caja->servicio_cobrar_pax < 0) {
            throw new InvalidArgumentException('El monto a cobrar no puede ser negativo');
        }

        // Validar que el precio total no exceda demasiado el precio unitario * pax
        // (permitir variación por descuentos, pero detectar inconsistencias graves)
        $precioCalculado = $caja->precio_unitario * $caja->total_pax;
        $diferencia = abs($caja->precio_total - $precioCalculado);
        $porcentajeDiferencia = $precioCalculado > 0 ? ($diferencia / $precioCalculado) * 100 : 0;

        // Si la diferencia es mayor al 50%, puede ser un error de captura
        if ($porcentajeDiferencia > 50) {
            \Log::warning('Posible inconsistencia en precios de caja', [
                'caja_id' => $caja->id_caja ?? 'nuevo',
                'precio_unitario' => $caja->precio_unitario,
                'total_pax' => $caja->total_pax,
                'precio_calculado' => $precioCalculado,
                'precio_total' => $caja->precio_total,
                'diferencia_porcentaje' => $porcentajeDiferencia
            ]);
        }
    }
}
