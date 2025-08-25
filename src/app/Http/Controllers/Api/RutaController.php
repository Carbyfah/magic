<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruta;
use App\Http\Resources\RutaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class RutaController extends Controller
{
    /**
     * Listar rutas con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Ruta::with(['tipoVehiculo', 'estadoRuta'])
                ->activo();

            // Filtros
            if ($request->has('buscar')) {
                $termino = $request->buscar;
                $query->where(function ($q) use ($termino) {
                    $q->where('codigo_ruta', 'like', "%{$termino}%")
                        ->orWhere('nombre_ruta', 'like', "%{$termino}%")
                        ->orWhere('ciudad_origen', 'like', "%{$termino}%")
                        ->orWhere('ciudad_destino', 'like', "%{$termino}%");
                });
            }

            if ($request->has('tipo_servicio')) {
                $query->porTipoServicio($request->tipo_servicio);
            }

            if ($request->has('origen') && $request->has('destino')) {
                $query->porOrigenDestino($request->origen, $request->destino);
            }

            if ($request->boolean('solo_activas')) {
                $query->activas();
            }

            if ($request->has('dia_semana')) {
                $query->operanEnDia($request->dia_semana);
            }

            // Ordenamiento y paginación
            $perPage = $request->get('per_page', 15);
            $rutas = $query->orderBy('hora_salida')
                ->orderBy('codigo_ruta')
                ->paginate($perPage);

            return RutaResource::collection($rutas);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener rutas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva ruta
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo_ruta' => 'nullable|string|max:50|unique:rutas,codigo_ruta',
            'nombre_ruta' => 'required|string|max:255',
            'tipo_servicio' => 'required|in:shuttle,tour,transfer,privado',
            'ciudad_origen' => 'required|string|max:100',
            'ciudad_destino' => 'required|string|max:100',
            'punto_salida' => 'nullable|string|max:255',
            'punto_llegada' => 'nullable|string|max:255',
            'distancia_km' => 'nullable|numeric|min:0',
            'hora_salida' => 'required|date_format:H:i',
            'hora_llegada_estimada' => 'nullable|date_format:H:i',
            'duracion_minutos' => 'nullable|integer|min:0',
            'capacidad_maxima' => 'required|integer|min:1',
            'capacidad_recomendada' => 'nullable|integer|min:1',
            'tipo_vehiculo_id' => 'required|exists:tipos_vehiculo,id',
            'dias_operacion' => 'nullable|string|size:7',
            'precio_adulto' => 'required|numeric|min:0',
            'precio_nino' => 'nullable|numeric|min:0',
            'incluye' => 'nullable|string',
            'estado_ruta_id' => 'required|exists:estados_ruta,id'
        ]);

        try {
            DB::beginTransaction();

            // Generar código si no se proporciona
            $codigoRuta = $request->codigo_ruta ?? $this->generarCodigoRuta();

            // Calcular duración si no se proporciona
            $duracionMinutos = $request->duracion_minutos;
            if (!$duracionMinutos && $request->hora_salida && $request->hora_llegada_estimada) {
                $salida = \Carbon\Carbon::createFromFormat('H:i', $request->hora_salida);
                $llegada = \Carbon\Carbon::createFromFormat('H:i', $request->hora_llegada_estimada);
                $duracionMinutos = $salida->diffInMinutes($llegada);
            }

            $ruta = Ruta::create(array_merge(
                $request->all(),
                [
                    'codigo_ruta' => $codigoRuta,
                    'dias_operacion' => $request->dias_operacion ?? '1111111', // Todos los días por defecto
                    'capacidad_recomendada' => $request->capacidad_recomendada ?? intval($request->capacidad_maxima * 0.9),
                    'duracion_minutos' => $duracionMinutos,
                    'precio_nino' => $request->precio_nino ?? 0,
                    'situacion' => true
                ]
            ));

            DB::commit();

            return new RutaResource($ruta->load(['tipoVehiculo', 'estadoRuta']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear ruta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar ruta específica
     */
    public function show($id)
    {
        try {
            $ruta = Ruta::with([
                'tipoVehiculo',
                'estadoRuta',
                'reservas' => function ($q) {
                    $q->whereDate('fecha_viaje', '>=', now())
                        ->orderBy('fecha_viaje');
                }
            ])->findOrFail($id);

            return new RutaResource($ruta);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Ruta no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar ruta
     */
    public function update(Request $request, $id)
    {
        $ruta = Ruta::findOrFail($id);

        $request->validate([
            'nombre_ruta' => 'sometimes|required|string|max:255',
            'tipo_servicio' => 'sometimes|required|in:shuttle,tour,transfer,privado',
            'ciudad_origen' => 'sometimes|required|string|max:100',
            'ciudad_destino' => 'sometimes|required|string|max:100',
            'punto_salida' => 'sometimes|nullable|string|max:255',
            'punto_llegada' => 'sometimes|nullable|string|max:255',
            'distancia_km' => 'sometimes|nullable|numeric|min:0',
            'hora_salida' => 'sometimes|required|date_format:H:i',
            'hora_llegada_estimada' => 'sometimes|nullable|date_format:H:i',
            'duracion_minutos' => 'sometimes|nullable|integer|min:0',
            'capacidad_maxima' => 'sometimes|required|integer|min:1',
            'capacidad_recomendada' => 'sometimes|nullable|integer|min:1',
            'tipo_vehiculo_id' => 'sometimes|required|exists:tipos_vehiculo,id',
            'dias_operacion' => 'sometimes|nullable|string|size:7',
            'precio_adulto' => 'sometimes|required|numeric|min:0',
            'precio_nino' => 'sometimes|nullable|numeric|min:0',
            'incluye' => 'sometimes|nullable|string',
            'estado_ruta_id' => 'sometimes|required|exists:estados_ruta,id'
        ]);

        try {
            DB::beginTransaction();

            $ruta->update($request->all());

            DB::commit();

            return new RutaResource($ruta->fresh()->load(['tipoVehiculo', 'estadoRuta']));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar ruta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar ruta (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $ruta = Ruta::findOrFail($id);

            // Verificar si tiene reservas futuras
            $reservasFuturas = $ruta->reservas()
                ->whereDate('fecha_viaje', '>=', now())
                ->count();

            if ($reservasFuturas > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar, tiene ' . $reservasFuturas . ' reservas futuras'
                ], 400);
            }

            $ruta->situacion = false;
            $ruta->save();
            $ruta->delete();

            DB::commit();

            return response()->json([
                'message' => 'Ruta eliminada correctamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar ruta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar disponibilidad de la ruta
     */
    public function verificarDisponibilidad($id, Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'pasajeros' => 'required|integer|min:1'
        ]);

        try {
            $ruta = Ruta::findOrFail($id);

            // Verificar si la ruta acepta reservas
            if (!$ruta->acepta_reservas) {
                return response()->json([
                    'disponible' => false,
                    'mensaje' => 'La ruta no está aceptando reservas'
                ]);
            }

            // Verificar si opera en el día solicitado
            $diaSemana = \Carbon\Carbon::parse($request->fecha)->dayOfWeek;
            if (substr($ruta->dias_operacion, $diaSemana, 1) !== '1') {
                return response()->json([
                    'disponible' => false,
                    'mensaje' => 'La ruta no opera en este día'
                ]);
            }

            // Verificar disponibilidad
            $disponibilidad = $ruta->verificarDisponibilidad($request->fecha, $request->pasajeros);

            return response()->json($disponibilidad);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al verificar disponibilidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar código de ruta automático
     */
    private function generarCodigoRuta()
    {
        $ultimo = Ruta::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_ruta, 4)) + 1 : 1;
        return sprintf('RUT-%04d', $numero);
    }
}
