<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Ruta;
use App\Models\EstadoReserva;
use App\Http\Resources\ReservaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class ReservaController extends Controller
{
    /**
     * Listar reservas con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Reserva::with(['empleado.persona', 'ruta', 'cliente.persona', 'agencia', 'estadoReserva'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $termino = $request->buscar;
                $query->where(function ($q) use ($termino) {
                    $q->where('numero_reserva', 'like', "%{$termino}%")
                        ->orWhere('nombre_pasajero_principal', 'like', "%{$termino}%")
                        ->orWhere('voucher', 'like', "%{$termino}%")
                        ->orWhere('hotel_pickup', 'like', "%{$termino}%");
                });
            }

            // Filtro por fecha de viaje
            if ($request->has('fecha_viaje')) {
                $query->porFechaViaje($request->fecha_viaje);
            }

            // Filtro por rango de fechas
            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->porRangoFechas($request->fecha_inicio, $request->fecha_fin);
            }

            // Filtro por ruta
            if ($request->has('ruta_id')) {
                $query->where('ruta_id', $request->ruta_id);
            }

            // Filtro por estado
            if ($request->has('estado_reserva_id')) {
                $query->porEstado($request->estado_reserva_id);
            }

            // Filtro por agencia
            if ($request->has('agencia_id')) {
                $query->where('agencia_id', $request->agencia_id);
            }

            // Filtro por cliente
            if ($request->has('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            // Reservas pendientes
            if ($request->boolean('pendientes')) {
                $query->pendientes();
            }

            // Reservas confirmadas
            if ($request->boolean('confirmadas')) {
                $query->confirmadas();
            }

            // Próximas reservas (próximos 7 días)
            if ($request->boolean('proximas')) {
                $query->proximas($request->get('dias', 7));
            }

            // Sin venta asociada
            if ($request->boolean('sin_venta')) {
                $query->sinVenta();
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha_viaje');
            $orderDir = $request->get('order_dir', 'asc');

            // Paginación
            $perPage = $request->get('per_page', 15);
            $reservas = $query->orderBy($orderBy, $orderDir)
                ->paginate($perPage);

            return ReservaResource::collection($reservas);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener reservas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva reserva
     */
    public function store(Request $request)
    {
        $request->validate([
            'ruta_id' => 'required|exists:rutas,id',
            'pax_adultos' => 'required|integer|min:1',
            'pax_ninos' => 'nullable|integer|min:0',
            'nombre_pasajero_principal' => 'required|string|max:255',
            'cliente_id' => 'nullable|exists:clientes,id',
            'agencia_id' => 'nullable|exists:agencias,id',
            'hotel_pickup' => 'nullable|string|max:255',
            'telefono_contacto' => 'nullable|string|max:20',
            'notas_pickup' => 'nullable|string',
            'fecha_viaje' => 'required|date|after_or_equal:today',
            'hora_pickup' => 'nullable|date_format:H:i',
            'voucher' => 'nullable|string|max:100',
            'precio_total' => 'nullable|numeric|min:0',
            'responsable_pago' => 'nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            // Obtener la ruta
            $ruta = Ruta::findOrFail($request->ruta_id);

            // Verificar disponibilidad
            $totalPasajeros = $request->pax_adultos + ($request->pax_ninos ?? 0);
            $disponibilidad = $ruta->verificarDisponibilidad($request->fecha_viaje, $totalPasajeros);

            if (!$disponibilidad['disponible']) {
                return response()->json([
                    'message' => 'No hay suficiente disponibilidad',
                    'disponibilidad' => $disponibilidad
                ], 400);
            }

            // Calcular precio si no se proporciona
            $precioTotal = $request->precio_total;
            if (!$precioTotal) {
                $precioTotal = ($request->pax_adultos * $ruta->precio_adulto) +
                    (($request->pax_ninos ?? 0) * $ruta->precio_nino);
            }

            // Obtener estado inicial
            $estadoPendiente = EstadoReserva::where('codigo', 'PEND')->first();
            if (!$estadoPendiente) {
                throw new Exception('Estado pendiente no encontrado');
            }

            // Crear reserva
            $reserva = Reserva::create([
                'empleado_id' => 1, // Usuario default pendiente de autenticación
                'ruta_id' => $request->ruta_id,
                'pax_adultos' => $request->pax_adultos,
                'pax_ninos' => $request->pax_ninos ?? 0,
                'nombre_pasajero_principal' => $request->nombre_pasajero_principal,
                'cliente_id' => $request->cliente_id,
                'agencia_id' => $request->agencia_id,
                'hotel_pickup' => $request->hotel_pickup,
                'telefono_contacto' => $request->telefono_contacto,
                'notas_pickup' => $request->notas_pickup,
                'fecha_viaje' => $request->fecha_viaje,
                'hora_pickup' => $request->hora_pickup ?? $ruta->hora_salida,
                'voucher' => $request->voucher,
                'precio_total' => $precioTotal,
                'responsable_pago' => $request->responsable_pago,
                'estado_reserva_id' => $estadoPendiente->id,
                'situacion' => true
            ]);

            DB::commit();

            return new ReservaResource($reserva->load(['empleado.persona', 'ruta', 'cliente.persona', 'agencia', 'estadoReserva']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar reserva específica
     */
    public function show($id)
    {
        try {
            $reserva = Reserva::with([
                'empleado.persona',
                'ruta',
                'cliente.persona',
                'agencia',
                'estadoReserva',
                'venta',
                'rutasEjecutadas'
            ])->findOrFail($id);

            return new ReservaResource($reserva);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Reserva no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar reserva
     */
    public function update(Request $request, $id)
    {
        $reserva = Reserva::findOrFail($id);

        // Verificar si puede modificarse
        if (!$reserva->puedeModificarse()) {
            return response()->json([
                'message' => 'La reserva no puede ser modificada en su estado actual'
            ], 400);
        }

        $request->validate([
            'pax_adultos' => 'sometimes|required|integer|min:1',
            'pax_ninos' => 'sometimes|nullable|integer|min:0',
            'nombre_pasajero_principal' => 'sometimes|required|string|max:255',
            'cliente_id' => 'sometimes|nullable|exists:clientes,id',
            'agencia_id' => 'sometimes|nullable|exists:agencias,id',
            'hotel_pickup' => 'sometimes|nullable|string|max:255',
            'telefono_contacto' => 'sometimes|nullable|string|max:20',
            'notas_pickup' => 'sometimes|nullable|string',
            'hora_pickup' => 'sometimes|nullable|date_format:H:i',
            'voucher' => 'sometimes|nullable|string|max:100',
            'precio_total' => 'sometimes|nullable|numeric|min:0',
            'responsable_pago' => 'sometimes|nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            // Si cambian los pasajeros, verificar disponibilidad
            if ($request->has('pax_adultos') || $request->has('pax_ninos')) {
                $nuevosAdultos = $request->pax_adultos ?? $reserva->pax_adultos;
                $nuevosNinos = $request->pax_ninos ?? $reserva->pax_ninos;
                $totalNuevo = $nuevosAdultos + $nuevosNinos;
                $totalActual = $reserva->pax_adultos + $reserva->pax_ninos;

                if ($totalNuevo > $totalActual) {
                    $diferencia = $totalNuevo - $totalActual;
                    $disponibilidad = $reserva->ruta->verificarDisponibilidad($reserva->fecha_viaje, $diferencia);

                    if (!$disponibilidad['disponible']) {
                        return response()->json([
                            'message' => 'No hay suficiente disponibilidad para aumentar pasajeros',
                            'disponibilidad' => $disponibilidad
                        ], 400);
                    }
                }
            }

            $reserva->update($request->all());

            DB::commit();

            return new ReservaResource($reserva->fresh()->load(['empleado.persona', 'ruta', 'cliente.persona', 'agencia', 'estadoReserva']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar/Cancelar reserva
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $reserva = Reserva::findOrFail($id);

            if (!$reserva->puedeCancelarse()) {
                return response()->json([
                    'message' => 'La reserva no puede ser cancelada en su estado actual'
                ], 400);
            }

            $reserva->cancelar('Cancelada por usuario');

            DB::commit();

            return response()->json([
                'message' => 'Reserva cancelada correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al cancelar reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirmar reserva
     */
    public function confirmar($id)
    {
        try {
            DB::beginTransaction();

            $reserva = Reserva::findOrFail($id);
            $reserva->confirmar();

            DB::commit();

            return response()->json([
                'message' => 'Reserva confirmada correctamente',
                'data' => new ReservaResource($reserva->fresh()->load(['estadoReserva']))
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al confirmar reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar reserva con motivo
     */
    public function cancelar($id, Request $request)
    {
        $request->validate([
            'motivo' => 'required|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $reserva = Reserva::findOrFail($id);

            if (!$reserva->puedeCancelarse()) {
                return response()->json([
                    'message' => 'La reserva no puede ser cancelada en su estado actual'
                ], 400);
            }

            $reserva->cancelar($request->motivo);

            DB::commit();

            return response()->json([
                'message' => 'Reserva cancelada correctamente',
                'data' => new ReservaResource($reserva->fresh()->load(['estadoReserva']))
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al cancelar reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener formato WhatsApp de la reserva
     */
    public function formatoWhatsApp($id)
    {
        try {
            $reserva = Reserva::with(['ruta'])->findOrFail($id);

            $mensaje = $reserva->generarMensajeWhatsApp();

            return response()->json([
                'mensaje' => $mensaje,
                'formato_plano' => strip_tags(str_replace(['*', '━'], '', $mensaje))
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al generar mensaje WhatsApp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dashboard de reservas del día
     */
    public function reservasDelDia(Request $request)
    {
        $fecha = $request->get('fecha', Carbon::today());

        try {
            $reservas = Reserva::with(['ruta', 'estadoReserva'])
                ->porFechaViaje($fecha)
                ->get();

            $estadisticas = [
                'total_reservas' => $reservas->count(),
                'total_pasajeros' => $reservas->sum('pax_total'),
                'adultos' => $reservas->sum('pax_adultos'),
                'ninos' => $reservas->sum('pax_ninos'),
                'confirmadas' => $reservas->where('estadoReserva.codigo', 'CONF')->count(),
                'pendientes' => $reservas->where('estadoReserva.codigo', 'PEND')->count(),
                'por_ruta' => $reservas->groupBy('ruta.nombre_ruta')->map(function ($grupo) {
                    return [
                        'total' => $grupo->count(),
                        'pasajeros' => $grupo->sum('pax_total')
                    ];
                })
            ];

            return response()->json([
                'fecha' => $fecha,
                'estadisticas' => $estadisticas,
                'reservas' => ReservaResource::collection($reservas)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener reservas del día',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
