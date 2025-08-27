<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->persona_id,
            'codigo' => $this->persona_codigo,
            'nombres' => $this->persona_nombres,
            'apellidos' => $this->persona_apellidos,
            'nombre_completo' => $this->nombre_completo,
            'telefono' => $this->persona_telefono,
            'telefono_formateado' => $this->telefono_formateado,
            'email' => $this->persona_email,
            'activo' => $this->es_activo,
            'iniciales' => $this->iniciales,

            // Información del tipo de persona
            'tipo_persona' => TipoPersonaResource::make(
                $this->whenLoaded('tipoPersona')
            ),

            // Clasificaciones para permisos y lógica
            'roles' => [
                'es_administrador' => $this->esAdministrador(),
                'es_vendedor' => $this->esVendedor(),
                'es_chofer' => $this->esChofer(),
                'es_cliente' => $this->esCliente(),
                'es_contacto_agencia' => $this->esContactoAgencia(),
                'es_empleado' => $this->esEmpleado(),
                'puede_vender' => $this->puedeVender(),
            ],

            // Estado y validaciones
            'estado' => [
                'esta_activo' => $this->estaActivo(),
                'tiene_usuario' => $this->tieneUsuario(),
                'datos_completos' => $this->datosCompletos(),
                'email_valido' => $this->tieneEmailValido(),
                'telefono_valido' => $this->tieneTelefonoValido(),
            ],

            // Usuario asociado (sin información sensible)
            'usuario' => $this->when(
                $this->whenLoaded('usuario') && $this->tieneUsuario(),
                [
                    'codigo' => $this->usuario->usuario_codigo,
                    'activo' => $this->usuario->es_activo,
                    'ultima_actividad' => $this->usuario->ultimaActividad()?->toISOString(),
                ]
            ),

            // Comunicación para WhatsApp
            'comunicacion' => [
                'whatsapp_disponible' => $this->tieneTelefonoValido(),
                'whatsapp_link' => $this->linkWhatsApp(),
            ],

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
