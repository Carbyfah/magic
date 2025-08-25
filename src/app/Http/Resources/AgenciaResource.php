<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AgenciaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'codigo_agencia' => $this->codigo_agencia,
            'razon_social' => $this->razon_social,
            'nombre_comercial' => $this->nombre_comercial,
            'nit' => $this->nit,
            'registro_turistico' => $this->registro_turistico,
            'direccion' => $this->direccion,
            'telefono_principal' => $this->telefono_principal,
            'telefono_secundario' => $this->telefono_secundario,
            'email_principal' => $this->email_principal,
            'whatsapp' => $this->whatsapp,
            'pais' => [
                'id' => $this->pais->id ?? null,
                'nombre' => $this->pais->nombre_pais ?? null,
                'codigo_iso2' => $this->pais->codigo_iso2 ?? null,
            ],
            'contacto' => [
                'nombre' => $this->contacto_nombre,
                'cargo' => $this->contacto_cargo,
                'telefono' => $this->contacto_telefono,
                'email' => $this->contacto_email,
            ],
            'tipo_agencia' => [
                'id' => $this->tipoAgencia->id ?? null,
                'codigo' => $this->tipoAgencia->codigo ?? null,
                'nombre' => $this->tipoAgencia->nombre_tipo ?? null,
            ],
            'comision_porcentaje' => $this->comision_porcentaje,
            'limite_credito' => $this->limite_credito,
            'credito_disponible' => $this->credito_disponible ?? 0,
            'deuda_pendiente' => $this->deuda_pendiente ?? 0,
            'fecha_inicio_relacion' => $this->fecha_inicio_relacion?->format('Y-m-d'),
            'forma_pago' => [
                'id' => $this->formaPago->id ?? null,
                'codigo' => $this->formaPago->codigo ?? null,
                'nombre' => $this->formaPago->nombre_forma ?? null,
            ],
            'estado_comercial' => [
                'id' => $this->estadoComercial->id ?? null,
                'codigo' => $this->estadoComercial->codigo ?? null,
                'nombre' => $this->estadoComercial->nombre_estado ?? null,
                'color' => $this->estadoComercial->color_hex ?? null,
            ],
            'estadisticas' => [
                'total_reservas' => $this->whenLoaded('reservas', function () {
                    return $this->total_reservas;
                }),
                'total_ventas' => $this->whenLoaded('ventas', function () {
                    return $this->total_ventas;
                }),
            ],
            'situacion' => $this->situacion,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
