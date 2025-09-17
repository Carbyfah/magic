<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmpleadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_empleados,

            // SOLO CAMPOS REALES DE LA MIGRACIÓN v4.0
            'informacion_personal' => [
                'nombres' => $this->empleados_nombres,
                'apellidos' => $this->empleados_apellidos,
                'nombre_completo' => $this->empleados_nombres . ' ' . $this->empleados_apellidos,
                'dpi' => $this->empleados_dpi,
            ],

            // RELACIONES
            'agencia' => $this->when($this->relationLoaded('agencia'), function () {
                return [
                    'id' => $this->agencia->id_agencias,
                    'nombre' => $this->agencia->agencias_nombre,
                ];
            }),

            'cargo' => $this->when($this->relationLoaded('cargo'), function () {
                return [
                    'id' => $this->cargo->id_cargo,
                    'nombre' => $this->cargo->cargo_nombre,
                ];
            }),

            // METADATOS
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'eliminado_en' => $this->deleted_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
        ];
    }
}
