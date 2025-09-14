<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agencia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'agencias';
    protected $primaryKey = 'id_agencias';

    protected $fillable = [
        'agencias_nombre',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relación con empleados
    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'id_agencias', 'id_agencias');
    }

    // Relación con rutas
    public function rutas()
    {
        return $this->hasMany(Ruta::class, 'id_agencias', 'id_agencias');
    }
}
