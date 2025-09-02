<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TipoPersonaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->tipo_persona_id,
            'codigo' => $this->tipo_persona_codigo,
            'nombre' => $this->tipo_persona_tipo,
            'activo' => $this->tipo_persona_situacion,

            // Información combinada para la interfaz
            'descripcion' => [
                'completa' => $this->nombre_completo,
                'tipo' => $this->tipo_persona_tipo,
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_empleado' => $this->esEmpleado(),
                'es_conductor' => $this->esConductor(),
                'es_administrativo' => $this->esAdministrativo(),
                'es_gerente' => $this->esGerente(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_personas' => $this->whenCounted('personas'),
                    'personas_activas' => $this->personas_activas,
                    'tiene_personas' => $this->tienePersonasAsociadas(),
                ]
            ),

            // Personas asociadas para gestión
            'personas_asociadas' => $this->when(
                $request->has('include_personas'),
                function () {
                    return $this->personas()->activo()->get(['persona_id', 'persona_nombres', 'persona_apellidos']);
                }
            ),

            // Información para planificación y asignaciones
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'puede_eliminar' => $this->puedeSerEliminado(),
                    'requiere_atencion_especial' => $this->esAdministrativo() || $this->esGerente(),
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
