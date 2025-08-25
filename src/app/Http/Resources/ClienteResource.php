<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo_cliente' => $this->codigo_cliente,
            'persona' => [
                'id' => $this->persona->id ?? null,
                'nombres' => $this->persona->nombres ?? null,
                'apellidos' => $this->persona->apellidos ?? null,
                'nombre_completo' => $this->nombre_completo,
                'documento_identidad' => $this->persona->documento_identidad ?? null,
                'email' => $this->persona->email ?? null,
                'telefono_principal' => $this->persona->telefono_principal ?? null,
                'whatsapp' => $this->persona->whatsapp ?? null,
                'direccion' => $this->persona->direccion ?? null,
            ],
            'tipo_cliente' => [
                'id' => $this->tipoCliente->id ?? null,
                'codigo' => $this->tipoCliente->codigo ?? null,
                'nombre' => $this->tipoCliente->nombre_tipo ?? null,
                'descuento_default' => $this->tipoCliente->descuento_default ?? 0,
            ],
            'pais_residencia' => [
                'id' => $this->paisResidencia->id ?? null,
                'nombre' => $this->paisResidencia->nombre_pais ?? null,
                'codigo_iso2' => $this->paisResidencia->codigo_iso2 ?? null,
            ],
            'ciudad_residencia' => $this->ciudad_residencia,
            'fecha_registro' => $this->fecha_registro?->format('Y-m-d'),
            'limite_credito' => $this->limite_credito,
            'credito_disponible' => $this->credito_disponible ?? 0,
            'referido_por' => $this->referido_por,
            'total_compras' => $this->whenLoaded('ventas', function () {
                return $this->total_compras;
            }),
            'total_reservas' => $this->whenLoaded('reservas', function () {
                return $this->reservas->count();
            }),
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
