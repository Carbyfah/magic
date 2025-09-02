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
     * LISTAR RESERVAS
     */
    public function index(Request $request)
    {
        $query = Reserva::with(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

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

        // Filtro por tipo de venta
        if ($request->filled('tipo_venta')) {
            if ($request->tipo_venta === 'directa') {
                $query->directas();
            } elseif ($request->tipo_venta === 'agencia') {
                $query->porAgencias();
            }
        }

        // Filtro por fecha - CORREGIDO: usa campo datetime unificado
        if ($request->filled('fecha')) {
            $query->porFecha($request->fecha);
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('created_at', 'desc');

        $reservas = $query->get();

        return ReservaResource::collection($reservas);
    }

    /**
     * CREAR RESERVA - ACTUALIZADA para nueva DB
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
            'ruta_activada_id' => 'required|exists:ruta_activada,ruta_activada_id',
            'reserva_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['reserva_codigo'] = $validated['reserva_codigo'] ?? Reserva::generarCodigo();
        $validated['reserva_situacion'] = $validated['reserva_situacion'] ?? true;

        // CAMBIO: Calcular total dinámicamente (sin campo reserva_total_pasajeros)
        $total_pasajeros = $validated['reserva_cantidad_adultos'] + ($validated['reserva_cantidad_ninos'] ?? 0);
        $validacion = Reserva::validarCapacidadEnRuta($validated['ruta_activada_id'], $total_pasajeros);

        if (!$validacion['valido']) {
            return response()->json([
                'message' => $validacion['mensaje'],
                'errors' => ['ruta_activada_id' => [$validacion['mensaje']]]
            ], 422);
        }

        // Los triggers de la BD calcularán automáticamente reserva_monto
        $reserva = Reserva::create($validated);
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

        return new ReservaResource($reserva);
    }

    /**
     * VER RESERVA ESPECÍFICA - Sin carga de 'facturas'
     */
    public function show(Reserva $reserva)
    {
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);
        return new ReservaResource($reserva);
    }

    /**
     * ACTUALIZAR RESERVA - ACTUALIZADA para nueva DB
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
            'ruta_activada_id' => 'required|exists:ruta_activada,ruta_activada_id',
            'reserva_situacion' => 'sometimes|boolean'
        ]);

        // CAMBIO: Calcular total dinámicamente
        $total_pasajeros = $validated['reserva_cantidad_adultos'] + ($validated['reserva_cantidad_ninos'] ?? 0);
        $validacion = Reserva::validarCapacidadEnRuta($validated['ruta_activada_id'], $total_pasajeros, $reserva->reserva_id);

        if (!$validacion['valido']) {
            return response()->json([
                'message' => $validacion['mensaje'],
                'errors' => ['ruta_activada_id' => [$validacion['mensaje']]]
            ], 422);
        }

        // Los triggers de la BD recalcularán automáticamente reserva_monto
        $reserva->update($validated);
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

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
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

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

        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

        return new ReservaResource($reserva);
    }

    /**
     * GENERAR FACTURA - Mejorado con datos estructurados
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
            $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

            // Generar datos estructurados para la factura
            $datosFactura = $reserva->generarDatosFactura();

            return response()->json([
                'message' => 'Datos de factura generados exitosamente',
                'factura' => $datosFactura,
                'reserva_id' => $reserva->reserva_id,
                'estado_actual' => $reserva->estado->estado_estado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar factura: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GENERAR FACTURA PDF
     */
    public function generarFacturaPDF(Reserva $reserva)
    {
        if (!$reserva->puedeGenerarFactura()) {
            return response()->json([
                'message' => 'Esta reserva no puede generar factura'
            ], 409);
        }

        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

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
     * GENERAR MENSAJE WHATSAPP
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
            'cliente' => $reserva->nombre_completo_cliente
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
        $query = Reserva::with(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio'])
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
        $query = Reserva::with(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio'])
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
        $query = Reserva::with(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio'])
            ->porAgencia($agenciaId)
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
        $query = Reserva::with(['usuario.persona', 'estado', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio'])
            ->directas()
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * OBTENER RESERVAS POR FECHA DE VIAJE - CORREGIDA para datetime unificado
     */
    public function porFecha(Request $request, $fecha)
    {
        $query = Reserva::with(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio'])
            ->porFecha($fecha)
            ->activa();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();
        return ReservaResource::collection($reservas);
    }

    /**
     * BUSCAR DISPONIBILIDAD PARA NUEVAS RESERVAS - ACTUALIZADA
     */
    public function buscarDisponibilidad(Request $request)
    {
        $validated = $request->validate([
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'fecha' => 'required|date',
            'pasajeros' => 'required|integer|min:1'
        ]);

        // Usar método del modelo actualizado
        $rutaDisponible = Reserva::buscarDisponibilidad(
            $validated['servicio_id'],
            $validated['fecha'],
            $validated['pasajeros']
        );

        return response()->json([
            'ruta_disponible' => $rutaDisponible ? 1 : 0,
            'ruta' => $rutaDisponible ? new \App\Http\Resources\RutaActivadaResource($rutaDisponible) : null,
            'mensaje' => $rutaDisponible
                ? 'Ruta disponible encontrada'
                : 'No hay rutas disponibles para esos parámetros'
        ]);
    }

    /**
     * GENERAR VOUCHER PDF PARA CLIENTE
     */
    public function generarVoucherPDF(Reserva $reserva)
    {
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

        $pdf = \PDF::loadView('vouchers.cliente', compact('reserva'));
        $pdf->setPaper('a4', 'portrait');

        $filename = "voucher-{$reserva->reserva_codigo}-" . date('Y-m-d') . ".pdf";
        return $pdf->download($filename);
    }

    /**
     * NUEVO: USAR VISTAS DE LA NUEVA DB - Reportes con vistas optimizadas
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
     * OBTENER NOTIFICACIONES INTELIGENTES DE LA RESERVA
     */
    public function obtenerNotificaciones(Reserva $reserva)
    {
        $reserva->load(['estado', 'rutaActivada.vehiculo']);
        $notificaciones = $reserva->obtenerNotificacionesInteligentes();

        return response()->json([
            'reserva_id' => $reserva->reserva_id,
            'codigo' => $reserva->reserva_codigo,
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
     * PROCESAR DESPUÉS DE CAMBIO DE ESTADO (llamar desde otros métodos)
     */
    public function procesarDespuesCambioEstado(Reserva $reserva)
    {
        $reserva->load(['estado', 'rutaActivada']);
        $notificaciones = $reserva->procesarDespuesDeCambioEstado();

        return response()->json([
            'procesado' => true,
            'notificaciones' => $notificaciones
        ]);
    }

    /**
     * ACTIVAR RESERVA
     */
    public function activate(Reserva $reserva)
    {
        $reserva->update(['reserva_situacion' => 1]);
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

        return new ReservaResource($reserva);
    }

    /**
     * DESACTIVAR RESERVA
     */
    public function deactivate(Reserva $reserva)
    {
        $reserva->update(['reserva_situacion' => 0]);
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.ruta', 'rutaActivada.vehiculo', 'rutaActivada.servicio']);

        return new ReservaResource($reserva);
    }
}
