<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->estado_id,
            'nombre' => $this->estado_nombre,
            'descripcion' => $this->estado_descripcion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s')
        ];
    }
}
