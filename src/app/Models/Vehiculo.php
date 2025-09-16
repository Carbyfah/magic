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

    // Relaciones
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

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getInfoCompletaAttribute()
    {
        return "{$this->vehiculo_marca} - {$this->vehiculo_placa}";
    }

    public function getEstaDisponibleAttribute()
    {
        return $this->estado && strtolower($this->estado->estado_nombre) === 'disponible';
    }

    // Scopes
    public function scopeDisponibles($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_nombre', 'like', '%disponible%');
        });
    }

    public function scopeConCapacidad($query)
    {
        return $query->where('vehiculo_capacidad', '>', 0);
    }

    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->where('id_agencias', $agenciaId);
    }
}
