<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->usuario_id,
            'codigo' => $this->usuario_codigo,
            'activo' => $this->es_activo,
            'nombre_completo' => $this->nombre_completo,

            // Información de la persona asociada
            'persona' => PersonaResource::make(
                $this->whenLoaded('persona')
            ),

            // Rol y permisos
            'rol' => RolResource::make(
                $this->whenLoaded('rol')
            ),

            // Permisos específicos para la interfaz
            'permisos' => [
                'es_administrador' => $this->esAdministrador(),
                'es_gerente' => $this->esGerente(),
                'puede_vender' => $this->puedeVender(),
                'puede_operar' => $this->puedeOperar(),
                'acceso_completo' => $this->tieneAccesoCompleto(),
                'es_chofer' => $this->esChofer(),
                'es_vendedor' => $this->esVendedor(),
            ],

            // Recursos específicos que puede gestionar
            'accesos' => [
                'usuarios' => $this->tienePermiso('usuarios'),
                'roles' => $this->tienePermiso('roles'),
                'configuracion' => $this->tienePermiso('configuracion'),
                'reportes' => $this->tienePermiso('reportes'),
                'auditoria' => $this->tienePermiso('auditoria'),
                'vehiculos' => $this->tienePermiso('vehiculos'),
                'rutas' => $this->tienePermiso('rutas'),
                'servicios' => $this->tienePermiso('servicios'),
                'reservas' => $this->tienePermiso('reservas'),
                'facturas' => $this->tienePermiso('facturas'),
            ],

            // Estado y validaciones
            'estado' => [
                'esta_activo' => $this->estaActivo(),
                'datos_completos' => $this->datosCompletos(),
                'ultima_actividad' => $this->ultimaActividad()?->toISOString(),
            ],

            // Estadísticas de rendimiento (solo para gerencia)
            'rendimiento' => $this->when(
                $request->user()?->esGerente() || $request->user()->usuario_id === $this->usuario_id,
                [
                    'ventas_mes_actual' => $this->getVentasDelMes(),
                    'ingresos_generados' => $this->getIngresosGenerados(),
                ]
            ),

            // Información específica para choferes
            'chofer_info' => $this->when(
                $this->esChofer(),
                [
                    'rutas_asignadas' => $this->getRutasAsignadas()->count(),
                    'tiene_ruta_activa' => $this->tieneRutaActiva(),
                    'rutas_actuales' => RutaActivadaResource::collection(
                        $this->whenLoaded('rutasActivadas', $this->getRutasAsignadas())
                    ),
                ]
            ),

            // Estadísticas de creaciones (reservas, rutas, facturas)
            'estadisticas_creacion' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_reservas_creadas' => $this->whenCounted('reservasCreadas'),
                    'total_rutas_activadas' => $this->whenCounted('rutasActivadas'),
                    'total_facturas_emitidas' => $this->whenCounted('facturasEmitidas'),
                ]
            ),

            // Información completa para perfiles
            'informacion_completa' => $this->when(
                $request->has('perfil_completo'),
                $this->informacionCompleta()
            ),

            // Timestamps (sin mostrar campos de auditoría sensibles)
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
