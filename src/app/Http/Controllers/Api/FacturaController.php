<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FacturaResource;
use App\Models\Factura;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class FacturaController extends Controller
{
    public function index(Request $request)
    {
        $query = Factura::query();

        if ($request->filled('activo')) {
            $query->where('facturas_situacion', $request->boolean('activo'));
        }

        if ($request->filled('fecha')) {
            $query->whereDate('facturas_fecha', $request->fecha);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('facturas_fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('facturas_fecha', '<=', $request->fecha_hasta);
        }

        if ($request->filled('hoy')) {
            if ($request->boolean('hoy')) {
                $query->hoy();
            }
        }

        if ($request->filled('mes')) {
            $query->delMes($request->mes, $request->get('anio'));
        }

        if ($request->filled('usuario_id')) {
            $query->porUsuario($request->usuario_id);
        }

        if ($request->filled('servicio_id')) {
            $query->porServicio($request->servicio_id);
        }

        if ($request->filled('con_archivo')) {
            if ($request->boolean('con_archivo')) {
                $query->conArchivo();
            } else {
                $query->sinArchivo();
            }
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('facturas_codigo', 'like', "%{$request->search}%")
                    ->orWhereHas('reserva', function ($subq) use ($request) {
                        $subq->where('reserva_nombres_cliente', 'like', "%{$request->search}%")
                            ->orWhere('reserva_apellidos_cliente', 'like', "%{$request->search}%");
                    });
            });
        }

        if ($request->has('with_relations')) {
            $query->with(['usuario.persona', 'servicio', 'reserva']);
        }

        if ($request->has('resumen_completo')) {
            $request->request->add(['resumen_completo' => true]);
        }

        $sortField = $request->get('sort', 'facturas_fecha');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return FacturaResource::collection($query->get());
        }

        $facturas = $query->paginate($request->get('per_page', 15));
        return FacturaResource::collection($facturas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'facturas_codigo' => 'nullable|string|max:45|unique:facturas',
            'facturas_url' => 'nullable|string|max:600',
            'facturas_hash' => 'nullable|string|max:64',
            'facturas_fecha' => 'nullable|datetime',
            'facturas_situacion' => 'boolean',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'reserva_id' => 'required|exists:reserva,reserva_id|unique:facturas'
        ]);

        // Verificar que la reserva esté en estado ejecutada o finalizada
        $reserva = \App\Models\Reserva::find($validated['reserva_id']);
        if (!$reserva->seEstaEjecutando() && !$reserva->estaFinalizada()) {
            return response()->json([
                'message' => 'Solo se pueden crear facturas para reservas ejecutándose o finalizadas'
            ], Response::HTTP_BAD_REQUEST);
        }

        $factura = Factura::create($validated);

        // Generar datos automáticos
        if (!$validated['facturas_codigo']) {
            $factura->facturas_codigo = $factura->generarCodigoUnico();
        }

        $factura->establecerFecha();
        $factura->establecerHash();
        $factura->save();

        $factura->load(['usuario.persona', 'servicio', 'reserva']);
        return new FacturaResource($factura);
    }

    public function show(Factura $factura)
    {
        $factura->load(['usuario.persona', 'servicio', 'reserva']);
        return new FacturaResource($factura);
    }

    public function update(Request $request, Factura $factura)
    {
        if (!$factura->puedeEditarse()) {
            return response()->json([
                'message' => 'Esta factura ya no puede ser editada'
            ], Response::HTTP_BAD_REQUEST);
        }

        $validated = $request->validate([
            'facturas_codigo' => [
                'nullable',
                'string',
                'max:45',
                Rule::unique('facturas')->ignore($factura->facturas_id, 'facturas_id')
            ],
            'facturas_url' => 'nullable|string|max:600',
            'facturas_situacion' => 'boolean',
            'usuario_id' => 'required|exists:usuario,usuario_id',
            'servicio_id' => 'required|exists:servicio,servicio_id',
            'reserva_id' => [
                'required',
                'exists:reserva,reserva_id',
                Rule::unique('facturas')->ignore($factura->facturas_id, 'facturas_id')
            ]
        ]);

        $factura->update($validated);

        // Regenerar hash si cambió información crítica
        $factura->establecerHash();

        $factura->load(['usuario.persona', 'servicio', 'reserva']);
        return new FacturaResource($factura);
    }

    public function destroy(Factura $factura)
    {
        if (!$factura->puedeAnularse()) {
            return response()->json([
                'message' => 'Esta factura ya no puede ser eliminada'
            ], Response::HTTP_BAD_REQUEST);
        }

        $factura->delete();

        return response()->json([
            'message' => 'Factura eliminada exitosamente'
        ]);
    }

    public function anular(Factura $factura)
    {
        try {
            $factura->anular();
            return new FacturaResource($factura);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    public function establecerArchivo(Request $request, Factura $factura)
    {
        $validated = $request->validate([
            'url' => 'required|string|max:600|url'
        ]);

        $factura->establecerURL($validated['url']);

        return new FacturaResource($factura);
    }

    public function validarIntegridad(Factura $factura)
    {
        $esValida = $factura->validarIntegridad();

        return response()->json([
            'factura' => new FacturaResource($factura),
            'integridad_valida' => $esValida,
            'hash_actual' => $factura->facturas_hash,
            'hash_calculado' => $factura->generarHash()
        ]);
    }

    public function generarNombreArchivo(Factura $factura)
    {
        $nombreSugerido = $factura->generarNombreArchivo();

        return response()->json([
            'factura' => new FacturaResource($factura),
            'nombre_sugerido' => $nombreSugerido,
            'cliente' => $factura->getClienteFacturado()
        ]);
    }

    public function hoy()
    {
        $facturasHoy = Factura::hoy()
            ->with(['usuario.persona', 'servicio', 'reserva'])
            ->orderBy('facturas_fecha', 'desc')
            ->get();

        return FacturaResource::collection($facturasHoy);
    }

    public function delMes($mes = null, $anio = null)
    {
        $facturasMes = Factura::delMes($mes, $anio)
            ->activo()
            ->with(['usuario.persona', 'servicio', 'reserva'])
            ->orderBy('facturas_fecha', 'desc')
            ->get();

        return FacturaResource::collection($facturasMes);
    }

    public function sinArchivo()
    {
        $facturasSinArchivo = Factura::sinArchivo()
            ->activo()
            ->with(['usuario.persona', 'servicio', 'reserva'])
            ->orderBy('facturas_fecha', 'desc')
            ->get();

        return FacturaResource::collection($facturasSinArchivo);
    }

    public function porUsuario($usuarioId)
    {
        $facturasUsuario = Factura::porUsuario($usuarioId)
            ->activo()
            ->with(['servicio', 'reserva'])
            ->orderBy('facturas_fecha', 'desc')
            ->get();

        return FacturaResource::collection($facturasUsuario);
    }

    public function reporteMensual(Request $request)
    {
        $mes = $request->get('mes', now()->month);
        $anio = $request->get('anio', now()->year);

        $reporte = [
            'periodo' => [
                'mes' => $mes,
                'anio' => $anio,
                'nombre_mes' => \Carbon\Carbon::create($anio, $mes)->monthName
            ],
            'totales' => [
                'cantidad_facturas' => Factura::cantidadFacturasMes($mes, $anio),
                'monto_facturado' => Factura::totalFacturadoMes($mes, $anio)
            ],
            'por_vendedor' => Factura::delMes($mes, $anio)
                ->activo()
                ->with(['usuario.persona', 'reserva'])
                ->get()
                ->groupBy('usuario_id')
                ->map(function ($facturas) {
                    return [
                        'vendedor' => $facturas->first()->usuario->nombre_completo,
                        'cantidad' => $facturas->count(),
                        'monto_total' => $facturas->sum(function ($f) {
                            return $f->getMontoFacturado();
                        })
                    ];
                })
                ->sortByDesc('cantidad')
                ->values(),
            'por_servicio' => Factura::delMes($mes, $anio)
                ->activo()
                ->with(['servicio', 'reserva'])
                ->get()
                ->groupBy('servicio_id')
                ->map(function ($facturas) {
                    return [
                        'servicio' => $facturas->first()->servicio->servicio_servicio,
                        'cantidad' => $facturas->count(),
                        'monto_total' => $facturas->sum(function ($f) {
                            return $f->getMontoFacturado();
                        })
                    ];
                })
                ->sortByDesc('monto_total')
                ->values(),
            'por_tipo_cliente' => [
                'agencias' => Factura::delMes($mes, $anio)
                    ->activo()
                    ->get()
                    ->filter(function ($f) {
                        return $f->esFacturaDeAgencia();
                    })
                    ->sum(function ($f) {
                        return $f->getMontoFacturado();
                    }),
                'directos' => Factura::delMes($mes, $anio)
                    ->activo()
                    ->get()
                    ->filter(function ($f) {
                        return !$f->esFacturaDeAgencia();
                    })
                    ->sum(function ($f) {
                        return $f->getMontoFacturado();
                    })
            ]
        ];

        return response()->json($reporte);
    }

    public function resumenCompleto(Factura $factura)
    {
        $resumen = $factura->resumenCompleto();

        return response()->json($resumen);
    }

    public function stats()
    {
        $stats = [
            'total' => Factura::count(),
            'activas' => Factura::activo()->count(),
            'hoy' => Factura::hoy()->count(),
            'mes_actual' => Factura::delMes()->count(),
            'con_archivo' => Factura::conArchivo()->count(),
            'sin_archivo' => Factura::sinArchivo()->count(),
            'montos' => [
                'total_facturado' => Factura::totalFacturadoMes(),
                'facturado_hoy' => Factura::hoy()
                    ->get()
                    ->sum(function ($f) {
                        return $f->getMontoFacturado();
                    }),
                'promedio_por_factura' => Factura::activo()
                    ->get()
                    ->avg(function ($f) {
                        return $f->getMontoFacturado();
                    })
            ],
            'por_tipo' => [
                'agencias' => Factura::activo()
                    ->get()
                    ->filter(function ($f) {
                        return $f->esFacturaDeAgencia();
                    })
                    ->count(),
                'clientes_directos' => Factura::activo()
                    ->get()
                    ->filter(function ($f) {
                        return !$f->esFacturaDeAgencia();
                    })
                    ->count()
            ]
        ];

        return response()->json($stats);
    }
}
