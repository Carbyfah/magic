<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TipoPersonaResource;
use App\Models\TipoPersona;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class TipoPersonaController extends Controller
{
    public function index(Request $request)
    {
        $query = TipoPersona::query();

        // Filtros
        if ($request->filled('activo')) {
            $query->where('tipo_persona_situacion', $request->boolean('activo'));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('tipo_persona_codigo', 'like', "%{$request->search}%")
                    ->orWhere('tipo_persona_tipo', 'like', "%{$request->search}%");
            });
        }

        // Incluir relaciones
        if ($request->has('with_personas_count')) {
            $query->withCount('personas');
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'tipo_persona_codigo');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        // Paginación o todos los registros
        if ($request->has('all')) {
            $tiposPersona = $query->get();
            return TipoPersonaResource::collection($tiposPersona);
        }

        $tiposPersona = $query->paginate($request->get('per_page', 15));
        return TipoPersonaResource::collection($tiposPersona);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_persona_codigo' => 'required|string|max:45|unique:tipo_persona',
            'tipo_persona_tipo' => 'required|string|max:45',
            'tipo_persona_situacion' => 'boolean'
        ]);

        $tipoPersona = TipoPersona::create($validated);

        return new TipoPersonaResource($tipoPersona);
    }

    public function show(TipoPersona $tipoPersona)
    {
        return new TipoPersonaResource($tipoPersona);
    }

    public function update(Request $request, TipoPersona $tipoPersona)
    {
        $validated = $request->validate([
            'tipo_persona_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('tipo_persona')->ignore($tipoPersona->tipo_persona_id, 'tipo_persona_id')
            ],
            'tipo_persona_tipo' => 'required|string|max:45',
            'tipo_persona_situacion' => 'boolean'
        ]);

        $tipoPersona->update($validated);

        return new TipoPersonaResource($tipoPersona);
    }

    public function destroy(TipoPersona $tipoPersona)
    {
        // Verificar si tiene personas asociadas
        if ($tipoPersona->personas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar este tipo de persona porque tiene personas asociadas.'
            ], Response::HTTP_CONFLICT);
        }

        $tipoPersona->delete();

        return response()->json([
            'message' => 'Tipo de persona eliminado exitosamente'
        ]);
    }

    public function activate(TipoPersona $tipoPersona)
    {
        $tipoPersona->update(['tipo_persona_situacion' => true]);

        return new TipoPersonaResource($tipoPersona);
    }

    public function deactivate(TipoPersona $tipoPersona)
    {
        $tipoPersona->update(['tipo_persona_situacion' => false]);

        return new TipoPersonaResource($tipoPersona);
    }

    public function byCode(Request $request, $codigo)
    {
        $tipoPersona = TipoPersona::where('tipo_persona_codigo', $codigo)->first();

        if (!$tipoPersona) {
            return response()->json([
                'message' => 'Tipo de persona no encontrado'
            ], Response::HTTP_NOT_FOUND);
        }

        return new TipoPersonaResource($tipoPersona);
    }

    public function empleados()
    {
        $tiposEmpleado = TipoPersona::whereIn('tipo_persona_codigo', ['ADMIN', 'VEND', 'CHOF'])
            ->activo()
            ->get();

        return TipoPersonaResource::collection($tiposEmpleado);
    }

    public function stats()
    {
        $stats = [
            'total' => TipoPersona::count(),
            'activos' => TipoPersona::activo()->count(),
            'con_personas' => TipoPersona::has('personas')->count(),
            'por_tipo' => TipoPersona::activo()
                ->withCount('personas')
                ->get()
                ->map(function ($tipo) {
                    return [
                        'codigo' => $tipo->tipo_persona_codigo,
                        'tipo' => $tipo->tipo_persona_tipo,
                        'personas_count' => $tipo->personas_count
                    ];
                })
        ];

        return response()->json($stats);
    }
}
