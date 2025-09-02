<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->persona_id,
            'codigo' => $this->persona_codigo,
            'nombres' => $this->persona_nombres,
            'apellidos' => $this->persona_apellidos,
            'telefono' => $this->persona_telefono,
            'email' => $this->persona_email,
            'activo' => $this->persona_situacion,

            // Información combinada para la interfaz
            'nombre_completo' => $this->nombre_completo,
            'iniciales' => $this->getIniciales(),
            'tipo_persona_id' => $this->tipo_persona_id,

            // Información relacionada (FK)
            'tipo_persona' => [
                'id' => $this->tipoPersona?->tipo_persona_id,
                'nombre' => $this->tipoPersona?->tipo_persona_tipo,
                'codigo' => $this->tipoPersona?->tipo_persona_codigo,
            ],

            // Información formateada para la interfaz
            'contacto' => [
                'telefono_formateado' => $this->formatearTelefono(),
                'email_publico' => $this->getEmailPublico(),
                'tiene_contacto_completo' => !empty($this->persona_telefono) && !empty($this->persona_email),
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_empleado' => $this->tipoPersona?->tipo_persona_codigo === 'EMP',
                'es_conductor' => $this->tipoPersona?->tipo_persona_codigo === 'CON',
                'es_administrativo' => $this->tipoPersona?->tipo_persona_codigo === 'ADM',
                'tiene_usuario_sistema' => $this->tieneUsuarioActivo(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'puede_eliminar' => $this->puedeSerEliminado(),
                    'tiene_usuario' => $this->whenLoaded('usuario', function () {
                        return [
                            'activo' => $this->usuario?->usuario_situacion ?? false,
                            'codigo' => $this->usuario?->usuario_codigo,
                        ];
                    }),
                ]
            ),

            // Información del usuario del sistema si existe
            'usuario_sistema' => $this->when(
                $request->has('include_usuario'),
                function () {
                    return $this->whenLoaded('usuario', [
                        'id' => $this->usuario?->usuario_id,
                        'codigo' => $this->usuario?->usuario_codigo,
                        'activo' => $this->usuario?->usuario_situacion,
                        'rol' => [
                            'id' => $this->usuario?->rol?->rol_id,
                            'nombre' => $this->usuario?->rol?->rol_rol,
                        ]
                    ]);
                }
            ),

            // Información para planificación y asignaciones
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'disponible_para_usuario' => !$this->tieneUsuarioActivo(),
                    'puede_ser_conductor' => $this->tipoPersona?->tipo_persona_codigo === 'CON',
                    'puede_administrar' => in_array($this->tipoPersona?->tipo_persona_codigo, ['ADM', 'GER']),
                ]
            ),

            // Información de auditoría básica
            'auditoria' => $this->when(
                $request->has('include_auditoria'),
                [
                    'fecha_registro' => $this->created_at?->format('d/m/Y H:i'),
                    'ultima_modificacion' => $this->updated_at?->format('d/m/Y H:i'),
                    'dias_desde_registro' => $this->created_at?->diffInDays(now()),
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
