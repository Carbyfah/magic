<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoPersona extends Model
{
    use SoftDeletes;

    protected $table = 'tipo_persona';
    protected $primaryKey = 'tipo_persona_id';

    protected $fillable = [
        'tipo_persona_codigo',
        'tipo_persona_tipo',
        'tipo_persona_situacion'
    ];

    protected $casts = [
        'tipo_persona_situacion' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * RELACIONES BÁSICAS
     */
    public function personas()
    {
        return $this->hasMany(Persona::class, 'tipo_persona_id', 'tipo_persona_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('tipo_persona_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('tipo_persona_tipo', 'like', "%{$termino}%")
            ->orWhere('tipo_persona_codigo', 'like', "%{$termino}%");
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('tipo_persona_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->tipo_persona_codigo, -3)) + 1 : 1;
        return 'TP-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->tipo_persona_codigo}: {$this->tipo_persona_tipo}";
    }

    public function tienePersonasAsociadas()
    {
        return $this->personas()->where('persona_situacion', 1)->exists();
    }

    /**
     * MÉTODOS ESPECÍFICOS DE NEGOCIO
     */
    public function esEmpleado()
    {
        return in_array(strtolower($this->tipo_persona_tipo), ['empleado', 'emp']);
    }

    public function esConductor()
    {
        return in_array(strtolower($this->tipo_persona_tipo), ['conductor', 'chofer', 'con']);
    }

    public function esAdministrativo()
    {
        return in_array(strtolower($this->tipo_persona_tipo), ['administrador', 'administrativo', 'admin', 'adm']);
    }

    public function esGerente()
    {
        return in_array(strtolower($this->tipo_persona_tipo), ['gerente', 'manager', 'ger']);
    }

    /**
     * ESTADÍSTICAS Y CONTEOS
     */
    public function getTotalPersonasAttribute()
    {
        return $this->personas()->count();
    }

    public function getPersonasActivasAttribute()
    {
        return $this->personas()->where('persona_situacion', 1)->count();
    }

    public function puedeSerEliminado()
    {
        return !$this->tienePersonasAsociadas();
    }
}
