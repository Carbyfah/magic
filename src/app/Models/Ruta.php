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
        'id_agencias',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'id_agencias', 'id_agencias');
    }

    public function rutasActivas()
    {
        return $this->hasMany(RutaActiva::class, 'id_rutas', 'id_rutas');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getRutaCompletaAttribute()
    {
        return "{$this->rutas_origen} -> {$this->rutas_destino}";
    }

    // Scopes
    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->where('id_agencias', $agenciaId);
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
