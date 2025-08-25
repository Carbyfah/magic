<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class EstadoComercial extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'estados_comercial';

    protected $fillable = [
        'codigo',
        'nombre_estado',
        'descripcion',
        'color_hex',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * Relaciones
     */
    public function agencias()
    {
        return $this->hasMany(Agencia::class);
    }

    /**
     * Scopes
     */
    public function scopeActivos($query)
    {
        return $query->where('situacion', true);
    }

    /**
     * Métodos de negocio
     */
    public function puedeEliminarse()
    {
        return $this->agencias()->count() === 0;
    }
}
