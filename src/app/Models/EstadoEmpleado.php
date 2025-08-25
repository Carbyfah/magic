<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class EstadoEmpleado extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'estados_empleado';

    protected $fillable = [
        'codigo',
        'nombre_estado',
        'descripcion',
        'color_hex',
        'permite_trabajar',
        'cuenta_planilla',
        'orden',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'permite_trabajar' => 'boolean',
        'cuenta_planilla' => 'boolean',
        'orden' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    public function empleados()
    {
        return $this->hasMany(Empleado::class);
    }

    public function scopeActivos($query)
    {
        return $query->where('permite_trabajar', true);
    }

    public function puedeEliminarse()
    {
        return $this->empleados()->count() === 0;
    }
}
