<?php

namespace App\Services;

use App\Models\Servicio;
use InvalidArgumentException;

class PrecioService
{
    /**
     * Calcular precio total de una reserva
     * Reemplaza: fn_calcular_precio_reserva de la migración 12
     */
    public function calcularPrecioReserva(int $servicioId, int $adultos, int $ninos = 0): float
    {
        if ($adultos <= 0) {
            throw new InvalidArgumentException('La cantidad de adultos debe ser mayor a 0');
        }

        if ($ninos < 0) {
            throw new InvalidArgumentException('La cantidad de niños no puede ser negativa');
        }

        $servicio = Servicio::findOrFail($servicioId);
        $precioFinal = $servicio->precio_final; // usando accessor del modelo

        if ($servicio->tipo_servicio === 'PRIVADO') {
            // Precio fijo sin importar cantidad de pasajeros
            return $precioFinal;
        }

        // Servicio colectivo: precio por persona
        $precioNinos = $precioFinal * 0.75;

        return ($adultos * $precioFinal) + ($ninos * $precioNinos);
    }


    /**
     * Calcular precio con descuento personalizado
     */
    public function calcularPrecioConDescuento(float $precioBase, int $porcentajeDescuento): float
    {
        if ($porcentajeDescuento < 0 || $porcentajeDescuento > 100) {
            throw new InvalidArgumentException('El porcentaje de descuento debe estar entre 0 y 100');
        }

        return $precioBase * (1 - ($porcentajeDescuento / 100));
    }

    /**
     * Obtener desglose de precio
     */
    public function obtenerDesglosePrecio(int $servicioId, int $adultos, int $ninos = 0): array
    {
        $servicio = Servicio::findOrFail($servicioId);
        $precioFinal = $servicio->precio_final; // usa el accessor del modelo

        if ($servicio->tipo_servicio === 'PRIVADO') {
            return [
                'tipo_servicio' => 'PRIVADO',
                'precio_base' => $servicio->precio_servicio,
                'precio_con_descuento' => $precioFinal,
                'total_adultos' => $adultos,
                'total_ninos' => $ninos,
                'total_pasajeros' => $adultos + $ninos,
                'precio_total' => $precioFinal,
                'desglose' => [
                    'precio_fijo' => $precioFinal
                ]
            ];
        }

        // Servicio COLECTIVO: cálculo por persona
        $precioNinos = $precioFinal * 0.75;
        $totalAdultos = $adultos * $precioFinal;
        $totalNinos = $ninos * $precioNinos;

        return [
            'tipo_servicio' => 'COLECTIVO',
            'precio_base' => $servicio->precio_servicio,
            'precio_con_descuento' => $precioFinal,
            'precio_ninos' => $precioNinos,
            'total_adultos' => $adultos,
            'total_ninos' => $ninos,
            'total_pasajeros' => $adultos + $ninos,
            'precio_total' => $totalAdultos + $totalNinos,
            'desglose' => [
                'adultos' => [
                    'cantidad' => $adultos,
                    'precio_unitario' => $precioFinal,
                    'subtotal' => $totalAdultos
                ],
                'ninos' => [
                    'cantidad' => $ninos,
                    'precio_unitario' => $precioNinos,
                    'subtotal' => $totalNinos
                ]
            ]
        ];
    }
}
