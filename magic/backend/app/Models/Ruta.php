<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ruta extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rutas';
    protected $primaryKey = 'id_rutas';

    protected $fillable = [
        'rutas_origen',
        'rutas_destino',
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
        return $this->belongsToMany(Agencia::class, 'agencias_rutas', 'id_rutas', 'id_agencias');
    }

    public function rutasActivas()
    {
        return $this->hasMany(RutaActiva::class, 'id_rutas', 'id_rutas');
    }

    // SOLO LÓGICA BÁSICA NECESARIA
    public function getRutaCompletaAttribute()
    {
        return "{$this->rutas_origen} → {$this->rutas_destino}";
    }

    public function scopePorOrigen($query, $origen)
    {
        return $query->where('rutas_origen', 'like', "%{$origen}%");
    }

    public function scopePorDestino($query, $destino)
    {
        return $query->where('rutas_destino', 'like', "%{$destino}%");
    }
}
