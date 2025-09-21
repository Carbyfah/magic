<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TourResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id_tour,
            'nombre' => $this->tours_nombre,
            'agencia' => $this->when($this->relationLoaded('agencia'), fn() => [
                'id' => $this->agencia->id_agencias,
                'nombre' => $this->agencia->agencias_nombre
            ]),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s')
        ];
    }
}
