<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class EstadoVenta extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'estados_venta';

    protected $fillable = [
        'codigo',
        'nombre_estado',
        'descripcion',
        'color_hex',
        'cuenta_ingreso',
        'modificable',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'cuenta_ingreso' => 'boolean',
        'modificable' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    public function puedeEliminarse()
    {
        return $this->ventas()->count() === 0;
    }
}
