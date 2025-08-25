<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Pais extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'paises';

    protected $fillable = [
        'nombre_pais',
        'codigo_iso2',
        'codigo_iso3',
        'codigo_telefono',
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

    public function clientes()
    {
        return $this->hasMany(Cliente::class, 'pais_residencia_id');
    }

    public function agencias()
    {
        return $this->hasMany(Agencia::class);
    }

    public function puedeEliminarse()
    {
        return $this->clientes()->count() === 0 && $this->agencias()->count() === 0;
    }
}
