<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChoferDetalle;
use App\Models\Empleado;
use App\Http\Resources\ChoferDetalleResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class ChoferDetalleController extends Controller
{
    /**
     * Listar choferes
     */
    public function index(Request $request)
    {
        try {
            $query = ChoferDetalle::with(['empleado.persona', 'tipoLicencia'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $termino = $request->buscar;
                $query->whereHas('empleado.persona', function ($q) use ($termino) {
                    $q->buscar($termino);
                })->orWhere('numero_licencia', 'like', "%{$termino}%");
            }

            if ($request->boolean('licencias_vigentes')) {
                $query->licenciasVigentes();
            }

            if ($request->boolean('aptos_turismo')) {
                $query->aptosTurismo();
            }

            if ($request->has('tipo_licencia_id')) {
                $query->where('tipo_licencia_id', $request->tipo_licencia_id);
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 15);
            $choferes = $query->paginate($perPage);

            return ChoferDetalleResource::collection($choferes);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener choferes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar empleado como chofer
     */
    public function store(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required|exists:empleados,id|unique:choferes_detalle,empleado_id',
            'numero_licencia' => 'required|string|max:50|unique:choferes_detalle,numero_licencia',
            'tipo_licencia_id' => 'required|exists:tipos_licencia,id',
            'fecha_emision_licencia' => 'required|date',
            'fecha_vencimiento_licencia' => 'required|date|after:fecha_emision_licencia',
            'fecha_ultimo_examen_medico' => 'nullable|date',
            'apto_turismo' => 'boolean',
            'anos_experiencia' => 'integer|min:0'
        ]);

        try {
            DB::beginTransaction();

            // Verificar que el empleado existe y está activo
            $empleado = Empleado::findOrFail($request->empleado_id);
            if (!$empleado->esta_activo) {
                return response()->json([
                    'message' => 'El empleado no está activo'
                ], 400);
            }

            $choferDetalle = ChoferDetalle::create(array_merge(
                $request->all(),
                ['situacion' => true]
            ));

            DB::commit();

            return new ChoferDetalleResource($choferDetalle->load(['empleado.persona', 'tipoLicencia']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar chofer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar chofer específico
     */
    public function show($id)
    {
        try {
            $chofer = ChoferDetalle::with([
                'empleado.persona',
                'empleado.rutasComoChofer' => function ($q) {
                    $q->latest()->limit(10);
                },
                'tipoLicencia'
            ])->findOrFail($id);

            return new ChoferDetalleResource($chofer);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Chofer no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar datos del chofer
     */
    public function update(Request $request, $id)
    {
        $chofer = ChoferDetalle::findOrFail($id);

        $request->validate([
            'numero_licencia' => 'sometimes|required|string|max:50|unique:choferes_detalle,numero_licencia,' . $id,
            'tipo_licencia_id' => 'sometimes|required|exists:tipos_licencia,id',
            'fecha_emision_licencia' => 'sometimes|required|date',
            'fecha_vencimiento_licencia' => 'sometimes|required|date|after:fecha_emision_licencia',
            'fecha_ultimo_examen_medico' => 'sometimes|nullable|date',
            'apto_turismo' => 'sometimes|boolean',
            'anos_experiencia' => 'sometimes|integer|min:0'
        ]);

        try {
            DB::beginTransaction();

            $chofer->update($request->all());

            DB::commit();

            return new ChoferDetalleResource($chofer->fresh()->load(['empleado.persona', 'tipoLicencia']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar chofer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar registro de chofer
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $chofer = ChoferDetalle::findOrFail($id);

            // Verificar si tiene rutas asignadas
            if ($chofer->empleado->rutasComoChofer()->count() > 0) {
                // Solo desactivar
                $chofer->situacion = false;
                $chofer->save();

                DB::commit();

                return response()->json([
                    'message' => 'Chofer desactivado (tiene rutas asignadas)'
                ]);
            }

            $chofer->situacion = false;
            $chofer->save();
            $chofer->delete();

            DB::commit();

            return response()->json([
                'message' => 'Registro de chofer eliminado'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar chofer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar disponibilidad del chofer
     */
    public function verificarDisponibilidad($id, Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i'
        ]);

        try {
            $chofer = ChoferDetalle::findOrFail($id);

            // Verificar licencia vigente
            if (!$chofer->licencia_vigente) {
                return response()->json([
                    'disponible' => false,
                    'mensaje' => 'Licencia del chofer no está vigente'
                ]);
            }

            // Verificar si ya tiene ruta asignada
            $ocupado = $chofer->empleado->rutasComoChofer()
                ->whereDate('fecha_operacion', $request->fecha)
                ->whereIn('estado', ['programada', 'en_ruta'])
                ->exists();

            return response()->json([
                'disponible' => !$ocupado,
                'mensaje' => $ocupado ? 'Chofer ya tiene ruta asignada' : 'Chofer disponible',
                'licencia_vigente' => $chofer->licencia_vigente,
                'dias_para_vencimiento' => $chofer->dias_para_vencimiento,
                'requiere_renovacion' => $chofer->requiere_renovacion
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al verificar disponibilidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
