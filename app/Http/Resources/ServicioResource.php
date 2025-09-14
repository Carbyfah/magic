<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->servicio_id,
            'codigo' => $this->servicio_codigo,
            'nombre' => $this->servicio_servicio,
            'activo' => $this->es_activo,
            'tipo' => $this->tipo_servicio,

            // Precios detallados para reservas
            'precios' => [
                'adulto_normal' => (float) $this->servicio_precio_normal,
                'adulto_descuento' => (float) $this->servicio_precio_descuento,
                'nino_normal' => (float) $this->precio_ninos_normal,
                'nino_descuento' => (float) $this->precio_ninos_descuento,
                'tiene_descuento' => $this->tieneDescuento(),
                'porcentaje_descuento' => $this->porcentajeDescuento(),
                'precios_completos' => $this->tienePreciosCompletos(),
            ],

            // Clasificaciones para filtros
            'clasificacion' => [
                'es_tour' => $this->esTour(),
                'es_transporte' => $this->esTransporte(),
                'es_shuttle' => $this->esShuttle(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_rutas_activadas' => $this->whenCounted('rutasActivadas'),
                    'total_facturas' => $this->whenCounted('facturas'),
                ]
            ),

            // Función para cálculo de precios en tiempo real
            'calculadora' => [
                'puede_calcular' => $this->tienePreciosCompletos(),
            ],

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
