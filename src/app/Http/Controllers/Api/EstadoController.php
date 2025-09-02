<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EstadoController extends Controller
{
    /**
     * LISTAR ESTADOS
     */
    public function index(Request $request)
    {
        $query = Estado::query();

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('estado_situacion', $request->boolean('activo'));
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('estado_estado');

        return response()->json($query->get());
    }

    /**
     * CREAR ESTADO
     */
    /**
     * CREAR ESTADO
     */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'estado_codigo' => 'sometimes|string|max:45|unique:estado',
            'estado_estado' => 'required|string|max:45',
            'estado_descripcion' => 'nullable|string|max:45',
            'estado_situacion' => 'sometimes|boolean',
            'contexto' => 'nullable|in:vehiculo,reserva,ruta-activada,factura'
        ]);

        // Generar código contextual SI viene contexto, sino usar método original
        if (!isset($validated['estado_codigo'])) {
            if (isset($validated['contexto'])) {
                // Modo contextual
                $validated['estado_codigo'] = $this->generarCodigoContextual(
                    $validated['contexto'],
                    $validated['estado_estado']
                );
            } else {
                // Modo original
                $validated['estado_codigo'] = Estado::generarCodigo();
            }
        }

        unset($validated['contexto']); // Remover contexto antes de guardar
        $validated['estado_situacion'] = $validated['estado_situacion'] ?? true;

        $estado = Estado::create($validated);
        return response()->json($estado, 201);
    }

    /**
     * VER ESTADO ESPECÍFICO
     */
    public function show(Estado $estado)
    {
        return response()->json($estado);
    }

    /**
     * ACTUALIZAR ESTADO
     */
    public function update(Request $request, Estado $estado)
    {
        $validated = $request->validate([
            'estado_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('estado')->ignore($estado->estado_id, 'estado_id')
            ],
            'estado_estado' => 'required|string|max:45',
            'estado_descripcion' => 'nullable|string|max:45',
            'estado_situacion' => 'sometimes|boolean'
        ]);

        $estado->update($validated);

        return response()->json($estado);
    }

    /**
     * ELIMINAR ESTADO (Solo si no tiene registros asociados)
     */
    public function destroy(Estado $estado)
    {
        if ($estado->tieneRegistrosAsociados()) {
            return response()->json([
                'message' => 'No se puede eliminar este estado porque tiene registros asociados.'
            ], 409);
        }

        $estado->delete();

        return response()->json(['message' => 'Estado eliminado exitosamente']);
    }

    /**
     * ACTIVAR ESTADO
     */
    public function activate(Estado $estado)
    {
        $estado->update(['estado_situacion' => 1]);
        return response()->json($estado);
    }

    /**
     * DESACTIVAR ESTADO
     */
    public function deactivate(Estado $estado)
    {
        $estado->update(['estado_situacion' => 0]);
        return response()->json($estado);
    }

    /**
     * ESTADOS PARA VEHÍCULOS
     */
    public function paraVehiculo()
    {
        return response()->json(
            Estado::where('estado_codigo', 'LIKE', 'VEH-%')
                ->where('estado_situacion', 1)
                ->orderBy('estado_estado')
                ->get()
        );
    }

    /**
     * ESTADOS PARA RESERVAS
     */
    public function paraReserva()
    {
        return response()->json(
            Estado::where('estado_codigo', 'LIKE', 'RES-%')
                ->where('estado_situacion', 1)
                ->orderBy('estado_estado')
                ->get()
        );
    }

    /**
     * ESTADOS PARA RUTAS ACTIVADAS
     */
    public function paraRutaActivada()
    {
        return response()->json(
            Estado::where('estado_codigo', 'LIKE', 'RUT-%')
                ->where('estado_situacion', 1)
                ->orderBy('estado_estado')
                ->get()
        );
    }

    /**
     * ESTADOS PARA FACTURAS
     */
    public function paraFactura()
    {
        return response()->json(
            Estado::where('estado_codigo', 'LIKE', 'FAC-%')
                ->where('estado_situacion', 1)
                ->orderBy('estado_estado')
                ->get()
        );
    }

    /**
     * GENERAR CÓDIGO CONTEXTUAL
     */
    private function generarCodigoContextual($contexto, $nombre)
    {
        $prefijos = [
            'vehiculo' => 'VEH-',
            'reserva' => 'RES-',
            'ruta-activada' => 'RUT-',
            'factura' => 'FAC-'
        ];

        // Algoritmo mejorado: tomar primera letra de cada palabra
        $palabras = explode(' ', $nombre);
        if (count($palabras) > 1) {
            $abreviacion = '';
            foreach ($palabras as $palabra) {
                $palabra = trim($palabra); // Limpiar espacios
                if (!empty($palabra)) {    // Solo procesar palabras no vacías
                    $abreviacion .= strtoupper(substr($palabra, 0, 1));
                }
            }
            $abreviacion = substr($abreviacion, 0, 4);
        } else {
            $abreviacion = strtoupper(substr($nombre, 0, 4));
        }

        $codigoBase = $prefijos[$contexto] . $abreviacion;

        $contador = 1;
        $codigoFinal = $codigoBase;

        while (Estado::where('estado_codigo', $codigoFinal)->exists()) {
            $codigoFinal = $codigoBase . $contador;
            $contador++;
            if ($contador > 99) break;
        }

        return $codigoFinal;
    }
}
