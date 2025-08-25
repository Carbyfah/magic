<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChoferDetalleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'empleado' => [
                'id' => $this->empleado->id ?? null,
                'codigo_empleado' => $this->empleado->codigo_empleado ?? null,
                'nombre_completo' => $this->empleado->nombre_completo ?? null,
                'persona' => $this->whenLoaded('empleado', function () {
                    return [
                        'nombres' => $this->empleado->persona->nombres ?? null,
                        'apellidos' => $this->empleado->persona->apellidos ?? null,
                        'telefono' => $this->empleado->persona->telefono_principal ?? null,
                    ];
                }),
            ],
            'numero_licencia' => $this->numero_licencia,
            'tipo_licencia' => [
                'id' => $this->tipoLicencia->id ?? null,
                'codigo' => $this->tipoLicencia->codigo ?? null,
                'nombre' => $this->tipoLicencia->nombre_tipo ?? null,
            ],
            'fecha_emision_licencia' => $this->fecha_emision_licencia?->format('Y-m-d'),
            'fecha_vencimiento_licencia' => $this->fecha_vencimiento_licencia?->format('Y-m-d'),
            'licencia_vigente' => $this->licencia_vigente,
            'dias_para_vencimiento' => $this->dias_para_vencimiento,
            'requiere_renovacion' => $this->requiere_renovacion,
            'fecha_ultimo_examen_medico' => $this->fecha_ultimo_examen_medico?->format('Y-m-d'),
            'apto_turismo' => $this->apto_turismo,
            'anos_experiencia' => $this->anos_experiencia,
            'total_rutas_conducidas' => $this->whenLoaded('empleado', function () {
                return $this->empleado->rutasComoChofer->count();
            }),
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
