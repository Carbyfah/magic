<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CajaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_caja,
            'servicio_basico' => [
                'origen' => $this->origen,
                'destino' => $this->destino,
                'ruta_completa' => $this->origen . ' → ' . $this->destino,
                'fecha_servicio' => $this->fecha_servicio?->format('Y-m-d'),
                'fecha_formateada' => $this->fecha_servicio?->format('d/m/Y'),
                'direccion' => $this->direccion,
            ],
            'pasajeros' => [
                'adultos' => $this->pax_adultos,
                'ninos' => $this->pax_ninos ?? 0,
                'total_pax' => $this->total_pax,
            ],
            'montos' => [
                'precio_unitario' => $this->precio_unitario,
                'precio_total' => $this->precio_total,
                'precio_descuento' => $this->servicio_precio_descuento,
                'cobrar_pax' => $this->servicio_cobrar_pax,
                'precio_unitario_formateado' => 'Q' . number_format($this->precio_unitario, 2),
                'precio_total_formateado' => 'Q' . number_format($this->precio_total, 2),
                'cobrar_pax_formateado' => 'Q' . number_format($this->servicio_cobrar_pax, 2),
            ],
            'reserva' => $this->when($this->relationLoaded('reserva') && $this->reserva, function () {
                return [
                    'id' => $this->reserva->id_reservas,
                    'cliente' => $this->reserva->reservas_nombres_cliente . ' ' . $this->reserva->reservas_apellidos_cliente,
                    'telefono' => $this->reserva->reservas_telefono,
                ];
            }),
            'estado' => $this->when($this->relationLoaded('estado'), function () {
                return [
                    'id' => $this->estado->estado_id,
                    'nombre' => $this->estado->estado_nombre,
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            'computed' => [
                'tiene_reserva' => !empty($this->id_reservas),
                'tiene_descuento' => !empty($this->servicio_precio_descuento),
                'diferencia_precio_cobro' => $this->precio_total - $this->servicio_cobrar_pax,
                'codigo_movimiento' => 'CAJ-' . str_pad($this->id_caja, 6, '0', STR_PAD_LEFT),
            ],
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'links' => [
                'self' => route('caja.show', ['caja' => $this->id_caja]),
                'update' => route('caja.update', ['caja' => $this->id_caja]),
                'destroy' => route('caja.destroy', ['caja' => $this->id_caja]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Caja');
    }
}
