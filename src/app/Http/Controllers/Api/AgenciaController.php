<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agencia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AgenciaController extends Controller
{
    /**
     * LISTAR AGENCIAS
     */
    public function index(Request $request)
    {
        $query = Agencia::query();

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('agencia_situacion', $request->boolean('activo'));
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('agencia_razon_social');

        return response()->json($query->get());
    }

    /**
     * CREAR AGENCIA
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agencia_codigo' => 'sometimes|string|max:45|unique:agencia',
            'agencia_razon_social' => 'required|string|max:45',
            'agencia_nit' => 'nullable|string|max:45',
            'agencia_email' => 'nullable|string|email|max:45',
            'agencia_telefono' => 'nullable|integer',
            'agencia_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['agencia_codigo'] = $validated['agencia_codigo'] ?? Agencia::generarCodigo();
        $validated['agencia_situacion'] = $validated['agencia_situacion'] ?? true;

        $agencia = Agencia::create($validated);

        return response()->json($agencia, 201);
    }

    /**
     * VER AGENCIA ESPECÍFICA
     */
    public function show(Agencia $agencia)
    {
        return response()->json($agencia);
    }

    /**
     * ACTUALIZAR AGENCIA
     */
    public function update(Request $request, Agencia $agencia)
    {
        $validated = $request->validate([
            'agencia_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('agencia')->ignore($agencia->agencia_id, 'agencia_id')
            ],
            'agencia_razon_social' => 'required|string|max:45',
            'agencia_nit' => 'nullable|string|max:45',
            'agencia_email' => 'nullable|string|email|max:45',
            'agencia_telefono' => 'nullable|integer',
            'agencia_situacion' => 'sometimes|boolean'
        ]);

        $agencia->update($validated);

        return response()->json($agencia);
    }

    /**
     * ELIMINAR AGENCIA (Solo si no tiene registros asociados)
     */
    public function destroy(Agencia $agencia)
    {
        if ($agencia->tieneRegistrosAsociados()) {
            return response()->json([
                'message' => 'No se puede eliminar esta agencia porque tiene registros asociados.'
            ], 409);
        }

        $agencia->delete();

        return response()->json(['message' => 'Agencia eliminada exitosamente']);
    }

    /**
     * ACTIVAR AGENCIA
     */
    public function activate(Agencia $agencia)
    {
        $agencia->update(['agencia_situacion' => 1]);
        return response()->json($agencia);
    }

    /**
     * DESACTIVAR AGENCIA
     */
    public function deactivate(Agencia $agencia)
    {
        $agencia->update(['agencia_situacion' => 0]);
        return response()->json($agencia);
    }
}
