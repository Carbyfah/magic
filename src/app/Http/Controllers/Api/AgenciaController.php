<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgenciaResource;
use App\Models\Agencia;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class AgenciaController extends Controller
{
    public function index(Request $request)
    {
        $query = Agencia::query();

        // Filtros
        if ($request->filled('activo')) {
            $query->where('agencia_situacion', $request->boolean('activo'));
        }

        if ($request->filled('tipo')) {
            switch ($request->tipo) {
                case 'internacional':
                    $query->internacionales();
                    break;
                case 'operador_turistico':
                    $query->operadoresTuristicos();
                    break;
                case 'vip':
                    $query->where(function ($q) {
                        $q->whereHas('reservas', function ($subq) {
                            $subq->where('created_at', '>=', now()->subMonths(3));
                        }, '>', 25)
                            ->orWhereHas('reservas', function ($subq) {
                                $subq->where('created_at', '>=', now()->startOfMonth());
                            }, '>', 10);
                    });
                    break;
            }
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('agencia_codigo', 'like', "%{$request->search}%")
                    ->orWhere('agencia_razon_social', 'like', "%{$request->search}%")
                    ->orWhere('agencia_nit', 'like', "%{$request->search}%")
                    ->orWhere('agencia_email', 'like', "%{$request->search}%");
            });
        }

        // Incluir relaciones
        if ($request->has('with_contactos')) {
            $query->with(['contactos' => function ($q) {
                $q->where('contactos_agencia_situacion', true);
            }]);
        }

        if ($request->has('with_contacto_principal')) {
            $query->with('contactoPrincipal');
        }

        if ($request->has('include_reservas')) {
            $query->with(['reservas' => function ($q) {
                $q->latest()->limit(5);
            }]);
        }

        // Contadores
        if ($request->has('with_counts')) {
            $query->withCount(['contactos', 'reservas']);
        }

        $sortField = $request->get('sort', 'agencia_razon_social');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return AgenciaResource::collection($query->get());
        }

        $agencias = $query->paginate($request->get('per_page', 15));
        return AgenciaResource::collection($agencias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'agencia_codigo' => 'required|string|max:45|unique:agencia',
            'agencia_razon_social' => 'required|string|max:45',
            'agencia_nit' => 'nullable|string|max:45',
            'agencia_email' => 'nullable|email|max:45',
            'agencia_telefono' => 'nullable|integer|min:10000000|max:999999999999',
            'agencia_situacion' => 'boolean'
        ]);

        $agencia = Agencia::create($validated);

        return new AgenciaResource($agencia);
    }

    public function show(Agencia $agencia)
    {
        // Cargar relaciones necesarias
        $agencia->load(['contactos', 'contactoPrincipal']);

        return new AgenciaResource($agencia);
    }

    public function update(Request $request, Agencia $agencia)
    {
        $validated = $request->validate([
            'agencia_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('agencia')->ignore($agencia->agencia_id, 'agencia_id')
            ],
            'agencia_razon_social' => 'required|string|max:45',
            'agencia_nit' => 'nullable|string|max:45',
            'agencia_email' => 'nullable|email|max:45',
            'agencia_telefono' => 'nullable|integer|min:10000000|max:999999999999',
            'agencia_situacion' => 'boolean'
        ]);

        $agencia->update($validated);

        return new AgenciaResource($agencia);
    }

    public function destroy(Agencia $agencia)
    {
        // Verificar si tiene reservas
        if ($agencia->reservas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar esta agencia porque tiene reservas asociadas.'
            ], Response::HTTP_CONFLICT);
        }

        $agencia->delete();

        return response()->json([
            'message' => 'Agencia eliminada exitosamente'
        ]);
    }

    public function activate(Agencia $agencia)
    {
        $agencia->update(['agencia_situacion' => true]);
        return new AgenciaResource($agencia);
    }

    public function deactivate(Agencia $agencia)
    {
        $agencia->update(['agencia_situacion' => false]);
        return new AgenciaResource($agencia);
    }

    public function vip()
    {
        $agenciasVip = Agencia::activo()
            ->where(function ($q) {
                $q->whereHas('reservas', function ($subq) {
                    $subq->where('created_at', '>=', now()->subMonths(3));
                }, '>', 25)
                    ->orWhereHas('reservas', function ($subq) {
                        $subq->where('created_at', '>=', now()->startOfMonth());
                    }, '>', 10);
            })
            ->withCount('reservas')
            ->orderByDesc('reservas_count')
            ->get();

        return AgenciaResource::collection($agenciasVip);
    }

    public function inactivas()
    {
        $agenciasInactivas = Agencia::activo()
            ->whereDoesntHave('reservas', function ($q) {
                $q->where('created_at', '>=', now()->subMonths(2));
            })
            ->withCount('reservas')
            ->orderBy('updated_at')
            ->get();

        return AgenciaResource::collection($agenciasInactivas);
    }

    public function estadisticasComerciales(Agencia $agencia)
    {
        $stats = [
            'agencia' => new AgenciaResource($agencia),
            'reservas' => [
                'total' => $agencia->reservas()->count(),
                'mes_actual' => $agencia->getTotalReservasMes(),
                'ultimos_3_meses' => $agencia->reservas()
                    ->where('created_at', '>=', now()->subMonths(3))
                    ->count()
            ],
            'ingresos' => [
                'total' => $agencia->ingresosTotales(),
                'mes_actual' => $agencia->ingresosTotales(now()->startOfMonth(), now()),
                'comisiones_generadas' => $agencia->comisionesGeneradas()
            ],
            'actividad' => [
                'es_vip' => $agencia->esClienteVip(),
                'esta_activa' => $agencia->estaActiva(),
                'necesita_seguimiento' => $agencia->necesitaSeguimiento(),
                'ultima_reserva' => $agencia->reservas()->latest()->first()?->created_at
            ]
        ];

        return response()->json($stats);
    }

    public function reservasRecientes(Agencia $agencia)
    {
        $reservas = $agencia->reservasUltimoMes();

        return response()->json([
            'agencia' => new AgenciaResource($agencia),
            'reservas' => $reservas->map(function ($reserva) {
                return [
                    'codigo' => $reserva->reserva_codigo,
                    'cliente' => $reserva->nombre_completo_cliente,
                    'pasajeros' => $reserva->total_pasajeros,
                    'monto' => $reserva->reserva_monto,
                    'fecha' => $reserva->created_at->format('Y-m-d H:i'),
                    'estado' => $reserva->estado?->estado_estado
                ];
            })
        ]);
    }

    public function ranking()
    {
        $ranking = Agencia::activo()
            ->withCount(['reservas' => function ($q) {
                $q->where('created_at', '>=', now()->startOfMonth());
            }])
            ->orderByDesc('reservas_count')
            ->limit(20)
            ->get()
            ->map(function ($agencia, $index) {
                return [
                    'posicion' => $index + 1,
                    'agencia' => new AgenciaResource($agencia),
                    'reservas_mes' => $agencia->reservas_count,
                    'ingresos_mes' => $agencia->ingresosTotales(
                        now()->startOfMonth(),
                        now()
                    )
                ];
            });

        return response()->json($ranking);
    }

    public function stats()
    {
        $stats = [
            'total' => Agencia::count(),
            'activas' => Agencia::activo()->count(),
            'con_reservas' => Agencia::conReservas()->count(),
            'vip' => Agencia::activo()
                ->whereHas('reservas', function ($q) {
                    $q->where('created_at', '>=', now()->subMonths(3));
                }, '>', 25)
                ->count(),
            'necesitan_seguimiento' => Agencia::activo()
                ->whereDoesntHave('reservas', function ($q) {
                    $q->where('created_at', '>=', now()->subMonths(2));
                })
                ->count(),
            'por_tipo' => [
                'internacionales' => Agencia::internacionales()->count(),
                'operadores_turisticos' => Agencia::operadoresTuristicos()->count()
            ],
            'ingresos_mes_actual' => Agencia::activo()
                ->get()
                ->sum(function ($agencia) {
                    return $agencia->ingresosTotales(
                        now()->startOfMonth(),
                        now()
                    );
                })
        ];

        return response()->json($stats);
    }
}
