<?php

namespace App\Services;

use App\Models\RutaActiva;
use App\Models\Reserva;
use App\Models\Vehiculo;
use InvalidArgumentException;

class CapacidadService
{
    /**
     * Verificar disponibilidad de una ruta activa
     * Reemplaza: fn_verificar_disponibilidad_ruta de la migración 12
     */
    public function verificarDisponibilidad(int $rutaActivaId, int $pasajeros): array
    {
        if ($pasajeros <= 0) {
            throw new InvalidArgumentException('La cantidad de pasajeros debe ser mayor a 0');
        }

        $rutaActiva = RutaActiva::with('vehiculo')->findOrFail($rutaActivaId);
        $capacidadTotal = $rutaActiva->vehiculo->vehiculo_capacidad ?? 0;

        if ($capacidadTotal <= 0) {
            return [
                'capacidad_total' => 0,
                'ocupacion_actual' => 0,
                'espacios_disponibles' => 0,
                'puede_acomodar' => false,
                'porcentaje_ocupacion' => 0,
                'estado' => 'SIN_VEHICULO',
                'mensaje' => 'Ruta sin vehículo asignado o vehículo sin capacidad definida'
            ];
        }

        $ocupacionActual = $this->calcularOcupacionActual($rutaActivaId);
        $espaciosDisponibles = $capacidadTotal - $ocupacionActual;
        $porcentajeOcupacion = round(($ocupacionActual / $capacidadTotal) * 100, 1);

        $puedeAcomodar = $espaciosDisponibles >= $pasajeros;
        $estado = $this->determinarEstadoDisponibilidad($porcentajeOcupacion, $puedeAcomodar);

        return [
            'capacidad_total' => $capacidadTotal,
            'ocupacion_actual' => $ocupacionActual,
            'espacios_disponibles' => $espaciosDisponibles,
            'puede_acomodar' => $puedeAcomodar,
            'porcentaje_ocupacion' => $porcentajeOcupacion,
            'estado' => $estado,
            'mensaje' => $this->generarMensajeDisponibilidad($estado, $espaciosDisponibles, $pasajeros)
        ];
    }

    /**
     * Validar que una reserva no exceda la capacidad
     */
    public function validarCapacidad(int $rutaActivaId, int $adultos, int $ninos = 0, ?int $reservaIdExcluir = null): bool
    {
        $totalPasajeros = $adultos + $ninos;
        $disponibilidad = $this->verificarDisponibilidad($rutaActivaId, $totalPasajeros);

        // Si estamos editando una reserva existente, consideramos su espacio actual
        if ($reservaIdExcluir) {
            $reservaExistente = Reserva::findOrFail($reservaIdExcluir);
            $pasajerosExistentes = $reservaExistente->reservas_cantidad_adultos + ($reservaExistente->reservas_cantidad_ninos ?? 0);
            $disponibilidad['espacios_disponibles'] += $pasajerosExistentes;
        }

        return $disponibilidad['espacios_disponibles'] >= $totalPasajeros;
    }

    /**
     * Obtener ocupación detallada de una ruta
     */
    public function obtenerOcupacionDetallada(int $rutaActivaId): array
    {
        $rutaActiva = RutaActiva::with(['vehiculo', 'ruta'])->findOrFail($rutaActivaId);

        $reservas = Reserva::where('id_ruta_activa', $rutaActivaId)
            ->whereNull('deleted_at')
            ->with('estado')
            ->get();

        $resumenReservas = [
            'total_reservas' => $reservas->count(),
            'reservas_confirmadas' => $reservas->where('estado.estado_nombre', 'Confirmada')->count(),
            'reservas_pendientes' => $reservas->where('estado.estado_nombre', 'Pendiente')->count(),
            'reservas_pagadas' => $reservas->where('estado.estado_nombre', 'Pagada')->count(),
        ];

        $ocupacionPorEstado = [];
        foreach ($reservas->groupBy('estado.estado_nombre') as $estado => $reservasEstado) {
            $ocupacionPorEstado[$estado] = $reservasEstado->sum(function ($reserva) {
                return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
            });
        }

        $disponibilidad = $this->verificarDisponibilidad($rutaActivaId, 1);

        return [
            'ruta_info' => [
                'id' => $rutaActiva->id_ruta_activa,
                'fecha' => $rutaActiva->ruta_activa_fecha,
                'origen' => $rutaActiva->ruta->rutas_origen ?? 'N/A',
                'destino' => $rutaActiva->ruta->rutas_destino ?? 'N/A',
                'vehiculo_placa' => $rutaActiva->vehiculo->vehiculo_placa ?? 'N/A'
            ],
            'capacidad' => $disponibilidad,
            'reservas' => $resumenReservas,
            'ocupacion_por_estado' => $ocupacionPorEstado
        ];
    }

    /**
     * Calcular ocupación actual de una ruta
     */
    private function calcularOcupacionActual(int $rutaActivaId): int
    {
        return Reserva::where('id_ruta_activa', $rutaActivaId)
            ->whereNull('deleted_at')
            ->sum(\DB::raw('reservas_cantidad_adultos + IFNULL(reservas_cantidad_ninos, 0)'));
    }

    /**
     * Determinar estado de disponibilidad
     */
    private function determinarEstadoDisponibilidad(float $porcentaje, bool $puedeAcomodar): string
    {
        if (!$puedeAcomodar) {
            return 'COMPLETO';
        }

        if ($porcentaje >= 80) {
            return 'CASI_LLENO';
        }

        if ($porcentaje > 0) {
            return 'DISPONIBLE';
        }

        return 'VACIO';
    }

    /**
     * Generar mensaje descriptivo de disponibilidad
     */
    private function generarMensajeDisponibilidad(string $estado, int $espacios, int $solicitados): string
    {
        switch ($estado) {
            case 'COMPLETO':
                return "Vehículo completo. Espacios disponibles: {$espacios}, solicitados: {$solicitados}";
            case 'CASI_LLENO':
                return "Vehículo casi lleno. Espacios disponibles: {$espacios}";
            case 'DISPONIBLE':
                return "Espacios disponibles: {$espacios}";
            case 'VACIO':
                return "Vehículo vacío. Capacidad completa disponible.";
            case 'SIN_VEHICULO':
                return "No se puede verificar capacidad: vehículo no definido";
            default:
                return "Estado de capacidad desconocido";
        }
    }
}
