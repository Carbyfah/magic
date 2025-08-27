<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EstadoResource;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class EstadoController extends Controller
{
    public function index(Request $request)
    {
        $query = Estado::query();

        // Filtros por categoría
        if ($request->filled('categoria')) {
            switch ($request->categoria) {
                case 'reservas':
                    $query->deReservas();
                    break;
                case 'rutas':
                    $query->deRutas();
                    break;
                case 'vehiculos':
                    $query->deVehiculos();
                    break;
                case 'facturas':
                    $query->deFacturas();
                    break;
            }
        }

        if ($request->filled('activo')) {
            $query->where('estado_situacion', $request->boolean('activo'));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('estado_codigo', 'like', "%{$request->search}%")
                    ->orWhere('estado_estado', 'like', "%{$request->search}%")
                    ->orWhere('estado_descripcion', 'like', "%{$request->search}%");
            });
        }

        // Incluir contadores de uso
        if ($request->has('with_counts')) {
            $query->withCount(['reservas', 'rutasActivadas', 'vehiculos']);
        }

        // Incluir transiciones si se requiere
        if ($request->has('include_transiciones')) {
            $request->request->add(['include_transiciones' => true]);
        }

        $sortField = $request->get('sort', 'estado_codigo');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return EstadoResource::collection($query->get());
        }

        $estados = $query->paginate($request->get('per_page', 15));
        return EstadoResource::collection($estados);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'estado_codigo' => 'required|string|max:45|unique:estado',
            'estado_estado' => 'required|string|max:45',
            'estado_descripcion' => 'nullable|string|max:45',
            'estado_situacion' => 'boolean'
        ]);

        $estado = Estado::create($validated);

        return new EstadoResource($estado);
    }

    public function show(Estado $estado)
    {
        return new EstadoResource($estado);
    }

    public function update(Request $request, Estado $estado)
    {
        $validated = $request->validate([
            'estado_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('estado')->ignore($estado->estado_id, 'estado_id')
            ],
            'estado_estado' => 'required|string|max:45',
            'estado_descripcion' => 'nullable|string|max:45',
            'estado_situacion' => 'boolean'
        ]);

        $estado->update($validated);

        return new EstadoResource($estado);
    }

    public function destroy(Estado $estado)
    {
        // Verificar si está en uso
        $enUso = $estado->reservas()->exists() ||
            $estado->rutasActivadas()->exists() ||
            $estado->vehiculos()->exists();

        if ($enUso) {
            return response()->json([
                'message' => 'No se puede eliminar este estado porque está siendo utilizado.'
            ], Response::HTTP_CONFLICT);
        }

        $estado->delete();

        return response()->json([
            'message' => 'Estado eliminado exitosamente'
        ]);
    }

    public function byCode($codigo)
    {
        $estado = Estado::where('estado_codigo', $codigo)->first();

        if (!$estado) {
            return response()->json([
                'message' => 'Estado no encontrado'
            ], Response::HTTP_NOT_FOUND);
        }

        return new EstadoResource($estado);
    }

    public function byCategoria($categoria)
    {
        $query = Estado::activo();

        switch ($categoria) {
            case 'reservas':
                $query->deReservas();
                break;
            case 'rutas':
                $query->deRutas();
                break;
            case 'vehiculos':
                $query->deVehiculos();
                break;
            case 'facturas':
                $query->deFacturas();
                break;
            default:
                return response()->json([
                    'message' => 'Categoría no válida'
                ], Response::HTTP_BAD_REQUEST);
        }

        $estados = $query->orderBy('estado_codigo')->get();
        return EstadoResource::collection($estados);
    }

    public function transiciones(Estado $estado)
    {
        $transiciones = [
            'RES_PEND' => ['RES_CONF', 'RES_CANC'],
            'RES_CONF' => ['RES_EJEC', 'RES_CANC'],
            'RES_EJEC' => ['RES_FIN'],
            'RUT_PROG' => ['RUT_INIC', 'RUT_CANC'],
            'RUT_INIC' => ['RUT_FIN'],
            'VEH_DISP' => ['VEH_OCUP', 'VEH_MANT', 'VEH_INAR'],
            'VEH_OCUP' => ['VEH_DISP', 'VEH_MANT'],
            'VEH_MANT' => ['VEH_DISP', 'VEH_INAR']
        ];

        $transicionesPosibles = $transiciones[$estado->estado_codigo] ?? [];

        $estadosDestino = Estado::whereIn('estado_codigo', $transicionesPosibles)
            ->activo()
            ->get();

        return response()->json([
            'estado_actual' => new EstadoResource($estado),
            'puede_transicionar_a' => EstadoResource::collection($estadosDestino)
        ]);
    }

    public function validarTransicion(Request $request)
    {
        $validated = $request->validate([
            'estado_origen' => 'required|exists:estado,estado_codigo',
            'estado_destino' => 'required|exists:estado,estado_codigo'
        ]);

        $estadoOrigen = Estado::where('estado_codigo', $validated['estado_origen'])->first();
        $estadoDestino = Estado::where('estado_codigo', $validated['estado_destino'])->first();

        $esValida = $estadoOrigen->permiteTransicion($validated['estado_destino']);

        return response()->json([
            'transicion_valida' => $esValida,
            'estado_origen' => new EstadoResource($estadoOrigen),
            'estado_destino' => new EstadoResource($estadoDestino)
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => Estado::count(),
            'activos' => Estado::activo()->count(),
            'por_categoria' => [
                'reservas' => Estado::deReservas()->count(),
                'rutas' => Estado::deRutas()->count(),
                'vehiculos' => Estado::deVehiculos()->count(),
                'facturas' => Estado::deFacturas()->count()
            ],
            'uso_actual' => Estado::activo()
                ->withCount(['reservas', 'rutasActivadas', 'vehiculos'])
                ->get()
                ->map(function ($estado) {
                    return [
                        'codigo' => $estado->estado_codigo,
                        'nombre' => $estado->estado_estado,
                        'categoria' => $estado->categoria_estado,
                        'uso_total' => $estado->reservas_count +
                            $estado->rutas_activadas_count +
                            $estado->vehiculos_count
                    ];
                })
                ->sortByDesc('uso_total')
                ->values()
        ];

        return response()->json($stats);
    }

    public function iniciales()
    {
        $estados = Estado::activo()
            ->get()
            ->filter(function ($estado) {
                return $estado->esEstadoInicial();
            });

        return EstadoResource::collection($estados->values());
    }

    public function finales()
    {
        $estados = Estado::activo()
            ->get()
            ->filter(function ($estado) {
                return $estado->esEstadoFinal();
            });

        return EstadoResource::collection($estados->values());
    }
}
