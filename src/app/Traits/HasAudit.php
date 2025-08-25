<?php

namespace App\Traits;

use App\Models\Auditoria;
use Illuminate\Support\Facades\Auth;

trait HasAudit
{
    /**
     * Boot the trait
     */
    public static function bootHasAudit()
    {
        // Al crear
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
                $model->updated_by = Auth::id();
            }
        });

        // Al actualizar
        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            }

            // Registrar en auditoría
            self::logAudit($model, 'update');
        });

        // Después de crear
        static::created(function ($model) {
            self::logAudit($model, 'insert');
        });

        // Al eliminar (soft delete)
        static::deleted(function ($model) {
            self::logAudit($model, 'delete');
        });
    }

    /**
     * Registrar en tabla auditoría
     */
    private static function logAudit($model, $action)
    {
        // Obtener datos anteriores y nuevos
        $datosAnteriores = null;
        $datosNuevos = null;
        $camposModificados = null;

        if ($action === 'update') {
            $datosAnteriores = json_encode($model->getOriginal());
            $datosNuevos = json_encode($model->getDirty());
            $camposModificados = json_encode(array_keys($model->getDirty()));
        } elseif ($action === 'insert') {
            $datosNuevos = json_encode($model->toArray());
        } elseif ($action === 'delete') {
            $datosAnteriores = json_encode($model->toArray());
        }

        Auditoria::create([
            'usuario_id' => Auth::check() ? Auth::id() : null,
            'accion' => $action,
            'tabla' => $model->getTable(),
            'registro_id' => $model->id,
            'datos_anteriores' => $datosAnteriores,
            'datos_nuevos' => $datosNuevos,
            'campos_modificados' => $camposModificados,
            'modulo' => class_basename($model),
            'descripcion' => $action . ' en ' . class_basename($model),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'sesion_id' => session()->getId(),
        ]);
    }

    /**
     * Scope para filtrar solo registros activos
     */
    public function scopeActivo($query)
    {
        return $query->where('situacion', 1);
    }

    /**
     * Scope para incluir registros eliminados lógicamente
     */
    public function scopeConEliminados($query)
    {
        return $query->withTrashed();
    }
}
