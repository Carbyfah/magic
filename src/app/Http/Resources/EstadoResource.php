<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->estado_id,
            'codigo' => $this->estado_codigo,
            'nombre' => $this->estado_estado,
            'descripcion' => $this->estado_descripcion,
            'activo' => $this->es_activo,
            'categoria' => $this->categoria_estado,

            // Clasificaciones para la interfaz
            'tipo' => [
                'es_reserva' => $this->esEstadoReserva(),
                'es_ruta' => $this->esEstadoRuta(),
                'es_vehiculo' => $this->esEstadoVehiculo(),
                'es_factura' => $this->esEstadoFactura(),
                'es_final' => $this->esEstadoFinal(),
                'es_inicial' => $this->esEstadoInicial(),
            ],

            // Contadores para estadísticas
            'uso_actual' => [
                'reservas' => $this->whenCounted('reservas'),
                'rutas_activadas' => $this->whenCounted('rutasActivadas'),
                'vehiculos' => $this->whenCounted('vehiculos'),
            ],

            // Para validaciones de transición en el frontend
            'transiciones_permitidas' => $this->when(
                $request->has('include_transiciones'),
                function () {
                    $transiciones = [
                        'RES_PEND' => ['RES_CONF', 'RES_CANC'],
                        'RES_CONF' => ['RES_EJEC', 'RES_CANC'],
                        'RES_EJEC' => ['RES_FIN'],
                        'RUT_PROG' => ['RUT_INIC', 'RUT_CANC'],
                        'RUT_INIC' => ['RUT_FIN'],
                        'VEH_DISP' => ['VEH_OCUP', 'VEH_MANT', 'VEH_INAR'],
                        'VEH_OCUP' => ['VEH_DISP', 'VEH_MANT'],
                        'VEH_MANT' => ['VEH_DISP', 'VEH_INAR']
                    ];

                    return $transiciones[$this->estado_codigo] ?? [];
                }
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
