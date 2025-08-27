<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehiculoResource;
use App\Models\Vehiculo;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class VehiculoController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehiculo::query();

        if ($request->filled('activo')) {
            $query->where('vehiculo_situacion', $request->boolean('activo'));
        }

        if ($request->filled('estado')) {
            $query->whereHas('estado', function ($q) use ($request) {
                $q->where('estado_codigo', $request->estado);
            });
        }

        if ($request->filled('disponibles')) {
            if ($request->boolean('disponibles')) {
                $query->disponibles();
            }
        }

        if ($request->filled('capacidad_minima')) {
            $query->porCapacidad($request->capacidad_minima);
        }

        if ($request->filled('marca')) {
            $query->porMarca($request->marca);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('vehiculo_codigo', 'like', "%{$request->search}%")
                    ->orWhere('vehiculo_placa', 'like', "%{$request->search}%")
                    ->orWhere('vehiculo_marca', 'like', "%{$request->search}%")
                    ->orWhere('vehiculo_modelo', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('with_estado')) {
            $query->with('estado');
        }

        if ($request->has('with_ruta_actual')) {
            $query->with('rutaActual.estado');
        }

        if ($request->has('include_estadisticas')) {
            $query->withCount('rutasActivadas');
        }

        $sortField = $request->get('sort', 'vehiculo_placa');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return VehiculoResource::collection($query->get());
        }

        $vehiculos = $query->paginate($request->get('per_page', 15));
        return VehiculoResource::collection($vehiculos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehiculo_codigo' => 'required|string|max:45|unique:vehiculo',
            'vehiculo_placa' => 'required|string|max:45|unique:vehiculo',
            'vehiculo_marca' => 'required|string|max:45',
            'vehiculo_modelo' => 'nullable|string|max:45',
            'vehiculo_capacidad' => 'required|integer|min:1|max:100',
            'vehiculo_situacion' => 'boolean',
            'estado_id' => 'required|exists:estado,estado_id'
        ]);

        $vehiculo = Vehiculo::create($validated);
        $vehiculo->load('estado');

        return new VehiculoResource($vehiculo);
    }

    public function show(Vehiculo $vehiculo)
    {
        $vehiculo->load(['estado', 'rutaActual']);
        return new VehiculoResource($vehiculo);
    }

    public function update(Request $request, Vehiculo $vehiculo)
    {
        $validated = $request->validate([
            'vehiculo_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('vehiculo')->ignore($vehiculo->vehiculo_id, 'vehiculo_id')
            ],
            'vehiculo_placa' => [
                'required',
                'string',
                'max:45',
                Rule::unique('vehiculo')->ignore($vehiculo->vehiculo_id, 'vehiculo_id')
            ],
            'vehiculo_marca' => 'required|string|max:45',
            'vehiculo_modelo' => 'nullable|string|max:45',
            'vehiculo_capacidad' => 'required|integer|min:1|max:100',
            'vehiculo_situacion' => 'boolean',
            'estado_id' => 'required|exists:estado,estado_id'
        ]);

        $vehiculo->update($validated);
        $vehiculo->load('estado');

        return new VehiculoResource($vehiculo);
    }

    public function destroy(Vehiculo $vehiculo)
    {
        if ($vehiculo->rutasActivadas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar este vehículo porque tiene rutas activadas asociadas.'
            ], Response::HTTP_CONFLICT);
        }

        $vehiculo->delete();

        return response()->json([
            'message' => 'Vehículo eliminado exitosamente'
        ]);
    }

    public function cambiarEstado(Request $request, Vehiculo $vehiculo)
    {
        $validated = $request->validate([
            'estado_codigo' => 'required|exists:estado,estado_codigo'
        ]);

        try {
            $vehiculo->cambiarEstado($validated['estado_codigo']);
            $vehiculo->load('estado');

            return new VehiculoResource($vehiculo);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    public function marcarDisponible(Vehiculo $vehiculo)
    {
        try {
            $vehiculo->marcarDisponible();
            return new VehiculoResource($vehiculo->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function marcarOcupado(Vehiculo $vehiculo)
    {
        try {
            $vehiculo->marcarOcupado();
            return new VehiculoResource($vehiculo->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function marcarMantenimiento(Vehiculo $vehiculo)
    {
        try {
            $vehiculo->marcarEnMantenimiento();
            return new VehiculoResource($vehiculo->load('estado'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function disponibles()
    {
        $vehiculos = Vehiculo::disponibles()
            ->activo()
            ->with('estado')
            ->orderBy('vehiculo_capacidad')
            ->get();

        return VehiculoResource::collection($vehiculos);
    }

    public function porCapacidad($capacidad)
    {
        $vehiculos = Vehiculo::disponibles()
            ->porCapacidad($capacidad)
            ->with('estado')
            ->orderBy('vehiculo_capacidad')
            ->get();

        return VehiculoResource::collection($vehiculos);
    }

    public function verificarDisponibilidad(Request $request, Vehiculo $vehiculo)
    {
        $validated = $request->validate([
            'pasajeros' => 'required|integer|min:1|max:100'
        ]);

        $puedeAcomodar = $vehiculo->puedeAcomodar($validated['pasajeros']);

        return response()->json([
            'vehiculo' => new VehiculoResource($vehiculo),
            'solicitud_pasajeros' => $validated['pasajeros'],
            'puede_acomodar' => $puedeAcomodar,
            'ocupacion_actual' => $vehiculo->getOcupacionActual(),
            'espacios_libres' => $vehiculo->espaciosLibres(),
            'capacidad_total' => $vehiculo->vehiculo_capacidad
        ]);
    }

    public function aptitudServicios(Vehiculo $vehiculo)
    {
        $aptitudes = [
            'Tour' => $vehiculo->esAptoPara('Tour'),
            'Transporte' => $vehiculo->esAptoPara('Transporte'),
            'Shuttle' => $vehiculo->esAptoPara('Shuttle')
        ];

        return response()->json([
            'vehiculo' => new VehiculoResource($vehiculo),
            'aptitudes' => $aptitudes,
            'recomendaciones' => array_keys(array_filter($aptitudes))
        ]);
    }

    public function rendimiento(Vehiculo $vehiculo)
    {
        $rendimiento = $vehiculo->rendimientoMensual();

        return response()->json([
            'vehiculo' => new VehiculoResource($vehiculo),
            'periodo' => 'Último mes',
            'rendimiento' => $rendimiento,
            'porcentaje_uso' => $vehiculo->getPorcentajeUso(),
            'mantenimiento' => $vehiculo->proximoMantenimiento()
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => Vehiculo::count(),
            'activos' => Vehiculo::activo()->count(),
            'por_estado' => [
                'disponibles' => Vehiculo::disponibles()->count(),
                'ocupados' => Vehiculo::ocupados()->count(),
                'mantenimiento' => Vehiculo::enMantenimiento()->count()
            ],
            'por_capacidad' => [
                'pequeños' => Vehiculo::where('vehiculo_capacidad', '<=', 12)->count(),
                'medianos' => Vehiculo::whereBetween('vehiculo_capacidad', [13, 25])->count(),
                'grandes' => Vehiculo::where('vehiculo_capacidad', '>', 25)->count()
            ],
            'capacidad_total' => Vehiculo::activo()->sum('vehiculo_capacidad'),
            'uso_promedio' => Vehiculo::activo()->get()->avg(function ($vehiculo) {
                return $vehiculo->getPorcentajeUso();
            })
        ];

        return response()->json($stats);
    }
}
