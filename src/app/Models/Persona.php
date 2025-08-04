<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Persona extends Model
{
    protected $table = 'personas';

    protected $fillable = [
        'nombres',
        'apellidos',
        'email',
        'telefono_principal',
        'whatsapp',
        'direccion',
        'tipo_persona_id',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function tipoPersona(): BelongsTo
    {
        return $this->belongsTo(TipoPersona::class);
    }

    public function empleado(): HasOne
    {
        return $this->hasOne(Empleado::class);
    }

    public function cliente(): HasOne
    {
        return $this->hasOne(Cliente::class);
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombres} {$this->apellidos}";
    }
}
