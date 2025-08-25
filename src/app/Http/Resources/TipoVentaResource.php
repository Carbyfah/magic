<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TipoVentaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre_tipo' => $this->nombre_tipo,
            'descripcion' => $this->descripcion,
            'genera_comision' => $this->genera_comision,
            'requiere_voucher' => $this->requiere_voucher,
            'situacion' => $this->situacion,
            'puede_eliminarse' => method_exists($this->resource, 'puedeEliminarse')
                ? $this->puedeEliminarse()
                : true,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
