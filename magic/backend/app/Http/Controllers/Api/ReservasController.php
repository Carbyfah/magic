<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservaRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\TransferenciaService;
use App\Services\PagoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReservasController extends Controller
{
    protected TransferenciaService $transferenciaService;
    protected PagoService $pagoService;

    public function __construct(TransferenciaService $transferenciaService, PagoService $pagoService)
    {
        $this->transferenciaService = $transferenciaService;
        $this->pagoService = $pagoService;

        // Aplicar middleware de permisos
        $this->middleware(['auth:sanctum']);
        $this->middleware(['check.permissions:reservas,ver'])->only(['index', 'show']);
        $this->middleware(['check.permissions:reservas,crear'])->only(['store']);
        $this->middleware(['check.permissions:reservas,editar'])->only(['update']);
        $this->middleware(['check.permissions:reservas,eliminar'])->only(['destroy', 'restore']);
    }

    /**
     * Listar reservas con filtros y paginación
     * GET /api/reservas
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Reserva::with([
            'servicio',
            'rutaActiva.ruta',
            'rutaActiva.vehiculo',
            'tourActivo.tour',
            'estado',
            'agenciaTransferida',
            'caja'
        ]);

        // Filtros disponibles
        if ($request->filled('cliente')) {
            $cliente = $request->get('cliente');
            $query->where(function ($q) use ($cliente) {
                $q->where('reservas_nombres_cliente', 'like', "%{$cliente}%")
                    ->orWhere('reservas_apellidos_cliente', 'like', "%{$cliente}%");
            });
        }

        if ($request->filled('telefono')) {
            $query->where('reservas_telefono', 'like', '%' . $request->get('telefono') . '%');
        }

        if ($request->filled('voucher')) {
            $query->where('reservas_voucher', 'like', '%' . $request->get('voucher') . '%');
        }

        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->get('estado_id'));
        }

        if ($request->filled('servicio_id')) {
            $query->where('id_servicio', $request->get('servicio_id'));
        }

        if ($request->filled('agencia_transferida_id')) {
            $query->where('id_agencia_transferida', $request->get('agencia_transferida_id'));
        }

        if ($request->filled('fecha_desde')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('rutaActiva', function ($sq) use ($request) {
                    $sq->whereDate('ruta_activa_fecha', '>=', $request->get('fecha_desde'));
                })->orWhereHas('tourActivo', function ($sq) use ($request) {
                    $sq->whereDate('tour_activo_fecha', '>=', $request->get('fecha_desde'));
                });
            });
        }

        if ($request->filled('fecha_hasta')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('rutaActiva', function ($sq) use ($request) {
                    $sq->whereDate('ruta_activa_fecha', '<=', $request->get('fecha_hasta'));
                })->orWhereHas('tourActivo', function ($sq) use ($request) {
                    $sq->whereDate('tour_activo_fecha', '<=', $request->get('fecha_hasta'));
                });
            });
        }

        if ($request->filled('tipo_servicio')) {
            $tipo = $request->get('tipo_servicio');
            if ($tipo === 'ruta') {
                $query->whereNotNull('id_ruta_activa');
            } elseif ($tipo === 'tour') {
                $query->whereNotNull('id_tour_activo');
            }
        }

        if ($request->filled('monto_min')) {
            $query->where('reservas_cobrar_a_pax', '>=', $request->get('monto_min'));
        }

        if ($request->filled('monto_max')) {
            $query->where('reservas_cobrar_a_pax', '<=', $request->get('monto_max'));
        }

        // Filtro por eliminados
        if ($request->get('incluir_eliminados') === 'true') {
            $query->withTrashed();
        } elseif ($request->get('solo_eliminados') === 'true') {
            $query->onlyTrashed();
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validar campos de ordenamiento permitidos
        $allowedSorts = [
            'created_at',
            'updated_at',
            'reservas_nombres_cliente',
            'reservas_apellidos_cliente',
            'reservas_telefono',
            'reservas_cantidad_adultos',
            'reservas_cobrar_a_pax'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100); // Máximo 100 por página
        $reservas = $query->paginate($perPage);

        return ReservaResource::collection($reservas)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'cliente',
                    'telefono',
                    'voucher',
                    'estado_id',
                    'servicio_id',
                    'agencia_transferida_id',
                    'fecha_desde',
                    'fecha_hasta',
                    'tipo_servicio',
                    'monto_min',
                    'monto_max'
                ]),
                'ordenamiento' => [
                    'campo' => $sortBy,
                    'direccion' => $sortOrder
                ]
            ]
        ]);
    }

    /**
     * Mostrar reserva específica
     * GET /api/reservas/{reserva}
     */
    public function show(Reserva $reserva): ReservaResource
    {
        $reserva->load([
            'servicio',
            'rutaActiva.ruta.agencia',
            'rutaActiva.vehiculo',
            'tourActivo.tour.agencia',
            'estado',
            'agenciaTransferida',
            'caja'
        ]);

        return (new ReservaResource($reserva))->additional([
            'analisis' => [
                'escenario_transferencia' => $this->transferenciaService->determinarEscenario($reserva->id_reservas),
                'forma_pago' => $this->pagoService->determinarFormaPago($reserva->id_reservas)
            ]
        ]);
    }

    /**
     * Crear nueva reserva
     * POST /api/reservas
     */
    public function store(ReservaRequest $request): JsonResponse
    {
        try {
            $reserva = Reserva::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios]
            ));

            $reserva->load([
                'servicio',
                'rutaActiva.ruta',
                'rutaActiva.vehiculo',
                'tourActivo.tour',
                'estado',
                'agenciaTransferida'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserva creada exitosamente',
                'data' => new ReservaResource($reserva)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando reserva: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Actualizar reserva
     * PUT /api/reservas/{reserva}
     */
    public function update(ReservaRequest $request, Reserva $reserva): JsonResponse
    {
        try {
            $reserva->update($request->validated());

            $reserva->load([
                'servicio',
                'rutaActiva.ruta',
                'rutaActiva.vehiculo',
                'tourActivo.tour',
                'estado',
                'agenciaTransferida',
                'caja'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserva actualizada exitosamente',
                'data' => new ReservaResource($reserva)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando reserva: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Eliminar reserva (soft delete)
     * DELETE /api/reservas/{reserva}
     */
    public function destroy(Reserva $reserva): JsonResponse
    {
        try {
            $reserva->delete();

            return response()->json([
                'success' => true,
                'message' => 'Reserva eliminada exitosamente',
                'data' => [
                    'id' => $reserva->id_reservas,
                    'eliminada_en' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando reserva: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restaurar reserva eliminada
     * PATCH /api/reservas/{reserva}/restore
     */
    public function restore($reservaId): JsonResponse
    {
        try {
            $reserva = Reserva::withTrashed()->findOrFail($reservaId);
            $reserva->restore();

            $reserva->load([
                'servicio',
                'rutaActiva.ruta',
                'estado',
                'agenciaTransferida'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserva restaurada exitosamente',
                'data' => new ReservaResource($reserva)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restaurando reserva: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Buscar reservas (endpoint especializado)
     * GET /api/reservas/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:3'
        ]);

        $termino = $request->get('termino');

        $query = Reserva::with([
            'servicio',
            'rutaActiva.ruta',
            'tourActivo.tour',
            'estado'
        ])->where(function ($q) use ($termino) {
            $q->where('reservas_nombres_cliente', 'like', "%{$termino}%")
                ->orWhere('reservas_apellidos_cliente', 'like', "%{$termino}%")
                ->orWhere('reservas_telefono', 'like', "%{$termino}%")
                ->orWhere('reservas_voucher', 'like', "%{$termino}%")
                ->orWhere('id_reservas', $termino);
        });

        $reservas = $query->limit(20)->get();

        return ReservaResource::collection($reservas);
    }

    /**
     * Duplicar reserva
     * POST /api/reservas/{reserva}/duplicar
     */
    public function duplicar(Reserva $reserva): JsonResponse
    {
        try {
            $nuevaReserva = $reserva->replicate();
            $nuevaReserva->created_by = request()->user()->id_usuarios;
            $nuevaReserva->reservas_voucher = null; // Limpiar voucher
            $nuevaReserva->save();

            $nuevaReserva->load([
                'servicio',
                'rutaActiva.ruta',
                'estado'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserva duplicada exitosamente',
                'data' => new ReservaResource($nuevaReserva)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error duplicando reserva: ' . $e->getMessage()
            ], 422);
        }
    }
}
