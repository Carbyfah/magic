<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RutaActivada;
use App\Models\Vehiculo;
use App\Models\Estado;
use App\Http\Resources\RutaActivadaResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use PDF;
use App\Models\Reserva;

class RutaActivadaController extends Controller
{
    /**
     * LISTAR RUTAS ACTIVADAS
     */
    public function index(Request $request)
    {
        $query = RutaActivada::with(['persona', 'estado', 'servicio', 'ruta', 'vehiculo']);

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('ruta_activada_situacion', $request->boolean('activo'));
        }

        // Filtro por estado
        if ($request->filled('estado_id')) {
            $query->porEstado($request->estado_id);
        }

        // Filtro por usuario (conductor)
        if ($request->filled('persona_id')) {
            $query->porPersona($request->persona_id);
        }

        // Filtro por servicio
        if ($request->filled('servicio_id')) {
            $query->porServicio($request->servicio_id);
        }

        // Filtro por vehículo
        if ($request->filled('vehiculo_id')) {
            $query->porVehiculo($request->vehiculo_id);
        }

        // Filtro por fecha
        if ($request->filled('fecha')) {
            $query->porFecha($request->fecha);
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('ruta_activada_fecha_hora', 'desc');

        $rutasActivadas = $query->get();

        return RutaActivadaResource::collection($rutasActivadas);
    }

    /**
     * CREAR RUTA ACTIVADA - IMPLEMENTA LÓGICA AUTOMÁTICA
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ruta_activada_codigo' => 'sometimes|string|max:45|unique:ruta_activada',
            'ruta_activada_fecha_hora' => 'required|date',
            'persona_id' => 'required|exists:persona,persona_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'ruta_id' => 'required|exists:ruta,ruta_id',
            'vehiculo_id' => 'required|exists:vehiculo,vehiculo_id',
            'ruta_activada_situacion' => 'sometimes|boolean'
        ]);

        // NUEVA: Validar que el vehículo esté disponible
        $vehiculo = Vehiculo::with('estado')->find($validated['vehiculo_id']);
        if (!$vehiculo) {
            return response()->json([
                'message' => 'Vehículo no encontrado',
                'errors' => ['vehiculo_id' => ['Vehículo no existe']]
            ], 422);
        }

        // Verificar que el vehículo esté disponible (no asignado)
        $esVehiculoDisponible = $vehiculo->estado &&
            (stripos($vehiculo->estado->estado_estado, 'disponible') !== false);

        if (!$esVehiculoDisponible) {
            return response()->json([
                'message' => 'Solo se pueden asignar vehículos en estado "Disponible"',
                'errors' => ['vehiculo_id' => ['Este vehículo no está disponible para asignar']]
            ], 422);
        }

        // Generar código automáticamente si no viene
        $validated['ruta_activada_codigo'] = $validated['ruta_activada_codigo'] ?? RutaActivada::generarCodigo();
        $validated['ruta_activada_situacion'] = $validated['ruta_activada_situacion'] ?? true;

        // Validar disponibilidad del vehículo en esa fecha/hora
        if (!empty($validated['vehiculo_id']) && !empty($validated['ruta_activada_fecha_hora'])) {
            $fecha = date('Y-m-d', strtotime($validated['ruta_activada_fecha_hora']));
            $hora = date('H:i', strtotime($validated['ruta_activada_fecha_hora']));

            if (!RutaActivada::esVehiculoDisponible($validated['vehiculo_id'], $fecha, $hora)) {
                return response()->json([
                    'message' => 'El vehículo ya está asignado en esa fecha y hora',
                    'errors' => ['vehiculo_id' => ['Este vehículo ya está ocupado']]
                ], 422);
            }
        }

        // Crear la ruta activada
        $rutaActivada = RutaActivada::create($validated);

        // NUEVA LÓGICA: Cambiar automáticamente el vehículo a "Asignado"
        $this->cambiarVehiculoAAsignado($vehiculo);

        $rutaActivada->load(['persona', 'estado', 'servicio', 'ruta', 'vehiculo']);

        return new RutaActivadaResource($rutaActivada);
    }

    /**
     * VER RUTA ACTIVADA ESPECÍFICA
     */
    public function show(RutaActivada $rutaActivada)
    {
        $rutaActivada->load(['persona', 'estado', 'servicio', 'ruta', 'vehiculo', 'reservas']);

        $detallesCapacidad = $rutaActivada->verificarDisponibilidad(0);

        $response = new RutaActivadaResource($rutaActivada);
        $response->additional([
            'estado_actual' => $rutaActivada->estado_nombre,
            'capacidad_detallada' => [
                'capacidad_total' => $detallesCapacidad['capacidad_total'],
                'total_reservas' => $rutaActivada->total_reservas_activas, // Abstracto
                'total_pasajeros' => $rutaActivada->total_pasajeros,
                'asientos_libres' => $rutaActivada->capacidad_disponible,
                'porcentaje_ocupacion' => $rutaActivada->porcentaje_ocupacion,
                'puede_acomodar' => $detallesCapacidad['puede_acomodar'],
                'status' => $rutaActivada->status_disponibilidad
            ]
        ]);

        return $response;
    }

