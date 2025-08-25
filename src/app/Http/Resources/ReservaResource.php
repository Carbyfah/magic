<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'numero_reserva' => $this->numero_reserva,
            'empleado' => [
                'id' => $this->empleado->id ?? null,
                'codigo' => $this->empleado->codigo_empleado ?? null,
                'nombre' => $this->empleado->nombre_completo ?? null,
            ],
            'ruta' => [
                'id' => $this->ruta->id ?? null,
                'codigo' => $this->ruta->codigo_ruta ?? null,
                'nombre' => $this->ruta->nombre_ruta ?? null,
                'origen' => $this->ruta->ciudad_origen ?? null,
                'destino' => $this->ruta->ciudad_destino ?? null,
            ],
            'pasajeros' => [
                'pax_adultos' => $this->pax_adultos,
                'pax_ninos' => $this->pax_ninos,
                'pax_total' => $this->pax_total,
                'nombre_principal' => $this->nombre_pasajero_principal,
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
            'pickup' => [
                'hotel' => $this->hotel_pickup,
                'telefono' => $this->telefono_contacto,
                'hora' => $this->hora_pickup,
                'notas' => $this->notas_pickup,
            ],
            'fechas' => [
                'fecha_reservacion' => $this->fecha_reservacion?->format('Y-m-d'),
                'fecha_viaje' => $this->fecha_viaje?->format('Y-m-d'),
                'dias_para_viaje' => $this->dias_para_viaje,
                'es_hoy' => $this->es_hoy,
                'es_pasada' => $this->es_pasada,
            ],
            'voucher' => $this->voucher,
            'financiero' => [
                'precio_total' => $this->precio_total,
                'responsable_pago' => $this->responsable_pago,
                'requiere_cobro' => $this->requiere_cobro,
            ],
            'estado_reserva' => [
                'id' => $this->estadoReserva->id ?? null,
                'codigo' => $this->estadoReserva->codigo ?? null,
                'nombre' => $this->estadoReserva->nombre_estado ?? null,
                'editable' => $this->estadoReserva->editable ?? false,
                'color' => $this->estadoReserva->color_hex ?? null,
            ],
            'es_modificable' => $this->es_modificable,
            'puede_cancelarse' => $this->puedeCancelarse(),
            'venta' => $this->whenLoaded('venta', function () {
                return [
                    'id' => $this->venta->id,
                    'numero_venta' => $this->venta->numero_venta,
                    'total' => $this->venta->total_venta,
                    'estado' => $this->venta->estadoVenta->nombre_estado ?? null,
                ];
            }),
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
