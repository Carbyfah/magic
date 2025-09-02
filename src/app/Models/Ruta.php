<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ruta extends Model
{
    use SoftDeletes;

    protected $table = 'ruta';
    protected $primaryKey = 'ruta_id';

    protected $fillable = [
        'ruta_codigo',
        'ruta_ruta',
        'ruta_origen',
        'ruta_destino',
        'ruta_situacion'
    ];

    protected $casts = [
        'ruta_situacion' => 'boolean',
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
    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'ruta_id', 'ruta_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('ruta_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('ruta_ruta', 'like', "%{$termino}%")
            ->orWhere('ruta_origen', 'like', "%{$termino}%")
            ->orWhere('ruta_destino', 'like', "%{$termino}%")
            ->orWhere('ruta_codigo', 'like', "%{$termino}%");
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('ruta_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->ruta_codigo, -3)) + 1 : 1;
        return 'RUT-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->ruta_origen} → {$this->ruta_destino}";
    }

    public function tieneRutasActivadas()
    {
        return $this->rutasActivadas()->where('ruta_activada_situacion', 1)->exists();
    }
}
