<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RutaEjecutada;
use App\Models\Ruta;
use App\Models\Vehiculo;
use App\Models\Empleado;
use App\Models\Reserva;
use App\Http\Resources\RutaEjecutadaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class RutaEjecutadaController extends Controller
{
    /**
     * Listar rutas ejecutadas
     */
    public function index(Request $request)
    {
        try {
            $query = RutaEjecutada::with(['ruta', 'vehiculo', 'chofer.persona', 'choferApoyo.persona'])
                ->activo();

            // Filtros
            if ($request->has('fecha_operacion')) {
                $query->porFecha($request->fecha_operacion);
            }

            if ($request->has('ruta_id')) {
                $query->where('ruta_id', $request->ruta_id);
            }

            if ($request->has('vehiculo_id')) {
                $query->where('vehiculo_id', $request->vehiculo_id);
            }

            if ($request->has('chofer_id')) {
                $query->where('chofer_id', $request->chofer_id);
            }

            if ($request->has('estado')) {
                $query->porEstado($request->estado);
            }

            if ($request->boolean('hoy')) {
                $query->hoy();
            }

            if ($request->boolean('completadas')) {
                $query->completadas();
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 15);
            $rutasEjecutadas = $query->orderBy('fecha_operacion', 'desc')
                ->orderBy('hora_salida_programada')
                ->paginate($perPage);

            return RutaEjecutadaResource::collection($rutasEjecutadas);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener rutas ejecutadas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva ruta ejecutada (programar ruta)
     */
    public function store(Request $request)
    {
        $request->validate([
            'ruta_id' => 'required|exists:rutas,id',
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'chofer_id' => 'required|exists:empleados,id',
            'chofer_apoyo_id' => 'nullable|exists:empleados,id',
            'fecha_operacion' => 'required|date',
            'hora_salida_programada' => 'nullable|date_format:H:i'
        ]);

        try {
            DB::beginTransaction();

            // Obtener ruta
            $ruta = Ruta::findOrFail($request->ruta_id);

            // Verificar vehículo disponible
            $vehiculo = Vehiculo::findOrFail($request->vehiculo_id);
            if (!$vehiculo->esta_disponible) {
                return response()->json([
                    'message' => 'El vehículo no está disponible'
                ], 400);
            }

            // Verificar que el chofer esté disponible
            $chofer = Empleado::findOrFail($request->chofer_id);
            if (!$chofer->es_chofer) {
                return response()->json([
                    'message' => 'El empleado no es chofer'
                ], 400);
            }

            // Obtener reservas confirmadas para esta ruta y fecha
            $reservasConfirmadas = Reserva::where('ruta_id', $request->ruta_id)
                ->whereDate('fecha_viaje', $request->fecha_operacion)
                ->whereHas('estadoReserva', function ($q) {
                    $q->whereIn('codigo', ['CONF', 'PEND']);
                })
                ->get();

            $totalPasajeros = $reservasConfirmadas->sum('pax_total');

            // Crear ruta ejecutada
            $rutaEjecutada = RutaEjecutada::create([
                'ruta_id' => $request->ruta_id,
                'vehiculo_id' => $request->vehiculo_id,
                'chofer_id' => $request->chofer_id,
                'chofer_apoyo_id' => $request->chofer_apoyo_id,
                'fecha_operacion' => $request->fecha_operacion,
                'hora_salida_programada' => $request->hora_salida_programada ?? $ruta->hora_salida,
                'capacidad_vehiculo' => $vehiculo->capacidad_pasajeros,
                'asientos_reservados' => $totalPasajeros,
                'estado' => 'programada',
                'situacion' => true
            ]);

            // Asociar las reservas a esta ruta ejecutada
            foreach ($reservasConfirmadas as $reserva) {
                $rutaEjecutada->reservas()->attach($reserva->id, [
                    'pasajero_abordo' => false,
                    'punto_pickup' => $reserva->hotel_pickup
                ]);
            }

            DB::commit();

            return new RutaEjecutadaResource($rutaEjecutada->load(['ruta', 'vehiculo', 'chofer.persona', 'reservas']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear ruta ejecutada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar ruta ejecutada específica
     */
    public function show($id)
    {
        try {
            $rutaEjecutada = RutaEjecutada::with([
                'ruta',
                'vehiculo',
                'chofer.persona',
                'choferApoyo.persona',
                'reservas.cliente.persona',
                'reservas.agencia'
            ])->findOrFail($id);

            return new RutaEjecutadaResource($rutaEjecutada);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Ruta ejecutada no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar ruta ejecutada
     */
    public function update(Request $request, $id)
    {
        $rutaEjecutada = RutaEjecutada::findOrFail($id);

        if ($rutaEjecutada->estado === 'completada') {
            return response()->json([
                'message' => 'No se puede modificar una ruta completada'
            ], 400);
        }

        $request->validate([
            'vehiculo_id' => 'sometimes|required|exists:vehiculos,id',
            'chofer_id' => 'sometimes|required|exists:empleados,id',
            'chofer_apoyo_id' => 'sometimes|nullable|exists:empleados,id',
            'hora_salida_programada' => 'sometimes|nullable|date_format:H:i',
            'observaciones' => 'sometimes|nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $rutaEjecutada->update($request->all());

            DB::commit();

            return new RutaEjecutadaResource($rutaEjecutada->fresh()->load(['ruta', 'vehiculo', 'chofer.persona']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar ruta ejecutada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar/Cancelar ruta ejecutada
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $rutaEjecutada = RutaEjecutada::findOrFail($id);

            if ($rutaEjecutada->estado !== 'programada') {
                return response()->json([
                    'message' => 'Solo se pueden cancelar rutas programadas'
                ], 400);
            }

            $rutaEjecutada->estado = 'cancelada';
            $rutaEjecutada->save();

            DB::commit();

            return response()->json([
                'message' => 'Ruta ejecutada cancelada correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al cancelar ruta ejecutada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Iniciar ruta
     */
    public function iniciar($id, Request $request)
    {
        $request->validate([
            'kilometraje_inicial' => 'required|integer|min:0',
            'combustible_inicial' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            $rutaEjecutada = RutaEjecutada::findOrFail($id);

            if ($rutaEjecutada->estado !== 'programada') {
                return response()->json([
                    'message' => 'La ruta no está en estado programada'
                ], 400);
            }

            $rutaEjecutada->iniciar($request->kilometraje_inicial, $request->combustible_inicial);

            DB::commit();

            return response()->json([
                'message' => 'Ruta iniciada correctamente',
                'data' => new RutaEjecutadaResource($rutaEjecutada->fresh())
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al iniciar ruta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Finalizar ruta
     */
    public function finalizar($id, Request $request)
    {
        $request->validate([
            'kilometraje_final' => 'required|integer|min:0',
            'combustible_final' => 'required|numeric|min:0',
            'costo_combustible' => 'nullable|numeric|min:0',
            'costo_peajes' => 'nullable|numeric|min:0',
            'observaciones' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $rutaEjecutada = RutaEjecutada::findOrFail($id);

            if ($rutaEjecutada->estado !== 'en_ruta') {
                return response()->json([
                    'message' => 'La ruta no está en curso'
                ], 400);
            }

            // Validar que el kilometraje final sea mayor al inicial
            if ($request->kilometraje_final <= $rutaEjecutada->kilometraje_inicial) {
                return response()->json([
                    'message' => 'El kilometraje final debe ser mayor al inicial'
                ], 400);
            }

            $rutaEjecutada->finalizar($request->kilometraje_final, $request->combustible_final);

            // Actualizar costos
            if ($request->has('costo_combustible')) {
                $rutaEjecutada->costo_combustible = $request->costo_combustible;
            }
            if ($request->has('costo_peajes')) {
                $rutaEjecutada->costo_peajes = $request->costo_peajes;
            }
            if ($request->has('observaciones')) {
                $rutaEjecutada->observaciones = $request->observaciones;
            }

            $rutaEjecutada->save();

            DB::commit();

            return response()->json([
                'message' => 'Ruta finalizada correctamente',
                'data' => new RutaEjecutadaResource($rutaEjecutada->fresh())
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al finalizar ruta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar pasajero como abordado
     */
    public function marcarAbordado($id, Request $request)
    {
        $request->validate([
            'reserva_id' => 'required|exists:reservas,id',
            'numero_asiento' => 'nullable|integer|min:1'
        ]);

        try {
            DB::beginTransaction();

            $rutaEjecutada = RutaEjecutada::findOrFail($id);

            if ($rutaEjecutada->estado !== 'en_ruta') {
                return response()->json([
                    'message' => 'La ruta debe estar en curso para marcar pasajeros'
                ], 400);
            }

            $rutaEjecutada->marcarPasajeroAbordo($request->reserva_id, $request->numero_asiento);

            DB::commit();

            return response()->json([
                'message' => 'Pasajero marcado como abordado',
                'data' => new RutaEjecutadaResource($rutaEjecutada->fresh()->load('reservas'))
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al marcar pasajero',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar pasajero como no show
     */
    public function marcarNoShow($id, Request $request)
    {
        $request->validate([
            'reserva_id' => 'required|exists:reservas,id'
        ]);

        try {
            DB::beginTransaction();

            $rutaEjecutada = RutaEjecutada::findOrFail($id);

            if ($rutaEjecutada->estado !== 'en_ruta') {
                return response()->json([
                    'message' => 'La ruta debe estar en curso para marcar no show'
                ], 400);
            }

            $rutaEjecutada->marcarNoShow($request->reserva_id);

            DB::commit();

            return response()->json([
                'message' => 'Pasajero marcado como no show',
                'data' => new RutaEjecutadaResource($rutaEjecutada->fresh()->load('reservas'))
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al marcar no show',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener lista de pasajeros para el chofer
     */
    public function listaPasajeros($id)
    {
        try {
            $rutaEjecutada = RutaEjecutada::with([
                'ruta',
                'reservas.cliente.persona',
                'reservas.agencia'
            ])->findOrFail($id);

            $listaPasajeros = $rutaEjecutada->reservas->map(function ($reserva) {
                return [
                    'reserva_id' => $reserva->id,
                    'numero_reserva' => $reserva->numero_reserva,
                    'pasajero' => $reserva->nombre_pasajero_principal,
                    'pax_total' => $reserva->pax_total,
                    'hotel' => $reserva->hotel_pickup,
                    'telefono' => $reserva->telefono_contacto,
                    'voucher' => $reserva->voucher,
                    'agencia' => $reserva->agencia ? $reserva->agencia->nombre_comercial : null,
                    'notas' => $reserva->notas_pickup,
                    'abordado' => $reserva->pivot->pasajero_abordo,
                    'asiento' => $reserva->pivot->numero_asiento
                ];
            });

            return response()->json([
                'ruta' => $rutaEjecutada->ruta->nombre_ruta,
                'fecha' => $rutaEjecutada->fecha_operacion,
                'vehiculo' => $rutaEjecutada->vehiculo->placa,
                'chofer' => $rutaEjecutada->chofer->nombre_completo,
                'total_pasajeros' => $rutaEjecutada->asientos_reservados,
                'pasajeros' => $listaPasajeros
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener lista de pasajeros',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
