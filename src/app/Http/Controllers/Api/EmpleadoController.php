<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Http\Resources\EmpleadoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;

class EmpleadoController extends Controller
{
    /**
     * Listar empleados con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Empleado::with(['persona', 'rol', 'estadoEmpleado'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $query->whereHas('persona', function ($q) use ($request) {
                    $q->buscar($request->buscar);
                })->orWhere('codigo_empleado', 'like', "%{$request->buscar}%");
            }

            if ($request->has('rol_id')) {
                $query->porRol($request->rol_id);
            }

            if ($request->has('estado_empleado_id')) {
                $query->where('estado_empleado_id', $request->estado_empleado_id);
            }

            if ($request->boolean('solo_choferes')) {
                $query->choferes();
            }

            if ($request->boolean('solo_activos')) {
                $query->activos();
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 15);
            $empleados = $query->orderBy('codigo_empleado')
                ->paginate($perPage);

            return EmpleadoResource::collection($empleados);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener empleados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo empleado
     */
    public function store(Request $request)
    {
        $request->validate([
            // Datos de persona
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'documento_identidad' => 'nullable|string|max:50|unique:personas,documento_identidad',
            'email' => 'required|email|max:255|unique:personas,email',
            'telefono_principal' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',

            // Datos de empleado
            'codigo_empleado' => 'required|string|max:50|unique:empleados,codigo_empleado',
            'password' => 'required|string|min:6',
            'fecha_ingreso' => 'required|date',
            'rol_id' => 'required|exists:roles,id',
            'estado_empleado_id' => 'required|exists:estados_empleado,id'
        ]);

        try {
            DB::beginTransaction();

            // Crear persona primero
            $persona = Persona::create([
                'nombres' => $request->nombres,
                'apellidos' => $request->apellidos,
                'documento_identidad' => $request->documento_identidad,
                'email' => $request->email,
                'telefono_principal' => $request->telefono_principal,
                'whatsapp' => $request->whatsapp ?? $request->telefono_principal,
                'direccion' => $request->direccion,
                'tipo_persona_id' => TipoPersona::where('codigo', TipoPersona::EMPLEADO)->firstOrFail()->id,
                'situacion' => true
            ]);

            // Crear empleado
            $empleado = Empleado::create([
                'persona_id' => $persona->id,
                'codigo_empleado' => $request->codigo_empleado,
                'password' => Hash::make($request->password),
                'fecha_ingreso' => $request->fecha_ingreso,
                'fecha_baja' => null,
                'rol_id' => $request->rol_id,
                'estado_empleado_id' => $request->estado_empleado_id,
                'situacion' => true
            ]);

            DB::commit();

            return new EmpleadoResource($empleado->load(['persona', 'rol', 'estadoEmpleado']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear empleado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar empleado específico
     */
    public function show($id)
    {
        try {
            $empleado = Empleado::with([
                'persona',
                'rol',
                'estadoEmpleado',
                'choferDetalle.tipoLicencia'
            ])->findOrFail($id);

            return new EmpleadoResource($empleado);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Empleado no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar empleado
     */
    public function update(Request $request, $id)
    {
        $empleado = Empleado::findOrFail($id);

        $request->validate([
            // Datos de persona
            'nombres' => 'sometimes|required|string|max:100',
            'apellidos' => 'sometimes|required|string|max:100',
            'documento_identidad' => 'sometimes|nullable|string|max:50|unique:personas,documento_identidad,' . $empleado->persona_id,
            'email' => 'sometimes|required|email|max:255|unique:personas,email,' . $empleado->persona_id,
            'telefono_principal' => 'sometimes|nullable|string|max:20',
            'whatsapp' => 'sometimes|nullable|string|max:20',
            'direccion' => 'sometimes|nullable|string',

            // Datos de empleado
            'codigo_empleado' => 'sometimes|required|string|max:50|unique:empleados,codigo_empleado,' . $id,
            'password' => 'sometimes|nullable|string|min:6',
            'fecha_ingreso' => 'sometimes|required|date',
            'fecha_baja' => 'sometimes|nullable|date',
            'rol_id' => 'sometimes|required|exists:roles,id',
            'estado_empleado_id' => 'sometimes|required|exists:estados_empleado,id'
        ]);

        try {
            DB::beginTransaction();

            // Actualizar persona
            $datosPersona = $request->only([
                'nombres',
                'apellidos',
                'documento_identidad',
                'email',
                'telefono_principal',
                'whatsapp',
                'direccion'
            ]);

            if (!empty($datosPersona)) {
                $empleado->persona->update($datosPersona);
            }

            // Actualizar empleado
            $datosEmpleado = $request->only([
                'codigo_empleado',
                'fecha_ingreso',
                'fecha_baja',
                'rol_id',
                'estado_empleado_id'
            ]);

            if ($request->has('password') && $request->password) {
                $datosEmpleado['password'] = Hash::make($request->password);
            }

            if (!empty($datosEmpleado)) {
                $empleado->update($datosEmpleado);
            }

            DB::commit();

            return new EmpleadoResource($empleado->fresh()->load(['persona', 'rol', 'estadoEmpleado']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar empleado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar empleado (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $empleado = Empleado::findOrFail($id);

            // Verificar si tiene operaciones
            if (
                $empleado->reservasCreadas()->count() > 0 ||
                $empleado->ventasRealizadas()->count() > 0 ||
                $empleado->rutasComoChofer()->count() > 0
            ) {

                // Solo desactivar, no eliminar
                $empleado->situacion = false;
                $empleado->save();

                DB::commit();

                return response()->json([
                    'message' => 'Empleado desactivado (tiene registros relacionados)'
                ]);
            }

            // Si no tiene registros, eliminar completamente
            $empleado->situacion = false;
            $empleado->save();
            $empleado->delete();

            DB::commit();

            return response()->json([
                'message' => 'Empleado eliminado correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar empleado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login de empleado
     */
    public function login(Request $request)
    {
        $request->validate([
            'codigo_empleado' => 'required|string',
            'password' => 'required|string'
        ]);

        try {
            $empleado = Empleado::where('codigo_empleado', $request->codigo_empleado)
                ->where('situacion', true)
                ->first();

            if (!$empleado || !Hash::check($request->password, $empleado->password)) {
                return response()->json([
                    'message' => 'Credenciales inválidas'
                ], 401);
            }

            // Verificar si está activo
            if (!$empleado->esta_activo) {
                return response()->json([
                    'message' => 'Empleado no está activo'
                ], 403);
            }

            // Actualizar último acceso
            $empleado->ultimo_acceso = now();
            $empleado->save();

            // Por ahora devolvemos el empleado, luego agregaremos JWT
            return response()->json([
                'message' => 'Login exitoso',
                'empleado' => new EmpleadoResource($empleado->load(['persona', 'rol', 'estadoEmpleado']))
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error en el login',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
