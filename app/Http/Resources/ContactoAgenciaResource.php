<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactoAgenciaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->contactos_agencia_id,
            'codigo' => $this->contactos_agencia_codigo,
            'nombres' => $this->contactos_agencia_nombres,
            'apellidos' => $this->contactos_agencia_apellidos,
            'cargo' => $this->contactos_agencia_cargo,
            'telefono' => $this->contactos_agencia_telefono,
            'activo' => $this->contactos_agencia_situacion,

            // Información combinada para la interfaz
            'nombre_completo' => $this->nombre_completo,
            'iniciales' => $this->getIniciales(),
            'agencia_id' => $this->agencia_id,

            // Información relacionada (FK)
            'agencia' => [
                'id' => $this->agencia?->agencia_id,
                'nombre' => $this->agencia?->agencia_razon_social,
                'codigo' => $this->agencia?->agencia_codigo,
                'nit' => $this->agencia?->agencia_nit,
                'email' => $this->agencia?->agencia_email,
                'telefono' => $this->agencia?->agencia_telefono,
            ],

            // Información formateada para la interfaz
            'contacto' => [
                'telefono_formateado' => $this->formatearTelefono(),
                'cargo_formateado' => $this->getCargoFormateado(),
                'tiene_agencia_activa' => $this->tieneAgenciaActiva(),
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_gerente' => strtolower($this->contactos_agencia_cargo) === 'gerente',
                'es_director' => strtolower($this->contactos_agencia_cargo) === 'director',
                'es_propietario' => strtolower($this->contactos_agencia_cargo) === 'propietario',
                'es_administrador' => strtolower($this->contactos_agencia_cargo) === 'administrador',
                'es_contacto_principal' => in_array(strtolower($this->contactos_agencia_cargo), ['gerente', 'director', 'propietario', 'administrador']),
                'agencia_activa' => $this->tieneAgenciaActiva(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'puede_eliminar' => $this->puedeSerEliminado(),
                    'es_unico_contacto' => !$this->puedeSerEliminado(),
                    'telefono_unico_en_agencia' => $this->esTelefonoUnicoEnAgencia($this->contactos_agencia_telefono, $this->contactos_agencia_id),
                ]
            ),

            // Información de la agencia si existe
            'agencia_detalle' => $this->when(
                $request->has('include_agencia'),
                function () {
                    return $this->whenLoaded('agencia', [
                        'id' => $this->agencia?->agencia_id,
                        'codigo' => $this->agencia?->agencia_codigo,
                        'razon_social' => $this->agencia?->agencia_razon_social,
                        'nit' => $this->agencia?->agencia_nit,
                        'activo' => $this->agencia?->agencia_situacion,
                        'direccion' => $this->agencia?->agencia_direccion,
                        'telefono' => $this->agencia?->agencia_telefono,
                        'email' => $this->agencia?->agencia_email,
                    ]);
                }
            ),

            // Información para planificación y asignaciones
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'puede_autorizar' => in_array(strtolower($this->contactos_agencia_cargo), ['propietario', 'director', 'gerente']),
                    'nivel_autorizacion' => $this->getNivelAutorizacion(),
                    'puede_negociar_precios' => in_array(strtolower($this->contactos_agencia_cargo), ['propietario', 'director', 'gerente', 'administrador']),
                    'es_contacto_comercial' => !in_array(strtolower($this->contactos_agencia_cargo), ['asistente', 'secretaria']),
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

            // Información completa para reportes
            'info_completa' => $this->when(
                $request->has('include_completa'),
                $this->info_completa
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Determina el nivel de autorización basado en el cargo
     */
    private function getNivelAutorizacion(): int
    {
        return match (strtolower($this->contactos_agencia_cargo)) {
            'propietario' => 5,
            'director' => 4,
            'gerente' => 3,
            'administrador' => 2,
            default => 1
        };
    }
}
