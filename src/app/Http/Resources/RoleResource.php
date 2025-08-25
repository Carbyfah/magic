<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre_rol' => $this->nombre_rol,
            'descripcion' => $this->descripcion,
            'permisos_json' => $this->permisos_json ?? [],
            'nivel_jerarquia' => $this->nivel_jerarquia,
            'puede_autorizar' => $this->puede_autorizar,
            'situacion' => $this->situacion,
            'puede_eliminarse' => method_exists($this->resource, 'puedeEliminarse')
                ? $this->puedeEliminarse()
                : true,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
