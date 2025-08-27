<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactoAgenciaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->contactos_agencia_id,
            'codigo' => $this->contactos_agencia_codigo,
            'nombres' => $this->contactos_agencia_nombres,
            'apellidos' => $this->contactos_agencia_apellidos,
            'nombre_completo' => $this->nombre_completo,
            'cargo' => $this->contactos_agencia_cargo,
            'telefono' => $this->contactos_agencia_telefono,
            'telefono_formateado' => $this->telefono_formateado,
            'activo' => $this->es_activo,
            'iniciales' => $this->iniciales,

            // Jerarquía y roles dentro de la agencia
            'jerarquia' => [
                'es_gerente' => $this->esGerente(),
                'es_ventas' => $this->esDeVentas(),
                'es_operativo' => $this->esOperativo(),
                'es_principal' => $this->esPrincipal(),
                'nivel_prioridad' => $this->nivelPrioridad(),
            ],

            // Agencia asociada (información básica)
            'agencia' => $this->when(
                $this->whenLoaded('agencia'),
                [
                    'id' => $this->agencia->agencia_id,
                    'codigo' => $this->agencia->agencia_codigo,
                    'razon_social' => $this->agencia->agencia_razon_social,
                    'es_vip' => $this->agencia->esClienteVip(),
                ]
            ),

            // Estado y validaciones
            'estado' => [
                'datos_completos' => $this->datosCompletos(),
                'telefono_valido' => $this->tieneTelefonoValido(),
            ],

            // Comunicación
            'comunicacion' => [
                'whatsapp_disponible' => $this->tieneTelefonoValido(),
                'whatsapp_link' => $this->linkWhatsApp(),
                'puede_contactar' => $this->es_activo && $this->tieneTelefonoValido(),
            ],

            // Mensajes predefinidos para WhatsApp
            'mensajes_whatsapp' => $this->when(
                $request->has('include_mensajes'),
                [
                    'presentacion' => $this->mensajeWhatsAppPresentacion(),
                    'puede_generar_confirmacion' => true,
                ]
            ),

            // Información completa para reportes detallados
            'informacion_completa' => $this->when(
                $request->has('detalle_completo'),
                $this->informacionCompleta()
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
