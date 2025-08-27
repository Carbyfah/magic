<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Models\RutaActivada;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReservaController extends Controller
{
    public function index(Request $request)
    {
        $query = Reserva::query();

        if ($request->filled('activo')) {
            $query->where('reserva_situacion', $request->boolean('activo'));
        }

        if ($request->filled('fecha')) {
            $query->whereDate('created_at', $request->fecha);
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

        if ($request->filled('tipo_cliente')) {
            if ($request->tipo_cliente === 'agencia') {
                $query->deAgencias();
            } elseif ($request->tipo_cliente === 'directo') {
                $query->directas();
            }
        }

        if ($request->filled('vendedor_id')) {
            $query->where('usuario_id', $request->vendedor_id);
        }

        if ($request->filled('agencia_id')) {
            $query->where('agencia_id', $request->agencia_id);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('reserva_codigo', 'like', "%{$request->search}%")
                    ->orWhere('reserva_nombres_cliente', 'like', "%{$request->search}%")
                    ->orWhere('reserva_apellidos_cliente', 'like', "%{$request->search}%")
                    ->orWhere('reserva_telefono_cliente', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('with_relations')) {
            $query->with(['usuario.persona', 'estado', 'agencia', 'rutaActivada.servicio', 'rutaActivada.ruta']);
        }

        if ($request->has('include_mensajes')) {
            $request->request->add(['include_mensajes' => true]);
        }

        if ($request->has('resumen_completo')) {
            $request->request->add(['resumen_completo' => true]);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return ReservaResource::collection($query->get());
        }

        $reservas = $query->paginate($request->get('per_page', 15));
        return ReservaResource::collection($reservas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reserva_codigo' => 'nullable|string|max:45|unique:reserva',
            'reserva_nombres_cliente' => 'required|string|max:100',
            'reserva_apellidos_cliente' => 'required|string|max:100',
            'reserva_cliente_nit' => 'nullable|integer',
            'reserva_telefono_cliente' => 'required|integer|min:10000000|max:999999999999',
            'reserva_email_cliente' => 'nullable|email|max:80',
            'reserva_cantidad_adultos' => 'required|integer|min:1|max:50',
            'reserva_cantidad_ninos' => 'nullable|integer|min:0|max:50',
            'reserva_direccion_abordaje' => 'nullable|string|max:255',
            'reserva_notas' => 'nullable|string|max:255',
            'reserva_monto' => 'nullable|numeric|min:0',
            'reserva_situacion' => 'boolean',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'agencia_id' => 'nullable|exists:agencia,agencia_id',
            'ruta_activada_id' => 'required|exists:ruta_activada,ruta_activada_id'
        ]);

        // Verificar capacidad de la ruta
        $rutaActivada = RutaActivada::find($validated['ruta_activada_id']);
        $totalPasajeros = $validated['reserva_cantidad_adultos'] + ($validated['reserva_cantidad_ninos'] ?? 0);

        if (!$rutaActivada->puedeAcomodar($totalPasajeros)) {
            return response()->json([
                'message' => "No hay suficiente espacio en esta ruta. Espacios disponibles: {$rutaActivada->espacios_disponibles}"
            ], Response::HTTP_BAD_REQUEST);
        }

        // Calcular monto automáticamente si no se proporcionó
        if (!isset($validated['reserva_monto']) && $rutaActivada->servicio) {
            $validated['reserva_monto'] = $rutaActivada->servicio->calcularPrecio(
                $validated['reserva_cantidad_adultos'],
                $validated['reserva_cantidad_ninos'] ?? 0,
                !is_null($validated['agencia_id'])
            );
        }

        $reserva = Reserva::create($validated);

        // Generar código si no se proporcionó
        if (!$validated['reserva_codigo']) {
            $reserva->reserva_codigo = $reserva->generarCodigoUnico();
            $reserva->save();
        }

        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.servicio', 'rutaActivada.ruta']);
        return new ReservaResource($reserva);
    }

    public function show(Reserva $reserva)
    {
        $reserva->load([
            'usuario.persona',
            'estado',
            'agencia',
            'rutaActivada.servicio',
            'rutaActivada.ruta',
            'rutaActivada.vehiculo',
            'facturas'
        ]);
        return new ReservaResource($reserva);
    }

    public function update(Request $request, Reserva $reserva)
    {
        $validated = $request->validate([
            'reserva_codigo' => [
                'nullable',
                'string',
                'max:45',
                Rule::unique('reserva')->ignore($reserva->reserva_id, 'reserva_id')
            ],
            'reserva_nombres_cliente' => 'required|string|max:100',
            'reserva_apellidos_cliente' => 'required|string|max:100',
            'reserva_cliente_nit' => 'nullable|integer',
            'reserva_telefono_cliente' => 'required|integer|min:10000000|max:999999999999',
            'reserva_email_cliente' => 'nullable|email|max:80',
            'reserva_cantidad_adultos' => 'required|integer|min:1|max:50',
            'reserva_cantidad_ninos' => 'nullable|integer|min:0|max:50',
            'reserva_direccion_abordaje' => 'nullable|string|max:255',
            'reserva_notas' => 'nullable|string|max:255',
            'reserva_monto' => 'nullable|numeric|min:0',
            'reserva_situacion' => 'boolean',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'estado_id' => 'required|exists:estado,estado_id',
            'agencia_id' => 'nullable|exists:agencia,agencia_id',
            'ruta_activada_id' => 'required|exists:ruta_activada,ruta_activada_id'
        ]);

        // Si cambió la cantidad de pasajeros o ruta, verificar capacidad
        $totalPasajeros = $validated['reserva_cantidad_adultos'] + ($validated['reserva_cantidad_ninos'] ?? 0);
        $pasajerosOriginales = $reserva->total_pasajeros;

        if ($validated['ruta_activada_id'] != $reserva->ruta_activada_id || $totalPasajeros != $pasajerosOriginales) {
            $rutaActivada = RutaActivada::find($validated['ruta_activada_id']);
            $espaciosNecesarios = $totalPasajeros - ($validated['ruta_activada_id'] == $reserva->ruta_activada_id ? $pasajerosOriginales : 0);

            if ($rutaActivada->espacios_disponibles < $espaciosNecesarios) {
                return response()->json([
                    'message' => "No hay suficiente espacio. Espacios disponibles: {$rutaActivada->espacios_disponibles}"
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $reserva->update($validated);
        $reserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.servicio']);

        return new ReservaResource($reserva);
    }

    public function destroy(Reserva $reserva)
    {
        // Verificar si tiene facturas
        if ($reserva->facturas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar esta reserva porque tiene facturas asociadas.'
            ], Response::HTTP_CONFLICT);
        }

        $reserva->delete();

        return response()->json([
            'message' => 'Reserva eliminada exitosamente'
        ]);
    }

    public function cambiarEstado(Request $request, Reserva $reserva)
    {
        $validated = $request->validate([
            'estado_codigo' => 'required|exists:estado,estado_codigo'
        ]);

        try {
            $reserva->cambiarEstado($validated['estado_codigo']);
            $reserva->load('estado');

            return new ReservaResource($reserva);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    public function confirmar(Reserva $reserva)
    {
        try {
            $reserva->confirmar();
            return new ReservaResource($reserva->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function ejecutar(Reserva $reserva)
    {
        try {
            $reserva->ejecutar();
            return new ReservaResource($reserva->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function finalizar(Reserva $reserva)
    {
        try {
            $reserva->finalizar();
            return new ReservaResource($reserva->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function cancelar(Reserva $reserva)
    {
        try {
            $reserva->cancelar();
            return new ReservaResource($reserva->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function calcularMonto(Reserva $reserva)
    {
        $montoCalculado = $reserva->calcularMonto();

        return response()->json([
            'reserva' => new ReservaResource($reserva),
            'monto_actual' => $reserva->reserva_monto,
            'monto_calculado' => $montoCalculado,
            'diferencia' => $montoCalculado - $reserva->reserva_monto,
            'necesita_actualizacion' => abs($montoCalculado - $reserva->reserva_monto) > 0.01
        ]);
    }

    public function whatsappConfirmacion(Reserva $reserva)
    {
        if (!$reserva->tieneTelefonoValido()) {
            return response()->json([
                'message' => 'Esta reserva no tiene un teléfono válido para WhatsApp'
            ], Response::HTTP_BAD_REQUEST);
        }

        $mensaje = $reserva->mensajeWhatsAppConfirmacion();
        $link = $reserva->linkWhatsApp($mensaje);

        return response()->json([
            'reserva' => new ReservaResource($reserva),
            'mensaje' => $mensaje,
            'whatsapp_link' => $link,
            'telefono_formateado' => $reserva->telefono_formateado
        ]);
    }

    public function validarDatos(Reserva $reserva)
    {
        $validaciones = [
            'datos_completos' => $reserva->datosCompletos(),
            'telefono_valido' => $reserva->tieneTelefonoValido(),
            'email_valido' => $reserva->tieneEmailValido()
        ];

        $errores = [];

        if (!$validaciones['datos_completos']) {
            $errores[] = 'Los datos de la reserva están incompletos';
        }

        if (!$validaciones['telefono_valido']) {
            $errores[] = 'El teléfono no es válido';
        }

        if ($reserva->reserva_email_cliente && !$validaciones['email_valido']) {
            $errores[] = 'El email no tiene un formato válido';
        }

        return response()->json([
            'reserva' => new ReservaResource($reserva),
            'validaciones' => $validaciones,
            'errores' => $errores,
            'es_valido' => empty($errores)
        ]);
    }

    public function hoy()
    {
        $reservasHoy = Reserva::hoy()
            ->with(['usuario.persona', 'estado', 'agencia', 'rutaActivada.servicio'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ReservaResource::collection($reservasHoy);
    }

    public function pendientes()
    {
        $reservasPendientes = Reserva::pendientes()
            ->with(['usuario.persona', 'estado', 'agencia', 'rutaActivada'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ReservaResource::collection($reservasPendientes);
    }

    public function confirmadas()
    {
        $reservasConfirmadas = Reserva::confirmadas()
            ->with(['usuario.persona', 'estado', 'agencia', 'rutaActivada'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ReservaResource::collection($reservasConfirmadas);
    }

    public function porVendedor($vendedorId)
    {
        $reservasVendedor = Reserva::where('usuario_id', $vendedorId)
            ->with(['estado', 'agencia', 'rutaActivada.servicio'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ReservaResource::collection($reservasVendedor);
    }

    public function porAgencia($agenciaId)
    {
        $reservasAgencia = Reserva::where('agencia_id', $agenciaId)
            ->with(['usuario.persona', 'estado', 'rutaActivada.servicio'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ReservaResource::collection($reservasAgencia);
    }

    public function buscarCliente(Request $request)
    {
        $validated = $request->validate([
            'termino' => 'required|string|min:3'
        ]);

        $reservas = Reserva::buscarCliente($validated['termino'])
            ->with(['estado', 'agencia', 'rutaActivada.servicio'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return ReservaResource::collection($reservas);
    }

    public function resumenCompleto(Reserva $reserva)
    {
        $resumen = $reserva->resumenCompleto();

        return response()->json($resumen);
    }

    public function duplicar(Reserva $reserva)
    {
        $nuevaReserva = $reserva->replicate([
            'reserva_codigo',
            'created_at',
            'updated_at'
        ]);

        $nuevaReserva->reserva_codigo = null;

        // Cambiar estado a pendiente
        $estadoPendiente = \App\Models\Estado::where('estado_codigo', 'RES_PEND')->first();
        if ($estadoPendiente) {
            $nuevaReserva->estado_id = $estadoPendiente->estado_id;
        }

        $nuevaReserva->save();

        // Generar nuevo código
        $nuevaReserva->reserva_codigo = $nuevaReserva->generarCodigoUnico();
        $nuevaReserva->save();

        $nuevaReserva->load(['usuario.persona', 'estado', 'agencia', 'rutaActivada.servicio']);
        return new ReservaResource($nuevaReserva);
    }

    public function stats()
    {
        $stats = [
            'total' => Reserva::count(),
            'activas' => Reserva::activo()->count(),
            'hoy' => Reserva::hoy()->count(),
            'por_estado' => [
                'pendientes' => Reserva::pendientes()->count(),
                'confirmadas' => Reserva::confirmadas()->count(),
                'ejecutandose' => Reserva::ejecutandose()->count(),
                'finalizadas' => Reserva::finalizadas()->count(),
                'canceladas' => Reserva::canceladas()->count()
            ],
            'por_tipo' => [
                'agencias' => Reserva::deAgencias()->count(),
                'directas' => Reserva::directas()->count()
            ],
            'ingresos' => [
                'total' => Reserva::activo()->sum('reserva_monto'),
                'hoy' => Reserva::hoy()->sum('reserva_monto'),
                'mes_actual' => Reserva::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->sum('reserva_monto')
            ],
            'pasajeros' => [
                'total_mes' => Reserva::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->sum(\DB::raw('reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)')),
                'promedio_por_reserva' => Reserva::activo()
                    ->get()
                    ->avg(function ($reserva) {
                        return $reserva->total_pasajeros;
                    })
            ],
            'top_vendedores' => Reserva::selectRaw('usuario_id, COUNT(*) as total_reservas, SUM(reserva_monto) as total_ingresos')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->with('usuario.persona')
                ->groupBy('usuario_id')
                ->orderByDesc('total_reservas')
                ->limit(5)
                ->get()
                ->map(function ($reserva) {
                    return [
                        'vendedor' => $reserva->usuario->nombre_completo,
                        'reservas' => $reserva->total_reservas,
                        'ingresos' => $reserva->total_ingresos
                    ];
                })
        ];

        return response()->json($stats);
    }
}
