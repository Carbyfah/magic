<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auditoria extends Model
{
    protected $table = 'auditoria';

    public $timestamps = false; // Solo usamos created_at

    protected $fillable = [
        'usuario_id',
        'accion',
        'tabla',
        'registro_id',
        'datos_anteriores',
        'datos_nuevos',
        'campos_modificados',
        'modulo',
        'descripcion',
        'ip',
        'user_agent',
        'sesion_id'
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
        'campos_modificados' => 'array',
        'created_at' => 'datetime'
    ];

    /**
     * Relación con el usuario que realizó la acción
     */
    public function usuario()
    {
        return $this->belongsTo(Empleado::class, 'usuario_id');
    }

    /**
     * Scope para filtrar por tabla
     */
    public function scopePorTabla($query, $tabla)
    {
        return $query->where('tabla', $tabla);
    }

    /**
     * Scope para filtrar por acción
     */
    public function scopePorAccion($query, $accion)
    {
        return $query->where('accion', $accion);
    }
}
