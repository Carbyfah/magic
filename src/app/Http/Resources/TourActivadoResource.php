<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourActivadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // CAMPOS BÁSICOS - SIEMPRE INCLUIDOS
            'id' => $this->tour_activado_id,
            'codigo' => $this->tour_activado_codigo,
            'fecha' => $this->tour_activado_fecha_hora?->format('Y-m-d'),
            'hora' => $this->tour_activado_fecha_hora?->format('H:i'),
            'fecha_completa' => $this->tour_activado_fecha_hora?->format('Y-m-d H:i'),
            'descripcion' => $this->tour_activado_descripcion,
            'punto_encuentro' => $this->tour_activado_punto_encuentro,
            'duracion_horas' => $this->tour_activado_duracion_horas,
            'activo' => $this->tour_activado_situacion,

            // INFORMACIÓN COMBINADA BÁSICA
            'fecha_formateada' => $this->fecha_formateada,
            'tour_completa' => $this->tour_completa,
            'duracion_formateada' => $this->duracion_formateada,
            'punto_encuentro_info' => $this->punto_encuentro_info,

            // RELACIONES FORÁNEAS - FORMATO ESTÁNDAR
            'persona_id' => $this->persona_id,
            'guia' => [
                'id' => $this->persona?->persona_id,
                'nombre' => $this->guia_nombre,
                'codigo' => $this->persona?->persona_codigo,
                'telefono' => $this->persona?->persona_telefono,
                'tipo' => $this->tieneGuiaAsignado() ? 'interno' : 'externo',
                'es_externo' => $this->esGuiaExterno(),
            ],

            'servicio_id' => $this->servicio_id,
            'servicio' => [
                'id' => $this->servicio?->servicio_id,
                'nombre' => $this->formatearServicio(),
                'codigo' => $this->servicio?->servicio_codigo,
            ],

            // DATOS CALCULADOS - TOURS SIN LÍMITE DE CAPACIDAD
            'total_pasajeros' => $this->total_pasajeros,
            'total_reservas' => $this->total_reservas_activas,
            'capacidad_disponible' => $this->capacidad_disponible, // 'Sin límite'
            'porcentaje_ocupacion' => $this->porcentaje_ocupacion, // 0
            'status_disponibilidad' => $this->status_disponibilidad, // 'SIEMPRE_DISPONIBLE'

            // VALIDACIONES BÁSICAS DE NEGOCIO
            'puede_recibir_reservas' => true, // Tours siempre pueden recibir reservas
            'necesita_alerta' => $this->necesitaAlertaCapacidad(), // false
            'tiene_reservas' => $this->tieneReservas(),
            'sin_limite_capacidad' => true,

            // INFORMACIÓN DETALLADA DE OCUPACIÓN - SOLO SI SE SOLICITA
            'ocupacion_detallada' => $this->when(
                $request->has('include_ocupacion'),
                [
                    'total_pasajeros' => $this->total_pasajeros,
                    'total_reservas' => $this->total_reservas_activas,
                    'sin_limite_capacidad' => true,
                    'status' => $this->status_disponibilidad,
                    'siempre_disponible' => true,
                    'puede_acomodar_cualquier_cantidad' => true,
                ]
            ),

            // INFORMACIÓN DE RESERVAS - SOLO SI SE SOLICITA
            'reservas_info' => $this->when(
                $request->has('include_reservas'),
                function () {
                    return $this->whenLoaded('reservas', [
                        'total_reservas' => $this->reservas?->count() ?? 0,
                        'reservas_activas' => $this->reservas?->where('reserva_situacion', 1)->count() ?? 0,
                        'monto_total' => $this->reservas?->where('reserva_situacion', 1)->sum('reserva_monto') ?? 0,
                        'ultima_reserva' => [
                            'id' => $this->reservas?->first()?->reserva_id,
                            'cliente' => $this->reservas?->first()?->reserva_nombres_cliente,
                        ]
                    ]);
                }
            ),

            // INFORMACIÓN FINANCIERA - SOLO SI SE SOLICITA
            'financiero' => $this->when(
                $request->has('include_financiero'),
                [
                    'precio_normal' => $this->servicio?->servicio_precio_normal ?? 0,
                    'precio_descuento' => $this->servicio?->servicio_precio_descuento ?? 0,
                    'ingresos_actuales' => $this->reservas?->where('reserva_situacion', 1)->sum('reserva_monto') ?? 0,
                    'ingresos_por_pasajero_normal' => $this->servicio?->servicio_precio_normal ?? 0,
                    'ingresos_por_pasajero_descuento' => $this->servicio?->servicio_precio_descuento ?? 0,
                ]
            ),

            // INFORMACIÓN OPERATIVA - SOLO SI SE SOLICITA
            'operacion' => $this->when(
                $request->has('include_operacion'),
                [
                    'puede_eliminar' => $this->puedeSerEliminada(),
                    'puede_modificar' => !$this->tieneReservasActivas(),
                    'guia_asignado' => $this->tieneGuiaAsignado(),
                    'descripcion_completa' => $this->tieneDescripcionCompleta(),
                    'datos_completos' => !empty($this->tour_activado_codigo) &&
                        !empty($this->tour_activado_descripcion) &&
                        !empty($this->tour_activado_punto_encuentro),
                ]
            ),

            // INFORMACIÓN ESPECÍFICA DE TOURS
            'tour_detalles' => [
                'tiene_descripcion' => !empty($this->tour_activado_descripcion),
                'tiene_punto_encuentro' => !empty($this->tour_activado_punto_encuentro),
                'tiene_duracion' => !empty($this->tour_activado_duracion_horas),
                'descripcion_completa' => $this->tieneDescripcionCompleta(),
                'resumen_tour' => $this->obtenerResumenTour(),
            ],

            // CARACTERÍSTICAS TEMPORALES
            'caracteristicas' => [
                'es_del_dia' => $this->tour_activado_fecha_hora?->isToday() ?? false,
                'es_futura' => $this->tour_activado_fecha_hora?->isFuture() ?? false,
                'es_pasada' => $this->tour_activado_fecha_hora?->isPast() ?? false,
                'es_esta_semana' => $this->tour_activado_fecha_hora?->isCurrentWeek() ?? false,
            ],

            // INFORMACIÓN DE AUDITORÍA - SOLO SI SE SOLICITA
            'auditoria' => $this->when(
                $request->has('include_auditoria'),
                [
                    'fecha_registro' => $this->created_at?->format('d/m/Y H:i'),
                    'ultima_modificacion' => $this->updated_at?->format('d/m/Y H:i'),
                    'dias_desde_registro' => $this->created_at?->diffInDays(now()),
                    'modificado_recientemente' => $this->updated_at?->diffInHours(now()) < 24,
                ]
            ),

            // Sistema de notificaciones inteligentes - SOLO SI SE SOLICITA
            'notificaciones_sistema' => $this->when(
                $request->has('include_notificaciones'),
                [
                    'notificaciones' => $this->obtenerNotificacionesInteligentes(),
                    'validaciones' => [
                        'puede_recibir_reservas' => $this->puedeRecibirReservas(),
                        'puede_cerrarse' => $this->puedeCerrarse(),
                    ]
                ]
            ),

            // INFORMACIÓN DETALLADA DEL SERVICIO - SOLO SI SE SOLICITA
            'servicio_detallado' => $this->when(
                $request->has('include_servicio'),
                [
                    'id' => $this->servicio?->servicio_id,
                    'nombre' => $this->servicio?->servicio_servicio,
                    'codigo' => $this->servicio?->servicio_codigo,
                    'precio_normal' => $this->servicio?->servicio_precio_normal ?? 0,
                    'precio_descuento' => $this->servicio?->servicio_precio_descuento ?? 0,
                    'activo' => $this->servicio?->servicio_situacion ?? false,
                ]
            ),

            // INFORMACIÓN DETALLADA DEL GUÍA - SOLO SI SE SOLICITA
            'guia_detallado' => $this->when(
                $request->has('include_guia'),
                [
                    'id' => $this->persona?->persona_id,
                    'nombres' => $this->persona?->persona_nombres,
                    'apellidos' => $this->persona?->persona_apellidos,
                    'nombre_completo' => $this->guia_nombre,
                    'telefono' => $this->persona?->persona_telefono,
                    'email' => $this->persona?->persona_email,
                    'codigo' => $this->persona?->persona_codigo,
                    'tipo_persona' => $this->persona?->tipoPersona?->tipo_persona_tipo,
                    'es_interno' => $this->tieneGuiaAsignado(),
                    'es_externo' => $this->esGuiaExterno(),
                ]
            ),

            // VERIFICACIÓN DE DISPONIBILIDAD - SOLO SI SE SOLICITA
            'disponibilidad_detallada' => $this->when(
                $request->has('include_disponibilidad'),
                function () {
                    return $this->verificarDisponibilidadTour();
                }
            ),

            // INTEGRACIÓN CON FUNCIONES DE BD - SOLO SI SE SOLICITA
            'funciones_bd' => $this->when(
                $request->has('include_funciones_bd'),
                [
                    'verificar_disponibilidad' => $this->verificarDisponibilidad(),
                    'calcular_precio_ejemplo_2_adultos' => $this->calcularPrecioReserva(2, 0, false),
                    'calcular_precio_ejemplo_2_adultos_agencia' => $this->calcularPrecioReserva(2, 0, true),
                ]
            ),

            // COMPARACIÓN CON RUTAS - SOLO SI SE SOLICITA
            'diferencias_con_rutas' => $this->when(
                $request->has('include_comparacion'),
                [
                    'sin_vehiculo' => 'Tours no requieren vehículo asignado',
                    'sin_limite_capacidad' => 'Tours pueden recibir cualquier cantidad de pasajeros',
                    'guia_opcional' => 'Guía puede ser interno o externo',
                    'campos_adicionales' => [
                        'descripcion' => 'Tours tienen descripción detallada',
                        'punto_encuentro' => 'Tours especifican punto de encuentro',
                        'duracion' => 'Tours indican duración estimada'
                    ],
                    'flexibilidad' => 'Tours son más flexibles en términos operativos'
                ]
            ),

            // TIMESTAMPS ESTÁNDAR
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'fecha_iso' => $this->tour_activado_fecha_hora?->toISOString(),
        ];
    }

    /**
     * MÉTODO HELPER PARA VERIFICAR DISPONIBILIDAD
     * Tours siempre están disponibles
     */
    private function estaDisponible()
    {
        return $this->tour_activado_situacion;
    }

    /**
     * MÉTODO HELPER PARA OBTENER STATUS LEGIBLE
     */
    private function getStatusLegible()
    {
        switch ($this->status_disponibilidad) {
            case 'SIEMPRE_DISPONIBLE':
                return 'Siempre disponible';
            default:
                return 'Estado desconocido';
        }
    }

    /**
     * MÉTODO HELPER PARA VALIDAR DATOS MÍNIMOS
     */
    private function tieneInformacionMinima()
    {
        return !empty($this->tour_activado_codigo) &&
            !empty($this->tour_activado_fecha_hora) &&
            !empty($this->servicio_id);
    }

    /**
     * MÉTODO HELPER PARA OBTENER ESTADÍSTICAS RÁPIDAS
     */
    private function obtenerEstadisticasRapidas()
    {
        return [
            'total_pasajeros' => $this->total_pasajeros,
            'total_reservas' => $this->total_reservas_activas,
            'ingresos_actuales' => $this->reservas?->where('reserva_situacion', 1)->sum('reserva_monto') ?? 0,
            'sin_limite' => true
        ];
    }
}
