<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TipoPersonaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->tipo_persona_id,
            'codigo' => $this->tipo_persona_codigo,
            'tipo' => $this->tipo_persona_tipo,
            'activo' => $this->es_activo,
            'nivel' => $this->getNivel(),

            // Contadores útiles para la interfaz
            'total_personas' => $this->whenCounted('personas'),

            // Metadatos para permisos
            'permisos' => [
                'puede_vender' => $this->puedeVender(),
                'es_empleado' => $this->esEmpleado(),
                'es_cliente' => $this->esCliente(),
                'es_contacto_agencia' => $this->esContactoAgencia(),
            ],

            // Timestamps para auditoría
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
