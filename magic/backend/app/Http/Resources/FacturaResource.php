<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FacturaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_facturas_sat,
            'informacion_factura' => [
                'numero_factura' => $this->numero_factura_sat,
                'serie_factura' => $this->serie_factura,
                'fecha_factura' => $this->fecha_factura?->format('Y-m-d'),
                'fecha_formateada' => $this->fecha_factura?->format('d/m/Y'),
                'total_factura' => $this->total_factura,
                'total_formateado' => 'Q' . number_format($this->total_factura, 2),
            ],
            'cliente' => [
                'nit' => $this->nit_cliente,
                'nit_formateado' => $this->formatearNit(),
                'nombre' => $this->nombre_cliente,
                'direccion' => $this->direccion_cliente,
            ],
            'servicios' => [
                'descripcion' => $this->descripcion_servicios,
                'observaciones' => $this->observaciones,
                'tiene_observaciones' => !empty($this->observaciones),
            ],
            'estado_sat' => [
                'estado' => $this->estado_sat ?? 'Pendiente',
                'fecha_envio' => $this->fecha_envio_sat?->format('Y-m-d H:i:s'),
                'uuid_sat' => $this->uuid_sat,
                'certificada' => !empty($this->uuid_sat),
                'error_sat' => $this->error_sat,
                'tiene_error' => !empty($this->error_sat),
            ],
            'reserva' => $this->when($this->relationLoaded('reserva') && $this->reserva, function () {
                return [
                    'id' => $this->reserva->id_reservas,
                    'cliente' => $this->reserva->reservas_nombres_cliente . ' ' . $this->reserva->reservas_apellidos_cliente,
                    'fecha_servicio' => $this->reserva->reservas_fecha_servicio?->format('d/m/Y'),
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            'computed' => [
                'codigo_factura' => $this->generarCodigoFactura(),
                'estado_color' => $this->obtenerColorEstado(),
                'dias_desde_emision' => $this->fecha_factura ? $this->fecha_factura->diffInDays(today()) : null,
                'requiere_atencion' => $this->requiereAtencion(),
                'monto_categoria' => $this->categorizarMonto(),
            ],
        ];
    }

    /**
     * Formatear NIT guatemalteco
     */
    private function formatearNit(): string
    {
        $nit = preg_replace('/[^0-9K]/', '', $this->nit_cliente);

        if (strlen($nit) >= 8) {
            return substr($nit, 0, -1) . '-' . substr($nit, -1);
        }

        return $this->nit_cliente;
    }

    /**
     * Generar código único de factura
     */
    private function generarCodigoFactura(): string
    {
        $serie = $this->serie_factura ?? 'A';
        $numero = str_pad($this->numero_factura_sat ?? $this->id_facturas_sat, 6, '0', STR_PAD_LEFT);
        return "{$serie}-{$numero}";
    }

    /**
     * Obtener color según estado SAT
     */
    private function obtenerColorEstado(): string
    {
        $estado = strtolower($this->estado_sat ?? 'pendiente');

        switch ($estado) {
            case 'certificada':
            case 'enviada':
                return '#10B981'; // Verde
            case 'pendiente':
                return '#F59E0B'; // Amarillo
            case 'error':
            case 'rechazada':
                return '#EF4444'; // Rojo
            default:
                return '#6B7280'; // Gris
        }
    }

    /**
     * Verificar si requiere atención
     */
    private function requiereAtencion(): bool
    {
        // Requiere atención si tiene error o lleva más de 24 horas pendiente
        if (!empty($this->error_sat)) {
            return true;
        }

        if (($this->estado_sat ?? 'pendiente') === 'Pendiente' &&
            $this->created_at &&
            $this->created_at->diffInHours(now()) > 24
        ) {
            return true;
        }

        return false;
    }

    /**
     * Categorizar monto de factura
     */
    private function categorizarMonto(): string
    {
        if ($this->total_factura < 100) {
            return 'Bajo';
        } elseif ($this->total_factura < 500) {
            return 'Medio';
        } elseif ($this->total_factura < 2000) {
            return 'Alto';
        } else {
            return 'Muy Alto';
        }
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'links' => [
                'self' => route('facturas.show', ['factura' => $this->id_facturas_sat]),
                'update' => route('facturas.update', ['factura' => $this->id_facturas_sat]),
                'destroy' => route('facturas.destroy', ['factura' => $this->id_facturas_sat]),
                'enviar_sat' => route('facturas.enviar-sat', ['factura' => $this->id_facturas_sat]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Factura');
    }
}
