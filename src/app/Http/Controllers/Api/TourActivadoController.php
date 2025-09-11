<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TourActivado;
use App\Models\Persona;
use App\Http\Resources\TourActivadoResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use PDF;
use App\Models\Reserva;

class TourActivadoController extends Controller
{
    /**
     * LISTAR TOURS ACTIVADOS
     */
    public function index(Request $request)
    {
        $query = TourActivado::with(['persona', 'servicio']);

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('tour_activado_situacion', $request->boolean('activo'));
        }

        // Filtro por guía
        if ($request->filled('persona_id')) {
            $query->porPersona($request->persona_id);
        }

        // Filtro por servicio
        if ($request->filled('servicio_id')) {
            $query->porServicio($request->servicio_id);
        }

        // NUEVO: Filtro por tipo de guía
        if ($request->filled('tipo_guia')) {
            if ($request->tipo_guia === 'interno') {
                $query->conGuia();
            } elseif ($request->tipo_guia === 'externo') {
                $query->sinGuia();
            }
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
        $query->orderBy('tour_activado_fecha_hora', 'desc');

        $toursActivados = $query->get();

        return TourActivadoResource::collection($toursActivados);
    }

    /**
     * CREAR TOUR ACTIVADO - CON VALIDACIONES ESPECÍFICAS
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tour_activado_codigo' => 'sometimes|string|max:45|unique:tour_activado',
            'tour_activado_fecha_hora' => 'required|date',
            'tour_activado_descripcion' => 'nullable|string|max:255',
            'tour_activado_punto_encuentro' => 'nullable|string|max:255',
            'tour_activado_duracion_horas' => 'nullable|numeric|min:0|max:24',
            'persona_id' => 'nullable|exists:persona,persona_id', // Guía opcional
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'tour_activado_situacion' => 'sometimes|boolean'
        ]);

        // Validar disponibilidad del guía si se asigna uno interno
        if (!empty($validated['persona_id']) && !empty($validated['tour_activado_fecha_hora'])) {
            $fecha = date('Y-m-d', strtotime($validated['tour_activado_fecha_hora']));
            $hora = date('H:i', strtotime($validated['tour_activado_fecha_hora']));

            if (!TourActivado::esGuiaDisponible($validated['persona_id'], $fecha, $hora)) {
                return response()->json([
                    'message' => 'El guía ya está asignado a otro tour en esa fecha y hora',
                    'errors' => ['persona_id' => ['Este guía ya está ocupado']]
                ], 422);
            }
        }

        // Establecer valor por defecto para duración
        if (!isset($validated['tour_activado_duracion_horas'])) {
            $validated['tour_activado_duracion_horas'] = 2.0; // 2 horas por defecto
        }

        // Generar código automáticamente si no viene
        $validated['tour_activado_codigo'] = $validated['tour_activado_codigo'] ?? TourActivado::generarCodigo();
        $validated['tour_activado_situacion'] = $validated['tour_activado_situacion'] ?? true;

        // Crear el tour activado
        $tourActivado = TourActivado::create($validated);

        $tourActivado->load(['persona', 'servicio']);

        return new TourActivadoResource($tourActivado);
    }

    /**
     * VER TOUR ACTIVADO ESPECÍFICO
     */
    public function show(TourActivado $tourActivado)
    {
        $tourActivado->load(['persona', 'servicio', 'reservas']);

        $detallesDisponibilidad = $tourActivado->verificarDisponibilidadTour();

        $response = new TourActivadoResource($tourActivado);
        $response->additional([
            'disponibilidad_detallada' => [
                'tipo' => 'tour',
                'total_reservas' => $tourActivado->total_reservas_activas,
                'total_pasajeros' => $tourActivado->total_pasajeros,
                'sin_limite_capacidad' => true,
                'siempre_disponible' => true,
                'detalles' => $detallesDisponibilidad
            ],
            'info_guia' => [
                'tiene_guia_asignado' => $tourActivado->tieneGuiaAsignado(),
                'es_guia_externo' => $tourActivado->esGuiaExterno(),
                'nombre_guia' => $tourActivado->guia_nombre
            ],
            'completitud' => [
                'descripcion_completa' => $tourActivado->tieneDescripcionCompleta(),
                'tiene_descripcion' => !empty($tourActivado->tour_activado_descripcion),
                'tiene_punto_encuentro' => !empty($tourActivado->tour_activado_punto_encuentro),
                'tiene_duracion' => !empty($tourActivado->tour_activado_duracion_horas)
            ]
        ]);

        return $response;
    }

