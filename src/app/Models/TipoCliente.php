<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoCliente extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'tipos_cliente';

    protected $fillable = [
        'codigo',
        'nombre_tipo',
        'descripcion',
        'descuento_default',
        'requiere_credito',
        'dias_credito',
        'prioridad',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'requiere_credito' => 'boolean',
        'descuento_default' => 'decimal:2',
        'dias_credito' => 'integer',
        'prioridad' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    public function clientes()
    {
        return $this->hasMany(Cliente::class);
    }

    public function puedeEliminarse()
    {
        return $this->clientes()->count() === 0;
    }
}
