<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->rol_id,
            'codigo' => $this->rol_codigo,
            'nombre' => $this->rol_rol,
            'descripcion' => $this->rol_descripcion,
            'activo' => $this->es_activo,

            // Información combinada para la interfaz
            'descripcion_completa' => [
                'completa' => $this->rol_completo,
                'resumen' => $this->resumen_rol,
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_administrativo' => $this->esRolAdministrativo(),
                'es_operativo' => $this->esRolOperativo(),
                'nivel_acceso' => $this->getNivelAcceso(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_usuarios' => $this->whenCounted('usuarios'),
                    'es_popular' => $this->esPopular(),
                    'tiene_usuarios' => $this->tieneUsuariosActivos(),
                ]
            ),

            // Rol superior para jerarquía
            'rol_jerarquia' => $this->when(
                $request->has('include_jerarquia'),
                function () {
                    $superior = $this->rolSuperior();
                    return $superior ? [
                        'id' => $superior->rol_id,
                        'codigo' => $superior->rol_codigo,
                        'existe' => true
                    ] : ['existe' => false];
                }
            ),

            // Información para permisos y planificación
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'puede_asignar' => $this->es_activo,
                    'requiere_atencion_especial' => $this->esRolAdministrativo(),
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
