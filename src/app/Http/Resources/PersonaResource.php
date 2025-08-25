<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PersonaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nombres' => $this->nombres,
            'apellidos' => $this->apellidos,
            'nombre_completo' => $this->nombre_completo,
            'documento_identidad' => $this->documento_identidad,
            'email' => $this->email,
            'telefono_principal' => $this->telefono_principal,
            'whatsapp' => $this->whatsapp,
            'direccion' => $this->direccion,
            'tipo_persona' => [
                'id' => $this->tipoPersona->id ?? null,
                'codigo' => $this->tipoPersona->codigo ?? null,
                'nombre' => $this->tipoPersona->nombre ?? null,
            ],
            'tipo_persona_id' => $this->tipo_persona_id,
            'situacion' => $this->situacion,
            'es_empleado' => $this->empleado ? true : false,
            'es_cliente' => $this->cliente ? true : false,
            'empleado' => $this->whenLoaded('empleado', function () {
                return [
                    'id' => $this->empleado->id,
                    'codigo_empleado' => $this->empleado->codigo_empleado,
                    'rol' => $this->empleado->rol->nombre_rol ?? null
                ];
            }),
            'cliente' => $this->whenLoaded('cliente', function () {
                return [
                    'id' => $this->cliente->id,
                    'codigo_cliente' => $this->cliente->codigo_cliente,
                    'tipo_cliente' => $this->cliente->tipoCliente->nombre_tipo ?? null
                ];
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
