<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empleado extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empleados';
    protected $primaryKey = 'id_empleados';

    protected $fillable = [
        'empleados_nombres',
        'empleados_apellidos',
        'empleados_dpi',
        'id_agencias',
        'id_cargo',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // RELACIONES REALES
    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'id_agencias', 'id_agencias');
    }

    public function cargo()
    {
        return $this->belongsTo(Cargo::class, 'id_cargo', 'id_cargo');
    }

    public function usuario()
    {
        return $this->hasOne(Usuario::class, 'id_empleados', 'id_empleados');
    }

    // ACCESSOR BÁSICO
    public function getNombreCompletoAttribute()
    {
        return "{$this->empleados_nombres} {$this->empleados_apellidos}";
    }
}
