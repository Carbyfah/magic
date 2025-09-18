<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Servicio extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'servicio';
    protected $primaryKey = 'id_servicio';

    protected $fillable = [
        'tipo_servicio',
        'precio_servicio',
        'servicio_descuento_porcentaje',
        'servicio_precio_descuento',
        'id_tour_activo',
        'id_ruta_activa',
        'created_by'
    ];

    protected $casts = [
        'precio_servicio' => 'decimal:2',
        'servicio_precio_descuento' => 'decimal:2',
        'servicio_descuento_porcentaje' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function rutaActiva()
    {
        return $this->belongsTo(RutaActiva::class, 'id_ruta_activa', 'id_ruta_activa');
    }

    public function tourActivo()
    {
        return $this->belongsTo(TourActivo::class, 'id_tour_activo', 'id_tour_activo');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_servicio', 'id_servicio');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getPrecioFinalAttribute()
    {
        return $this->servicio_precio_descuento ?? $this->precio_servicio;
    }

    public function getTieneDescuentoAttribute()
    {
        return $this->servicio_descuento_porcentaje > 0;
    }

    // Scopes
    public function scopeColectivos($query)
    {
        return $query->where('tipo_servicio', 'COLECTIVO');
    }

    public function scopePrivados($query)
    {
        return $query->where('tipo_servicio', 'PRIVADO');
    }

    public function scopeConDescuento($query)
    {
        return $query->where('servicio_descuento_porcentaje', '>', 0);
    }

    public function scopeDeRuta($query)
    {
        return $query->whereNotNull('id_ruta_activa');
    }

    public function scopeDeTour($query)
    {
        return $query->whereNotNull('id_tour_activo');
    }
}
