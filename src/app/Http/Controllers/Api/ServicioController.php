<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServicioResource;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ServicioController extends Controller
{
    public function index(Request $request)
    {
        $query = Servicio::query();

        // Filtros
        if ($request->filled('activo')) {
            $query->where('servicio_situacion', $request->boolean('activo'));
        }

        if ($request->filled('tipo')) {
            switch ($request->tipo) {
                case 'tour':
                    $query->tours();
                    break;
                case 'transporte':
                    $query->transporte();
                    break;
                case 'shuttle':
                    $query->shuttle();
                    break;
            }
        }

        if ($request->filled('con_precio')) {
            $query->conPrecio();
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('servicio_codigo', 'like', "%{$request->search}%")
                    ->orWhere('servicio_servicio', 'like', "%{$request->search}%");
            });
        }

        // Incluir estadísticas si se requiere
        if ($request->has('include_estadisticas')) {
            $query->withCount(['rutasActivadas', 'facturas']);
        }

        $sortField = $request->get('sort', 'servicio_codigo');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return ServicioResource::collection($query->get());
        }

        $servicios = $query->paginate($request->get('per_page', 15));
        return ServicioResource::collection($servicios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'servicio_codigo' => 'required|string|max:45|unique:servicio',
            'servicio_servicio' => 'required|string|max:100',
            'servicio_precio_normal' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_precio_descuento' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_precio_total' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_situacion' => 'boolean'
        ]);

        $servicio = Servicio::create($validated);

        return new ServicioResource($servicio);
    }

    public function show(Servicio $servicio)
    {
        return new ServicioResource($servicio);
    }

    public function update(Request $request, Servicio $servicio)
    {
        $validated = $request->validate([
            'servicio_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('servicio')->ignore($servicio->servicio_id, 'servicio_id')
            ],
            'servicio_servicio' => 'required|string|max:100',
            'servicio_precio_normal' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_precio_descuento' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_precio_total' => 'nullable|numeric|min:0|max:99999999.99',
            'servicio_situacion' => 'boolean'
        ]);

        $servicio->update($validated);

        return new ServicioResource($servicio);
    }

    public function destroy(Servicio $servicio)
    {
        // Verificar si tiene rutas activadas o facturas
        if ($servicio->rutasActivadas()->exists() || $servicio->facturas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar este servicio porque tiene rutas activadas o facturas asociadas.'
            ], Response::HTTP_CONFLICT);
        }

        $servicio->delete();

        return response()->json([
            'message' => 'Servicio eliminado exitosamente'
        ]);
    }

    public function calcularPrecio(Request $request, Servicio $servicio)
    {
        $validated = $request->validate([
            'adultos' => 'required|integer|min:1|max:50',
            'ninos' => 'nullable|integer|min:0|max:50',
            'es_agencia' => 'boolean'
        ]);

        if (!$servicio->tienePreciosCompletos()) {
            return response()->json([
                'message' => 'Este servicio no tiene precios configurados'
            ], Response::HTTP_BAD_REQUEST);
        }

        $precio = $servicio->calcularPrecio(
            $validated['adultos'],
            $validated['ninos'] ?? 0,
            $validated['es_agencia'] ?? false
        );

        return response()->json([
            'servicio' => new ServicioResource($servicio),
            'calculo' => [
                'adultos' => $validated['adultos'],
                'ninos' => $validated['ninos'] ?? 0,
                'es_agencia' => $validated['es_agencia'] ?? false,
                'precio_total' => $precio,
                'precio_por_adulto' => $validated['es_agencia']
                    ? $servicio->servicio_precio_descuento
                    : $servicio->servicio_precio_normal,
                'precio_por_nino' => $validated['es_agencia']
                    ? $servicio->precio_ninos_descuento
                    : $servicio->precio_ninos_normal
            ]
        ]);
    }

    public function porTipo($tipo)
    {
        $query = Servicio::activo();

        switch ($tipo) {
            case 'tours':
                $query->tours();
                break;
            case 'transporte':
                $query->transporte();
                break;
            case 'shuttle':
                $query->shuttle();
                break;
            default:
                return response()->json([
                    'message' => 'Tipo de servicio no válido'
                ], Response::HTTP_BAD_REQUEST);
        }

        $servicios = $query->orderBy('servicio_servicio')->get();
        return ServicioResource::collection($servicios);
    }

    public function populares()
    {
        $servicios = Servicio::activo()
            ->withCount(['rutasActivadas' => function ($query) {
                $query->where('created_at', '>=', now()->subMonth());
            }])
            ->orderByDesc('rutas_activadas_count')
            ->limit(10)
            ->get();

        return ServicioResource::collection($servicios);
    }

    public function stats()
    {
        $stats = [
            'total' => Servicio::count(),
            'activos' => Servicio::activo()->count(),
            'con_precio' => Servicio::conPrecio()->count(),
            'por_tipo' => [
                'tours' => Servicio::tours()->count(),
                'transporte' => Servicio::transporte()->count(),
                'shuttle' => Servicio::shuttle()->count()
            ],
            'mas_utilizados' => Servicio::activo()
                ->withCount(['rutasActivadas', 'facturas'])
                ->get()
                ->sortByDesc('rutas_activadas_count')
                ->take(5)
                ->map(function ($servicio) {
                    return [
                        'codigo' => $servicio->servicio_codigo,
                        'nombre' => $servicio->servicio_servicio,
                        'tipo' => $servicio->tipo_servicio,
                        'usos' => $servicio->rutas_activadas_count
                    ];
                })
                ->values()
        ];

        return response()->json($stats);
    }

    public function activate(Servicio $servicio)
    {
        $servicio->update(['servicio_situacion' => true]);
        return new ServicioResource($servicio);
    }

    public function deactivate(Servicio $servicio)
    {
        $servicio->update(['servicio_situacion' => false]);
        return new ServicioResource($servicio);
    }

    public function duplicar(Servicio $servicio)
    {
        $nuevoServicio = $servicio->replicate();
        $nuevoServicio->servicio_codigo = $servicio->servicio_codigo . '_COPY';
        $nuevoServicio->servicio_servicio = $servicio->servicio_servicio . ' (Copia)';
        $nuevoServicio->save();

        return new ServicioResource($nuevoServicio);
    }
}
