<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoPersona;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TipoPersonaController extends Controller
{
    /**
     * LISTAR TIPOS DE PERSONA
     */
    public function index(Request $request)
    {
        $query = TipoPersona::query();

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('tipo_persona_situacion', $request->boolean('activo'));
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('tipo_persona_tipo');

        return response()->json($query->get());
    }

    /**
     * CREAR TIPO DE PERSONA
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_persona_codigo' => 'sometimes|string|max:45|unique:tipo_persona',
            'tipo_persona_tipo' => 'required|string|max:45',
            'tipo_persona_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['tipo_persona_codigo'] = $validated['tipo_persona_codigo'] ?? TipoPersona::generarCodigo();
        $validated['tipo_persona_situacion'] = $validated['tipo_persona_situacion'] ?? true;

        $tipoPersona = TipoPersona::create($validated);

        return response()->json($tipoPersona, 201);
    }

    /**
     * VER TIPO DE PERSONA ESPECÍFICO
     */
    public function show(TipoPersona $tipoPersona)
    {
        return response()->json($tipoPersona);
    }

    /**
     * ACTUALIZAR TIPO DE PERSONA
     */
    public function update(Request $request, TipoPersona $tipoPersona)
    {
        $validated = $request->validate([
            'tipo_persona_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('tipo_persona')->ignore($tipoPersona->tipo_persona_id, 'tipo_persona_id')
            ],
            'tipo_persona_tipo' => 'required|string|max:45',
            'tipo_persona_situacion' => 'sometimes|boolean'
        ]);

        $tipoPersona->update($validated);

        return response()->json($tipoPersona);
    }

    /**
     * ELIMINAR TIPO DE PERSONA (Solo si no tiene personas asociadas)
     */
    public function destroy(TipoPersona $tipoPersona)
    {
        if ($tipoPersona->tienePersonasAsociadas()) {
            return response()->json([
                'message' => 'No se puede eliminar este tipo de persona porque tiene personas asociadas.'
            ], 409);
        }

        $tipoPersona->delete();

        return response()->json(['message' => 'Tipo de persona eliminado exitosamente']);
    }

    /**
     * ACTIVAR TIPO DE PERSONA
     */
    public function activate(TipoPersona $tipoPersona)
    {
        $tipoPersona->update(['tipo_persona_situacion' => 1]);

        return response()->json($tipoPersona);
    }

    /**
     * DESACTIVAR TIPO DE PERSONA
     */
    public function deactivate(TipoPersona $tipoPersona)
    {
        $tipoPersona->update(['tipo_persona_situacion' => 0]);

        return response()->json($tipoPersona);
    }
}
