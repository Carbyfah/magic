<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruta;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RutaController extends Controller
{
    /**
     * LISTAR RUTAS
     */
    public function index(Request $request)
    {
        $query = Ruta::query();

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('ruta_situacion', $request->boolean('activo'));
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('ruta_ruta');

        return response()->json($query->get());
    }

    /**
     * CREAR RUTA
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ruta_codigo' => 'sometimes|string|max:45|unique:ruta',
            'ruta_ruta' => 'required|string|max:45',
            'ruta_origen' => 'required|string|max:100',
            'ruta_destino' => 'required|string|max:100|different:ruta_origen',
            'ruta_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['ruta_codigo'] = $validated['ruta_codigo'] ?? Ruta::generarCodigo();
        $validated['ruta_situacion'] = $validated['ruta_situacion'] ?? true;

        $ruta = Ruta::create($validated);

        return response()->json($ruta, 201);
    }

    /**
     * VER RUTA ESPECÍFICA
     */
    public function show(Ruta $ruta)
    {
        return response()->json($ruta);
    }

    /**
     * ACTUALIZAR RUTA
     */
    public function update(Request $request, Ruta $ruta)
    {
        $validated = $request->validate([
            'ruta_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('ruta')->ignore($ruta->ruta_id, 'ruta_id')
            ],
            'ruta_ruta' => 'required|string|max:45',
            'ruta_origen' => 'required|string|max:100',
            'ruta_destino' => 'required|string|max:100|different:ruta_origen',
            'ruta_situacion' => 'sometimes|boolean'
        ]);

        $ruta->update($validated);

        return response()->json($ruta);
    }

    /**
     * ELIMINAR RUTA (Solo si no tiene rutas activadas)
     */
    public function destroy(Ruta $ruta)
    {
        if ($ruta->tieneRutasActivadas()) {
            return response()->json([
                'message' => 'No se puede eliminar esta ruta porque tiene rutas activadas asociadas.'
            ], 409);
        }

        $ruta->delete();

        return response()->json(['message' => 'Ruta eliminada exitosamente']);
    }

    /**
     * ACTIVAR RUTA
     */
    public function activate(Ruta $ruta)
    {
        $ruta->update(['ruta_situacion' => 1]);
        return response()->json($ruta);
    }

    /**
     * DESACTIVAR RUTA
     */
    public function deactivate(Ruta $ruta)
    {
        $ruta->update(['ruta_situacion' => 0]);
        return response()->json($ruta);
    }
}
