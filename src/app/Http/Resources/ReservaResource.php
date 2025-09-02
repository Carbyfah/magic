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

            // INFORMACIÓN DE VIAJE (CORREGIDA - usa campo datetime unificado)
            'viaje' => [
                'ruta_completa' => $this->ruta_completa,
                'fecha' => $this->fecha_viaje,
                'hora' => $this->hora_viaje,
                'fecha_hora' => $this->fecha_hora_viaje,
                'servicio' => $this->formatearServicio(),
                'vehiculo' => $this->formatearVehiculo(),
                'origen' => $this->rutaActivada?->ruta?->ruta_origen,
                'destino' => $this->rutaActivada?->ruta?->ruta_destino,
            ],

            // VALIDACIONES BÁSICAS DE NEGOCIO (ACTUALIZADAS)
            'puede_ser_modificada' => $this->puedeSerModificada(),
            'puede_ser_cancelada' => $this->puedeSerCancelada(),
            'puede_ser_confirmada' => $this->puedeSerConfirmada(),
            'puede_generar_factura' => $this->puedeGenerarFactura(), // AHORA requiere 'confirmada'

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

            // INFORMACIÓN DE CAPACIDAD Y DISPONIBILIDAD
            'disponibilidad' => $this->when(
                $request->has('include_disponibilidad'),
                function () {
                    $disponibilidad = $this->consultarDisponibilidadRuta();
                    return [
                        'cabe_en_ruta' => $this->cabeEnLaRuta(),
                        'disponibilidad_ruta' => $disponibilidad,
                        'validacion_capacidad' => $this->validarCapacidadPropia(),
                        'necesita_alerta' => $this->necesitaAlertaCapacidad(),
                        'status_disponibilidad' => $this->obtenerStatusDisponibilidad(),
                        'porcentaje_ocupacion' => $this->obtenerPorcentajeOcupacion(),
                    ];
                }
            ),

            // INFORMACIÓN DE FACTURACIÓN ACTUALIZADA
            'facturacion' => $this->when(
                $request->has('include_facturacion'),
                [
                    'tiene_factura' => $this->tieneFactura(),
                    'esta_facturada' => $this->tieneFacturaActiva(),
                    'puede_facturarse' => $this->puedeGenerarFactura(), // CAMBIADO: 'confirmada' no 'ejecutada'
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

            // INFORMACIÓN FINANCIERA - Usando método del modelo sincronizado
            'financiero' => $this->when(
                $request->has('include_financiero'),
                [
                    'monto_automatico' => $this->getMontoAutomatico(),
                    'servicio_precio_normal' => $this->rutaActivada?->servicio?->servicio_precio_normal ?? 0,
                    'servicio_precio_descuento' => $this->rutaActivada?->servicio?->servicio_precio_descuento ?? 0,
                    'precio_aplicado' => $this->obtenerPrecioAplicado(),
                    'precio_calculado' => $this->calcularPrecioCompleto(),
                ]
            ),

            // INFORMACIÓN OPERATIVA
            'operacion' => $this->when(
                $request->has('include_operacion'),
                [
                    'codigo_publico' => $this->getCodigoPublico(),
                    'puede_eliminar' => $this->puedeSerModificada(),
                    'puede_transferir' => $this->puedeSerModificada(),
                    'requiere_validacion_capacidad' => !$this->cabeEnLaRuta(),
                    'datos_completos' => $this->validarDatosCompletos(),
                    'bloqueos' => $this->obtenerBloqueos(),
                ]
            ),

            // MENSAJES WHATSAPP - MANTENIDOS COMPLETOS
            'whatsapp' => $this->when(
                $request->has('include_whatsapp'),
                [
                    'mensaje_confirmacion' => $this->generarMensajeWhatsAppConfirmacion(),
                    'mensaje_recordatorio' => $this->generarMensajeWhatsAppRecordatorio(),
                    'mensaje_cancelacion' => $this->generarMensajeWhatsAppCancelacion(),
                    'puede_generar_mensaje' => !empty($this->reserva_nombres_cliente) &&
                        !empty($this->ruta_activada_id),
                ]
            ),

            // RELACIONES DETALLADAS VIA RUTA ACTIVADA
            'servicio_detallado' => $this->when(
                $request->has('include_servicio'),
                [
                    'id' => $this->rutaActivada?->servicio?->servicio_id,
                    'nombre' => $this->rutaActivada?->servicio?->servicio_servicio,
                    'codigo' => $this->rutaActivada?->servicio?->servicio_codigo,
                    'precio_normal' => $this->rutaActivada?->servicio?->servicio_precio_normal ?? 0,
                    'precio_descuento' => $this->rutaActivada?->servicio?->servicio_precio_descuento ?? 0,
                ]
            ),

            'vehiculo_detallado' => $this->when(
                $request->has('include_vehiculo'),
                [
                    'id' => $this->rutaActivada?->vehiculo?->vehiculo_id,
                    'placa' => $this->rutaActivada?->vehiculo?->vehiculo_placa,
                    'marca' => $this->rutaActivada?->vehiculo?->vehiculo_marca,
                    'modelo' => $this->rutaActivada?->vehiculo?->vehiculo_modelo,
                    'capacidad' => $this->rutaActivada?->vehiculo?->vehiculo_capacidad ?? 0,
                    'codigo' => $this->rutaActivada?->vehiculo?->vehiculo_codigo,
                ]
            ),

            'ruta_detallada' => $this->when(
                $request->has('include_ruta'),
                [
                    'id' => $this->rutaActivada?->ruta?->ruta_id,
                    'nombre' => $this->rutaActivada?->ruta?->ruta_ruta,
                    'codigo' => $this->rutaActivada?->ruta?->ruta_codigo,
                    'origen' => $this->rutaActivada?->ruta?->ruta_origen,
                    'destino' => $this->rutaActivada?->ruta?->ruta_destino,
                    'completa' => $this->ruta_completa,
                ]
            ),

            // CARACTERÍSTICAS TEMPORALES (CORREGIDAS - usa datetime unificado)
            'caracteristicas' => [
                'es_del_dia' => $this->rutaActivada?->ruta_activada_fecha_hora?->isToday() ?? false,
                'es_futura' => $this->rutaActivada?->ruta_activada_fecha_hora?->isFuture() ?? false,
                'es_pasada' => $this->rutaActivada?->ruta_activada_fecha_hora?->isPast() ?? false,
                'es_esta_semana' => $this->rutaActivada?->ruta_activada_fecha_hora?->isCurrentWeek() ?? false,
                'viaje_hoy' => $this->rutaActivada?->ruta_activada_fecha_hora?->isToday() ?? false,
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

            // APROVECHANDO VISTAS DE LA NUEVA DB
            'reportes' => $this->when(
                $request->has('include_reportes'),
                [
                    'aparece_en_reservas_completas' => true, // Siempre aparece en v_reservas_completas
                    'contribuye_ingresos_diarios' => $this->reserva_situacion == 1,
                    'visible_en_ocupacion_rutas' => $this->rutaActivada?->ruta_activada_situacion == 1,
                ]
            ),

            // TIMESTAMPS ESTÁNDAR (CORREGIDOS)
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'fecha_viaje_iso' => $this->rutaActivada?->ruta_activada_fecha_hora?->toISOString(),
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

    private function obtenerPrecioAplicado(): float
    {
        if (!$this->rutaActivada || !$this->rutaActivada->servicio) return 0;

        if ($this->es_venta_agencia && $this->rutaActivada->servicio->servicio_precio_descuento > 0) {
            return (float) $this->rutaActivada->servicio->servicio_precio_descuento;
        }

        return (float) ($this->rutaActivada->servicio->servicio_precio_normal ?? 0);
    }

    private function validarDatosCompletos(): bool
    {
        return !empty($this->reserva_codigo) &&
            !empty($this->reserva_nombres_cliente) &&
            !empty($this->reserva_apellidos_cliente) &&
            !empty($this->reserva_telefono_cliente) &&
            !empty($this->ruta_activada_id);
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

        if (!$this->cabeEnLaRuta()) {
            $bloqueos[] = 'capacidad_excedida';
        }

        return $bloqueos;
    }
}
