<?php

namespace App\Services;

use App\Models\RutaActiva;
use App\Models\Estado;
use App\Services\CapacidadService;

class EstadoRutaService
{
    protected CapacidadService $capacidadService;

    public function __construct(CapacidadService $capacidadService)
    {
        $this->capacidadService = $capacidadService;
    }

    /**
     * Actualizar estado de ruta según ocupación
     */
    public function actualizarEstadoSegunOcupacion(int $rutaActivaId): array
    {
        $rutaActiva = RutaActiva::findOrFail($rutaActivaId);
        $disponibilidad = $this->capacidadService->verificarDisponibilidad($rutaActivaId, 1);

        $estadoActual = $rutaActiva->estado->estado_nombre;
        $nuevoEstado = $this->determinarNuevoEstado($disponibilidad, $estadoActual);

        if ($nuevoEstado !== $estadoActual) {
            $this->cambiarEstadoRuta($rutaActiva, $nuevoEstado);
        }

        return [
            'ruta_activa_id' => $rutaActivaId,
            'estado_anterior' => $estadoActual,
            'estado_actual' => $nuevoEstado,
            'cambio_realizado' => $nuevoEstado !== $estadoActual,
            'disponibilidad' => $disponibilidad
        ];
    }

    /**
     * Determinar nuevo estado según ocupación
     */
    private function determinarNuevoEstado(array $disponibilidad, string $estadoActual): string
    {
        $porcentaje = $disponibilidad['porcentaje_ocupacion'];
        $espaciosDisponibles = $disponibilidad['espacios_disponibles'];

        // Si está completo (0 espacios disponibles)
        if ($espaciosDisponibles <= 0) {
            return 'Llena';
        }

        // Si está casi lleno (80% o más de ocupación)
        if ($porcentaje >= 80) {
            return 'Activada'; // Sigue activada pero casi llena
        }

        // Si tiene ocupación normal
        if ($porcentaje > 0) {
            return 'Activada';
        }

        // Si está vacía
        return 'Activada';
    }

    /**
     * Cambiar estado de una ruta
     */
    private function cambiarEstadoRuta(RutaActiva $rutaActiva, string $nombreEstado): void
    {
        $estado = Estado::where('estado_nombre', 'like', "%{$nombreEstado}%")->first();

        if ($estado) {
            $rutaActiva->update(['estado_id' => $estado->estado_id]);

            \Log::info('Estado de ruta actualizado automáticamente', [
                'ruta_activa_id' => $rutaActiva->id_ruta_activa,
                'estado_anterior' => $rutaActiva->getOriginal('estado_id'),
                'estado_nuevo' => $estado->estado_id,
                'nombre_estado' => $nombreEstado
            ]);
        }
    }

    /**
     * Verificar si una ruta puede recibir reservas
     */
    public function puedeRecibirReservas(int $rutaActivaId): bool
    {
        $rutaActiva = RutaActiva::with('estado')->findOrFail($rutaActivaId);
        $estadoNombre = strtolower($rutaActiva->estado->estado_nombre);

        // Estados que permiten nuevas reservas
        $estadosPermitidos = ['activada', 'activa'];

        foreach ($estadosPermitidos as $estado) {
            if (str_contains($estadoNombre, $estado)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Obtener rutas que necesitan actualización de estado
     */
    public function obtenerRutasParaActualizar(): array
    {
        $rutas = RutaActiva::with(['estado', 'vehiculo'])
            ->whereHas('estado', function ($query) {
                $query->where('estado_nombre', 'like', '%activada%')
                    ->orWhere('estado_nombre', 'like', '%activa%');
            })
            ->whereDate('ruta_activa_fecha', '>=', today())
            ->get();

        $rutasParaActualizar = [];

        foreach ($rutas as $ruta) {
            $disponibilidad = $this->capacidadService->verificarDisponibilidad($ruta->id_ruta_activa, 1);
            $estadoSugerido = $this->determinarNuevoEstado($disponibilidad, $ruta->estado->estado_nombre);

            if ($estadoSugerido !== $ruta->estado->estado_nombre) {
                $rutasParaActualizar[] = [
                    'ruta_activa_id' => $ruta->id_ruta_activa,
                    'estado_actual' => $ruta->estado->estado_nombre,
                    'estado_sugerido' => $estadoSugerido,
                    'ocupacion' => $disponibilidad['porcentaje_ocupacion'],
                    'espacios_disponibles' => $disponibilidad['espacios_disponibles']
                ];
            }
        }

        return $rutasParaActualizar;
    }

    /**
     * Actualizar estados masivamente
     */
    public function actualizarEstadosMasivo(): array
    {
        $rutasParaActualizar = $this->obtenerRutasParaActualizar();
        $resultados = [];

        foreach ($rutasParaActualizar as $rutaInfo) {
            $resultado = $this->actualizarEstadoSegunOcupacion($rutaInfo['ruta_activa_id']);
            $resultados[] = $resultado;
        }

        return [
            'rutas_procesadas' => count($resultados),
            'cambios_realizados' => collect($resultados)->where('cambio_realizado', true)->count(),
            'detalles' => $resultados
        ];
    }
}
