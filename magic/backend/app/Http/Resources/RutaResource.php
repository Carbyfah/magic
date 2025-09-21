<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RutaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_rutas,
            'detalles_ruta' => [
                'origen' => $this->rutas_origen,
                'destino' => $this->rutas_destino,
                'descripcion_completa' => $this->rutas_origen . ' → ' . $this->rutas_destino,
                'descripcion' => $this->rutas_descripcion,
                'tiempo_estimado' => $this->rutas_tiempo_estimado,
                'distancia_km' => $this->rutas_distancia_km,
                'distancia_formateada' => $this->rutas_distancia_km ? $this->rutas_distancia_km . ' km' : null,
            ],
            'configuracion_financiera' => [
                'precio_base' => $this->rutas_precio_base,
                'precio_formateado' => 'Q' . number_format($this->rutas_precio_base, 2),
                'activa' => $this->rutas_activa,
                'estado_texto' => $this->rutas_activa ? 'Activa' : 'Inactiva',
            ],
            'agencia' => $this->when($this->relationLoaded('agencia'), function () {
                return [
                    'id' => $this->agencia->id_agencias,
                    'nombre' => $this->agencia->agencias_nombre,
                ];
            }),
            'rutas_activas' => $this->when($this->relationLoaded('rutasActivas'), function () {
                return $this->rutasActivas->map(function ($rutaActiva) {
                    return [
                        'id' => $rutaActiva->id_ruta_activa,
                        'fecha' => $rutaActiva->ruta_activa_fecha?->format('Y-m-d'),
                        'fecha_formateada' => $rutaActiva->ruta_activa_fecha?->format('d/m/Y'),
                        'hora' => $rutaActiva->ruta_activa_hora,
                        'estado' => $rutaActiva->estado->estado_nombre ?? 'Sin estado',
                        'vehiculo' => $rutaActiva->vehiculo ? [
                            'placa' => $rutaActiva->vehiculo->vehiculo_placa,
                            'capacidad' => $rutaActiva->vehiculo->vehiculo_capacidad,
                        ] : null,
                        'total_reservas' => $rutaActiva->reservas_count ?? 0,
                        'total_pasajeros' => $rutaActiva->reservas->sum(function ($reserva) {
                            return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
                        }) ?? 0,
                    ];
                });
            }),
            'estadisticas' => $this->when($this->relationLoaded('rutasActivas'), function () {
                $rutasActivas = $this->rutasActivas;
                $totalRutas = $rutasActivas->count();
                $totalReservas = $rutasActivas->sum('reservas_count') ?? 0;

                return [
                    'total_rutas_programadas' => $totalRutas,
                    'total_reservas' => $totalReservas,
                    'promedio_reservas_por_ruta' => $totalRutas > 0 ? round($totalReservas / $totalRutas, 2) : 0,
                    'ultima_programacion' => $rutasActivas->max('ruta_activa_fecha')?->format('Y-m-d'),
                    'proxima_programacion' => $rutasActivas->where('ruta_activa_fecha', '>=', today())->min('ruta_activa_fecha')?->format('Y-m-d'),
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'eliminado_en' => $this->deleted_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            'computed' => [
                'es_activa' => $this->rutas_activa,
                'tiene_descripcion' => !empty($this->rutas_descripcion),
                'tiene_distancia' => !empty($this->rutas_distancia_km),
                'tiene_tiempo_estimado' => !empty($this->rutas_tiempo_estimado),
                'codigo_ruta' => strtolower(str_replace([' ', 'á', 'é', 'í', 'ó', 'ú', 'ñ'], ['_', 'a', 'e', 'i', 'o', 'u', 'n'], $this->rutas_origen . '_' . $this->rutas_destino)),
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
                'self' => route('rutas.show', ['ruta' => $this->id_rutas]),
                'update' => route('rutas.update', ['ruta' => $this->id_rutas]),
                'destroy' => route('rutas.destroy', ['ruta' => $this->id_rutas]),
                'rutas_activas' => route('rutas.rutas-activas', ['ruta' => $this->id_rutas]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Ruta');
    }
}
