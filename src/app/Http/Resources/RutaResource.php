<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RutaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo_ruta' => $this->codigo_ruta,
            'nombre_ruta' => $this->nombre_ruta,
            'tipo_servicio' => $this->tipo_servicio,
            'origen_destino' => [
                'ciudad_origen' => $this->ciudad_origen,
                'ciudad_destino' => $this->ciudad_destino,
                'punto_salida' => $this->punto_salida,
                'punto_llegada' => $this->punto_llegada,
                'distancia_km' => $this->distancia_km,
            ],
            'horarios' => [
                'hora_salida' => $this->hora_salida,
                'hora_llegada_estimada' => $this->hora_llegada_estimada,
                'duracion_minutos' => $this->duracion_minutos,
                'tiempo_viaje_formateado' => $this->tiempo_viaje_formateado,
            ],
            'capacidad' => [
                'capacidad_maxima' => $this->capacidad_maxima,
                'capacidad_recomendada' => $this->capacidad_recomendada,
            ],
            'tipo_vehiculo' => [
                'id' => $this->tipoVehiculo->id ?? null,
                'codigo' => $this->tipoVehiculo->codigo ?? null,
                'nombre' => $this->tipoVehiculo->nombre_tipo ?? null,
            ],
            'dias_operacion' => $this->dias_operacion,
            'dias_operacion_array' => $this->dias_operacion_array,
            'opera_hoy' => $this->opera_hoy,
            'precios' => [
                'precio_adulto' => $this->precio_adulto,
                'precio_nino' => $this->precio_nino,
            ],
            'incluye' => $this->incluye,
            'estado_ruta' => [
                'id' => $this->estadoRuta->id ?? null,
                'codigo' => $this->estadoRuta->codigo ?? null,
                'nombre' => $this->estadoRuta->nombre_estado ?? null,
                'acepta_reservas' => $this->estadoRuta->acepta_reservas ?? false,
                'color' => $this->estadoRuta->color_hex ?? null,
            ],
            'acepta_reservas' => $this->acepta_reservas,
            'reservas_proximas' => $this->whenLoaded('reservas', function () {
                return $this->reservas->count();
            }),
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
