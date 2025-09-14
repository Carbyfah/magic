<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RutaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ruta_id,
            'codigo' => $this->ruta_codigo,
            'nombre' => $this->ruta_ruta,
            'origen' => $this->ruta_origen,
            'destino' => $this->ruta_destino,
            'activo' => $this->es_activo,

            // Información combinada para la interfaz
            'descripcion' => [
                'completa' => $this->ruta_completa,
                'direccion' => $this->direccion_ruta,
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_aeroporto' => $this->esRutaAeropuerto(),
                'es_turistica' => $this->esRutaTuristica(),
                'distancia_estimada' => $this->getDistanciaEstimada(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_activaciones' => $this->whenCounted('rutasActivadas'),
                    'es_popular' => $this->esPopular(),
                    'tiene_activaciones' => $this->tieneRutasActivas(),
                ]
            ),

            // Ruta inversa para planificación
            'ruta_inversa' => $this->when(
                $request->has('include_inversa'),
                function () {
                    $inversa = $this->rutaInversa();
                    return $inversa ? [
                        'id' => $inversa->ruta_id,
                        'codigo' => $inversa->ruta_codigo,
                        'existe' => true
                    ] : ['existe' => false];
                }
            ),

            // Información para mapas y planificación
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'puede_programar' => $this->es_activo,
                    'requiere_atencion_especial' => $this->esRutaAeropuerto(),
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
