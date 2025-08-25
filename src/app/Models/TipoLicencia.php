<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoLicencia extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'tipos_licencia';

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

    public function choferesDetalle()
    {
        return $this->hasMany(ChoferDetalle::class);
    }

    public function puedeEliminarse()
    {
        return $this->choferesDetalle()->count() === 0;
    }
}
