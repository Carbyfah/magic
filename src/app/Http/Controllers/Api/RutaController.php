<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RutaResource;
use App\Models\Ruta;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class RutaController extends Controller
{
    public function index(Request $request)
    {
        $query = Ruta::query();

        // Filtros
        if ($request->filled('activo')) {
            $query->where('ruta_situacion', $request->boolean('activo'));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('ruta_codigo', 'like', "%{$request->search}%")
                    ->orWhere('ruta_ruta', 'like', "%{$request->search}%")
                    ->orWhere('ruta_origen', 'like', "%{$request->search}%")
                    ->orWhere('ruta_destino', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('origen')) {
            $query->where('ruta_origen', 'like', "%{$request->origen}%");
        }

        if ($request->filled('destino')) {
            $query->where('ruta_destino', 'like', "%{$request->destino}%");
        }

        if ($request->filled('tipo')) {
            switch ($request->tipo) {
                case 'aeroporto':
                    $query->conAeropuerto();
                    break;
                case 'desde_guatemala':
                    $query->desdeGuatemala();
                    break;
                case 'hacia_guatemala':
                    $query->haciaGuatemala();
                    break;
                case 'turisticas':
                    $query->where(function ($q) {
                        $destinos = ['antigua', 'atitlan', 'tikal', 'quetzaltenango'];
                        foreach ($destinos as $destino) {
                            $q->orWhere('ruta_destino', 'like', "%{$destino}%");
                        }
                    });
                    break;
            }
        }

        // Incluir estadísticas
        if ($request->has('include_estadisticas')) {
            $query->withCount('rutasActivadas');
        }

        if ($request->has('include_inversa')) {
            $request->request->add(['include_inversa' => true]);
        }

        if ($request->has('include_planificacion')) {
            $request->request->add(['include_planificacion' => true]);
        }

        $sortField = $request->get('sort', 'ruta_codigo');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return RutaResource::collection($query->get());
        }

        $rutas = $query->paginate($request->get('per_page', 15));
        return RutaResource::collection($rutas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ruta_codigo' => 'required|string|max:45|unique:ruta',
            'ruta_ruta' => 'required|string|max:45',
            'ruta_origen' => 'required|string|max:100',
            'ruta_destino' => 'required|string|max:100',
            'ruta_situacion' => 'boolean'
        ]);

        $ruta = Ruta::create($validated);

        return new RutaResource($ruta);
    }

    public function show(Ruta $ruta)
    {
        return new RutaResource($ruta);
    }

    public function update(Request $request, Ruta $ruta)
    {
        $validated = $request->validate([
            'ruta_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('ruta')->ignore($ruta->ruta_id, 'ruta_id')
            ],
            'ruta_ruta' => 'required|string|max:45',
            'ruta_origen' => 'required|string|max:100',
            'ruta_destino' => 'required|string|max:100',
            'ruta_situacion' => 'boolean'
        ]);

        $ruta->update($validated);

        return new RutaResource($ruta);
    }

    public function destroy(Ruta $ruta)
    {
        // Verificar si tiene rutas activadas
        if ($ruta->rutasActivadas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar esta ruta porque tiene rutas activadas asociadas.'
            ], Response::HTTP_CONFLICT);
        }

        $ruta->delete();

        return response()->json([
            'message' => 'Ruta eliminada exitosamente'
        ]);
    }

    public function activate(Ruta $ruta)
    {
        $ruta->update(['ruta_situacion' => true]);
        return new RutaResource($ruta);
    }

    public function deactivate(Ruta $ruta)
    {
        $ruta->update(['ruta_situacion' => false]);
        return new RutaResource($ruta);
    }

    public function buscarInversa(Ruta $ruta)
    {
        $rutaInversa = $ruta->rutaInversa();

        if (!$rutaInversa) {
            return response()->json([
                'message' => 'No existe ruta inversa para esta ruta',
                'ruta_actual' => new RutaResource($ruta),
                'sugerencia' => [
                    'origen' => $ruta->ruta_destino,
                    'destino' => $ruta->ruta_origen,
                    'codigo_sugerido' => $this->generarCodigoInverso($ruta->ruta_codigo)
                ]
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'ruta_actual' => new RutaResource($ruta),
            'ruta_inversa' => new RutaResource($rutaInversa)
        ]);
    }

    public function populares()
    {
        $rutas = Ruta::activo()
            ->withCount(['rutasActivadas' => function ($query) {
                $query->where('created_at', '>=', now()->subMonth());
            }])
            ->having('rutas_activadas_count', '>', 0)
            ->orderByDesc('rutas_activadas_count')
            ->limit(10)
            ->get();

        return RutaResource::collection($rutas);
    }

    public function porTipo($tipo)
    {
        $query = Ruta::activo();

        switch ($tipo) {
            case 'aeroporto':
                $query->conAeropuerto();
                break;
            case 'turisticas':
                $query->where(function ($q) {
                    $destinos = ['antigua', 'atitlan', 'tikal', 'quetzaltenango'];
                    foreach ($destinos as $destino) {
                        $q->orWhere('ruta_destino', 'like', "%{$destino}%");
                    }
                });
                break;
            case 'desde_guatemala':
                $query->desdeGuatemala();
                break;
            case 'hacia_guatemala':
                $query->haciaGuatemala();
                break;
            default:
                return response()->json([
                    'message' => 'Tipo de ruta no válido'
                ], Response::HTTP_BAD_REQUEST);
        }

        $rutas = $query->orderBy('ruta_ruta')->get();
        return RutaResource::collection($rutas);
    }

    public function origenes()
    {
        $origenes = Ruta::activo()
            ->select('ruta_origen')
            ->distinct()
            ->orderBy('ruta_origen')
            ->pluck('ruta_origen');

        return response()->json($origenes);
    }

    public function destinos()
    {
        $destinos = Ruta::activo()
            ->select('ruta_destino')
            ->distinct()
            ->orderBy('ruta_destino')
            ->pluck('ruta_destino');

        return response()->json($destinos);
    }

    public function buscarPorOrigen($origen)
    {
        $rutas = Ruta::activo()
            ->where('ruta_origen', 'like', "%{$origen}%")
            ->orderBy('ruta_destino')
            ->get();

        return RutaResource::collection($rutas);
    }

    public function buscarPorDestino($destino)
    {
        $rutas = Ruta::activo()
            ->where('ruta_destino', 'like', "%{$destino}%")
            ->orderBy('ruta_origen')
            ->get();

        return RutaResource::collection($rutas);
    }

    public function stats()
    {
        $stats = [
            'total' => Ruta::count(),
            'activas' => Ruta::activo()->count(),
            'con_activaciones' => Ruta::has('rutasActivadas')->count(),
            'por_tipo' => [
                'aeroporto' => Ruta::conAeropuerto()->count(),
                'desde_guatemala' => Ruta::desdeGuatemala()->count(),
                'hacia_guatemala' => Ruta::haciaGuatemala()->count()
            ],
            'mas_populares' => Ruta::activo()
                ->withCount(['rutasActivadas' => function ($query) {
                    $query->where('created_at', '>=', now()->subMonth());
                }])
                ->orderByDesc('rutas_activadas_count')
                ->limit(5)
                ->get()
                ->map(function ($ruta) {
                    return [
                        'codigo' => $ruta->ruta_codigo,
                        'nombre' => $ruta->ruta_ruta,
                        'completa' => $ruta->ruta_completa,
                        'activaciones' => $ruta->rutas_activadas_count
                    ];
                })
        ];

        return response()->json($stats);
    }

    private function generarCodigoInverso($codigoOriginal)
    {
        // Lógica simple para generar código inverso
        // Ejemplo: GUATE_ANTI -> ANTI_GUATE
        $partes = explode('_', $codigoOriginal);
        if (count($partes) === 2) {
            return $partes[1] . '_' . $partes[0];
        }

        return $codigoOriginal . '_INV';
    }
}
