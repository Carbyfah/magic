<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use App\Http\Resources\PersonaResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PersonaController extends Controller
{
    /**
     * LISTAR PERSONAS
     */
    public function index(Request $request)
    {
        $query = Persona::with('tipoPersona');

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('persona_situacion', $request->boolean('activo'));
        }

        // Filtro por tipo de persona
        if ($request->filled('tipo_persona_id')) {
            $query->porTipo($request->tipo_persona_id);
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('persona_nombres')->orderBy('persona_apellidos');

        $personas = $query->get();

        return PersonaResource::collection($personas);
    }

    /**
     * CREAR PERSONA
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'persona_codigo' => 'sometimes|string|max:45|unique:persona',
            'persona_nombres' => 'required|string|max:100',
            'persona_apellidos' => 'required|string|max:100',
            'persona_telefono' => 'nullable|integer|digits_between:8,15',
            'persona_email' => 'nullable|email|max:45|unique:persona',
            'tipo_persona_id' => 'required|exists:tipo_persona,tipo_persona_id',
            'persona_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['persona_codigo'] = $validated['persona_codigo'] ?? Persona::generarCodigo();
        $validated['persona_situacion'] = $validated['persona_situacion'] ?? true;

        // Validar email único si se proporciona
        if (!empty($validated['persona_email'])) {
            $emailExiste = Persona::where('persona_email', $validated['persona_email'])->exists();
            if ($emailExiste) {
                return response()->json([
                    'message' => 'El email ya está registrado',
                    'errors' => ['persona_email' => ['Este email ya está en uso']]
                ], 422);
            }
        }

        $persona = Persona::create($validated);
        $persona->load('tipoPersona');

        return new PersonaResource($persona);
    }

    /**
     * VER PERSONA ESPECÍFICA
     */
    public function show(Persona $persona)
    {
        $persona->load(['tipoPersona', 'usuario.rol']);
        return new PersonaResource($persona);
    }

    /**
     * ACTUALIZAR PERSONA
     */
    public function update(Request $request, Persona $persona)
    {
        $validated = $request->validate([
            'persona_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('persona')->ignore($persona->persona_id, 'persona_id')
            ],
            'persona_nombres' => 'required|string|max:100',
            'persona_apellidos' => 'required|string|max:100',
            'persona_telefono' => 'nullable|integer|digits_between:8,15',
            'persona_email' => [
                'nullable',
                'email',
                'max:45',
                Rule::unique('persona')->ignore($persona->persona_id, 'persona_id')
            ],
            'tipo_persona_id' => 'required|exists:tipo_persona,tipo_persona_id',
            'persona_situacion' => 'sometimes|boolean'
        ]);

        // Validar email único si se proporciona y es diferente
        if (
            !empty($validated['persona_email']) &&
            $validated['persona_email'] !== $persona->persona_email
        ) {

            if (!$persona->esEmailUnico($validated['persona_email'], $persona->persona_id)) {
                return response()->json([
                    'message' => 'El email ya está registrado',
                    'errors' => ['persona_email' => ['Este email ya está en uso']]
                ], 422);
            }
        }

        $persona->update($validated);
        $persona->load('tipoPersona');

        return new PersonaResource($persona);
    }

    /**
     * ELIMINAR PERSONA (Solo si no tiene usuario activo)
     */
    public function destroy(Persona $persona)
    {
        if (!$persona->puedeSerEliminado()) {
            return response()->json([
                'message' => 'No se puede eliminar esta persona porque tiene un usuario activo en el sistema.'
            ], 409);
        }

        $persona->delete();

        return response()->json(['message' => 'Persona eliminada exitosamente']);
    }

    /**
     * ACTIVAR PERSONA
     */
    public function activate(Persona $persona)
    {
        $persona->update(['persona_situacion' => 1]);
        $persona->load('tipoPersona');

        return new PersonaResource($persona);
    }

    /**
     * DESACTIVAR PERSONA
     */
    public function deactivate(Persona $persona)
    {
        // Validar si tiene usuario activo
        if ($persona->tieneUsuarioActivo()) {
            return response()->json([
                'message' => 'No se puede desactivar una persona que tiene un usuario activo en el sistema.'
            ], 409);
        }

        $persona->update(['persona_situacion' => 0]);
        $persona->load('tipoPersona');

        return new PersonaResource($persona);
    }

    /**
     * VERIFICAR DISPONIBILIDAD DE EMAIL
     */
    public function verificarEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'except_id' => 'nullable|integer'
        ]);

        $disponible = Persona::where('persona_email', $request->email)
            ->when($request->except_id, function ($query, $exceptId) {
                return $query->where('persona_id', '!=', $exceptId);
            })
            ->doesntExist();

        return response()->json([
            'disponible' => $disponible,
            'message' => $disponible ? 'Email disponible' : 'Email ya está en uso'
        ]);
    }

    /**
     * OBTENER PERSONAS POR TIPO
     */
    public function porTipo(Request $request, $tipoPersonaId)
    {
        $query = Persona::with('tipoPersona')
            ->porTipo($tipoPersonaId)
            ->activo();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $personas = $query->orderBy('persona_nombres')->get();

        return PersonaResource::collection($personas);
    }
}
