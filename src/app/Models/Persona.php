<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Persona extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'personas';

    protected $fillable = [
        'nombres',
        'apellidos',
        'documento_identidad',
        'email',
        'telefono_principal',
        'whatsapp',
        'direccion',
        'tipo_persona_id',
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

    public function getNombreCompletoAttribute()
    {
        return $this->nombres . ' ' . $this->apellidos;
    }

    public function tipoPersona()
    {
        return $this->belongsTo(TipoPersona::class);
    }

    public function empleado()
    {
        return $this->hasOne(Empleado::class);
    }

    public function cliente()
    {
        return $this->hasOne(Cliente::class);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('nombres', 'like', "%{$termino}%")
                ->orWhere('apellidos', 'like', "%{$termino}%")
                ->orWhere('documento_identidad', 'like', "%{$termino}%")
                ->orWhere('email', 'like', "%{$termino}%");
        });
    }

    public function scopePorTipo($query, $tipoId)
    {
        return $query->where('tipo_persona_id', $tipoId);
    }
}
