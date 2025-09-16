<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_reservas,
            'cliente' => [
                'nombres' => $this->reservas_nombres_cliente,
                'apellidos' => $this->reservas_apellidos_cliente,
                'nombre_completo' => $this->reservas_nombres_cliente . ' ' . $this->reservas_apellidos_cliente,
                'telefono' => $this->reservas_telefono,
            ],
            'detalles_reserva' => [
                'cantidad_adultos' => $this->reservas_cantidad_adultos,
                'cantidad_ninos' => $this->reservas_cantidad_ninos ?? 0,
                'total_pasajeros' => $this->reservas_cantidad_adultos + ($this->reservas_cantidad_ninos ?? 0),
                'direccion_abordaje' => $this->reservas_direccion_abordaje,
                'observaciones' => $this->reservas_observaciones,
                'voucher' => $this->reservas_voucher,
                'monto_cobrar' => $this->reservas_cobrar_a_pax,
                'monto_formateado' => 'Q' . number_format($this->reservas_cobrar_a_pax, 2),
            ],
            'servicio' => $this->when($this->relationLoaded('servicio'), function () {
                return [
                    'id' => $this->servicio->id_servicio,
                    'precio_base' => $this->servicio->precio_servicio,
                    'precio_descuento' => $this->servicio->servicio_precio_descuento,
                    'precio_formateado' => 'Q' . number_format($this->servicio->precio_servicio, 2),
                ];
            }),
            'ruta_activa' => $this->when($this->relationLoaded('rutaActiva') && $this->rutaActiva, function () {
                return [
                    'id' => $this->rutaActiva->id_ruta_activa,
                    'fecha' => $this->rutaActiva->ruta_activa_fecha?->format('Y-m-d'),
                    'fecha_formateada' => $this->rutaActiva->ruta_activa_fecha?->format('d/m/Y'),
                    'hora' => $this->rutaActiva->ruta_activa_hora,
                    'ruta' => $this->when($this->rutaActiva->relationLoaded('ruta'), function () {
                        return [
                            'origen' => $this->rutaActiva->ruta->rutas_origen,
                            'destino' => $this->rutaActiva->ruta->rutas_destino,
                            'descripcion' => $this->rutaActiva->ruta->rutas_origen . ' → ' . $this->rutaActiva->ruta->rutas_destino,
                        ];
                    }),
                    'vehiculo' => $this->when($this->rutaActiva->relationLoaded('vehiculo'), function () {
                        return [
                            'placa' => $this->rutaActiva->vehiculo->vehiculo_placa,
                            'capacidad' => $this->rutaActiva->vehiculo->vehiculo_capacidad,
                            'tipo' => $this->rutaActiva->vehiculo->vehiculo_tipo,
                        ];
                    }),
                ];
            }),
            'tour_activo' => $this->when($this->relationLoaded('tourActivo') && $this->tourActivo, function () {
                return [
                    'id' => $this->tourActivo->id_tour_activo,
                    'fecha' => $this->tourActivo->tour_activo_fecha?->format('Y-m-d'),
                    'fecha_formateada' => $this->tourActivo->tour_activo_fecha?->format('d/m/Y'),
                    'tour' => $this->when($this->tourActivo->relationLoaded('tour'), function () {
                        return [
                            'nombre' => $this->tourActivo->tour->tours_nombre,
                            'descripcion' => $this->tourActivo->tour->tours_descripcion,
                        ];
                    }),
                ];
            }),
            'estado' => $this->when($this->relationLoaded('estado'), function () {
                return [
                    'id' => $this->estado->estado_id,
                    'nombre' => $this->estado->estado_nombre,
                    'codigo' => strtolower(str_replace(' ', '_', $this->estado->estado_nombre)),
                ];
            }),
            'agencia_transferida' => $this->when($this->relationLoaded('agenciaTransferida') && $this->agenciaTransferida, function () {
                return [
                    'id' => $this->agenciaTransferida->id_agencias,
                    'nombre' => $this->agenciaTransferida->agencias_nombre,
                ];
            }),
            'caja' => $this->when($this->relationLoaded('caja') && $this->caja, function () {
                return [
                    'id' => $this->caja->id_caja,
                    'fecha_servicio' => $this->caja->fecha_servicio?->format('Y-m-d'),
                    'precio_total' => $this->caja->precio_total,
                    'servicio_cobrar_pax' => $this->caja->servicio_cobrar_pax,
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'eliminado_en' => $this->deleted_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            // Campos calculados útiles para el frontend
            'computed' => [
                'es_tour' => !empty($this->id_tour_activo),
                'es_ruta' => !empty($this->id_ruta_activa),
                'tiene_transferencia' => !empty($this->id_agencia_transferida),
                'tiene_voucher' => !empty($this->reservas_voucher),
                'tiene_caja' => $this->relationLoaded('caja') && $this->caja !== null,
                'estado_codigo' => $this->relationLoaded('estado')
                    ? strtolower(str_replace(' ', '_', $this->estado->estado_nombre))
                    : null,
            ],
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'links' => [
                'self' => route('reservas.show', ['reserva' => $this->id_reservas]),
                'update' => route('reservas.update', ['reserva' => $this->id_reservas]),
                'destroy' => route('reservas.destroy', ['reserva' => $this->id_reservas]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        // Agregar headers personalizados si es necesario
        $response->header('X-Resource-Type', 'Reserva');
    }
}
