<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RutaEjecutadaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'numero_ejecucion' => $this->numero_ejecucion,
            'ruta' => [
                'id' => $this->ruta->id ?? null,
                'codigo' => $this->ruta->codigo_ruta ?? null,
                'nombre' => $this->ruta->nombre_ruta ?? null,
                'origen' => $this->ruta->ciudad_origen ?? null,
                'destino' => $this->ruta->ciudad_destino ?? null,
            ],
            'vehiculo' => [
                'id' => $this->vehiculo->id ?? null,
                'codigo' => $this->vehiculo->codigo_vehiculo ?? null,
                'placa' => $this->vehiculo->placa ?? null,
                'marca_modelo' => ($this->vehiculo->marca ?? '') . ' ' . ($this->vehiculo->modelo ?? ''),
            ],
            'chofer' => [
                'id' => $this->chofer->id ?? null,
                'codigo' => $this->chofer->codigo_empleado ?? null,
                'nombre' => $this->chofer->nombre_completo ?? null,
            ],
            'chofer_apoyo' => $this->whenLoaded('choferApoyo', function () {
                return [
                    'id' => $this->choferApoyo->id,
                    'codigo' => $this->choferApoyo->codigo_empleado,
                    'nombre' => $this->choferApoyo->nombre_completo,
                ];
            }),
            'fecha_operacion' => $this->fecha_operacion?->format('Y-m-d'),
            'horarios' => [
                'hora_salida_programada' => $this->hora_salida_programada,
                'hora_salida_real' => $this->hora_salida_real,
                'hora_llegada_real' => $this->hora_llegada_real,
            ],
            'pasajeros' => [
                'capacidad_vehiculo' => $this->capacidad_vehiculo,
                'asientos_reservados' => $this->asientos_reservados,
                'asientos_libres' => $this->asientos_libres,
                'pasajeros_abordaron' => $this->pasajeros_abordaron,
                'pasajeros_no_show' => $this->pasajeros_no_show,
                'porcentaje_ocupacion' => $this->porcentaje_ocupacion,
            ],
            'operacion' => [
                'combustible_inicial' => $this->combustible_inicial,
                'combustible_final' => $this->combustible_final,
                'combustible_consumido' => $this->combustible_consumido,
                'kilometraje_inicial' => $this->kilometraje_inicial,
                'kilometraje_final' => $this->kilometraje_final,
                'kilometros_recorridos' => $this->kilometros_recorridos,
            ],
            'costos' => [
                'costo_combustible' => $this->costo_combustible,
                'costo_chofer' => $this->costo_chofer,
                'costo_peajes' => $this->costo_peajes,
                'costo_total' => $this->costo_total,
            ],
            'estado' => $this->estado,
            'esta_en_curso' => $this->esta_en_curso,
            'esta_completada' => $this->esta_completada,
            'observaciones' => $this->observaciones,
            'reservas' => $this->whenLoaded('reservas', function () {
                return $this->reservas->map(function ($reserva) {
                    return [
                        'id' => $reserva->id,
                        'numero_reserva' => $reserva->numero_reserva,
                        'pasajero' => $reserva->nombre_pasajero_principal,
                        'pax_total' => $reserva->pax_total,
                        'hotel' => $reserva->hotel_pickup,
                        'abordado' => $reserva->pivot->pasajero_abordo,
                        'asiento' => $reserva->pivot->numero_asiento,
                    ];
                });
            }),
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