    /**
     * ACTUALIZAR TOUR ACTIVADO - CON VALIDACIONES MEJORADAS
     */
    public function update(Request $request, TourActivado $tourActivado)
    {
        $validated = $request->validate([
            'tour_activado_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('tour_activado')->ignore($tourActivado->tour_activado_id, 'tour_activado_id')
            ],
            'tour_activado_fecha_hora' => 'required|date',
            'tour_activado_descripcion' => 'nullable|string|max:255',
            'tour_activado_punto_encuentro' => 'nullable|string|max:255',
            'tour_activado_duracion_horas' => 'nullable|numeric|min:0|max:24',
            'persona_id' => 'nullable|exists:persona,persona_id',
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'tour_activado_situacion' => 'sometimes|boolean'
        ]);

        // Validar disponibilidad del guía si se asigna uno diferente
        if (
            isset($validated['persona_id']) &&
            $validated['persona_id'] != $tourActivado->persona_id &&
            !empty($validated['persona_id'])
        ) {

            $fecha = date('Y-m-d', strtotime($validated['tour_activado_fecha_hora']));
            $hora = date('H:i', strtotime($validated['tour_activado_fecha_hora']));

            if (!TourActivado::esGuiaDisponible($validated['persona_id'], $fecha, $hora, $tourActivado->tour_activado_id)) {
                return response()->json([
                    'message' => 'El guía ya está asignado a otro tour en esa fecha y hora',
                    'errors' => ['persona_id' => ['Este guía ya está ocupado']]
                ], 422);
            }
        }

        $tourActivado->update($validated);
        $tourActivado->load(['persona', 'servicio']);

