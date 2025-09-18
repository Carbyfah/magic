<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tour extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tours';
    protected $primaryKey = 'id_tours';

    // SOLO CAMPOS REALES DE LA MIGRACIÓN v4.0
    protected $fillable = [
        'tours_nombre',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // RELACIONES REALES v4.0
    public function agencias()
    {
        return $this->belongsToMany(Agencia::class, 'agencias_tours', 'id_tours', 'id_agencias');
    }

    public function toursActivos()
    {
        return $this->hasMany(TourActivo::class, 'id_tours', 'id_tours');
    }

    // SOLO LÓGICA BÁSICA NECESARIA
    public function scopePorNombre($query, $nombre)
    {
        return $query->where('tours_nombre', 'like', "%{$nombre}%");
    }
}
