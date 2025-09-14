<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServicioController extends Controller
{
    /**
     * LISTAR SERVICIOS
     */
    public function index(Request $request)
    {
        $query = Servicio::query();

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('servicio_situacion', $request->boolean('activo'));
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('servicio_servicio');

        return response()->json($query->get());
    }

    /**
     * CREAR SERVICIO
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'servicio_codigo' => 'sometimes|string|max:45|unique:servicio',
            'servicio_servicio' => 'required|string|max:100',
            'servicio_precio_normal' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_precio_descuento' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['servicio_codigo'] = $validated['servicio_codigo'] ?? Servicio::generarCodigo();
        $validated['servicio_situacion'] = $validated['servicio_situacion'] ?? true;

        $servicio = Servicio::create($validated);

        return response()->json($servicio, 201);
    }

    /**
     * VER SERVICIO ESPECÍFICO
     */
    public function show(Servicio $servicio)
    {
        return response()->json($servicio);
    }

    /**
     * ACTUALIZAR SERVICIO
     */
    public function update(Request $request, Servicio $servicio)
    {
        $validated = $request->validate([
            'servicio_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('servicio')->ignore($servicio->servicio_id, 'servicio_id')
            ],
            'servicio_servicio' => 'required|string|max:100',
            'servicio_precio_normal' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_precio_descuento' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_situacion' => 'sometimes|boolean'
        ]);

        $servicio->update($validated);

        return response()->json($servicio);
    }

    /**
     * ELIMINAR SERVICIO (Solo si no tiene reservas activas)
     */
    public function destroy(Servicio $servicio)
    {
        if ($servicio->tieneReservasActivas()) {
            return response()->json([
                'message' => 'No se puede eliminar este servicio porque tiene reservas activas.'
            ], 409);
        }

        $servicio->delete();

        return response()->json(['message' => 'Servicio eliminado exitosamente']);
    }

    /**
     * ACTIVAR SERVICIO
     */
    public function activate(Servicio $servicio)
    {
        $servicio->update(['servicio_situacion' => 1]);
        return response()->json($servicio);
    }

    /**
     * DESACTIVAR SERVICIO
     */
    public function deactivate(Servicio $servicio)
    {
        $servicio->update(['servicio_situacion' => 0]);
        return response()->json($servicio);
    }
}
