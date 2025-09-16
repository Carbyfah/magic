<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RutaActiva extends Model
{
    use HasFactory, SoftDeletes;

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

    // Relaciones
    public function ruta()
    {
        return $this->belongsTo(Ruta::class, 'id_rutas', 'id_rutas');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo', 'id_vehiculo');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'id_ruta_activa', 'id_ruta_activa');
    }

    public function reservas()
    {
        return $this->hasManyThrough(
            Reserva::class,
            Servicio::class,
            'id_ruta_activa',
            'id_servicio',
            'id_ruta_activa',
            'id_servicio'
        );
    }

    public function egresos()
    {
        return $this->hasMany(EgresoRutaActiva::class, 'id_ruta_activa', 'id_ruta_activa');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getFechaAttribute()
    {
        return $this->ruta_activa_fecha->format('Y-m-d');
    }

    public function getHoraAttribute()
    {
        return $this->ruta_activa_fecha->format('H:i');
    }

    public function getRutaCompletaAttribute()
    {
        return "{$this->ruta->rutas_origen} -> {$this->ruta->rutas_destino}";
    }

    // Scopes
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('ruta_activa_fecha', $fecha);
    }

    public function scopeActivadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_nombre', 'like', '%activada%');
        });
    }

    public function scopeLiquidadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_nombre', 'like', '%liquidar%')
                ->orWhere('estado_nombre', 'like', '%liquidada%');
        });
    }

    public function scopeConVehiculo($query)
    {
        return $query->whereNotNull('id_vehiculo')
            ->whereHas('vehiculo');
    }
}
