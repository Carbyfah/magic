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
        'deleted_at' => 'datetime',
    ];

    // Relación con Agencia
    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'id_agencias', 'id_agencias');
    }

    // Relación con Cargo
    public function cargo()
    {
        return $this->belongsTo(Cargo::class, 'id_cargo', 'id_cargo');
    }

    // Relación con Usuario
    public function usuario()
    {
        return $this->hasOne(User::class, 'id_empleados', 'id_empleados');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return $this->empleados_nombres . ' ' . $this->empleados_apellidos;
    }
}
