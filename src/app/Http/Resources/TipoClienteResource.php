<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TipoClienteResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre_tipo' => $this->nombre_tipo,
            'descripcion' => $this->descripcion,
            'descuento_default' => $this->descuento_default,
            'requiere_credito' => $this->requiere_credito,
            'dias_credito' => $this->dias_credito,
            'prioridad' => $this->prioridad,
            'situacion' => $this->situacion,
            'puede_eliminarse' => method_exists($this->resource, 'puedeEliminarse')
                ? $this->puedeEliminarse()
                : true,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
