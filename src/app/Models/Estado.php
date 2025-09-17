<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estado extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'estado';
    protected $primaryKey = 'estado_id';

    protected $fillable = [
        'estado_nombre',
        'estado_descripcion',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // RELACIONES REALES
    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'estado_id', 'estado_id');
    }

    public function rutasActivas()
    {
        return $this->hasMany(RutaActiva::class, 'estado_id', 'estado_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'estado_id', 'estado_id');
    }

    // SOLO LÓGICA BÁSICA
    public function scopePorNombre($query, $nombre)
    {
        return $query->where('estado_nombre', 'like', "%{$nombre}%");
    }

    public static function obtenerPorNombre($nombre)
    {
        return static::where('estado_nombre', $nombre)->first();
    }

    public static function opciones()
    {
        return static::orderBy('estado_nombre')->pluck('estado_nombre', 'estado_id');
    }
}
