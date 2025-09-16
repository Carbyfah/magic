<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UsuarioPermiso;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PermisosController extends Controller
{
    /**
     * Listar todos los usuarios con sus permisos
     * GET /api/permisos/usuarios
     */
    public function listarUsuarios(): JsonResponse
    {
        $usuarios = User::with(['empleado.agencia', 'empleado.cargo', 'permisos'])
            ->whereNull('deleted_at')
            ->get()
            ->map(function ($usuario) {
                return [
                    'id' => $usuario->id_usuarios,
                    'nombre' => $usuario->name,
                    'email' => $usuario->usuarios_correo,
                    'empleado' => $usuario->empleado ? [
                        'agencia' => $usuario->empleado->agencia->agencias_nombre ?? 'N/A',
                        'cargo' => $usuario->empleado->cargo->cargo_nombre ?? 'N/A'
                    ] : null,
                    'permisos_configurados' => $usuario->permisos->count() > 0,
                    'total_permisos' => $usuario->permisos->count()
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'usuarios' => $usuarios,
                'modulos_disponibles' => UsuarioPermiso::$modulosDisponibles
            ]
        ]);
    }

    /**
     * Obtener permisos específicos de un usuario
     * GET /api/permisos/usuario/{id}
     */
    public function obtenerPermisosUsuario($id): JsonResponse
    {
        $usuario = User::with(['empleado.agencia', 'empleado.cargo', 'permisos'])
            ->findOrFail($id);

        $permisos = $usuario->obtenerPermisos();

        // Asegurar que todos los módulos estén presentes
        $permisosCompletos = collect(UsuarioPermiso::$modulosDisponibles)->mapWithKeys(function ($nombre, $modulo) use ($permisos) {
            return [$modulo => [
                'nombre_modulo' => $nombre,
                'ver' => $permisos[$modulo]['ver'] ?? false,
                'crear' => $permisos[$modulo]['crear'] ?? false,
                'editar' => $permisos[$modulo]['editar'] ?? false,
                'eliminar' => $permisos[$modulo]['eliminar'] ?? false
            ]];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => [
                    'id' => $usuario->id_usuarios,
                    'nombre' => $usuario->name,
                    'email' => $usuario->usuarios_correo,
                    'empleado' => $usuario->empleado ? [
                        'agencia' => $usuario->empleado->agencia->agencias_nombre ?? 'N/A',
                        'cargo' => $usuario->empleado->cargo->cargo_nombre ?? 'N/A'
                    ] : null
                ],
                'permisos' => $permisosCompletos
            ]
        ]);
    }

    /**
     * Actualizar permisos de un usuario
     * PUT /api/permisos/usuario/{id}
     */
    public function actualizarPermisosUsuario(Request $request, $id): JsonResponse
    {
        $request->validate([
            'permisos' => 'required|array',
            'permisos.*.ver' => 'boolean',
            'permisos.*.crear' => 'boolean',
            'permisos.*.editar' => 'boolean',
            'permisos.*.eliminar' => 'boolean'
        ]);

        $usuario = User::findOrFail($id);
        $usuarioAuth = $request->user();

        try {
            DB::beginTransaction();

            // Eliminar permisos existentes
            $usuario->permisos()->delete();

            // Crear nuevos permisos
            foreach ($request->permisos as $modulo => $acciones) {
                // Solo crear registro si al menos una acción está habilitada
                if ($acciones['ver'] || $acciones['crear'] || $acciones['editar'] || $acciones['eliminar']) {
                    UsuarioPermiso::create([
                        'id_usuarios' => $usuario->id_usuarios,
                        'modulo' => $modulo,
                        'puede_ver' => $acciones['ver'] ?? false,
                        'puede_crear' => $acciones['crear'] ?? false,
                        'puede_editar' => $acciones['editar'] ?? false,
                        'puede_eliminar' => $acciones['eliminar'] ?? false,
                        'created_by' => $usuarioAuth->id_usuarios
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Permisos actualizados correctamente',
                'data' => [
                    'usuario_id' => $usuario->id_usuarios,
                    'permisos_configurados' => $usuario->permisos()->count()
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar permisos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Copiar permisos de un usuario a otro
     * POST /api/permisos/copiar
     */
    public function copiarPermisos(Request $request): JsonResponse
    {
        $request->validate([
            'usuario_origen_id' => 'required|exists:usuarios,id_usuarios',
            'usuario_destino_id' => 'required|exists:usuarios,id_usuarios|different:usuario_origen_id'
        ]);

        $usuarioOrigen = User::with('permisos')->findOrFail($request->usuario_origen_id);
        $usuarioDestino = User::findOrFail($request->usuario_destino_id);
        $usuarioAuth = $request->user();

        try {
            DB::beginTransaction();

            // Eliminar permisos del usuario destino
            $usuarioDestino->permisos()->delete();

            // Copiar permisos del usuario origen
            foreach ($usuarioOrigen->permisos as $permiso) {
                UsuarioPermiso::create([
                    'id_usuarios' => $usuarioDestino->id_usuarios,
                    'modulo' => $permiso->modulo,
                    'puede_ver' => $permiso->puede_ver,
                    'puede_crear' => $permiso->puede_crear,
                    'puede_editar' => $permiso->puede_editar,
                    'puede_eliminar' => $permiso->puede_eliminar,
                    'created_by' => $usuarioAuth->id_usuarios
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Permisos copiados correctamente',
                'data' => [
                    'permisos_copiados' => $usuarioOrigen->permisos->count()
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al copiar permisos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar si el usuario autenticado tiene permiso
     * GET /api/permisos/verificar/{modulo}/{accion}
     */
    public function verificarPermiso(Request $request, $modulo, $accion): JsonResponse
    {
        $usuario = $request->user();
        $tienePermiso = $usuario->tienePermiso($modulo, $accion);

        return response()->json([
            'success' => true,
            'data' => [
                'usuario_id' => $usuario->id_usuarios,
                'modulo' => $modulo,
                'accion' => $accion,
                'tiene_permiso' => $tienePermiso
            ]
        ]);
    }

    /**
     * Obtener resumen de permisos del sistema
     * GET /api/permisos/resumen
     */
    public function resumenPermisos(): JsonResponse
    {
        $totalUsuarios = User::count();
        $usuariosConPermisos = User::whereHas('permisos')->count();
        $usuariosSinPermisos = $totalUsuarios - $usuariosConPermisos;

        $permisosPorModulo = UsuarioPermiso::select('modulo')
            ->selectRaw('COUNT(*) as total_usuarios')
            ->selectRaw('SUM(puede_ver) as pueden_ver')
            ->selectRaw('SUM(puede_crear) as pueden_crear')
            ->selectRaw('SUM(puede_editar) as pueden_editar')
            ->selectRaw('SUM(puede_eliminar) as pueden_eliminar')
            ->groupBy('modulo')
            ->get()
            ->keyBy('modulo');

        return response()->json([
            'success' => true,
            'data' => [
                'total_usuarios' => $totalUsuarios,
                'usuarios_con_permisos' => $usuariosConPermisos,
                'usuarios_sin_permisos' => $usuariosSinPermisos,
                'permisos_por_modulo' => $permisosPorModulo,
                'modulos_disponibles' => UsuarioPermiso::$modulosDisponibles
            ]
        ]);
    }
}
