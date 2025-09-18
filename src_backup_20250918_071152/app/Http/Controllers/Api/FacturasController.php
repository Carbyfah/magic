<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FacturaRequest;
use App\Http\Resources\FacturaResource;
use App\Models\FacturaSat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FacturasController extends Controller
{
    /**
     * Listar facturas con filtros básicos
     * GET /api/facturas
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = FacturaSat::with(['reserva']);

        // Filtros básicos
        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_factura', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_factura', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('nit_cliente')) {
            $query->where('nit_cliente', 'like', '%' . $request->get('nit_cliente') . '%');
        }

        if ($request->filled('nombre_cliente')) {
            $query->where('nombre_cliente', 'like', '%' . $request->get('nombre_cliente') . '%');
        }

        if ($request->filled('estado_sat')) {
            $query->where('estado_sat', 'like', '%' . $request->get('estado_sat') . '%');
        }

        if ($request->filled('total_min')) {
            $query->where('total_factura', '>=', $request->get('total_min'));
        }

        if ($request->filled('total_max')) {
            $query->where('total_factura', '<=', $request->get('total_max'));
        }

        if ($request->filled('certificadas')) {
            $certificadas = $request->get('certificadas');
            if ($certificadas === 'true' || $certificadas === '1') {
                $query->whereNotNull('uuid_sat');
            } elseif ($certificadas === 'false' || $certificadas === '0') {
                $query->whereNull('uuid_sat');
            }
        }

        if ($request->filled('con_error')) {
            $conError = $request->get('con_error');
            if ($conError === 'true' || $conError === '1') {
                $query->whereNotNull('error_sat');
            } elseif ($conError === 'false' || $conError === '0') {
                $query->whereNull('error_sat');
            }
        }

        if ($request->filled('buscar')) {
            $termino = $request->get('buscar');
            $query->where(function ($q) use ($termino) {
                $q->where('nombre_cliente', 'like', "%{$termino}%")
                    ->orWhere('nit_cliente', 'like', "%{$termino}%")
                    ->orWhere('numero_factura_sat', 'like', "%{$termino}%")
                    ->orWhere('descripcion_servicios', 'like', "%{$termino}%");
            });
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_factura');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['fecha_factura', 'total_factura', 'estado_sat', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100);
        $facturas = $query->paginate($perPage);

        return FacturaResource::collection($facturas)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'fecha_desde',
                    'fecha_hasta',
                    'nit_cliente',
                    'nombre_cliente',
                    'estado_sat',
                    'total_min',
                    'total_max',
                    'certificadas',
                    'con_error',
                    'buscar'
                ]),
                'resumen' => [
                    'total_facturas' => $facturas->total(),
                    'total_monto' => $facturas->getCollection()->sum('total_factura'),
                    'certificadas' => $facturas->getCollection()->whereNotNull('uuid_sat')->count(),
                ]
            ]
        ]);
    }

    /**
     * Mostrar factura específica
     * GET /api/facturas/{factura}
     */
    public function show(FacturaSat $factura): FacturaResource
    {
        $factura->load(['reserva']);
        return new FacturaResource($factura);
    }

    /**
     * Crear nueva factura
     * POST /api/facturas
     */
    public function store(FacturaRequest $request): JsonResponse
    {
        try {
            // Generar número de factura automático
            $ultimoNumero = FacturaSat::max('numero_factura_sat') ?? 0;
            $nuevoNumero = $ultimoNumero + 1;

            $factura = FacturaSat::create(array_merge(
                $request->validated(),
                [
                    'created_by' => $request->user()->id_usuarios,
                    'numero_factura_sat' => $nuevoNumero,
                    'serie_factura' => 'A', // Serie por defecto
                    'estado_sat' => 'Pendiente'
                ]
            ));

            $factura->load(['reserva']);

            return response()->json([
                'success' => true,
                'message' => 'Factura creada exitosamente',
                'data' => new FacturaResource($factura)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando factura: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Actualizar factura
     * PUT /api/facturas/{factura}
     */
    public function update(FacturaRequest $request, FacturaSat $factura): JsonResponse
    {
        try {
            // No permitir actualizar si ya está certificada
            if (!empty($factura->uuid_sat)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede actualizar una factura ya certificada por SAT'
                ], 422);
            }

            $factura->update($request->validated());
            $factura->load(['reserva']);

            return response()->json([
                'success' => true,
                'message' => 'Factura actualizada exitosamente',
                'data' => new FacturaResource($factura)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando factura: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Eliminar factura
     * DELETE /api/facturas/{factura}
     */
    public function destroy(FacturaSat $factura): JsonResponse
    {
        try {
            // No permitir eliminar si ya está certificada
            if (!empty($factura->uuid_sat)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar una factura ya certificada por SAT'
                ], 422);
            }

            $factura->delete();

            return response()->json([
                'success' => true,
                'message' => 'Factura eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando factura: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Enviar factura a SAT (simulación)
     * POST /api/facturas/{factura}/enviar-sat
     */
    public function enviarSat(FacturaSat $factura): JsonResponse
    {
        try {
            // Verificar que no esté ya certificada
            if (!empty($factura->uuid_sat)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La factura ya está certificada por SAT'
                ], 422);
            }

            // Simulación de envío a SAT
            // En implementación real, aquí iría la integración con API SAT
            $exito = $this->simularEnvioSat($factura);

            if ($exito) {
                $factura->update([
                    'estado_sat' => 'Certificada',
                    'fecha_envio_sat' => now(),
                    'uuid_sat' => 'UUID-' . uniqid() . '-' . time(),
                    'error_sat' => null
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Factura enviada y certificada exitosamente por SAT',
                    'data' => new FacturaResource($factura->fresh(['reserva']))
                ]);
            } else {
                $factura->update([
                    'estado_sat' => 'Error',
                    'error_sat' => 'Error simulado en el envío a SAT'
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Error enviando factura a SAT',
                    'data' => new FacturaResource($factura->fresh(['reserva']))
                ], 422);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error procesando envío: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Resumen de facturación por período
     * GET /api/facturas/resumen
     */
    public function resumen(Request $request): JsonResponse
    {
        $fechaInicio = $request->get('fecha_inicio', today()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->get('fecha_fin', today()->format('Y-m-d'));

        try {
            $facturas = FacturaSat::whereBetween('fecha_factura', [$fechaInicio, $fechaFin])
                ->whereNull('deleted_at')
                ->get();

            $resumen = [
                'periodo' => [
                    'inicio' => $fechaInicio,
                    'fin' => $fechaFin
                ],
                'totales' => [
                    'cantidad_facturas' => $facturas->count(),
                    'monto_total' => $facturas->sum('total_factura'),
                    'promedio_por_factura' => $facturas->count() > 0
                        ? round($facturas->avg('total_factura'), 2)
                        : 0,
                ],
                'por_estado' => [
                    'certificadas' => $facturas->whereNotNull('uuid_sat')->count(),
                    'pendientes' => $facturas->where('estado_sat', 'Pendiente')->count(),
                    'con_error' => $facturas->whereNotNull('error_sat')->count(),
                ],
                'factura_mayor' => $facturas->max('total_factura'),
                'factura_menor' => $facturas->min('total_factura'),
            ];

            return response()->json([
                'success' => true,
                'data' => $resumen
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generando resumen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar facturas
     * GET /api/facturas/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');

        $query = FacturaSat::with(['reserva'])
            ->where(function ($q) use ($termino) {
                $q->where('nombre_cliente', 'like', "%{$termino}%")
                    ->orWhere('nit_cliente', 'like', "%{$termino}%")
                    ->orWhere('numero_factura_sat', 'like', "%{$termino}%");
            });

        $facturas = $query->limit(20)->get();

        return FacturaResource::collection($facturas);
    }

    /**
     * Simular envío a SAT (para desarrollo)
     * En producción esto sería reemplazado por la integración real
     */
    private function simularEnvioSat(FacturaSat $factura): bool
    {
        // Simulación: 90% de éxito
        return rand(1, 10) <= 9;
    }
}
