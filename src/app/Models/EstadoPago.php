<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class EstadoPago extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'estados_pago';

    protected $fillable = [
        'codigo',
        'nombre_estado',
        'descripcion',
        'color_hex',
        'requiere_cobro',
        'permite_servicio',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'requiere_cobro' => 'boolean',
        'permite_servicio' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }

    public function puedeEliminarse()
    {
        return $this->pagos()->count() === 0;
    }
}
