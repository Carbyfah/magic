<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rol extends Model
{
    use SoftDeletes;

    protected $table = 'rol';
    protected $primaryKey = 'rol_id';

    protected $fillable = [
        'rol_codigo',
        'rol_rol',
        'rol_descripcion',
        'rol_situacion'
    ];

    protected $casts = [
        'rol_situacion' => 'boolean',
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
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'rol_id', 'rol_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('rol_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('rol_rol', 'like', "%{$termino}%")
            ->orWhere('rol_descripcion', 'like', "%{$termino}%")
            ->orWhere('rol_codigo', 'like', "%{$termino}%");
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('rol_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->rol_codigo, -3)) + 1 : 1;
        return 'ROL-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->rol_rol} - {$this->rol_descripcion}";
    }

    public function tieneUsuarios()
    {
        return $this->usuarios()->where('usuario_situacion', 1)->exists();
    }
}
