<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->vehiculo_id,
            'codigo' => $this->vehiculo_codigo,
            'placa' => $this->vehiculo_placa,
            'marca' => $this->vehiculo_marca,
            'modelo' => $this->vehiculo_modelo,
            'capacidad' => $this->vehiculo_capacidad,
            'activo' => $this->vehiculo_situacion,

            // Información combinada para la interfaz
            'nombre_completo' => $this->nombre_completo,
            'iniciales' => $this->getIniciales(),
            'estado_id' => $this->estado_id,

            // Información relacionada (FK)
            'estado' => [
                'id' => $this->estado?->estado_id,
                'nombre' => $this->estado?->estado_estado,
                'codigo' => $this->estado?->estado_codigo,
            ],

            // Información formateada para la interfaz
            'contacto' => [
                'capacidad_formateada' => $this->formatearCapacidad(),
                'tiene_datos_completos' => !empty($this->vehiculo_placa) && !empty($this->vehiculo_marca),
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_disponible' => $this->estado?->estado_codigo === 'VEH_DISP',
                'es_asignado' => $this->estado?->estado_codigo === 'VEH_ASIG',
                'es_mantenimiento' => $this->estado?->estado_codigo === 'VEH_MANT',
                'tiene_rutas_activas' => $this->tieneRutasActivadas(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'puede_eliminar' => $this->puedeSerEliminado(),
                    'tiene_rutas' => $this->whenLoaded('rutasActivadas', function () {
                        return [
                            'activas' => $this->rutasActivadas?->where('ruta_activada_situacion', 1)->count() ?? 0,
                            'total' => $this->rutasActivadas?->count() ?? 0,
                        ];
                    }),
                ]
            ),

            // Información de rutas activadas si existe
            'rutas_sistema' => $this->when(
                $request->has('include_rutas'),
                function () {
                    return $this->whenLoaded('rutasActivadas', [
                        'total_rutas' => $this->rutasActivadas?->count() ?? 0,
                        'rutas_activas' => $this->rutasActivadas?->where('ruta_activada_situacion', 1)->count() ?? 0,
                        'ultima_ruta' => [
                            'id' => $this->rutasActivadas?->first()?->ruta_activada_id,
                            'fecha' => $this->rutasActivadas?->first()?->ruta_activada_fecha,
                        ]
                    ]);
                }
            ),

            // Información para planificación y asignaciones
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'disponible_para_ruta' => !$this->tieneRutasActivadas(),
                    'puede_ser_asignado' => $this->estado?->estado_codigo === 'VEH_DISP',
                    'puede_transportar' => in_array($this->estado?->estado_codigo, ['VEH_DISP', 'VEH_ASIG']),
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

            // Sistema de notificaciones del vehículo - SOLO SI SE SOLICITA
            'notificaciones_sistema' => $this->when(
                $request->has('include_notificaciones'),
                [
                    'notificaciones' => $this->obtenerNotificacionesEstado(),
                    'validaciones' => [
                        'puede_asignarse' => $this->puedeAsignarse(),
                        'puede_volver_disponible' => $this->puedeVolverDisponible(),
                    ],
                    'estado_actual' => [
                        'esta_disponible' => $this->estaDisponible(),
                        'esta_asignado' => $this->estaAsignado(),
                        'esta_mantenimiento' => $this->estaEnMantenimiento(),
                        'tiene_rutas_activas' => $this->tieneRutasActivas(),
                    ]
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
