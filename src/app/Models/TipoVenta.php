<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoVenta extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'tipos_venta';

    protected $fillable = [
        'codigo',
        'nombre_tipo',
        'descripcion',
        'genera_comision',
        'requiere_voucher',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'genera_comision' => 'boolean',
        'requiere_voucher' => 'boolean',
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
