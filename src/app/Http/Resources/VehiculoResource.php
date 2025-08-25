<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo_vehiculo' => $this->codigo_vehiculo,
            'placa' => $this->placa,
            'marca' => $this->marca,
            'modelo' => $this->modelo,
            'ano' => $this->ano,
            'color' => $this->color,
            'tipo_vehiculo' => [
                'id' => $this->tipoVehiculo->id ?? null,
                'codigo' => $this->tipoVehiculo->codigo ?? null,
                'nombre' => $this->tipoVehiculo->nombre_tipo ?? null,
                'capacidad_estandar' => $this->tipoVehiculo->capacidad_estandar ?? null,
            ],
            'tipo_combustible' => [
                'id' => $this->tipoCombustible->id ?? null,
                'codigo' => $this->tipoCombustible->codigo ?? null,
                'nombre' => $this->tipoCombustible->nombre_combustible ?? null,
                'unidad_medida' => $this->tipoCombustible->unidad_medida ?? null,
            ],
            'capacidad_pasajeros' => $this->capacidad_pasajeros,
            'capacidad_equipaje' => $this->capacidad_equipaje,
            'numero_motor' => $this->numero_motor,
            'numero_chasis' => $this->numero_chasis,
            'numero_tarjeta_circulacion' => $this->numero_tarjeta_circulacion,
            'vencimiento_tarjeta_circulacion' => $this->vencimiento_tarjeta_circulacion?->format('Y-m-d'),
            'tarjeta_vigente' => $this->tarjeta_vigente,
            'poliza_seguro' => $this->poliza_seguro,
            'vencimiento_seguro' => $this->vencimiento_seguro?->format('Y-m-d'),
            'seguro_vigente' => $this->seguro_vigente,
            'kilometraje_actual' => $this->kilometraje_actual,
            'fecha_ultimo_servicio' => $this->fecha_ultimo_servicio?->format('Y-m-d'),
            'requiere_mantenimiento' => $this->requiere_mantenimiento,
            'estado_vehiculo' => [
                'id' => $this->estadoVehiculo->id ?? null,
                'codigo' => $this->estadoVehiculo->codigo ?? null,
                'nombre' => $this->estadoVehiculo->nombre_estado ?? null,
                'disponible' => $this->estadoVehiculo->disponible_operacion ?? false,
                'color' => $this->estadoVehiculo->color_hex ?? null,
            ],
            'esta_disponible' => $this->esta_disponible,
            'total_rutas_ejecutadas' => $this->whenLoaded('rutasEjecutadas', function () {
                return $this->rutasEjecutadas->count();
            }),
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
