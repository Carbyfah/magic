<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\Reserva;
use App\Models\EstadoVenta;
use App\Models\TipoVenta;
use App\Http\Resources\VentaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class VentaController extends Controller
{
    /**
     * Listar ventas con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Venta::with(['reserva', 'cliente.persona', 'agencia', 'empleadoVendedor.persona', 'tipoVenta', 'estadoVenta'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $termino = $request->buscar;
                $query->where(function ($q) use ($termino) {
                    $q->where('numero_venta', 'like', "%{$termino}%");
                })->orWhereHas('reserva', function ($q) use ($termino) {
                    $q->where('numero_reserva', 'like', "%{$termino}%");
                });
            }

            // Filtro por periodo
            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->porPeriodo($request->fecha_inicio, $request->fecha_fin);
            }

            // Filtro por vendedor
            if ($request->has('empleado_vendedor_id')) {
                $query->porVendedor($request->empleado_vendedor_id);
            }

            // Filtro por cliente
            if ($request->has('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            // Filtro por agencia
            if ($request->has('agencia_id')) {
                $query->where('agencia_id', $request->agencia_id);
            }

            // Filtro por estado
            if ($request->has('estado_venta_id')) {
                $query->where('estado_venta_id', $request->estado_venta_id);
            }

            // Ventas pagadas
            if ($request->boolean('pagadas')) {
                $query->pagadas();
            }

            // Ventas pendientes
            if ($request->boolean('pendientes')) {
                $query->pendientes();
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 15);
            $ventas = $query->orderBy('fecha_hora_venta', 'desc')
                ->paginate($perPage);

            return VentaResource::collection($ventas);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener ventas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva venta desde reserva
     */
    public function store(Request $request)
    {
        $request->validate([
            'reserva_id' => 'required|exists:reservas,id|unique:ventas,reserva_id',
            'tipo_venta_id' => 'required|exists:tipos_venta,id',
            'forma_pago_id' => 'nullable|exists:formas_pago,id',
            'descuento_porcentaje' => 'nullable|numeric|min:0|max:100',
            'notas' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Obtener la reserva
            $reserva = Reserva::with(['ruta', 'cliente', 'agencia'])->findOrFail($request->reserva_id);

            // Verificar que la reserva esté confirmada
            if ($reserva->estadoReserva->codigo !== 'CONF') {
                return response()->json([
                    'message' => 'La reserva debe estar confirmada para generar venta'
                ], 400);
            }

            // Obtener tipo de venta
            $tipoVenta = TipoVenta::findOrFail($request->tipo_venta_id);

            // Calcular precios
            $precioAdulto = $reserva->ruta->precio_adulto;
            $precioNino = $reserva->ruta->precio_nino;
            $subtotal = ($reserva->pax_adultos * $precioAdulto) + ($reserva->pax_ninos * $precioNino);

            // Calcular descuento
            $descuentoPorcentaje = $request->descuento_porcentaje ?? 0;
            $descuentoMonto = $subtotal * ($descuentoPorcentaje / 100);

            // Calcular impuesto (12% IVA)
            $impuestoMonto = ($subtotal - $descuentoMonto) * 0.12;

            // Total
            $totalVenta = $subtotal - $descuentoMonto + $impuestoMonto;

            // Obtener estado inicial
            $estadoActivo = EstadoVenta::where('codigo', 'ACT')->first();
            if (!$estadoActivo) {
                throw new Exception('Estado activo no encontrado');
            }

            // Crear venta
            $venta = Venta::create([
                'reserva_id' => $reserva->id,
                'cliente_id' => $reserva->cliente_id,
                'agencia_id' => $reserva->agencia_id,
                'empleado_vendedor_id' => 1,
                'tipo_venta_id' => $request->tipo_venta_id,
                'cantidad_adultos' => $reserva->pax_adultos,
                'cantidad_ninos' => $reserva->pax_ninos,
                'precio_unitario_adulto' => $precioAdulto,
                'precio_unitario_nino' => $precioNino,
                'subtotal' => $subtotal,
                'descuento_monto' => $descuentoMonto,
                'impuesto_monto' => $impuestoMonto,
                'total_venta' => $totalVenta,
                'estado_venta_id' => $estadoActivo->id,
                'notas' => $request->notas,
                'situacion' => true
            ]);

            // Calcular comisiones si aplica
            if ($tipoVenta->genera_comision) {
                $venta->calcularComisiones();
            }

            DB::commit();

            return new VentaResource($venta->load(['reserva', 'cliente.persona', 'agencia', 'empleadoVendedor.persona', 'tipoVenta', 'estadoVenta']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear venta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar venta específica
     */
    public function show($id)
    {
        try {
            $venta = Venta::with([
                'reserva.ruta',
                'cliente.persona',
                'agencia',
                'empleadoVendedor.persona',
                'tipoVenta',
                'estadoVenta',
                'pagos.formaPago',
                'pagos.estadoPago'
            ])->findOrFail($id);

            return new VentaResource($venta);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Venta no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar venta
     */
    public function update(Request $request, $id)
    {
        $venta = Venta::findOrFail($id);

        if (!$venta->es_modificable) {
            return response()->json([
                'message' => 'La venta no puede ser modificada en su estado actual'
            ], 400);
        }

        $request->validate([
            'notas' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $venta->update($request->only(['notas']));

            DB::commit();

            return new VentaResource($venta->fresh()->load(['reserva', 'cliente.persona', 'agencia', 'empleadoVendedor.persona', 'tipoVenta', 'estadoVenta']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar venta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Anular venta
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $venta = Venta::findOrFail($id);

            // Verificar si tiene pagos
            if ($venta->pagos()->count() > 0) {
                return response()->json([
                    'message' => 'No se puede anular una venta con pagos registrados'
                ], 400);
            }

            $venta->anular('Anulada por usuario');

            DB::commit();

            return response()->json([
                'message' => 'Venta anulada correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al anular venta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aplicar descuento a venta
     */
    public function aplicarDescuento($id, Request $request)
    {
        $request->validate([
            'porcentaje' => 'required|numeric|min:0|max:100',
            'motivo' => 'required|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $venta = Venta::findOrFail($id);

            if (!$venta->es_modificable) {
                return response()->json([
                    'message' => 'La venta no puede ser modificada'
                ], 400);
            }

            $venta->aplicarDescuento($request->porcentaje, 'Sistema');

            if ($request->has('motivo')) {
                $venta->notas = $venta->notas . "\nMotivo descuento: " . $request->motivo;
                $venta->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Descuento aplicado correctamente',
                'data' => new VentaResource($venta->fresh())
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al aplicar descuento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de ventas por periodo
     */
    public function reportePorPeriodo(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        try {
            $ventas = Venta::with(['tipoVenta', 'estadoVenta'])
                ->porPeriodo($request->fecha_inicio, $request->fecha_fin)
                ->get();

            $reporte = [
                'periodo' => [
                    'inicio' => $request->fecha_inicio,
                    'fin' => $request->fecha_fin
                ],
                'resumen' => [
                    'total_ventas' => $ventas->count(),
                    'monto_total' => $ventas->sum('total_venta'),
                    'descuentos_total' => $ventas->sum('descuento_monto'),
                    'impuestos_total' => $ventas->sum('impuesto_monto'),
                    'comisiones_agencia' => $ventas->sum('comision_agencia'),
                    'comisiones_vendedor' => $ventas->sum('comision_vendedor')
                ],
                'por_tipo' => $ventas->groupBy('tipoVenta.nombre_tipo')->map(function ($grupo) {
                    return [
                        'cantidad' => $grupo->count(),
                        'monto' => $grupo->sum('total_venta')
                    ];
                }),
                'por_estado' => $ventas->groupBy('estadoVenta.nombre_estado')->map(function ($grupo) {
                    return [
                        'cantidad' => $grupo->count(),
                        'monto' => $grupo->sum('total_venta')
                    ];
                }),
                'por_dia' => $ventas->groupBy(function ($venta) {
                    return $venta->fecha_hora_venta->format('Y-m-d');
                })->map(function ($grupo) {
                    return [
                        'cantidad' => $grupo->count(),
                        'monto' => $grupo->sum('total_venta')
                    ];
                })
            ];

            return response()->json($reporte);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al generar reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
