<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class FormaPago extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'formas_pago';

    protected $fillable = [
        'codigo',
        'nombre_forma',
        'descripcion',
        'requiere_comprobante',
        'genera_credito',
        'dias_credito',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'requiere_comprobante' => 'boolean',
        'genera_credito' => 'boolean',
        'dias_credito' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    public function agencias()
    {
        return $this->hasMany(Agencia::class);
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }

    public function puedeEliminarse()
    {
        return $this->agencias()->count() === 0 && $this->pagos()->count() === 0;
    }
}
