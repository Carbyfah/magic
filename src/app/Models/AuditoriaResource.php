<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditoriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->auditoria_id,
            'tabla' => $this->tabla,
            'registro_id' => $this->registro_id,
            'accion' => $this->accion,

            // Información del usuario
            'usuario' => [
                'id' => $this->usuario_modificacion,
                'nombre' => $this->usuario_nombre ?? 'Usuario eliminado',
                'codigo' => $this->usuario_codigo ?? 'N/A'
            ],

            // Información temporal
            'fecha_modificacion' => $this->fecha_modificacion,
            'fecha_formateada' => \Carbon\Carbon::parse($this->fecha_modificacion)->format('d/m/Y H:i:s'),
            'hace' => \Carbon\Carbon::parse($this->fecha_modificacion)->diffForHumans(),

            // Información técnica
            'ip_modificacion' => $this->ip_modificacion,

            // Datos de cambio (cuando estén disponibles)
            'datos_anteriores' => $this->datos_anteriores ?? null,
            'datos_nuevos' => $this->datos_nuevos ?? null,
            'campos_modificados' => $this->campos_modificados ?? [],

            // Metadata
            'tabla_legible' => $this->getNombreTablaLegible(),
            'accion_legible' => $this->getNombreAccionLegible(),
            'gravedad' => $this->getGravedadEvento(),
        ];
    }

    /**
     * Convierte código de tabla a nombre legible
     */
    private function getNombreTablaLegible()
    {
        $nombres = [
            'reserva' => 'Reservas',
            'agencia' => 'Agencias',
            'usuario' => 'Usuarios',
            'persona' => 'Personas',
            'vehiculo' => 'Vehículos',
            'servicio' => 'Servicios',
            'ruta_activada' => 'Rutas Activadas',
            'facturas' => 'Facturas',
            'rol' => 'Roles',
            'estado' => 'Estados',
            'ruta' => 'Rutas',
            'tipo_persona' => 'Tipos de Persona',
            'contactos_agencia' => 'Contactos de Agencia'
        ];

        return $nombres[$this->tabla] ?? ucfirst($this->tabla);
    }

    /**
     * Convierte código de acción a texto legible
     */
    private function getNombreAccionLegible()
    {
        $acciones = [
            'INSERT' => 'Creación',
            'UPDATE' => 'Modificación',
            'DELETE' => 'Eliminación'
        ];

        return $acciones[$this->accion] ?? $this->accion;
    }

    /**
     * Determina la gravedad del evento para alertas
     */
    private function getGravedadEvento()
    {
        // Eventos críticos
        if (in_array($this->tabla, ['usuario', 'rol']) && $this->accion === 'DELETE') {
            return 'critica';
        }

        if ($this->tabla === 'reserva' && $this->accion === 'DELETE') {
            return 'alta';
        }

        if (in_array($this->tabla, ['servicio', 'vehiculo']) && $this->accion === 'UPDATE') {
            return 'media';
        }

        return 'baja';
    }
}
