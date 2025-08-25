<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EmpleadoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo_empleado' => $this->codigo_empleado,
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
            'rol' => [
                'id' => $this->rol->id ?? null,
                'codigo' => $this->rol->codigo ?? null,
                'nombre' => $this->rol->nombre_rol ?? null,
                'nivel_jerarquia' => $this->rol->nivel_jerarquia ?? null,
                'puede_autorizar' => $this->rol->puede_autorizar ?? false,
                'permisos' => $this->whenLoaded('rol', function () {
                    return $this->rol->permisos_json ?? [];
                })
            ],
            'estado' => [
                'id' => $this->estadoEmpleado->id ?? null,
                'codigo' => $this->estadoEmpleado->codigo ?? null,
                'nombre' => $this->estadoEmpleado->nombre_estado ?? null,
                'permite_trabajar' => $this->estadoEmpleado->permite_trabajar ?? false,
                'color' => $this->estadoEmpleado->color_hex ?? null,
            ],
            'fecha_ingreso' => $this->fecha_ingreso?->format('Y-m-d'),
            'fecha_baja' => $this->fecha_baja?->format('Y-m-d'),
            'antiguedad' => $this->fecha_ingreso ? [
                'años' => $this->fecha_ingreso->diffInYears(now()),
                'meses' => $this->fecha_ingreso->diffInMonths(now()) % 12,
                'dias_totales' => $this->fecha_ingreso->diffInDays(now()),
                'texto' => $this->fecha_ingreso->diffForHumans(now(), true)
            ] : null,
            'ultimo_acceso' => $this->ultimo_acceso?->format('Y-m-d H:i:s'),
            'ultimo_acceso_hace' => $this->ultimo_acceso?->diffForHumans(),
            'es_chofer' => $this->es_chofer,
            'esta_activo' => $this->esta_activo,
            'situacion' => $this->situacion,
            'chofer_detalle' => $this->whenLoaded('choferDetalle', function () {
                return [
                    'numero_licencia' => $this->choferDetalle->numero_licencia,
                    'tipo_licencia' => $this->choferDetalle->tipoLicencia->nombre_tipo ?? null,
                    'vencimiento_licencia' => $this->choferDetalle->fecha_vencimiento_licencia,
                    'licencia_vigente' => $this->choferDetalle->fecha_vencimiento_licencia > now(),
                    'apto_turismo' => $this->choferDetalle->apto_turismo,
                    'anos_experiencia' => $this->choferDetalle->anos_experiencia
                ];
            }),
            'estadisticas' => [
                'total_reservas' => $this->whenLoaded('reservasCreadas', function () {
                    return $this->reservasCreadas->count();
                }),
                'total_ventas' => $this->whenLoaded('ventasRealizadas', function () {
                    return $this->ventasRealizadas->count();
                }),
                'total_rutas_conducidas' => $this->whenLoaded('rutasComoChofer', function () {
                    return $this->rutasComoChofer->count();
                })
            ],
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
