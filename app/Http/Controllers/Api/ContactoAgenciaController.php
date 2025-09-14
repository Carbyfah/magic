<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactosAgencia;
use App\Http\Resources\ContactoAgenciaResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactoAgenciaController extends Controller
{
    /**
     * LISTAR CONTACTOS DE AGENCIA
     */
    public function index(Request $request)
    {
        $query = ContactosAgencia::with('agencia');

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('contactos_agencia_situacion', $request->boolean('activo'));
        }

        // Filtro por agencia
        if ($request->filled('agencia_id')) {
            $query->porAgencia($request->agencia_id);
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('contactos_agencia_nombres')->orderBy('contactos_agencia_apellidos');

        $contactos = $query->get();

        return ContactoAgenciaResource::collection($contactos);
    }

    /**
     * CREAR CONTACTO DE AGENCIA
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contactos_agencia_codigo' => 'sometimes|string|max:45|unique:contactos_agencia',
            'contactos_agencia_nombres' => 'required|string|max:100',
            'contactos_agencia_apellidos' => 'required|string|max:100',
            'contactos_agencia_cargo' => 'required|string|max:45',
            'contactos_agencia_telefono' => 'required|integer|digits_between:8,15',
            'agencia_id' => 'required|exists:agencia,agencia_id',
            'contactos_agencia_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['contactos_agencia_codigo'] = $validated['contactos_agencia_codigo'] ?? ContactosAgencia::generarCodigo();
        $validated['contactos_agencia_situacion'] = $validated['contactos_agencia_situacion'] ?? true;

        // Validar teléfono único por agencia
        $telefonoExiste = ContactosAgencia::where('contactos_agencia_telefono', $validated['contactos_agencia_telefono'])
            ->where('agencia_id', $validated['agencia_id'])
            ->exists();

        if ($telefonoExiste) {
            return response()->json([
                'message' => 'El teléfono ya está registrado para esta agencia',
                'errors' => ['contactos_agencia_telefono' => ['Este teléfono ya está en uso en esta agencia']]
            ], 422);
        }

        $contacto = ContactosAgencia::create($validated);
        $contacto->load('agencia');

        return new ContactoAgenciaResource($contacto);
    }

    /**
     * VER CONTACTO ESPECÍFICO
     */
    public function show(ContactosAgencia $contacto)
    {
        $contacto->load('agencia');
        return new ContactoAgenciaResource($contacto);
    }

    /**
     * ACTUALIZAR CONTACTO DE AGENCIA
     */
    public function update(Request $request, ContactosAgencia $contacto)
    {
        $validated = $request->validate([
            'contactos_agencia_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('contactos_agencia')->ignore($contacto->contactos_agencia_id, 'contactos_agencia_id')
            ],
            'contactos_agencia_nombres' => 'required|string|max:100',
            'contactos_agencia_apellidos' => 'required|string|max:100',
            'contactos_agencia_cargo' => 'required|string|max:45',
            'contactos_agencia_telefono' => 'required|integer|digits_between:8,15',
            'agencia_id' => 'required|exists:agencia,agencia_id',
            'contactos_agencia_situacion' => 'sometimes|boolean'
        ]);

        // Validar teléfono único por agencia si cambió
        if (
            $validated['contactos_agencia_telefono'] != $contacto->contactos_agencia_telefono ||
            $validated['agencia_id'] != $contacto->agencia_id
        ) {
            if (!$contacto->esTelefonoUnicoEnAgencia($validated['contactos_agencia_telefono'], $contacto->contactos_agencia_id)) {
                return response()->json([
                    'message' => 'El teléfono ya está registrado para esta agencia',
                    'errors' => ['contactos_agencia_telefono' => ['Este teléfono ya está en uso en esta agencia']]
                ], 422);
            }
        }

        $contacto->update($validated);
        $contacto->load('agencia');

        return new ContactoAgenciaResource($contacto);
    }

    /**
     * ELIMINAR CONTACTO (Solo si no es el único contacto activo)
     */
    public function destroy(ContactosAgencia $contacto)
    {
        if (!$contacto->puedeSerEliminado()) {
            return response()->json([
                'message' => 'No se puede eliminar este contacto porque es el único contacto activo de la agencia.'
            ], 409);
        }

        $contacto->delete();

        return response()->json(['message' => 'Contacto eliminado exitosamente']);
    }

    /**
     * ACTIVAR CONTACTO
     */
    public function activate(ContactosAgencia $contacto)
    {
        $contacto->update(['contactos_agencia_situacion' => 1]);
        $contacto->load('agencia');

        return new ContactoAgenciaResource($contacto);
    }

    /**
     * DESACTIVAR CONTACTO
     */
    public function deactivate(ContactosAgencia $contacto)
    {
        // Validar si es el único contacto activo de la agencia
        if (!$contacto->puedeSerEliminado()) {
            return response()->json([
                'message' => 'No se puede desactivar este contacto porque es el único contacto activo de la agencia.'
            ], 409);
        }

        $contacto->update(['contactos_agencia_situacion' => 0]);
        $contacto->load('agencia');

        return new ContactoAgenciaResource($contacto);
    }

    /**
     * VERIFICAR DISPONIBILIDAD DE TELÉFONO POR AGENCIA
     */
    public function verificarTelefono(Request $request)
    {
        $request->validate([
            'telefono' => 'required|integer',
            'agencia_id' => 'required|exists:agencia,agencia_id',
            'except_id' => 'nullable|integer'
        ]);

        $disponible = ContactosAgencia::where('contactos_agencia_telefono', $request->telefono)
            ->where('agencia_id', $request->agencia_id)
            ->when($request->except_id, function ($query, $exceptId) {
                return $query->where('contactos_agencia_id', '!=', $exceptId);
            })
            ->doesntExist();

        return response()->json([
            'disponible' => $disponible,
            'message' => $disponible ? 'Teléfono disponible para esta agencia' : 'Teléfono ya está en uso en esta agencia'
        ]);
    }

    /**
     * OBTENER CONTACTOS POR AGENCIA
     */
    public function porAgencia(Request $request, $agenciaId)
    {
        $query = ContactosAgencia::with('agencia')
            ->porAgencia($agenciaId)
            ->activo();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $contactos = $query->orderBy('contactos_agencia_nombres')->get();

        return ContactoAgenciaResource::collection($contactos);
    }

    /**
     * OBTENER CONTACTO PRINCIPAL DE AGENCIA
     */
    public function contactoPrincipal($agenciaId)
    {
        $contactoPrincipal = ContactosAgencia::getContactoPrincipal($agenciaId);

        if (!$contactoPrincipal) {
            return response()->json([
                'message' => 'No se encontró contacto principal para esta agencia'
            ], 404);
        }

        $contactoPrincipal->load('agencia');
        return new ContactoAgenciaResource($contactoPrincipal);
    }

    /**
     * OBTENER CONTACTOS POR CARGO
     */
    public function porCargo(Request $request, $cargo)
    {
        $query = ContactosAgencia::with('agencia')
            ->where('contactos_agencia_cargo', 'like', "%{$cargo}%")
            ->activo();

        if ($request->filled('agencia_id')) {
            $query->porAgencia($request->agencia_id);
        }

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $contactos = $query->orderBy('contactos_agencia_nombres')->get();

        return ContactoAgenciaResource::collection($contactos);
    }
}
