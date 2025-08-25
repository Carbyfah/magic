<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaisResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nombre_pais' => $this->nombre_pais,
            'codigo_iso2' => $this->codigo_iso2,
            'codigo_iso3' => $this->codigo_iso3,
            'codigo_telefono' => $this->codigo_telefono,
            'situacion' => $this->situacion,
            'puede_eliminarse' => method_exists($this->resource, 'puedeEliminarse')
                ? $this->puedeEliminarse()
                : true,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
