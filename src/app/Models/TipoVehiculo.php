<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoVehiculo extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'tipos_vehiculo';

    protected $fillable = [
        'codigo',
        'nombre_tipo',
        'capacidad_estandar',
        'descripcion',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'capacidad_estandar' => 'integer',
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

    public function rutas()
    {
        return $this->hasMany(Ruta::class);
    }

    public function puedeEliminarse()
    {
        return $this->vehiculos()->count() === 0 && $this->rutas()->count() === 0;
    }
}
