<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RutaActivadaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ruta_activada_id,
            'codigo' => $this->ruta_activada_codigo,
            'fecha' => $this->ruta_activada_fecha?->toDateString(),
            'hora' => $this->ruta_activada_hora?->format('H:i'),
            'fecha_completa' => $this->fecha_completa,
            'activo' => $this->es_activo,

            // Información de ocupación crítica para operaciones
            'ocupacion' => [
                'actual' => $this->ocupacion_actual,
                'porcentaje' => $this->porcentaje_ocupacion,
                'espacios_disponibles' => $this->espacios_disponibles,
                'esta_llena' => $this->estaLlena(),
                'casi_llena' => $this->estaCasiLlena(),
                'puede_acomodar' => function ($pasajeros) {
                    return $this->puedeAcomodar($pasajeros);
                },
            ],

            // Estados de la ruta para workflow
            'estados' => [
                'programada' => $this->estaProgramada(),
                'iniciada' => $this->estaIniciada(),
                'finalizada' => $this->estaFinalizada(),
                'cancelada' => $this->estaCancelada(),
            ],

            // Estado actual detallado
            'estado_actual' => EstadoResource::make(
                $this->whenLoaded('estado')
            ),

            // Información del servicio
            'servicio' => ServicioResource::make(
                $this->whenLoaded('servicio')
            ),

            // Información de la ruta base
            'ruta' => RutaResource::make(
                $this->whenLoaded('ruta')
            ),

            // Vehículo asignado con información de capacidad
            'vehiculo' => VehiculoResource::make(
                $this->whenLoaded('vehiculo')
            ),

            // Chofer asignado
            'chofer' => $this->when(
                $this->whenLoaded('usuario'),
                [
                    'id' => $this->usuario->usuario_id,
                    'codigo' => $this->usuario->usuario_codigo,
                    'nombre_completo' => $this->usuario->nombre_completo,
                    'es_chofer' => $this->usuario->esChofer(),
                    'telefono' => $this->usuario->persona?->telefono_formateado,
                ]
            ),

            // Reservas asociadas para gestión operativa
            'reservas' => ReservaResource::collection(
                $this->whenLoaded('reservasActivas')
            ),

            // Contadores rápidos
            'contadores' => [
                'total_reservas' => $this->whenCounted('reservas'),
                'total_pasajeros' => $this->getTotalPasajeros(),
                'ingreso_total' => (float) $this->getIngresoTotal(),
            ],

            // Información temporal para alertas
            'temporal' => [
                'es_del_dia' => $this->esDelDia(),
                'ya_comenzo' => $this->yaComenzo(),
                'minutos_restantes' => $this->faltanMinutos(),
            ],

            // Resumen operativo completo para choferes y operadores
            'resumen_operativo' => $this->when(
                $request->has('include_operativo') || $request->user()?->puedeOperar(),
                $this->resumenOperativo()
            ),

            // Operaciones disponibles según estado
            'operaciones_disponibles' => [
                'puede_iniciar' => $this->estaProgramada(),
                'puede_finalizar' => $this->estaIniciada(),
                'puede_cancelar' => $this->estaProgramada() || $this->estaIniciada(),
                'puede_agregar_reservas' => !$this->estaLlena() && !$this->estaFinalizada(),
            ],

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
