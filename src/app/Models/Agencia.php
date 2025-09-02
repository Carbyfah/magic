<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agencia extends Model
{
    use SoftDeletes;

    protected $table = 'agencia';
    protected $primaryKey = 'agencia_id';

    protected $fillable = [
        'agencia_codigo',
        'agencia_razon_social',
        'agencia_nit',
        'agencia_email',
        'agencia_telefono',
        'agencia_situacion'
    ];

    protected $casts = [
        'agencia_situacion' => 'boolean',
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
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'agencia_id', 'agencia_id');
    }

    public function contactosAgencia()
    {
        return $this->hasMany(ContactosAgencia::class, 'agencia_id', 'agencia_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('agencia_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('agencia_razon_social', 'like', "%{$termino}%")
            ->orWhere('agencia_codigo', 'like', "%{$termino}%")
            ->orWhere('agencia_email', 'like', "%{$termino}%");
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('agencia_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->agencia_codigo, -3)) + 1 : 1;
        return 'AGE-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->agencia_codigo}: {$this->agencia_razon_social}";
    }

    public function tieneRegistrosAsociados()
    {
        return $this->reservas()->exists() ||
            $this->contactosAgencia()->exists();
    }
}
