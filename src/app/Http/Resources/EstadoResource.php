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
            'activo' => $this->estado_situacion,

            // Información combinada para la interfaz
            'descripcion_completa' => [
                'completa' => $this->nombre_completo,
                'categoria' => $this->getCategoria(),
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_reserva' => $this->esEstadoReserva(),
                'es_ruta_activada' => $this->esEstadoRutaActivada(),
                'es_vehiculo' => $this->esEstadoVehiculo(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_reservas' => $this->whenCounted('reservas'),
                    'total_rutas_activadas' => $this->whenCounted('rutasActivadas'),
                    'total_vehiculos' => $this->whenCounted('vehiculos'),
                    'en_uso' => $this->tieneRegistrosAsociados(),
                ]
            ),

            // Estados relacionados para planificación
            'estados_relacionados' => $this->when(
                $request->has('include_relacionados'),
                function () {
                    return $this->getEstadosRelacionados();
                }
            ),

            // Información para filtros y planificación
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'puede_eliminar' => !$this->tieneRegistrosAsociados(),
                    'es_critico' => $this->esCriticoDelSistema(),
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function getCategoria(): string
    {
        $codigo = $this->estado_codigo;

        if (str_starts_with($codigo, 'RES_')) return 'Reservas';
        if (str_starts_with($codigo, 'RUT_')) return 'Rutas Activadas';
        if (str_starts_with($codigo, 'VEH_')) return 'Vehículos';
        if (str_starts_with($codigo, 'FAC_')) return 'Facturas';

        return 'General';
    }

    private function esEstadoReserva(): bool
    {
        return str_starts_with($this->estado_codigo, 'RES_');
    }

    private function esEstadoRutaActivada(): bool
    {
        return str_starts_with($this->estado_codigo, 'RUT_');
    }

    private function esEstadoVehiculo(): bool
    {
        return str_starts_with($this->estado_codigo, 'VEH_');
    }

    private function esCriticoDelSistema(): bool
    {
        $estadosCriticos = ['RES_PEND', 'RES_CONF', 'RUT_PROG', 'VEH_DISP'];
        return in_array($this->estado_codigo, $estadosCriticos);
    }

    private function getEstadosRelacionados(): array
    {
        $categoria = $this->getCategoria();

        return Estado::where('estado_codigo', 'like', substr($this->estado_codigo, 0, 4) . '%')
            ->where('estado_id', '!=', $this->estado_id)
            ->activo()
            ->get(['estado_id', 'estado_codigo', 'estado_estado'])
            ->toArray();
    }
}
