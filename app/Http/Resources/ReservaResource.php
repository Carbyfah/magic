<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // CAMPOS BÁSICOS - SIEMPRE INCLUIDOS
            'id' => $this->reserva_id,
            'codigo' => $this->reserva_codigo,
            'nombres_cliente' => $this->reserva_nombres_cliente,
            'apellidos_cliente' => $this->reserva_apellidos_cliente,
            'nit_cliente' => $this->reserva_cliente_nit,
            'telefono_cliente' => $this->reserva_telefono_cliente,
            'email_cliente' => $this->reserva_email_cliente,
            'cantidad_adultos' => $this->reserva_cantidad_adultos,
            'cantidad_ninos' => $this->reserva_cantidad_ninos ?? 0,
            'total_pasajeros' => $this->total_pasajeros, // CALCULADO DINÁMICAMENTE
            'direccion_abordaje' => $this->reserva_direccion_abordaje,
            'notas' => $this->reserva_notas,
            'monto' => (float) $this->reserva_monto,
            'activo' => $this->reserva_situacion,

            // INFORMACIÓN COMBINADA BÁSICA
            'nombre_completo_cliente' => $this->nombre_completo_cliente,
            'telefono_formateado' => $this->formatearTelefono(),
            'tipo_venta' => $this->tipo_venta,
            'es_venta_directa' => $this->es_venta_directa,
            'es_venta_agencia' => $this->es_venta_agencia,

            // NUEVO: TIPO DE SERVICIO
            'tipo_servicio' => $this->tipo_servicio, // 'RUTA' o 'TOUR'
            'es_ruta' => $this->esRuta(),
            'es_tour' => $this->esTour(),

            // RELACIONES FORÁNEAS - FORMATO ESTÁNDAR
            'usuario_id' => $this->usuario_id,
            'usuario' => [
                'id' => $this->usuario?->usuario_id,
                'nombre' => $this->vendedor_nombre,
                'codigo' => $this->usuario?->usuario_codigo,
            ],

            'estado_id' => $this->estado_id,
            'estado' => [
                'id' => $this->estado?->estado_id,
                'nombre' => $this->estado_nombre,
                'codigo' => $this->estado?->estado_codigo,
                'descripcion' => $this->estado?->estado_descripcion,
            ],

            'agencia_id' => $this->agencia_id,
            'agencia' => [
                'id' => $this->agencia?->agencia_id,
                'nombre' => $this->agencia_nombre,
                'codigo' => $this->agencia?->agencia_codigo,
                'razon_social' => $this->agencia?->agencia_razon_social,
                'telefono' => $this->agencia?->agencia_telefono,
            ],

            'ruta_activada_id' => $this->ruta_activada_id,
            'ruta_activada' => [
                'id' => $this->rutaActivada?->ruta_activada_id,
                'codigo' => $this->rutaActivada?->ruta_activada_codigo,
                'fecha' => $this->fecha_viaje,
                'hora' => $this->hora_viaje,
                'fecha_completa' => $this->fecha_hora_viaje,
            ],

            // NUEVO: RELACIÓN CON TOURS
            'tour_activado_id' => $this->tour_activado_id,
            'tour_activado' => [
                'id' => $this->tourActivado?->tour_activado_id,
                'codigo' => $this->tourActivado?->tour_activado_codigo,
                'fecha' => $this->fecha_viaje,
                'hora' => $this->hora_viaje,
                'fecha_completa' => $this->fecha_hora_viaje,
                'descripcion' => $this->tourActivado?->tour_activado_descripcion,
                'punto_encuentro' => $this->tourActivado?->tour_activado_punto_encuentro,
                'duracion_horas' => $this->tourActivado?->tour_activado_duracion_horas,
            ],

            // INFORMACIÓN DE VIAJE (UNIFICADA PARA RUTAS Y TOURS)
            'viaje' => [
                'tipo_servicio' => $this->tipo_servicio,
                'detalle_servicio' => $this->ruta_completa,
                'fecha' => $this->fecha_viaje,
                'hora' => $this->hora_viaje,
                'fecha_hora' => $this->fecha_hora_viaje,
                'servicio' => $this->formatearServicio(),
                'vehiculo' => $this->formatearVehiculo(),

                // Información específica según tipo
                'ruta_info' => $this->when($this->esRuta(), [
                    'origen' => $this->rutaActivada?->ruta?->ruta_origen,
                    'destino' => $this->rutaActivada?->ruta?->ruta_destino,
                    'vehiculo_placa' => $this->rutaActivada?->vehiculo?->vehiculo_placa,
                    'conductor' => $this->rutaActivada?->conductor_nombre,
                ]),

                'tour_info' => $this->when($this->esTour(), [
                    'descripcion' => $this->tourActivado?->tour_activado_descripcion,
                    'punto_encuentro' => $this->tourActivado?->tour_activado_punto_encuentro,
                    'duracion_horas' => $this->tourActivado?->tour_activado_duracion_horas,
                    'guia' => $this->tourActivado?->guia_nombre,
                    'tipo_guia' => $this->tourActivado?->tieneGuiaAsignado() ? 'interno' : 'externo',
                ]),
            ],

            // VALIDACIONES BÁSICAS DE NEGOCIO (ACTUALIZADAS)
            'puede_ser_modificada' => $this->puedeSerModificada(),
            'puede_ser_cancelada' => $this->puedeSerCancelada(),
            'puede_ser_confirmada' => $this->puedeSerConfirmada(),
            'puede_generar_factura' => $this->puedeGenerarFactura(),

            // VALIDACIÓN DE FACTURACIÓN - Sin tabla facturas
            'tiene_factura' => $this->tieneFactura(),
            'esta_facturada' => $this->tieneFacturaActiva(),

            // INFORMACIÓN DETALLADA DEL CLIENTE - SOLO SI SE SOLICITA
            'cliente_detallado' => $this->when(
                $request->has('include_cliente'),
                [
                    'nombre_completo' => $this->nombre_completo_cliente,
                    'telefono_formateado' => $this->formatearTelefono(),
                    'tiene_nit' => !empty($this->reserva_cliente_nit),
                    'tiene_email' => !empty($this->reserva_email_cliente),
                    'datos_completos' => !empty($this->reserva_nombres_cliente) &&
                        !empty($this->reserva_apellidos_cliente) &&
                        !empty($this->reserva_telefono_cliente),
                ]
            ),

            // INFORMACIÓN DE CAPACIDAD Y DISPONIBILIDAD (ACTUALIZADA PARA TOURS)
            'disponibilidad' => $this->when(
                $request->has('include_disponibilidad'),
                function () {
                    $disponibilidad = $this->consultarDisponibilidadRuta();
                    return [
                        'tipo_servicio' => $this->tipo_servicio,
                        'cabe_en_ruta' => $this->cabeEnLaRuta(),
                        'disponibilidad_servicio' => $disponibilidad,
                        'validacion_capacidad' => $this->validarCapacidadPropia(),
                        'necesita_alerta' => $this->necesitaAlertaCapacidad(),
                        'status_disponibilidad' => $this->obtenerStatusDisponibilidad(),
                        'porcentaje_ocupacion' => $this->obtenerPorcentajeOcupacion(),
                        'sin_limite_capacidad' => $this->esTour(),
                    ];
                }
            ),

            // INFORMACIÓN DE FACTURACIÓN ACTUALIZADA
            'facturacion' => $this->when(
                $request->has('include_facturacion'),
                [
                    'tiene_factura' => $this->tieneFactura(),
                    'esta_facturada' => $this->tieneFacturaActiva(),
                    'puede_facturarse' => $this->puedeGenerarFactura(),
                    'estado_facturacion' => $this->obtenerEstadoFacturacion(),
                    'monto_facturado' => $this->tieneFactura() ? (float) $this->reserva_monto : 0,
                    'requiere_facturacion' => false,
                    'permite_refacturacion' => false,
                    'bloquea_modificacion' => $this->tieneFactura(),
                    'datos_para_factura' => $this->when(
                        $this->puedeGenerarFactura(),
                        function () {
                            return $this->generarDatosFactura();
                        }
                    ),
                ]
            ),

            // INFORMACIÓN FINANCIERA (ACTUALIZADA PARA TOURS)
            'financiero' => $this->when(
                $request->has('include_financiero'),
                [
                    'monto_automatico' => $this->getMontoAutomatico(),
                    'servicio_precio_normal' => $this->obtenerPrecioNormalServicio(),
                    'servicio_precio_descuento' => $this->obtenerPrecioDescuentoServicio(),
                    'precio_aplicado' => $this->obtenerPrecioAplicado(),
                    'precio_calculado' => $this->calcularPrecioCompleto(),
                ]
            ),

            // INFORMACIÓN OPERATIVA (ACTUALIZADA)
            'operacion' => $this->when(
                $request->has('include_operacion'),
                [
                    'codigo_publico' => $this->getCodigoPublico(),
                    'puede_eliminar' => $this->puedeSerModificada(),
                    'puede_transferir' => $this->puedeSerModificada(),
                    'requiere_validacion_capacidad' => !$this->cabeEnLaRuta() && $this->esRuta(),
                    'datos_completos' => $this->validarDatosCompletos(),
                    'bloqueos' => $this->obtenerBloqueos(),
                    'validacion_constraint' => $this->validarConstraintServicio(),
                ]
            ),

            // MENSAJES WHATSAPP - ACTUALIZADOS PARA TOURS
            'whatsapp' => $this->when(
                $request->has('include_whatsapp'),
                [
                    'mensaje_confirmacion' => $this->generarMensajeWhatsAppConfirmacion(),
                    'mensaje_recordatorio' => $this->generarMensajeWhatsAppRecordatorio(),
                    'mensaje_cancelacion' => $this->generarMensajeWhatsAppCancelacion(),
                    'puede_generar_mensaje' => !empty($this->reserva_nombres_cliente) &&
                        ($this->ruta_activada_id || $this->tour_activado_id),
                ]
            ),

            // RELACIONES DETALLADAS VIA SERVICIO (UNIFICADO)
            'servicio_detallado' => $this->when(
                $request->has('include_servicio'),
                function () {
                    $servicio = $this->esRuta()
                        ? $this->rutaActivada?->servicio
                        : $this->tourActivado?->servicio;

                    return [
                        'id' => $servicio?->servicio_id,
                        'nombre' => $servicio?->servicio_servicio,
                        'codigo' => $servicio?->servicio_codigo,
                        'precio_normal' => $servicio?->servicio_precio_normal ?? 0,
                        'precio_descuento' => $servicio?->servicio_precio_descuento ?? 0,
                    ];
                }
            ),

            // INFORMACIÓN ESPECÍFICA DE VEHÍCULO (SOLO RUTAS)
            'vehiculo_detallado' => $this->when(
                $request->has('include_vehiculo') && $this->esRuta(),
                [
                    'id' => $this->rutaActivada?->vehiculo?->vehiculo_id,
                    'placa' => $this->rutaActivada?->vehiculo?->vehiculo_placa,
                    'marca' => $this->rutaActivada?->vehiculo?->vehiculo_marca,
                    'modelo' => $this->rutaActivada?->vehiculo?->vehiculo_modelo,
                    'capacidad' => $this->rutaActivada?->vehiculo?->vehiculo_capacidad ?? 0,
                    'codigo' => $this->rutaActivada?->vehiculo?->vehiculo_codigo,
                ]
            ),

            // INFORMACIÓN ESPECÍFICA DE RUTA
            'ruta_detallada' => $this->when(
                $request->has('include_ruta') && $this->esRuta(),
                [
                    'id' => $this->rutaActivada?->ruta?->ruta_id,
                    'nombre' => $this->rutaActivada?->ruta?->ruta_ruta,
                    'codigo' => $this->rutaActivada?->ruta?->ruta_codigo,
                    'origen' => $this->rutaActivada?->ruta?->ruta_origen,
                    'destino' => $this->rutaActivada?->ruta?->ruta_destino,
                    'completa' => $this->ruta_completa,
                ]
            ),

            // NUEVO: INFORMACIÓN ESPECÍFICA DE TOUR
            'tour_detallado' => $this->when(
                $request->has('include_tour') && $this->esTour(),
                function () {
                    return $this->obtenerDetallesTour();
                }
            ),

            // CARACTERÍSTICAS TEMPORALES (UNIFICADA)
            'caracteristicas' => [
                'es_del_dia' => $this->esFechaViajeDia(),
                'es_futura' => $this->esFechaViajesFutura(),
                'es_pasada' => $this->esFechaViajePasada(),
                'es_esta_semana' => $this->esFechaViajeSemanaActual(),
                'viaje_hoy' => $this->esFechaViajeDia(),
            ],

            // INFORMACIÓN DE AUDITORÍA
            'auditoria' => $this->when(
                $request->has('include_auditoria'),
                [
                    'fecha_registro' => $this->created_at?->format('d/m/Y H:i'),
                    'ultima_modificacion' => $this->updated_at?->format('d/m/Y H:i'),
                    'dias_desde_registro' => $this->created_at?->diffInDays(now()),
                    'modificado_recientemente' => $this->updated_at?->diffInHours(now()) < 24,
                    'vendedor' => $this->vendedor_nombre,
                ]
            ),

            // APROVECHANDO VISTAS DE LA NUEVA DB (ACTUALIZADO PARA TOURS)
            'reportes' => $this->when(
                $request->has('include_reportes'),
                [
                    'aparece_en_reservas_completas' => true,
                    'contribuye_ingresos_diarios' => $this->reserva_situacion == 1,
                    'visible_en_ocupacion_rutas' => $this->esRuta() && $this->rutaActivada?->ruta_activada_situacion == 1,
                    'visible_en_info_tours' => $this->esTour() && $this->tourActivado?->tour_activado_situacion == 1,
                    'aparece_en_dashboard_unificado' => true,
                ]
            ),

            // TIMESTAMPS ESTÁNDAR
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'fecha_viaje_iso' => $this->obtenerFechaViajeISO(),
        ];
    }

    /**
     * MÉTODOS DE FACTURACIÓN ACTUALIZADOS - Sin tabla facturas
     */
    private function obtenerEstadoFacturacion(): string
    {
        if (!$this->estado) return 'sin_estado';

        $estado = strtolower($this->estado->estado_estado);

        switch ($estado) {
            case 'pendiente':
                return 'no_facturable';
            case 'confirmada':
                return 'facturable';
            case 'cancelada':
                return 'cancelada';
            default:
                return 'estado_desconocido';
        }
    }

    /**
     * MÉTODOS ACTUALIZADOS PARA SOPORTE DE TOURS
     */
    private function obtenerPrecioAplicado(): float
    {
        $servicio = $this->esRuta()
            ? $this->rutaActivada?->servicio
            : $this->tourActivado?->servicio;

        if (!$servicio) return 0;

        if ($this->es_venta_agencia && $servicio->servicio_precio_descuento > 0) {
            return (float) $servicio->servicio_precio_descuento;
        }

        return (float) ($servicio->servicio_precio_normal ?? 0);
    }

    private function obtenerPrecioNormalServicio(): float
    {
        $servicio = $this->esRuta()
            ? $this->rutaActivada?->servicio
            : $this->tourActivado?->servicio;

        return (float) ($servicio?->servicio_precio_normal ?? 0);
    }

    private function obtenerPrecioDescuentoServicio(): float
    {
        $servicio = $this->esRuta()
            ? $this->rutaActivada?->servicio
            : $this->tourActivado?->servicio;

        return (float) ($servicio?->servicio_precio_descuento ?? 0);
    }

    private function validarDatosCompletos(): bool
    {
        return !empty($this->reserva_codigo) &&
            !empty($this->reserva_nombres_cliente) &&
            !empty($this->reserva_apellidos_cliente) &&
            !empty($this->reserva_telefono_cliente) &&
            ($this->ruta_activada_id || $this->tour_activado_id);
    }

    private function obtenerBloqueos(): array
    {
        $bloqueos = [];

        if ($this->tieneFactura()) {
            $bloqueos[] = 'facturada';
        }

        if (!$this->puedeSerModificada()) {
            $bloqueos[] = 'estado_bloqueado';
        }

        if (!$this->cabeEnLaRuta() && $this->esRuta()) {
            $bloqueos[] = 'capacidad_excedida';
        }

        $validacionConstraint = $this->validarConstraintServicio();
        if (!$validacionConstraint['valido']) {
            $bloqueos[] = 'constraint_servicio';
        }

        return $bloqueos;
    }

    /**
     * NUEVOS MÉTODOS PARA FECHAS UNIFICADAS
     */
    private function obtenerFechaViajeISO(): ?string
    {
        if ($this->esRuta()) {
            return $this->rutaActivada?->ruta_activada_fecha_hora?->toISOString();
        }

        if ($this->esTour()) {
            return $this->tourActivado?->tour_activado_fecha_hora?->toISOString();
        }

        return null;
    }

    private function esFechaViajeDia(): bool
    {
        if ($this->esRuta()) {
            return $this->rutaActivada?->ruta_activada_fecha_hora?->isToday() ?? false;
        }

        if ($this->esTour()) {
            return $this->tourActivado?->tour_activado_fecha_hora?->isToday() ?? false;
        }

        return false;
    }

    private function esFechaViajesFutura(): bool
    {
        if ($this->esRuta()) {
            return $this->rutaActivada?->ruta_activada_fecha_hora?->isFuture() ?? false;
        }

        if ($this->esTour()) {
            return $this->tourActivado?->tour_activado_fecha_hora?->isFuture() ?? false;
        }

        return false;
    }

    private function esFechaViajePasada(): bool
    {
        if ($this->esRuta()) {
            return $this->rutaActivada?->ruta_activada_fecha_hora?->isPast() ?? false;
        }

        if ($this->esTour()) {
            return $this->tourActivado?->tour_activado_fecha_hora?->isPast() ?? false;
        }

        return false;
    }

    private function esFechaViajeSemanaActual(): bool
    {
        if ($this->esRuta()) {
            return $this->rutaActivada?->ruta_activada_fecha_hora?->isCurrentWeek() ?? false;
        }

        if ($this->esTour()) {
            return $this->tourActivado?->tour_activado_fecha_hora?->isCurrentWeek() ?? false;
        }

        return false;
    }
}
