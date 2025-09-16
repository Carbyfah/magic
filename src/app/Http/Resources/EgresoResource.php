<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EgresoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_egresos_ruta_activa,
            'detalles_egreso' => [
                'descripcion' => $this->descripcion_egreso,
                'tipo' => $this->tipo_egreso,
                'fecha' => $this->fecha_egreso?->format('Y-m-d'),
                'fecha_formateada' => $this->fecha_egreso?->format('d/m/Y'),
                'observaciones' => $this->observaciones_egreso,
            ],
            'monto' => [
                'cantidad' => $this->cantidad_egreso,
                'cantidad_formateada' => 'Q' . number_format($this->cantidad_egreso, 2),
            ],
            'ruta_activa' => $this->when($this->relationLoaded('rutaActiva'), function () {
                return [
                    'id' => $this->rutaActiva->id_ruta_activa,
                    'fecha' => $this->rutaActiva->ruta_activa_fecha?->format('Y-m-d'),
                    'ruta' => $this->rutaActiva->ruta ? [
                        'origen' => $this->rutaActiva->ruta->rutas_origen,
                        'destino' => $this->rutaActiva->ruta->rutas_destino,
                        'descripcion' => $this->rutaActiva->ruta->rutas_origen . ' → ' . $this->rutaActiva->ruta->rutas_destino,
                    ] : null,
                    'vehiculo' => $this->rutaActiva->vehiculo ? [
                        'placa' => $this->rutaActiva->vehiculo->vehiculo_placa,
                    ] : null,
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            'computed' => [
                'tiene_observaciones' => !empty($this->observaciones_egreso),
                'es_gasto_alto' => $this->cantidad_egreso > 500,
                'codigo_egreso' => 'EGR-' . str_pad($this->id_egresos_ruta_activa, 6, '0', STR_PAD_LEFT),
                'categoria_monto' => $this->categorizarMonto(),
            ],
        ];
    }

    /**
     * Categorizar monto del egreso
     */
    private function categorizarMonto(): string
    {
        if ($this->cantidad_egreso < 50) {
            return 'Bajo';
        } elseif ($this->cantidad_egreso < 200) {
            return 'Medio';
        } elseif ($this->cantidad_egreso < 500) {
            return 'Alto';
        } else {
            return 'Muy Alto';
        }
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'links' => [
                'self' => route('egresos.show', ['egreso' => $this->id_egresos_ruta_activa]),
                'update' => route('egresos.update', ['egreso' => $this->id_egresos_ruta_activa]),
                'destroy' => route('egresos.destroy', ['egreso' => $this->id_egresos_ruta_activa]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Egreso');
    }
}
