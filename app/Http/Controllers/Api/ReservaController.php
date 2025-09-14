<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Http\Resources\ReservaResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use PDF;

class ReservaController extends Controller
{
    /**
     * LISTAR RESERVAS - ACTUALIZADO CON TOURS
     */
    public function index(Request $request)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio', // NUEVO: Relación con tours
            'tourActivado.persona'   // NUEVO: Guía del tour
        ]);

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('reserva_situacion', $request->boolean('activo'));
        }

        // Filtro por estado
        if ($request->filled('estado_id')) {
            $query->porEstado($request->estado_id);
        }

        // Filtro por vendedor
        if ($request->filled('usuario_id')) {
            $query->porUsuario($request->usuario_id);
        }

        // Filtro por agencia
        if ($request->filled('agencia_id')) {
            $query->porAgencia($request->agencia_id);
        }

        // Filtro por ruta activada
        if ($request->filled('ruta_activada_id')) {
            $query->porRutaActivada($request->ruta_activada_id);
        }

        // NUEVO: Filtro por tour activado
        if ($request->filled('tour_activado_id')) {
            $query->porTourActivado($request->tour_activado_id);
        }

        // NUEVO: Filtro por tipo de servicio
        if ($request->filled('tipo_servicio')) {
            if ($request->tipo_servicio === 'ruta') {
                $query->soloRutas();
            } elseif ($request->tipo_servicio === 'tour') {
                $query->soloTours();
            }
        }

        // Filtro por tipo de venta
        if ($request->filled('tipo_venta')) {
            if ($request->tipo_venta === 'directa') {
                $query->directas();
            } elseif ($request->tipo_venta === 'agencia') {
                $query->porAgencias();
            }
        }

        // Filtro por fecha - FUNCIONA PARA RUTAS Y TOURS
        if ($request->filled('fecha')) {
            $query->porFecha($request->fecha);
        }

        // Búsqueda simple - ACTUALIZADA PARA TOURS
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('created_at', 'desc');

        $reservas = $query->get();

        return ReservaResource::collection($reservas);
    }

    /**
     * CREAR RESERVA - ACTUALIZADA PARA TOURS
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reserva_codigo' => 'sometimes|string|max:45|unique:reserva,reserva_codigo',
            'reserva_nombres_cliente' => 'required|string|max:100',
            'reserva_apellidos_cliente' => 'required|string|max:100',
            'reserva_cliente_nit' => 'nullable|string|max:20',
            'reserva_telefono_cliente' => 'required|integer',
            'reserva_email_cliente' => 'nullable|email|max:80',
            'reserva_cantidad_adultos' => 'required|integer|min:1',
            'reserva_cantidad_ninos' => 'nullable|integer|min:0',
            'reserva_direccion_abordaje' => 'nullable|string|max:255',
            'reserva_notas' => 'nullable|string|max:255',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'agencia_id' => 'nullable|exists:agencia,agencia_id',
            'ruta_activada_id' => 'nullable|exists:ruta_activada,ruta_activada_id',
            'tour_activado_id' => 'nullable|exists:tour_activado,tour_activado_id', // NUEVO
            'reserva_situacion' => 'sometimes|boolean'
        ]);

        // VALIDAR: Debe tener exactamente una ruta O un tour
        if (empty($validated['ruta_activada_id']) && empty($validated['tour_activado_id'])) {
            return response()->json([
                'message' => 'Debe especificar una ruta activada o un tour activado.',
                'errors' => ['servicio' => ['Seleccione un servicio (ruta o tour)']]
            ], 422);
        }

        if (!empty($validated['ruta_activada_id']) && !empty($validated['tour_activado_id'])) {
            return response()->json([
                'message' => 'No puede asignar ruta y tour simultáneamente.',
                'errors' => ['servicio' => ['Seleccione solo un tipo de servicio']]
            ], 422);
        }

        // Generar código automáticamente si no viene
        $validated['reserva_codigo'] = $validated['reserva_codigo'] ?? Reserva::generarCodigo();
        $validated['reserva_situacion'] = $validated['reserva_situacion'] ?? true;

        // Validar capacidad solo para rutas (tours no tienen límite)
        if (!empty($validated['ruta_activada_id'])) {
            $total_pasajeros = $validated['reserva_cantidad_adultos'] + ($validated['reserva_cantidad_ninos'] ?? 0);
            $validacion = Reserva::validarCapacidadEnRuta($validated['ruta_activada_id'], $total_pasajeros);

            if (!$validacion['valido']) {
                return response()->json([
                    'message' => $validacion['mensaje'],
                    'errors' => ['ruta_activada_id' => [$validacion['mensaje']]]
                ], 422);
            }
        }

        // Los triggers de la BD calcularán automáticamente reserva_monto
        $reserva = Reserva::create($validated);
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        return new ReservaResource($reserva);
    }

    /**
     * VER RESERVA ESPECÍFICA - ACTUALIZADA PARA TOURS
     */
    public function show(Reserva $reserva)
    {
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);
        return new ReservaResource($reserva);
    }

    /**
     * ACTUALIZAR RESERVA - ACTUALIZADA PARA TOURS
     */
    public function update(Request $request, Reserva $reserva)
    {
        // Validar si puede ser modificada según su estado
        if (!$reserva->puedeSerModificada()) {
            return response()->json([
                'message' => 'Esta reserva no puede ser modificada en su estado actual.'
            ], 409);
        }

        $validated = $request->validate([
            'reserva_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('reserva', 'reserva_codigo')->ignore($reserva->reserva_id, 'reserva_id')
            ],
            'reserva_nombres_cliente' => 'required|string|max:100',
            'reserva_apellidos_cliente' => 'required|string|max:100',
            'reserva_cliente_nit' => 'nullable|string|max:20',
            'reserva_telefono_cliente' => 'required|integer',
            'reserva_email_cliente' => 'nullable|email|max:80',
            'reserva_cantidad_adultos' => 'required|integer|min:1',
            'reserva_cantidad_ninos' => 'nullable|integer|min:0',
            'reserva_direccion_abordaje' => 'nullable|string|max:255',
            'reserva_notas' => 'nullable|string|max:255',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'agencia_id' => 'nullable|exists:agencia,agencia_id',
            'ruta_activada_id' => 'nullable|exists:ruta_activada,ruta_activada_id',
            'tour_activado_id' => 'nullable|exists:tour_activado,tour_activado_id', // NUEVO
            'reserva_situacion' => 'sometimes|boolean'
        ]);

        // VALIDAR: Debe tener exactamente una ruta O un tour
        if (empty($validated['ruta_activada_id']) && empty($validated['tour_activado_id'])) {
            return response()->json([
                'message' => 'Debe especificar una ruta activada o un tour activado.',
                'errors' => ['servicio' => ['Seleccione un servicio (ruta o tour)']]
            ], 422);
        }

        if (!empty($validated['ruta_activada_id']) && !empty($validated['tour_activado_id'])) {
            return response()->json([
                'message' => 'No puede asignar ruta y tour simultáneamente.',
                'errors' => ['servicio' => ['Seleccione solo un tipo de servicio']]
            ], 422);
        }

        // Validar capacidad solo para rutas
        if (!empty($validated['ruta_activada_id'])) {
            $total_pasajeros = $validated['reserva_cantidad_adultos'] + ($validated['reserva_cantidad_ninos'] ?? 0);
            $validacion = Reserva::validarCapacidadEnRuta($validated['ruta_activada_id'], $total_pasajeros, $reserva->reserva_id);

            if (!$validacion['valido']) {
                return response()->json([
                    'message' => $validacion['mensaje'],
                    'errors' => ['ruta_activada_id' => [$validacion['mensaje']]]
                ], 422);
            }
        }

        // Los triggers de la BD recalcularán automáticamente reserva_monto
        $reserva->update($validated);
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        return new ReservaResource($reserva);
    }

    /**
     * ELIMINAR RESERVA (Solo si puede ser modificada)
     */
    public function destroy(Reserva $reserva)
    {
        if (!$reserva->puedeSerModificada()) {
            return response()->json([
                'message' => 'Esta reserva no puede ser eliminada en su estado actual.'
            ], 409);
        }

        $reserva->delete();

        return response()->json(['message' => 'Reserva eliminada exitosamente']);
    }

    /**
     * CONFIRMAR RESERVA
     */
    public function confirm(Request $request, Reserva $reserva)
    {
        if (!$reserva->puedeSerConfirmada()) {
            return response()->json([
                'message' => 'Esta reserva no puede ser confirmada en su estado actual.'
            ], 409);
        }

        // Buscar estado "Confirmada" usando el sistema contextual
        $estadoConfirmada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
            ->where('estado_estado', 'LIKE', '%onfirm%')
            ->where('estado_situacion', 1)
            ->first();

        if (!$estadoConfirmada) {
            $estadoConfirmada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
                ->whereIn('estado_estado', ['Confirmada', 'Confirmado', 'Confirmar'])
                ->where('estado_situacion', 1)
                ->first();
        }

        if (!$estadoConfirmada) {
            return response()->json([
                'message' => 'Estado "Confirmada" no encontrado. Verifique la configuración de estados para reservas.',
                'sugerencia' => 'Cree un estado con contexto "reserva" y nombre "Confirmada"'
            ], 500);
        }

        $reserva->update(['estado_id' => $estadoConfirmada->estado_id]);
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        return new ReservaResource($reserva);
    }

    /**
     * CANCELAR RESERVA
     */
    public function cancel(Request $request, Reserva $reserva)
    {
        if (!$reserva->puedeSerCancelada()) {
            return response()->json([
                'message' => 'Esta reserva no puede ser cancelada en su estado actual.'
            ], 409);
        }

        $validated = $request->validate([
            'motivo' => 'nullable|string|max:255'
        ]);

        // Buscar estado "Cancelada"
        $estadoCancelada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
            ->where('estado_estado', 'LIKE', '%ancel%')
            ->where('estado_situacion', 1)
            ->first();

        if (!$estadoCancelada) {
            $estadoCancelada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
                ->whereIn('estado_estado', ['Cancelada', 'Cancelado', 'Cancelar'])
                ->where('estado_situacion', 1)
                ->first();
        }

        if (!$estadoCancelada) {
            return response()->json([
                'message' => 'Estado "Cancelada" no encontrado. Verifique la configuración de estados para reservas.',
                'sugerencia' => 'Cree un estado con contexto "reserva" y nombre "Cancelada"'
            ], 500);
        }

        $reserva->update([
            'estado_id' => $estadoCancelada->estado_id,
            'reserva_notas' => $validated['motivo'] ?
                ($reserva->reserva_notas ? $reserva->reserva_notas . ' | CANCELACIÓN: ' . $validated['motivo'] : 'CANCELACIÓN: ' . $validated['motivo'])
                : $reserva->reserva_notas
        ]);

        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        return new ReservaResource($reserva);
    }

    /**
     * GENERAR FACTURA - Funciona para rutas y tours
     */
    public function generarFactura(Reserva $reserva)
    {
        if (!$reserva->puedeGenerarFactura()) {
            return response()->json([
                'message' => 'Esta reserva debe estar en estado "confirmada" para poder facturar.',
                'estado_actual' => $reserva->estado->estado_estado ?? 'Sin estado'
            ], 409);
        }

        try {
            // Cargar relaciones necesarias
            $reserva->load([
                'usuario.persona',
                'estado',
                'agencia',
                'rutaActivada.ruta',
                'rutaActivada.vehiculo',
                'rutaActivada.servicio',
                'tourActivado.servicio',
                'tourActivado.persona'
            ]);

            // Generar datos estructurados para la factura
            $datosFactura = $reserva->generarDatosFactura();

            return response()->json([
                'message' => 'Datos de factura generados exitosamente',
                'factura' => $datosFactura,
                'reserva_id' => $reserva->reserva_id,
                'tipo_servicio' => $reserva->tipo_servicio,
                'estado_actual' => $reserva->estado->estado_estado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar factura: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GENERAR FACTURA PDF - Funciona para rutas y tours
     */
    public function generarFacturaPDF(Reserva $reserva)
    {
        if (!$reserva->puedeGenerarFactura()) {
            return response()->json([
                'message' => 'Esta reserva no puede generar factura'
            ], 409);
        }

        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        $datosFactura = $reserva->generarDatosFactura();

        $pdf = \PDF::loadView('facturas.factura', compact('reserva', 'datosFactura'));
        $pdf->setPaper('a4', 'portrait');

        $filename = "factura-{$reserva->reserva_codigo}-" . date('Y-m-d') . ".pdf";
        return $pdf->download($filename);
    }

    /**
     * CONFIRMAR RESERVAS MASIVAMENTE POR RUTA
     */
    public function confirmByRuta(Request $request, $rutaActivadaId)
    {
        $rutaActivada = \App\Models\RutaActivada::find($rutaActivadaId);
        if (!$rutaActivada) {
            return response()->json([
                'message' => 'Ruta activada no encontrada.'
            ], 404);
        }

        $estadoConfirmada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
            ->where('estado_estado', 'LIKE', '%onfirm%')
            ->where('estado_situacion', 1)
            ->first();

        if (!$estadoConfirmada) {
            return response()->json([
                'message' => 'Estado "Confirmada" no encontrado. Configure primero los estados de reserva.'
            ], 500);
        }

        $reservas = Reserva::where('ruta_activada_id', $rutaActivadaId)
            ->where('reserva_situacion', 1)
            ->get();

        $confirmadas = 0;
        $errores = [];

        foreach ($reservas as $reserva) {
            if ($reserva->puedeSerConfirmada()) {
                $reserva->update(['estado_id' => $estadoConfirmada->estado_id]);
                $confirmadas++;
            } else {
                $errores[] = [
                    'reserva_codigo' => $reserva->reserva_codigo,
                    'cliente' => $reserva->nombre_completo_cliente,
                    'motivo' => 'No puede ser confirmada en su estado actual'
                ];
            }
        }

        return response()->json([
            'message' => "Proceso completado: {$confirmadas} reservas confirmadas",
            'confirmadas' => $confirmadas,
            'total_reservas' => $reservas->count(),
            'errores' => $errores,
            'ruta' => $rutaActivada->ruta_completa ?? 'Ruta #' . $rutaActivadaId
        ]);
    }

    /**
     * NUEVO: CONFIRMAR RESERVAS MASIVAMENTE POR TOUR
     */
    public function confirmByTour(Request $request, $tourActivadoId)
    {
        $tourActivado = \App\Models\TourActivado::find($tourActivadoId);
        if (!$tourActivado) {
            return response()->json([
                'message' => 'Tour activado no encontrado.'
            ], 404);
        }

        $estadoConfirmada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
            ->where('estado_estado', 'LIKE', '%onfirm%')
            ->where('estado_situacion', 1)
            ->first();

        if (!$estadoConfirmada) {
            return response()->json([
                'message' => 'Estado "Confirmada" no encontrado. Configure primero los estados de reserva.'
            ], 500);
        }

        $reservas = Reserva::where('tour_activado_id', $tourActivadoId)
            ->where('reserva_situacion', 1)
            ->get();

        $confirmadas = 0;
        $errores = [];

        foreach ($reservas as $reserva) {
            if ($reserva->puedeSerConfirmada()) {
                $reserva->update(['estado_id' => $estadoConfirmada->estado_id]);
                $confirmadas++;
            } else {
                $errores[] = [
                    'reserva_codigo' => $reserva->reserva_codigo,
                    'cliente' => $reserva->nombre_completo_cliente,
                    'motivo' => 'No puede ser confirmada en su estado actual'
                ];
            }
        }

        return response()->json([
            'message' => "Proceso completado: {$confirmadas} reservas confirmadas",
            'confirmadas' => $confirmadas,
            'total_reservas' => $reservas->count(),
            'errores' => $errores,
            'tour' => $tourActivado->tour_activado_descripcion ?? 'Tour #' . $tourActivadoId
        ]);
    }

    /**
     * CANCELAR RESERVAS MASIVAMENTE POR RUTA
     */
    public function cancelByRuta(Request $request, $rutaActivadaId)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|max:255'
        ]);

        $rutaActivada = \App\Models\RutaActivada::find($rutaActivadaId);
        if (!$rutaActivada) {
            return response()->json([
                'message' => 'Ruta activada no encontrada.'
            ], 404);
        }

        $estadoCancelada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
            ->where('estado_estado', 'LIKE', '%ancel%')
            ->where('estado_situacion', 1)
            ->first();

        if (!$estadoCancelada) {
            return response()->json([
                'message' => 'Estado "Cancelada" no encontrado. Configure primero los estados de reserva.'
            ], 500);
        }

        $reservas = Reserva::where('ruta_activada_id', $rutaActivadaId)
            ->where('reserva_situacion', 1)
            ->get();

        $canceladas = 0;
        $errores = [];

        foreach ($reservas as $reserva) {
            if ($reserva->puedeSerCancelada()) {
                $reserva->update([
                    'estado_id' => $estadoCancelada->estado_id,
                    'reserva_notas' => $reserva->reserva_notas ?
                        $reserva->reserva_notas . ' | CANCELACIÓN MASIVA: ' . $validated['motivo']
                        : 'CANCELACIÓN MASIVA: ' . $validated['motivo']
                ]);
                $canceladas++;
            } else {
                $errores[] = [
                    'reserva_codigo' => $reserva->reserva_codigo,
                    'cliente' => $reserva->nombre_completo_cliente,
                    'motivo' => 'No puede ser cancelada en su estado actual'
                ];
            }
        }

        return response()->json([
            'message' => "Proceso completado: {$canceladas} reservas canceladas",
            'canceladas' => $canceladas,
            'total_reservas' => $reservas->count(),
            'errores' => $errores,
            'ruta' => $rutaActivada->ruta_completa ?? 'Ruta #' . $rutaActivadaId,
            'motivo' => $validated['motivo']
        ]);
    }

    /**
     * NUEVO: CANCELAR RESERVAS MASIVAMENTE POR TOUR
     */
    public function cancelByTour(Request $request, $tourActivadoId)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|max:255'
        ]);

        $tourActivado = \App\Models\TourActivado::find($tourActivadoId);
        if (!$tourActivado) {
            return response()->json([
                'message' => 'Tour activado no encontrado.'
            ], 404);
        }

        $estadoCancelada = \App\Models\Estado::where('estado_codigo', 'LIKE', 'RES-%')
            ->where('estado_estado', 'LIKE', '%ancel%')
            ->where('estado_situacion', 1)
            ->first();

        if (!$estadoCancelada) {
            return response()->json([
                'message' => 'Estado "Cancelada" no encontrado. Configure primero los estados de reserva.'
            ], 500);
        }

        $reservas = Reserva::where('tour_activado_id', $tourActivadoId)
            ->where('reserva_situacion', 1)
            ->get();

        $canceladas = 0;
        $errores = [];

        foreach ($reservas as $reserva) {
            if ($reserva->puedeSerCancelada()) {
                $reserva->update([
                    'estado_id' => $estadoCancelada->estado_id,
                    'reserva_notas' => $reserva->reserva_notas ?
                        $reserva->reserva_notas . ' | CANCELACIÓN MASIVA: ' . $validated['motivo']
                        : 'CANCELACIÓN MASIVA: ' . $validated['motivo']
                ]);
                $canceladas++;
            } else {
                $errores[] = [
                    'reserva_codigo' => $reserva->reserva_codigo,
                    'cliente' => $reserva->nombre_completo_cliente,
                    'motivo' => 'No puede ser cancelada en su estado actual'
                ];
            }
        }

        return response()->json([
            'message' => "Proceso completado: {$canceladas} reservas canceladas",
            'canceladas' => $canceladas,
            'total_reservas' => $reservas->count(),
            'errores' => $errores,
            'tour' => $tourActivado->tour_activado_descripcion ?? 'Tour #' . $tourActivadoId,
            'motivo' => $validated['motivo']
        ]);
    }

    /**
     * GENERAR MENSAJE WHATSAPP - Funciona para rutas y tours
     */
    public function whatsapp(Request $request, Reserva $reserva)
    {
        $validated = $request->validate([
            'tipo' => 'sometimes|in:confirmacion,recordatorio,cancelacion'
        ]);

        $tipo = $validated['tipo'] ?? 'confirmacion';
        $mensaje = $reserva->generarMensajeWhatsAppPersonalizado($tipo);

        return response()->json([
            'mensaje' => $mensaje,
            'tipo' => $tipo,
            'reserva_codigo' => $reserva->reserva_codigo,
            'cliente' => $reserva->nombre_completo_cliente,
            'tipo_servicio' => $reserva->tipo_servicio
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

        $disponible = Reserva::where('reserva_codigo', $request->codigo)
            ->when($request->except_id, function ($query, $exceptId) {
                return $query->where('reserva_id', '!=', $exceptId);
            })
            ->doesntExist();

        return response()->json([
            'disponible' => $disponible,
            'message' => $disponible ? 'Código disponible' : 'Código ya está en uso'
        ]);
    }

    /**
     * OBTENER RESERVAS POR USUARIO (VENDEDOR)
     */
    public function porUsuario(Request $request, $usuarioId)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ])
            ->porUsuario($usuarioId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * OBTENER RESERVAS POR ESTADO
     */
    public function porEstado(Request $request, $estadoId)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ])
            ->porEstado($estadoId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * OBTENER RESERVAS POR AGENCIA
     */
    public function porAgencia(Request $request, $agenciaId)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ])
            ->porAgencia($agenciaId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * NUEVO: OBTENER RESERVAS POR TOUR ACTIVADO
     */
    public function porTour(Request $request, $tourActivadoId)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'tourActivado.servicio',
            'tourActivado.persona'
        ])
            ->porTourActivado($tourActivadoId)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * OBTENER RESERVAS DIRECTAS (Sin agencia)
     */
    public function directas(Request $request)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ])
            ->directas()
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * NUEVO: OBTENER RESERVAS SOLO DE RUTAS
     */
    public function soloRutas(Request $request)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio'
        ])
            ->soloRutas()
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * NUEVO: OBTENER RESERVAS SOLO DE TOURS
     */
    public function soloTours(Request $request)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'tourActivado.servicio',
            'tourActivado.persona'
        ])
            ->soloTours()
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * OBTENER RESERVAS POR FECHA DE VIAJE - FUNCIONA PARA RUTAS Y TOURS
     */
    public function porFecha(Request $request, $fecha)
    {
        $query = Reserva::with([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ])
            ->porFecha($fecha)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * BUSCAR DISPONIBILIDAD PARA NUEVAS RESERVAS - ACTUALIZADA PARA TOURS
     */
    public function buscarDisponibilidad(Request $request)
    {
        $validated = $request->validate([
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'fecha' => 'required|date',
            'pasajeros' => 'required|integer|min:1'
        ]);

        $servicioDisponible = Reserva::buscarDisponibilidad(
            $validated['servicio_id'],
            $validated['fecha'],
            $validated['pasajeros']
        );

        if ($servicioDisponible) {
            $esRuta = $servicioDisponible instanceof \App\Models\RutaActivada;
            $esTour = $servicioDisponible instanceof \App\Models\TourActivado;

            return response()->json([
                'servicio_disponible' => 1,
                'tipo_servicio' => $esRuta ? 'ruta' : 'tour',
                'ruta' => $esRuta ? new \App\Http\Resources\RutaActivadaResource($servicioDisponible) : null,
                'tour' => $esTour ? new \App\Http\Resources\TourActivadoResource($servicioDisponible) : null,
                'mensaje' => $esRuta ? 'Ruta disponible encontrada' : 'Tour disponible encontrado'
            ]);
        }

        return response()->json([
            'servicio_disponible' => 0,
            'tipo_servicio' => null,
            'ruta' => null,
            'tour' => null,
            'mensaje' => 'No hay servicios disponibles para esos parámetros'
        ]);
    }

    /**
     * GENERAR VOUCHER PDF PARA CLIENTE - Funciona para rutas y tours
     */
    public function generarVoucherPDF(Reserva $reserva)
    {
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        $pdf = \PDF::loadView('vouchers.cliente', compact('reserva'));
        $pdf->setPaper('a4', 'portrait');

        $filename = "voucher-{$reserva->reserva_codigo}-" . date('Y-m-d') . ".pdf";
        return $pdf->download($filename);
    }

    /**
     * USAR VISTAS DE LA NUEVA DB - Reportes con vistas optimizadas
     */
    public function obtenerReservasCompletas()
    {
        $reservas = Reserva::obtenerReservasCompletas();

        return response()->json([
            'data' => $reservas,
            'total' => $reservas->count(),
            'fuente' => 'vista v_reservas_completas'
        ]);
    }

    public function obtenerIngresosDiarios()
    {
        $ingresos = Reserva::obtenerIngresosDiarios();

        return response()->json([
            'data' => $ingresos,
            'total_dias' => $ingresos->count(),
            'fuente' => 'vista v_ingresos_diarios'
        ]);
    }

    /**
     * NUEVO: OBTENER DASHBOARD UNIFICADO (RUTAS Y TOURS)
     */
    public function obtenerDashboardUnificado()
    {
        $dashboard = Reserva::obtenerDashboardUnificado();

        return response()->json([
            'data' => $dashboard,
            'total_servicios' => $dashboard->count(),
            'fuente' => 'vista v_dashboard_unificado'
        ]);
    }

    /**
     * NUEVO: OBTENER INFORMACIÓN DE TOURS
     */
    public function obtenerInfoTours()
    {
        $tours = Reserva::obtenerInfoTours();

        return response()->json([
            'data' => $tours,
            'total_tours' => $tours->count(),
            'fuente' => 'vista v_info_tours'
        ]);
    }

    /**
     * OBTENER NOTIFICACIONES INTELIGENTES DE LA RESERVA
     */
    public function obtenerNotificaciones(Reserva $reserva)
    {
        $reserva->load(['estado', 'rutaActivada.vehiculo', 'tourActivado']);
        $notificaciones = $reserva->obtenerNotificacionesInteligentes();

        return response()->json([
            'reserva_id' => $reserva->reserva_id,
            'codigo' => $reserva->reserva_codigo,
            'tipo_servicio' => $reserva->tipo_servicio,
            'estado_actual' => $reserva->estado->estado_estado ?? 'Sin estado',
            'notificaciones' => $notificaciones
        ]);
    }

    /**
     * VALIDAR ANTES DE CAMBIAR ESTADO
     */
    public function validarCambioEstado(Request $request, Reserva $reserva)
    {
        $request->validate([
            'nuevo_estado' => 'required|string'
        ]);

        $reserva->load(['estado']);
        $validacion = $reserva->validarCambioDeEstado($request->nuevo_estado);

        return response()->json($validacion);
    }

    /**
     * PROCESAR DESPUÉS DE CAMBIO DE ESTADO
     */
    public function procesarDespuesCambioEstado(Reserva $reserva)
    {
        $reserva->load(['estado', 'rutaActivada', 'tourActivado']);
        $notificaciones = $reserva->procesarDespuesDeCambioEstado();

        return response()->json([
            'procesado' => true,
            'tipo_servicio' => $reserva->tipo_servicio,
            'notificaciones' => $notificaciones
        ]);
    }

    /**
     * ACTIVAR RESERVA
     */
    public function activate(Reserva $reserva)
    {
        $reserva->update(['reserva_situacion' => 1]);
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        return new ReservaResource($reserva);
    }

    /**
     * DESACTIVAR RESERVA
     */
    public function deactivate(Reserva $reserva)
    {
        $reserva->update(['reserva_situacion' => 0]);
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        return new ReservaResource($reserva);
    }

    /**
     * NUEVO: OBTENER INFORMACIÓN DEL SERVICIO DE LA RESERVA
     */
    public function obtenerInfoServicio(Reserva $reserva)
    {
        $reserva->load([
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'rutaActivada.servicio',
            'rutaActivada.persona',
            'tourActivado.servicio',
            'tourActivado.persona'
        ]);

        $infoServicio = $reserva->obtenerInfoServicio();

        return response()->json([
            'reserva_id' => $reserva->reserva_id,
            'codigo' => $reserva->reserva_codigo,
            'info_servicio' => $infoServicio
        ]);
    }

    /**
     * NUEVO: VALIDAR CONSTRAINT DE SERVICIO
     */
    public function validarConstraintServicio(Reserva $reserva)
    {
        $validacion = $reserva->validarConstraintServicio();

        return response()->json([
            'reserva_id' => $reserva->reserva_id,
            'codigo' => $reserva->reserva_codigo,
            'validacion_constraint' => $validacion
        ]);
    }
}
