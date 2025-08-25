<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class EstadoReserva extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'estados_reserva';

    protected $fillable = [
        'codigo',
        'nombre_estado',
        'descripcion',
        'color_hex',
        'orden_flujo',
        'editable',
        'cuenta_ocupacion',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'editable' => 'boolean',
        'cuenta_ocupacion' => 'boolean',
        'orden_flujo' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function puedeEliminarse()
    {
        return $this->reservas()->count() === 0;
    }
}
