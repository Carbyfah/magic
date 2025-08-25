<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Http\Resources\ClienteResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class ClienteController extends Controller
{
    /**
     * Listar clientes con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Cliente::with(['persona', 'tipoCliente', 'paisResidencia'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $query->buscar($request->buscar);
            }

            if ($request->has('tipo_cliente_id')) {
                $query->porTipo($request->tipo_cliente_id);
            }

            if ($request->boolean('solo_con_credito')) {
                $query->conCredito();
            }

            // Paginación
            $perPage = $request->get('per_page', 15);
            $clientes = $query->orderBy('codigo_cliente')
                ->paginate($perPage);

            return ClienteResource::collection($clientes);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener clientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo cliente
     */
    public function store(Request $request)
    {
        $request->validate([
            // Datos de persona
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'documento_identidad' => 'nullable|string|max:50|unique:personas,documento_identidad',
            'email' => 'nullable|email|max:255',
            'telefono_principal' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',

            // Datos de cliente
            'codigo_cliente' => 'nullable|string|max:50|unique:clientes,codigo_cliente',
            'tipo_cliente_id' => 'required|exists:tipos_cliente,id',
            'pais_residencia_id' => 'nullable|exists:paises,id',
            'ciudad_residencia' => 'nullable|string|max:100',
            'limite_credito' => 'nullable|numeric|min:0',
            'referido_por' => 'nullable|string|max:100'
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
                'tipo_persona_id' => TipoPersona::where('codigo', TipoPersona::CLIENTE)->firstOrFail()->id,
                'situacion' => true
            ]);

            // Generar código de cliente si no se proporciona
            $codigoCliente = $request->codigo_cliente ?? $this->generarCodigoCliente();

            // Crear cliente
            $cliente = Cliente::create([
                'persona_id' => $persona->id,
                'codigo_cliente' => $codigoCliente,
                'tipo_cliente_id' => $request->tipo_cliente_id,
                'pais_residencia_id' => $request->pais_residencia_id,
                'ciudad_residencia' => $request->ciudad_residencia,
                'fecha_registro' => now(),
                'limite_credito' => $request->limite_credito ?? 0,
                'referido_por' => $request->referido_por,
                'situacion' => true
            ]);

            DB::commit();

            return new ClienteResource($cliente->load(['persona', 'tipoCliente', 'paisResidencia']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar cliente específico
     */
    public function show($id)
    {
        try {
            $cliente = Cliente::with([
                'persona',
                'tipoCliente',
                'paisResidencia',
                'reservas' => function ($q) {
                    $q->latest()->limit(10);
                },
                'ventas' => function ($q) {
                    $q->latest()->limit(10);
                }
            ])->findOrFail($id);

            return new ClienteResource($cliente);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Cliente no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar cliente
     */
    public function update(Request $request, $id)
    {
        $cliente = Cliente::findOrFail($id);

        $request->validate([
            // Datos de persona
            'nombres' => 'sometimes|required|string|max:100',
            'apellidos' => 'sometimes|required|string|max:100',
            'documento_identidad' => 'sometimes|nullable|string|max:50|unique:personas,documento_identidad,' . $cliente->persona_id,
            'email' => 'sometimes|nullable|email|max:255',
            'telefono_principal' => 'sometimes|nullable|string|max:20',
            'whatsapp' => 'sometimes|nullable|string|max:20',
            'direccion' => 'sometimes|nullable|string',

            // Datos de cliente
            'tipo_cliente_id' => 'sometimes|required|exists:tipos_cliente,id',
            'pais_residencia_id' => 'sometimes|nullable|exists:paises,id',
            'ciudad_residencia' => 'sometimes|nullable|string|max:100',
            'limite_credito' => 'sometimes|nullable|numeric|min:0',
            'referido_por' => 'sometimes|nullable|string|max:100'
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
                $cliente->persona->update($datosPersona);
            }

            // Actualizar cliente
            $datosCliente = $request->only([
                'tipo_cliente_id',
                'pais_residencia_id',
                'ciudad_residencia',
                'limite_credito',
                'referido_por'
            ]);

            if (!empty($datosCliente)) {
                $cliente->update($datosCliente);
            }

            DB::commit();

            return new ClienteResource($cliente->fresh()->load(['persona', 'tipoCliente', 'paisResidencia']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar cliente (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $cliente = Cliente::findOrFail($id);

            // Verificar si tiene operaciones
            if ($cliente->reservas()->count() > 0 || $cliente->ventas()->count() > 0) {
                // Solo desactivar, no eliminar
                $cliente->situacion = false;
                $cliente->save();

                DB::commit();

                return response()->json([
                    'message' => 'Cliente desactivado (tiene registros relacionados)'
                ]);
            }

            // Si no tiene registros, eliminar completamente
            $cliente->situacion = false;
            $cliente->save();
            $cliente->delete();

            DB::commit();

            return response()->json([
                'message' => 'Cliente eliminado correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar crédito disponible
     */
    public function verificarCredito($id)
    {
        try {
            $cliente = Cliente::findOrFail($id);

            return response()->json([
                'limite_credito' => $cliente->limite_credito,
                'credito_disponible' => $cliente->credito_disponible,
                'deuda_actual' => $cliente->limite_credito - $cliente->credito_disponible,
                'puede_comprar_credito' => $cliente->limite_credito > 0
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al verificar crédito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar código de cliente automático
     */
    private function generarCodigoCliente()
    {
        $ultimo = Cliente::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_cliente, 4)) + 1 : 1;
        return sprintf('CLI-%05d', $numero);
    }
}
