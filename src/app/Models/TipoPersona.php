<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class TipoPersona extends Model
{
    use SoftDeletes, HasAudit;

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

    protected $appends = [
        'es_activo'
    ];

    /**
     * Relaciones
     */
    public function personas()
    {
        return $this->hasMany(Persona::class, 'tipo_persona_id', 'tipo_persona_id');
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->tipo_persona_situacion === true;
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('tipo_persona_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('tipo_persona_codigo', $codigo);
    }

    /**
     * Métodos estáticos para obtener tipos comunes (con validación)
     */
    public static function admin()
    {
        return self::where('tipo_persona_codigo', 'ADMIN')->first();
    }

    public static function vendedor()
    {
        return self::where('tipo_persona_codigo', 'VEND')->first();
    }

    public static function chofer()
    {
        return self::where('tipo_persona_codigo', 'CHOF')->first();
    }

    public static function cliente()
    {
        return self::where('tipo_persona_codigo', 'CLIE')->first();
    }

    public static function contactoAgencia()
    {
        return self::where('tipo_persona_codigo', 'CONT')->first();
    }

    /**
     * Métodos de negocio
     */
    public function puedeVender()
    {
        return in_array($this->tipo_persona_codigo, ['ADMIN', 'VEND']);
    }

    public function esCliente()
    {
        return $this->tipo_persona_codigo === 'CLIE';
    }

    public function esEmpleado()
    {
        return in_array($this->tipo_persona_codigo, ['ADMIN', 'VEND', 'CHOF']);
    }

    public function esContactoAgencia()
    {
        return $this->tipo_persona_codigo === 'CONT';
    }

    public function getNivel()
    {
        $niveles = [
            'ADMIN' => 5,
            'VEND' => 3,
            'CHOF' => 2,
            'CONT' => 2,
            'CLIE' => 1
        ];

        return $niveles[$this->tipo_persona_codigo] ?? 0;
    }
}