    /**
     * ACTUALIZAR RUTA ACTIVADA - CON VALIDACIONES MEJORADAS
     */
    public function update(Request $request, RutaActivada $rutaActivada)
    {
        $validated = $request->validate([
            'ruta_activada_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('ruta_activada')->ignore($rutaActivada->ruta_activada_id, 'ruta_activada_id')
            ],
            'ruta_activada_fecha_hora' => 'required|date',
            'persona_id' => 'required|exists:persona,persona_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'ruta_id' => 'required|exists:ruta,ruta_id',
            'vehiculo_id' => 'required|exists:vehiculo,vehiculo_id',
            'ruta_activada_situacion' => 'sometimes|boolean'
        ]);

        // NUEVA: Si cambió el vehículo, validar disponibilidad del nuevo
        if (isset($validated['vehiculo_id']) && $validated['vehiculo_id'] != $rutaActivada->vehiculo_id) {
            $nuevoVehiculo = Vehiculo::with('estado')->find($validated['vehiculo_id']);

            $esVehiculoDisponible = $nuevoVehiculo->estado &&
                (stripos($nuevoVehiculo->estado->estado_estado, 'disponible') !== false);

            if (!$esVehiculoDisponible) {
                return response()->json([
                    'message' => 'Solo se pueden asignar vehículos en estado "Disponible"',
                    'errors' => ['vehiculo_id' => ['Este vehículo no está disponible para asignar']]
                ], 422);
            }

            // Cambiar nuevo vehículo a asignado y liberar el anterior
            $vehiculoAnterior = $rutaActivada->vehiculo;
            $this->cambiarVehiculoAAsignado($nuevoVehiculo);
            if ($vehiculoAnterior) {
                $this->liberarVehiculo($vehiculoAnterior);
            }
        }

        // Validar disponibilidad del vehículo si cambió fecha/hora
        if (!empty($validated['vehiculo_id']) && !empty($validated['ruta_activada_fecha_hora'])) {
            $fecha = date('Y-m-d', strtotime($validated['ruta_activada_fecha_hora']));
            $hora = date('H:i', strtotime($validated['ruta_activada_fecha_hora']));

            if (!RutaActivada::esVehiculoDisponible($validated['vehiculo_id'], $fecha, $hora, $rutaActivada->ruta_activada_id)) {
                return response()->json([
                    'message' => 'El vehículo ya está asignado en esa fecha y hora',
                    'errors' => ['vehiculo_id' => ['Este vehículo ya está ocupado']]
                ], 422);
            }
        }

        $rutaActivada->update($validated);
        $rutaActivada->load(['persona', 'estado', 'servicio', 'ruta', 'vehiculo']);

