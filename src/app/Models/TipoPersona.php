<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoPersona extends Model
{

    const EMPLEADO = 'EMP';
    const CLIENTE = 'CLI';
    const PROVEEDOR = 'PROV';

    use SoftDeletes, HasAudit;

    protected $table = 'tipos_persona';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
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

    public function personas()
    {
        return $this->hasMany(Persona::class);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('codigo', $codigo);
    }

    public function puedeEliminarse()
    {
        return $this->personas()->count() === 0;
    }
}