        return new TourActivadoResource($tourActivado);
    }

    /**
     * ELIMINAR TOUR ACTIVADO (Solo si no tiene reservas)
     */
    public function destroy(TourActivado $tourActivado)
    {
        if (!$tourActivado->puedeSerEliminada()) {
            return response()->json([
                'message' => 'No se puede eliminar este tour porque tiene reservas asociadas.'
            ], 409);
        }

        $tourActivado->delete();

        return response()->json(['message' => 'Tour activado eliminado exitosamente']);
    }

    /**
     * CERRAR TOUR - PROCESO SIMPLIFICADO (SIN VEHÍCULO)
     */
    public function cerrarTour(TourActivado $tourActivado)
    {
        // Simplemente marcar como inactivo
        $tourActivado->update(['tour_activado_situacion' => 0]);
        $tourActivado->load(['persona', 'servicio']);

        return response()->json([
            'message' => 'Tour cerrado exitosamente',
            'tour' => new TourActivadoResource($tourActivado)
        ]);
    }

    /**
     * VERIFICAR DISPONIBILIDAD DEL TOUR (SIEMPRE DISPONIBLE)
     */
    public function verificarDisponibilidad(TourActivado $tourActivado)
    {

        $totalPasajeros = $tourActivado->total_pasajeros;
        $totalReservas = $tourActivado->total_reservas_activas;

        return response()->json([
            'siempre_disponible' => true,
            'sin_limite_capacidad' => true,
            'total_pasajeros' => $totalPasajeros,
            'total_reservas' => $totalReservas,
            'puede_recibir_mas' => true,
            'mensaje' => 'Los tours no tienen límite de capacidad'
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

        $disponible = TourActivado::where('tour_activado_codigo', $request->codigo)
            ->when($request->except_id, function ($query, $exceptId) {
                return $query->where('tour_activado_id', '!=', $exceptId);
            })
            ->doesntExist();

        return response()->json([
            'disponible' => $disponible,
            'message' => $disponible ? 'Código disponible' : 'Código ya está en uso'
        ]);
    }

    /**
     * OBTENER TOURS POR PERSONA (GUÍA)
     */
    public function porPersona(Request $request, $personaId)
    {
        $query = TourActivado::with(['persona', 'servicio'])
            ->porPersona($personaId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $toursActivados = $query->orderBy('tour_activado_fecha_hora', 'desc')->get();

        return TourActivadoResource::collection($toursActivados);
    }

    /**
     * OBTENER TOURS POR SERVICIO
     */
    public function porServicio(Request $request, $servicioId)
    {
        $query = TourActivado::with(['persona', 'servicio'])
            ->porServicio($servicioId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $toursActivados = $query->orderBy('tour_activado_fecha_hora', 'desc')->get();

        return TourActivadoResource::collection($toursActivados);
    }

    /**
     * OBTENER TOURS POR FECHA
     */
    public function porFecha(Request $request, $fecha)
    {
        $query = TourActivado::with(['persona', 'servicio'])
            ->porFecha($fecha)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $toursActivados = $query->orderBy('tour_activado_fecha_hora', 'asc')->get();

        return TourActivadoResource::collection($toursActivados);
    }

    /**
     * NUEVO: OBTENER TOURS CON GUÍA INTERNO
     */
    public function conGuiaInterno(Request $request)
    {
        $query = TourActivado::with(['persona', 'servicio'])
            ->conGuia()
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $toursActivados = $query->orderBy('tour_activado_fecha_hora', 'desc')->get();

        return TourActivadoResource::collection($toursActivados);
    }

    /**
     * NUEVO: OBTENER TOURS CON GUÍA EXTERNO
     */
    public function conGuiaExterno(Request $request)
    {
        $query = TourActivado::with(['servicio'])
            ->sinGuia()
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $toursActivados = $query->orderBy('tour_activado_fecha_hora', 'desc')->get();

        return TourActivadoResource::collection($toursActivados);
    }

    /**
     * GENERAR LISTA PDF PARA GUÍA
     */
    public function generarListaGuia(TourActivado $tourActivado)
    {
        $tourActivado->load(['servicio', 'persona']);

        $reservas = Reserva::where('tour_activado_id', $tourActivado->tour_activado_id)
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

        $pdf = PDF::loadView('vouchers.guia_tour', [
            'tourActivado' => $tourActivado,
            'reservas' => $reservas,
            'totales' => $totales
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = "lista-guia-{$tourActivado->tour_activado_codigo}-" . date('Y-m-d') . ".pdf";

        return $pdf->download($filename);
    }

    /**
     * OBTENER NOTIFICACIONES INTELIGENTES DEL TOUR
     */
    public function obtenerNotificaciones(TourActivado $tourActivado)
    {
        $tourActivado->load(['persona']);
        $notificaciones = $tourActivado->obtenerNotificacionesInteligentes();

        return response()->json([
            'tour_id' => $tourActivado->tour_activado_id,
            'codigo' => $tourActivado->tour_activado_codigo,
            'tiene_guia' => $tourActivado->tieneGuiaAsignado(),
            'notificaciones' => $notificaciones
        ]);
    }

    /**
     * VALIDAR ANTES DE AGREGAR RESERVA (SIEMPRE VÁLIDO PARA TOURS)
     */
    public function validarAgregarReserva(Request $request, TourActivado $tourActivado)
    {
        $request->validate([
            'adultos' => 'required|integer|min:1',
            'ninos' => 'nullable|integer|min:0'
        ]);

        $validacion = $tourActivado->validarAntesDeAgregarReserva(
            $request->adultos,
            $request->ninos ?? 0
        );

        return response()->json($validacion);
    }

    /**
     * PROCESAR DESPUÉS DE AGREGAR RESERVA
     */
    public function procesarDespuesReserva(TourActivado $tourActivado)
    {
        $notificaciones = $tourActivado->procesarDespuesDeAgregarReserva();

        return response()->json([
            'procesado' => true,
            'sin_limite_capacidad' => true,
            'notificaciones' => $notificaciones
        ]);
    }

    /**
     * OBTENER RESUMEN COMPLETO DEL TOUR
     */
    public function obtenerResumen(TourActivado $tourActivado)
    {
        $tourActivado->load(['persona', 'servicio']);
        $resumen = $tourActivado->obtenerResumenTour();

        return response()->json([
            'tour_id' => $tourActivado->tour_activado_id,
            'resumen' => $resumen,
            'notificaciones' => $tourActivado->obtenerNotificacionesInteligentes()
        ]);
    }

    /**
     * BUSCAR TOUR DISPONIBLE POR SERVICIO Y FECHA
     */
    public function buscarDisponible(Request $request)
    {
        $validated = $request->validate([
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'fecha' => 'required|date'
        ]);

        $tourDisponible = TourActivado::buscarTourDisponible(
            $validated['servicio_id'],
            $validated['fecha']
        );

        return response()->json([
            'tour_disponible' => $tourDisponible ? 1 : 0,
            'tour' => $tourDisponible ? new TourActivadoResource($tourDisponible) : null,
            'mensaje' => $tourDisponible
                ? 'Tour disponible encontrado'
                : 'No hay tours disponibles para esos parámetros'
        ]);
    }

    /**
     * COMPLETAR INFORMACIÓN DEL TOUR
     */
    public function completarInformacion(Request $request, TourActivado $tourActivado)
    {
        $validated = $request->validate([
            'tour_activado_descripcion' => 'nullable|string|max:255',
            'tour_activado_punto_encuentro' => 'nullable|string|max:255',
            'tour_activado_duracion_horas' => 'nullable|numeric|min:0|max:24'
        ]);

        $tourActivado->update($validated);
        $tourActivado->load(['persona', 'servicio']);

        return response()->json([
            'message' => 'Información del tour actualizada exitosamente',
            'descripcion_completa' => $tourActivado->tieneDescripcionCompleta(),
            'tour' => new TourActivadoResource($tourActivado)
        ]);
    }

    /**
     * ASIGNAR GUÍA AL TOUR
     */
    public function asignarGuia(Request $request, TourActivado $tourActivado)
    {
        $validated = $request->validate([
            'persona_id' => 'nullable|exists:persona,persona_id'
        ]);

        // Si se asigna un guía, validar disponibilidad
        if (!empty($validated['persona_id'])) {
            $fecha = date('Y-m-d', strtotime($tourActivado->tour_activado_fecha_hora));
            $hora = date('H:i', strtotime($tourActivado->tour_activado_fecha_hora));

            if (!TourActivado::esGuiaDisponible($validated['persona_id'], $fecha, $hora, $tourActivado->tour_activado_id)) {
                return response()->json([
                    'message' => 'El guía ya está asignado a otro tour en esa fecha y hora',
                    'errors' => ['persona_id' => ['Este guía ya está ocupado']]
                ], 422);
            }
        }

        $tourActivado->update(['persona_id' => $validated['persona_id']]);
        $tourActivado->load(['persona', 'servicio']);

        $mensaje = empty($validated['persona_id'])
            ? 'Guía removido del tour (ahora es guía externo)'
            : 'Guía asignado al tour exitosamente';

        return response()->json([
            'message' => $mensaje,
            'tiene_guia_asignado' => $tourActivado->tieneGuiaAsignado(),
            'es_guia_externo' => $tourActivado->esGuiaExterno(),
            'tour' => new TourActivadoResource($tourActivado)
        ]);
    }
}
