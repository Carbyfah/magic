<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourActivo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tour_activo';
    protected $primaryKey = 'id_tour_activo';

    protected $fillable = [
        'tour_activo_fecha',
        'tour_activo_tipo',
        'estado_id',
        'id_tour',
        'created_by'
    ];

    protected $casts = [
        'tour_activo_fecha' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function tour()
    {
        return $this->belongsTo(Tour::class, 'id_tour', 'id_tour');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'id_tour_activo', 'id_tour_activo');
    }

    public function reservas()
    {
        return $this->hasManyThrough(
            Reserva::class,
            Servicio::class,
            'id_tour_activo',
            'id_servicio',
            'id_tour_activo',
            'id_servicio'
        );
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getFechaAttribute()
    {
        return $this->tour_activo_fecha->format('Y-m-d');
    }

    public function getHoraAttribute()
    {
        return $this->tour_activo_fecha->format('H:i');
    }

    // Scopes
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('tour_activo_fecha', $fecha);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tour_activo_tipo', 'like', "%{$tipo}%");
    }
}
