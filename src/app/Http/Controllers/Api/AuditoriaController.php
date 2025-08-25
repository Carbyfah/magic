<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use App\Http\Resources\AuditoriaResource;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Exception;

class AuditoriaController extends Controller
{
    /**
     * Listar registros de auditoría
     */
    public function index(Request $request)
    {
        try {
            $query = Auditoria::with(['usuario.persona']);

            // Filtros
            if ($request->has('tabla')) {
                $query->porTabla($request->tabla);
            }

            if ($request->has('accion')) {
                $query->porAccion($request->accion);
            }

            if ($request->has('usuario_id')) {
                $query->where('usuario_id', $request->usuario_id);
            }

            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->whereBetween('created_at', [
                    Carbon::parse($request->fecha_inicio)->startOfDay(),
                    Carbon::parse($request->fecha_fin)->endOfDay()
                ]);
            }

            if ($request->has('modulo')) {
                $query->where('modulo', $request->modulo);
            }

            if ($request->has('registro_id')) {
                $query->where('registro_id', $request->registro_id);
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 50);
            $auditorias = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return AuditoriaResource::collection($auditorias);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener registros de auditoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener auditoría por tabla específica
     */
    public function porTabla($tabla, Request $request)
    {
        try {
            $query = Auditoria::with(['usuario.persona'])
                ->porTabla($tabla);

            if ($request->has('registro_id')) {
                $query->where('registro_id', $request->registro_id);
            }

            $perPage = $request->get('per_page', 50);
            $auditorias = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return AuditoriaResource::collection($auditorias);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener auditoría por tabla',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener auditoría por usuario
     */
    public function porUsuario($usuarioId, Request $request)
    {
        try {
            $query = Auditoria::with(['usuario.persona'])
                ->where('usuario_id', $usuarioId);

            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->whereBetween('created_at', [
                    Carbon::parse($request->fecha_inicio)->startOfDay(),
                    Carbon::parse($request->fecha_fin)->endOfDay()
                ]);
            }

            $perPage = $request->get('per_page', 50);
            $auditorias = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return AuditoriaResource::collection($auditorias);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener auditoría por usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de auditoría
     */
    public function estadisticas(Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', Carbon::now()->subDays(7));
            $fechaFin = $request->get('fecha_fin', Carbon::now());

            $auditorias = Auditoria::whereBetween('created_at', [$fechaInicio, $fechaFin])
                ->get();

            $estadisticas = [
                'periodo' => [
                    'inicio' => $fechaInicio,
                    'fin' => $fechaFin
                ],
                'total_registros' => $auditorias->count(),
                'por_accion' => $auditorias->groupBy('accion')->map->count(),
                'por_tabla' => $auditorias->groupBy('tabla')->map->count()->sortDesc()->take(10),
                'por_modulo' => $auditorias->groupBy('modulo')->map->count()->sortDesc(),
                'por_usuario' => $auditorias->groupBy('usuario_id')->map->count()->sortDesc()->take(10),
                'por_dia' => $auditorias->groupBy(function ($item) {
                    return Carbon::parse($item->created_at)->format('Y-m-d');
                })->map->count()
            ];

            return response()->json($estadisticas);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
