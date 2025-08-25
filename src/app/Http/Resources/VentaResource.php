<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VentaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'numero_venta' => $this->numero_venta,
            'reserva' => [
                'id' => $this->reserva->id ?? null,
                'numero_reserva' => $this->reserva->numero_reserva ?? null,
                'fecha_viaje' => $this->reserva->fecha_viaje?->format('Y-m-d') ?? null,
                'ruta' => $this->reserva->ruta->nombre_ruta ?? null,
            ],
            'cliente' => $this->whenLoaded('cliente', function () {
                return [
                    'id' => $this->cliente->id,
                    'codigo' => $this->cliente->codigo_cliente,
                    'nombre' => $this->cliente->nombre_completo,
                ];
            }),
            'agencia' => $this->whenLoaded('agencia', function () {
                return [
                    'id' => $this->agencia->id,
                    'codigo' => $this->agencia->codigo_agencia,
                    'nombre' => $this->agencia->nombre_comercial,
                ];
            }),
            'vendedor' => [
                'id' => $this->empleadoVendedor->id ?? null,
                'codigo' => $this->empleadoVendedor->codigo_empleado ?? null,
                'nombre' => $this->empleadoVendedor->nombre_completo ?? null,
            ],
            'fecha_hora_venta' => $this->fecha_hora_venta?->format('Y-m-d H:i:s'),
            'tipo_venta' => [
                'id' => $this->tipoVenta->id ?? null,
                'codigo' => $this->tipoVenta->codigo ?? null,
                'nombre' => $this->tipoVenta->nombre_tipo ?? null,
                'genera_comision' => $this->tipoVenta->genera_comision ?? false,
            ],
            'detalle' => [
                'cantidad_adultos' => $this->cantidad_adultos,
                'cantidad_ninos' => $this->cantidad_ninos,
                'precio_unitario_adulto' => $this->precio_unitario_adulto,
                'precio_unitario_nino' => $this->precio_unitario_nino,
            ],
            'montos' => [
                'subtotal' => $this->subtotal,
                'descuento_monto' => $this->descuento_monto,
                'porcentaje_descuento' => $this->porcentaje_descuento,
                'impuesto_monto' => $this->impuesto_monto,
                'total_venta' => $this->total_venta,
            ],
            'comisiones' => [
                'comision_agencia' => $this->comision_agencia,
                'comision_vendedor' => $this->comision_vendedor,
            ],
            'estado_venta' => [
                'id' => $this->estadoVenta->id ?? null,
                'codigo' => $this->estadoVenta->codigo ?? null,
                'nombre' => $this->estadoVenta->nombre_estado ?? null,
                'modificable' => $this->estadoVenta->modificable ?? false,
                'color' => $this->estadoVenta->color_hex ?? null,
            ],
            'pagos' => [
                'total_pagado' => $this->total_pagado ?? 0,
                'saldo_pendiente' => $this->saldo_pendiente ?? 0,
                'esta_pagada' => $this->esta_pagada ?? false,
            ],
            'es_modificable' => $this->es_modificable,
            'notas' => $this->notas,
            'pagos_detalle' => $this->whenLoaded('pagos', function () {
                return $this->pagos->map(function ($pago) {
                    return [
                        'id' => $pago->id,
                        'numero_pago' => $pago->numero_pago,
                        'monto' => $pago->monto,
                        'forma_pago' => $pago->formaPago->nombre_forma ?? null,
                        'fecha_pago' => $pago->fecha_pago?->format('Y-m-d H:i:s'),
                        'estado' => $pago->estadoPago->nombre_estado ?? null,
                    ];
                });
            }),
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
