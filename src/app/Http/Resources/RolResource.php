<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->rol_id,
            'codigo' => $this->rol_codigo,
            'nombre' => $this->rol_rol,
            'descripcion' => $this->rol_descripcion,
            'activo' => $this->es_activo,
            'nivel_acceso' => $this->nivel_acceso,

            // Contadores para dashboard
            'total_usuarios' => $this->whenCounted('usuarios'),

            // Permisos detallados para la interfaz
            'permisos' => [
                'es_administrador' => $this->esAdministrador(),
                'es_gerente' => $this->esGerente(),
                'puede_vender' => $this->puedeVender(),
                'puede_operar' => $this->puedeOperar(),
                'acceso_completo' => $this->tieneAccesoCompleto(),
            ],

            // Recursos que puede gestionar (para menús dinámicos)
            'recursos_permitidos' => [
                'usuarios' => $this->puedeGestionar('usuarios'),
                'roles' => $this->puedeGestionar('roles'),
                'configuracion' => $this->puedeGestionar('configuracion'),
                'reportes' => $this->puedeGestionar('reportes'),
                'auditoria' => $this->puedeGestionar('auditoria'),
                'vehiculos' => $this->puedeGestionar('vehiculos'),
                'rutas' => $this->puedeGestionar('rutas'),
                'servicios' => $this->puedeGestionar('servicios'),
                'reservas' => $this->puedeGestionar('reservas'),
                'facturas' => $this->puedeGestionar('facturas'),
            ],

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
