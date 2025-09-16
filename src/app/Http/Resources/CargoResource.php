<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CargoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_cargo,
            'nombre' => $this->cargo_nombre,
            'activo' => $this->cargo_activo ?? true,
            'empleados_count' => $this->when(
                $this->relationLoaded('empleados'),
                fn() => $this->empleados->count()
            ),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s')
        ];
    }
}
