<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->usuario_id,
            'codigo' => $this->usuario_codigo,
            'activo' => $this->usuario_situacion,

            // Información combinada para la interfaz
            'nombre_completo' => $this->nombre_completo,
            'iniciales' => $this->getIniciales(),
            'persona_id' => $this->persona_id,
            'rol_id' => $this->rol_id,

            // Información relacionada (FK)
            'persona' => [
                'id' => $this->persona?->persona_id,
                'nombre' => $this->persona?->nombre_completo,
                'codigo' => $this->persona?->persona_codigo,
            ],

            'rol' => [
                'id' => $this->rol?->rol_id,
                'rol_rol' => $this->rol?->rol_rol,     // AGREGAR: campo real de BD
                'nombre' => $this->rol?->rol_rol,      // MANTENER: para compatibilidad
                'codigo' => $this->rol?->rol_codigo,
            ],

            // Información formateada para la interfaz
            'contacto' => [
                'rol_formateado' => $this->formatearRol(),
                'codigo_publico' => $this->getCodigoPublico(),
                'tiene_datos_completos' => !empty($this->usuario_codigo) && !empty($this->persona_id),
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_administrador' => $this->rol?->rol_codigo === 'ADMIN',
                'es_gerente' => $this->rol?->rol_codigo === 'GERENTE',
                'es_vendedor' => $this->rol?->rol_codigo === 'VENDEDOR',
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'puede_eliminar' => $this->puedeSerEliminado(),
                ]
            ),

            // Información para planificación y asignaciones
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'disponible_para_ruta' => true,
                    'puede_ser_operador' => $this->rol?->rol_codigo === 'OPERADOR',
                    'puede_administrar' => in_array($this->rol?->rol_codigo, ['ADMIN', 'GERENTE']),
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
