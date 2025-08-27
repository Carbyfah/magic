<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->reserva_id,
            'codigo' => $this->reserva_codigo,
            'activo' => $this->es_activo,

            // Información del cliente
            'cliente' => [
                'nombres' => $this->reserva_nombres_cliente,
                'apellidos' => $this->reserva_apellidos_cliente,
                'nombre_completo' => $this->nombre_completo_cliente,
                'nit' => $this->reserva_cliente_nit,
                'telefono' => $this->reserva_telefono_cliente,
                'telefono_formateado' => $this->telefono_formateado,
                'email' => $this->reserva_email_cliente,
            ],

            // Información de pasajeros
            'pasajeros' => [
                'adultos' => $this->reserva_cantidad_adultos,
                'ninos' => $this->reserva_cantidad_ninos,
                'total' => $this->total_pasajeros,
            ],

            // Información financiera
            'financiero' => [
                'monto' => (float) $this->reserva_monto,
                'tipo_cliente' => $this->tipo_cliente,
                'es_agencia' => $this->es_agencia,
                'tiene_factura' => $this->tieneFactura(),
            ],

            // Información logística
            'logistica' => [
                'direccion_abordaje' => $this->reserva_direccion_abordaje,
                'notas' => $this->reserva_notas,
            ],

            // Estados para workflow
            'estados' => [
                'pendiente' => $this->estaPendiente(),
                'confirmada' => $this->estaConfirmada(),
                'ejecutandose' => $this->seEstaEjecutando(),
                'finalizada' => $this->estaFinalizada(),
                'cancelada' => $this->estaCancelada(),
            ],

            // Estado actual detallado
            'estado_actual' => EstadoResource::make(
                $this->whenLoaded('estado')
            ),

            // Vendedor que creó la reserva
            'vendedor' => $this->when(
                $this->whenLoaded('usuario'),
                [
                    'id' => $this->usuario->usuario_id,
                    'codigo' => $this->usuario->usuario_codigo,
                    'nombre_completo' => $this->usuario->nombre_completo,
                ]
            ),

            // Agencia si es reserva de agencia
            'agencia' => AgenciaResource::make(
                $this->whenLoaded('agencia')
            ),

            // Ruta activada con información del servicio
            'ruta_activada' => RutaActivadaResource::make(
                $this->whenLoaded('rutaActivada')
            ),

            // Información del servicio (extraída de ruta activada)
            'servicio_info' => $this->when(
                $this->whenLoaded('rutaActivada.servicio'),
                function () {
                    return [
                        'nombre' => $this->rutaActivada->servicio->servicio_servicio,
                        'fecha' => $this->rutaActivada->ruta_activada_fecha?->format('d/m/Y'),
                        'hora' => $this->rutaActivada->ruta_activada_hora?->format('H:i'),
                        'ruta_completa' => $this->rutaActivada->ruta?->ruta_completa,
                        'vehiculo' => $this->rutaActivada->vehiculo?->descripcion_completa,
                    ];
                }
            ),

            // Facturas asociadas
            'facturas' => FacturaResource::collection(
                $this->whenLoaded('facturas')
            ),

            // Factura activa para referencia rápida
            'factura_activa' => FacturaResource::make(
                $this->whenLoaded('facturaActiva')
            ),

            // Validaciones para la interfaz
            'validaciones' => [
                'datos_completos' => $this->datosCompletos(),
                'telefono_valido' => $this->tieneTelefonoValido(),
                'email_valido' => $this->tieneEmailValido(),
            ],

            // Comunicación WhatsApp
            'comunicacion' => [
                'whatsapp_disponible' => $this->tieneTelefonoValido(),
                'whatsapp_link' => $this->linkWhatsApp(),
                'mensaje_confirmacion' => $this->when(
                    $request->has('include_mensajes'),
                    $this->mensajeWhatsAppConfirmacion()
                ),
            ],

            // Operaciones disponibles según estado
            'operaciones_disponibles' => [
                'puede_confirmar' => $this->estaPendiente(),
                'puede_ejecutar' => $this->estaConfirmada(),
                'puede_finalizar' => $this->seEstaEjecutando(),
                'puede_cancelar' => $this->estaPendiente() || $this->estaConfirmada(),
                'puede_facturar' => $this->estaConfirmada() && !$this->tieneFactura(),
                'puede_editar' => $this->estaPendiente(),
            ],

            // Resumen completo para reportes
            'resumen_completo' => $this->when(
                $request->has('resumen_completo'),
                $this->resumenCompleto()
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
