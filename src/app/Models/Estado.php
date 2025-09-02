<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estado extends Model
{
    use SoftDeletes;

    protected $table = 'estado';
    protected $primaryKey = 'estado_id';

    protected $fillable = [
        'estado_codigo',
        'estado_estado',
        'estado_descripcion',
        'estado_situacion'
    ];

    protected $casts = [
        'estado_situacion' => 'boolean',
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
        return $this->hasMany(Reserva::class, 'estado_id', 'estado_id');
    }

    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'estado_id', 'estado_id');
    }

    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'estado_id', 'estado_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('estado_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('estado_estado', 'like', "%{$termino}%")
            ->orWhere('estado_codigo', 'like', "%{$termino}%")
            ->orWhere('estado_descripcion', 'like', "%{$termino}%");
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::where('estado_codigo', 'LIKE', 'EST-%')
            ->orderByDesc('estado_codigo')
            ->first();

        $numero = $ultimo ? ((int) substr($ultimo->estado_codigo, 4)) + 1 : 1;
        return 'EST-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->estado_codigo}: {$this->estado_estado}";
    }

    public function tieneRegistrosAsociados()
    {
        return $this->reservas()->exists() ||
            $this->rutasActivadas()->exists() ||
            $this->vehiculos()->exists();
    }
}
