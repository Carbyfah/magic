<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RutaActiva extends Model
{
    use SoftDeletes;

    protected $table = 'ruta_activa';
    protected $primaryKey = 'id_ruta_activa';

    protected $fillable = [
        'ruta_activa_fecha',
        'estado_id',
        'id_rutas',
        'id_vehiculo',
        'created_by'
    ];

    protected $casts = [
        'ruta_activa_fecha' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function ruta()
    {
        return $this->belongsTo(Ruta::class, 'id_rutas', 'id_rutas');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo', 'id_vehiculo');
    }
}
