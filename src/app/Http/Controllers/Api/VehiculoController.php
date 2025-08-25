<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use App\Http\Resources\VehiculoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class VehiculoController extends Controller
{
    /**
     * Listar vehículos con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Vehiculo::with(['tipoVehiculo', 'tipoCombustible', 'estadoVehiculo'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $termino = $request->buscar;
                $query->where(function ($q) use ($termino) {
                    $q->where('placa', 'like', "%{$termino}%")
                        ->orWhere('codigo_vehiculo', 'like', "%{$termino}%")
                        ->orWhere('marca', 'like', "%{$termino}%")
                        ->orWhere('modelo', 'like', "%{$termino}%");
                });
            }

            if ($request->has('tipo_vehiculo_id')) {
                $query->porTipo($request->tipo_vehiculo_id);
            }

            if ($request->boolean('solo_disponibles')) {
                $query->disponibles();
            }

            if ($request->has('capacidad_minima')) {
                $query->conCapacidadMinima($request->capacidad_minima);
            }

            if ($request->boolean('documentos_vigentes')) {
                $query->documentosVigentes();
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 15);
            $vehiculos = $query->orderBy('codigo_vehiculo')
                ->paginate($perPage);

            return VehiculoResource::collection($vehiculos);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener vehículos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo vehículo
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo_vehiculo' => 'nullable|string|max:50|unique:vehiculos,codigo_vehiculo',
            'placa' => 'required|string|max:20|unique:vehiculos,placa',
            'marca' => 'required|string|max:100',
            'modelo' => 'required|string|max:100',
            'ano' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:50',
            'tipo_vehiculo_id' => 'required|exists:tipos_vehiculo,id',
            'tipo_combustible_id' => 'required|exists:tipos_combustible,id',
            'capacidad_pasajeros' => 'required|integer|min:1',
            'capacidad_equipaje' => 'nullable|integer|min:0',
            'numero_motor' => 'nullable|string|max:100',
            'numero_chasis' => 'nullable|string|max:100',
            'numero_tarjeta_circulacion' => 'nullable|string|max:50',
            'vencimiento_tarjeta_circulacion' => 'nullable|date',
            'poliza_seguro' => 'nullable|string|max:100',
            'vencimiento_seguro' => 'nullable|date',
            'kilometraje_actual' => 'nullable|integer|min:0',
            'fecha_ultimo_servicio' => 'nullable|date',
            'estado_vehiculo_id' => 'required|exists:estados_vehiculo,id'
        ]);

        try {
            DB::beginTransaction();

            // Generar código si no se proporciona
            $codigoVehiculo = $request->codigo_vehiculo ?? $this->generarCodigoVehiculo();

            $vehiculo = Vehiculo::create(array_merge(
                $request->all(),
                [
                    'codigo_vehiculo' => $codigoVehiculo,
                    'situacion' => true
                ]
            ));

            DB::commit();

            return new VehiculoResource($vehiculo->load(['tipoVehiculo', 'tipoCombustible', 'estadoVehiculo']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear vehículo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar vehículo específico
     */
    public function show($id)
    {
        try {
            $vehiculo = Vehiculo::with([
                'tipoVehiculo',
                'tipoCombustible',
                'estadoVehiculo',
                'rutasEjecutadas' => function ($q) {
                    $q->latest()->limit(10);
                }
            ])->findOrFail($id);

            return new VehiculoResource($vehiculo);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Vehículo no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar vehículo
     */
    public function update(Request $request, $id)
    {
        $vehiculo = Vehiculo::findOrFail($id);

        $request->validate([
            'placa' => 'sometimes|required|string|max:20|unique:vehiculos,placa,' . $id,
            'marca' => 'sometimes|required|string|max:100',
            'modelo' => 'sometimes|required|string|max:100',
            'ano' => 'sometimes|required|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'sometimes|nullable|string|max:50',
            'tipo_vehiculo_id' => 'sometimes|required|exists:tipos_vehiculo,id',
            'tipo_combustible_id' => 'sometimes|required|exists:tipos_combustible,id',
            'capacidad_pasajeros' => 'sometimes|required|integer|min:1',
            'capacidad_equipaje' => 'sometimes|nullable|integer|min:0',
            'numero_motor' => 'sometimes|nullable|string|max:100',
            'numero_chasis' => 'sometimes|nullable|string|max:100',
            'numero_tarjeta_circulacion' => 'sometimes|nullable|string|max:50',
            'vencimiento_tarjeta_circulacion' => 'sometimes|nullable|date',
            'poliza_seguro' => 'sometimes|nullable|string|max:100',
            'vencimiento_seguro' => 'sometimes|nullable|date',
            'kilometraje_actual' => 'sometimes|nullable|integer|min:0',
            'fecha_ultimo_servicio' => 'sometimes|nullable|date',
            'estado_vehiculo_id' => 'sometimes|required|exists:estados_vehiculo,id'
        ]);

        try {
            DB::beginTransaction();

            $vehiculo->update($request->all());

            DB::commit();

            return new VehiculoResource($vehiculo->fresh()->load(['tipoVehiculo', 'tipoCombustible', 'estadoVehiculo']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar vehículo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar vehículo (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $vehiculo = Vehiculo::findOrFail($id);

            // Verificar si tiene rutas ejecutadas
            if ($vehiculo->rutasEjecutadas()->count() > 0) {
                // Solo desactivar
                $vehiculo->situacion = false;
                $vehiculo->save();

                DB::commit();

                return response()->json([
                    'message' => 'Vehículo desactivado (tiene registros de operación)'
                ]);
            }

            $vehiculo->situacion = false;
            $vehiculo->save();
            $vehiculo->delete();

            DB::commit();

            return response()->json([
                'message' => 'Vehículo eliminado correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar vehículo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar disponibilidad del vehículo
     */
    public function verificarDisponibilidad($id, Request $request)
    {
        $request->validate([
            'fecha' => 'required|date'
        ]);

        try {
            $vehiculo = Vehiculo::findOrFail($id);

            // Verificar estado del vehículo
            if (!$vehiculo->esta_disponible) {
                return response()->json([
                    'disponible' => false,
                    'mensaje' => 'Vehículo no está en estado disponible'
                ]);
            }

            // Verificar documentos
            if (!$vehiculo->seguro_vigente || !$vehiculo->tarjeta_vigente) {
                return response()->json([
                    'disponible' => false,
                    'mensaje' => 'Documentos del vehículo no están vigentes'
                ]);
            }

            // Verificar si ya está asignado para esa fecha
            $asignado = $vehiculo->rutasEjecutadas()
                ->whereDate('fecha_operacion', $request->fecha)
                ->whereIn('estado', ['programada', 'en_ruta'])
                ->exists();

            return response()->json([
                'disponible' => !$asignado,
                'mensaje' => $asignado ? 'Vehículo ya asignado para esta fecha' : 'Vehículo disponible',
                'requiere_mantenimiento' => $vehiculo->requiere_mantenimiento
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al verificar disponibilidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar código de vehículo automático
     */
    private function generarCodigoVehiculo()
    {
        $ultimo = Vehiculo::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_vehiculo, 4)) + 1 : 1;
        return sprintf('VEH-%04d', $numero);
    }
}
