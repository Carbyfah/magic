<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RutaActivadaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // CAMPOS BÁSICOS - SIEMPRE INCLUIDOS
            'id' => $this->ruta_activada_id,
            'codigo' => $this->ruta_activada_codigo,
            'fecha' => $this->ruta_activada_fecha_hora?->format('Y-m-d'),
            'hora' => $this->ruta_activada_fecha_hora?->format('H:i'),
            'fecha_completa' => $this->ruta_activada_fecha_hora?->format('Y-m-d H:i'),
            'activo' => $this->ruta_activada_situacion,

            // INFORMACIÓN COMBINADA BÁSICA
            'fecha_formateada' => $this->fecha_formateada,
            'ruta_completa' => $this->ruta_completa,

            // RELACIONES FORÁNEAS - FORMATO ESTÁNDAR
            'persona_id' => $this->persona_id,
            'conductor' => [
                'id' => $this->persona?->persona_id,
                'nombre' => $this->persona ? ($this->persona->persona_nombres . ' ' . $this->persona->persona_apellidos) : 'Sin conductor',
                'codigo' => $this->persona?->persona_codigo,
                'telefono' => $this->persona?->persona_telefono,
            ],

            'estado_id' => $this->estado_id,
            'estado' => [
                'id' => $this->estado?->estado_id,
                'nombre' => $this->estado?->estado_estado ?? 'Sin estado',
                'codigo' => $this->estado?->estado_codigo,
            ],

            'servicio_id' => $this->servicio_id,
            'servicio' => [
                'id' => $this->servicio?->servicio_id,
                'nombre' => $this->servicio?->servicio_servicio ?? 'Sin servicio',
                'codigo' => $this->servicio?->servicio_codigo,
            ],

            'ruta_id' => $this->ruta_id,
            'ruta' => [
                'id' => $this->ruta?->ruta_id,
                'nombre' => $this->ruta?->ruta_ruta ?? 'Sin ruta',
                'codigo' => $this->ruta?->ruta_codigo,
                'origen' => $this->ruta?->ruta_origen,
                'destino' => $this->ruta?->ruta_destino,
            ],

            'vehiculo_id' => $this->vehiculo_id,
            'vehiculo' => [
                'id' => $this->vehiculo?->vehiculo_id,
                'placa' => $this->vehiculo?->vehiculo_placa ?? 'Sin placa',
                'codigo' => $this->vehiculo?->vehiculo_codigo,
                'marca' => $this->vehiculo?->vehiculo_marca,
                'modelo' => $this->vehiculo?->vehiculo_modelo,
                'capacidad' => $this->vehiculo?->vehiculo_capacidad ?? 0,
            ],

            // DATOS CALCULADOS AUTOMÁTICAMENTE POR LA BD
            'ocupacion_actual' => $this->total_pasajeros,
            'capacidad_disponible' => $this->capacidad_disponible,
            'porcentaje_ocupacion' => $this->porcentaje_ocupacion,
            'status_disponibilidad' => $this->status_disponibilidad,

            // VALIDACIONES BÁSICAS DE NEGOCIO
            'puede_recibir_reservas' => $this->capacidad_disponible > 0,
            'necesita_alerta' => $this->necesitaAlertaCapacidad(),
            'tiene_reservas' => $this->tieneReservas(),

            // INFORMACIÓN DETALLADA DE OCUPACIÓN - SOLO SI SE SOLICITA
            'ocupacion_detallada' => $this->when(
                $request->has('include_ocupacion'),
                [
                    'total_pasajeros' => $this->total_pasajeros,
                    'capacidad_total' => $this->vehiculo?->vehiculo_capacidad ?? 0,
                    'espacios_disponibles' => $this->capacidad_disponible,
                    'porcentaje_ocupacion' => $this->porcentaje_ocupacion,
                    'status' => $this->status_disponibilidad,
                    'alerta_capacidad' => $this->necesitaAlertaCapacidad(),
                    'puede_acomodar_1' => $this->capacidad_disponible >= 1,
                    'puede_acomodar_5' => $this->capacidad_disponible >= 5,
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
                    'ingresos_potenciales' => $this->calcularPrecioReserva(
                        $this->vehiculo?->vehiculo_capacidad ?? 0
                    ),
                ]
            ),

            // INFORMACIÓN OPERATIVA - SOLO SI SE SOLICITA
            'operacion' => $this->when(
                $request->has('include_operacion'),
                [
                    'puede_eliminar' => $this->puedeSerEliminada(),
                    'puede_modificar' => !$this->tieneReservasActivas(),
                    'vehiculo_disponible' => $this->vehiculo?->vehiculo_situacion ?? false,
                    'conductor_asignado' => !empty($this->persona_id),
                    'datos_completos' => !empty($this->ruta_activada_codigo) &&
                        !empty($this->vehiculo_id) &&
                        !empty($this->persona_id),
                ]
            ),

            // CARACTERÍSTICAS TEMPORALES
            'caracteristicas' => [
                'es_del_dia' => $this->ruta_activada_fecha_hora?->isToday() ?? false,
                'es_futura' => $this->ruta_activada_fecha_hora?->isFuture() ?? false,
                'es_pasada' => $this->ruta_activada_fecha_hora?->isPast() ?? false,
                'es_esta_semana' => $this->ruta_activada_fecha_hora?->isCurrentWeek() ?? false,
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
                        'puede_cerrarse' => $this->puedecerrarse(),
                    ],
                    'estado_actual' => [
                        'esta_activada' => $this->estaActivada(),
                        'esta_llena' => $this->estaLlena(),
                        'esta_ejecucion' => $this->estaEnEjecucion(),
                        'esta_cerrada' => $this->estaCerrada(),
                    ],
                    'flujo_automatizado' => [
                        'validar_antes_reserva' => function ($adultos, $ninos = 0) {
                            return $this->validarAntesDeAgregarReserva($adultos, $ninos);
                        }
                    ]
                ]
            ),

            // TIMESTAMPS ESTÁNDAR
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'fecha_iso' => $this->ruta_activada_fecha_hora?->toISOString(),
        ];
    }

    /**
     * MÉTODO HELPER PARA VERIFICAR SI PUEDE ACOMODAR PASAJEROS
     * Mantiene compatibilidad con el método del modelo
     */
    private function puedeAcomodarPasajeros($cantidad = 1)
    {
        return $this->capacidad_disponible >= $cantidad;
    }

    /**
     * MÉTODO HELPER PARA OBTENER STATUS LEGIBLE
     */
    private function getStatusLegible()
    {
        switch ($this->status_disponibilidad) {
            case 'DISPONIBLE':
                return 'Disponible';
            case 'CASI_LLENO':
                return 'Casi lleno';
            case 'COMPLETO':
                return 'Completo';
            case 'SIN_VEHICULO':
                return 'Sin vehículo';
            default:
                return 'Estado desconocido';
        }
    }
}
