<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use App\Http\Resources\PersonaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class PersonaController extends Controller
{
    /**
     * Listar personas con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Persona::with(['tipoPersona'])
                ->activo(); // Solo activos por defecto

            // Filtros opcionales
            if ($request->has('buscar')) {
                $query->buscar($request->buscar);
            }

            if ($request->has('tipo_persona_id')) {
                $query->porTipo($request->tipo_persona_id);
            }

            if ($request->has('incluir_eliminados') && $request->incluir_eliminados) {
                $query->withTrashed();
            }

            // Paginación
            $perPage = $request->get('per_page', 15);
            $personas = $query->orderBy('apellidos')
                ->orderBy('nombres')
                ->paginate($perPage);

            return PersonaResource::collection($personas);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener personas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva persona
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'documento_identidad' => 'nullable|string|max:50|unique:personas,documento_identidad',
            'email' => 'nullable|email|max:255',
            'telefono_principal' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'tipo_persona_id' => 'required|exists:tipos_persona,id'
        ]);

        try {
            DB::beginTransaction();

            $persona = Persona::create([
                'nombres' => $request->nombres,
                'apellidos' => $request->apellidos,
                'documento_identidad' => $request->documento_identidad,
                'email' => $request->email,
                'telefono_principal' => $request->telefono_principal,
                'whatsapp' => $request->whatsapp ?? $request->telefono_principal,
                'direccion' => $request->direccion,
                'tipo_persona_id' => $request->tipo_persona_id,
                'situacion' => true
            ]);

            DB::commit();

            return new PersonaResource($persona->load('tipoPersona'));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear persona',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar persona específica
     */
    public function show($id)
    {
        try {
            $persona = Persona::with(['tipoPersona', 'empleado', 'cliente'])
                ->findOrFail($id);

            return new PersonaResource($persona);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Persona no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar persona
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombres' => 'sometimes|required|string|max:100',
            'apellidos' => 'sometimes|required|string|max:100',
            'documento_identidad' => 'sometimes|nullable|string|max:50|unique:personas,documento_identidad,' . $id,
            'email' => 'sometimes|nullable|email|max:255',
            'telefono_principal' => 'sometimes|nullable|string|max:20',
            'whatsapp' => 'sometimes|nullable|string|max:20',
            'direccion' => 'sometimes|nullable|string',
            'tipo_persona_id' => 'sometimes|required|exists:tipos_persona,id'
        ]);

        try {
            DB::beginTransaction();

            $persona = Persona::findOrFail($id);
            $persona->update($request->only([
                'nombres',
                'apellidos',
                'documento_identidad',
                'email',
                'telefono_principal',
                'whatsapp',
                'direccion',
                'tipo_persona_id'
            ]));

            DB::commit();

            return new PersonaResource($persona->fresh()->load('tipoPersona'));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar persona',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar persona (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $persona = Persona::findOrFail($id);

            // Verificar si tiene relaciones
            if ($persona->empleado || $persona->cliente) {
                return response()->json([
                    'message' => 'No se puede eliminar, tiene registros relacionados'
                ], 400);
            }

            $persona->situacion = false;
            $persona->save();
            $persona->delete(); // Soft delete

            DB::commit();

            return response()->json([
                'message' => 'Persona eliminada correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar persona',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restaurar persona eliminada
     */
    public function restore($id)
    {
        try {
            DB::beginTransaction();

            $persona = Persona::onlyTrashed()->findOrFail($id);
            $persona->restore();
            $persona->situacion = true;
            $persona->save();

            DB::commit();

            return response()->json([
                'message' => 'Persona restaurada correctamente',
                'data' => new PersonaResource($persona)
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al restaurar persona',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
