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

            // Clasificaciones para filtros y lógica - ACTUALIZADO CON TOURS
            'caracteristicas' => [
                'es_reserva' => $this->esEstadoReserva(),
                'es_ruta_activada' => $this->esEstadoRutaActivada(),
                'es_tour_activado' => $this->esEstadoTourActivado(),
                'es_vehiculo' => $this->esEstadoVehiculo(),
                'es_factura' => $this->esEstadoFactura(),
            ],

            // Estadísticas de uso - ACTUALIZADO CON TOURS
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_reservas' => $this->whenCounted('reservas'),
                    'total_rutas_activadas' => $this->whenCounted('rutasActivadas'),
                    'total_tours_activados' => $this->whenCounted('toursActivados'),
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
                    'contextos_validos' => $this->contextos,
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
        if (str_starts_with($codigo, 'TOU_')) return 'Tours Activados';
        if (str_starts_with($codigo, 'VEH_')) return 'Vehículos';
        if (str_starts_with($codigo, 'FAC_')) return 'Facturas';

        // NUEVA LÓGICA: Detectar por nombre si no tiene prefijo específico
        $nombre = strtolower($this->estado_estado);

        if (in_array($nombre, ['pendiente', 'confirmada', 'cancelada', 'ejecutada', 'facturada'])) {
            return 'Reservas';
        }

        if (in_array($nombre, ['activada', 'llena', 'ejecución', 'cerrada'])) {
            return 'Rutas Activadas';
        }

        if (in_array($nombre, ['activado', 'en ejecución', 'cerrado'])) {
            return 'Tours Activados';
        }

        if (in_array($nombre, ['disponible', 'asignado', 'en mantenimiento', 'fuera de servicio'])) {
            return 'Vehículos';
        }

        if (in_array($nombre, ['pendiente', 'pagada', 'anulada'])) {
            return 'Facturas';
        }

        return 'General';
    }

    private function esEstadoReserva(): bool
    {
        if (str_starts_with($this->estado_codigo, 'RES_')) {
            return true;
        }

        // Detectar por nombre
        $nombre = strtolower($this->estado_estado);
        return in_array($nombre, ['pendiente', 'confirmada', 'cancelada', 'ejecutada', 'facturada']);
    }

    private function esEstadoRutaActivada(): bool
    {
        if (str_starts_with($this->estado_codigo, 'RUT_')) {
            return true;
        }

        // Detectar por nombre
        $nombre = strtolower($this->estado_estado);
        return in_array($nombre, ['activada', 'llena', 'ejecución', 'cerrada']);
    }

    private function esEstadoTourActivado(): bool
    {
        if (str_starts_with($this->estado_codigo, 'TOU_')) {
            return true;
        }

        // Detectar por nombre - NUEVA FUNCIONALIDAD
        $nombre = strtolower($this->estado_estado);
        return in_array($nombre, ['activado', 'en ejecución', 'cerrado']);
    }

    private function esEstadoVehiculo(): bool
    {
        if (str_starts_with($this->estado_codigo, 'VEH_')) {
            return true;
        }

        // Detectar por nombre
        $nombre = strtolower($this->estado_estado);
        return in_array($nombre, ['disponible', 'asignado', 'en mantenimiento', 'fuera de servicio']);
    }

    private function esEstadoFactura(): bool
    {
        if (str_starts_with($this->estado_codigo, 'FAC_')) {
            return true;
        }

        // Detectar por nombre
        $nombre = strtolower($this->estado_estado);
        return in_array($nombre, ['pendiente', 'pagada', 'anulada']);
    }

    private function esCriticoDelSistema(): bool
    {
        $estadosCriticos = [
            'RES_PEND',
            'RES_CONF',
            'RUT_PROG',
            'RUT_ACTV',
            'TOU_ACTV',
            'TOU_EJEC',  // NUEVOS ESTADOS CRÍTICOS PARA TOURS
            'VEH_DISP',
            'VEH_ASIG'
        ];

        // También verificar por nombre del estado
        $nombresCriticos = [
            'pendiente',
            'confirmada',
            'activada',
            'ejecución',
            'activado',
            'en ejecución',  // NUEVOS NOMBRES CRÍTICOS PARA TOURS
            'disponible',
            'asignado'
        ];

        return in_array($this->estado_codigo, $estadosCriticos) ||
            in_array(strtolower($this->estado_estado), $nombresCriticos);
    }

    private function getEstadosRelacionados(): array
    {
        $categoria = $this->getCategoria();

        // Primero intentar por prefijo de código
        $prefijo = substr($this->estado_codigo, 0, 4);

        $relacionados = Estado::where('estado_codigo', 'like', $prefijo . '%')
            ->where('estado_id', '!=', $this->estado_id)
            ->activo()
            ->get(['estado_id', 'estado_codigo', 'estado_estado']);

        // Si no encuentra por prefijo, buscar por categoría determinada por nombre
        if ($relacionados->isEmpty()) {
            $estadosDeCategoria = [];

            switch ($categoria) {
                case 'Reservas':
                    $estadosDeCategoria = ['pendiente', 'confirmada', 'cancelada', 'ejecutada', 'facturada'];
                    break;
                case 'Rutas Activadas':
                    $estadosDeCategoria = ['activada', 'llena', 'ejecución', 'cerrada'];
                    break;
                case 'Tours Activados':
                    $estadosDeCategoria = ['activado', 'en ejecución', 'cerrado'];
                    break;
                case 'Vehículos':
                    $estadosDeCategoria = ['disponible', 'asignado', 'en mantenimiento', 'fuera de servicio'];
                    break;
                case 'Facturas':
                    $estadosDeCategoria = ['pendiente', 'pagada', 'anulada'];
                    break;
            }

            if (!empty($estadosDeCategoria)) {
                $relacionados = Estado::whereIn('estado_estado', $estadosDeCategoria)
                    ->where('estado_id', '!=', $this->estado_id)
                    ->activo()
                    ->get(['estado_id', 'estado_codigo', 'estado_estado']);
            }
        }

        return $relacionados->toArray();
    }
}
