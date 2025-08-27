<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RutaActivadaResource;
use App\Models\RutaActivada;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class RutaActivadaController extends Controller
{
    public function index(Request $request)
    {
        $query = RutaActivada::query();

        if ($request->filled('activo')) {
            $query->where('ruta_activada_situacion', $request->boolean('activo'));
        }

        if ($request->filled('fecha')) {
            $query->whereDate('ruta_activada_fecha', $request->fecha);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('ruta_activada_fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('ruta_activada_fecha', '<=', $request->fecha_hasta);
        }

        if ($request->filled('hoy')) {
            if ($request->boolean('hoy')) {
                $query->hoy();
            }
        }

        if ($request->filled('estado')) {
            $query->whereHas('estado', function ($q) use ($request) {
                $q->where('estado_codigo', $request->estado);
            });
        }

        if ($request->filled('chofer_id')) {
            $query->where('usuario_id', $request->chofer_id);
        }

        if ($request->filled('vehiculo_id')) {
            $query->where('vehiculo_id', $request->vehiculo_id);
        }

        if ($request->filled('servicio_id')) {
            $query->where('servicio_id', $request->servicio_id);
        }

        if ($request->filled('disponibles')) {
            if ($request->boolean('disponibles')) {
                $query->disponibles();
            }
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('ruta_activada_codigo', 'like', "%{$request->search}%")
                    ->orWhereHas('ruta', function ($subq) use ($request) {
                        $subq->where('ruta_origen', 'like', "%{$request->search}%")
                            ->orWhere('ruta_destino', 'like', "%{$request->search}%");
                    });
            });
        }

        if ($request->has('with_relations')) {
            $query->with(['usuario.persona', 'estado', 'servicio', 'ruta', 'vehiculo']);
        }

        if ($request->has('with_reservas')) {
            $query->with('reservasActivas.estado');
        }

        if ($request->has('include_operativo')) {
            $request->request->add(['include_operativo' => true]);
        }

        $sortField = $request->get('sort', 'ruta_activada_fecha');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return RutaActivadaResource::collection($query->get());
        }

        $rutasActivadas = $query->paginate($request->get('per_page', 15));
        return RutaActivadaResource::collection($rutasActivadas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ruta_activada_codigo' => 'nullable|string|max:45|unique:ruta_activada',
            'ruta_activada_fecha' => 'required|date|after_or_equal:today',
            'ruta_activada_hora' => 'required|date_format:H:i',
            'ruta_activada_situacion' => 'boolean',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'ruta_id' => 'required|exists:ruta,ruta_id',
            'vehiculo_id' => 'required|exists:vehiculo,vehiculo_id'
        ]);

        // Verificar que el vehículo esté disponible
        $vehiculo = \App\Models\Vehiculo::find($validated['vehiculo_id']);
        if (!$vehiculo->estaDisponible()) {
            return response()->json([
                'message' => 'El vehículo seleccionado no está disponible'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Convertir hora a datetime
        $validated['ruta_activada_hora'] = \Carbon\Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['ruta_activada_fecha'] . ' ' . $validated['ruta_activada_hora']
        );

        $rutaActivada = RutaActivada::create($validated);

        if (!$validated['ruta_activada_codigo']) {
            $rutaActivada->ruta_activada_codigo = $rutaActivada->generarCodigoUnico();
            $rutaActivada->save();
        }

        // Marcar vehículo como ocupado
        $vehiculo->marcarOcupado();

        $rutaActivada->load(['usuario.persona', 'estado', 'servicio', 'ruta', 'vehiculo']);
        return new RutaActivadaResource($rutaActivada);
    }

    public function show(RutaActivada $rutaActivada)
    {
        $rutaActivada->load([
            'usuario.persona',
            'estado',
            'servicio',
            'ruta',
            'vehiculo',
            'reservasActivas.estado',
            'reservasActivas.agencia'
        ]);
        return new RutaActivadaResource($rutaActivada);
    }

    public function update(Request $request, RutaActivada $rutaActivada)
    {
        $validated = $request->validate([
            'ruta_activada_codigo' => [
                'nullable',
                'string',
                'max:45',
                Rule::unique('ruta_activada')->ignore($rutaActivada->ruta_activada_id, 'ruta_activada_id')
            ],
            'ruta_activada_fecha' => 'required|date',
            'ruta_activada_hora' => 'required|date_format:H:i',
            'ruta_activada_situacion' => 'boolean',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'ruta_id' => 'required|exists:ruta,ruta_id',
            'vehiculo_id' => 'required|exists:vehiculo,vehiculo_id'
        ]);

        // Si cambió el vehículo, verificar disponibilidad
        if ($validated['vehiculo_id'] != $rutaActivada->vehiculo_id) {
            $nuevoVehiculo = \App\Models\Vehiculo::find($validated['vehiculo_id']);
            if (!$nuevoVehiculo->estaDisponible()) {
                return response()->json([
                    'message' => 'El nuevo vehículo seleccionado no está disponible'
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // Convertir hora a datetime
        $validated['ruta_activada_hora'] = \Carbon\Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['ruta_activada_fecha'] . ' ' . $validated['ruta_activada_hora']
        );

        $rutaActivada->update($validated);
        $rutaActivada->load(['usuario.persona', 'estado', 'servicio', 'ruta', 'vehiculo']);

        return new RutaActivadaResource($rutaActivada);
    }

    public function destroy(RutaActivada $rutaActivada)
    {
        // Verificar si tiene reservas
        if ($rutaActivada->reservas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar esta ruta activada porque tiene reservas asociadas.'
            ], Response::HTTP_CONFLICT);
        }

        // Liberar vehículo si estaba ocupado
        if ($rutaActivada->vehiculo && $rutaActivada->vehiculo->estaOcupado()) {
            $rutaActivada->vehiculo->marcarDisponible();
        }

        $rutaActivada->delete();

        return response()->json([
            'message' => 'Ruta activada eliminada exitosamente'
        ]);
    }

    public function cambiarEstado(Request $request, RutaActivada $rutaActivada)
    {
        $validated = $request->validate([
            'estado_codigo' => 'required|exists:estado,estado_codigo'
        ]);

        try {
            $rutaActivada->cambiarEstado($validated['estado_codigo']);
            $rutaActivada->load('estado');

            return new RutaActivadaResource($rutaActivada);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    public function iniciar(RutaActivada $rutaActivada)
    {
        try {
            $rutaActivada->iniciarRuta();
            return new RutaActivadaResource($rutaActivada->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function finalizar(RutaActivada $rutaActivada)
    {
        try {
            $rutaActivada->finalizarRuta();

            // Liberar vehículo
            if ($rutaActivada->vehiculo) {
                $rutaActivada->vehiculo->marcarDisponible();
            }

            return new RutaActivadaResource($rutaActivada->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function cancelar(RutaActivada $rutaActivada)
    {
        try {
            $rutaActivada->cancelarRuta();

            // Liberar vehículo
            if ($rutaActivada->vehiculo) {
                $rutaActivada->vehiculo->marcarDisponible();
            }

            return new RutaActivadaResource($rutaActivada->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function verificarCapacidad(Request $request, RutaActivada $rutaActivada)
    {
        $validated = $request->validate([
            'pasajeros' => 'required|integer|min:1|max:100'
        ]);

        $puedeAcomodar = $rutaActivada->puedeAcomodar($validated['pasajeros']);

        return response()->json([
            'ruta_activada' => new RutaActivadaResource($rutaActivada),
            'solicitud_pasajeros' => $validated['pasajeros'],
            'puede_acomodar' => $puedeAcomodar,
            'ocupacion_actual' => $rutaActivada->ocupacion_actual,
            'espacios_disponibles' => $rutaActivada->espacios_disponibles,
            'porcentaje_ocupacion' => $rutaActivada->porcentaje_ocupacion
        ]);
    }

    public function resumenOperativo(RutaActivada $rutaActivada)
    {
        $resumen = $rutaActivada->resumenOperativo();

        return response()->json($resumen);
    }

    public function hoy()
    {
        $rutasHoy = RutaActivada::hoy()
            ->with(['usuario.persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->orderBy('ruta_activada_hora')
            ->get();

        return RutaActivadaResource::collection($rutasHoy);
    }

    public function programadas()
    {
        $rutasProgramadas = RutaActivada::programadas()
            ->with(['usuario.persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->orderBy('ruta_activada_fecha')
            ->orderBy('ruta_activada_hora')
            ->get();

        return RutaActivadaResource::collection($rutasProgramadas);
    }

    public function disponibles()
    {
        $rutasDisponibles = RutaActivada::disponibles()
            ->with(['usuario.persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->orderBy('ruta_activada_fecha')
            ->orderBy('ruta_activada_hora')
            ->get();

        return RutaActivadaResource::collection($rutasDisponibles);
    }

    public function porChofer($choferId)
    {
        $rutasChofer = RutaActivada::where('usuario_id', $choferId)
            ->with(['estado', 'servicio', 'ruta', 'vehiculo'])
            ->whereIn('estado_id', function ($query) {
                $query->select('estado_id')
                    ->from('estado')
                    ->whereIn('estado_codigo', ['RUT_PROG', 'RUT_INIC']);
            })
            ->orderBy('ruta_activada_fecha')
            ->orderBy('ruta_activada_hora')
            ->get();

        return RutaActivadaResource::collection($rutasChofer);
    }

    public function stats()
    {
        $stats = [
            'total' => RutaActivada::count(),
            'activas' => RutaActivada::activo()->count(),
            'hoy' => RutaActivada::hoy()->count(),
            'por_estado' => [
                'programadas' => RutaActivada::programadas()->count(),
                'iniciadas' => RutaActivada::iniciadas()->count(),
                'finalizadas' => RutaActivada::finalizadas()->count()
            ],
            'ocupacion_promedio' => RutaActivada::activo()
                ->get()
                ->avg(function ($ruta) {
                    return $ruta->porcentaje_ocupacion;
                }),
            'ingresos_hoy' => RutaActivada::hoy()
                ->get()
                ->sum(function ($ruta) {
                    return $ruta->getIngresoTotal();
                })
        ];

        return response()->json($stats);
    }
}
