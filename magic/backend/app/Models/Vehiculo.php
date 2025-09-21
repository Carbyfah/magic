<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehiculo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehiculo';
    protected $primaryKey = 'id_vehiculo';

    protected $fillable = [
        'vehiculo_marca',
        'vehiculo_placa',
        'vehiculo_capacidad',
        'vehiculo_pago_conductor',
        'estado_id',
        'id_agencias',
        'created_by'
    ];

    protected $casts = [
        'vehiculo_capacidad' => 'integer',
        'vehiculo_pago_conductor' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // RELACIONES REALES
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'id_agencias', 'id_agencias');
    }

    public function rutasActivas()
    {
        return $this->hasMany(RutaActiva::class, 'id_vehiculo', 'id_vehiculo');
    }

    // ACCESSOR BÁSICO
    public function getInfoCompletaAttribute()
    {
        return "{$this->vehiculo_marca} - {$this->vehiculo_placa}";
    }

    // SCOPE BÁSICO
    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->where('id_agencias', $agenciaId);
    }
}
