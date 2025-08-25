<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoAgencia extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'tipos_agencia';

    protected $fillable = [
        'codigo',
        'nombre_tipo',
        'descripcion',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
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

    public function puedeEliminarse()
    {
        return $this->agencias()->count() === 0;
    }
}
