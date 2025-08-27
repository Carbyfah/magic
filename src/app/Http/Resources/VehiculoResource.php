<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->vehiculo_id,
            'codigo' => $this->vehiculo_codigo,
            'placa' => $this->vehiculo_placa,
            'marca' => $this->vehiculo_marca,
            'modelo' => $this->vehiculo_modelo,
            'capacidad' => $this->vehiculo_capacidad,
            'activo' => $this->es_activo,
            'descripcion_completa' => $this->descripcion_completa,
            'tipo' => $this->tipo_vehiculo,

            // Estado actual del vehículo
            'estado_actual' => EstadoResource::make(
                $this->whenLoaded('estado')
            ),

            // Estados disponibles para cambios
            'estados_disponibles' => [
                'esta_disponible' => $this->estaDisponible(),
                'esta_ocupado' => $this->estaOcupado(),
                'esta_en_mantenimiento' => $this->estaEnMantenimiento(),
                'esta_inactivo' => $this->estaInactivo(),
            ],

            // Ocupación y capacidad en tiempo real
            'ocupacion' => [
                'actual' => $this->getOcupacionActual(),
                'capacidad_total' => $this->vehiculo_capacidad,
                'espacios_libres' => $this->espaciosLibres(),
                'porcentaje_uso' => $this->getPorcentajeUso(),
            ],

            // Ruta actual si está asignado
            'ruta_actual' => RutaActivadaResource::make(
                $this->whenLoaded('rutaActual')
            ),

            // Aptitud para servicios
            'aptitud_servicios' => [
                'tour' => $this->esAptoPara('Tour'),
                'transporte' => $this->esAptoPara('Transporte'),
                'shuttle' => $this->esAptoPara('Shuttle'),
            ],

            // Estadísticas operativas
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_rutas_asignadas' => $this->whenCounted('rutasActivadas'),
                    'tiene_ruta_activa' => $this->relationLoaded('rutaActual') && $this->rutaActual !== null,
                    'necesita_mantenimiento' => $this->proximoMantenimiento() === 'Urgente',
                ]
            ),

            // Información de rendimiento (solo para gerencia)
            'rendimiento' => $this->when(
                $request->user()?->esGerente(),
                [
                    'porcentaje_uso_mensual' => $this->getPorcentajeUso(),
                    'proximo_mantenimiento' => $this->proximoMantenimiento(),
                ]
            ),

            // Operaciones disponibles según estado
            'operaciones_disponibles' => [
                'puede_asignar_ruta' => $this->estaDisponible(),
                'puede_mantenimiento' => !$this->estaEnMantenimiento(),
                'puede_cambiar_estado' => $this->es_activo,
            ],

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
