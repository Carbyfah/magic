<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EgresoRutaActiva extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'egresos_ruta_activa';
    protected $primaryKey = 'id_egresos_ruta_activa';

    protected $fillable = [
        'motivo_egreso',
        'cantidad_egreso',
        'descripcion_egreso',
        'id_ruta_activa',
        'created_by'
    ];

    protected $casts = [
        'cantidad_egreso' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function rutaActiva()
    {
        return $this->belongsTo(RutaActiva::class, 'id_ruta_activa', 'id_ruta_activa');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Scopes
    public function scopePorRuta($query, $rutaActivaId)
    {
        return $query->where('id_ruta_activa', $rutaActivaId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereHas('rutaActiva', function ($q) use ($fecha) {
            $q->whereDate('ruta_activa_fecha', $fecha);
        });
    }
}
