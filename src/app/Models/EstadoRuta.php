<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class EstadoRuta extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'estados_ruta';

    protected $fillable = [
        'codigo',
        'nombre_estado',
        'descripcion',
        'color_hex',
        'acepta_reservas',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'acepta_reservas' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    public function rutas()
    {
        return $this->hasMany(Ruta::class);
    }

    public function puedeEliminarse()
    {
        return $this->rutas()->count() === 0;
    }
}
