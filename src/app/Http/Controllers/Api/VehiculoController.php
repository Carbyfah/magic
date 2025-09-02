<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use App\Http\Resources\VehiculoResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehiculoController extends Controller
{
    /**
     * LISTAR VEHICULOS
     */
    public function index(Request $request)
    {
        $query = Vehiculo::with('estado');

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('vehiculo_situacion', $request->boolean('activo'));
        }

        // Filtro por estado
        if ($request->filled('estado_id')) {
            $query->porEstado($request->estado_id);
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('vehiculo_placa')->orderBy('vehiculo_marca');

        $vehiculos = $query->get();

        return VehiculoResource::collection($vehiculos);
    }

    /**
     * CREAR VEHICULO
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehiculo_codigo' => 'sometimes|string|max:45|unique:vehiculo',
            'vehiculo_placa' => 'required|string|max:45|unique:vehiculo',
            'vehiculo_marca' => 'required|string|max:45',
            'vehiculo_modelo' => 'nullable|string|max:45',
            'vehiculo_capacidad' => 'required|integer|min:1|max:999',
            'estado_id' => 'required|exists:estado,estado_id',
            'vehiculo_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['vehiculo_codigo'] = $validated['vehiculo_codigo'] ?? Vehiculo::generarCodigo();
        $validated['vehiculo_situacion'] = $validated['vehiculo_situacion'] ?? true;

        $vehiculo = Vehiculo::create($validated);
        $vehiculo->load('estado');

        return new VehiculoResource($vehiculo);
    }

    /**
     * VER VEHICULO ESPECÍFICO
     */
    public function show(Vehiculo $vehiculo)
    {
        $vehiculo->load(['estado', 'rutasActivadas']);
        return new VehiculoResource($vehiculo);
    }

    /**
     * ACTUALIZAR VEHICULO
     */
    public function update(Request $request, Vehiculo $vehiculo)
    {
        $validated = $request->validate([
            'vehiculo_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('vehiculo')->ignore($vehiculo->vehiculo_id, 'vehiculo_id')
            ],
            'vehiculo_placa' => [
                'required',
                'string',
                'max:45',
                Rule::unique('vehiculo')->ignore($vehiculo->vehiculo_id, 'vehiculo_id')
            ],
            'vehiculo_marca' => 'required|string|max:45',
            'vehiculo_modelo' => 'nullable|string|max:45',
            'vehiculo_capacidad' => 'required|integer|min:1|max:999',
            'estado_id' => 'required|exists:estado,estado_id',
            'vehiculo_situacion' => 'sometimes|boolean'
        ]);

        $vehiculo->update($validated);
        $vehiculo->load('estado');

        return new VehiculoResource($vehiculo);
    }

    /**
     * ELIMINAR VEHICULO (Solo si no tiene rutas activadas)
     */
    public function destroy(Vehiculo $vehiculo)
    {
        if (!$vehiculo->puedeSerEliminado()) {
            return response()->json([
                'message' => 'No se puede eliminar este vehículo porque tiene rutas activadas en el sistema.'
            ], 409);
        }

        $vehiculo->delete();

        return response()->json(['message' => 'Vehículo eliminado exitosamente']);
    }

    /**
     * ACTIVAR VEHICULO
     */
    public function activate(Vehiculo $vehiculo)
    {
        $vehiculo->update(['vehiculo_situacion' => 1]);
        $vehiculo->load('estado');

        return new VehiculoResource($vehiculo);
    }

    /**
     * DESACTIVAR VEHICULO
     */
    public function deactivate(Vehiculo $vehiculo)
    {
        // Verificar si está asignado a rutas activas
        $rutasActivas = $vehiculo->rutasActivadas()
            ->where('ruta_activada_situacion', 1)
            ->whereHas('estado', function ($query) {
                $query->whereIn('estado_estado', ['Activada', 'Llena', 'Ejecución']);
            })
            ->count();

        if ($rutasActivas > 0) {
            return response()->json([
                'message' => 'No se puede desactivar un vehículo que está asignado a rutas activas.'
            ], 409);
        }

        $vehiculo->update(['vehiculo_situacion' => 0]);
        $vehiculo->load('estado');

        return new VehiculoResource($vehiculo);
    }

    /**
     * VERIFICAR DISPONIBILIDAD DE PLACA
     */
    public function verificarPlaca(Request $request)
    {
        $request->validate([
            'placa' => 'required|string',
            'except_id' => 'nullable|integer'
        ]);

        $disponible = Vehiculo::where('vehiculo_placa', $request->placa)
            ->when($request->except_id, function ($query, $exceptId) {
                return $query->where('vehiculo_id', '!=', $exceptId);
            })
            ->doesntExist();

        return response()->json([
            'disponible' => $disponible,
            'message' => $disponible ? 'Placa disponible' : 'Placa ya está en uso'
        ]);
    }

    /**
     * OBTENER VEHICULOS POR ESTADO
     */
    public function porEstado(Request $request, $estadoId)
    {
        $query = Vehiculo::with('estado')
            ->porEstado($estadoId)
            ->activo();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $vehiculos = $query->orderBy('vehiculo_placa')->get();

        return VehiculoResource::collection($vehiculos);
    }

    /**
     * OBTENER RUTAS ACTIVAS DEL VEHICULO
     */
    public function rutasActivas(Vehiculo $vehiculo)
    {
        $rutasActivas = $vehiculo->rutasActivadas()
            ->where('ruta_activada_situacion', 1)
            ->whereIn('estado_id', function ($query) {
                $query->select('estado_id')
                    ->from('estado')
                    ->where('estado_codigo', 'LIKE', 'RUT-%')
                    ->whereIn('estado_estado', ['Activada', 'Llena', 'Ejecución']);
            })
            ->with(['ruta', 'servicio'])
            ->get();

        return response()->json($rutasActivas);
    }

    /**
     * OBTENER NOTIFICACIONES DE ESTADO DEL VEHICULO
     */
    public function obtenerNotificaciones(Vehiculo $vehiculo)
    {
        $vehiculo->load('estado');
        $notificaciones = $vehiculo->obtenerNotificacionesEstado();

        return response()->json([
            'vehiculo_id' => $vehiculo->vehiculo_id,
            'placa' => $vehiculo->vehiculo_placa,
            'estado_actual' => $vehiculo->estado_nombre,
            'notificaciones' => $notificaciones
        ]);
    }

    /**
     * VALIDAR CAMBIO DE ESTADO ANTES DE EJECUTAR
     */
    public function validarCambioEstado(Request $request, Vehiculo $vehiculo)
    {
        $request->validate([
            'nuevo_estado' => 'required|in:disponible,asignado,mantenimiento'
        ]);

        $vehiculo->load('estado');

        switch ($request->nuevo_estado) {
            case 'asignado':
                $validacion = $vehiculo->puedeAsignarse();
                break;
            case 'disponible':
                $validacion = $vehiculo->puedeVolverDisponible();
                break;
            default:
                $validacion = ['puede_cambiar' => true, 'mensaje' => 'Cambio permitido'];
        }

        return response()->json([
            'puede_cambiar' => $validacion['puede_asignarse'] ?? $validacion['puede_disponible'] ?? true,
            'mensaje' => $validacion['mensaje'],
            'tipo_notificacion' => $validacion['tipo_notificacion'] ?? 'info'
        ]);
    }
}
