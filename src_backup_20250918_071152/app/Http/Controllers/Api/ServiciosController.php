<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServicioRequest;
use App\Http\Resources\ServicioResource;
use App\Http\Resources\ReservaResource;
use App\Models\Servicio;
use App\Models\Reserva;
use App\Services\PrecioService;
use App\Services\CapacidadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiciosController extends Controller
{
    protected PrecioService $precioService;
    protected CapacidadService $capacidadService;

    public function __construct(PrecioService $precioService, CapacidadService $capacidadService)
    {
        $this->precioService = $precioService;
        $this->capacidadService = $capacidadService;
    }

    /**
     * Listar servicios con filtros y paginación
     * GET /api/servicios
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Servicio::with(['rutaActiva.ruta', 'tourActivo.tour']);

        // Filtros disponibles
        if ($request->filled('activo')) {
            $activo = $request->get('activo');
            if ($activo === 'true' || $activo === '1') {
                $query->where('servicio_activo', true);
            } elseif ($activo === 'false' || $activo === '0') {
                $query->where('servicio_activo', false);
            }
        }

        if ($request->filled('con_descuento')) {
            $conDescuento = $request->get('con_descuento');
            if ($conDescuento === 'true' || $conDescuento === '1') {
                $query->whereNotNull('servicio_precio_descuento');
            } elseif ($conDescuento === 'false' || $conDescuento === '0') {
                $query->whereNull('servicio_precio_descuento');
            }
        }

        if ($request->filled('precio_min')) {
            $query->where('precio_servicio', '>=', $request->get('precio_min'));
        }

        if ($request->filled('precio_max')) {
            $query->where('precio_servicio', '<=', $request->get('precio_max'));
        }

        if ($request->filled('ruta_activa_id')) {
            $query->where('id_ruta_activa', $request->get('ruta_activa_id'));
        }

        if ($request->filled('tour_activo_id')) {
            $query->where('id_tour_activo', $request->get('tour_activo_id'));
        }

        if ($request->filled('tipo_servicio')) {
            $tipo = $request->get('tipo_servicio');
            if ($tipo === 'ruta') {
                $query->whereNotNull('id_ruta_activa');
            } elseif ($tipo === 'tour') {
                $query->whereNotNull('id_tour_activo');
            }
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

        // Filtro de búsqueda general
        if ($request->filled('buscar')) {
            $termino = $request->get('buscar');
            $query->where(function ($q) use ($termino) {
                $q->where('servicio_observaciones', 'like', "%{$termino}%")
                    ->orWhereHas('rutaActiva.ruta', function ($sq) use ($termino) {
                        $sq->where('rutas_origen', 'like', "%{$termino}%")
                            ->orWhere('rutas_destino', 'like', "%{$termino}%");
                    })
                    ->orWhereHas('tourActivo.tour', function ($sq) use ($termino) {
                        $sq->where('tours_nombre', 'like', "%{$termino}%");
                    });
            });
        }

        // Filtro por eliminados
        if ($request->get('incluir_eliminados') === 'true') {
            $query->withTrashed();
        } elseif ($request->get('solo_eliminados') === 'true') {
            $query->onlyTrashed();
        }

        // Incluir estadísticas si se solicita
        if ($request->get('con_reservas') === 'true') {
            $query->withCount('reservas')->with('reservas');
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = [
            'precio_servicio',
            'servicio_precio_descuento',
            'servicio_descuento_porcentaje',
            'servicio_activo',
            'created_at',
            'updated_at'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100);
        $servicios = $query->paginate($perPage);

        return ServicioResource::collection($servicios)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'activo',
                    'con_descuento',
                    'precio_min',
                    'precio_max',
                    'ruta_activa_id',
                    'tour_activo_id',
                    'tipo_servicio',
                    'fecha_desde',
                    'fecha_hasta',
                    'buscar'
                ]),
                'ordenamiento' => [
                    'campo' => $sortBy,
                    'direccion' => $sortOrder
                ],
                'con_reservas' => $request->get('con_reservas') === 'true'
            ]
        ]);
    }

    /**
     * Mostrar servicio específico
     * GET /api/servicios/{servicio}
     */
    public function show(Servicio $servicio): ServicioResource
    {
        $servicio->load([
            'rutaActiva.ruta.agencia',
            'rutaActiva.vehiculo',
            'rutaActiva.estado',
            'tourActivo.tour.agencia',
            'reservas'
        ]);

        return new ServicioResource($servicio);
    }

    /**
     * Crear nuevo servicio
     * POST /api/servicios
     */
    public function store(ServicioRequest $request): JsonResponse
    {
        try {
            $servicio = Servicio::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios]
            ));

            $servicio->load([
                'rutaActiva.ruta',
                'tourActivo.tour'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Servicio creado exitosamente',
                'data' => new ServicioResource($servicio)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando servicio: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Actualizar servicio
     * PUT /api/servicios/{servicio}
     */
    public function update(ServicioRequest $request, Servicio $servicio): JsonResponse
    {
        try {
            $servicio->update($request->validated());

            $servicio->load([
                'rutaActiva.ruta',
                'tourActivo.tour',
                'reservas'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Servicio actualizado exitosamente',
                'data' => new ServicioResource($servicio)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando servicio: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Eliminar servicio (soft delete)
     * DELETE /api/servicios/{servicio}
     */
    public function destroy(Servicio $servicio): JsonResponse
    {
        try {
            // Verificar que no tenga reservas activas
            $reservasActivas = Reserva::where('id_servicio', $servicio->id_servicio)
                ->whereNull('deleted_at')
                ->count();

            if ($reservasActivas > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el servicio porque tiene {$reservasActivas} reservas asociadas."
                ], 422);
            }

            $servicio->delete();

            return response()->json([
                'success' => true,
                'message' => 'Servicio eliminado exitosamente',
                'data' => [
                    'id' => $servicio->id_servicio,
                    'eliminado_en' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando servicio: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restaurar servicio eliminado
     * PATCH /api/servicios/{servicio}/restore
     */
    public function restore($servicioId): JsonResponse
    {
        try {
            $servicio = Servicio::withTrashed()->findOrFail($servicioId);
            $servicio->restore();

            $servicio->load([
                'rutaActiva.ruta',
                'tourActivo.tour'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Servicio restaurado exitosamente',
                'data' => new ServicioResource($servicio)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restaurando servicio: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtener reservas de un servicio
     * GET /api/servicios/{servicio}/reservas
     */
    public function reservas(Servicio $servicio, Request $request): AnonymousResourceCollection
    {
        $query = Reserva::with([
            'estado',
            'agenciaTransferida',
            'caja'
        ])->where('id_servicio', $servicio->id_servicio);

        // Filtros para las reservas
        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->get('estado_id'));
        }

        if ($request->filled('cliente')) {
            $cliente = $request->get('cliente');
            $query->where(function ($q) use ($cliente) {
                $q->where('reservas_nombres_cliente', 'like', "%{$cliente}%")
                    ->orWhere('reservas_apellidos_cliente', 'like', "%{$cliente}%");
            });
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();

        return ReservaResource::collection($reservas);
    }

    /**
     * Calcular precio del servicio
     * POST /api/servicios/{servicio}/calcular-precio
     */
    public function calcularPrecio(Servicio $servicio, Request $request): JsonResponse
    {
        $request->validate([
            'cantidad_adultos' => 'required|integer|min:1|max:50',
            'cantidad_ninos' => 'nullable|integer|min:0|max:50'
        ]);

        try {
            $precio = $this->precioService->calcularPrecioReserva(
                $servicio->id_servicio,
                $request->get('cantidad_adultos'),
                $request->get('cantidad_ninos', 0)
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'servicio_id' => $servicio->id_servicio,
                    'cantidad_adultos' => $request->get('cantidad_adultos'),
                    'cantidad_ninos' => $request->get('cantidad_ninos', 0),
                    'total_pasajeros' => $request->get('cantidad_adultos') + $request->get('cantidad_ninos', 0),
                    'precio_calculado' => $precio,
                    'precio_formateado' => 'Q' . number_format($precio, 2),
                    'precio_base_servicio' => $servicio->precio_servicio,
                    'precio_con_descuento' => $servicio->servicio_precio_descuento,
                    'descuento_aplicado' => !empty($servicio->servicio_precio_descuento),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error calculando precio: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verificar disponibilidad del servicio
     * GET /api/servicios/{servicio}/disponibilidad
     */
    public function verificarDisponibilidad(Servicio $servicio, Request $request): JsonResponse
    {
        $request->validate([
            'cantidad_pasajeros' => 'required|integer|min:1|max:100'
        ]);

        try {
            $cantidadPasajeros = $request->get('cantidad_pasajeros');

            if ($servicio->id_ruta_activa) {
                $disponibilidad = $this->capacidadService->verificarDisponibilidad(
                    $servicio->id_ruta_activa,
                    $cantidadPasajeros
                );

                return response()->json([
                    'success' => true,
                    'data' => [
                        'servicio_id' => $servicio->id_servicio,
                        'tipo_servicio' => 'ruta',
                        'cantidad_solicitada' => $cantidadPasajeros,
                        'disponibilidad' => $disponibilidad
                    ]
                ]);
            }

            if ($servicio->id_tour_activo) {
                // Para tours, asumimos disponibilidad ilimitada por ahora
                return response()->json([
                    'success' => true,
                    'data' => [
                        'servicio_id' => $servicio->id_servicio,
                        'tipo_servicio' => 'tour',
                        'cantidad_solicitada' => $cantidadPasajeros,
                        'disponible' => true,
                        'mensaje' => 'Tour disponible para la cantidad solicitada'
                    ]
                ]);
            }

            throw new \Exception('Servicio sin ruta activa o tour activo asociado');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verificando disponibilidad: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Buscar servicios
     * GET /api/servicios/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');

        $query = Servicio::with(['rutaActiva.ruta', 'tourActivo.tour'])
            ->where('servicio_activo', true)
            ->where(function ($q) use ($termino) {
                $q->whereHas('rutaActiva.ruta', function ($sq) use ($termino) {
                    $sq->where('rutas_origen', 'like', "%{$termino}%")
                        ->orWhere('rutas_destino', 'like', "%{$termino}%");
                })->orWhereHas('tourActivo.tour', function ($sq) use ($termino) {
                    $sq->where('tours_nombre', 'like', "%{$termino}%");
                });
            });

        $servicios = $query->limit(20)->get();

        return ServicioResource::collection($servicios);
    }

    /**
     * Duplicar servicio
     * POST /api/servicios/{servicio}/duplicar
     */
    public function duplicar(Servicio $servicio): JsonResponse
    {
        try {
            $nuevoServicio = $servicio->replicate();
            $nuevoServicio->created_by = request()->user()->id_usuarios;
            $nuevoServicio->save();

            $nuevoServicio->load([
                'rutaActiva.ruta',
                'tourActivo.tour'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Servicio duplicado exitosamente',
                'data' => new ServicioResource($nuevoServicio)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error duplicando servicio: ' . $e->getMessage()
            ], 422);
        }
    }
}
