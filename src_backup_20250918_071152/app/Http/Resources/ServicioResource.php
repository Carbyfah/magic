<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_servicio,
            'configuracion_precios' => [
                'precio_base' => $this->precio_servicio,
                'precio_base_formateado' => 'Q' . number_format($this->precio_servicio, 2),
                'precio_descuento' => $this->servicio_precio_descuento,
                'precio_descuento_formateado' => $this->servicio_precio_descuento
                    ? 'Q' . number_format($this->servicio_precio_descuento, 2)
                    : null,
                'descuento_porcentaje' => $this->servicio_descuento_porcentaje,
                'descuento_porcentaje_formateado' => $this->servicio_descuento_porcentaje
                    ? $this->servicio_descuento_porcentaje . '%'
                    : null,
                'monto_descuento' => $this->precio_servicio && $this->servicio_precio_descuento
                    ? $this->precio_servicio - $this->servicio_precio_descuento
                    : 0,
                'monto_descuento_formateado' => $this->precio_servicio && $this->servicio_precio_descuento
                    ? 'Q' . number_format($this->precio_servicio - $this->servicio_precio_descuento, 2)
                    : null,
            ],
            'configuracion_servicio' => [
                'activo' => $this->servicio_activo,
                'estado_texto' => $this->servicio_activo ? 'Activo' : 'Inactivo',
                'observaciones' => $this->servicio_observaciones,
                'tiene_descuento' => !empty($this->servicio_precio_descuento),
            ],
            'ruta_activa' => $this->when($this->relationLoaded('rutaActiva') && $this->rutaActiva, function () {
                return [
                    'id' => $this->rutaActiva->id_ruta_activa,
                    'fecha' => $this->rutaActiva->ruta_activa_fecha?->format('Y-m-d'),
                    'fecha_formateada' => $this->rutaActiva->ruta_activa_fecha?->format('d/m/Y'),
                    'hora' => $this->rutaActiva->ruta_activa_hora,
                    'ruta' => $this->when($this->rutaActiva->relationLoaded('ruta'), function () {
                        return [
                            'id' => $this->rutaActiva->ruta->id_rutas,
                            'origen' => $this->rutaActiva->ruta->rutas_origen,
                            'destino' => $this->rutaActiva->ruta->rutas_destino,
                            'descripcion' => $this->rutaActiva->ruta->rutas_origen . ' → ' . $this->rutaActiva->ruta->rutas_destino,
                            'precio_base_ruta' => $this->rutaActiva->ruta->rutas_precio_base,
                        ];
                    }),
                    'vehiculo' => $this->when($this->rutaActiva->relationLoaded('vehiculo'), function () {
                        return [
                            'id' => $this->rutaActiva->vehiculo->vehiculo_id,
                            'placa' => $this->rutaActiva->vehiculo->vehiculo_placa,
                            'capacidad' => $this->rutaActiva->vehiculo->vehiculo_capacidad,
                            'tipo' => $this->rutaActiva->vehiculo->vehiculo_tipo,
                        ];
                    }),
                    'estado' => $this->when($this->rutaActiva->relationLoaded('estado'), function () {
                        return [
                            'id' => $this->rutaActiva->estado->estado_id,
                            'nombre' => $this->rutaActiva->estado->estado_nombre,
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
                            'id' => $this->tourActivo->tour->id_tours,
                            'nombre' => $this->tourActivo->tour->tours_nombre,
                            'descripcion' => $this->tourActivo->tour->tours_descripcion,
                            'precio_base_tour' => $this->tourActivo->tour->tours_precio_base ?? null,
                        ];
                    }),
                ];
            }),
            'reservas' => $this->when($this->relationLoaded('reservas'), function () {
                $totalReservas = $this->reservas->count();
                $totalPasajeros = $this->reservas->sum(function ($reserva) {
                    return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
                });
                $ingresoTotal = $this->reservas->sum('reservas_cobrar_a_pax');

                return [
                    'total_reservas' => $totalReservas,
                    'total_pasajeros' => $totalPasajeros,
                    'ingreso_total' => $ingresoTotal,
                    'ingreso_total_formateado' => 'Q' . number_format($ingresoTotal, 2),
                    'promedio_por_reserva' => $totalReservas > 0 ? round($ingresoTotal / $totalReservas, 2) : 0,
                    'promedio_pax_por_reserva' => $totalReservas > 0 ? round($totalPasajeros / $totalReservas, 2) : 0,
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'eliminado_en' => $this->deleted_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            'computed' => [
                'es_activo' => $this->servicio_activo,
                'es_ruta' => !empty($this->id_ruta_activa),
                'es_tour' => !empty($this->id_tour_activo),
                'tiene_descuento' => !empty($this->servicio_precio_descuento),
                'tiene_observaciones' => !empty($this->servicio_observaciones),
                'precio_efectivo' => $this->servicio_precio_descuento ?? $this->precio_servicio,
                'precio_efectivo_formateado' => 'Q' . number_format($this->servicio_precio_descuento ?? $this->precio_servicio, 2),
                'porcentaje_descuento_real' => $this->precio_servicio > 0 && $this->servicio_precio_descuento
                    ? round((($this->precio_servicio - $this->servicio_precio_descuento) / $this->precio_servicio) * 100, 2)
                    : 0,
                'ahorro_cliente' => $this->precio_servicio && $this->servicio_precio_descuento
                    ? $this->precio_servicio - $this->servicio_precio_descuento
                    : 0,
                'codigo_servicio' => 'SRV-' . str_pad($this->id_servicio, 6, '0', STR_PAD_LEFT),
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
                'self' => route('servicios.show', ['servicio' => $this->id_servicio]),
                'update' => route('servicios.update', ['servicio' => $this->id_servicio]),
                'destroy' => route('servicios.destroy', ['servicio' => $this->id_servicio]),
                'reservas' => route('servicios.reservas', ['servicio' => $this->id_servicio]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Servicio');
    }
}
