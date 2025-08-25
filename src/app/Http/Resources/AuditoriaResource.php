<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuditoriaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'usuario' => [
                'id' => $this->usuario->id ?? null,
                'codigo' => $this->usuario->codigo_empleado ?? null,
                'nombre' => $this->usuario->nombre_completo ?? null,
            ],
            'accion' => $this->accion,
            'tabla' => $this->tabla,
            'registro_id' => $this->registro_id,
            'datos_anteriores' => $this->datos_anteriores,
            'datos_nuevos' => $this->datos_nuevos,
            'campos_modificados' => $this->campos_modificados,
            'modulo' => $this->modulo,
            'descripcion' => $this->descripcion,
            'ip' => $this->ip,
            'user_agent' => $this->user_agent,
            'sesion_id' => $this->sesion_id,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'tiempo_transcurrido' => $this->created_at?->diffForHumans(),
        ];
    }
}
