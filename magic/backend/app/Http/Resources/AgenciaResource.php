<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgenciaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_agencias,
            'nombre' => $this->agencias_nombre,
            'es_magic_travel' => $this->esMagicTravel(),
            'iniciales' => $this->generarIniciales(),

            // Conteos de relaciones (si están cargadas)
            'empleados_count' => $this->when($this->relationLoaded('empleados'), $this->empleados->count()),
            'rutas_count' => $this->when($this->relationLoaded('rutas'), $this->rutas->count()),
            'tours_count' => $this->when($this->relationLoaded('tours'), $this->tours->count()),
            'vehiculos_count' => $this->when($this->relationLoaded('vehiculos'), $this->vehiculos->count()),
            'reservas_transferidas_count' => $this->when($this->relationLoaded('reservasTransferidas'), $this->reservasTransferidas->count()),

            // Empleados (si están cargados)
            'empleados' => $this->when($this->relationLoaded('empleados'), function () {
                return $this->empleados->map(function ($empleado) {
                    return [
                        'id' => $empleado->id_empleados,
                        'nombre_completo' => $empleado->empleados_nombres . ' ' . $empleado->empleados_apellidos,
                        'cargo' => $empleado->cargo->cargo_nombre ?? 'Sin cargo',
                        'dpi' => $empleado->empleados_dpi,
                    ];
                });
            }),

            // Rutas (si están cargadas)
            'rutas' => $this->when($this->relationLoaded('rutas'), function () {
                return $this->rutas->map(function ($ruta) {
                    return [
                        'id' => $ruta->id_rutas,
                        'origen' => $ruta->rutas_origen,
                        'destino' => $ruta->rutas_destino,
                        'descripcion' => $ruta->rutas_origen . ' → ' . $ruta->rutas_destino,
                    ];
                });
            }),

            // Tours (si están cargados)
            'tours' => $this->when($this->relationLoaded('tours'), function () {
                return $this->tours->map(function ($tour) {
                    return [
                        'id' => $tour->id_tour,
                        'nombre' => $tour->tours_nombre,
                    ];
                });
            }),

            // Vehículos (si están cargados)
            'vehiculos' => $this->when($this->relationLoaded('vehiculos'), function () {
                return $this->vehiculos->map(function ($vehiculo) {
                    return [
                        'id' => $vehiculo->id_vehiculo,
                        'marca' => $vehiculo->vehiculo_marca,
                        'placa' => $vehiculo->vehiculo_placa,
                        'capacidad' => $vehiculo->vehiculo_capacidad,
                        'pago_conductor' => $vehiculo->vehiculo_pago_conductor,
                    ];
                });
            }),

            // Estadísticas básicas
            'estadisticas' => $this->when($this->relationLoaded('empleados') || $this->relationLoaded('rutas'), function () {
                return $this->estadisticas();
            }),

            // Metadatos del sistema
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'eliminado_en' => $this->deleted_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],

            // Propiedades computadas
            'computed' => [
                'puede_recibir_transferencias' => $this->puedeRecibirTransferencias(),
                'tiene_empleados' => $this->relationLoaded('empleados') && $this->empleados->count() > 0,
                'tiene_rutas' => $this->relationLoaded('rutas') && $this->rutas->count() > 0,
                'tiene_tours' => $this->relationLoaded('tours') && $this->tours->count() > 0,
                'tiene_vehiculos' => $this->relationLoaded('vehiculos') && $this->vehiculos->count() > 0,
            ],
        ];
    }

    /**
     * Generar iniciales de la agencia
     */
    private function generarIniciales(): string
    {
        if (empty($this->agencias_nombre)) {
            return '';
        }

        $palabras = explode(' ', trim($this->agencias_nombre));
        $iniciales = '';

        foreach ($palabras as $palabra) {
            if (strlen($palabra) > 0) {
                $iniciales .= strtoupper(substr($palabra, 0, 1));
            }
            if (strlen($iniciales) >= 3) break;
        }

        return $iniciales ?: substr(strtoupper($this->agencias_nombre), 0, 3);
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'links' => [
                'self' => "/api/agencias/{$this->id_agencias}",
                'empleados' => "/api/agencias/{$this->id_agencias}/empleados",
                'rutas' => "/api/agencias/{$this->id_agencias}/rutas",
                'estadisticas' => "/api/agencias/{$this->id_agencias}/estadisticas",
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Agencia');
        $response->header('X-Magic-Travel', $this->esMagicTravel() ? 'true' : 'false');
    }
}
