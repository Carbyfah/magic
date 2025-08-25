<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

abstract class BaseCatalogoController extends Controller
{
    /**
     * Modelo a utilizar (debe ser definido en cada controlador hijo)
     */
    protected $model;

    /**
     * Resource class para las respuestas
     */
    protected $resource;

    /**
     * Reglas de validación para store
     */
    protected $storeRules = [];

    /**
     * Reglas de validación para update
     */
    protected $updateRules = [];

    /**
     * Relaciones a cargar
     */
    protected $relationships = [];

    /**
     * Campo para búsqueda principal
     */
    protected $searchField = 'nombre';

    /**
     * Listar registros
     */
    public function index(Request $request)
    {
        try {
            $query = $this->model::query();

            // Solo activos por defecto
            if (method_exists($this->model, 'scopeActivo')) {
                $query->activo();
            }

            // Cargar relaciones
            if (!empty($this->relationships)) {
                $query->with($this->relationships);
            }

            // Búsqueda
            if ($request->has('buscar')) {
                $buscar = $request->buscar;
                $query->where(function ($q) use ($buscar) {
                    $q->where($this->searchField, 'like', "%{$buscar}%");
                    if ($this->model::getModel()->getTable() !== $this->searchField) {
                        $q->orWhere('codigo', 'like', "%{$buscar}%");
                    }
                });
            }

            // Incluir eliminados si se solicita
            if ($request->boolean('incluir_eliminados')) {
                $query->withTrashed();
            }

            // Paginación
            $perPage = $request->get('per_page', 15);

            if ($perPage === 'all') {
                $data = $query->orderBy('id', 'desc')->get();
            } else {
                $data = $query->orderBy('id', 'desc')->paginate($perPage);
            }

            if ($this->resource) {
                return $this->resource::collection($data);
            }

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener registros',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo registro
     */
    public function store(Request $request)
    {
        $request->validate($this->storeRules);

        try {
            DB::beginTransaction();

            $data = $request->all();
            $data['situacion'] = true;

            $registro = $this->model::create($data);

            DB::commit();

            if (!empty($this->relationships)) {
                $registro->load($this->relationships);
            }

            if ($this->resource) {
                return new $this->resource($registro);
            }

            return response()->json([
                'message' => 'Registro creado exitosamente',
                'data' => $registro
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar registro específico
     */
    public function show($id)
    {
        try {
            $query = $this->model::query();

            if (!empty($this->relationships)) {
                $query->with($this->relationships);
            }

            $registro = $query->findOrFail($id);

            if ($this->resource) {
                return new $this->resource($registro);
            }

            return response()->json($registro);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Registro no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar registro
     */
    public function update(Request $request, $id)
    {
        $rules = [];
        foreach ($this->updateRules as $field => $rule) {
            // Ajustar reglas unique para update
            if (strpos($rule, 'unique:') !== false && !strpos($rule, ',')) {
                $rule = $rule . ',' . $id;
            }
            $rules[$field] = $rule;
        }

        $request->validate($rules);

        try {
            DB::beginTransaction();

            $registro = $this->model::findOrFail($id);
            $registro->update($request->all());

            DB::commit();

            if (!empty($this->relationships)) {
                $registro->load($this->relationships);
            }

            if ($this->resource) {
                return new $this->resource($registro);
            }

            return response()->json([
                'message' => 'Registro actualizado exitosamente',
                'data' => $registro
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar registro (soft delete)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $registro = $this->model::findOrFail($id);

            // Verificar si puede eliminarse
            if (method_exists($registro, 'puedeEliminarse')) {
                if (!$registro->puedeEliminarse()) {
                    return response()->json([
                        'message' => 'No se puede eliminar, tiene registros relacionados'
                    ], 400);
                }
            }

            $registro->situacion = false;
            $registro->save();
            $registro->delete();

            DB::commit();

            return response()->json([
                'message' => 'Registro eliminado exitosamente'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restaurar registro eliminado
     */
    public function restore($id)
    {
        try {
            DB::beginTransaction();

            $registro = $this->model::onlyTrashed()->findOrFail($id);
            $registro->restore();
            $registro->situacion = true;
            $registro->save();

            DB::commit();

            if (!empty($this->relationships)) {
                $registro->load($this->relationships);
            }

            if ($this->resource) {
                return new $this->resource($registro);
            }

            return response()->json([
                'message' => 'Registro restaurado exitosamente',
                'data' => $registro
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al restaurar registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