        return new RutaActivadaResource($rutaActivada);
    }

    /**
     * ELIMINAR RUTA ACTIVADA (Solo si no tiene reservas) - LIBERA VEHÍCULO
     */
    public function destroy(RutaActivada $rutaActivada)
    {
        if (!$rutaActivada->puedeSerEliminada()) {
            return response()->json([
                'message' => 'No se puede eliminar esta ruta porque tiene reservas asociadas.'
            ], 409);
        }

        // NUEVA LÓGICA: Liberar el vehículo automáticamente
        if ($rutaActivada->vehiculo) {
            $this->liberarVehiculo($rutaActivada->vehiculo);
        }

        $rutaActivada->delete();

        return response()->json(['message' => 'Ruta activada eliminada exitosamente']);
    }

    /**
     * ACTIVAR RUTA ACTIVADA
     */
    public function activate(RutaActivada $rutaActivada)
    {
        $rutaActivada->update(['ruta_activada_situacion' => 1]);
        $rutaActivada->load(['persona', 'estado', 'servicio', 'ruta', 'vehiculo']);

        return new RutaActivadaResource($rutaActivada);
    }

    /**
     * DESACTIVAR RUTA ACTIVADA - CON VALIDACIÓN DE RESERVAS
     */
    public function deactivate(RutaActivada $rutaActivada)
    {
        // Validar si tiene reservas activas
        if ($rutaActivada->tieneReservasActivas()) {
            return response()->json([
                'message' => 'No se puede desactivar una ruta que tiene reservas activas.'
            ], 409);
        }

        // NUEVA LÓGICA: Liberar el vehículo automáticamente al desactivar
        if ($rutaActivada->vehiculo) {
            $this->liberarVehiculo($rutaActivada->vehiculo);
        }

        $rutaActivada->update(['ruta_activada_situacion' => 0]);
        $rutaActivada->load(['persona', 'estado', 'servicio', 'ruta', 'vehiculo']);

        return new RutaActivadaResource($rutaActivada);
    }

    /**
     * NUEVA: CERRAR RUTA - VALIDA QUE VEHÍCULO ESTÉ DISPONIBLE
     */
    public function cerrarRuta(RutaActivada $rutaActivada)
    {
        // Validar que el vehículo ya esté disponible (regresó)
        $vehiculo = $rutaActivada->vehiculo()->with('estado')->first();

        if (!$vehiculo) {
            return response()->json([
                'message' => 'No se puede cerrar: ruta no tiene vehículo asignado'
            ], 409);
        }

        $esVehiculoDisponible = $vehiculo->estado &&
            (stripos($vehiculo->estado->estado_estado, 'disponible') !== false);

        if (!$esVehiculoDisponible) {
            return response()->json([
                'message' => 'No se puede cerrar la ruta: el vehículo aún no ha regresado (debe estar "Disponible")',
                'detalles' => [
                    'vehiculo_placa' => $vehiculo->vehiculo_placa,
                    'estado_actual' => $vehiculo->estado->estado_estado ?? 'Sin estado',
                    'instruccion' => 'Cambie manualmente el estado del vehículo a "Disponible" antes de cerrar la ruta'
                ]
            ], 409);
        }

        // Cambiar estado de la ruta a "Cerrada"
        $estadoCerrada = Estado::where('estado_codigo', 'LIKE', 'RUT-%')
            ->where(function ($query) {
                $query->where('estado_estado', 'LIKE', '%cerrada%')
                    ->orWhere('estado_estado', 'LIKE', '%completada%')
                    ->orWhere('estado_estado', 'LIKE', '%finalizada%');
            })
            ->first();

        if ($estadoCerrada) {
            $rutaActivada->update(['estado_id' => $estadoCerrada->estado_id]);
        }

        $rutaActivada->load(['persona', 'estado', 'servicio', 'ruta', 'vehiculo']);

        return new RutaActivadaResource($rutaActivada);
    }

    /**
     * NUEVA: VERIFICAR Y ACTUALIZAR CAPACIDAD AUTOMÁTICAMENTE
     */
    public function verificarCapacidad(RutaActivada $rutaActivada)
    {
        $rutaActivada->load(['vehiculo', 'estado']);

        // Calcular ocupación actual
        $ocupacionActual = $rutaActivada->total_pasajeros;
        $capacidadTotal = $rutaActivada->vehiculo?->vehiculo_capacidad ?? 0;

        if ($capacidadTotal > 0 && $ocupacionActual >= $capacidadTotal) {
            // Cambiar automáticamente a estado "Llena"
            $estadoLlena = Estado::where('estado_codigo', 'LIKE', 'RUT-%')
                ->where(function ($query) {
                    $query->where('estado_estado', 'LIKE', '%llena%')
                        ->orWhere('estado_estado', 'LIKE', '%completa%')
                        ->orWhere('estado_estado', 'LIKE', '%ocupada%');
                })
                ->first();

            if ($estadoLlena && $rutaActivada->estado_id !== $estadoLlena->estado_id) {
                $rutaActivada->update(['estado_id' => $estadoLlena->estado_id]);

                return response()->json([
                    'capacidad_excedida' => true,
                    'mensaje' => 'Ruta cambiada automáticamente a estado "Llena"',
                    'ocupacion_actual' => $ocupacionActual,
                    'capacidad_total' => $capacidadTotal
                ]);
            }
        }

        return response()->json([
            'capacidad_excedida' => false,
            'ocupacion_actual' => $ocupacionActual,
            'capacidad_total' => $capacidadTotal,
            'espacios_disponibles' => max(0, $capacidadTotal - $ocupacionActual)
        ]);
    }

    /**
     * VERIFICAR DISPONIBILIDAD DE CÓDIGO
     */
    public function verificarCodigo(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string',
            'except_id' => 'nullable|integer'
        ]);

        $disponible = RutaActivada::where('ruta_activada_codigo', $request->codigo)
            ->when($request->except_id, function ($query, $exceptId) {
                return $query->where('ruta_activada_id', '!=', $exceptId);
            })
            ->doesntExist();

        return response()->json([
            'disponible' => $disponible,
            'message' => $disponible ? 'Código disponible' : 'Código ya está en uso'
        ]);
    }

    /**
     * OBTENER RUTAS POR PERSONA (CONDUCTOR)
     */
    public function porPersona(Request $request, $personaId)
    {
        $query = RutaActivada::with(['persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->porPersona($personaId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $rutasActivadas = $query->orderBy('ruta_activada_fecha_hora', 'desc')->get();

        return RutaActivadaResource::collection($rutasActivadas);
    }

    /**
     * OBTENER RUTAS POR ESTADO
     */
    public function porEstado(Request $request, $estadoId)
    {
        $query = RutaActivada::with(['persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->porEstado($estadoId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $rutasActivadas = $query->orderBy('ruta_activada_fecha_hora', 'desc')->get();

        return RutaActivadaResource::collection($rutasActivadas);
    }

    /**
     * OBTENER RUTAS POR SERVICIO
     */
    public function porServicio(Request $request, $servicioId)
    {
        $query = RutaActivada::with(['persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->porServicio($servicioId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $rutasActivadas = $query->orderBy('ruta_activada_fecha_hora', 'desc')->get();

        return RutaActivadaResource::collection($rutasActivadas);
    }

    /**
     * OBTENER RUTAS POR VEHÍCULO
     */
    public function porVehiculo(Request $request, $vehiculoId)
    {
        $query = RutaActivada::with(['persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->porVehiculo($vehiculoId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $rutasActivadas = $query->orderBy('ruta_activada_fecha_hora', 'desc')->get();

        return RutaActivadaResource::collection($rutasActivadas);
    }

    /**
     * OBTENER RUTAS POR FECHA
     */
    public function porFecha(Request $request, $fecha)
    {
        $query = RutaActivada::with(['persona', 'estado', 'servicio', 'ruta', 'vehiculo'])
            ->porFecha($fecha)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $rutasActivadas = $query->orderBy('ruta_activada_fecha_hora', 'asc')->get();

        return RutaActivadaResource::collection($rutasActivadas);
    }

    /**
     * GENERAR LISTA PDF PARA CONDUCTOR
     */
    public function generarListaConductor(RutaActivada $rutaActivada)
    {
        $rutaActivada->load(['ruta', 'vehiculo', 'servicio', 'persona']);

        $reservas = \App\Models\Reserva::where('ruta_activada_id', $rutaActivada->ruta_activada_id)
            ->where('reserva_situacion', 1)
            ->with(['estado', 'agencia'])
            ->orderBy('reserva_nombres_cliente', 'asc')
            ->get();

        $totales = [
            'total_reservas' => $reservas->count(),
            'total_pasajeros' => $reservas->sum('reserva_cantidad_adultos') + $reservas->sum('reserva_cantidad_ninos'),
            'confirmadas' => $reservas->filter(function ($reserva) {
                return stripos($reserva->estado->estado_estado, 'confirm') !== false;
            })->count(),
            'pendientes' => $reservas->filter(function ($reserva) {
                return stripos($reserva->estado->estado_estado, 'pendiente') !== false;
            })->count(),
        ];

        $pdf = \PDF::loadView('vouchers.conductor', [
            'rutaActivada' => $rutaActivada,
            'reservas' => $reservas,
            'totales' => $totales
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = "lista-conductor-{$rutaActivada->ruta_activada_codigo}-" . date('Y-m-d') . ".pdf";

        return $pdf->download($filename);
    }

    // =====================================
    // MÉTODOS PRIVADOS PARA LÓGICA AUTOMÁTICA
    // =====================================

    /**
     * Cambiar vehículo automáticamente a estado "Asignado"
     */
    private function cambiarVehiculoAAsignado(Vehiculo $vehiculo)
    {
        try {
            // Buscar estado "Asignado" para vehículos
            $estadoAsignado = Estado::where('estado_codigo', 'LIKE', 'VEH-%')
                ->where(function ($query) {
                    $query->where('estado_estado', 'LIKE', '%asignado%')
                        ->orWhere('estado_estado', 'LIKE', '%ocupado%')
                        ->orWhere('estado_estado', 'LIKE', '%ruta%');
                })
                ->first();

            if ($estadoAsignado && $vehiculo->estado_id !== $estadoAsignado->estado_id) {
                $vehiculo->update(['estado_id' => $estadoAsignado->estado_id]);
                \Log::info("Vehículo {$vehiculo->vehiculo_placa} cambiado automáticamente a estado 'Asignado'");
            }
        } catch (\Exception $e) {
            \Log::warning("Error cambiando vehículo a asignado: " . $e->getMessage());
        }
    }

    /**
     * Liberar vehículo automáticamente a estado "Disponible"
     */
    private function liberarVehiculo(Vehiculo $vehiculo)
    {
        try {
            // Buscar estado "Disponible" para vehículos
            $estadoDisponible = Estado::where('estado_codigo', 'LIKE', 'VEH-%')
                ->where(function ($query) {
                    $query->where('estado_estado', 'LIKE', '%disponible%')
                        ->orWhere('estado_estado', 'LIKE', '%activo%')
                        ->orWhere('estado_estado', 'LIKE', '%operativo%');
                })
                ->first();

            if ($estadoDisponible && $vehiculo->estado_id !== $estadoDisponible->estado_id) {
                $vehiculo->update(['estado_id' => $estadoDisponible->estado_id]);
                \Log::info("Vehículo {$vehiculo->vehiculo_placa} liberado automáticamente a estado 'Disponible'");
            }
        } catch (\Exception $e) {
            \Log::warning("Error liberando vehículo: " . $e->getMessage());
        }
    }

    /**
     * OBTENER NOTIFICACIONES INTELIGENTES DE LA RUTA
     */
    public function obtenerNotificaciones(RutaActivada $rutaActivada)
    {
        $rutaActivada->load(['vehiculo', 'estado']);
        $notificaciones = $rutaActivada->obtenerNotificacionesInteligentes();

        return response()->json([
            'ruta_id' => $rutaActivada->ruta_activada_id,
            'codigo' => $rutaActivada->ruta_activada_codigo,
            'estado_actual' => $rutaActivada->estado_nombre,
            'notificaciones' => $notificaciones
        ]);
    }

    /**
     * VALIDAR ANTES DE AGREGAR RESERVA
     */
    public function validarAgregarReserva(Request $request, RutaActivada $rutaActivada)
    {
        $request->validate([
            'adultos' => 'required|integer|min:1',
            'ninos' => 'nullable|integer|min:0'
        ]);

        $rutaActivada->load(['vehiculo', 'estado']);
        $validacion = $rutaActivada->validarAntesDeAgregarReserva(
            $request->adultos,
            $request->ninos ?? 0
        );

        return response()->json($validacion);
    }

    /**
     * PROCESAR DESPUES DE AGREGAR RESERVA (llamar desde ReservaController)
     */
    public function procesarDespuesReserva(RutaActivada $rutaActivada)
    {
        $rutaActivada->load(['vehiculo', 'estado']);
        $notificaciones = $rutaActivada->procesarDespuesDeAgregarReserva();

        return response()->json([
            'procesado' => true,
            'notificaciones' => $notificaciones
        ]);
    }
}
