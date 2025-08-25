<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoCombustible extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'tipos_combustible';

    protected $fillable = [
        'codigo',
        'nombre_combustible',
        'unidad_medida',
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

    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class);
    }

    public function puedeEliminarse()
    {
        return $this->vehiculos()->count() === 0;
    }
}
