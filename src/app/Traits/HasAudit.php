<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait HasAudit
{
    /**
     * Boot del trait HasAudit
     */
    public static function bootHasAudit()
    {
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
            } else {
                $model->created_by = 1; // Usuario admin por defecto
            }
        });

        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            } else {
                $model->updated_by = 1; // Usuario admin por defecto
            }
        });
    }

    /**
     * Relación con el usuario que creó el registro
     */
    public function createdBy()
    {
        return $this->belongsTo(Usuario::class, 'created_by', 'usuario_id');
    }

    /**
     * Relación con el usuario que actualizó el registro
     */
    public function updatedBy()
    {
        return $this->belongsTo(Usuario::class, 'updated_by', 'usuario_id');
    }
}
