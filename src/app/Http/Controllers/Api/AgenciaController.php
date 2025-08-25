<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agencia;
use App\Http\Resources\AgenciaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class AgenciaController extends Controller
{
    /**
     * Listar agencias con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Agencia::with(['pais', 'tipoAgencia', 'formaPago', 'estadoComercial'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $query->buscar($request->buscar);
            }

            if ($request->has('tipo_agencia_id')) {
                $query->porTipo($request->tipo_agencia_id);
            }

            if ($request->boolean('solo_activas')) {
                $query->activas();
            }

            if ($request->boolean('con_credito')) {
                $query->conCredito();
            }

            if ($request->has('pais_id')) {
                $query->where('pais_id', $request->pais_id);
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 15);
            $agencias = $query->orderBy('nombre_comercial')
                ->paginate($perPage);

            return AgenciaResource::collection($agencias);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener agencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva agencia
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo_agencia' => 'nullable|string|max:50|unique:agencias,codigo_agencia',
            'razon_social' => 'required|string|max:255',
            'nombre_comercial' => 'nullable|string|max:255',
            'nit' => 'required|string|max:20|unique:agencias,nit',
            'registro_turistico' => 'nullable|string|max:100',
            'direccion' => 'required|string',
            'telefono_principal' => 'required|string|max:20',
            'telefono_secundario' => 'nullable|string|max:20',
            'email_principal' => 'required|email|max:255',
            'whatsapp' => 'nullable|string|max:20',
            'pais_id' => 'required|exists:paises,id',
            'contacto_nombre' => 'nullable|string|max:255',
            'contacto_cargo' => 'nullable|string|max:100',
            'contacto_telefono' => 'nullable|string|max:20',
            'contacto_email' => 'nullable|email|max:255',
            'tipo_agencia_id' => 'required|exists:tipos_agencia,id',
            'comision_porcentaje' => 'required|numeric|min:0|max:100',
            'limite_credito' => 'nullable|numeric|min:0',
            'forma_pago_id' => 'required|exists:formas_pago,id',
            'estado_comercial_id' => 'required|exists:estados_comercial,id'
        ]);

        try {
            DB::beginTransaction();

            // Generar código si no se proporciona
            $codigoAgencia = $request->codigo_agencia ?? $this->generarCodigoAgencia();

            $agencia = Agencia::create(array_merge(
                $request->all(),
                [
                    'codigo_agencia' => $codigoAgencia,
                    'nombre_comercial' => $request->nombre_comercial ?? $request->razon_social,
                    'fecha_inicio_relacion' => now(),
                    'situacion' => true
                ]
            ));

            DB::commit();

            return new AgenciaResource($agencia->load(['pais', 'tipoAgencia', 'formaPago', 'estadoComercial']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear agencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar agencia específica
     */
    public function show($id)
    {
        try {
            $agencia = Agencia::with([
                'pais',
                'tipoAgencia',
                'formaPago',
                'estadoComercial',
                'reservas' => function ($q) {
                    $q->latest()->limit(10);
                },
                'ventas' => function ($q) {
                    $q->latest()->limit(10);
                }
            ])->findOrFail($id);

            return new AgenciaResource($agencia);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Agencia no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar agencia
     */
    public function update(Request $request, $id)
    {
        $agencia = Agencia::findOrFail($id);

        $request->validate([
            'razon_social' => 'sometimes|required|string|max:255',
            'nombre_comercial' => 'sometimes|nullable|string|max:255',
            'nit' => 'sometimes|required|string|max:20|unique:agencias,nit,' . $id,
            'registro_turistico' => 'sometimes|nullable|string|max:100',
            'direccion' => 'sometimes|required|string',
            'telefono_principal' => 'sometimes|required|string|max:20',
            'telefono_secundario' => 'sometimes|nullable|string|max:20',
            'email_principal' => 'sometimes|required|email|max:255',
            'whatsapp' => 'sometimes|nullable|string|max:20',
            'pais_id' => 'sometimes|required|exists:paises,id',
            'contacto_nombre' => 'sometimes|nullable|string|max:255',
            'contacto_cargo' => 'sometimes|nullable|string|max:100',
            'contacto_telefono' => 'sometimes|nullable|string|max:20',
            'contacto_email' => 'sometimes|nullable|email|max:255',
            'tipo_agencia_id' => 'sometimes|required|exists:tipos_agencia,id',
            'comision_porcentaje' => 'sometimes|required|numeric|min:0|max:100',
            'limite_credito' => 'sometimes|nullable|numeric|min:0',
            'forma_pago_id' => 'sometimes|required|exists:formas_pago,id',
            'estado_comercial_id' => 'sometimes|required|exists:estados_comercial,id'
        ]);

        try {
            DB::beginTransaction();

            $agencia->update($request->all());

            DB::commit();

            return new AgenciaResource($agencia->fresh()->load(['pais', 'tipoAgencia', 'formaPago', 'estadoComercial']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar agencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar agencia (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $agencia = Agencia::findOrFail($id);

            // Verificar si tiene operaciones
            if ($agencia->reservas()->count() > 0 || $agencia->ventas()->count() > 0) {
                // Solo desactivar
                $agencia->situacion = false;
                $agencia->save();

                DB::commit();

                return response()->json([
                    'message' => 'Agencia desactivada (tiene registros relacionados)'
                ]);
            }

            $agencia->situacion = false;
            $agencia->save();
            $agencia->delete();

            DB::commit();

            return response()->json([
                'message' => 'Agencia eliminada correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar agencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estado de cuenta de la agencia
     */
    public function estadoCuenta($id)
    {
        try {
            $agencia = Agencia::findOrFail($id);

            $estadoCuenta = [
                'agencia' => $agencia->nombre_comercial,
                'nit' => $agencia->nit,
                'limite_credito' => $agencia->limite_credito,
                'deuda_pendiente' => $agencia->deuda_pendiente,
                'credito_disponible' => $agencia->credito_disponible,
                'total_reservas' => $agencia->total_reservas,
                'total_ventas' => $agencia->total_ventas,
                'ventas_pendientes' => $agencia->ventas()
                    ->whereHas('estadoVenta', function ($q) {
                        $q->where('cuenta_ingreso', true);
                    })
                    ->whereDoesntHave('pagos', function ($q) {
                        $q->whereHas('estadoPago', function ($q2) {
                            $q2->where('codigo', 'PAG');
                        });
                    })
                    ->get()
            ];

            return response()->json($estadoCuenta);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estado de cuenta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar código de agencia automático
     */
    private function generarCodigoAgencia()
    {
        $ultimo = Agencia::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_agencia, 4)) + 1 : 1;
        return sprintf('AGE-%04d', $numero);
    }
}
