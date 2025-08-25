<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class EstadoVehiculo extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'estados_vehiculo';

    protected $fillable = [
        'codigo',
        'nombre_estado',
        'descripcion',
        'color_hex',
        'disponible_operacion',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'disponible_operacion' => 'boolean',
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
