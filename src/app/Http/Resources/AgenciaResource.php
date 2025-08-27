<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgenciaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->agencia_id,
            'codigo' => $this->agencia_codigo,
            'razon_social' => $this->agencia_razon_social,
            'nit' => $this->agencia_nit,
            'email' => $this->agencia_email,
            'telefono' => $this->agencia_telefono,
            'telefono_formateado' => $this->telefono_formateado,
            'activo' => $this->es_activo,
            'tipo' => $this->tipo_agencia,

            // Clasificaciones para lógica de negocio
            'caracteristicas' => [
                'es_internacional' => $this->esInternacional(),
                'es_operador_turistico' => $this->esOperadorTuristico(),
                'es_vip' => $this->esClienteVip(),
                'esta_activa' => $this->estaActiva(),
                'necesita_seguimiento' => $this->necesitaSeguimiento(),
            ],

            // Estadísticas comerciales
            'estadisticas' => [
                'reservas_mes_actual' => $this->getTotalReservasMes(),
                'total_contactos' => $this->whenCounted('contactos'),
                'total_reservas' => $this->whenCounted('reservas'),
                'tiene_contacto_activo' => $this->tieneContactoActivo(),
            ],

            // Información financiera (solo para usuarios autorizados)
            'financiero' => $this->when(
                $request->user()?->tienePermiso('reportes'),
                [
                    'ingresos_totales' => $this->ingresosTotales(),
                    'comisiones_generadas' => $this->comisionesGeneradas(),
                ]
            ),

            // Contacto principal para comunicación rápida
            'contacto_principal' => ContactoAgenciaResource::make(
                $this->whenLoaded('contactoPrincipal')
            ),

            // Contactos completos cuando se requiera
            'contactos' => ContactoAgenciaResource::collection(
                $this->whenLoaded('contactos')
            ),

            // Reservas recientes para seguimiento
            'reservas_recientes' => $this->when(
                $request->has('include_reservas'),
                ReservaResource::collection($this->whenLoaded('reservas'))
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
