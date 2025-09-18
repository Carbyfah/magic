<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->vehiculo_id,
            'identificacion' => [
                'placa' => $this->vehiculo_placa,
                'marca' => $this->vehiculo_marca,
                'modelo' => $this->vehiculo_modelo,
                'ano' => $this->vehiculo_ano,
                'descripcion_completa' => $this->vehiculo_marca . ' ' . $this->vehiculo_modelo . ' ' . $this->vehiculo_ano,
                'color' => $this->vehiculo_color,
            ],
            'especificaciones' => [
                'capacidad' => $this->vehiculo_capacidad,
                'tipo' => $this->vehiculo_tipo,
                'combustible' => $this->vehiculo_combustible,
                'kilometraje' => $this->vehiculo_kilometraje,
                'kilometraje_formateado' => $this->vehiculo_kilometraje ? number_format($this->vehiculo_kilometraje) . ' km' : null,
                'numero_motor' => $this->vehiculo_numero_motor,
                'numero_chasis' => $this->vehiculo_numero_chasis,
            ],
            'estado_operativo' => [
                'estado' => $this->vehiculo_estado,
                'activo' => $this->vehiculo_activo,
                'estado_texto' => $this->vehiculo_activo ? 'Activo' : 'Inactivo',
                'observaciones' => $this->vehiculo_observaciones,
            ],
            'informacion_financiera' => [
                'fecha_compra' => $this->vehiculo_fecha_compra?->format('Y-m-d'),
                'fecha_compra_formateada' => $this->vehiculo_fecha_compra?->format('d/m/Y'),
                'valor_compra' => $this->vehiculo_valor_compra,
                'valor_compra_formateado' => $this->vehiculo_valor_compra ? 'Q' . number_format($this->vehiculo_valor_compra, 2) : null,
                'pago_conductor' => $this->vehiculo_pago_conductor,
                'pago_conductor_formateado' => $this->vehiculo_pago_conductor ? 'Q' . number_format($this->vehiculo_pago_conductor, 2) : null,
                'antiguedad_anos' => $this->vehiculo_fecha_compra ? $this->vehiculo_fecha_compra->diffInYears(today()) : null,
            ],
            'rutas_activas' => $this->when($this->relationLoaded('rutasActivas'), function () {
                return $this->rutasActivas->map(function ($rutaActiva) {
                    return [
                        'id' => $rutaActiva->id_ruta_activa,
                        'fecha' => $rutaActiva->ruta_activa_fecha?->format('Y-m-d'),
                        'fecha_formateada' => $rutaActiva->ruta_activa_fecha?->format('d/m/Y'),
                        'hora' => $rutaActiva->ruta_activa_hora,
                        'ruta' => $rutaActiva->ruta ? [
                            'origen' => $rutaActiva->ruta->rutas_origen,
                            'destino' => $rutaActiva->ruta->rutas_destino,
                            'descripcion' => $rutaActiva->ruta->rutas_origen . ' → ' . $rutaActiva->ruta->rutas_destino,
                        ] : null,
                        'estado' => $rutaActiva->estado->estado_nombre ?? 'Sin estado',
                        'total_reservas' => $rutaActiva->reservas_count ?? 0,
                        'ocupacion_actual' => $rutaActiva->reservas->sum(function ($reserva) {
                            return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
                        }) ?? 0,
                        'porcentaje_ocupacion' => $this->vehiculo_capacidad > 0
                            ? round((($rutaActiva->reservas->sum(function ($reserva) {
                                return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
                            }) ?? 0) / $this->vehiculo_capacidad) * 100, 2)
                            : 0,
                    ];
                });
            }),
            'estadisticas' => $this->when($this->relationLoaded('rutasActivas'), function () {
                $rutasActivas = $this->rutasActivas;
                $totalRutas = $rutasActivas->count();
                $totalOcupantes = $rutasActivas->sum(function ($rutaActiva) {
                    return $rutaActiva->reservas->sum(function ($reserva) {
                        return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
                    });
                });
                $capacidadTotal = $totalRutas * $this->vehiculo_capacidad;

                return [
                    'total_rutas_asignadas' => $totalRutas,
                    'total_pasajeros_transportados' => $totalOcupantes,
                    'capacidad_total_disponible' => $capacidadTotal,
                    'porcentaje_ocupacion_promedio' => $capacidadTotal > 0 ? round(($totalOcupantes / $capacidadTotal) * 100, 2) : 0,
                    'promedio_pasajeros_por_ruta' => $totalRutas > 0 ? round($totalOcupantes / $totalRutas, 2) : 0,
                    'ultima_asignacion' => $rutasActivas->max('ruta_activa_fecha')?->format('Y-m-d'),
                    'proxima_asignacion' => $rutasActivas->where('ruta_activa_fecha', '>=', today())->min('ruta_activa_fecha')?->format('Y-m-d'),
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'eliminado_en' => $this->deleted_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            'computed' => [
                'es_activo' => $this->vehiculo_activo,
                'tiene_observaciones' => !empty($this->vehiculo_observaciones),
                'tiene_info_compra' => !empty($this->vehiculo_fecha_compra),
                'tiene_pago_conductor' => !empty($this->vehiculo_pago_conductor),
                'es_nuevo' => $this->vehiculo_ano >= (date('Y') - 2),
                'necesita_revision' => $this->vehiculo_kilometraje && $this->vehiculo_kilometraje > 200000,
                'codigo_vehiculo' => strtolower(str_replace([' ', '-'], '_', $this->vehiculo_placa)),
                'estado_operativo_codigo' => strtolower(str_replace(' ', '_', $this->vehiculo_estado)),
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
                'self' => route('vehiculos.show', ['vehiculo' => $this->vehiculo_id]),
                'update' => route('vehiculos.update', ['vehiculo' => $this->vehiculo_id]),
                'destroy' => route('vehiculos.destroy', ['vehiculo' => $this->vehiculo_id]),
                'rutas_activas' => route('vehiculos.rutas-activas', ['vehiculo' => $this->vehiculo_id]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Vehiculo');
    }
}
