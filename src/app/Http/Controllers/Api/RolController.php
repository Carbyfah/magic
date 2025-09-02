<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RolController extends Controller
{
    /**
     * LISTAR ROLES
     */
    public function index(Request $request)
    {
        $query = Rol::query();

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('rol_situacion', $request->boolean('activo'));
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('rol_rol');

        return response()->json($query->get());
    }

    /**
     * CREAR ROL
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rol_codigo' => 'sometimes|string|max:45|unique:rol',
            'rol_rol' => 'required|string|max:45',
            'rol_descripcion' => 'required|string|max:100',
            'rol_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['rol_codigo'] = $validated['rol_codigo'] ?? Rol::generarCodigo();
        $validated['rol_situacion'] = $validated['rol_situacion'] ?? true;

        $rol = Rol::create($validated);

        return response()->json($rol, 201);
    }

    /**
     * VER ROL ESPECÍFICO
     */
    public function show(Rol $rol)
    {
        return response()->json($rol);
    }

    /**
     * ACTUALIZAR ROL
     */
    public function update(Request $request, Rol $rol)
    {
        $validated = $request->validate([
            'rol_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('rol')->ignore($rol->rol_id, 'rol_id')
            ],
            'rol_rol' => 'required|string|max:45',
            'rol_descripcion' => 'required|string|max:100',
            'rol_situacion' => 'sometimes|boolean'
        ]);

        $rol->update($validated);

        return response()->json($rol);
    }

    /**
     * ELIMINAR ROL (Solo si no tiene usuarios)
     */
    public function destroy(Rol $rol)
    {
        if ($rol->tieneUsuarios()) {
            return response()->json([
                'message' => 'No se puede eliminar este rol porque tiene usuarios asociados.'
            ], 409);
        }

        $rol->delete();

        return response()->json(['message' => 'Rol eliminado exitosamente']);
    }

    /**
     * ACTIVAR ROL
     */
    public function activate(Rol $rol)
    {
        $rol->update(['rol_situacion' => 1]);
        return response()->json($rol);
    }

    /**
     * DESACTIVAR ROL
     */
    public function deactivate(Rol $rol)
    {
        $rol->update(['rol_situacion' => 0]);
        return response()->json($rol);
    }
}
