<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FacturaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->facturas_id,
            'codigo' => $this->facturas_codigo,
            'fecha' => $this->facturas_fecha?->toDateString(),
            'fecha_formateada' => $this->fecha_formateada,
            'activo' => $this->es_activo,
            'hash' => $this->facturas_hash,

            // Información del archivo
            'archivo' => [
                'tiene_archivo' => $this->tiene_archivo,
                'nombre_archivo' => $this->nombre_archivo,
                'url' => $this->facturas_url,
                'nombre_sugerido' => $this->generarNombreArchivo(),
            ],

            // Información financiera
            'financiero' => [
                'monto' => (float) $this->getMontoFacturado(),
                'tipo_factura' => $this->getTipoFactura(),
                'es_agencia' => $this->esFacturaDeAgencia(),
            ],

            // Cliente facturado
            'cliente' => $this->getClienteFacturado(),

            // Vendedor que emitió la factura
            'vendedor' => [
                'id' => $this->usuario?->usuario_id,
                'codigo' => $this->usuario?->usuario_codigo,
                'nombre_completo' => $this->getVendedor(),
            ],

            // Servicio facturado
            'servicio' => $this->when(
                $this->whenLoaded('servicio'),
                [
                    'id' => $this->servicio->servicio_id,
                    'codigo' => $this->servicio->servicio_codigo,
                    'nombre' => $this->servicio->servicio_servicio,
                ]
            ),

            // Reserva asociada
            'reserva' => $this->when(
                $this->whenLoaded('reserva'),
                [
                    'id' => $this->reserva->reserva_id,
                    'codigo' => $this->reserva->reserva_codigo,
                    'pasajeros' => $this->reserva->total_pasajeros,
                    'cliente' => $this->reserva->nombre_completo_cliente,
                ]
            ),

            // Validaciones temporales
            'temporal' => [
                'es_del_mes_actual' => $this->esDelMesActual(),
                'es_de_hoy' => $this->esDeHoy(),
            ],

            // Permisos y operaciones
            'permisos' => [
                'puede_editarse' => $this->puedeEditarse(),
                'puede_anularse' => $this->puedeAnularse(),
                'integridad_valida' => $this->validarIntegridad(),
            ],

            // Resumen completo para reportes detallados
            'resumen_completo' => $this->when(
                $request->has('resumen_completo') || $request->user()?->tienePermiso('reportes'),
                $this->resumenCompleto()
            ),

            // Operaciones disponibles
            'operaciones_disponibles' => [
                'puede_generar_pdf' => $this->es_activo,
                'puede_enviar_email' => $this->es_activo && ($this->getClienteFacturado()['email'] ?? false),
                'puede_reenviar' => $this->es_activo,
                'puede_anular' => $this->puedeAnularse(),
            ],

            // Información de integridad y seguridad
            'seguridad' => $this->when(
                $request->user()?->esAdministrador(),
                [
                    'hash_valido' => $this->validarIntegridad(),
                    'hash_actual' => $this->facturas_hash,
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
